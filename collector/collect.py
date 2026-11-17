#!/usr/bin/env python3
"""
Ежедневный сборщик цен.

Что делает:
  1. Открывает страницы товаров из collector/products.json.
  2. Достает цену в тенге.
  3. Дописывает строку в data/prices.csv (одна строка на дату, модель и магазин).
  4. Пересобирает data/data.js, который читает страница index.html.

Запуск:            python collector/collect.py
Проверка парсера:  python collector/collect.py --parse файл.html ispace
                   (файл страницы можно сохранить из браузера: Ctrl+S)

Только стандартная библиотека Python, ничего устанавливать не нужно.
"""
import csv
import datetime as dt
import json
import re
import statistics
import sys
import time
from collections import Counter
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
PRODUCTS = ROOT / "collector" / "products.json"
PRICES_CSV = DATA / "prices.csv"
RATES_CSV = DATA / "rates.csv"
RATES_DAILY_CSV = DATA / "rates_daily.csv"
EVENTS_JSON = DATA / "events.json"          # календарь распродаж и заметки для блока "Когда цена может снизиться"
IMAGES_JSON = DATA / "images.json"          # ссылки на фото моделей со страниц магазинов
REJECTED_CSV = DATA / "rejected.csv"        # сюда попадают отсеченные подозрительные цены
NBK_URL = "https://nationalbank.kz/rss/get_rates.cfm?fdate={d}"   # официальный курс Нацбанка РК на дату ДД.ММ.ГГГГ
RATE_BACKFILL_DAYS = 45
STATUS_JSON = DATA / "status.json"        # состояние каждой пары модель+магазин: ok, site_down, no_data, rejected
DATA_JS = DATA / "data.js"
KASPI_MAX_SELLERS = 5                       # с Kaspi берем не больше 5 продавцов (самые дешевые)

USER_AGENT = "Mozilla/5.0 (compatible; tenge-machine-price-tracker; personal project)"
PRICE_MIN, PRICE_MAX = 100_000, 3_000_000   # цена вне этих границ считается ошибкой чтения
LOW_K, HIGH_K = 0.6, 1.5                    # цена ниже 60% или выше 150% медианы по модели считается ошибкой
MAX_JUMP = 0.35                             # скачок цены больше 35% за раз считаем подозрительным


# ---------- загрузка страницы ----------

class FetchError(RuntimeError):
    """Не удалось загрузить страницу. code: HTTP-код или None (сеть, таймаут)."""
    def __init__(self, msg, code=None):
        super().__init__(msg)
        self.code = code


def fetch(url, tries=2, timeout=20):
    """Скачивает страницу. Ошибки 4xx (кроме 429) не повторяем: повтор ничего не изменит."""
    last = None
    for i in range(tries):
        try:
            req = Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "ru-RU,ru;q=0.9"})
            with urlopen(req, timeout=timeout) as r:
                raw = r.read()
                enc = r.headers.get_content_charset() or "utf-8"
                return raw.decode(enc, errors="replace")
        except HTTPError as e:
            last = e
            if 400 <= e.code < 500 and e.code != 429:
                break
            time.sleep(2 * (i + 1))
        except (URLError, TimeoutError, OSError) as e:
            last = e
            time.sleep(2 * (i + 1))
    raise FetchError(f"не удалось загрузить {url}: {last}", getattr(last, "code", None))


# ---------- разбор цены ----------

def normalize(html):
    return (html.replace("&nbsp;", " ").replace(" ", " ").replace(" ", " ")
                .replace("&#8376;", "₸").replace("&#x20B8;", "₸"))


def to_int(text):
    return int(re.sub(r"\D", "", text))


def in_range(v):
    return PRICE_MIN <= v <= PRICE_MAX


def structured_price(html):
    """Цена из разметки (JSON-LD, itemprop, meta). Возвращает число или None."""
    patterns = [
        r'"price"\s*:\s*"?(\d{5,7})(?:\.\d+)?"?',
        r'itemprop="price"[^>]*content="(\d{5,7})(?:\.\d+)?"',
        r'content="(\d{5,7})(?:\.\d+)?"[^>]*itemprop="price"',
        r'product:price:amount"\s+content="(\d{5,7})(?:\.\d+)?"',
    ]
    for p in patterns:
        for m in re.finditer(p, html):
            v = int(m.group(1))
            if in_range(v):
                return v
    return None


