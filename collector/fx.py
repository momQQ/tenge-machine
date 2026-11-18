"""Курсы валют и золото: Нацбанк (официальные) и Банк ЦентрКредит (наличные, приложение, FX-обменник).

Пишет data/fx.js (window.TM_FX) и копит историю в data/fx_nbk.csv.
Если источник не ответил или разметка изменилась, прошлые данные остаются, а в Telegram уходит предупреждение.
Серебро: берется со страницы ЦентрКредит (приложение и FX-обменник), история копится с первого запуска.
"""
import csv, datetime as dt, html, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import fetch, tg_send, NBK_URL  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
FX_JS = DATA / "fx.js"
FX_CSV = DATA / "fx_nbk.csv"
BCC_RATES = "https://www.bcc.kz/personal/currency-rates/"
BCC_GOLD = "https://www.bcc.kz/personal/savings/gold-operations/"
NBK_GOLD = "https://nationalbank.kz/ru/gold/zoloto"
CUR = ["USD", "EUR", "RUB", "CNY", "GBP"]
RANGE = {"USD": (300, 800), "EUR": (350, 900), "RUB": (2, 15), "CNY": (40, 110), "GBP": (400, 1000), "XAU": (20000, 150000), "XAG": (150, 4000)}
BACKFILL = 120         # сколько недостающих дней Нацбанка докачивать за один запуск
KEEP = 400             # сколько дней истории отдавать сайту


def log(*a):
    print("   ", *a)


def to_text(h):
    h = re.sub(r"(?is)<(script|style).*?</\1>", " ", h)
    h = re.sub(r"(?s)<[^>]+>", "\n", h)
    h = html.unescape(h).replace(" ", " ")
    return re.sub(r"[ \t]*\n[ \t\n]*", "\n", h)


NUM = re.compile(r"\d{1,3}(?: \d{3})+[.,]\d{2}|\d+[.,]\d{2}")


def numbers(s):
    return [float(x.replace(" ", "").replace(",", ".")) for x in NUM.findall(s)]


# ---------- Нацбанк ----------

def read_csv():
    out = {}
    if FX_CSV.exists():
        with open(FX_CSV, encoding="utf-8", newline="") as f:
            for r in csv.DictReader(f):
                out.setdefault(r["currency"], {})[r["date"]] = float(r["kzt"])
    return out


def write_csv(hist):
    with open(FX_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["date", "currency", "kzt"])
        for c in sorted(hist):
            for d in sorted(hist[c]):
                w.writerow([d, c, hist[c][d]])


def parse_nbk_all(xml):
    out = {}
    for m in re.finditer(r"<item>(.*?)</item>", xml, re.S | re.I):
        b = m.group(1)
        t = re.search(r"<title>\s*([A-Z]{3})\s*</title>", b, re.I)
        d = re.search(r"<description>\s*([\d.,]+)\s*</description>", b, re.I)
        q = re.search(r"<quant>\s*(\d+)\s*</quant>", b, re.I)
        if not (t and d) or t.group(1).upper() not in CUR:
            continue
        v = float(d.group(1).replace(",", ".")) / (int(q.group(1)) if q else 1)
        lo, hi = RANGE[t.group(1).upper()]
        if lo <= v <= hi:
            out[t.group(1).upper()] = round(v, 4)
    return out


def update_nbk(hist, today):
    added = failed = 0
    day0 = dt.date.fromisoformat(today)
    for back in range(KEEP, -1, -1):
        d = day0 - dt.timedelta(days=back)
        key = d.isoformat()
        if all(key in hist.get(c, {}) for c in CUR) and key != today:
            continue
        if added >= BACKFILL and key != today:
            continue
        try:
            got = parse_nbk_all(fetch(NBK_URL.format(d=d.strftime("%d.%m.%Y")), tries=2))
            if not got:
                raise RuntimeError("пустой ответ Нацбанка")
            for c, v in got.items():
                hist.setdefault(c, {})[key] = v
            added += 1
        except Exception as e:
            failed += 1
            if key == today or failed <= 2:
                log(f"курс Нацбанка на {key}: ОШИБКА: {e}")
            if failed >= 5:
                break
    log(f"Нацбанк: добавлено дней {added}, ошибок {failed}")


GOLD_ROW = re.compile(r"(20\d\d-\d\d-\d\d)\D{1,40}?(\d{1,3}(?: \d{3})*[.,]\d{2}|\d+[.,]\d{2})")


