"""Адреса и координаты отделений обменников (для кнопки "Найти рядом").

1. Берет список обменников из data/fx.js (у каждого есть ссылка на ifin.kz).
2. На странице обменника ищет отделения (ссылки .../branch/ID) и их адреса.
3. Адрес превращает в координаты через Nominatim (OpenStreetMap), не чаще 1 запроса в секунду.
4. Хранит кэш в data/geo_cache.json, пишет data/geo.js (window.TM_GEO).
За один запуск обрабатывает не больше MAX_NEW новых адресов, остальное дойдет в следующие запуски.
Ничего не выдумываем: если адрес не нашелся на карте, отделение в список не попадает.
"""
import html, json, re, sys, time
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

sys.path.insert(0, str(Path(__file__).parent))
from common import fetch  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
CACHE = DATA / "geo_cache.json"
OUT = DATA / "geo.js"
MAX_NEW = 40
UA = "tiimdi-sat/1.0 (https://github.com/momQQ/tenge-machine)"
STREET = re.compile(r"(пр\.|просп|ул\.|улица|мкр|микрорайон|бульвар|б-р|пер\.|переулок|шоссе|пл\.|площадь|жк\b|тц\b|трц\b|рынок|базар)", re.I)
ALM = (76.70, 43.45, 77.20, 43.10)  # lon_min, lat_max, lon_max, lat_min (Алматы)


def load_json(p, default):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return default


def read_exchangers():
    s = (DATA / "fx.js").read_text(encoding="utf-8")
    d = json.loads(s[s.index("{"): s.rindex("}") + 1])
    return [e for e in d.get("exchangers", []) if e.get("url") and "/exchanger/" in e["url"]]


def clean(t):
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", html.unescape(t)).strip(" ,;")


def branches_from_html(h):
    """[(branch_id, address)] из страницы обменника."""
    out = {}
    for m in re.finditer(r'(?is)<a[^>]+href="([^"]*?/branch/(\d+))[^"]*"[^>]*>(.*?)</a>', h):
        txt = clean(m.group(3))
        out.setdefault(m.group(2), {"url": m.group(1), "addr": ""})
        if STREET.search(txt) and len(txt) < 120:
            out[m.group(2)]["addr"] = txt
    return out


def address_from_branch_page(h):
    h = re.sub(r"(?is)<(script|style).*?</\1>", " ", h)
    for line in re.split(r"(?i)<br\s*/?>|</(?:p|div|li|h\d|span|td)>", h):
        t = clean(line)
        if STREET.search(t) and 6 <= len(t) <= 120 and not re.search(r"курс|покупка|продажа", t, re.I):
            return t
    return ""


def geocode(addr):
    q = addr if re.search(r"алматы", addr, re.I) else "Алматы, " + addr
    url = ("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=kz&viewbox=%s,%s,%s,%s&bounded=1&q=%s"
           % (ALM[0], ALM[1], ALM[2], ALM[3], quote(q)))
    with urlopen(Request(url, headers={"User-Agent": UA, "Accept-Language": "ru"}), timeout=20) as r:
        res = json.loads(r.read().decode("utf-8"))
    time.sleep(1.1)
    if not res:
        return None
    return round(float(res[0]["lat"]), 5), round(float(res[0]["lon"]), 5)


def main():
    cache = load_json(CACHE, {"branches": {}, "geo": {}})
    new = 0
    for ex in read_exchangers():
        base = ex["url"].split("?")[0]
        try:
            h = fetch(base, tries=2)
        except Exception as e:
            print("   пропуск", ex["name"], e)
            continue
        for bid, b in branches_from_html(h).items():
            key = ex["id"] + ":" + bid
            if key in cache["branches"] and cache["branches"][key].get("addr"):
                continue
            addr = b["addr"]
            if not addr and new < MAX_NEW:
                try:
                    u = b["url"] if b["url"].startswith("http") else "https://m.ifin.kz" + b["url"]
                    addr = address_from_branch_page(fetch(u, tries=1))
                except Exception as e:
                    print("   нет страницы отделения", key, e)
            cache["branches"][key] = {"ex": ex["id"], "name": ex["name"], "addr": addr}
    for key, b in cache["branches"].items():
        a = b.get("addr")
        if not a or a in cache["geo"] or new >= MAX_NEW:
            continue
        try:
            cache["geo"][a] = geocode(a)
        except Exception as e:
            print("   геокодер не ответил:", e)
            break
        new += 1
        print("   ", a, "->", cache["geo"][a])
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=0), encoding="utf-8")
    pts = []
    for key, b in cache["branches"].items():
        g = cache["geo"].get(b.get("addr") or "")
        if g:
            pts.append({"id": key, "ex": b["ex"], "name": b["name"], "addr": b["addr"], "ll": g})
    OUT.write_text("window.TM_GEO=" + json.dumps({"points": pts}, ensure_ascii=False) + ";\n", encoding="utf-8")
    print("отделений с координатами:", len(pts), "новых геокодов:", new)


if __name__ == "__main__":
    main()