def visible_candidates(html):
    """Все числа вида '849 990 ₸' на странице, подходящие по размеру."""
    out = []
    for m in re.finditer(r"(\d{1,3}(?:\s\d{3})+|\d{5,7})\s*(?:₸|тг\b|тенге)", html):
        v = to_int(m.group(1))
        if in_range(v):
            out.append(v)
    return out


def parse_ispace(html):
    """iSpace: цена есть в заголовке страницы ('... по цене 849990 ₸')."""
    html = normalize(html)
    m = re.search(r"по цене\s*(\d[\d\s]*?)\s*₸", html)
    if m and in_range(to_int(m.group(1))):
        return to_int(m.group(1)), "заголовок страницы"
    return parse_generic(html)


def parse_sulpak(html):
    """Sulpak: сначала разметка, потом самое частое число рядом с символом ₸."""
    return parse_generic(normalize(html))


def parse_generic(html):
    sp = structured_price(html)
    if sp:
        return sp, "разметка страницы"
    cands = visible_candidates(html)
    if cands:
        top = Counter(cands).most_common(3)
        print(f"    кандидаты (цена: сколько раз): {top}")
        return top[0][0], "самое частое число рядом с ₸"
    return None, None


def parse_technodom(html):
    return parse_generic(normalize(html))


def parse_kaspi(html):
    """Kaspi: цена в метке product:price:amount (это самая низкая цена среди продавцов)."""
    return parse_generic(normalize(html))


def kaspi_sellers(url, limit=KASPI_MAX_SELLERS):
    """До 5 самых дешевых продавцов Kaspi: [(имя, цена)]. Список продавцов в обычной странице не лежит,
    его отдает служебный адрес Kaspi. Формат ответа не проверен, поэтому разбор осторожный;
    при любой ошибке возвращаем пустой список, и остается общая цена со страницы."""
    m = re.search(r"-(\d{6,})/?(?:\?|$)", url)
    if not m:
        return []
    try:
        body = json.dumps({"cityId": "750000000", "limit": 64, "page": 0, "sort": True}).encode()
        req = Request(f"https://kaspi.kz/yml/offer-view/offers/{m.group(1)}", data=body, method="POST",
                      headers={"User-Agent": USER_AGENT, "Content-Type": "application/json; charset=UTF-8",
                               "Accept": "application/json", "Referer": url})
        with urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode("utf-8", errors="replace"))
    except Exception as e:
        print(f"    продавцы Kaspi недоступны: {e}")
        return []
    offers = data.get("offers") if isinstance(data, dict) else None
    out, seen = [], set()
    for o in offers or []:
        name = str(o.get("merchantName") or o.get("merchant") or "").strip()[:40]
        try:
            price = int(float(o.get("price")))
        except (TypeError, ValueError):
            continue
        if name and name not in seen and in_range(price):
            seen.add(name)
            out.append((name, price))
    out.sort(key=lambda x: x[1])
    return out[:limit]


def detect_availability(html):
    """True: в наличии, False: нет в наличии, None: страница не говорит. Только по явным меткам."""
    if re.search(r'availability"\s*:\s*"[^"]*(OutOfStock|SoldOut|Discontinued)', html, re.I) \
            or re.search(r'product:availability"?\s+content="(out of stock|oos|outofstock)', html, re.I) \
            or re.search(r"нет в наличии|товар закончился|нет в продаже|временно отсутствует", html, re.I):
        return False
    if re.search(r'availability"\s*:\s*"[^"]*InStock', html, re.I) \
            or re.search(r'product:availability"?\s+content="(in stock|instock)', html, re.I):
        return True
    return None


def memory_tokens(text):
    """Объем памяти из названия: '12/256GB' -> {256}, '1 ТБ' -> {1024}."""
    out = set()
    for n, unit in re.findall(r"(\d{1,4})\s*(gb|гб|tb|тб)\b", (text or "").lower()):
        out.add(int(n) * (1024 if unit in ("tb", "тб") else 1))
    return out


def check_page(fam_name, all_names, memory, title):
    """Страница именно того товара? Возвращает причину отказа или None."""
    if not title:
        return None                      # названия нет: проверить нечем, полагаемся на цену
    if not model_matches(fam_name, all_names, title):
        return f"на странице другой товар: {title!r}"
    want, have = memory_tokens(memory), memory_tokens(title)
    if want and have and not (want & have):
        return f"другой объем памяти: на странице {sorted(have)}, ждали {sorted(want)}"
    return None