def update_gold(hist):
    """Цена 1 г золота в тенге по данным Нацбанка. Берем первую страницу и пробуем еще несколько."""
    got = 0
    for page in range(1, 6):
        url = NBK_GOLD if page == 1 else f"{NBK_GOLD}?page={page}"
        try:
            text = to_text(fetch(url, tries=2))
        except Exception as e:
            log(f"золото Нацбанка, страница {page}: {e}")
            break
        rows = [(d, float(v.replace(" ", "").replace(",", "."))) for d, v in GOLD_ROW.findall(text)]
        rows = [(d, v) for d, v in rows if RANGE["XAU"][0] <= v <= RANGE["XAU"][1]]
        new = [(d, v) for d, v in rows if d not in hist.setdefault("XAU", {})]
        for d, v in rows:
            hist["XAU"][d] = v
        got += len(new)
        if not new:
            break
    log(f"золото Нацбанка: новых дней {got}")


# ---------- ЦентрКредит ----------

CODES = {"USD": r"USD", "EUR": r"EUR", "RUB": r"RUB", "GBP": r"GBP", "CNY": r"CNY", "XAU": r"XAU|Золото", "XAG": r"XAG|Серебро"}


def parse_bcc(text, ref):
    """Для каждой валюты: пары (продать, купить) подряд после кода. Раскладка по числу пар:
    5 пар: наличные до 10 000, наличные от 10 000, приложение, FX-обменник, безналичные;
    4 пары: наличные, приложение, FX-обменник, безналичные; 3 пары: наличные, приложение, FX-обменник."""
    marks = []
    for c, pat in CODES.items():
        for m in re.finditer(pat, text):
            marks.append((m.start(), c))
    marks.sort()
    out = {}
    for i, (pos, c) in enumerate(marks):
        if c in out:
            continue
        end = pos + 900
        for p2, c2 in marks[i + 1:]:
            if c2 != c:
                end = min(end, p2)
                break
        nums = numbers(text[pos:end])
        pairs = [(nums[k], nums[k + 1]) for k in range(0, len(nums) - 1, 2)]
        if len(pairs) < (2 if c == "XAG" else 3):
            continue
        lo, hi = RANGE[c]
        r = ref.get(c)
        ok = all(lo <= x <= hi for p in pairs[:3] for x in p)
        if ok and r:
            tol = 0.15 if c == "XAU" else 0.25
            ok = all(abs(x / r - 1) <= tol for p in pairs[:3] for x in p)
        if not ok:
            continue
        n = len(pairs)
        if c == "XAG" and n == 2:
            out[c] = [None] + [tuple(sorted(p)) for p in pairs]          # у серебра нет наличных в отделении
        else:
            idx = [0, 2, 3] if (n >= 5 and c not in ("XAU", "XAG")) else [0, 1, 2]
            out[c] = [tuple(sorted(pairs[k])) for k in idx]  # (банк покупает у вас, банк продает вам)
    return out


# ---------- ifin.kz: все обменники и банки Алматы ----------

IFIN = "https://m.ifin.kz"
CITY_SLUG = "almaty"
BANK_RE = re.compile(r"банк|bank|kaspi|halyk|jusan|jysan|bereke|forte|freedom|центркредит|centercredit|alatau city|евразийск|eurasian|народный", re.I)
SKIP = re.compile(r"^(обменный пункт|покупка|продажа|курс|валюта|организация|вес|обновлено|банк|обменник)$", re.I)
TS = re.compile(r"(\d\d)\.(\d\d)\.(\d{4})\s+(\d\d:\d\d)")
PRICE = re.compile(r"^\d{1,4}[.,]\d{1,2}$")
GOLDN = re.compile(r"^\d{1,3}(?: \d{3})+$|^\d{5,8}$")


def org_type(name):
    return "bank" if BANK_RE.search(name) else "exchanger"


def _ts(lines, lo, hi):
    for k in range(max(0, lo), min(len(lines), hi)):
        m = TS.search(lines[k])
        if m:
            return f"{m.group(3)}-{m.group(2)}-{m.group(1)} {m.group(4)}", k
    return "", -1


