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
DATA_JS = DATA / "data.js"

USER_AGENT = "Mozilla/5.0 (compatible; tenge-machine-price-tracker; personal project)"
PRICE_MIN, PRICE_MAX = 100_000, 3_000_000   # цена вне этих границ считается ошибкой чтения
MAX_JUMP = 0.35                             # скачок цены больше 35% за раз считаем подозрительным


# ---------- загрузка страницы ----------

def fetch(url, tries=3):
    last = None
    for i in range(tries):
        try:
            req = Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "ru-RU,ru;q=0.9"})
            with urlopen(req, timeout=30) as r:
                raw = r.read()
                enc = r.headers.get_content_charset() or "utf-8"
                return raw.decode(enc, errors="replace")
        except (URLError, HTTPError, TimeoutError, OSError) as e:
            last = e
            time.sleep(3 * (i + 1))
    raise RuntimeError(f"не удалось загрузить {url}: {last}")


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


PARSERS = {"ispace": parse_ispace, "sulpak": parse_sulpak, "generic": parse_generic}


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


def build_data_js(config, rows, today):
    families = []
    for fam in config["families"]:
        families.append({
            "id": fam["id"],
            "category": fam["category"],
            "name": fam["name"],
            "status": fam.get("status", "on_sale"),
            "group": fam.get("group", "current"),
            "note": fam.get("note", ""),
            "events": fam.get("events", []),
            "variants": [{"id": v["id"], "memory": v["memory"]} for v in fam.get("variants", [])],
        })
    prices = [[r["date"], r["model_id"], r["store"], int(float(r["price_kzt"]))]
              for r in sorted(rows, key=lambda r: (r["date"], r["store"]))]
    payload = {"updated": today, "categories": config["categories"], "families": families,
               "prices": prices, "rates": read_usd_rates()}
    DATA_JS.write_text("// Файл создается автоматически скриптом collect.py, руками не править.\n"
                       "window.TM = " + json.dumps(payload, ensure_ascii=False) + ";\n", encoding="utf-8")


# ---------- основной запуск ----------

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
    ok = fail = 0

    for fam, model, st in iter_targets(config):
        print(f'- {fam["name"]} {model["memory"]} / {st["store"]}')
        try:
            html = fetch(st["url"])
            price, how = PARSERS[st.get("parser", "generic")](html)
            if price is None:
                raise RuntimeError("цена на странице не найдена")
            prev = last_price(rows, model["id"], st["store"], today)
            if prev and abs(price / prev - 1) > MAX_JUMP:
                raise RuntimeError(f"подозрительный скачок {prev} -> {price}, строка не записана")
            rows = [r for r in rows if not (r["date"] == today and r["model_id"] == model["id"]
                                             and r["store"] == st["store"])]
            rows.append({"date": today, "model_id": model["id"], "store": st["store"], "price_kzt": str(price)})
            print(f"    OK: {price} ₸ ({how})")
            ok += 1
        except Exception as e:  # один магазин не должен ломать остальные
            print(f"    ОШИБКА: {e}")
            fail += 1
        time.sleep(1)   # не торопимся: один запрос в секунду

    write_prices(rows)
    build_data_js(config, rows, today)
    print(f"Готово: успешно {ok}, с ошибкой {fail}. Дата: {today}")
    if ok == 0 and fail > 0:
        sys.exit(1)   # все магазины не ответили: пусть запуск покажет красный крестик


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "--parse":
        text = Path(sys.argv[2]).read_text(encoding="utf-8", errors="replace")
        parser = PARSERS[sys.argv[3] if len(sys.argv) > 3 else "generic"]
        print(parser(text))
    else:
        main()