PARSERS = {"ispace": parse_ispace, "sulpak": parse_sulpak, "technodom": parse_technodom,
           "kaspi": parse_kaspi, "generic": parse_generic}


# ---------- хранение ----------

def read_prices():
    if not PRICES_CSV.exists():
        return []
    with open(PRICES_CSV, encoding="utf-8", newline="") as f:
        return [r for r in csv.DictReader(f)]


def write_prices(rows):
    rows = sorted(rows, key=lambda r: (r["date"], r["model_id"], r["store"]))
    with open(PRICES_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["date", "model_id", "store", "price_kzt"])
        w.writeheader()
        w.writerows(rows)


def last_price(rows, model_id, store, before_date):
    older = [r for r in rows if r["model_id"] == model_id and r["store"] == store and r["date"] < before_date]
    return int(float(older[-1]["price_kzt"])) if older else None


def read_usd_rates():
    out = []
    if RATES_CSV.exists():
        with open(RATES_CSV, encoding="utf-8", newline="") as f:
            for r in csv.DictReader(f):
                if r["currency"] == "USD":
                    out.append([r["month"], float(r["kzt_avg"])])
    return sorted(out)



# ---------- фото модели со страницы магазина ----------

def extract_image(html):
    """Ссылка на главное фото товара (метка og:image). Только https."""
    for pat in (r'<meta[^>]+property=["\']og:image["\'][^>]*content=["\']([^"\']+)',
                r'<meta[^>]+content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']'):
        m = re.search(pat, html, re.I)
        if m and m.group(1).startswith("https://"):
            return m.group(1).replace("&amp;", "&")
    return None


def extract_title(html):
    """Название товара со страницы (og:title или title), без хвоста 'купить ...'."""
    m = re.search(r'<meta[^>]+property=["\']og:title["\'][^>]*content=["\']([^"\']+)', html, re.I) \
        or re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    if not m:
        return None
    t = re.sub(r"\s+", " ", m.group(1)).strip().replace("&amp;", "&")
    return re.split(r"\s+(?:купить|по цене)\b", t, flags=re.I)[0].strip(" ,-")[:120] or None


def model_matches(fam_name, all_names, title):
    """Фото принимаем, только если в названии страницы есть имя семейства и нет более длинного
    имени (например, для 'iPhone 18 Pro' страница 'iPhone 18 Pro Max' не подходит)."""
    t = (title or "").lower()
    me = fam_name.lower()
    if me not in t:
        return False
    return not any(n.lower() != me and n.lower().startswith(me) and n.lower() in t for n in all_names)


def read_events():
    """Календарь распродаж и новостей: правится вручную или по расписанию, код менять не нужно."""
    if EVENTS_JSON.exists():
        try:
            return json.loads(EVENTS_JSON.read_text(encoding="utf-8"))
        except ValueError:
            print("events.json поврежден, календарь не обновлен")
    return []

def read_images():
    if IMAGES_JSON.exists():
        try:
            return json.loads(IMAGES_JSON.read_text(encoding="utf-8"))
        except ValueError:
            pass
    return {}


# ---------- состояние страниц ----------

def read_status():
    if STATUS_JSON.exists():
        try:
            return json.loads(STATUS_JSON.read_text(encoding="utf-8"))
        except ValueError:
            pass
    return {}


def set_status(status, model_id, store, state, today, note="", price=None, avail=None):
    """Состояния: ok, site_down (сайт не ответил), no_data (на сайте нет цены или другой товар),
    rejected (цена на проверке). Прошлая цена и дата последней удачи не стираются."""
    key = f"{model_id}|{store}"
    old = status.get(key, {})
    rec = {"state": state, "checked": today, "note": note[:160],
           "last_ok": today if state == "ok" else old.get("last_ok"),
           "price": price if state == "ok" else old.get("price"),
           "avail": avail if state == "ok" else old.get("avail")}
    status[key] = rec


# ---------- проверка цены на здравый смысл ----------