def scan_ifin(text, kind, today):
    """kind: 'fx' (две цены) или 'gold' (десять цен по слиткам 5/10/20/50/100 г). Возвращает список строк.
    Время обновления ищем сначала до цен (в строке с названием), потом сразу после них."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    rows, name, last_end = [], None, 0
    i = 0
    while i < len(lines):
        l = lines[i]
        row = None
        if kind == "fx" and PRICE.match(l) and name and i + 1 < len(lines) and PRICE.match(lines[i + 1]):
            buy, sell = float(l.replace(",", ".")), float(lines[i + 1].replace(",", "."))
            end = i + 2
            row = {"name": name, "buy": buy, "sell": sell}
        elif kind == "gold" and GOLDN.match(l) and name:
            vals, j = [], i
            while j < len(lines) and GOLDN.match(lines[j]) and len(vals) < 10:
                vals.append(float(lines[j].replace(" ", "")))
                j += 1
            if len(vals) == 10:
                w = [5, 10, 20, 50, 100]
                pg = [(vals[2 * k] / w[k], vals[2 * k + 1] / w[k]) for k in range(5)]
                end = j
                row = {"name": name, "buy": round(pg[1][0], 2), "sell": round(pg[1][1], 2)}
        if row:
            upd, k = _ts(lines, last_end, i)
            if not upd:
                upd, k = _ts(lines, end, end + 3)
                if k >= 0:
                    end = k + 1
            row["upd"] = upd
            rows.append(row)
            name, last_end, i = None, end, end
            continue
        if (not SKIP.match(l) and re.search(r"[A-Za-zА-Яа-я]", l) and not TS.search(l)
                and not re.match(r"^\d", l) and 2 <= len(l) <= 60 and "₸" not in l):
            name = re.sub(r"\s+", " ", l)
        i += 1
    return rows


def ifin_fx(cur, ref):
    rows = scan_ifin(to_text(fetch(f"{IFIN}/exchange/{CITY_SLUG}/{cur}", tries=2)), "fx", "")
    lo, hi = RANGE[cur]
    out = []
    for r in rows:
        ok = lo <= r["buy"] <= hi and lo <= r["sell"] <= hi and r["buy"] <= r["sell"]
        if ok and ref.get(cur):
            ok = abs(r["buy"] / ref[cur] - 1) <= 0.25 and abs(r["sell"] / ref[cur] - 1) <= 0.25
        if ok:
            out.append(r)
    return out


def ifin_gold(ref):
    rows = scan_ifin(to_text(fetch(f"{IFIN}/exchange-gold/{CITY_SLUG}", tries=2)), "gold", "")
    lo, hi = RANGE["XAU"]
    return [r for r in rows if lo <= r["buy"] <= hi and lo <= r["sell"] <= hi and r["buy"] < r["sell"]
            and (not ref.get("XAU") or abs(r["buy"] / ref["XAU"] - 1) <= 0.25)]


def slug(n):
    return re.sub(r"[^a-z0-9а-я]+", "-", n.lower()).strip("-")


def ifin_rows(ref):
    """Возвращает (exchangers, banks, предупреждения). exchangers: валюты, banks: металлы."""
    ex, notes = {}, []
    for cur in CUR:
        try:
            rows = ifin_fx(cur, ref)
            log(f"ifin {cur}: организаций {len(rows)}")
            if not rows:
                notes.append(f"ifin {cur}: не нашел ни одной строки")
            for r in rows:
                e = ex.setdefault(r["name"], {"id": "if-" + slug(r["name"]), "name": r["name"], "type": org_type(r["name"]),
                                              "addr": "Алматы", "url": f"{IFIN}/exchange/{CITY_SLUG}/{cur}", "upd": r["upd"], "rates": {}})
                e["rates"][cur] = [r["buy"], r["sell"]]
                if r["upd"] and r["upd"] < e["upd"] or not e["upd"]:
                    e["upd"] = r["upd"] or e["upd"]
        except Exception as e:
            notes.append(f"ifin {cur}: {e}")
    banks = []
    try:
        for r in ifin_gold(ref):
            banks.append({"id": "ig-" + slug(r["name"]), "name": r["name"], "type": org_type(r["name"]),
                          "addr": "слитки 999,9, цена за 1 грамм (из цены слитка 10 г)", "url": f"{IFIN}/exchange-gold/{CITY_SLUG}",
                          "upd": r["upd"], "rates": {"XAU": [round(r["buy"], 2), round(r["sell"], 2)]}})
        log(f"ifin золото: организаций {len(banks)}")
        if not banks:
            notes.append("ifin золото: не нашел ни одной строки")
    except Exception as e:
        notes.append(f"ifin золото: {e}")
    return list(ex.values()), banks, notes


CHANNELS = [("cash", "наличные в отделении"), ("app", "приложение bcc.kz"), ("fx", "FX-обменник")]


def build_rows(parsed, now):
    ex, banks = [], []
    for k, (cid, label) in enumerate(CHANNELS):
        rt = {c: [round(parsed[c][k][0], 2), round(parsed[c][k][1], 2)] for c in CUR if c in parsed}
        if rt:
            ex.append({"id": "bcc-" + cid, "name": "ЦентрКредит, " + label, "type": "bank", "addr": "Банк ЦентрКредит",
                       "url": BCC_RATES, "upd": now, "rates": rt})
        mt = {c: [round(parsed[c][k][0], 2), round(parsed[c][k][1], 2)] for c in ("XAU", "XAG") if c in parsed and parsed[c][k]}
        if mt:
            banks.append({"id": "bcc-" + cid, "name": "ЦентрКредит, " + label, "addr": "цена за 1 грамм (единицу страница не указывает)",
                          "url": BCC_GOLD, "upd": now, "rates": mt})
    return ex, banks


def read_old():
    try:
        s = FX_JS.read_text(encoding="utf-8")
        return json.loads(s[s.index("window.TM_FX = ") + 15:].rstrip().rstrip(";"))
    except Exception:
        return {"exchangers": [], "banks": []}


def main():
    today = (dt.datetime.utcnow() + dt.timedelta(hours=5)).date().isoformat()
    now = (dt.datetime.utcnow() + dt.timedelta(hours=5)).strftime("%Y-%m-%d %H:%M")
    print("== Курсы валют и золото ==")
    problems = []
    hist = read_csv()
    update_nbk(hist, today)
    update_gold(hist)
    write_csv(hist)
    ref = {c: sorted(hist.get(c, {}).items())[-1][1] for c in list(CUR) + ["XAU"] if hist.get(c)}
    old = read_old()
    ex, banks = old.get("exchangers", []), old.get("banks", [])
    ie, ib, notes = ifin_rows(ref)
    problems += notes
    bex, bbanks = [], []
    try:
        parsed = parse_bcc(to_text(fetch(BCC_RATES, tries=2)), ref)
        for c in CUR + ["XAU", "XAG"]:
            if c in parsed:
                log("ЦентрКредит", c, "отделение", parsed[c][0], "приложение", parsed[c][1], "FX", parsed[c][2])
            else:
                problems.append(f"ЦентрКредит: не нашел {c}")
        if parsed:
            bex, bbanks = build_rows(parsed, now)
            for r in bex + bbanks:
                r["type"] = "bank"
            if parsed.get("XAG"):   # истории серебра у Нацбанка нет: копим середину FX-обменника ЦентрКредита
                a2, b2 = parsed["XAG"][2]
                hist.setdefault("XAG", {})[today] = round((a2 + b2) / 2, 2)
                write_csv(hist)
    except Exception as e:
        problems.append(f"ЦентрКредит: {e}")
    # ifin основной: все обменники и банки. ЦентрКредит добавляем только для серебра и как запасной вариант.
    ag = [dict(r, rates={"XAG": r["rates"]["XAG"]}) for r in bbanks if "XAG" in r["rates"]]
    if ie or ib:
        ex = ie or ex
        banks = ib + ag if ib else (banks or []) + ag
    elif bex or bbanks:
        ex, banks = bex or ex, bbanks or banks
    nbk = {c: [[d, v] for d, v in sorted(hist.get(c, {}).items())[-KEEP:]] for c in list(CUR) + ["XAU", "XAG"] if hist.get(c)}
    js = {"updated": today, "demo": False, "nbk": nbk, "exchangers": ex, "banks": banks}
    FX_JS.write_text("// Файл создается автоматически скриптом collector/fx.py, руками не править.\nwindow.TM_FX = "
                     + json.dumps(js, ensure_ascii=False) + ";\n", encoding="utf-8")
    if problems:
        print("   ПРОБЛЕМЫ:", "; ".join(problems))
        try:
            tg_send("Курсы и золото, проблемы: " + "; ".join(problems))
        except Exception:
            pass
    print("   готово")


if __name__ == "__main__":
    main()
