"""Общие функции сборщика: скачивание страниц и сообщения в Telegram."""
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

USER_AGENT = "Mozilla/5.0 (compatible; tenge-machine-price-tracker; personal project)"
NBK_URL = "https://nationalbank.kz/rss/get_rates.cfm?fdate={d}"   # официальный курс Нацбанка РК на дату ДД.ММ.ГГГГ


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