def check_price(rows, model_id, store, price, today, seen):
    """Возвращает причину отказа или None, если цена выглядит правдоподобно.
    1) скачок к собственной вчерашней цене больше MAX_JUMP;
    2) цена сильно ниже/выше медианы по этой модели (все магазины за 30 дней, сегодняшние и официальная цена старта)."""
    prev = last_price(rows, model_id, store, today)
    if prev and abs(price / prev - 1) > MAX_JUMP:
        return f"скачок {prev} -> {price}"
    cutoff = (dt.date.fromisoformat(today) - dt.timedelta(days=30)).isoformat()
    official = [int(float(r["price_kzt"])) for r in rows
                if r["model_id"] == model_id and r["store"].startswith("Официальная") and r["date"] < today]
    ref = [int(float(r["price_kzt"])) for r in rows
           if r["model_id"] == model_id and cutoff <= r["date"] < today
           and not r["store"].startswith("Официальная")] + official + seen.get(model_id, [])
    if len(ref) >= 3 or official:   # официальная цена старта служит опорой даже в первые дни
        med = statistics.median(ref)
        if price < med * LOW_K:
            return f"слишком низкая цена {price}, медиана по модели {med:.0f}"
        if price > med * HIGH_K:
            return f"слишком высокая цена {price}, медиана по модели {med:.0f}"
    return None


def log_rejected(today, model_id, store, price, reason):
    new = not REJECTED_CSV.exists()
    with open(REJECTED_CSV, "a", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["date", "model_id", "store", "price_kzt", "reason"])
        w.writerow([today, model_id, store, price, reason])


# ---------- курс доллара (Нацбанк РК) ----------

def parse_nbk_usd(xml):
    """Достает курс USD из XML Нацбанка. Возвращает число тенге за 1 доллар или None."""
    for m in re.finditer(r"<item>(.*?)</item>", xml, re.S | re.I):
        block = m.group(1)
        if not re.search(r"<title>\s*USD\s*</title>", block, re.I):
            continue
        d = re.search(r"<description>\s*([\d.,]+)\s*</description>", block, re.I)
        q = re.search(r"<quant>\s*(\d+)\s*</quant>", block, re.I)
        if not d:
            continue
        rate = float(d.group(1).replace(",", ".")) / (int(q.group(1)) if q else 1)
        if 200 <= rate <= 2000:
            return round(rate, 4)
    return None


def read_daily_rates():
    out = {}
    if RATES_DAILY_CSV.exists():
        with open(RATES_DAILY_CSV, encoding="utf-8", newline="") as f:
            for r in csv.DictReader(f):
                out[r["date"]] = float(r["kzt"])
    return out


def write_daily_rates(daily):
    with open(RATES_DAILY_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["date", "currency", "kzt"])
        for d in sorted(daily):
            w.writerow([d, "USD", daily[d]])


def update_daily_rates(today):
    """Докачивает недостающие дни за последние RATE_BACKFILL_DAYS дней (включая сегодня)."""
    daily = read_daily_rates()
    day0 = dt.date.fromisoformat(today)
    added = failed = streak = 0
    for back in range(RATE_BACKFILL_DAYS, -1, -1):
        d = day0 - dt.timedelta(days=back)
        key = d.isoformat()
        if key in daily and key != today:
            continue
        try:
            xml = fetch(NBK_URL.format(d=d.strftime("%d.%m.%Y")), tries=2)
            rate = parse_nbk_usd(xml)
            if rate is None:
                raise RuntimeError("в ответе Нацбанка нет курса USD")
            daily[key] = rate
            added += 1
            streak = 0
        except Exception as e:
            failed += 1
            streak += 1
            if key == today or failed <= 2:
                print(f"    курс на {key}: ОШИБКА: {e}")
            if streak >= 3:
                print("    Нацбанк не отвечает, остальные дни пропускаем до следующего запуска")
                break
        time.sleep(0.3)
    write_daily_rates(daily)
    print(f"Курс доллара: добавлено {added}, ошибок {failed}, всего дней {len(daily)}"
          + (f", сегодня {daily[today]} ₸" if today in daily else ", на сегодня курса нет"))
    return daily


