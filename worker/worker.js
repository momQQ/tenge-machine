// Telegram-бот "Тиімді сәт": оповещения о курсе и утренняя сводка.
// Работает на бесплатном Cloudflare Workers + KV, без своего сервера.
// Нужно: секреты BOT_TOKEN, WEBHOOK_SECRET (любая длинная строка из букв и цифр), необязательно CHANNEL_ID;
// привязка KV с именем KV; cron-триггеры: "20 */3 * * *" (проверка оповещений) и "0 4 * * *" (утренняя сводка, 09:00 Алматы).

const SITE = "https://momqq.github.io/tenge-machine/";
const DATA = SITE + "data/fx.js";
const CUR = ["USD", "EUR", "RUB", "CNY", "GBP"];
const NAME = { USD: ["Доллар", "Доллар"], EUR: ["Евро", "Еуро"], RUB: ["Рубль", "Рубль"], CNY: ["Юань", "Юань"], GBP: ["Фунт", "Фунт"] };
const MAX_ALERTS = 10;

// ---------- помощники ----------
const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const fmt = (n, d = 2) => Number(n).toFixed(n >= 1000 ? 0 : d).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const T = (u, ru, kk) => (u.lang === "kk" ? kk : ru);

async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  return r.json().catch(() => ({}));
}
const send = (env, chat, text, extra = {}) => tg(env, "sendMessage", { chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra });

async function getUser(env, id) {
  const raw = await env.KV.get("u:" + id);
  return raw ? JSON.parse(raw) : { id, lang: "ru", daily: false, alerts: [] };
}
const putUser = (env, u) => env.KV.put("u:" + u.id, JSON.stringify(u));

async function allUsers(env) {
  const out = []; let cursor;
  do {
    const l = await env.KV.list({ prefix: "u:", cursor });
    for (const k of l.keys) { const raw = await env.KV.get(k.name); if (raw) out.push(JSON.parse(raw)); }
    cursor = l.list_complete ? null : l.cursor;
  } while (cursor);
  return out;
}

// ---------- данные сайта ----------
export async function loadFx(fetcher = fetch) {
  const r = await fetcher(DATA, { cf: { cacheTtl: 300 } });
  const s = await r.text();
  return JSON.parse(s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1));
}
export function stat(fx, cur) {
  const h = ((fx.nbk || {})[cur] || []).slice(-91);
  if (h.length < 10) return null;
  const v = h.map(x => x[1]), last = v[v.length - 1], mn = Math.min(...v), mx = Math.max(...v), p30 = v[Math.max(0, v.length - 31)];
  return { last, ch: (last / p30 - 1) * 100, pos: mx > mn ? (last - mn) / (mx - mn) : 0.5 };
}
export function verdict(u, st) {
  if (!st) return "";
  return st.pos < 0.33 ? T(u, "ПОКУПАТЬ", "САТЫП АЛУ") : st.pos > 0.66 ? T(u, "ДОРОГО", "ҚЫМБАТ") : T(u, "НЕ СПЕШИТЬ", "АСЫҚПАҢЫЗ");
}
function bestBuy(fx, cur) {
  const L = (fx.exchangers || []).filter(e => e.type !== "bank" && e.rates && e.rates[cur]);
  if (!L.length) return null;
  return L.slice().sort((a, b) => a.rates[cur][1] - b.rates[cur][1])[0];
}
function staleLine(u, fx) {
  const t = fx.updated_at || (fx.updated ? fx.updated + "T12:00:00Z" : null);
  if (!t) return "";
  const h = (Date.now() - Date.parse(t)) / 36e5;
  return h > 30 ? "\n⚠️ " + T(u, "Данные не обновлялись больше суток, уточните курс в обменнике.", "Деректер тәуліктен астам жаңартылмады, бағамды пункттен нақтылаңыз.") : "";
}
export function summary(u, fx, title) {
  const s = stat(fx, "USD");
  if (!s) return T(u, "Данные пока недоступны, попробуйте позже.", "Деректер әзірге қолжетімсіз, кейінірек көріңіз.");
  const lines = CUR.map(c => { const x = stat(fx, c); return x ? `${c}  <b>${fmt(x.last)}</b> ₸  ${x.ch > 0 ? "▲" : "▼"} ${fmt(Math.abs(x.ch), 1)}%` : ""; }).filter(Boolean);
  const b = bestBuy(fx, "USD");
  return (title ? title + "\n\n" : "") +
    `${T(u, "Доллар сегодня", "Бүгінгі доллар")}: <b>${verdict(u, s)}</b>\n` + lines.join("\n") +
    (b ? `\n\n${T(u, "Выгоднее всего купить USD", "USD ең тиімді сатып алу")}: ${esc(b.name)}, ${fmt(b.rates.USD[1])} ₸` : "") +
    staleLine(u, fx) + `\n\n${SITE}`;
}

// ---------- клавиатура и тексты ----------
const kb = u => ({ reply_markup: { resize_keyboard: true, keyboard: [
  [{ text: T(u, "Курсы", "Бағамдар") }, { text: T(u, "Мои оповещения", "Менің ескертулерім") }],
  [{ text: T(u, u.daily ? "Сводка: выключить" : "Сводка: включить", u.daily ? "Жиынтық: өшіру" : "Жиынтық: қосу") }, { text: "Қазақша / Русский" }]] } });

