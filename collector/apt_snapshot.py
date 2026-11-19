"""Раз в запуск добавляет снимок цен за м2 по ЖК из data/apts.js в data/aptprice.js.
Если цены не менялись с прошлого снимка, новая запись не добавляется (история хранит только изменения и первую точку).
Так накапливается реальная история цен: график появится, когда будет минимум две разные записи.
"""
import json, re
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
src = (DATA / "apts.js").read_text(encoding="utf8")
apt = json.loads(src[src.index("{", src.index("TM_APT")): src.rindex("}") + 1])
cur = {c["id"]: c["m2"] for c in apt["complexes"] if c.get("m2")}
date = apt.get("updated", "")

out = DATA / "aptprice.js"
hist = {"snaps": []}
if out.exists():
    t = out.read_text(encoding="utf8")
    hist = json.loads(t[t.index("{"): t.rindex("}") + 1])
last = hist["snaps"][-1]["m2"] if hist["snaps"] else None
if last != cur:
    hist["snaps"].append({"date": date, "m2": cur})
    out.write_text("// Файл создается collector/apt_snapshot.py, руками не править.\nwindow.TM_APH = " + json.dumps(hist, ensure_ascii=False) + ";\n", encoding="utf8")
    print("снимок добавлен:", date, len(cur), "ЖК")
else:
    print("цены не менялись")