def build_data_js(config, rows, today):
    families = []
    for fam in config["families"]:
        families.append({
            "id": fam["id"],
            "category": fam["category"],
            "brand": fam.get("brand", "apple"),
            "specs": fam.get("specs"),          # характеристики для сравнения (необязательно)
            "rating": fam.get("rating"),        # рейтинг в магазинах: {"v":4.9,"n":128,"src":"Kaspi"}
            "name": fam["name"],
            "status": fam.get("status", "on_sale"),
            "group": fam.get("group", "current"),
            "note": fam.get("note", ""),
            "events": fam.get("events", []),
            "variants": [{"id": v["id"], "memory": v["memory"],
                          "stores": [dict({"store": st["store"], "url": st["url"]}, **({"inst": st["inst"]} if "inst" in st else {})) for st in v.get("stores", [])]}
                         for v in fam.get("variants", [])],
        })
    prices = [[r["date"], r["model_id"], r["store"], int(float(r["price_kzt"]))]
              for r in sorted(rows, key=lambda r: (r["date"], r["store"]))]
    daily = read_daily_rates()
    monthly = dict(read_usd_rates())
    by_month = {}
    for d, v in daily.items():
        by_month.setdefault(d[:7], []).append(v)
    for m, vals in by_month.items():          # месяцы без официального среднего считаем по дням
        monthly.setdefault(m, round(sum(vals) / len(vals), 2))
    payload = {"updated": today, "categories": config["categories"], "families": families,
               "prices": prices, "rates": sorted(monthly.items()), "images": read_images(), "calendar": read_events(),
               "daily": sorted(daily.items()), "stores": config.get("stores", {}), "status": read_status()}
    DATA_JS.write_text("// Файл создается автоматически скриптом collect.py, руками не править.\n"
                       "window.TM = " + json.dumps(payload, ensure_ascii=False) + ";\n", encoding="utf-8")


# ---------- основной запуск ----------

def tg_send(text):
    """Сообщение в Telegram. Работает, только если заданы секреты TG_TOKEN и TG_CHAT; иначе молча пропускает."""
    import os
    from urllib.parse import urlencode
    token, chat = os.environ.get("TG_TOKEN"), os.environ.get("TG_CHAT")
    if not token or not chat:
        return False
    try:
        body = urlencode({"chat_id": chat, "text": text, "disable_web_page_preview": "true"}).encode()
        urlopen(Request(f"https://api.telegram.org/bot{token}/sendMessage", data=body), timeout=20).read()
        return True
    except Exception as e:
        print(f"Telegram не отправлен: {e}")
        return False


DROP_ALERT = 0.03    # падение цены от 3% относительно прошлой записи = уведомление


def today_almaty():
    return dt.datetime.now(dt.timezone(dt.timedelta(hours=5))).date().isoformat()


def iter_targets(config):
    """Все пары (вариант товара, магазин), которые нужно опросить."""
    for fam in config["families"]:
        for var in fam.get("variants", []):
            for st in var.get("stores", []):
                yield fam, var, st