const help = u => T(u,
  "Я слежу за курсом и пишу, когда он вам подходит.\n\n<b>Как пользоваться</b>\n/alert USD 440 : сообщу, когда доллар дойдет до 440 ₸\n/alert EUR выше 500 : явно задать направление\n/alerts : список оповещений\n/del 1 : удалить оповещение номер 1\n/rate : курсы сейчас\n/daily : утренняя сводка в 9:00 (вкл/выкл)\n/lang : язык\n/stop : удалить все мои данные\n\nКурс считается по официальным данным Нацбанка. Не является финансовой рекомендацией.",
  "Мен бағамды бақылап, ол сізге қолайлы болғанда жазамын.\n\n<b>Қалай қолдану</b>\n/alert USD 440 : доллар 440 ₸ жеткенде хабарлаймын\n/alert EUR жоғары 500 : бағытты анық көрсету\n/alerts : ескертулер тізімі\n/del 1 : 1-ескертуді жою\n/rate : қазіргі бағамдар\n/daily : таңғы жиынтық 9:00 (қосу/өшіру)\n/lang : тіл\n/stop : барлық деректерімді жою\n\nБағам Ұлттық банктің ресми деректері бойынша есептеледі. Қаржылық кеңес емес.");

function parseAlert(text, fx) {
  const parts = text.replace(/^\/alert(@\w+)?/i, "").trim().split(/\s+/).filter(Boolean);
  const cur = (parts.find(p => CUR.includes(p.toUpperCase())) || "").toUpperCase();
  const numStr = parts.find(p => /^[<>]?\d+([.,]\d+)?$/.test(p.replace(/[<>]/g, "")) && /\d/.test(p));
  if (!cur || !numStr) return null;
  const v = parseFloat(numStr.replace(/[<>]/g, "").replace(",", "."));
  const j = parts.join(" ").toLowerCase();
  let dir = /(ниже|below|<|төмен|упад|меньше)/.test(j) || numStr.startsWith("<") ? "below" : /(выше|above|>|жоғар|вырос|больше)/.test(j) || numStr.startsWith(">") ? "above" : null;
  if (!dir) { const s = stat(fx, cur); dir = s && v < s.last ? "below" : "above"; }
  return { c: cur, dir, v };
}

// ---------- команды ----------
export async function handle(env, msg, fx) {
  const chat = msg.chat.id, text = (msg.text || "").trim();
  let u = await getUser(env, chat);
  if (!u.created) { u.created = new Date().toISOString().slice(0, 10); }
  const cmd = text.split(/\s+/)[0].toLowerCase().replace(/@\w+$/, "");
  const arg = text.slice(text.indexOf(" ") + 1).trim();

  if (/^Қазақша/.test(text) || cmd === "/lang") { u.lang = u.lang === "kk" ? "ru" : "kk"; await putUser(env, u); return send(env, chat, T(u, "Язык: русский", "Тіл: қазақша"), kb(u)); }
  if (cmd === "/start") {
    await putUser(env, u);
    const m = arg.match(/^alert_([A-Za-z]{3})_(\d+(?:\.\d+)?)$/);
    if (m && CUR.includes(m[1].toUpperCase())) { return addAlert(env, u, { c: m[1].toUpperCase(), dir: (stat(fx, m[1].toUpperCase()) && +m[2] < stat(fx, m[1].toUpperCase()).last) ? "below" : "above", v: +m[2] }, true); }
    return send(env, chat, T(u, "Здравствуйте! Это бот сайта Тиімді сәт.\n\n", "Сәлеметсіз бе! Бұл Тиімді сәт сайтының боты.\n\n") + help(u), kb(u));
  }
  if (cmd === "/help") return send(env, chat, help(u), kb(u));
  if (cmd === "/rate" || /^(Курсы|Бағамдар)$/.test(text)) return send(env, chat, summary(u, fx), kb(u));
  if (cmd === "/alert") {
    const a = parseAlert(text, fx);
    if (!a) return send(env, chat, T(u, "Напишите так: /alert USD 440", "Былай жазыңыз: /alert USD 440"));
    return addAlert(env, u, a);
  }
  if (cmd === "/alerts" || /^(Мои оповещения|Менің ескертулерім)$/.test(text)) return send(env, chat, listAlerts(u), kb(u));
  if (cmd === "/del") {
    const i = parseInt(arg, 10) - 1;
    if (!(i >= 0 && i < u.alerts.length)) return send(env, chat, T(u, "Номер не найден. Список: /alerts", "Нөмір табылмады. Тізім: /alerts"));
    u.alerts.splice(i, 1); await putUser(env, u); return send(env, chat, T(u, "Удалено.", "Жойылды.") + "\n" + listAlerts(u), kb(u));
  }
  if (cmd === "/daily" || /^(Сводка|Жиынтық)/.test(text)) {
    u.daily = !u.daily; await putUser(env, u);
    return send(env, chat, u.daily ? T(u, "Утренняя сводка включена: каждый день в 9:00 по Алматы.", "Таңғы жиынтық қосылды: күн сайын Алматы уақытымен 9:00.") : T(u, "Утренняя сводка выключена.", "Таңғы жиынтық өшірілді."), kb(u));
  }
  if (cmd === "/stop") { await env.KV.delete("u:" + chat); return send(env, chat, T(u, "Все ваши данные удалены. Если захотите вернуться, нажмите /start.", "Барлық деректеріңіз жойылды. Қайтқыңыз келсе, /start басыңыз.")); }
  return send(env, chat, T(u, "Не понял. Подсказка: /help", "Түсінбедім. Көмек: /help"), kb(u));
}