def main():
    config = json.loads(PRODUCTS.read_text(encoding="utf-8"))
    today = today_almaty()
    rows = read_prices()
    status = read_status()
    ok = fail = 0
    seen = {}   # цены, принятые сегодня, по моделям
    images = read_images()
    names = [f["name"] for f in config["families"]]
    img_done = set()
    per_store = {}   # магазин -> [опрошено, сайт не ответил]
    try:
        update_daily_rates(today)
    except Exception as e:   # курс не должен ломать сбор цен
        print(f"Курс доллара не обновлен: {e}")

    drops = []   # (модель, магазин, было, стало)

    def put(model_id, store, price):
        nonlocal rows
        prev = last_price(rows, model_id, store, today)
        if prev and price <= prev * (1 - DROP_ALERT) and " · " not in store:
            drops.append((model_id, store, prev, price))
        rows = [r for r in rows if not (r["date"] == today and r["model_id"] == model_id and r["store"] == store)]
        rows.append({"date": today, "model_id": model_id, "store": store, "price_kzt": str(price)})

    for fam, model, st in iter_targets(config):
        store = st["store"]
        print(f'- {fam["name"]} {model["memory"]} / {store}')
        c = per_store.setdefault(store, [0, 0])
        c[0] += 1
        if st.get("parser") == "none" or not st.get("url"):
            set_status(status, model["id"], store, "no_data", today, "ссылка на карточку не указана")
            print("    пропуск: нет ссылки на карточку товара")
            continue
        try:
            html = fetch(st["url"])
        except FetchError as e:
            # сайт упал или закрыт: прошлые цены остаются как есть, в историю ничего не пишем
            gone = e.code in (404, 410)
            set_status(status, model["id"], store, "no_data" if gone else "site_down", today,
                       "страница товара удалена" if gone else "сайт не ответил")
            if not gone:
                c[1] += 1
            print(f"    {'НЕТ СТРАНИЦЫ' if gone else 'САЙТ НЕ ОТВЕТИЛ'}: {e}")
            fail += 1
            time.sleep(1)
            continue
        try:
            title = extract_title(html)
            bad = check_page(fam["name"], names, model["memory"], title)
            if bad:
                if last_price(rows, model["id"], store, today) is None:
                    raise ValueError("NODATA:" + bad)       # новая пара: строгая проверка, чужую страницу не берем
                print(f"    ПРЕДУПРЕЖДЕНИЕ (цена принимается, у пары уже есть история): {bad}")
            price, how = PARSERS[st.get("parser", "generic")](html)
            if price is None:
                raise ValueError("NODATA:цена на странице не найдена")
            avail = detect_availability(html)
            why = check_price(rows, model["id"], store, price, today, seen)
            if why:
                log_rejected(today, model["id"], store, price, why)
                set_status(status, model["id"], store, "rejected", today, why)
                print(f"    ОТСЕЧЕНО, строка не записана: {why}")
                fail += 1
                time.sleep(1)
                continue
            seen.setdefault(model["id"], []).append(price)
            if fam["id"] not in img_done:           # фото берем с первой успешно прочитанной страницы семейства
                img = extract_image(html)
                if img and model_matches(fam["name"], names, title):
                    images[fam["id"]] = {"url": img, "title": title, "page": st["url"]}
                    img_done.add(fam["id"])
                elif img:
                    print(f"    фото не принято: страница называется {title!r}, ждали {fam['name']}")
            sellers = kaspi_sellers(st["url"]) if st.get("parser") == "kaspi" else []
            if sellers:                              # Kaspi: до 5 продавцов, у каждого своя строка
                for name, p in sellers:
                    sname = f"{store} · {name}"
                    if not check_price(rows, model["id"], sname, p, today, seen):
                        put(model["id"], sname, p)
                set_status(status, model["id"], store, "ok", today, f"продавцов: {len(sellers)}", sellers[0][1], avail)
                print(f"    OK: Kaspi, продавцов {len(sellers)}, от {sellers[0][1]} ₸")
            else:
                put(model["id"], store, price)
                set_status(status, model["id"], store, "ok", today, how, price, avail)
                print(f"    OK: {price} ₸ ({how})" + ("" if avail is None else (", в наличии" if avail else ", НЕТ В НАЛИЧИИ")))
            ok += 1
        except ValueError as e:
            msg = str(e)
            if msg.startswith("NODATA:"):
                set_status(status, model["id"], store, "no_data", today, msg[7:])
                print(f"    НЕТ ДАННЫХ: {msg[7:]}")
                fail += 1
            else:
                set_status(status, model["id"], store, "no_data", today, msg)
                print(f"    ОШИБКА: {msg}")
                fail += 1
        except Exception as e:  # один магазин не должен ломать остальные
            set_status(status, model["id"], store, "no_data", today, f"ошибка разбора: {e}")
            print(f"    ОШИБКА: {e}")
            fail += 1
        time.sleep(1)   # не торопимся: один запрос в секунду

    for store, (n, down) in per_store.items():
        if n >= 2 and down == n:
            print(f"ВНИМАНИЕ: сайт {store} не ответил ни разу ({n} из {n}). Оставлены прошлые цены.")
    STATUS_JSON.write_text(json.dumps(status, ensure_ascii=False, indent=1), encoding="utf-8")
    IMAGES_JSON.write_text(json.dumps(images, ensure_ascii=False, indent=1), encoding="utf-8")
    write_prices(rows)
    build_data_js(config, rows, today)
    print(f"Готово: успешно {ok}, с ошибкой {fail}. Дата: {today}")
    names_by_id = {v["id"]: f'{f["name"]} {v["memory"]}' for f in config["families"] for v in f.get("variants", [])}
    for mid, store, was, now in drops:
        pct = round((1 - now / was) * 100)
        tg_send(f"Цена упала: {names_by_id.get(mid, mid)}\n{store}: {was:,} -> {now:,} тг (-{pct}%)".replace(",", " "))
    dead = [s for s, (n, down) in per_store.items() if n >= 2 and down == n]
    if dead or (ok == 0 and fail > 0):
        tg_send(f"Сбор цен {today}: проблема. Успешно {ok}, ошибок {fail}. Сайты без ответа: {', '.join(dead) or 'нет'}")
    if ok == 0 and fail > 0:
        sys.exit(1)   # все магазины не ответили: пусть запуск покажет красный крестик


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "--parse":
        text = Path(sys.argv[2]).read_text(encoding="utf-8", errors="replace")
        parser = PARSERS[sys.argv[3] if len(sys.argv) > 3 else "generic"]
        print(parser(text))
    else:
        main()