async function addAlert(env, u, a, fromSite) {
  if (u.alerts.length >= MAX_ALERTS) return send(env, u.id, T(u, `Можно не больше ${MAX_ALERTS} оповещений. Удалите лишние: /alerts`, `${MAX_ALERTS} ескертуден артық болмайды. Артығын жойыңыз: /alerts`));
  u.alerts.push(a); await putUser(env, u);
  return send(env, u.id, T(u, `Готово. Сообщу, когда ${a.c} будет ${a.dir === "below" ? "ниже" : "выше"} ${fmt(a.v)} ₸.\n\nПосле срабатывания оповещение отключится, чтобы не надоедать.`,
    `Дайын. ${a.c} ${fmt(a.v)} ₸-дан ${a.dir === "below" ? "төмен" : "жоғары"} болғанда хабарлаймын.\n\nСөнгеннен кейін ескерту өшеді, мазаламау үшін.`), kb(u));
}
function listAlerts(u) {
  if (!u.alerts.length) return T(u, "Оповещений нет. Пример: /alert USD 440", "Ескертулер жоқ. Мысал: /alert USD 440");
  return T(u, "Ваши оповещения:\n", "Сіздің ескертулеріңіз:\n") + u.alerts.map((a, i) => `${i + 1}. ${a.c} ${a.dir === "below" ? "≤" : "≥"} ${fmt(a.v)} ₸`).join("\n") + T(u, "\n\nУдалить: /del 1", "\n\nЖою: /del 1");
}

// ---------- расписание ----------
export async function checkAlerts(env, fx) {
  let n = 0;
  for (const u of await allUsers(env)) {
    let changed = false;
    const keep = [];
    for (const a of u.alerts) {
      const s = stat(fx, a.c);
      const hit = s && (a.dir === "below" ? s.last <= a.v : s.last >= a.v);
      if (hit) {
        changed = true; n++;
        await send(env, u.id, T(u, `${a.c} ${a.dir === "below" ? "опустился до" : "поднялся до"} <b>${fmt(s.last)}</b> ₸ (вы ждали ${a.dir === "below" ? "≤" : "≥"} ${fmt(a.v)}).\nДоллар сегодня: ${verdict(u, stat(fx, "USD"))}.\nГде выгоднее: ${SITE}#/currency/${a.c}\n\nОповещение выполнено и отключено.`,
          `${a.c} <b>${fmt(s.last)}</b> ₸ жетті (сіз ${a.dir === "below" ? "≤" : "≥"} ${fmt(a.v)} күттіңіз).\nҚайда тиімді: ${SITE}#/currency/${a.c}\n\nЕскерту орындалды және өшірілді.`));
      } else keep.push(a);
    }
    if (changed) { u.alerts = keep; await putUser(env, u); }
  }
  return n;
}
export async function morning(env, fx) {
  let n = 0;
  for (const u of await allUsers(env)) if (u.daily) { await send(env, u.id, summary(u, fx, T(u, "Доброе утро! Сводка на сегодня.", "Қайырлы таң! Бүгінгі жиынтық."))); n++; }
  if (env.CHANNEL_ID) await send(env, env.CHANNEL_ID, summary({ lang: "ru" }, fx, "Курсы на сегодня, Алматы"));
  return n;
}

// ---------- вход ----------
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/setup" && url.searchParams.get("key") === env.WEBHOOK_SECRET) {
      const r = await tg(env, "setWebhook", { url: `${url.origin}/hook`, secret_token: env.WEBHOOK_SECRET, allowed_updates: ["message"] });
      return new Response(JSON.stringify(r), { headers: { "content-type": "application/json" } });
    }
    if (url.pathname === "/hook" && req.method === "POST") {
      if (req.headers.get("x-telegram-bot-api-secret-token") !== env.WEBHOOK_SECRET) return new Response("forbidden", { status: 403 });
      const upd = await req.json().catch(() => null);
      if (upd && upd.message && upd.message.chat && upd.message.chat.type === "private" && upd.message.text) {
        let fx = {}; try { fx = await loadFx(); } catch (e) {}
        try { await handle(env, upd.message, fx); } catch (e) { console.log("handle error", e && e.message); }
      }
      return new Response("ok");
    }
    return new Response("Тиімді сәт bot is running");
  },
  async scheduled(event, env) {
    const fx = await loadFx();
    if (event.cron === "0 4 * * *") await morning(env, fx); else await checkAlerts(env, fx);
  },
};
