(function(){
const D=window.TM;
const app=document.getElementById("app"),topEl=document.getElementById("top");
if(!D){app.innerHTML="<h1>Нет данных</h1><p>Не найден файл data/data.js</p>";return}

// ---------- язык и город ----------
let LANG="ru";
try{const s=localStorage.getItem("tm_lang");LANG=s||((navigator.language||"").toLowerCase().startsWith("kk")?"kk":"ru")}catch(e){}
const t=(ru,kk)=>LANG==="kk"?kk:ru;
function setLang(l){LANG=l;try{localStorage.setItem("tm_lang",l)}catch(e){}route()}
const CITIES=[["Актобе","Ақтөбе"],["Алматы","Алматы"],["Астана","Астана"],["Атырау","Атырау"],["Караганда","Қарағанды"],["Павлодар","Павлодар"],["Шымкент","Шымкент"]];
let CITY="Алматы";try{const c=localStorage.getItem("tm_city");if(c&&CITIES.some(x=>x[0]===c))CITY=c}catch(e){}
const cityN=c=>{const x=CITIES.find(q=>q[0]===c);return x?t(x[0],x[1]):c};
function setCity(c){CITY=c;try{localStorage.setItem("tm_city",c)}catch(e){}}

const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const MON_RU=["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
const MON_KK=["қаң","ақп","нау","сәу","мам","мау","шіл","там","қыр","қаз","қар","жел"];
const MON=new Proxy([],{get:(_,i)=>(LANG==="kk"?MON_KK:MON_RU)[i]});
const num=n=>Math.round(n).toLocaleString("ru-RU");
const dec=(n,k)=>n.toFixed(k).replace(".",",");
const f1=n=>(n>0?"+":"")+dec(n,1)+"%";
const pct=(a,b)=>(b/a-1)*100;
const DAY=864e5;
const dnum=d=>Date.parse(d+"T00:00:00Z")/DAY;
const dstr=n=>new Date(n*DAY).toISOString().slice(0,10);
const dlab=d=>{const p=d.split("-");return +p[2]+" "+MON[+p[1]-1]+" "+p[0]};
const dshort=n=>{const x=new Date(n*DAY);return x.getUTCDate()+" "+MON[x.getUTCMonth()]};
const TODAY=(()=>{const x=new Date(Date.now()+5*36e5).toISOString().slice(0,10);return x>D.updated?x:D.updated})();
const TN=dnum(TODAY);

// названия магазинов и событий на казахском
const SN_KK={"Маркетплейсы":"Маркетплейстер","Официальные реселлеры":"Ресми реселлерлер","Официальная цена (старт)":"Ресми баға (старт)"};
const sn=s=>LANG==="kk"&&SN_KK[s]?SN_KK[s]:s;
const EV_KK={"старт продаж в Казахстане":"Қазақстандағы сатылым басы","выход iPhone 16":"iPhone 16 шықты","выход iPhone 17":"iPhone 17 шықты","старт продаж iPhone 18 Pro":"iPhone 18 Pro сатылымы басталды"};
const evName=s=>LANG==="kk"&&EV_KK[s]?EV_KK[s]:s;
const CATN={smartphones:["Смартфоны","Смартфондар"]};
const catName=c=>CATN[c.id]?t(CATN[c.id][0],CATN[c.id][1]):c.name;

// ---------- курс ----------
const rates={};D.rates.forEach(r=>rates[r[0]]=r[1]);
const rateKeys=Object.keys(rates).sort(),lastRateKey=rateKeys[rateKeys.length-1];
const daily={};(D.daily||[]).forEach(r=>daily[r[0]]=r[1]);
function rateFor(date){if(date in daily)return[daily[date],false];const k=date.slice(0,7);return k in rates?[rates[k],false]:[rates[lastRateKey],true]}

// ---------- магазины ----------
const STORES=D.stores||{};
const baseStore=n=>String(n).split(" · ")[0];
const isOff=n=>/^Официальная цена/.test(n);
const isMkt=n=>{const b=baseStore(n);return (STORES[b]&&STORES[b].type==="marketplace")||/^Маркетплейс/.test(b)};
// порядок всегда один: iSpace, Sulpak, Mechta, Technodom, остальные официальные, в самом конце маркетплейсы (Kaspi)
const ORDER=["iSpace","Sulpak","Mechta","Technodom"];
const rank=n=>{const b=baseStore(n),i=ORDER.indexOf(b);return isOff(n)?100:isMkt(n)?90:(i>=0?i:10)};
const COLS={"iSpace":"var(--s0)","Sulpak":"var(--s1)","Mechta":"var(--s2)","Technodom":"var(--s3)","Kaspi":"var(--s4)"};
const colorOf=(n,i)=>COLS[baseStore(n)]||(isOff(n)?"var(--mute)":["var(--s2)","var(--s3)"][(i||0)%2]);
function storeLogo(name,k){
  const b=baseStore(name),cfg=STORES[b]||{};
  let dom="";try{dom=new URL(cfg.home).hostname}catch(e){}
  const fav=dom?"https://www.google.com/s2/favicons?sz=128&domain="+dom:"";
  const local="logos/"+b.toLowerCase()+".png";
  // порядок: свой файл logos/<магазин>.png, затем значок сайта, затем цветная плитка с буквой
  const fb=fav?"this.onerror=function(){this.remove()};this.src='"+fav+"'":"this.remove()";
  return '<span class="slogo wide" style="--c:'+colorOf(b,k)+'"><i>'+esc(cfg.mono||b.slice(0,2))+'</i><img src="'+local+'" alt="'+esc(b)+'" loading="lazy" onerror="'+fb+'"></span>';
}
const stStatus=(varId,store)=>(D.status||{})[varId+"|"+baseStore(store)];

// ---------- данные ----------
const byVar={};D.prices.forEach(p=>{(byVar[p[1]]=byVar[p[1]]||[]).push({d:p[0],t:dnum(p[0]),s:p[2],v:p[3]})});
const famById=id=>D.families.find(f=>f.id===id);
const brandOf=f=>f.brand||"apple";
const memKey=(f,v)=>v.id.slice(f.id.length+1);
function latestAll(varId){      // последняя цена каждого магазина (продавцы Kaspi по отдельности), без цены старта
  const m={};(byVar[varId]||[]).forEach(p=>{if(!isOff(p.s)&&(!m[p.s]||m[p.s].t<=p.t))m[p.s]=p});
  const a=Object.values(m);if(!a.length)return[];
  const mx=Math.max(...a.map(p=>p.t));
  return a.filter(p=>{
    if(p.t<mx-14)return false;
    const s=stStatus(varId,p.s);                     // нет в наличии или страница пропала: не считаем "самой дешевой"
    return !(s&&(s.avail===false||s.state==="no_data"));
  });
}
function latest(varId){          // официальные магазины; если их нет, то маркетплейс
  const a=latestAll(varId),off=a.filter(p=>!isMkt(p.s));
  return (off.length?off:a).sort((x,y)=>x.v-y.v||rank(x.s)-rank(y.s));
}
function latestMkt(varId){return latestAll(varId).filter(p=>isMkt(p.s)).sort((x,y)=>x.v-y.v)}
function lastRec(varId,pred){return (byVar[varId]||[]).filter(p=>!isOff(p.s)&&pred(p.s)).sort((x,y)=>y.t-x.t||x.v-y.v)[0]}
const officialOf=varId=>(byVar[varId]||[]).filter(p=>isOff(p.s)).sort((a,b)=>b.t-a.t)[0];
function minNow(varId){const l=latest(varId);return l.length?l[0].v:null}
function famFrom(f){const a=f.variants.map(v=>{const m=minNow(v.id);if(m!==null)return m;const o=officialOf(v.id);return o?o.v:null}).filter(x=>x!==null);return a.length?Math.min(...a):null}
const imgOf=f=>{const x=D.images&&D.images[f.id];return x?(typeof x==="string"?{url:x}:x):null};

const BRANDS=[
  {id:"apple",name:"Apple",ready:true,wm:"Apple",c:"#111111",bg:"#ffffff",ch:"A"},
  {id:"samsung",name:"Samsung",ready:true,wm:"SAMSUNG",c:"#1428A0",bg:"#ffffff",ch:"S"},
  {id:"xiaomi",name:"Xiaomi",ready:true,wm:"Xiaomi",c:"#FF6900",bg:"#ffffff",ch:"X"},
  {id:"redmi",name:"Redmi",ready:true,wm:"Redmi",c:"#E8112D",bg:"#ffffff",ch:"R"},
  {id:"poco",name:"POCO",ready:true,wm:"POCO",c:"#111111",bg:"#FFD400",ch:"P"},
  {id:"oppo",name:"OPPO",ready:true,wm:"OPPO",c:"#1A7F4B",bg:"#ffffff",ch:"O"},
  {id:"huawei",name:"HUAWEI",ready:true,wm:"HUAWEI",c:"#CF0A2C",bg:"#ffffff",ch:"H"}
];
// логотип бренда: свой файл logos/brand-<id>.png, иначе название в фирменном цвете
const brandLogo=(b,cls)=>'<span class="blg '+(cls||"")+'" style="--bc:'+b.c+';background:'+b.bg+'"><i>'+esc(b.wm)+'</i><img src="logos/brand-'+b.id+'.png" alt="'+esc(b.name)+'" loading="lazy" onerror="this.remove()"></span>';
const STATUS={nodata:[["Цены скоро","Бағалар жақында"],"warn"],on_sale:[["В продаже","Сатылымда"],"ok"],soon:[["Скоро","Жақында"],"warn"],limited:[["Ограниченно","Шектеулі"],"warn"],archive:[["Архив","Мұрағат"],""]};
const stName=f=>{const x=STATUS[f.status];return x?t(x[0][0],x[0][1]):""};
const stCls=f=>(STATUS[f.status]||["",""])[1];
const plural=(n,a,b,c)=>{const m=n%10,k=n%100;return n+" "+(k>10&&k<20?c:m===1?a:m>1&&m<5?b:c)};

// ---------- иллюстрация-заглушка ----------
const ART={iphone18pro:{lens:3,w:62,c1:"#35597f",c2:"#6f93bd"},iphone18promax:{lens:3,w:70,c1:"#9a5b34",c2:"#d89a6a"},iphone18:{lens:2,w:62,c1:"#4f8a6a",c2:"#93c7a8"},iphoneduo:{lens:2,w:54,c1:"#7a52b3",c2:"#b69be0",tag:"Duo"},iphone16:{lens:2,w:62,c1:"#3a4650",c2:"#7d8b96"}};
let artN=0;
function phoneArt(f){
  const BA={samsung:["#1a2a5e","#4f66b5"],xiaomi:["#b34a00","#ff9a4d"],redmi:["#8f1224","#e8566b"],poco:["#7a6500","#ffd400"],oppo:["#0f5a36","#4fbf8a"],huawei:["#7a0a1c","#d9506a"],apple:["#4a5a66","#8fa0ab"]},bc=BA[brandOf(f)]||BA.apple,a=ART[f.id]||{lens:brandOf(f)==="apple"?2:3,w:62,c1:bc[0],c2:bc[1]},id="g"+(++artN),H=130,W=a.w,x0=6,y0=6;
  const pos=a.lens===3?[[0,0],[1,0],[0.5,1]]:[[0,0],[1,0]];
  return '<svg viewBox="0 0 '+(W+12)+' '+(H+12)+'" role="img" aria-label="'+esc(f.name)+'"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a.c2+'"/><stop offset="1" stop-color="'+a.c1+'"/></linearGradient></defs>'+
  '<rect x="'+x0+'" y="'+y0+'" width="'+W+'" height="'+H+'" rx="12" fill="url(#'+id+')"/><rect x="'+(x0+3)+'" y="'+(y0+3)+'" width="'+(W-6)+'" height="'+(H-6)+'" rx="9.5" fill="none" stroke="rgba(255,255,255,.28)"/>'+
  '<rect x="'+(x0+6)+'" y="'+(y0+6)+'" width="34" height="'+(a.lens===3?36:22)+'" rx="8" fill="rgba(0,0,0,.28)"/>'+
  pos.map(q=>'<circle cx="'+(x0+16+q[0]*13)+'" cy="'+(y0+16+q[1]*13)+'" r="5" fill="#101820" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>').join("")+
  (a.tag?'<text x="'+(W/2+6)+'" y="'+(y0+H-14)+'" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff;letter-spacing:.08em">'+a.tag.toUpperCase()+'</text>':'')+'</svg>';
}
// фото модели: 1) свой файл photos/<id>.png (или .jpg/.webp), 2) фото со страницы магазина (data/images.json), 3) рисунок-заглушка
window.__artFb=function(el){
  const f=famById(el.dataset.f);if(!f)return;
  const step=+el.dataset.s||0,ext=["png","jpg","webp"];
  if(step<ext.length-1+0&&step<2){el.dataset.s=step+1;el.src="photos/"+f.id+"."+ext[step+1];return}
  const im=imgOf(f);
  if(step===2&&im&&im.url){el.dataset.s=3;el.referrerPolicy="no-referrer";el.src=im.url;return}
  const p=el.parentNode;p.classList.add("ill");p.innerHTML=phoneArt(f);
};
function artBox(f,cls){
  return '<div class="art '+cls+'"><img src="photos/'+esc(f.id)+'.png" alt="'+esc(f.name)+'" loading="lazy" data-f="'+esc(f.id)+'" data-s="0" onerror="__artFb(this)"></div>';
}
const ICO={home2:'<rect x="6" y="6" width="15" height="15" rx="3"/><rect x="27" y="6" width="15" height="15" rx="3"/><rect x="6" y="27" width="15" height="15" rx="3"/><rect x="27" y="27" width="15" height="15" rx="3"/>',phone:'<rect x="14" y="4" width="20" height="40" rx="5"/><path d="M21 9h6"/>',car:'<path d="M6 30l4-12h28l4 12v8H6z"/><circle cx="14" cy="34" r="3"/><circle cx="34" cy="34" r="3"/>',home:'<path d="M6 24L24 8l18 16"/><path d="M12 22v18h24V22"/>',gold:'<path d="M8 34l6-12h20l6 12z"/><path d="M16 22l3-8h10l3 8"/>',cash:'<rect x="6" y="12" width="36" height="24" rx="4"/><circle cx="24" cy="24" r="6"/>'};
const sv=k=>'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">'+ICO[k]+'</svg>';
const brandIc=b=>b.logo?'<div class="ic img"><img src="'+b.logo+'" alt="" onerror="var p=this.parentNode;p.classList.remove(\'img\');p.textContent=\''+b.ch+'\'"></div>':'<div class="ic">'+b.ch+'</div>';

// ---------- шапка и подвал ----------
let SEARCH_Q="",onSearch=null,onEnter=null;
function renderTop(){
  document.documentElement.lang=LANG==="kk"?"kk":"ru";
  document.title=t("Тиімді сәт: когда брать и где дешевле","Тиімді сәт: қашан алған және қайда арзан");
  const nf=cmpItems().length;
  topEl.innerHTML='<div class="topin">'+
  '<a class="logo" href="#/"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 7v9l-6 4" fill="none" stroke="var(--time)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16a12 12 0 0 1 3-8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M4.5 5.5V10H9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="lt">Тиімді сәт<small>'+t("когда брать и где дешевле","қашан алған және қайда арзан")+'</small></span></a>'+
  '<div class="sbox2"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="q" type="search" value="'+esc(SEARCH_Q)+'" placeholder="'+t("Найти модель: iPhone 18 Pro, Galaxy S26...","Модельді іздеу: iPhone 18 Pro, Galaxy S26...")+'" autocomplete="off" aria-label="'+t("Поиск","Іздеу")+'"></div>'+
  '<div class="tact"><details class="city"><summary aria-label="'+t("Город","Қала")+'">'+cityN(CITY)+'</summary><div class="menu">'+CITIES.map(c=>'<div class="ci'+(c[0]===CITY?" cur":"")+'" data-city="'+c[0]+'" role="button" tabindex="0">'+t(c[0],c[1])+'</div>').join("")+'<small class="mut" style="padding:6px 12px 4px;display:block">'+t("Цены в магазинах пока по Алматы","Дүкендегі бағалар әзірге Алматы бойынша")+'</small></div></details>'+
  '<a class="favlink" href="#/smartphones" data-cmp aria-label="'+t("Избранное и сравнение","Таңдаулы және салыстыру")+'"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.2C1.3 8.6 3 5.5 6.2 5.5c1.9 0 3.2 1 3.8 2 .6-1 1.9-2 3.8-2 3.200 0 4.900 3.100 3.700 6.300C19.500 16.400 12 21 12 21z"/></svg>'+(FAV.length?'<i class="fb">'+FAV.length+'</i>':'')+'</a>'+
  '<div class="lang" role="group" aria-label="Язык / Тіл"><button data-l="kk" class="'+(LANG==="kk"?"on":"")+'">ҚАЗ</button><button data-l="ru" class="'+(LANG==="ru"?"on":"")+'">РУС</button></div></div></div>'+
  '<nav class="catnav"><div class="topin"><a class="'+(location.hash.replace(/^#\/?/,"")===""?"on":"")+'" href="#/">'+sv("home2")+t("Главная","Басты бет")+'</a><a class="'+(/^#\/smartphones/.test(location.hash)?"on":"")+'" href="#/smartphones">'+sv("phone")+t("Телефоны","Телефондар")+'</a>'+
   [["car",t("Машины","Көліктер")],["home",t("Квартиры","Пәтерлер")],["gold",t("Золото","Алтын")],["cash",t("Валюты","Валюталар")]].filter(x=>x[0]!=="cash"&&x[0]!=="gold"&&x[0]!=="home"&&x[0]!=="car").map(x=>'<span class="soon">'+sv(x[0])+x[1]+'<i>'+t("скоро","жақында")+'</i></span>').join("")+'<a class="'+(/^#\/cars/.test(location.hash)?"on":"")+'" href="#/cars">'+sv("car")+t("Машины","Көліктер")+'</a>'+'<a class="'+(/^#\/apartments/.test(location.hash)?"on":"")+'" href="#/apartments">'+sv("home")+t("Квартиры","Пәтерлер")+'</a><a class="'+(/^#\/currency/.test(location.hash)?"on":"")+'" href="#/currency">'+sv("cash")+t("Валюта и металлы","Валюта және металдар")+'</a>'+
   '<a class="nl" href="#/about">'+t("Как мы считаем","Біз қалай есептейміз")+'</a></div></nav>';
  const qi=document.getElementById("q");
  qi.oninput=e=>{SEARCH_Q=e.target.value;if(onSearch)onSearch()};
  qi.onkeydown=e=>{if(e.key!=="Enter")return;if(onEnter)onEnter();else location.hash="#/smartphones"};
  topEl.querySelectorAll("[data-city]").forEach(x=>x.onclick=()=>{setCity(x.dataset.city);renderTop()});
  const fl=topEl.querySelector(".favlink");
  fl.onclick=e=>{OPEN_CMP=true;if(location.hash==="#/smartphones"){e.preventDefault();route2()}};
  topEl.querySelectorAll(".lang button").forEach(b=>b.onclick=()=>setLang(b.dataset.l));
}
const CONTACT=()=>'<section class="contact card"><div><b>'+t("Нашли ошибку в цене или хотите добавить модель?","Бағадан қате таптыңыз ба немесе модель қосқыңыз келе ме?")+'</b><span>'+t("Напишите мне напрямую, отвечу лично.","Маған тікелей жазыңыз, өзім жауап беремін.")+'</span></div><div class="cbtns"><a class="cwa" href="https://wa.me/77776265885?text='+encodeURIComponent(t("Здравствуйте! Пишу с сайта Тиімді сәт.","Сәлеметсіз бе! Тиімді сәт сайтынан жазып тұрмын."))+'" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.1 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1 2.8.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z"/></svg>WhatsApp</a><a class="cig" href="https://instagram.com/mqq.btw" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>@mqq.btw</a></div></section>';
const FOOT=()=>CONTACT()+'<p class="foot">'+t("Цены берутся с карточек товаров в магазинах, наличие не отслеживается. Прогноз это ориентир по прошлым данным, а не гарантия и не финансовый совет. Обновлено: ","Бағалар дүкендердегі тауар парақшаларынан алынады, қолда бар-жоғы бақыланбайды. Болжам өткен деректер бойынша бағдар ғана, кепілдік емес және қаржылық кеңес емес. Жаңартылды: ")+esc(D.updated)+'. <a href="#/about">'+t("Как мы считаем","Біз қалай есептейміз")+'</a></p>';
function crumbs(parts){return '<p class="crumbs">'+parts.map(p=>p[1]?'<a href="'+p[1]+'">'+esc(p[0])+'</a>':esc(p[0])).join(" / ")+'</p>'}
const HOME=()=>t("Главная","Басты бет");

// ---------- календарь и вердикт ----------
const CAL_KK={
 "2026-11-27":["Қара жұма","Қазақстандағы қараша сатылымдарының басты күні, дүкендер ертерек бастауы мүмкін. Бағаны жеңілдік пайызымен емес, осы сайттағы тарихпен салыстырыңыз: акция алдында ескі баға көтеріліп қойылады."],
 "2026-12-20":["Жаңа жылдық сатылымдар","Желтоқсан соңы: мерекелік акциялар мен бөліп төлеу. Шарттарын дүкендердің өздері жариялайды."],
 "2027-02-15":["Ақпан мен наурыз","iPhone 16 үшін ең байқалатын арзандау шыққанынан кейінгі 4-5-айға түскен."],
 "2027-03-08":["8 наурыз және Наурыз","Электроника дүкендерінің мерекелік акциялары."],
 "2027-04-01":["2027 көктемі: iPhone 18 және 18e","БАҚ хабарлауынша, Apple базалық модельді көктемде шығарады. Apple мұны ресми растаған жоқ."],
 "2027-09-15":["2027 қыркүйегі: жаңа желі","Жаңа модельдер шыққанда алдыңғылары көбіне арзандайды. Бірақ iPhone 17 шыққанда iPhone 16 бағасы долларда тек 2,2% төмендеген."]
};
const CAL_DEFAULT=[
 ["2026-11-27","Черная пятница","Главная дата ноябрьских распродаж в Казахстане, магазины могут начать раньше. Сравнивайте цену по этому сайту, а не процент скидки на ценнике: перед акциями бывает завышенная старая цена."],
 ["2026-12-20","Новогодние распродажи","Конец декабря: праздничные акции и рассрочка. Условия объявляют магазины."],
 ["2027-02-15","Февраль и март","У iPhone 16 самое заметное снижение пришлось на 4-5 месяц после выхода."],
 ["2027-03-08","8 марта и Наурыз","Праздничные акции магазинов электроники."],
 ["2027-04-01","Весна 2027: iPhone 18 и 18e","По сообщениям СМИ, базовую модель Apple выпустит весной. Apple это официально не подтверждала."],
 ["2027-09-15","Сентябрь 2027: новая линейка","Конец сезона: прошлые модели чаще дешевеют при выходе новых. Но у iPhone 16 при выходе iPhone 17 цена в долларах упала всего на 2,2%."]
];
const CAL=()=>{const base=(D.calendar&&D.calendar.length)?D.calendar.map(e=>[e.date,e.title,e.text]):CAL_DEFAULT;
  return LANG==="kk"?base.map(c=>CAL_KK[c[0]]?[c[0],CAL_KK[c[0]][0],CAL_KK[c[0]][1]]:c):base};
function refCurve(){
  const rel=dnum("2024-09-20"),a=(byVar["iphone16-128"]||[]).filter(p=>p.s==="Маркетплейсы").sort((x,y)=>x.t-y.t);
  if(a.length<3)return null;
  const base=a[0].v,pts=a.map(p=>[(p.t-rel)/30.4375,p.v/base]).filter(q=>q[0]<=6);
  return pts.length>=3?pts:null;
}
function ratioAt(c,age){
  if(age<=c[0][0])return c[0][1];
  for(let i=1;i<c.length;i++)if(age<=c[i][0]){const k=(age-c[i-1][0])/(c[i][0]-c[i-1][0]);return c[i-1][1]+k*(c[i][1]-c[i-1][1])}
  return null;
}
function verdict(f,v,pts){
  const R=[];let wait=0,buy=0;
  const lat=latest(v.id),best=lat[0];
  const ev=(f.events||[])[0],age=ev&&f.group!=="archive"?(TN-dnum(ev[0]))/30.4375:null;
  const cur=refCurve();
  if(f.status==="limited"){buy+=1;R.push(["up",t("Для этой модели нет аналога в истории: новый тип устройства с ограниченной доступностью, снижения в первые месяцы маловероятны.","Бұл модельге ұқсас үлгі тарихта жоқ: қолжетімділігі шектеулі жаңа құрылғы түрі, алғашқы айларда арзандау ықтималдығы төмен.")])}
  else if(cur&&age!==null&&age<5){
    const r0=ratioAt(cur,age),r1=ratioAt(cur,Math.min(cur[cur.length-1][0],age+2.7));
    if(r0&&r1&&pct(r0,r1)<=-5){wait+=2;
      const d=new Date(TN*DAY+Math.min(cur[cur.length-1][0]-age,2.7)*30.4375*DAY),x=dec(-pct(r0,r1),0),mo=MON[d.getUTCMonth()]+" "+d.getUTCFullYear();
      R.push(["dn",t("Модели "+dec(age,1)+" мес. У iPhone 16 в таком возрасте цена на маркетплейсах снижалась еще примерно на "+x+"% к "+mo+".","Модельге "+dec(age,1)+" ай. iPhone 16 осындай жаста маркетплейстерде баға әлі шамамен "+x+"% төмендеген ("+mo+" дейін).")])}
  }
  const sale=CAL().map(c=>({d:dnum(c[0]),t:c[1],x:c[2]})).filter(c=>c.d>=TN&&c.d-TN<=45&&/распрод|пятниц|акци|сатылым|жұма/i.test(c.t+" "+c.x))[0];
  if(sale){wait+=1;const n=Math.round(sale.d-TN);R.push(["dn",t("Через "+n+" дн. "+sale.t.toLowerCase()+": магазины обычно запускают акции.",n+" күннен кейін "+sale.t.toLowerCase()+": дүкендер әдетте акция өткізеді.")])}
  const stores=pts.filter(p=>!isOff(p.s));
  if(best&&stores.length){
    const span=Math.max(...stores.map(p=>p.t))-Math.min(...stores.map(p=>p.t)),lo=Math.min(...stores.map(p=>p.v));
    if(span>=14&&best.v<=lo){buy+=1;R.push(["up",t("Сейчас самая низкая цена за всю нашу историю.","Қазір біздің бүкіл тарихтағы ең төмен баға.")])}
  }
  const r1=rateFor(TODAY)[0],r0=rateFor(dstr(TN-30))[0],rc=pct(r0,r1);
  if(rc>2){buy+=1;R.push(["up",t("Тенге за месяц ослаб на "+dec(rc,1)+"%, цены могут вырасти.","Теңге бір айда "+dec(rc,1)+"% әлсіреді, бағалар өсуі мүмкін.")])}
  else R.push(["",t("Курс доллара за 30 дней "+f1(rc)+(Math.abs(rc)<1.5?", почти без изменений":", тенге крепнет")+": на цену это сейчас почти не давит.","Доллар бағамы 30 күнде "+f1(rc)+(Math.abs(rc)<1.5?", шамамен өзгермеді":", теңге нығайып жатыр")+": бағаға қазір ықпалы шамалы.")]);
  if(wait>0)R.push(["",t("У iSpace и Sulpak это официальные партнеры, их цены обычно снижаются скромнее, чем на маркетплейсах вроде Kaspi.","iSpace және Sulpak ресми серіктестер, олардың бағасы Kaspi сияқты маркетплейстерге қарағанда әдетте аз төмендейді.")]);
  const diff=wait-buy,tone=diff<0?"buy":diff===0?"mid":diff>=3?"wait":"slow";
  const title=tone==="buy"?t("Можно брать","Алуға болады"):tone==="mid"?t("Решайте сами","Өзіңіз шешіңіз"):tone==="slow"?t("Лучше не спешить","Асықпаған жөн"):t("Лучше подождать","Күткен жөн");
  if(tone==="mid"&&!R.some(r=>r[0]))R.unshift(["",t("Явных причин ждать или спешить нет: если телефон нужен, берите по лучшей цене.","Күтуге де, асығуға да нақты себеп жоқ: телефон керек болса, ең жақсы бағамен алыңыз.")]);
  return {tone,title,reasons:R};
}

// ---------- избранное и график-мини ----------
const FAV=(()=>{try{return JSON.parse(localStorage.getItem("tm_fav")||"[]")}catch(e){return[]}})();
function saveFav(){try{localStorage.setItem("tm_fav",JSON.stringify(FAV))}catch(e){}}
function spark(f,w,h){
  const v=f.variants.find(x=>(byVar[x.id]||[]).length);if(!v)return"";
  const m={};byVar[v.id].forEach(p=>{if(!isOff(p.s))m[p.t]=Math.min(m[p.t]||1e12,p.v)});
  const k=Object.keys(m).map(Number).sort((a,b)=>a-b);if(k.length<2)return'<span class="nospark">'+t("история копится","тарих жиналуда")+'</span>';
  const vals=k.map(x=>m[x]),lo=Math.min(...vals),hi=Math.max(...vals),r=hi-lo||1;
  const pt=k.map(x=>((x-k[0])/(k[k.length-1]-k[0])*(w-4)+2).toFixed(1)+","+((hi-m[x])/r*(h-8)+4).toFixed(1)).join(" ");
  return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><polyline points="'+pt+'" fill="none" stroke="var(--s0)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
}
const fromTxt=n=>LANG==="kk"?'<span class="pn2">'+num(n)+' ₸</span> <small>бастап</small>':'<small>от</small> <span class="pn2">'+num(n)+' ₸</span>';


// ---------- умный поиск ----------
const TRL={"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sh","ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","ә":"a","ғ":"g","қ":"k","ң":"n","ө":"o","ұ":"u","ү":"u","һ":"h","і":"i"};
const ALIAS={"ксиаоми":"xiaomi","ксиауми":"xiaomi","шаоми":"xiaomi","ксяоми":"xiaomi","редми":"redmi","поко":"poco","оппо":"oppo","хуавей":"huawei","хуавэй":"huawei","хуавеи":"huawei","фолд":"fold","флип":"flip","нова":"nova","пура":"pura","мате":"mate","рено":"reno","финд":"find","ультра":"ultra","плюс":"plus","ноут":"note","нот":"note","эс":"s","айфон":"iphone","айфоны":"iphone","айфона":"iphone","айфн":"iphone","афон":"iphone","айфо":"iphone","эпл":"apple","эппл":"apple","апл":"apple","про":"pro","макс":"max","дуо":"duo","самсунг":"samsung","сяоми":"xiaomi","хонор":"honor","галакси":"galaxy","восемнадцать":"18","шестнадцать":"16","семнадцать":"17"};
const VOCAB=["iphone","apple","pro","max","duo","samsung","galaxy","xiaomi","redmi","poco","oppo","huawei","honor","plus","ultra","mini","fold","flip","note","nova","pura","mate","reno","find"];
function lev(a,b){
  const m=a.length,n=b.length;if(!m)return n;if(!n)return m;
  let prev=Array.from({length:n+1},(_,j)=>j);
  for(let i=1;i<=m;i++){const cur=[i];for(let j=1;j<=n;j++){cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1))}prev=cur}
  return prev[n];
}
function translit(w){let o="";for(const ch of w)o+=(ch in TRL)?TRL[ch]:ch;return o}
function normTokens(s){
  s=String(s||"").toLowerCase().replace(/[^a-z0-9а-яёәғқңөұүһі\s]/g," ");
  // отделяем цифры от букв: iphone18pro -> iphone 18 pro, 18е -> 18 е
  s=s.replace(/([a-zа-яёәғқңөұүһі])(\d)/g,"$1 $2").replace(/(\d)([a-zа-яёәғқңөұүһі])/g,"$1 $2");
  const out=[];
  s.split(/\s+/).filter(Boolean).forEach(w=>{
    if(ALIAS[w])w=ALIAS[w];else w=translit(w);
    if(!/^\d+$/.test(w)){
      let best=null,bd=9;
      VOCAB.forEach(v=>{const d=lev(w,v),lim=v.length>=5?2:(v.length>=3?1:0);if(d<=lim&&d<bd){bd=d;best=v}});
      if(best&&w.length>=3)w=best;
    }
    out.push(w);
  });
  return out;
}
function tokHit(q,tg){
  if(q===tg)return 3;
  if(/^\d+$/.test(q)||/^\d+$/.test(tg))return tg.startsWith(q)&&q.length>=2?1:0;
  if(q.length>=2&&tg.startsWith(q))return 2;
  const lim=q.length>=7?2:q.length>=4?1:0;
  return lev(q,tg)<=lim?1:0;
}
function searchItems(items,raw){
  const qt=normTokens(raw);if(!qt.length)return{list:items,near:null};
  const scored=items.map(x=>{
    const tt=normTokens(x.f.name+" "+brandOf(x.f));
    let sc=0,ok=true;
    qt.forEach(q=>{let b=0;tt.forEach(tg=>{b=Math.max(b,tokHit(q,tg))});if(!b)ok=false;sc+=b});
    return{x,ok,sc:ok?sc-0.01*tt.length:-1}
  });
  const hit=scored.filter(r=>r.ok).sort((a,b)=>b.sc-a.sc).map(r=>r.x);
  if(hit.length)return{list:hit,near:null};
  // предположение: самая похожая модель по частичному совпадению
  let near=null,bs=0;
  items.forEach(x=>{const tt=normTokens(x.f.name);let sc=0;qt.forEach(q=>tt.forEach(tg=>{sc=Math.max(sc,tokHit(q,tg)>0?1:0)}));
    let s2=0;qt.forEach(q=>{let b=0;tt.forEach(tg=>{if(/^\d+$/.test(q)&&/^\d+$/.test(tg)){b=Math.max(b,Math.abs(+q-+tg)<=1?0.6:0)}else b=Math.max(b,Math.max(0,1-lev(q,tg)/Math.max(q.length,tg.length)))});s2+=b});
    s2=s2/qt.length;if(s2>bs){bs=s2;near=x}});
  return{list:[],near:bs>=0.5?near:null};
}
// запоминаем поиски без результата (в этом браузере; адрес сбора можно задать ниже)
const LOG_URL="";
function readMiss(){try{return JSON.parse(localStorage.getItem("tm_misses")||"[]")}catch(e){return[]}}
function logMiss(raw){
  const q=String(raw||"").trim();if(q.length<2)return;
  const n=normTokens(q).join(" "),L=readMiss(),now=new Date().toISOString();
  const e=L.find(r=>r.n===n);
  if(e){e.c++;e.last=now;if(!e.v.includes(q)&&e.v.length<5)e.v.push(q)}else L.push({n,v:[q],c:1,first:now,last:now,lang:LANG});
  try{localStorage.setItem("tm_misses",JSON.stringify(L.slice(-200)))}catch(err){}
  if(LOG_URL&&navigator.sendBeacon){try{navigator.sendBeacon(LOG_URL,JSON.stringify({q,n,lang:LANG,t:now}))}catch(err){}}
}


// ---------- статистика цены: минимум, максимум, изменение ----------
function priceStats(varId){
  let rows=(byVar[varId]||[]).filter(p=>!isOff(p.s));if(!rows.length)return null;
  const lat0=latest(varId)[0];if(lat0){const same=rows.filter(p=>p.s===lat0.s);if(same.length)rows=same}   // сравниваем цены одного магазина, чтобы данные были сопоставимы
  const day={};rows.forEach(p=>{if(!day[p.t]||p.v<day[p.t].v)day[p.t]=p});
  const arr=Object.values(day).sort((a,b)=>a.t-b.t),last=arr[arr.length-1];
  const lat=latest(varId)[0],cur=lat?lat.v:last.v;
  let mx=arr[0],mn=arr[0];arr.forEach(p=>{if(p.v>mx.v)mx=p;if(p.v<mn.v)mn=p});
  if(cur<mn.v)mn={v:cur,t:last.t,d:last.d};
  const ref=[...arr].reverse().find(p=>p.t<=TN-30)||arr[0];
  return{cur,max:mx,min:mn,span:last.t-arr[0].t,ref,first:arr[0]};
}
function changeBadge(st){
  if(!st||st.span<2)return null;
  const dn=pct(st.max.v,st.cur);
  if(dn<=-1)return{k:"dn",txt:"−"+Math.abs(Math.round(dn))+"%"};
  const up=pct(st.ref.v,st.cur);
  if(up>=1)return{k:"up",txt:"+"+Math.round(up)+"%"};
  return null;
}

function itemsOf(brandId){
  return D.families.filter(f=>brandOf(f)===brandId).map(f=>{let best=null,bv=null;f.variants.forEach(v=>{const l=latest(v.id)[0];if(l&&(!best||l.v<best.v)){best=l;bv=v}});
    let vd=null;if(bv&&f.group!=="archive"){try{vd=verdict(f,bv,byVar[bv.id])}catch(e){}}
    return{f,best,bv,vd,st:bv?priceStats(bv.id):null,from:best?best.v:famFrom(f)}});
}

// проверка каждой карточки: вывод, свежесть данных, нет цен
function chipHtml(x){
  const f=x.f;let h="";
  if(f.group==="archive")return '<div class="vchip gray">'+t("Архив: образец для прогноза","Мұрағат: болжамға үлгі")+'</div>';
  if(f.status==="soon"&&!x.best)return '<div class="vchip mid">'+t("Ждем выход, цен пока нет","Шығуын күтеміз, баға әзірге жоқ")+'</div>';
  if(!x.best)return '<div class="vchip gray">'+t("Цены магазинов еще не собраны","Дүкен бағалары әлі жиналмады")+'</div>';
  if(x.vd)h='<div class="vchip '+x.vd.tone+'">'+x.vd.title+'</div>';
  const age=Math.round(TN-x.best.t);
  if(age>=4)h+='<div class="vchip mid" style="margin-top:6px">'+t("Цена не обновлялась "+age+" дн.","Баға "+age+" күн жаңартылмады")+'</div>';
  return h;
}
function instTermOf(f){const a=f.variants.flatMap(v=>v.stores.flatMap(q=>q.inst||[]));return a.includes(24)?24:a.includes(12)?12:0}
function pcard(x){
  const f=x.f,fav=FAV.includes(f.id),st=x.st,cb=changeBadge(st),down=cb&&cb.k==="dn",nd=f.status==="nodata";
  const term=instTermOf(f),mon=x.from&&term?Math.round(x.from/term/100)*100:0;
  const sts=x.bv?[...new Set(latestAll(x.bv.id).map(p=>baseStore(p.s)))].sort((p,q)=>rank(p)-rank(q)):[];
  const tag=down?'<span class="tg dn">'+cb.txt+'</span>':(f.status==="soon"?'<span class="tg nw">'+t("Скоро","Жақында")+'</span>':nd?'<span class="tg gr">'+t("Цены скоро","Бағалар жақында")+'</span>':"");
  const art='<div class="pimg">'+artBox(f,"big")+tag+'</div>';
  return '<a class="pc'+(nd?" nd":"")+'" href="#/smartphones/'+brandOf(f)+'/'+f.id+'"><button class="heart'+(fav?" on":"")+'" data-id="'+f.id+'" aria-label="'+t("В избранное и сравнение","Таңдаулыға және салыстыруға")+'" aria-pressed="'+fav+'">'+(fav?"♥":"♡")+'</button>'+art+
  '<div class="pb">'+(nd?'':'<div class="pr2'+(down?" good":"")+'">'+(x.from?'<span class="pnow">'+num(x.from)+' ₸</span>'+(down?' <s class="pold">'+num(st.max.v)+' ₸</s>':''):'<span class="mut">'+t("цен пока нет","бағасы әзірге жоқ")+'</span>')+'</div>')+
  (mon?'<div class="inst2"><b>'+num(mon)+' ₸</b>'+t("/мес","/ай")+' <span class="tm">'+term+' '+t("мес","ай")+'</span></div>':'')+
  '<b class="pname">'+esc(f.name)+'</b>'+
  (f.rating?'<div class="rt"><span class="stars">★</span> <b>'+dec(f.rating.v,1)+'</b> <span class="mut">('+f.rating.n+')</span></div>':'')+
  (sts.length?'<div class="sl">'+sts.slice(0,4).map(n=>storeLogo(n)).join("")+'<span class="mut">'+t("в ","")+sts.length+' '+t(sts.length>1?"магазинах":"магазине","дүкенде")+'</span></div>':'')+
  (nd?'<div class="ndn">'+t("Добавляем цены магазинов. Нажмите, чтобы посмотреть, когда ждать.","Дүкен бағаларын қосып жатырмыз. Қашан күту керегін көру үшін басыңыз.")+'</div>':chipHtml(x))+'</div></a>';
}
function bindCards(container,onChange){
  container.onclick=e=>{const h=e.target.closest(".heart");if(!h)return;e.preventDefault();const id=h.dataset.id,i=FAV.indexOf(id);i>=0?FAV.splice(i,1):FAV.push(id);saveFav();onChange();favBar()};
}

const endMs=ds=>{const p=ds.split("-").map(Number);return Date.UTC(p[0],p[1]-1,p[2])-5*36e5};   // полночь по Казахстану (UTC+5)
function cdHtml(ds){const e=endMs(ds),u=[["d",t("дн","күн")],["h",t("час","сағ")],["m",t("мин","мин")],["s",t("сек","сек")]];
  return '<div class="cd" data-end="'+e+'" role="timer" aria-label="'+t("Сколько осталось, время по Казахстану","Қанша қалды, Қазақстан уақыты")+'">'+u.map(x=>'<div><b data-u="'+x[0]+'">00</b><small>'+x[1]+'</small></div>').join('<span>:</span>')+'</div>'}
function tickCd(){
  const now=Date.now(),p2=n=>String(n).padStart(2,"0");
  document.querySelectorAll("[data-end]").forEach(el=>{
    let ms=+el.dataset.end-now;const go=ms<=0;if(go)ms=0;
    const d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4),sc=Math.floor(ms%6e4/1e3);
    if(el.classList.contains("cd")){
      if(go){el.innerHTML='<b class="now">'+t("Началось!","Басталды!")+'</b>';return}
      const v={d:String(d),h:p2(h),m:p2(m),s:p2(sc)};el.querySelectorAll("[data-u]").forEach(b=>{const x=v[b.dataset.u];if(b.textContent!==x)b.textContent=x});
    }else el.textContent=go?t("Началось!","Басталды!"):d+" "+t("дн","күн")+" "+p2(h)+":"+p2(m)+":"+p2(sc);
  });
}
function topHtml(items){
  const pr=items.filter(x=>x.f.group!=="archive"&&x.best&&x.bv);
  const score=x=>{const cb=changeBadge(x.st);let v=0;if(cb&&cb.k==="dn")v+=parseInt(cb.txt.replace(/\D/g,""),10)||0;if(x.vd&&x.vd.tone==="buy")v+=5;if(x.vd&&x.vd.tone==="wait")v-=3;return v};
  const top=pr.sort((a,b)=>score(b)-score(a)).slice(0,6);
  if(!top.length)return"";
  return '<section class="top3" id="toprow"><div class="t3h"><h2>'+t("Где выгодно брать сейчас","Қазір қайдан алған тиімді")+'</h2><span class="mut">'+t("Лучшие цены сегодня в проверенных магазинах","Бүгінгі сенімді дүкендердегі үздік бағалар")+'</span></div><div class="t3r">'+top.map((x,i)=>{
    const store=baseStore(x.best.s),ent=x.bv.stores.find(q=>q.store===store),url=ent&&ent.url&&ent.parser!=="none"?ent.url:(STORES[store]&&STORES[store].home)||"",hasCard=!!(ent&&ent.url);
    const cb=changeBadge(x.st),down=cb&&cb.k==="dn",term=instTermOf(x.f),mon=term?Math.round(x.from/term/100)*100:0;
    return '<article class="tp"><a class="tpi" href="#/smartphones/'+brandOf(x.f)+'/'+x.f.id+'"><span class="tpn">'+(i+1)+'</span>'+artBox(x.f,"")+(down?'<span class="tg dn">'+cb.txt+'</span>':'')+'</a>'+
      '<div class="tpb"><a class="tpt" href="#/smartphones/'+brandOf(x.f)+'/'+x.f.id+'">'+esc(x.f.name)+'</a>'+
      '<div class="tpp"><b>'+num(x.from)+' ₸</b>'+(down?' <s>'+num(x.st.max.v)+' ₸</s>':'')+'</div>'+
      (mon?'<div class="inst2"><b>'+num(mon)+' ₸</b>'+t("/мес","/ай")+' <span class="tm">'+term+' '+t("мес","ай")+'</span></div>':'')+
      (x.vd?'<div class="vchip '+x.vd.tone+'">'+x.vd.title+'</div>':'')+
      '<div class="tps"><span class="mut">'+t("Где брать","Қайдан алу")+'</span>'+storeLogo(store)+'</div>'+
      (url?'<a class="bgo '+(hasCard?"":"alt")+'" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+(hasCard?t("Купить","Сатып алу"):t("Открыть","Ашу"))+' ↗</a>':'')+'</div></article>'}).join("")+'</div></section>';
}
function bannersHtml(sale,nBlack){
  const art=(id,cls)=>{const f=famById(id)||D.families.find(x=>x.category==="smartphones");return f?'<div class="bart '+(cls||"")+'">'+phoneArt(f)+'</div>':""};
  const sl=[];
  sl.push({bg:"linear-gradient(120deg,#1d2f9f,#5b3fd6)",img:1,k:t("Сравнение цен","Бағаларды салыстыру"),h:t("Не переплачивайте за дорогие покупки","Қымбат сатып алуларға артық төлемеңіз"),p:t("Самая низкая цена в надежных магазинах и история цены","Сенімді дүкендердегі ең төмен баға және баға тарихы"),go:"catalog",btn:t("Смотреть цены","Бағаларды көру"),art:art("iphone18promax")+art("galaxys26ultra","b2")});
  if(sale)sl.push({bg:"linear-gradient(120deg,#b4231a,#f2780c)",img:2,k:t("Скоро","Жақында"),h:t("До \""+sale.t.toLowerCase()+"\"","\""+sale.t+"\" дейін"),extra:cdHtml(sale.s),p:t("Время по Казахстану. Смотрите историю цены: скидка на ценнике не всегда скидка","Қазақстан уақыты бойынша. Баға тарихын қараңыз: бағалауыштағы жеңілдік әрдайым жеңілдік емес"),go:"catalog",btn:t("Проверить цены","Бағаларды тексеру"),art:art("iphoneduo")});
  sl.push({bg:"linear-gradient(120deg,#8a5a00,#f2a200)",img:3,k:t("Рассрочка","Бөліп төлеу"),h:t("Рассрочка 12 и 24 месяца","12 және 24 айға бөліп төлеу"),p:t("Показываем, где она есть, и сколько платить в месяц","Қайда бар екенін және айына қанша төлейтінін көрсетеміз"),go:"inst",btn:t("Показать с рассрочкой","Бөліп төлеумен көрсету"),art:art("galaxyzflip8")});
  sl.push({bg:"linear-gradient(120deg,#0b6b57,#1fb58f)",img:4,k:t("История цены","Баға тарихы"),h:t("Видно, когда было дешевле","Қашан арзан болғаны көрінеді"),p:t("График цены за все время в тенге и в долларах","Бүкіл уақыттағы баға графигі теңгемен және долларменен"),go:"catalog",btn:t("Открыть каталог","Каталогты ашу"),art:'<div class="bart chart"><svg viewBox="0 0 200 110" aria-hidden="true"><polyline fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" points="6,30 40,38 70,26 100,52 130,44 160,74 194,84"/><circle cx="194" cy="84" r="9" fill="#ffd37a"/></svg></div>'});
  sl.push({bg:"linear-gradient(120deg,#32358f,#c2306e)",img:5,k:t("Сравнение","Салыстыру"),h:t("Сравните две модели","Екі модельді салыстырыңыз"),p:t("Цена, батарея, вес и отзывы рядом, вывод одной фразой","Баға, батарея, салмақ және пікірлер қатар, қорытынды бір сөйлеммен"),go:"cmp",btn:t("Выбрать и сравнить","Таңдап салыстыру"),art:art("iphone18promax")+art("iphoneduo","b2")});
  return '<section class="bnr" aria-roledescription="carousel" aria-label="'+t("Главное","Басты")+'"><div class="btrack" id="btrack">'+sl.map(x=>'<article class="bs" style="background-image:url(banners/b'+x.img+'.jpg),'+x.bg+'"><div class="bt"><span class="pmk">'+x.k+'</span><h2>'+x.h+'</h2>'+(x.extra||'')+'<p>'+x.p+'</p><button type="button" class="bcta" data-go="'+x.go+'">'+x.btn+'</button></div>'+x.art+'</article>').join("")+'</div><button type="button" class="bnav prev" aria-label="'+t("Назад","Артқа")+'">‹</button><button type="button" class="bnav next" aria-label="'+t("Дальше","Алға")+'">›</button></section>';
}
// ---------- главная ----------

// ---------- валюты ----------
const FXC={USD:{s:"$",n:["Доллар","Доллар"],f:"США"},EUR:{s:"€",n:["Евро","Еуро"],f:"Европа"},RUB:{s:"₽",n:["Рубль","Рубль"],f:"Россия"},CNY:{s:"¥",n:["Юань","Юань"],f:"Китай"},GBP:{s:"£",n:["Фунт стерлингов","Фунт стерлинг"],f:"Великобритания"},XAU:{s:"Au",n:["Золото","Алтын"],m:1},XAG:{s:"Ag",n:["Серебро","Күміс"],m:1}};
const FXK=["USD","EUR","RUB","CNY","GBP"],FXA=[...FXK,"XAU","XAG"],isM=k=>k==="XAU"||k==="XAG",fxList=k=>isM(k)?((window.TM_FX&&TM_FX.banks)||[]):((window.TM_FX&&TM_FX.exchangers)||[]),fxAvail=()=>FXA.filter(k=>fxList(k).some(e=>e.rates&&e.rates[k])),fxDc=x=>x>=10000?num(Math.round(x)):dec(x,2);let FXMODE="buy",FXGRP="all",FXALL=false;
const FXM_RU=["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],FXM_KK=["қаң","ақп","нау","сәу","мам","мау","шіл","там","қыр","қаз","қар","жел"];
const FXN={1:["Налоговые платежи и расчеты после праздников","Мерекеден кейінгі салық пен есеп айырысулар"],2:["Спрос на валюту спокойный","Валютаға сұраныс бәсең"],3:["Налоги за год (КПН), дивиденды компаний","Жылдық салықтар (КТС), компаниялар дивидендтері"],4:["Дивиденды иностранных компаний, спрос на валюту","Шетелдік компаниялардың дивидендтері, валютаға сұраныс"],5:["Дивиденды, начало сезона поездок","Дивидендтер, сапар маусымының басы"],6:["Летние поездки, спрос на валюту растет","Жазғы сапарлар, валютаға сұраныс өседі"],7:["Пик отпусков, много покупок валюты","Демалыс шыңы, валюта көп сатып алынады"],8:["Отпуска и подготовка к школе","Демалыс және мектепке дайындық"],9:["Спрос после отпусков спадает","Демалыстан кейін сұраныс бәсеңдейді"],10:["Спокойный период, налоги в конце месяца","Тыныш кезең, ай соңындағы салықтар"],11:["Налоги до 25 числа, затем спрос перед праздниками","25-ке дейін салықтар, содан кейін мерекеге дейінгі сұраныс"],12:["Новый год: поездки и подарки, спрос на валюту высокий","Жаңа жыл: сапарлар мен сыйлықтар, валютаға сұраныс жоғары"]};
const FXF=[["Нефть Brent","Brent мұнайы",["USD"],"dn","Нефть дорожает: в страну приходит больше валюты, тенге крепче, валюта дешевле.","Мұнай қымбаттайды: елге валюта көп келеді, теңге нығаяды, валюта арзандайды."],
 ["Ставка ФРС и сила доллара","ФРЖ мөлшерлемесі және доллар күші",["USD","EUR","GBP","CNY"],"up","Доллар в мире дорожает: курс доллара в тенге обычно растет, а евро, фунт и юань дешевеют относительно доллара.","Әлемде доллар қымбаттайды: доллардың теңгемен бағамы өседі, ал еуро, фунт және юань долларға қатысты арзандайды."],
 ["Рубль и экономика России","Рубль және Ресей экономикасы",["RUB","USD"],"up","Слабый рубль тянет тенге вниз, курс рубля в тенге зависит от российской валюты сильнее всего.","Әлсіз рубль теңгені төмен тартады, рубльдің теңгемен бағамы ресейлік валютаға көбірек байланысты."],
 ["Юань и торговля с Китаем","Юань және Қытаймен сауда",["CNY"],"up","Юань следует за курсом Китая к доллару, торговля с Китаем увеличивает спрос на него.","Юань Қытайдың долларға бағамын ілесе жүреді, Қытаймен сауда оған сұранысты арттырады."],
 ["Налоговые платежи (до 25 числа)","Салық төлемдері (25-ке дейін)",FXK,"dn","Компании продают валюту, чтобы заплатить налоги в тенге: в конце месяца тенге обычно крепче.","Компаниялар салықты теңгемен төлеу үшін валюта сатады: ай соңында теңге әдетте күштірек."],
 ["Дивиденды и вывод прибыли","Дивидендтер және пайданы шығару",FXK,"up","Весной и летом иностранные компании выводят прибыль и покупают валюту: тенге слабеет.","Көктем мен жазда шетелдік компаниялар пайдасын шығарып, валюта сатып алады: теңге әлсірейді."],
 ["Праздники и поездки","Мерекелер мен сапарлар",FXK,"up","В декабре и летом люди чаще покупают валюту, курс в обменниках растет.","Желтоқсан мен жазда адамдар валютаны жиірек сатып алады, айырбастау бағамы өседі."],
 ["Базовая ставка и инфляция","Базалық мөлшерлеме және инфляция",FXK,"dn","Высокая ставка делает тенге выгоднее для хранения, а рост цен в долгую подталкивает курс вверх.","Жоғары мөлшерлеме теңгені сақтауды тиімдірек етеді, ал баға өсуі ұзақ мерзімде бағамды жоғары итереді."],
 ["Продажи валюты Нацбанком","Ұлттық банктің валюта сатуы",["USD"],"dn","Нацбанк и Нацфонд продают валюту на рынке и сглаживают резкие скачки курса.","Ұлттық банк пен Ұлттық қор нарықта валюта сатып, бағамның күрт секірісін тегістейді."]];
const FXGF=[["ФРС и реальные ставки","ФРЖ және нақты мөлшерлемелер","dn","Ставки падают: золото без процента становится выгоднее облигаций, цена растет. Ставки растут: цена обычно давит вниз.","Мөлшерлемелер төмендейді: пайызсыз алтын облигациялардан тиімдірек, баға өседі. Мөлшерлемелер өседі: баға әдетте төмен басылады."],
 ["Сила доллара","Доллар күші","dn","Золото и серебро торгуются в долларах: сильный доллар часто давит на цену металла, слабый поддерживает.","Алтын мен күміс долларда сатылады: күшті доллар металл бағасын төмен басады, әлсіз доллар қолдайды."],
 ["Курс тенге","Теңге бағамы","up","В тенге цена = цена в долларах × курс доллара. Тенге слабеет: слиток в тенге дорожает, даже если мир не менялся.","Теңгемен баға = доллардағы баға × доллар бағамы. Теңге әлсірейді: құйма теңгемен қымбаттайды."],
 ["Геополитика и тревога на рынках","Геосаясат және нарықтағы алаңдаушылық","up","В тревожные времена люди покупают золото как защиту, спрос и цена растут.","Алаңдаулы кезде адамдар алтынды қорғаныс ретінде алады, сұраныс пен баға өседі."],
 ["Покупки центральных банков","Орталық банктер сатып алуы","up","Когда центробанки наращивают запасы золота, это поддерживает цену на горизонте месяцев и лет.","Орталық банктер алтын қорын арттырса, бұл бағаны айлар мен жылдар бойы қолдайды."],
 ["Инфляция","Инфляция","up","Растет инфляция: золото берут как сохранение стоимости, это подтягивает цену.","Инфляция өседі: алтынды құнды сақтау үшін алады, бұл бағаны көтереді."],
 ["Промышленный спрос (серебро)","Өнеркәсіптік сұраныс (күміс)","up","Серебро нужно солнечной энергетике и электронике: рост производства поднимает цену, спад давит.","Күміс күн энергетикасы мен электроникаға керек: өндіріс өссе баға көтеріледі, құласа төмендейді."],
 ["Соотношение золото к серебру","Алтынның күмісге қатынасы","up","Когда серебро сильно дешевле золота по историческим меркам, оно часто догоняет, но может и долго не догонять.","Күміс тарихи тұрғыдан алтыннан әлдеқайда арзан болса, ол жиі қуып жетеді, бірақ ұзақ кешігуі де мүмкін."]];
const FXGM={1:[2,"Китайский Новый год и свадебный сезон в Индии: спрос на металл высокий","Қытай жаңа жылы және Үндістандағы тойлар маусымы: металлға сұраныс жоғары"],2:[2,"Спрос после китайских праздников остается заметным","Қытай мерекесінен кейін сұраныс байқалып тұрады"],3:[1,"Спокойный период","Тыныш кезең"],4:[1,"Спокойный период, в Индии праздники покупок","Тыныш кезең, Үндістанда сатып алу мерекелері"],5:[0,"Затишье, спрос ниже среднего","Бәсең кезең, сұраныс орташадан төмен"],6:[0,"Летнее затишье, цены часто спокойнее","Жазғы бәсеңдік, баға жиі тыныш"],7:[0,"Летнее затишье","Жазғы бәсеңдік"],8:[1,"Спрос начинает расти перед осенью","Күзге дейін сұраныс өсе бастайды"],9:[2,"Осенний рост спроса: праздники в Индии","Күзгі сұраныс өсімі: Үндістандағы мерекелер"],10:[2,"Пик праздничного спроса в Индии, подарки","Үндістандағы мерекелік сұраныс шыңы, сыйлықтар"],11:[2,"Спрос на подарки и слитки перед Новым годом","Жаңа жылға дейінгі сыйлық пен құйма сұранысы"],12:[2,"Подарки и конец года: спрос повышенный","Сыйлықтар және жыл соңы: сұраныс жоғары"]};
function fxSeason(){
  const keys=Object.keys(rates).sort(),by={};
  for(let i=1;i<keys.length;i++){const m=+keys[i].slice(5,7);(by[m]=by[m]||[]).push((rates[keys[i]]/rates[keys[i-1]]-1)*100)}
  const out={};for(let m=1;m<=12;m++){const a=by[m]||[];out[m]=a.length?{v:a.reduce((x,y)=>x+y,0)/a.length,n:a.length}:null}
  return out;
}
function fxStat(cur){
  const h=((window.TM_FX||{}).nbk||{})[cur]||[];if(h.length<10)return null;
  const v=h.map(x=>x[1]),last=v[v.length-1],mn=Math.min(...v),mx=Math.max(...v),avg=v.reduce((a,b)=>a+b,0)/v.length,p30=v[Math.max(0,v.length-31)];
  return {last,mn,mx,avg,ch:(last/p30-1)*100,pos:mx>mn?(last-mn)/(mx-mn):.5,h};
}
function fxChart(h){
  const W=640,H=190,P=34,v=h.map(x=>x[1]),mn=Math.min(...v),mx=Math.max(...v),r=(mx-mn)||1;
  const X=i=>P+i*(W-P-8)/(h.length-1),Y=x=>H-22-(x-mn)/r*(H-44);
  const pts=h.map((p,i)=>X(i).toFixed(1)+","+Y(p[1]).toFixed(1)).join(" ");
  const dec2=x=>x<20?x.toFixed(2):x.toFixed(1);
  return '<svg class="fxch" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+t("График официального курса за 90 дней","90 күндегі ресми бағам графигі")+'"><line x1="'+P+'" x2="'+(W-8)+'" y1="'+Y(mx)+'" y2="'+Y(mx)+'" class="gl"/><line x1="'+P+'" x2="'+(W-8)+'" y1="'+Y(mn)+'" y2="'+Y(mn)+'" class="gl"/>'+
   '<polyline points="'+pts+'" fill="none" stroke="var(--time)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+X(h.length-1)+'" cy="'+Y(v[v.length-1])+'" r="4.5" fill="var(--time)" stroke="var(--card)" stroke-width="2"/>'+
   '<text x="'+P+'" y="'+(Y(mx)-5)+'" class="gt">'+t("макс ","макс ")+dec2(mx)+'</text><text x="'+(P+90)+'" y="'+(Y(mn)+14)+'" class="gt">'+t("мин ","мин ")+dec2(mn)+'</text>'+
   '<text x="'+P+'" y="'+(H-2)+'" class="gt">'+h[0][0].slice(5).split("-").reverse().join(".")+'</text><text x="'+(W-8)+'" y="'+(H-2)+'" text-anchor="end" class="gt">'+h[h.length-1][0].slice(5).split("-").reverse().join(".")+'</text></svg>';
}
function fxTop(){
  const E=fxList("USD");if(!E.length)return"";
  return '<section class="fxtop"><div class="hsec"><h2>'+t("Где выгодно брать и продавать валюту и металлы сейчас","Валюта мен металдарды қазір қайдан алған және сатқан тиімді")+'</h2><span class="mut">'+t("Лучшие предложения среди обменников Алматы и банков","Алматы айырбастау пункттері мен банктер арасындағы үздік ұсыныстар")+'</span></div><div class="fxtg">'+fxAvail().map(k=>{
    const L=fxList(k).filter(e=>e.rates&&e.rates[k]);if(!L.length)return"";
    const b=L.slice().sort((a,c)=>a.rates[k][1]-c.rates[k][1])[0],s=L.slice().sort((a,c)=>c.rates[k][0]-a.rates[k][0])[0],st=fxStat(k);
    const row=(lab,e,v,cls)=>'<div class="fxo '+cls+'"><div><small>'+lab+'</small><b>'+fxDc(v)+' ₸</b><span>'+esc(e.name)+'</span></div><a class="fxgo" href="'+esc(e.url)+'" target="_blank" rel="noopener noreferrer">'+t("Сайт","Сайт")+' ↗</a></div>';
    return '<article class="card fxcard"><a class="fxh" href="#/currency/'+k+'"><span class="fxs">'+FXC[k].s+'</span><b>'+t(FXC[k].n[0],FXC[k].n[1])+'</b>'+(st?'<span class="mut">'+t("НБ ","ҰБ ")+fxDc(st.last)+' ₸'+(isM(k)?t("/г","/г"):'')+'</span>':'')+'</a>'+
      row(t("Купить дешевле всего","Ең арзан сатып алу"),b,b.rates[k][1],"buy")+row(t("Продать дороже всего","Ең қымбат сату"),s,s.rates[k][0],"sell")+'</article>'}).join("")+'</div></section>';
}

function fxPage(cur){
  const FX=window.TM_FX,AV=fxAvail();
  if(!AV.length){app.innerHTML=crumbs([[HOME(),"#/"],[t("Валюта и металлы","Валюта және металдар")]])+'<h1>'+t("Валюта и металлы","Валюта және металдар")+'</h1><div class="card"><p class="lead" style="margin:0">'+t("Курсы появятся после первого сбора данных. Он запускается каждое утро.","Бағамдар деректерді алғашқы жинаудан кейін пайда болады. Ол күн сайын таңертең іске қосылады.")+'</p></div>'+FOOT();return}
  if(!FX||!FXC[cur]||!AV.includes(cur))cur=AV[0];const M=isM(cur);
  const C=FXC[cur],MN=LANG==="kk"?FXM_KK:FXM_RU,dc=fxDc,U=M?t("г","г"):cur;
  const st=fxStat(cur),exAll=fxList(cur).filter(e=>e.rates&&e.rates[cur]),ex=exAll.filter(e=>FXGRP=="all"||(e.type||"exchanger")===FXGRP);
  let mode=FXMODE,amt=M?10:1000,showAll=FXALL;
  const bestBuy=()=>ex.slice().sort((a,b)=>a.rates[cur][1]-b.rates[cur][1])[0],bestSell=()=>ex.slice().sort((a,b)=>b.rates[cur][0]-a.rates[cur][0])[0];
  const tabs='<div class="fxt" role="tablist">'+FXK.map(k=>{const s=fxStat(k);return '<a role="tab" aria-selected="'+(k===cur)+'" class="'+(k===cur?"on":"")+'" href="#/currency/'+k+'"><span class="fxs">'+FXC[k].s+'</span><b>'+t(FXC[k].n[0],FXC[k].n[1])+'</b>'+(s?'<span>'+dc(s.last)+' ₸</span><em class="'+(s.ch>0?"up":"dn")+'">'+f1(s.ch)+'</em>':'')+'</a>'}).join("")+'</div>';
  const seas=fxSeason(),now=new Date(TODAY+"T00:00:00"),m0=now.getMonth()+1;
  const next=[];for(let i=0;i<6;i++){const m=((m0-1+i)%12)+1;next.push([m,seas[m]])}
  const maxA=Math.max(1,...Object.values(seas).filter(Boolean).map(x=>Math.abs(x.v)));
  const nm=seas[(m0%12)+1];
  let verdict="",vt="mid";
  if(st){
    if(st.pos<.33){vt="buy";verdict=t("Курс в нижней трети диапазона за 3 месяца: покупать сейчас выгоднее, чем в среднем за этот период.","Бағам 3 айлық диапазонның төменгі үштен бірінде: қазір сатып алу осы кезеңдегі орташадан тиімді.")}
    else if(st.pos>.66){vt="sell";verdict=t("Курс в верхней трети диапазона за 3 месяца: продавать сейчас выгоднее, а покупку лучше отложить.","Бағам 3 айлық диапазонның жоғарғы үштен бірінде: қазір сату тиімдірек, ал сатып алуды кейінге қалдырған жөн.")}
    else verdict=t("Курс в середине диапазона за 3 месяца: явного преимущества для покупки или продажи нет.","Бағам 3 айлық диапазонның ортасында: сатып алу немесе сату үшін айқын артықшылық жоқ.");
  }
  const seasNote=nm?(nm.v>.8?t("По прошлым годам в следующем месяце доллар обычно дорожает (в среднем "+f1(nm.v)+"), поэтому покупку лучше не откладывать.","Алдыңғы жылдары келесі айда доллар әдетте қымбаттайды (орта есеппен "+f1(nm.v)+"), сондықтан сатып алуды кейінге қалдырмаған жөн."):nm.v<-.8?t("По прошлым годам в следующем месяце доллар обычно дешевеет (в среднем "+f1(nm.v)+"), покупку можно отложить.","Алдыңғы жылдары келесі айда доллар әдетте арзандайды (орта есеппен "+f1(nm.v)+"), сатып алуды кейінге қалдыруға болады."):t("По прошлым годам следующий месяц обычно проходит без сильных движений.","Алдыңғы жылдары келесі ай әдетте күрт қозғалыссыз өтеді.")):"";
  function tbl(){
    const rows=ex.slice().sort((a,b)=>mode==="buy"?a.rates[cur][1]-b.rates[cur][1]:b.rates[cur][0]-a.rates[cur][0]);
    const bi=mode==="buy"?0:0,best=rows[0];
    const val=e=>mode==="buy"?e.rates[cur][1]:e.rates[cur][0];
    const worst=rows[rows.length-1];
    return rows.slice(0,showAll?999:10).map((e,i)=>{const r=e.rates[cur],v=val(e),diff=st?(v/st.last-1)*100:0,tot=amt*v,sav=Math.abs(val(best)-v)*amt;
      return '<tr class="'+(i===0?"best":"")+'"><td class="fxn"><span class="rk">'+(i+1)+'</span><div><b>'+esc(e.name)+'</b> <span class="tb">'+((e.type||"exchanger")==="bank"?t("Банк","Банк"):t("Обменник","Айырбастау"))+'</span><small>'+esc(e.addr)+'</small></div></td>'+
      '<td class="fxr'+(mode==="sell"?" hot":"")+'">'+dc(r[0])+'</td><td class="fxr'+(mode==="buy"?" hot":"")+'">'+dc(r[1])+'</td>'+
      '<td class="fxd">'+(st?'<em class="'+(diff>0?"up":"dn")+'">'+f1(diff)+'</em>':'')+'</td><td class="fxtot">'+num(Math.round(tot))+' ₸'+(i>0?(sav>=1?'<small>'+(mode==="buy"?'+':'−')+num(Math.round(sav))+' ₸ '+t("к лучшему","үздікке қарағанда")+'</small>':''):'<small class="ok">'+t("лучший вариант","үздік нұсқа")+'</small>')+'</td>'+
      '<td class="fxu">'+esc(e.upd.slice(11))+'</td><td><a class="fxgo'+(i===0?" pri":"")+'" href="'+esc(e.url)+'" target="_blank" rel="noopener noreferrer">'+t("Сайт","Сайт")+' ↗</a></td></tr>'}).join("");
  }
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Валюта и металлы","Валюта және металдар")]])+
   '<h1>'+t("Валюта и металлы в Алматы","Алматыдағы валюта және металдар")+'</h1><p class="sub">'+t("Сравниваем обменники и банки: валюты, золото и серебро. Показываем, где выгоднее купить и продать. Данные Нацбанка на ","Айырбастау пункттері мен банктерді салыстырамыз: валюта, алтын және күміс. Қайда сатып алу және сату тиімді екенін көрсетеміз. Ұлттық банк деректері: ")+esc(FX&&FX.updated||TODAY)+'.</p>'+
   (FX&&FX.demo?'<div class="demo">'+t("Демо-данные: обменники и курсы на странице выдуманы для макета. Реальные появятся после подключения источника.","Демо-деректер: беттегі айырбастау пункттері мен бағамдар макет үшін ойдан шығарылған. Нақтылары дереккөз қосылғаннан кейін шығады.")+'</div>':'')+
   '<section class="card fxpick" id="fxp"><div class="fxq"><span class="ql">'+t("1. Что хотите сделать","1. Не істегіңіз келеді")+'</span><div class="seg big" id="fxm"><button data-m="buy" class="'+(mode==="buy"?"on":"")+'">'+t("Хочу купить","Сатып алғым келеді")+'</button><button data-m="sell" class="'+(mode==="sell"?"on":"")+'">'+t("Хочу продать","Сатқым келеді")+'</button></div></div>'+
    '<div class="fxq"><span class="ql">'+t("2. Выберите валюту или металл","2. Валюта немесе металды таңдаңыз")+'</span><div class="fxt" role="tablist">'+fxAvail().map(k=>{const s2=fxStat(k);return '<button type="button" role="tab" aria-selected="'+(k===cur)+'" class="'+(k===cur?"on":"")+'" data-c="'+k+'"><span class="fxs">'+FXC[k].s+'</span><b>'+t(FXC[k].n[0],FXC[k].n[1])+'</b>'+(s2?'<span>'+dc(s2.last)+' ₸</span>':'')+'</button>'}).join("")+'</div></div>'+
    '<div class="fxq"><span class="ql">'+t("3. Где","3. Қайда")+'</span><div class="seg" id="fxg">'+[["all",t("Все","Барлығы")],["exchanger",t("Обменники","Айырбастау")],["bank",t("Банки","Банктер")]].map(g=>'<button data-g="'+g[0]+'" class="'+(FXGRP===g[0]?"on":"")+'">'+g[1]+' <small>'+(g[0]==="all"?exAll.length:exAll.filter(e=>(e.type||"exchanger")===g[0]).length)+'</small></button>').join("")+(M?'<button disabled class="soonb2" title="'+t("Скоро: б/у золото","Жақында: қолданыстағы алтын")+'">'+t("Ломбарды","Ломбардтар")+' <small>'+t("скоро","жақында")+'</small></button>':'')+'</div></div>'+
    '<div class="fxq"><span class="ql">'+t("4. Где выгоднее всего","4. Қайда ең тиімді")+': '+(mode==="buy"?t("купить ","сатып алу ")+(M?t(C.n[0],C.n[1]).toLowerCase():cur):t("продать ","сату ")+(M?t(C.n[0],C.n[1]).toLowerCase():cur))+(st?' <span class="mut">· '+t("цена Нацбанка ","ҰБ бағасы ")+dc(st.last)+' ₸'+(M?t(" за 1 г"," 1 г үшін"):"")+', <em class="'+(st.ch>0?"up":"dn")+'">'+f1(st.ch)+'</em> '+t("за 30 дней","30 күнде")+'</span>':'')+'</span>'+
    '<div class="fxt3">'+ex.slice().sort((x,y)=>mode==="buy"?x.rates[cur][1]-y.rates[cur][1]:y.rates[cur][0]-x.rates[cur][0]).slice(0,3).map((e,i)=>{const v=mode==="buy"?e.rates[cur][1]:e.rates[cur][0];return '<div class="fxo3'+(i===0?" first":"")+'"><span class="rk">'+(i+1)+'</span><div class="o3n"><b>'+esc(e.name)+'</b><small>'+esc(e.addr)+'</small></div><div class="o3p"><b>'+dc(v)+' ₸</b><small>'+(mode==="buy"?t("за 1 ","1 ")+U:t("за 1 ","1 ")+U)+' · '+t("разница ","айырма ")+f1((e.rates[cur][1]/e.rates[cur][0]-1)*100).replace('+','')+'</small></div><a class="fxgo'+(i===0?" pri":"")+'" href="'+esc(e.url)+'" target="_blank" rel="noopener noreferrer">'+t("Сайт","Сайт")+' ↗</a></div>'}).join("")+'</div></div></section>'+
   '<div class="card fxbox"><div class="fxtool"><h2 style="margin:0;font-size:18px">'+(M?t("Все банки","Барлық банктер"):t("Все обменники","Барлық айырбастау пункттері"))+'</h2>'+
   '<label class="fxamt">'+t("Количество","Мөлшері")+', '+U+' <input id="fxa" inputmode="numeric" value="'+amt+'" aria-label="'+t("Сумма в валюте","Валюта сомасы")+'"></label></div>'+
   '<div class="fxwrap"><table class="fxtb"><thead><tr><th>'+(M?t("Банк","Банк"):t("Обменник","Айырбастау пункті"))+'</th><th>'+(M?t("Выкупает у вас","Сізден сатып алады"):t("Покупает у вас","Сізден сатып алады"))+'</th><th>'+t("Продает вам","Сізге сатады")+'</th><th>'+t("К курсу НБ","ҰБ бағамына")+'</th><th id="fxth">'+t("Вы заплатите","Сіз төлейсіз")+'</th><th>'+t("Обновлен","Жаңартылды")+'</th><th></th></tr></thead><tbody id="fxb"></tbody></table></div>'+
   (ex.length>10&&!showAll?'<button type="button" class="fxmore" id="fxmore">'+t("Показать все ("+ex.length+")","Барлығын көрсету ("+ex.length+")")+'</button>':'')+'<p class="mut fxnote">'+t("Источники: ifin.kz, сайт ЦентрКредит. ","Дереккөздер: ifin.kz, ЦентрКредит сайты. ")+t("Курсы обменников меняются в течение дня, перед визитом проверьте на сайте. Мы не проводим операции, только сравниваем.","Айырбастау пункттерінің бағамы күн ішінде өзгереді, барар алдында сайтта тексеріңіз. Біз операция жасамаймыз, тек салыстырамыз.")+'</p></div>'+
   '<h2>'+(M?t("Когда цена может вырасти: ","Баға қашан өсуі мүмкін: "):t("Когда курс может вырасти: ","Бағам қашан өсуі мүмкін: "))+t(FXC[cur].n[0],FXC[cur].n[1])+'</h2>'+
   '<div class="fxan">'+
    '<div class="card"><h3>'+t("Что показывают цифры сейчас","Қазір сандар не көрсетеді")+'</h3>'+(st?'<div class="chrt">'+fxChart(st.h)+'</div><div class="fxv '+vt+'"><b>'+(vt==="buy"?t("Для покупки момент удачный","Сатып алуға сәті түсті"):vt==="sell"?t("Для продажи момент удачный","Сатуға сәті түсті"):t("Ждать или нет: без явного перекоса","Күту керек пе: айқын ауытқу жоқ"))+'</b><span>'+verdict+'</span>'+(cur==="USD"&&seasNote?'<span>'+seasNote+'</span>':'')+'</div>':'<p class="mut">'+t("История цен копится с первого сбора, график и вывод появятся через несколько дней."+(cur==="XAG"?" Для серебра это цены ЦентрКредит, официальной цены Нацбанка нет.":""),"Баға тарихы алғашқы жинаудан бастап жиналады, график пен қорытынды бірнеше күннен кейін пайда болады.")+'</p>')+'</div>'+
(M?'<div class="card"><h3>'+t("Сезонность спроса по месяцам","Айлар бойынша сұраныс маусымдылығы")+'</h3><p class="mut" style="margin:0 0 10px">'+t("Когда спрос на золото и серебро обычно выше или ниже. Это типичная картина, а не расчет по данным сайта.","Алтын мен күмістің сұранысы қашан әдетте жоғары немесе төмен. Бұл типтік көрініс, сайт деректері бойынша есеп емес.")+'</p><div class="fxs12 mt">'+
     [1,2,3,4,5,6,7,8,9,10,11,12].map(m=>{const lv=FXGM[m][0];return '<div class="mo'+(m===m0?" cur":"")+'"><div class="bw lv"><i class="l'+lv+'" style="height:'+(18+lv*26)+'px"></i></div><b>'+[t("низкий","төмен"),t("средний","орташа"),t("высокий","жоғары")][lv]+'</b><small>'+MN[m-1]+'</small></div>'}).join("")+'</div><p class="mut" style="margin:8px 0 0">'+t("Высокий спрос чаще поднимает цену, летнее затишье чаще спокойнее. Это ориентир, а не правило.","Жоғары сұраныс бағаны жиі көтереді, жазғы бәсеңдік жиі тыныш. Бұл бағдар, ереже емес.")+'</p></div>':'<div class="card"><h3>'+t(cur==="USD"?"Сезонность доллара по месяцам":"Сезонность доллара (ориентир и для этой валюты)","Доллардың айлар бойынша маусымдылығы")+'</h3><p class="mut" style="margin:0 0 10px">'+t("Средний сдвиг среднемесячного курса к прошлому месяцу за "+(Object.keys(rates).length)+" мес. наблюдений.","Бақылаудың "+(Object.keys(rates).length)+" айындағы өткен айға қатысты орташа айлық бағам өзгерісі.")+'</p><div class="fxs12">'+
     [1,2,3,4,5,6,7,8,9,10,11,12].map(m=>{const x=seas[m],h=x?Math.min(46,Math.abs(x.v)/maxA*46):0;return '<div class="mo'+(m===m0?" cur":"")+'"><div class="bw">'+(x?'<i class="'+(x.v>=0?"up":"dn")+'" style="height:'+h+'px;'+(x.v>=0?"bottom:50%":"top:50%")+'"></i>':'')+'</div><b>'+(x?f1(x.v):"")+'</b><small>'+MN[m-1]+'</small></div>'}).join("")+'</div><p class="mut" style="margin:8px 0 0">'+t("Красное: доллар обычно дорожает, зеленое: дешевеет. Данных мало (2-3 года), это ориентир, а не правило.","Қызыл: доллар әдетте қымбаттайды, жасыл: арзандайды. Деректер аз (2-3 жыл), бұл бағдар, ереже емес.")+'</p></div>')+'</div>'+
   '<h3 class="fxh3">'+t("Ближайшие 6 месяцев","Алдағы 6 ай")+'</h3><div class="fxcal">'+next.map(([m,x])=>'<div class="card"><b>'+MN[m-1]+'</b><span class="mut">'+(M?t(FXGM[m][1],FXGM[m][2]):t(FXN[m][0],FXN[m][1]))+'</span>'+(M?'<em class="'+(FXGM[m][0]===2?"up":FXGM[m][0]===0?"dn":"")+'">'+t("спрос ","сұраныс ")+[t("ниже среднего","орташадан төмен"),t("средний","орташа"),t("выше среднего","орташадан жоғары")][FXGM[m][0]]+'</em>':x?'<em class="'+(x.v>=0?"up":"dn")+'">'+t("в прошлые годы ","өткен жылдары ")+f1(x.v)+'</em>':'')+'</div>').join("")+'</div>'+
   '<h3 class="fxh3">'+t(M?"Что влияет на цену":"Что влияет на курс",M?"Бағаға не әсер етеді":"Бағамға не әсер етеді")+'</h3><div class="fxfac">'+(M?FXGF.map(f=>'<div class="card'+(f[0].includes("серебр")&&cur==="XAU"?" dim":"")+'"><div class="fh"><b>'+t(f[0],f[1])+'</b><span class="ar '+f[2]+'">'+(f[2]==="up"?t("цена вверх","баға жоғары"):t("цена вниз","баға төмен"))+'</span></div><p>'+t(f[3],f[4])+'</p></div>'):FXF.map(f=>'<div class="card'+(f[2].includes(cur)?"":" dim")+'"><div class="fh"><b>'+t(f[0],f[1])+'</b><span class="ar '+f[3]+'">'+(f[3]==="up"?t("курс вверх","бағам жоғары"):t("курс вниз","бағам төмен"))+'</span></div><p>'+t(f[4],f[5])+'</p></div>')).join("")+'</div>'+
   '<p class="mut fxdis">'+t("Это ориентир по прошлым данным и типичным причинам, а не обещание и не финансовый совет. Курс может пойти в другую сторону из-за событий, которые заранее не видны.","Бұл өткен деректер мен әдеттегі себептерге негізделген бағдар, уәде де, қаржылық кеңес те емес. Бағам алдын ала көрінбейтін оқиғаларға байланысты басқа бағытқа кетуі мүмкін.")+'</p>'+FOOT();
  const draw=()=>{document.getElementById("fxb").innerHTML=tbl();document.getElementById("fxth").textContent=mode==="buy"?t("Вы заплатите","Сіз төлейсіз"):t("Вы получите","Сіз аласыз")};
  draw();
  document.getElementById("fxp").onclick=e=>{const m=e.target.closest("[data-m]"),c=e.target.closest("[data-c]");
    const g=e.target.closest("[data-g]");
    if(g){FXGRP=g.dataset.g;FXALL=false;const y=window.scrollY;fxPage(cur);window.scrollTo(0,y);return}
    if(m){FXMODE=m.dataset.m;const y=window.scrollY;fxPage(cur);window.scrollTo(0,y)}
    else if(c){FXALL=false;history.replaceState(null,"","#/currency/"+c.dataset.c);const y=window.scrollY;fxPage(c.dataset.c);window.scrollTo(0,y)}};
  const mo=document.getElementById("fxmore");if(mo)mo.onclick=()=>{FXALL=true;const y=window.scrollY;fxPage(cur);window.scrollTo(0,y)};
  document.getElementById("fxa").oninput=e=>{amt=parseInt(String(e.target.value).replace(/\D/g,""),10)||0;draw()};
  onSearch=()=>{};onEnter=()=>{location.hash="#/smartphones"};
}

// ---------- квартиры ----------
const APT=()=>window.TM_APT||{developers:[],complexes:[]};
const mln=x=>(x/1e6).toFixed(1).replace(".",",")+" "+t("млн ₸","млн ₸");
const aptMonthly=(P,rate,years)=>{const r=rate/1200,n=years*12;return P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)};
let APT_DIST="all",APT_DEV="all",APT_AREA=50,APT_CLS="all",APT_SORT="m2",APT_ONLY=new Set();
const CLSN={comfort:["Комфорт","Комфорт"],business:["Бизнес","Бизнес"]};
function aptTop(list){
  const A=APT(),cs=list||A.complexes,dn=id=>(A.developers.find(d=>d.id===id)||{}).name||id;
  if(!cs.length)return"";
  const cheap=cs.slice().sort((a,b)=>a.m2-b.m2)[0];
  const lowDown=cs.filter(c=>c.mort).sort((a,b)=>a.mort.pct-b.mort.pct||a.m2-b.m2)[0];
  const longInst=cs.filter(c=>c.inst).sort((a,b)=>b.inst.months-a.inst.months||a.m2-b.m2)[0];
  const soon=cs.filter(c=>c.status==="done"||c.first[0]<=2026).sort((a,b)=>a.m2-b.m2)[0];
  const card=(tt,c,line,ic)=>c?'<a class="card apt3" href="#/apartments"><span class="a3i">'+ic+'</span><small>'+tt+'</small><em>'+line+'</em><b>'+esc(c.name)+'</b><span class="mut">'+esc(dn(c.dev))+'</span></a>':"";
  return '<div class="apt3r">'+card(t("Самая низкая цена за м²","Ең төмен баға (м²)"),cheap,num(cheap.m2)+' ₸/м²',"₸")+
   card(t("Самый маленький первый взнос","Ең аз алғашқы жарна"),lowDown,t("от ","бастап ")+(lowDown&&lowDown.mort.pct)+'% '+t("по ипотеке","ипотека бойынша"),"%")+
   card(t("Самая длинная рассрочка","Ең ұзақ бөліп төлеу"),longInst,(longInst&&longInst.inst.pct)+'% '+t("взнос, ","жарна, ")+(longInst&&longInst.inst.months)+' '+t("мес","ай"),"◷")+
   card(t("Скоро сдача или уже сдан","Жақында тапсырылады немесе тапсырылған"),soon,soon?(soon.status==="done"?t("Сдан","Тапсырылған"):soon.delivery[0]):"","⌂")+'</div>';
}
function aptArt(c){
  let h=0;for(const ch of c.id)h=(h*31+ch.charCodeAt(0))>>>0;
  const rnd=()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296};
  const biz=c.cls==="business",done=c.status==="done",dev=c.dev==="bi";
  const sky=done?["#cfe3ff","#f5f9ff"]:biz?["#1d2a5c","#4b5fb0"]:["#1f6f72","#6fc3b8"];
  const wall=biz?["#2a3a7a","#3b4f9e"]:["#2e8f8c","#4fb3ac"],win=done?"#ffe9a8":"#ffd978";
  let g='<svg class="aart" viewBox="0 0 560 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="sk'+c.id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sky[0]+'"/><stop offset="1" stop-color="'+sky[1]+'"/></linearGradient></defs><rect width="560" height="150" fill="url(#sk'+c.id+')"/>';
  if(!done)g+='<circle cx="'+(440+rnd()*80)+'" cy="34" r="14" fill="#fff" opacity=".18"/>';
  let x=18;
  for(let i=0;x<500;i++){
    const w=52+Math.floor(rnd()*26),ht=54+Math.floor(rnd()*58),y=132-ht;
    g+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+ht+'" rx="3" fill="'+(i%2?wall[1]:wall[0])+'"/>';
    for(let r=0;r<Math.floor(ht/14)-0;r++)for(let k=0;k<Math.floor(w/13);k++){
      const on=rnd()>.42;g+='<rect x="'+(x+6+k*13)+'" y="'+(y+8+r*14)+'" width="7" height="8" rx="1.5" fill="'+(on?win:"rgba(255,255,255,.14)")+'"/>'}
    if(!done&&i===0){g+='<path d="M'+(x+w-10)+' '+y+'V'+(y-34)+'M'+(x+w-30)+' '+(y-30)+'H'+(x+w+30)+'M'+(x+w-10)+' '+(y-30)+'L'+(x+w+22)+' '+(y-30)+'V'+(y-14)+'" stroke="#f4a300" stroke-width="2.4" fill="none" stroke-linecap="round"/>'}
    x+=w+8+Math.floor(rnd()*10);
  }
  g+='<rect y="132" width="560" height="18" fill="'+(done?"#b8c9a8":"#0f1630")+'" opacity="'+(done?".9":".55")+'"/></svg>';
  return g;
}
function aptCard(c){
  const A=APT(),dev=A.developers.find(d=>d.id===c.dev)||{name:c.dev},P=c.m2*APT_AREA,mn=t("мес","ай");
  const kf=(lab,val,sub,off)=>'<div class="kf'+(off?" off":"")+'"><small>'+lab+'</small><b>'+val+'</b><span>'+sub+'</span></div>';
  const mortPay=c.mort?Math.round(aptMonthly(P*(1-c.mort.pct/100),c.mort.rate,c.mort.years)/1000)*1000:0;
  const instPay=c.inst?Math.round(P*(1-c.inst.pct/100)/c.inst.months/1000)*1000:0;
  const keys=kf(t("Ипотека","Ипотека"),c.mort?t("от ","бастап ")+c.mort.pct+'%':t("нет данных","дерек жоқ"),c.mort?c.mort.rate+'% · '+c.mort.years+' '+t("лет","жыл"):t("уточняйте","нақтылаңыз"),!c.mort)+
   kf(t("Рассрочка","Бөліп төлеу"),c.inst?c.inst.pct+'%':t("нет данных","дерек жоқ"),c.inst?c.inst.months+' '+mn:t("уточняйте","нақтылаңыз"),!c.inst)+
   kf(t("Сдача","Тапсыру"),c.status==="done"?t("Сдан","Тапсырылған"):c.delivery[0].split(": ").pop(),c.status==="done"?"":(c.delivery.length>1?c.delivery.length+" "+t("очереди","кезек"):t("одна очередь","бір кезек")));
  const pay=(c.mort||c.inst)?'<div class="apay">'+(c.mort?'<div><small>'+t("Ипотека, взнос ≈ ","Ипотека, жарна ≈ ")+mln(P*c.mort.pct/100)+'</small><b>≈ '+num(mortPay)+' ₸/'+mn+'</b></div>':'')+(c.inst?'<div><small>'+t("Рассрочка, взнос ≈ ","Бөліп төлеу, жарна ≈ ")+mln(P*c.inst.pct/100)+'</small><b>≈ '+num(instPay)+' ₸/'+mn+'</b></div>':'')+'</div>':'<p class="mut anone">'+t("Условия взноса и рассрочки не указаны, уточняйте у застройщика.","Жарна мен бөліп төлеу шарттары көрсетілмеген, құрылысшыдан нақтылаңыз.")+'</p>';
  const sale=c.units[0]&&c.units[1]?'<div class="abar"><div><i style="width:'+Math.round(c.units[1]/c.units[0]*100)+'%"></i></div><span>'+t("в продаже ","сатылымда ")+c.units[1]+' '+t("из ","/ ")+c.units[0]+'</span></div>':(c.units[0]?'<div class="abar"><span>'+t("Квартир: ","Пәтер: ")+c.units[0]+'</span></div>':'');
  return '<article class="card aptc"><div class="aimg">'+aptArt(c)+(c.img?'<img class="aphoto" src="'+esc(c.img)+'" alt="'+esc(c.name)+'" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'<span class="adev2 '+c.dev+'">'+esc(dev.name)+'</span><div class="atag"><span class="cl '+c.cls+'">'+t(CLSN[c.cls][0],CLSN[c.cls][1])+'</span><span class="st '+c.status+'">'+(c.status==="done"?t("Сдан","Тапсырылған"):t("Строится","Салынуда"))+'</span></div></div>'+
   '<div class="abody"><h3>'+esc(c.name)+'</h3><small class="mut">'+esc(c.district)+'</small>'+
   '<div class="ap"><div><small>'+(c.resale?t("от (не от застройщика)","бастап (құрылысшыдан емес)"):t("Цена от","Бағасы бастап"))+'</small><b>'+num(c.m2)+' ₸<i>/м²</i></b></div><div><small>'+APT_AREA+' м² '+t("от","бастап")+'</small><b>≈ '+mln(P)+'</b></div></div>'+
   '<div class="akf">'+keys+'</div>'+pay+
   (c.promos.length?'<div class="ach">'+c.promos.map(p=>'<span class="pr">'+esc(p)+'</span>').join("")+'</div>':'')+
   '<details class="adet"><summary>'+t("Все очереди сдачи","Барлық тапсыру кезеңдері")+'</summary><ul>'+c.delivery.map(d=>'<li>'+esc(d)+'</li>').join("")+'</ul></details>'+sale+
   '<div class="afoot"><span class="mut">'+esc(c.upd)+'</span><span class="afl"><a class="fxgo" href="https://2gis.kz/almaty/search/'+encodeURIComponent(c.name+" ЖК")+'" target="_blank" rel="noopener noreferrer">'+t("На карте","Картада")+' ↗</a><a class="fxgo pri" href="'+esc(c.url)+'" target="_blank" rel="noopener noreferrer">'+t("Подробнее","Толығырақ")+' ↗</a></span></div>'+
   (c.stale?'<p class="mut astale">'+t("Данные могут быть устаревшими: источник не получает подробности от этого застройщика.","Деректер ескірген болуы мүмкін: дереккөз бұл құрылысшыдан толық мәлімет алмайды.")+'</p>':'')+'</div></article>';
}
const DMAP={alatau:{d:"M20 28q0-8 8-8h169q8 0 8 8v109q0 8-8 8H28q-8 0-8-8z",x:112,y:82},zhetysu:{d:"M215 28q0-8 8-8h134q8 0 8 8v79q0 8-8 8H223q-8 0-8-8z",x:290,y:66},turksib:{d:"M375 28q0-8 8-8h149q8 0 8 8v79q0 8-8 8H383q-8 0-8-8z",x:458,y:66},nauryz:{d:"M20 163q0-8 8-8h79q8 0 8 8v159q0 8-8 8H28q-8 0-8-8z",x:68,y:240},auezov:{d:"M125 163q0-8 8-8h104q8 0 8 8v79q0 8-8 8H133q-8 0-8-8z",x:185,y:205},almaly:{d:"M255 133q0-8 8-8h109q8 0 8 8v74q0 8-8 8H263q-8 0-8-8z",x:318,y:170},medeu:{d:"M390 133q0-8 8-8h134q8 0 8 8v124q0 8-8 8H398q-8 0-8-8z",x:465,y:197},bostandyk:{d:"M125 268q0-8 8-8h122v-33q0-8 8-8h109q8 0 8 8v95q0 8-8 8H133q-8 0-8-8z",x:255,y:285}};
function aptLeaf(){
  const el=document.getElementById("lmap");if(!el||!window.L)return;
  const A=APT(),m=L.map(el,{scrollWheelZoom:false}).setView([43.2220,76.8512],11);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© OpenStreetMap"}).addTo(m);
  const b=[];
  A.complexes.filter(c=>c.ll).forEach(c=>{b.push(c.ll);
    const ic=L.divIcon({className:"lpin"+(c.dev==="bazis"?" bz":""),html:"<span>"+Math.round(c.m2/1000)+"k</span>",iconSize:[46,26],iconAnchor:[23,13]});
    L.marker(c.ll,{icon:ic}).addTo(m).bindPopup("<b>"+esc(c.name)+"</b><br>"+esc(c.district||"")+"<br>"+num(c.m2)+" ₸/м²<br><a href=\"https://2gis.kz/almaty/search/"+encodeURIComponent(c.name+" ЖК")+"\" target=\"_blank\" rel=\"noopener noreferrer\">2ГИС</a>")});
  if(b.length>1)m.fitBounds(b,{padding:[30,30]});
}
function aptMap(){
  const A=APT(),dn=id=>{const d=(A.districts||[]).find(x=>x[0]===id);return d?t(d[1],d[2]):id};
  const by={};A.complexes.forEach(c=>{(by[c.dist||"none"]=by[c.dist||"none"]||[]).push(c)});
  let g='<svg class="amap" viewBox="0 0 560 380" role="img" aria-label="'+t("Схема районов Алматы с жилыми комплексами","Алматы аудандарының тұрғын үй кешендерімен сұлбасы")+'"><defs><linearGradient id="mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d3e6"/><stop offset="1" stop-color="#e9edf6"/></linearGradient></defs>';
  g+='<path d="M0 372L40 352 80 366 140 340 190 362 250 336 310 360 370 338 430 362 490 342 560 366V380H0z" fill="url(#mt)"/><text x="280" y="376" text-anchor="middle" class="mtx">'+t("горы, Заилийский Алатау","таулар, Іле Алатауы")+'</text>';
  A.districts.forEach(([id])=>{const m=DMAP[id],n=(by[id]||[]).length;
    g+='<g class="md'+(APT_DIST===id?" on":"")+(n?" has":"")+'" data-dist="'+id+'" tabindex="0" role="button" aria-label="'+esc(dn(id))+', '+n+'"><path d="'+m.d+'"/><text x="'+m.x+'" y="'+(m.y-(n?34:0))+'" text-anchor="middle" class="dn">'+esc(dn(id))+'</text></g>'});
  A.districts.forEach(([id])=>{const m=DMAP[id],L=by[id]||[];
    L.forEach((c,i)=>{const px=m.x+(i-(L.length-1)/2)*(id==='nauryz'?34:52),py=m.y+26,lb=Math.round(c.m2/1000)+"k";
      g+='<g class="pin'+(c.dev==="bazis"?" bz":"")+'" data-pin="'+c.id+'" transform="translate('+px+' '+py+')" tabindex="0" role="button" aria-label="'+esc(c.name)+'"><path d="M0 0c-9-12-14-17-14-24a14 14 0 1 1 28 0c0 7-5 12-14 24z" /><text y="-20" text-anchor="middle">'+lb+'</text><title>'+esc(c.name)+', '+num(c.m2)+' ₸/м²</title></g>'})});
  g+='</svg>';
  const none=by.none||[];
  return '<section class="card amapc"><div class="amh"><div><h2 style="margin:0">'+t("Где находятся ЖК","ТК қайда орналасқан")+'</h2><p class="mut" style="margin:4px 0 0;font-size:13.5px">'+t("Положение меток примерное, точное место смотрите в 2ГИС по кнопке \"На карте\". Метка показывает цену за м² (тыс. ₸). Нажмите на район, чтобы оставить только его ЖК.","Белгілердің орны шамамен, нақты орынды \"Картада\" батырмасы арқылы 2ГИС-тен қараңыз. Белгі м² бағасын көрсетеді (мың ₸). Тек сол аудандағы ТК қалдыру үшін ауданды басыңыз.")+'</p></div>'+(APT_DIST!=="all"?'<button type="button" class="ach2 on" data-dist="all">'+t("Показать все районы","Барлық аудандар")+' ×</button>':'')+'</div>'+
   '<div class="amw">'+(window.L?'<div id="lmap" class="lmap"></div>':g)+'<div class="amside"><div class="amleg"><span class="lg bi"></span>BI Group <span class="lg bz"></span>BAZIS-A</div>'+
   A.districts.filter(d=>(by[d[0]]||[]).length).map(d=>'<button type="button" class="amrow'+(APT_DIST===d[0]?" on":"")+'" data-dist="'+d[0]+'"><b>'+esc(t(d[1],d[2]))+'</b><span>'+by[d[0]].map(c=>esc(c.name)).join(", ")+'</span></button>').join("")+
   (none.length?'<button type="button" class="amrow'+(APT_DIST==="none"?" on":"")+'" data-dist="none"><b>'+t("Район не указан","Аудан көрсетілмеген")+'</b><span>'+none.map(c=>esc(c.name)).join(", ")+'</span></button>':'')+'</div></div></section>';
}

function aptPage(){
  const A=APT();
  if(!A.complexes.length){app.innerHTML=crumbs([[HOME(),"#/"],[t("Квартиры","Пәтерлер")]])+'<h1>'+t("Квартиры","Пәтерлер")+'</h1><div class="card"><p class="lead" style="margin:0">'+t("Данные по жилым комплексам появятся после первого сбора.","Тұрғын үй кешендері бойынша деректер алғашқы жинаудан кейін шығады.")+'</p></div>'+FOOT();return}
  let list=A.complexes.filter(c=>(APT_DEV==="all"||c.dev===APT_DEV)&&(APT_CLS==="all"||c.cls===APT_CLS)&&(APT_DIST==="all"||(APT_DIST==="none"?!c.dist:c.dist===APT_DIST)));
  if(APT_ONLY.has("inst"))list=list.filter(c=>c.inst);
  if(APT_ONLY.has("mort"))list=list.filter(c=>c.mort);
  if(APT_ONLY.has("promo"))list=list.filter(c=>c.promos.length);
  if(APT_ONLY.has("soon"))list=list.filter(c=>c.status==="done"||c.first[0]<=2026);
  list=list.slice().sort((a,b)=>APT_SORT==="m2"?a.m2-b.m2:APT_SORT==="down"?((a.mort?a.mort.pct:99)-(b.mort?b.mort.pct:99)||a.m2-b.m2):(a.first[0]*10+a.first[1])-(b.first[0]*10+b.first[1]));
  const cnt=id=>A.complexes.filter(c=>id==="all"||c.dev===id).length;
  const chip=(k,lab)=>'<button type="button" class="ach2'+(APT_ONLY.has(k)?" on":"")+'" data-o="'+k+'">'+lab+'</button>';
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Квартиры","Пәтерлер")]])+
   '<h1>'+t("Квартиры от застройщиков в Алматы","Алматыдағы құрылысшылардан пәтерлер")+'</h1><p class="sub">'+t("Сравниваем жилые комплексы: цена за м², первый взнос, рассрочка, ипотека, акции и сроки сдачи. Данные krisha.kz и kn.kz на ","Тұрғын үй кешендерін салыстырамыз: м² бағасы, алғашқы жарна, бөліп төлеу, ипотека, акциялар және тапсыру мерзімі. krisha.kz және kn.kz деректері: ")+esc(A.updated)+'.</p>'+
   '<div class="hsec"><h2>'+t("Где выгодно сейчас","Қазір қайда тиімді")+'</h2></div>'+aptTop()+aptMap()+
   '<section class="card aptf" id="aptf"><div class="fxq"><span class="ql">'+t("Застройщик","Құрылысшы")+'</span><div class="seg" id="aptd">'+[["all",t("Все","Барлығы")]].concat(A.developers.map(d=>[d.id,d.name])).map(d=>'<button data-d="'+d[0]+'" class="'+(APT_DEV===d[0]?"on":"")+'">'+esc(d[1])+' <small>'+cnt(d[0])+'</small></button>').join("")+'<button disabled class="soonb2">'+t("Другие","Басқалар")+' <small>'+t("скоро","жақында")+'</small></button></div></div>'+
   '<div class="aptrow"><label class="fxamt">'+t("Площадь квартиры, м²","Пәтер ауданы, м²")+' <input id="apa" inputmode="numeric" value="'+APT_AREA+'"></label>'+
    '<div class="seg" id="aptc">'+[["all",t("Любой класс","Кез келген сынып")],["comfort",t("Комфорт","Комфорт")],["business",t("Бизнес","Бизнес")]].map(x=>'<button data-c="'+x[0]+'" class="'+(APT_CLS===x[0]?"on":"")+'">'+x[1]+'</button>').join("")+'</div>'+
    '<label class="fxamt">'+t("Сначала","Алдымен")+' <select id="aps"><option value="m2"'+(APT_SORT==="m2"?" selected":"")+'>'+t("дешевле","арзан")+'</option><option value="down"'+(APT_SORT==="down"?" selected":"")+'>'+t("меньше взнос","жарна аз")+'</option><option value="date"'+(APT_SORT==="date"?" selected":"")+'>'+t("раньше сдача","ертерек тапсыру")+'</option></select></label></div>'+
   '<div class="ach">'+chip("inst",t("Есть рассрочка","Бөліп төлеу бар"))+chip("mort",t("Ипотека от 20%","Ипотека 20%-дан"))+chip("promo",t("Есть акция","Акция бар"))+chip("soon",t("Сдан или 2026","Тапсырылған немесе 2026"))+'</div></section>'+
   '<p class="mut" style="margin:6px 2px 10px">'+t("Показано ЖК: ","Көрсетілген ТК: ")+list.length+'. '+t("Сумма по площади это оценка по минимальной цене за м² в ЖК, реальная цена зависит от планировки и этажа.","Аудан бойынша сома ТК-дегі м²-дің ең төмен бағасы бойынша бағалау, нақты баға жоспарлау мен қабатқа байланысты.")+'</p>'+
   '<div class="aptg">'+(list.length?list.map(aptCard).join(""):'<div class="card"><p class="lead" style="margin:0">'+t("Ничего не нашли, снимите часть фильтров.","Ештеңе табылмады, кейбір сүзгілерді алып тастаңыз.")+'</p></div>')+'</div>'+
   '<h2>'+t("Условия рассрочки застройщиков","Құрылысшылардың бөліп төлеу шарттары")+'</h2><div class="aptpl">'+A.developers.map(d=>'<div class="card"><h3>'+esc(d.name)+'</h3><p class="mut" style="margin:0 0 8px">'+esc(d.note)+'</p>'+d.plans.map(p=>'<div class="al"><b>'+esc(p[0])+'</b><span>'+esc(p[1])+'</span></div>').join("")+'<p class="mut apromo">'+esc(d.promo)+'</p></div>').join("")+'</div>'+
   '<h2>'+t("Что проверить перед покупкой","Сатып алар алдында не тексеру керек")+'</h2><div class="card"><ul class="achk">'+[t("Цену до акции и итоговую цену за м² после скидки.","Акцияға дейінгі бағаны және жеңілдіктен кейінгі м² бағасын."),t("Действует ли скидка при ипотеке или только при полной оплате.","Жеңілдік ипотекада ма, әлде толық төлемде ғана жұмыс істейді ме."),t("К каким этажам и планировкам привязана скидка.","Жеңілдік қай қабаттар мен жоспарларға байланысты."),t("Есть ли надбавка за рассрочку и какие обязательные доплаты.","Бөліп төлеу үшін үстеме және міндетті қосымша төлемдер бар ма."),t("Срок сдачи очереди и репутацию застройщика, разрешение на строительство.","Кезекті тапсыру мерзімі және құрылысшының беделі, құрылыс рұқсаты.")].map(x=>'<li>'+x+'</li>').join("")+'</ul></div>'+
   '<p class="mut fxdis">'+t("Цены и условия берутся с публичных страниц и могут отличаться от итоговых, уточняйте у застройщика. Это не предложение и не финансовый совет. Платеж по ипотеке и рассрочке приблизительный, без страховок и комиссий.","Бағалар мен шарттар ашық беттерден алынады және соңғысынан өзгеше болуы мүмкін, құрылысшыдан нақтылаңыз. Бұл ұсыныс та, қаржылық кеңес те емес. Ипотека мен бөліп төлеу төлемі шамамен, сақтандыру мен комиссиясыз.")+'</p>'+FOOT();
  const rd=()=>{const y=window.scrollY;aptPage();window.scrollTo(0,y)};
  aptLeaf();
  document.querySelectorAll("[data-dist]").forEach(x=>{const go=()=>{const v=x.dataset.dist;APT_DIST=APT_DIST===v&&v!=="all"?"all":v;rd();const l=document.querySelector(".aptg");if(l)l.scrollIntoView({behavior:"smooth",block:"start"})};x.onclick=go;x.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}}});
  document.querySelectorAll("[data-pin]").forEach(x=>{const go=e=>{e.stopPropagation();const c=APT().complexes.find(q=>q.id===x.dataset.pin);APT_DIST=c&&c.dist?c.dist:"all";APT_DEV="all";rd()};x.onclick=go});
  document.getElementById("aptd").onclick=e=>{const b=e.target.closest("[data-d]");if(b){APT_DEV=b.dataset.d;rd()}};
  document.getElementById("aptc").onclick=e=>{const b=e.target.closest("[data-c]");if(b){APT_CLS=b.dataset.c;rd()}};
  document.getElementById("aps").onchange=e=>{APT_SORT=e.target.value;rd()};
  document.getElementById("apa").onchange=e=>{const v=parseInt(String(e.target.value).replace(/\D/g,""),10);APT_AREA=v>=10&&v<=500?v:50;rd()};
  document.querySelectorAll("#aptf [data-o]").forEach(b=>b.onclick=()=>{const k=b.dataset.o;APT_ONLY.has(k)?APT_ONLY.delete(k):APT_ONLY.add(k);rd()});
  onSearch=()=>{};onEnter=()=>{location.hash="#/smartphones"};
}

function hub(){
  const rk=rateFor(TODAY)[0],rp=rateFor(dstr(TN-30))[0];
  const items=D.families.filter(f=>f.category==="smartphones").map(f=>itemsOf(brandOf(f)).find(x=>x.f===f)).filter(Boolean);
  const sale=CAL().map(c=>({d:dnum(c[0]),t:c[1],s:c[0]})).filter(c=>c.d>=TN&&/пятниц|распрод|жұма|сатылым/i.test(c.t))[0];
  const nBlack=sale?Math.max(0,Math.round(sale.d-TN)):null;
  const series=[];for(let i=0;i<=30;i++)series.push(rateFor(dstr(TN-i))[0]);
  const mn=Math.min(...series),mx=Math.max(...series);
  const nOn=items.filter(x=>x.f.group!=="archive"&&x.best).length;
  const cats=[["phone",t("Телефоны","Телефондар"),t("Цены в магазинах, история и когда брать","Дүкендердегі бағалар, тарих және қашан алу"),"#/smartphones",nOn+" "+t("моделей с ценой","модельдің бағасы бар")],
    ["car",t("Машины","Көліктер"),t("Официальные цены, дилеры Алматы и цены б/у","Ресми бағалар, Алматы дилерлері және қолданылған көлік бағасы"),"#/cars",CARS().brands.length?CARS().brands[0].models.length+" "+t("моделей Toyota","Toyota моделі"):""],
    ["home",t("Квартиры","Пәтерлер"),t("Цена за м², первый взнос, рассрочка и акции от застройщиков","Бір м² бағасы, алғашқы жарна, бөліп төлеу және құрылысшылар акциялары"),"#/apartments",APT().complexes.length?APT().complexes.length+" "+t("ЖК","ТК"):""],
    ["cash",t("Валюта и металлы","Валюта және металдар"),t("Доллар, евро, рубль, юань, фунт, золото, серебро: где выгодно","Доллар, еуро, рубль, юань, фунт, алтын, күміс: қайда тиімді"),"#/currency",fxAvail().length?fxAvail().length+" "+t("позиций","позиция"):t("скоро","жақында")]];
  const soonBox=(ic,name,what,ex)=>'<div class="card hsoon"><span class="ci2">'+sv(ic)+'</span><div><b>'+name+'</b><span>'+what+'</span><em>'+t("Скоро","Жақында")+': '+ex+'</em></div></div>';
  app.innerHTML=
  '<div id="bwrap">'+bannersHtml(sale,nBlack)+'</div>'+
  '<div class="cats" role="list">'+cats.map(c=>c[3]?'<a class="catc on" role="listitem" href="'+c[3]+'"><span class="ci2">'+sv(c[0])+'</span><b>'+c[1]+'</b><small>'+c[2]+'</small><i>'+c[4]+'</i></a>':'<div class="catc" role="listitem"><span class="ci2">'+sv(c[0])+'</span><b>'+c[1]+'</b><small>'+c[2]+'</small><i class="soonb">'+t("скоро","жақында")+'</i></div>').join("")+'</div>'+
  '<div class="hsec"><h2>'+t("Телефоны: где выгодно брать сейчас","Телефондар: қазір қайдан алған тиімді")+'</h2><a class="all" href="#/smartphones">'+t("Все телефоны","Барлық телефондар")+' ›</a></div>'+
  topHtml(items).replace(/<div class="t3h">.*?<\/div>(?=<div class="t3r">)/,"")+
  '<div class="hsec"><h2>'+t("Квартиры: где выгодно сейчас","Пәтерлер: қазір қайда тиімді")+'</h2><a class="all" href="#/apartments">'+t("Все ЖК","Барлық ТК")+' ›</a></div>'+aptTop()+
  fxTop()+
  '<h2>'+t("Как это работает","Бұл қалай жұмыс істейді")+'</h2><div class="trust">'+
   [[t("Надежные магазины","Сенімді дүкендер"),t("Только официальные партнеры, цены берем с их карточек каждый день.","Тек ресми серіктестер, бағаны олардың карточкаларынан күн сайын аламыз.")],
    [t("История цены","Баға тарихы"),t("Видно, что было раньше, а не только скидку на ценнике.","Бұрын не болғаны көрінеді, тек бағалауыштағы жеңілдік емес.")],
    [t("Тенге и доллары","Теңге және доллар"),t("Отличаем настоящее подешевение от скачка курса.","Нағыз арзандауды бағамның секірісінен ажыратамыз.")],
    [t("Когда брать","Қашан алу керек"),t("Календарь распродаж и ориентир по прошлым моделям.","Сатылым күнтізбесі және алдыңғы модельдер бойынша бағдар.")]].map(x=>'<div class="card"><b>'+x[0]+'</b><p>'+x[1]+'</p></div>').join("")+'</div>'+FOOT();
  onSearch=()=>{};onEnter=()=>{location.hash="#/smartphones"};
  tickCd();{const iv2=setInterval(()=>{if(!document.getElementById("btrack")){clearInterval(iv2);return}tickCd()},1000)}
  const bt=document.getElementById("btrack");
  if(bt){let bpause=false;const bstep=d=>{const w=bt.children[0].offsetWidth+14;if(d>0&&bt.scrollLeft+bt.clientWidth>=bt.scrollWidth-6)bt.scrollTo({left:0,behavior:"smooth"});else if(d<0&&bt.scrollLeft<=2)bt.scrollTo({left:bt.scrollWidth,behavior:"smooth"});else bt.scrollBy({left:d*w,behavior:"smooth"})};
    const pv=document.querySelector(".bnr .prev"),nx=document.querySelector(".bnr .next");if(pv)pv.onclick=()=>bstep(-1);if(nx)nx.onclick=()=>bstep(1);
    ["pointerenter","touchstart","focusin"].forEach(ev=>bt.addEventListener(ev,()=>bpause=true,{passive:true}));["pointerleave","touchend","focusout"].forEach(ev=>bt.addEventListener(ev,()=>bpause=false,{passive:true}));
    if(!(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches)){const iv=setInterval(()=>{if(!document.body.contains(bt)){clearInterval(iv);return}if(!bpause&&!document.hidden)bstep(1)},5000)}
    bt.onclick=e=>{if(e.target.closest("[data-go]")){const k=e.target.closest("[data-go]").dataset.go;if(k==="cmp")OPEN_CMP=true;location.hash="#/smartphones"}}}
}
function home(){
  const rk=rateFor(TODAY)[0],rp=rateFor(dstr(TN-30))[0];
  const items=D.families.filter(f=>f.category==="smartphones").map(f=>itemsOf(brandOf(f)).find(x=>x.f===f)).filter(Boolean);
  const cheap=items.filter(x=>x.best&&x.f.group!=="archive").sort((a,b)=>a.best.v-b.best.v)[0];
  const sale=CAL().map(c=>({d:dnum(c[0]),t:c[1],s:c[0]})).filter(c=>c.d>=TN&&/пятниц|распрод|жұма|сатылым/i.test(c.t))[0];
  const SOON=[["car",t("Машины","Көліктер"),t("Сравним цены на Kolesa.kz и у дилеров, покажем, какие модели дешевеют","Kolesa.kz және дилерлердегі бағаларды салыстырамыз, қай модельдер арзандап жатқанын көрсетеміз")],
              ["home",t("Квартиры","Пәтерлер"),t("Цена за метр по районам Алматы и Астаны и как она менялась","Алматы мен Астана аудандары бойынша шаршы метр бағасы және оның өзгеруі")]];
  const soonTag='<i>'+t("скоро","жақында")+'</i>';
  const opts=items.filter(x=>x.f.variants.some(v=>(byVar[v.id]||[]).length)).flatMap(x=>x.f.variants.filter(v=>(byVar[v.id]||[]).length).map(v=>'<option value="'+v.id+'">'+esc(x.f.name)+', '+esc(v.memory)+'</option>')).join("");
  const nBlack=sale?Math.max(0,Math.round(sale.d-TN)):null;
  const brandCnt=b=>items.filter(x=>x.f.group!=="archive"&&brandOf(x.f)===b).length;
  const memAll=[...new Set(items.flatMap(x=>x.f.variants.map(v=>v.memory)))].sort((p,q)=>(memGb({memory:p})||0)-(memGb({memory:q})||0));
  const STN=["iSpace","Sulpak","Mechta","Technodom","Kaspi"];
  const flts='<div class="fg"><b>'+t("Цена, ₸","Баға, ₸")+'</b><div class="fpr"><input id="pmin" inputmode="numeric" placeholder="'+t("от","бастап")+'" aria-label="'+t("Цена от","Бағасы бастап")+'"><i>-</i><input id="pmax" inputmode="numeric" placeholder="'+t("до","дейін")+'" aria-label="'+t("Цена до","Бағасы дейін")+'"></div></div>'+
   '<div class="fg"><b>'+t("Память","Жад")+'</b><div class="fchips">'+memAll.map(m=>'<button type="button" data-fm="'+esc(m)+'">'+esc(m)+'</button>').join("")+'</div></div>'+
   '<div class="fg"><b>'+t("Магазин","Дүкен")+'</b>'+STN.map(n=>'<label class="fc"><input type="checkbox" data-fs="'+n+'"><span>'+n+'</span></label>').join("")+'</div>'+
   '<div class="fg"><b>'+t("Условия","Шарттар")+'</b><label class="fc"><input type="checkbox" id="fin"><span>'+t("Рассрочка 24 мес","24 айға бөліп төлеу")+'</span></label><label class="fc"><input type="checkbox" id="fdr"><span>'+t("Цена ниже пика","Баға шыңнан төмен")+'</span></label></div>'+
   '<button type="button" class="frs" id="frs">'+t("Сбросить фильтры","Сүзгілерді тазалау")+'</button>';
  app.innerHTML=
  '<div id="bwrap">'+bannersHtml(sale,nBlack)+'</div>'+
  '<div class="tick"><span><small>'+t("Доллар","Доллар")+'</small> <b>'+dec(rk,2)+' ₸</b> <em class="'+(rk>rp?"up":"dn")+'">'+f1(pct(rp,rk))+' '+t("за 30 дней","30 күнде")+'</em></span>'+
   (cheap?'<span><small>'+t("Самый дешевый","Ең арзан")+'</small> <b>'+num(cheap.best.v)+' ₸</b> <em>'+esc(cheap.f.name)+', '+esc(sn(cheap.best.s))+'</em></span>':'')+'</div>'+
  topHtml(items)+
  '<div class="brow2" role="group" aria-label="'+t("Бренды","Брендтер")+'"><button type="button" class="bchip ball on" data-b="" aria-pressed="true"><b>'+t("Все бренды","Барлық брендтер")+'</b><small>'+items.filter(x=>x.f.group!=="archive").length+' '+t("моделей","модель")+'</small></button>'+BRANDS.map(b=>'<button type="button" class="bchip" data-b="'+b.id+'" aria-pressed="false">'+brandLogo(b)+'<i class="bck" aria-hidden="true">✓</i><small>'+brandCnt(b.id)+'</small></button>').join("")+'</div>'+
  '<div class="shop"><aside class="flts" id="flts" aria-label="'+t("Фильтры","Сүзгілер")+'">'+flts+'</aside><div class="shopmain">'+
  '<div class="tbar"><h2 style="margin:0">'+t("Телефоны","Телефондар")+' <span class="cnt" id="cnt"></span></h2><div class="tr"><div class="mdl"><button type="button" class="mbtn" id="mbtn" aria-haspopup="true" aria-expanded="false">'+t("Модель","Модель")+' <span class="mc" id="mcnt">'+t("все","барлығы")+'</span><i aria-hidden="true">▾</i></button><div class="mpan" id="mpan" hidden></div></div><button type="button" class="ftog" id="ftog">'+t("Фильтры","Сүзгілер")+'</button><label class="sortl">'+t("Сначала","Алдымен")+' <select id="sort"><option value="pop">'+t("популярные","танымал")+'</option><option value="asc">'+t("дешевле","арзан")+'</option><option value="desc">'+t("дороже","қымбат")+'</option><option value="drop">'+t("цена упала","баға түскен")+'</option></select></label></div></div>'+
  '<div class="seg" id="flt"><button class="on" data-k="all">'+t("Все","Барлығы")+'</button><button data-k="on_sale">'+t("В продаже","Сатылымда")+'</button><button data-k="soon">'+t("Скоро","Жақында")+'</button><button data-k="fav">'+t("Избранное","Таңдаулы")+'&nbsp;<span id="fc">'+FAV.length+'</span></button></div>'+
  '<div id="favtabs" class="ftabs" hidden><button data-f="list">'+t("Выбранные","Таңдалғандар")+'</button><button data-f="cmp">'+t("Сравнение","Салыстыру")+'</button></div><div id="cmpbox" hidden></div><div class="pgrid" id="pg"></div><div id="empty" class="empty" hidden></div></div></div>'+
  '<section class="calc card"><h2 style="margin-top:0">'+t("Вам назвали цену. Это выгодно?","Сізге баға айтты. Бұл тиімді ме?")+'</h2><p class="lead">'+t("Выберите модель и введите цену, мы сравним ее с самой низкой в магазинах и с историей.","Модельді таңдап, бағаны енгізіңіз, біз оны дүкендердегі ең төмен бағамен және тарихпен салыстырамыз.")+'</p>'+
   '<div class="crow"><select id="cm" aria-label="'+t("Модель","Модель")+'">'+opts+'</select><input id="cp" inputmode="numeric" placeholder="'+t("Цена, ₸","Бағасы, ₸")+'" aria-label="'+t("Цена в тенге","Теңгемен баға")+'"><button class="btn" id="cb" style="margin:0">'+t("Проверить","Тексеру")+'</button></div><div id="cr2" aria-live="polite"></div></section>'+
  '<h2>'+t("Что добавим дальше","Әрі қарай не қосамыз")+'</h2><div class="soonrow">'+SOON.map(x=>'<div class="card soonc"><span class="ci2">'+sv(x[0])+'</span><b>'+x[1]+'</b><span>'+x[2]+'</span></div>').join("")+'</div>'+
  '<h2>'+t("Как это работает","Бұл қалай жұмыс істейді")+'</h2><div class="trust">'+
   [[t("Надежные магазины","Сенімді дүкендер"),t("Только официальные партнеры, цены берем с их карточек каждый день.","Тек ресми серіктестер, бағаны күн сайын олардың тауар парақшасынан аламыз.")],
    [t("История цены","Баға тарихы"),t("Видно, что было раньше, а не только скидку на ценнике.","Бұрын не болғаны көрінеді, тек бағалауыштағы жеңілдік емес.")],
    [t("Тенге и доллары","Теңге және доллар"),t("Отличаем настоящее подешевение от скачка курса.","Нағыз арзандауды бағамның секірісінен ажыратамыз.")],
    [t("Когда брать","Қашан алу керек"),t("Календарь распродаж и ориентир по прошлым моделям.","Сатылым күнтізбесі және алдыңғы модельдер бойынша бағдар.")]].map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join("")+'</div>'+FOOT();
  const st={k:"all",q:SEARCH_Q,ft:"list"},pg=document.getElementById("pg");
  const F={brands:new Set(),models:new Set(),mem:new Set(),stores:new Set(),pmin:0,pmax:0,inst:false,drop:false,sort:"pop"};
  const fActive=()=>F.brands.size||F.models.size||F.mem.size||F.stores.size||F.pmin||F.pmax||F.inst||F.drop;
  const instTerm=f=>{const a=f.variants.flatMap(v=>v.stores.flatMap(s=>s.inst||[]));return a.includes(24)?24:a.includes(12)?12:0};
  function applyF(list){
    let a=list.filter(x=>{
      if(F.brands.size&&!F.brands.has(brandOf(x.f)))return false;
      if(F.models.size&&!F.models.has(x.f.id))return false;
      if(F.mem.size&&!x.f.variants.some(v=>F.mem.has(v.memory)))return false;
      if(F.pmin&&!(x.from&&x.from>=F.pmin))return false;
      if(F.pmax&&!(x.from&&x.from<=F.pmax))return false;
      if(F.stores.size){const sn2=x.bv?latestAll(x.bv.id).map(p=>baseStore(p.s)):[];if(![...F.stores].some(z=>sn2.includes(z)))return false}
      if(F.inst&&instTerm(x.f)<24)return false;
      if(F.drop){const cb=changeBadge(x.st);if(!(cb&&cb.k==="dn"))return false}
      return true});
    if(F.sort==="asc")a.sort((p,q)=>(p.from||1e12)-(q.from||1e12));
    else if(F.sort==="desc")a.sort((p,q)=>(q.from||0)-(p.from||0));
    else if(F.sort==="drop")a.sort((p,q)=>(q.st?pct(q.st.max.v,q.st.cur)*-1:-1e3)-(p.st?pct(p.st.max.v,p.st.cur)*-1:-1e3));
    return a;
  }
  let missTimer=null;
  function renderGrid(){
    const ft=document.getElementById("favtabs"),cb=document.getElementById("cmpbox");
    ft.hidden=st.k!=="fav";favBar();
    if(st.k==="fav"){ft.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x.dataset.f===st.ft));const n=cmpItems().length;ft.querySelector('[data-f="cmp"]').innerHTML=t("Сравнение","Салыстыру")+(n>=2?' <span class="cbn">'+n+'</span>':'')}
    const showCmp=st.k==="fav"&&st.ft==="cmp";
    cb.hidden=!showCmp;pg.hidden=showCmp;
    if(showCmp){
      const its=cmpItems();
      cb.innerHTML=its.length>=2?cmpBody(its):'<div class="card"><p class="lead" style="margin:0">'+(its.length?t("Добавьте еще одну модель сердечком на вкладке \"Выбранные\", и появится сравнение.","\"Таңдалғандар\" қойындысында тағы бір модельді жүрекшемен қосыңыз, салыстыру шығады."):t("Отметьте сердечком две-три модели, и здесь появится сравнение.","Екі-үш модельді жүрекшемен белгілеңіз, осында салыстыру шығады."))+'</p></div>';
      document.getElementById("fc").textContent=FAV.length;document.getElementById("empty").hidden=true;return;
    }
    const base=items.filter(x=>x.f.group!=="archive"&&(st.q.trim()||st.k==="fav"||F.brands.size||F.models.size||x.f.status!=="nodata")&&(st.k==="all"||(st.k==="fav"?FAV.includes(x.f.id):x.f.status===st.k)));
    const r=st.q.trim()?searchItems(base,st.q):{list:base,near:null};
    const shown=applyF(r.list);r.list=shown;
    const cn=document.getElementById("cnt");if(cn)cn.textContent=shown.length;
    pg.innerHTML=r.list.map(pcard).join("");
    const em=document.getElementById("empty");em.hidden=r.list.length>0;
    document.getElementById("fc").textContent=FAV.length;
    clearTimeout(missTimer);
    if(!r.list.length&&fActive()&&!st.q.trim()){em.innerHTML='<b>'+t("По выбранным условиям пока нет моделей","По таңдалған шарттар бойынша әзірге модель жоқ")+'</b><p>'+t("Мы добавляем модели по брендам. Попробуйте другой бренд или сбросьте фильтры.","Модельдерді брендтер бойынша қосып жатырмыз. Басқа брендті таңдаңыз немесе сүзгілерді тазалаңыз.")+'</p>';return}
    if(!r.list.length){
      const sug=r.near?'<p>'+t("Возможно, вы искали: ","Мүмкін, сіз мынаны іздедіңіз: ")+'<a href="#/smartphones/'+brandOf(r.near.f)+'/'+r.near.f.id+'"><b>'+esc(r.near.f.name)+'</b></a></p>':'';
      em.innerHTML='<b>'+t("Ничего не нашли","Ештеңе табылмады")+'</b>'+sug+'<p>'+t("Мы запомнили ваш запрос и посмотрим, стоит ли добавить такую карточку. Пока есть iPhone: попробуйте \"iPhone 18\".","Сұрауыңызды есте сақтадық, мұндай карточканы қосу керек пе, қарастырамыз. Әзірге iPhone бар: \"iPhone 18\" деп көріңіз.")+'</p>';
      if(st.q.trim().length>=3)missTimer=setTimeout(()=>logMiss(st.q),1200);
    }
  }
  if(OPEN_CMP){OPEN_CMP=false;st.k="fav";st.ft="cmp";document.querySelectorAll("#flt button").forEach(x=>x.classList.toggle("on",x.dataset.k==="fav"))}
  document.getElementById("favtabs").onclick=e=>{const b=e.target.closest("button");if(!b)return;st.ft=b.dataset.f;renderGrid()};
  document.getElementById("cmpbox").onclick=e=>{const b=e.target.closest("[data-rm]");if(!b)return;const i=FAV.indexOf(b.dataset.rm);if(i>=0)FAV.splice(i,1);saveFav();renderGrid();favBar()};
  renderGrid();bindCards(pg,renderGrid);
  tickCd();{const iv2=setInterval(()=>{if(!document.getElementById("pg")){clearInterval(iv2);return}tickCd()},1000)}
  function bindBanner(){const bt=document.getElementById("btrack");if(!bt)return;let bpause=false;
  const bstep=d=>{const w=bt.children[0].offsetWidth+14;if(d>0&&bt.scrollLeft+bt.clientWidth>=bt.scrollWidth-6)bt.scrollTo({left:0,behavior:"smooth"});else if(d<0&&bt.scrollLeft<=2)bt.scrollTo({left:bt.scrollWidth,behavior:"smooth"});else bt.scrollBy({left:d*w,behavior:"smooth"})};
  document.querySelector(".bnr .prev").onclick=()=>bstep(-1);document.querySelector(".bnr .next").onclick=()=>bstep(1);
  ["pointerenter","touchstart","focusin"].forEach(ev=>bt.addEventListener(ev,()=>bpause=true,{passive:true}));
  ["pointerleave","touchend","focusout"].forEach(ev=>bt.addEventListener(ev,()=>bpause=false,{passive:true}));
  if(!(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches)){const iv=setInterval(()=>{if(!document.body.contains(bt)){clearInterval(iv);return}if(!bpause&&!document.hidden)bstep(1)},5000)}
  bt.onclick=e=>{const g=e.target.closest("[data-go]");if(!g)return;const k=g.dataset.go;
    if(k==="cmp"){OPEN_CMP=true;route2();return}
    if(k==="inst"){const c=document.getElementById("fin");if(c&&!c.checked){c.checked=true;F.inst=true;renderGrid()}}
    document.querySelector(".shop").scrollIntoView({behavior:"smooth",block:"start"})};}
  bindBanner();
  const BCOL={apple:["#20242b","#5b6573"],samsung:["#1428a0","#4a63e0"],xiaomi:["#e85d00","#ffa24d"],redmi:["#b30d25","#f0566b"],poco:["#a67f00","#e6b800"],oppo:["#0e6b3e","#3fc589"],huawei:["#a8071f","#ee5a73"]};
  function brandBanner(){
    const ids=[...F.brands],bs=ids.map(i=>BRANDS.find(x=>x.id===i)),its=items.filter(x=>x.f.group!=="archive"&&F.brands.has(brandOf(x.f))),pr=its.filter(x=>x.from);
    const lo=pr.length?Math.min(...pr.map(x=>x.from)):0,c0=BCOL[ids[0]]||BCOL.apple,c1=BCOL[ids[1]]||c0;
    const bg=ids.length>1?'linear-gradient(120deg,'+c0[0]+','+c1[0]+')':'linear-gradient(120deg,'+c0[0]+','+c0[1]+')';
    const pick=ids.length===1?D.families.filter(x=>brandOf(x)===ids[0]&&x.group!=="archive").slice(0,3):ids.slice(0,3).map(i=>D.families.find(x=>brandOf(x)===i&&x.group!=="archive")).filter(Boolean);
    const arts=pick.map((f,k)=>'<div class="bart'+(k?" b"+(k+1):"")+'">'+phoneArt(f)+'</div>').join("");
    return '<section class="bnr brandb"><div class="btrack"><article class="bs bb" style="background:'+bg+'"><div class="bt"><span class="pmk">'+t("Бренд","Бренд")+(ids.length>1?" +"+ids.length:"")+'</span><h2>'+esc(bs.map(b=>b.name).join(" + "))+'</h2><p>'+its.length+' '+t("моделей","модель")+(lo?', '+t("цены от ","бағасы бастап ")+num(lo)+' ₸':', '+t("цены скоро","бағалар жақында"))+'</p><button type="button" class="bcta" data-go="reset">'+t("Все бренды","Барлық брендтер")+'</button></div>'+arts+'</article></div></section>';
  }
  function applyBrandMode(){
    const bw=document.getElementById("bwrap");if(!bw)return;
    const tr=document.getElementById("toprow");if(tr)tr.hidden=!!F.brands.size||!!st.q.trim();
    if(F.brands.size){bw.innerHTML=brandBanner();document.body.style.setProperty("--tint",(BCOL[[...F.brands][0]]||BCOL.apple)[0]);
      bw.querySelector(".bcta").onclick=()=>{F.brands.clear();F.models.clear();syncB();updM();applyBrandMode();renderGrid()}}
    else{bw.innerHTML=bannersHtml(sale,nBlack);document.body.style.removeProperty("--tint");bindBanner()}
  }
  onSearch=()=>{st.q=SEARCH_Q;{const tr=document.getElementById("toprow");if(tr)tr.hidden=!!F.brands.size||!!st.q.trim()}if(st.k==="fav"&&SEARCH_Q.trim()){st.k="all";document.querySelectorAll("#flt button").forEach(x=>x.classList.toggle("on",x.dataset.k==="all"))}renderGrid()};
  onEnter=()=>{if(st.q.trim()&&!searchItems(items,st.q).list.length){clearTimeout(missTimer);logMiss(st.q)}};
  const norm=x=>String(x).toLowerCase().replace(/\s+/g," ").trim();
  const mpan=document.getElementById("mpan"),mbtn=document.getElementById("mbtn"),mq={v:""};
  const mItems=()=>items.filter(x=>x.f.group!=="archive"&&(!F.brands.size||F.brands.has(brandOf(x.f)))).filter(x=>!mq.v||norm(x.f.name).includes(norm(mq.v)));
  function updM(){const n=F.models.size,tot=items.filter(x=>x.f.group!=="archive"&&(!F.brands.size||F.brands.has(brandOf(x.f)))).length;document.getElementById("mcnt").textContent=(!n||n===tot)?t("все","барлығы"):String(n);mbtn.classList.toggle("on",n>0&&n<tot)}
  function buildM(){
    const its=mItems();
    const groups=BRANDS.map(b=>({b,l:its.filter(x=>brandOf(x.f)===b.id)})).filter(g=>g.l.length);
    mpan.innerHTML='<div class="mh"><input id="mfind" type="search" value="'+esc(mq.v)+'" placeholder="'+t("Найти модель","Модельді іздеу")+'" aria-label="'+t("Найти модель","Модельді іздеу")+'" autocomplete="off"></div>'+
      '<div class="ma"><button type="button" data-a="all">'+t("Выбрать все","Барлығын таңдау")+'</button><button type="button" data-a="none">'+t("Сбросить","Тазалау")+'</button></div>'+
      '<div class="ml">'+(groups.length?groups.map(g=>'<div class="mg"><b>'+esc(g.b.name)+'</b>'+g.l.map(x=>'<label class="fc"><input type="checkbox" data-m="'+x.f.id+'"'+(F.models.has(x.f.id)?" checked":"")+'><span>'+esc(x.f.name)+'</span><em>'+(x.from?t("от ","бастап ")+num(x.from)+' ₸':t("скоро","жақында"))+'</em></label>').join("")+'</div>').join(""):'<p class="mut" style="padding:10px">'+t("Ничего не найдено","Ештеңе табылмады")+'</p>')+'</div>';
    const fi=document.getElementById("mfind");if(fi&&mq.focus){fi.focus();fi.setSelectionRange(fi.value.length,fi.value.length)}
  }
  mbtn.onclick=e=>{e.stopPropagation();const open=mpan.hidden;mpan.hidden=!open;mbtn.setAttribute("aria-expanded",open);if(open){mq.v="";mq.focus=false;buildM()}};
  mpan.onclick=e=>e.stopPropagation();
  mpan.onchange=e=>{const el=e.target;if(!el.dataset.m)return;el.checked?F.models.add(el.dataset.m):F.models.delete(el.dataset.m);updM();renderGrid()};
  mpan.oninput=e=>{if(e.target.id==="mfind"){mq.v=e.target.value;mq.focus=true;buildM()}};
  mpan.addEventListener("click",e=>{const a=e.target.closest("[data-a]");if(!a)return;if(a.dataset.a==="all")mItems().forEach(x=>F.models.add(x.f.id));else F.models.clear();updM();buildM();renderGrid()});
  document.addEventListener("click",function cl(){if(!document.body.contains(mbtn)){document.removeEventListener("click",cl);return}if(!mpan.hidden){mpan.hidden=true;mbtn.setAttribute("aria-expanded","false")}});
  document.addEventListener("keydown",function kd(e){if(!document.body.contains(mbtn)){document.removeEventListener("keydown",kd);return}if(e.key==="Escape"&&!mpan.hidden){mpan.hidden=true;mbtn.focus()}});
  const brow=document.querySelector(".brow2");
  const syncB=()=>{brow.querySelectorAll(".bchip").forEach(c=>{const on=c.dataset.b?F.brands.has(c.dataset.b):!F.brands.size;c.classList.toggle("on",on);c.setAttribute("aria-pressed",on)})};
  brow.onclick=e=>{const c=e.target.closest(".bchip");if(!c)return;e.stopPropagation();const id=c.dataset.b,had=F.brands.size;let added=false;
    const ofB=b=>items.filter(x=>x.f.group!=="archive"&&brandOf(x.f)===b).map(x=>x.f.id);
    if(!id){F.brands.clear();F.models.clear()}
    else if(F.brands.has(id)){F.brands.delete(id);ofB(id).forEach(m=>F.models.delete(m))}
    else{F.brands.add(id);ofB(id).forEach(m=>F.models.add(m));added=true}
    if(st.k==="fav"){st.k="all";document.querySelectorAll("#flt button").forEach(x=>x.classList.toggle("on",x.dataset.k==="all"))}
    syncB();updM();applyBrandMode();renderGrid();
    if(!had&&F.brands.size)document.querySelector(".tbar").scrollIntoView({behavior:"smooth",block:"start"});
    if(added&&window.innerWidth>900){mq.v="";mq.focus=false;buildM();mpan.hidden=false;mbtn.setAttribute("aria-expanded","true")}
    else if(!mpan.hidden){buildM()}};
  const fl=document.getElementById("flts");
  fl.onchange=e=>{const el=e.target;
    if(el.dataset.fb){el.checked?F.brands.add(el.dataset.fb):F.brands.delete(el.dataset.fb)}
    else if(el.dataset.fs){el.checked?F.stores.add(el.dataset.fs):F.stores.delete(el.dataset.fs)}
    else if(el.id==="fin")F.inst=el.checked;else if(el.id==="fdr")F.drop=el.checked;
    renderGrid()};
  fl.oninput=e=>{const el=e.target;if(el.id==="pmin"||el.id==="pmax"){const v=+el.value.replace(/\D/g,"")||0;el.id==="pmin"?F.pmin=v:F.pmax=v;renderGrid()}};
  fl.onclick=e=>{const m=e.target.closest("[data-fm]");if(m){const k=m.dataset.fm;F.mem.has(k)?F.mem.delete(k):F.mem.add(k);m.classList.toggle("on",F.mem.has(k));renderGrid();return}
    if(e.target.id==="frs"){F.brands.clear();F.models.clear();syncB();updM();applyBrandMode();F.mem.clear();F.stores.clear();F.pmin=F.pmax=0;F.inst=F.drop=false;fl.querySelectorAll("input[type=checkbox]").forEach(i=>i.checked=false);fl.querySelectorAll("input:not([type=checkbox])").forEach(i=>i.value="");fl.querySelectorAll("[data-fm]").forEach(i=>i.classList.remove("on"));renderGrid()}};
  document.getElementById("sort").onchange=e=>{F.sort=e.target.value;renderGrid()};
  document.getElementById("ftog").onclick=()=>fl.classList.toggle("open");
  if(SEARCH_Q.trim())renderGrid();
  document.getElementById("flt").onclick=e=>{const b=e.target.closest("button");if(!b)return;st.k=b.dataset.k;if(st.k==="fav"&&!cmpItems().length)st.ft="list";document.querySelectorAll("#flt button").forEach(x=>x.classList.toggle("on",x===b));renderGrid()};
  const check=()=>{
    const id=document.getElementById("cm").value,raw=+document.getElementById("cp").value.replace(/\D/g,""),out=document.getElementById("cr2");
    if(!raw){out.innerHTML='<p class="fine">'+t("Введите цену, например 849990.","Бағаны енгізіңіз, мысалы 849990.")+'</p>';return}
    const l=latest(id)[0],all=(byVar[id]||[]).filter(p=>!isOff(p.s)),lo=all.length?Math.min(...all.map(p=>p.v)):null;
    if(!l){out.innerHTML='<p class="fine">'+t("Для этой модели пока нет цен магазинов.","Бұл модель үшін дүкен бағалары әзірге жоқ.")+'</p>';return}
    const d=raw-l.v,p=pct(l.v,raw),tone=p<=1?"buy":p<=5?"mid":"wait";
    const ti=p<=-1?t("Это ниже нашей лучшей цены","Бұл біздің ең жақсы бағадан төмен"):p<=1?t("Это справедливая цена","Бұл әділ баға"):p<=5?t("Немного дороже лучшей цены","Ең жақсы бағадан сәл қымбат"):t("Вы переплачиваете","Сіз артық төлеп жатырсыз");
    const diff=d===0?t("разницы нет","айырмашылық жоқ"):(d>0?t("дороже на ","қымбат: "):t("дешевле на ","арзан: "))+num(Math.abs(d))+" ₸ ("+f1(p)+")";
    out.innerHTML='<div class="res '+tone+'"><b>'+ti+'</b><span>'+t("Сейчас самая низкая цена: ","Қазір ең төмен баға: ")+num(l.v)+' ₸ ('+esc(sn(l.s))+'). '+t("Ваша: ","Сіздікі: ")+num(raw)+' ₸, '+diff+'.'+(lo!==null&&lo<l.v?t(" За историю минимум был "," Тарихтағы ең төменгі баға ")+num(lo)+" ₸.":"")+'</span></div>';
  };
  document.getElementById("cb").onclick=check;
  document.getElementById("cp").onkeydown=e=>{if(e.key==="Enter")check()};
}

// ---------- бренды и модели ----------
function brands(catId){
  const c=D.categories.find(x=>x.id===catId);if(!c)return notFound();
  app.innerHTML=crumbs([[HOME(),"#/"],[catName(c)]])+'<h1>'+catName(c)+'</h1><p class="sub">'+t("Выберите бренд.","Брендті таңдаңыз.")+'</p><div class="grid">'+
  BRANDS.map(b=>{const n=D.families.filter(f=>f.category===catId&&brandOf(f)===b.id).length;
    return b.ready?'<a class="tile btile" href="#/'+catId+'/'+b.id+'">'+brandLogo(b)+'<b>'+b.name+'</b><span class="s">'+t(plural(n,"модель","модели","моделей"),n+" модель")+'</span></a>'
                  :'<div class="tile off">'+brandLogo(b)+'<b>'+b.name+'</b><span class="s">'+t("Скоро","Жақында")+'</span></div>'}).join("")+'</div>'+FOOT();
}
function models(catId,brandId){
  const c=D.categories.find(x=>x.id===catId),b=BRANDS.find(x=>x.id===brandId);
  if(!c||!b||!b.ready)return notFound();
  const items=itemsOf(brandId).filter(x=>x.f.category===catId);
  const cur=items.filter(x=>x.f.group!=="archive"),old=items.filter(x=>x.f.group==="archive");
  app.innerHTML=crumbs([[HOME(),"#/"],[catName(c),"#/"+catId],[b.name]])+'<div class="bhead">'+brandLogo(b,"sm")+'<h1>'+b.name+'</h1></div><div class="pgrid" id="pg" style="margin-top:12px">'+cur.map(pcard).join("")+'</div>'+
   (old.length?'<h2>'+t("Прошлые модели","Алдыңғы модельдер")+'</h2><div class="pgrid" id="pg2" style="margin-top:10px">'+old.map(pcard).join("")+'</div>':'')+FOOT();
  ["pg","pg2"].forEach(id=>{const e=document.getElementById(id);if(e)bindCards(e,()=>models(catId,brandId))});
}

// ---------- как мы считаем ----------
function about(){
  const ru='<h1>Как мы считаем</h1><p class="sub">Коротко о том, откуда данные и чему можно верить.</p>'+
  '<h2>Откуда цены</h2><p>Каждое утро (около 08:17 по Алматы) программа открывает страницы товаров в iSpace и Sulpak, читает цену с карточки и добавляет ее в историю. Старые записи не меняются. Фото модели берется со страницы магазина и подписано его названием, чтобы было видно, что это именно эта модель.</p>'+
  '<h2>Проверка цен</h2><p>Цена не записывается, если она сильно отличается от вчерашней (больше чем на 35%) или от медианы по модели (ниже 60% или выше 150%). Так случайная ошибка чтения не попадает в график.</p>'+
  '<h2>Курс доллара</h2><p>Официальный курс Национального банка РК. Цена в долларах = цена в тенге / курс на день цены. Если курса за день нет, берется среднее за месяц. Это позволяет отличить настоящее подешевение от изменения курса.</p>'+
  '<h2>Как работает вывод "брать или подождать"</h2><p>Это простые правила, а не предсказание:</p><ul><li>Модели меньше 5 месяцев и у iPhone 16 в таком возрасте цена еще заметно снижалась: в пользу ожидания.</li><li>В ближайшие 45 дней есть крупная распродажа: в пользу ожидания.</li><li>Сейчас самая низкая цена за всю нашу историю (при истории от 2 недель): в пользу покупки.</li><li>Тенге за месяц ослаб больше чем на 2%: в пользу покупки, цены могут вырасти.</li><li>Модель выпущена в ограниченном количестве и аналога в истории нет: в пользу покупки.</li></ul><p>Если причин поровну, мы так и пишем: решайте сами. Прошлые модели не гарантируют будущее: у нас пока одна полная история (iPhone 16).</p>'+
  '<h2>Официальные магазины и маркетплейс</h2><p>iSpace, Sulpak, Mechta и Technodom это официальные магазины, они стоят в списке в этом порядке. Kaspi это площадка независимых продавцов, она всегда идет последней: мы показываем до 5 самых дешевых продавцов, но не проверяем подлинность товара и гарантию. Главная цена на странице это самая низкая у официальных магазинов, а цену Kaspi мы показываем отдельно.</p><h2>Если сайт магазина не работает</h2><p>Если сайт не ответил, мы оставляем прошлую цену и пишем, от какой она даты. Если на сайте нет данных о товаре, карточка остается с логотипом магазина и кнопкой перехода на его страницу. Товар, которого нет в наличии, не считается самым дешевым.</p><h2>Что мы не знаем</h2><p>Наличие товара, рассрочку и скидки по картам, цены на Kaspi и в других магазинах. Мы показываем цену с карточки в магазине, сверяйте итоговую цену на странице магазина.</p>'+
  '<h2>Источники</h2><p>Публикации digitalbusiness.kz по ценам iPhone 16, bes.media по Kaspi Жұма, finratings.kz о ценах перед акцией, finance.kz о Черной пятнице 2026, курсы Национального банка РК. Сроки выхода iPhone 18 в 2027 по сообщениям СМИ, Apple их официально не подтверждала.</p>'+
  '<p class="foot">Цены и изображения принадлежат магазинам. Сайт не продает товары и не отвечает за условия магазинов.</p>';
  const kk='<h1>Біз қалай есептейміз</h1><p class="sub">Деректер қайдан алынатыны және неге сенуге болатыны туралы қысқаша.</p>'+
  '<h2>Бағалар қайдан</h2><p>Күн сайын таңертең (Алматы уақытымен шамамен 08:17) бағдарлама iSpace және Sulpak дүкендеріндегі тауар парақшаларын ашып, бағаны оқиды және тарихқа қосады. Ескі жазбалар өзгермейді. Модель фотосы дүкен парағынан алынады және оның атауымен қол қойылады, сонда дәл осы модель екені көрінеді.</p>'+
  '<h2>Бағаны тексеру</h2><p>Баға кешегіден (35%-дан көп) немесе модель бойынша медианадан (60%-дан төмен немесе 150%-дан жоғары) қатты ерекшеленсе, жазылмайды. Осылайша кездейсоқ оқу қатесі графикке түспейді.</p>'+
  '<h2>Доллар бағамы</h2><p>ҚР Ұлттық банкінің ресми бағамы. Доллармен баға = теңгемен баға / баға күніндегі бағам. Күндік бағам болмаса, айлық орташа алынады. Бұл нағыз арзандауды бағам өзгерісінен ажыратуға мүмкіндік береді.</p>'+
  '<h2>"Алу немесе күту" қорытындысы қалай жұмыс істейді</h2><p>Бұл қарапайым ережелер, болжам емес:</p><ul><li>Модельге 5 айдан аз және iPhone 16 осындай жаста бағасы әлі байқаларлық төмендеген: күтудің пайдасына.</li><li>Алдағы 45 күнде ірі сатылым бар: күтудің пайдасына.</li><li>Қазір біздің бүкіл тарихтағы ең төмен баға (тарих 2 аптадан көп болса): сатып алудың пайдасына.</li><li>Теңге бір айда 2%-дан көп әлсіреді: сатып алудың пайдасына, бағалар өсуі мүмкін.</li><li>Модель шектеулі көлемде шықты және тарихта ұқсасы жоқ: сатып алудың пайдасына.</li></ul><p>Себептер тең болса, біз солай жазамыз: өзіңіз шешіңіз. Бұрынғы модельдер болашаққа кепіл емес: бізде әзірге бір ғана толық тарих бар (iPhone 16).</p>'+
  '<h2>Ресми дүкендер және маркетплейс</h2><p>iSpace, Sulpak, Mechta және Technodom ресми дүкендер, олар тізімде осы ретпен тұрады. Kaspi тәуелсіз сатушылардың алаңы, ол әрқашан соңында тұрады: ең арзан 5 сатушыға дейін көрсетеміз, бірақ тауардың түпнұсқалығын және кепілдікті тексермейміз. Беттегі басты баға ресми дүкендердегі ең төмен баға, ал Kaspi бағасын бөлек көрсетеміз.</p><h2>Дүкен сайты жұмыс істемесе</h2><p>Сайт жауап бермесе, алдыңғы бағаны қалдырамыз және оның қай күннен екенін жазамыз. Сайтта тауар туралы дерек болмаса, карточка дүкен логотипімен және оның бетіне өту түймесімен қалады. Қоймада жоқ тауар ең арзан деп саналмайды.</p><h2>Біз нені білмейміз</h2><p>Тауардың бар-жоғын, бөліп төлеуді және карталар бойынша жеңілдіктерді, Kaspi мен басқа дүкендердегі бағаларды. Біз дүкен парағындағы бағаны көрсетеміз, түпкілікті бағаны дүкен бетінде тексеріңіз.</p>'+
  '<h2>Дереккөздер</h2><p>iPhone 16 бағалары бойынша digitalbusiness.kz жарияланымдары, Kaspi Жұма бойынша bes.media, акция алдындағы бағалар туралы finratings.kz, 2026 жылғы Қара жұма туралы finance.kz, ҚР Ұлттық банкінің бағамдары. iPhone 18-дің 2027 жылы шығу мерзімі БАҚ хабарламасы бойынша, Apple оны ресми растаған жоқ.</p>'+
  '<p class="foot">Бағалар мен суреттер дүкендерге тиесілі. Сайт тауар сатпайды және дүкен шарттарына жауап бермейді.</p>';
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Как мы считаем","Біз қалай есептейміз")]])+'<div class="prose">'+(LANG==="kk"?kk:ru)+'</div>';
}

// ---------- страница модели ----------
const ST={period:"all",cur:"kzt",rate:false};
let redraw=null;
const MEMTAB=v=>esc(v.memory);

function famPage(catId,brandId,f,memk){
  const c=D.categories.find(x=>x.id===catId),b=BRANDS.find(x=>x.id===brandId);
  const im=imgOf(f);
  const cap=im&&im.url?(im.title?'<p class="cap"><span class="okt">✓</span> '+t("Фото со страницы магазина: ","Фото дүкен парағынан: ")+'"'+esc(im.title)+'"'+(im.page?' (<a href="'+esc(im.page)+'" target="_blank" rel="noopener noreferrer">'+t("открыть","ашу")+'</a>)':'')+'</p>':'<p class="cap">'+t("Фото: сайт магазина","Фото: дүкен сайты")+'</p>'):'<p class="cap">'+t("Условная иллюстрация","Шартты иллюстрация")+'</p>';
  const noteKK={"Историю цен по этой модели мы используем как образец, чтобы понимать, как дешевеют iPhone со временем. Данные за прошлые периоды взяты из публикаций СМИ.":"Осы модельдің баға тарихын iPhone уақыт өте келе қалай арзандайтынын түсіну үшін үлгі ретінде қолданамыз. Өткен кезеңдердің деректері БАҚ жарияланымдарынан алынған."};
  const note=f.note?(LANG==="kk"&&noteKK[f.note]?noteKK[f.note]:f.note):"";
  let h=crumbs([[HOME(),"#/"],[catName(c),"#/"+catId],[b.name,"#/"+catId+"/"+brandId],[f.name]])+
    '<div class="head">'+artBox(f,"")+'<div><h1>'+esc(f.name)+'</h1><span class="badge '+stCls(f)+'">'+stName(f)+'</span><button class="fav2'+(FAV.includes(f.id)?' on':'')+'" data-fav2="'+f.id+'" aria-pressed="'+FAV.includes(f.id)+'">'+(FAV.includes(f.id)?'♥ '+t("В сравнении","Салыстыруда"):'♡ '+t("Сравнить с другой моделью","Басқа модельмен салыстыру"))+'</button></div></div>'+(note?'<div class="note">'+esc(note)+'</div>':'');
  if(!f.variants.length){
    app.innerHTML=h+'<h2>'+t("Когда ждать цены","Бағаны қашан күтуге болады")+'</h2><div class="card">'+calHtml()+'</div>'+FOOT();return;
  }
  let v=f.variants.find(x=>memKey(f,x)===memk)||f.variants.find(x=>(byVar[x.id]||[]).length)||f.variants[0];
  h+='<div class="seg" style="margin-top:12px" role="tablist" aria-label="'+t("Объем памяти","Жад көлемі")+'">'+f.variants.map(x=>
    '<a class="'+(x.id===v.id?'on':'')+((byVar[x.id]||[]).length?'':' nodata')+'" href="#/'+catId+'/'+brandId+'/'+esc(f.id)+'/'+esc(memKey(f,x))+'">'+MEMTAB(x)+'</a>').join("")+'</div>';
  const pts=(byVar[v.id]||[]).slice().sort((a,b)=>a.t-b.t);
  if(!pts.length){app.innerHTML=h+'<p class="sub" style="margin-top:14px">'+t("Для этой памяти цен пока нет.","Бұл жад көлемі үшін баға әзірге жоқ.")+'</p>'+FOOT();return}
  h+=answerHtml(f,v,pts);
  h+='<h2>'+t("История цены","Баға тарихы")+'</h2><p class="lead">'+t("Двигайте ползунок назад, чтобы увидеть прошлые цены.","Өткен бағаларды көру үшін жүгірткіні артқа жылжытыңыз.")+'</p>'+
  '<div class="card"><div class="ctl"><div class="seg" id="sp"><button data-p="30">'+t("1 мес","1 ай")+'</button><button data-p="90">'+t("3 мес","3 ай")+'</button><button data-p="180">'+t("6 мес","6 ай")+'</button><button data-p="365">'+t("1 год","1 жыл")+'</button><button data-p="all">'+t("Все","Барлығы")+'</button></div>'+
  '<div class="seg" id="sc"><button data-c="kzt">₸ '+t("тенге","теңге")+'</button><button data-c="usd">$ '+t("доллары","доллар")+'</button></div></div>'+
  '<div class="legend" id="legend"></div><div class="cw" id="cw"><div id="chart"></div></div><div class="fut" id="fut"></div>'+
  '<div class="scrub" id="scrub"><div class="sw" id="scw"><input type="range" id="sl" aria-label="'+t("Дата в прошлом","Өткендегі күн")+'" min="0" max="1" value="1"></div><div class="ends"><span id="s0"></span><span id="s1"></span></div></div>'+
  '<div class="ro" id="ro" aria-live="polite"></div>'+
  '<details><summary>'+t("Курс доллара и таблица цен","Доллар бағамы және баға кестесі")+'</summary><label class="chk"><input type="checkbox" id="cr"> '+t("показать курс доллара под графиком","доллар бағамын графиктің астында көрсету")+'</label>'+
  '<table class="d" id="tbl"><thead><tr><th>'+t("Дата","Күні")+'</th><th>'+t("Магазин","Дүкен")+'</th><th>'+t("Цена, ₸","Бағасы, ₸")+'</th><th>'+t("Цена, $","Бағасы, $")+'</th></tr></thead><tbody></tbody></table></details></div>'+
  (f.group==="archive"?'':'<h2>'+t("Когда цена может снизиться","Баға қашан төмендеуі мүмкін")+'</h2><div class="card">'+calHtml()+'</div>')+FOOT();
  app.innerHTML=h;
  setupChart(f,v,pts);
}


// рассрочка без переплаты (0%): помесячный платеж = цена / срок, наличие срока задается в products.json (поле inst у магазина)
function instHtml(f,v,lat){
  const stores=(v.stores||[]);if(!stores.length||f.group==="archive"||!lat.length)return"";
  const rows=stores.map(st=>{const p=lat.find(x=>x.s===st.store);return{st,p}}).filter(r=>r.p).sort((a,b)=>rank(a.st.store)-rank(b.st.store));
  if(!rows.length)return"";
  const known=rows.some(r=>Array.isArray(r.st.inst));
  const cells=rows.map(r=>[12,24].map(n=>{
    if(!Array.isArray(r.st.inst))return{k:"unk"};
    return r.st.inst.includes(n)?{k:"ok",m:Math.round(r.p.v/n)}:{k:"no"};
  }));
  const best={};[0,1].forEach(i=>{const m=cells.map(c=>c[i]).filter(c=>c.k==="ok").map(c=>c.m);best[i]=m.length?Math.min(...m):null});
  const cell=(c,i)=>c.k==="ok"?'<td class="ok'+(c.m===best[i]?' best':'')+'"><b>'+num(c.m)+' ₸</b><small>'+t("в месяц","айына")+'</small></td>':c.k==="no"?'<td class="no">'+t("нет","жоқ")+'</td>':'<td class="no">'+t("уточняем","нақтылап жатырмыз")+'</td>';
  return '<h2>'+t("Рассрочка без переплаты","Артық төлемсіз бөліп төлеу")+'</h2><div class="card inst"><table class="d"><thead><tr><th>'+t("Магазин","Дүкен")+'</th><th>12 '+t("мес.","ай")+'</th><th>24 '+t("мес.","ай")+'</th></tr></thead><tbody>'+
   rows.map((r,i)=>'<tr><td><span class="dot" style="background:'+colorOf(r.st.store,i)+'"></span>'+esc(sn(r.st.store))+'</td>'+cell(cells[i][0],0)+cell(cells[i][1],1)+'</tr>').join("")+'</tbody></table>'+
   '<p class="fine">'+t("Рассрочка 0%, переплаты нет: платеж равен цене, деленной на срок. Условия есть не у всех магазинов и меняются с акциями, итоговые условия смотрите на странице магазина.","Бөліп төлеу 0%, артық төлем жоқ: төлем бағаны мерзімге бөлгенге тең. Шарттар барлық дүкенде бола бермейді және акцияларға қарай өзгереді, түпкілікті шарттарды дүкен бетінен қараңыз.")+(known?"":" "+t("Данные по рассрочке уточняем.","Бөліп төлеу деректерін нақтылап жатырмыз."))+'</p></div>';
}


function statsHtml(v){
  const st=priceStats(v.id);if(!st)return"";
  const many=st.span>=2&&st.max.v!==st.min.v;
  const dMax=st.cur-st.max.v,dRef=st.cur-st.ref.v;
  let msg="";
  if(st.span>=7&&dRef!==0){
    msg=dRef>0?'<div class="chg up"><b>+'+num(dRef)+' ₸ ('+f1(pct(st.ref.v,st.cur))+')</b> '+t("цена выросла с ","баға өсті, басталуы: ")+dlab(st.ref.d)+'</div>':'<div class="chg dn"><b>−'+num(-dRef)+' ₸ ('+f1(pct(st.ref.v,st.cur))+')</b> '+t("цена снизилась с ","баға төмендеді, басталуы: ")+dlab(st.ref.d)+'</div>';
  }else if(st.span<7)msg='<div class="chg">'+t("История пока короткая: накопилось "+Math.round(st.span+1)+" дн. Сравнение появится через неделю.","Тарих әзірге қысқа: "+Math.round(st.span+1)+" күн жиналды. Салыстыру бір аптадан кейін пайда болады.")+'</div>';
  return '<h2>'+t("Цена за всю историю","Бүкіл тарихтағы баға")+'</h2><div class="stats">'+
   '<div class="st"><small>'+t("Сейчас","Қазір")+'</small><b>'+num(st.cur)+' ₸</b>'+(many?'<em class="'+(dMax<0?"dn":"up")+'">'+(dMax===0?t("на максимуме","максимумда"):(dMax<0?"−":"+")+num(Math.abs(dMax))+" ₸ ("+f1(pct(st.max.v,st.cur))+") "+t("от макс.","макс. бойынша"))+'</em>':'<em>'+t("цена не менялась","баға өзгерген жоқ")+'</em>')+'</div>'+
   '<div class="st"><small>'+t("Самая высокая","Ең жоғары")+'</small><b>'+num(st.max.v)+' ₸</b><em>'+dlab(st.max.d)+'</em></div>'+
   '<div class="st"><small>'+t("Самая низкая","Ең төмен")+'</small><b>'+num(st.min.v)+' ₸</b><em>'+dlab(st.min.d)+(many&&st.cur>st.min.v?' · '+t("сейчас +","қазір +")+num(st.cur-st.min.v)+' ₸':'')+'</em></div></div>'+msg;
}

function miniStats(v){
  const st=priceStats(v.id);if(!st)return"";
  const many=st.span>=2&&st.max.v!==st.min.v,dRef=st.cur-st.ref.v;
  let msg="";
  if(st.span>=7&&dRef!==0)msg='<div class="chg2 '+(dRef>0?"up":"dn")+'"><b>'+(dRef>0?"+":"−")+num(Math.abs(dRef))+' ₸ ('+f1(pct(st.ref.v,st.cur))+')</b> '+(dRef>0?t("выросла с ","өсті: "):t("снизилась с ","төмендеді: "))+dlab(st.ref.d)+'</div>';
  else if(st.span<7)msg='<div class="chg2">'+t("История копится: "+Math.round(st.span+1)+" дн. Сравнение появится через неделю.","Тарих жиналуда: "+Math.round(st.span+1)+" күн. Салыстыру бір аптадан кейін.")+'</div>';
  if(!many)return msg||'';
  return '<div class="mst"><div><small>'+t("Была выше всего","Ең жоғары болған")+'</small><b>'+num(st.max.v)+' ₸</b><em>'+dlab(st.max.d)+'</em></div><div><small>'+t("Была ниже всего","Ең төмен болған")+'</small><b>'+num(st.min.v)+' ₸</b><em>'+dlab(st.min.d)+'</em></div></div>'+msg;
}

function buyRow(v,cfg,cheapest,k){
  const store=cfg.store,stt=stStatus(v.id,store),p=lastRec(v.id,s=>s===store);
  const url=cfg.url;
  const age=p?Math.round(TN-p.t):0;
  let state=stt?stt.state:(p&&age>3?"stale":"ok"),tag="",sub="",price="",btn=t("Купить","Сатып алу");
  if(!p){state="empty"}
  if(state==="ok"&&stt&&stt.avail===false){tag='<i class="tg gr">'+t("нет в наличии","қоймада жоқ")+'</i>'}
  else if(state==="site_down"){tag='<i class="tg wn">'+t("сайт не отвечал","сайт жауап бермеді")+'</i>';sub=t("цена от ","баға: ")+dlab(p?p.d:"")}
  else if(state==="no_data"){tag='<i class="tg wn">'+t("на сайте нет данных","сайтта дерек жоқ")+'</i>';sub=p?t("цена от ","баға: ")+dlab(p.d):""}
  else if(state==="rejected"){tag='<i class="tg wn">'+t("цена на проверке","баға тексерілуде")+'</i>';sub=t("цена от ","баға: ")+dlab(p.d)}
  else if(state==="stale"){tag='<i class="tg wn">'+t("цена не обновлялась","баға жаңартылмады")+'</i>';sub=t("цена от ","баға: ")+dlab(p.d)}
  else if(cheapest){tag='<i class="tg ok">'+t("самая низкая цена","ең төмен баға")+'</i>'}
  if(state==="empty")price='<small>'+t("цены на сайте нет","сайтта баға жоқ")+'</small>';
  else price='<b'+(stt&&stt.avail===false?' class="oos"':'')+'>'+num(p.v)+' ₸</b>'+(sub?'<small>'+sub+'</small>':(state==="ok"?'<small>'+t("на "+dlab(p.d),dlab(p.d)+" күніне")+'</small>':''));
  const hasCard=!!url&&cfg.card!==false&&!/\/(section|catalog|category|categories|brend|brand|c)\//i.test(url);
  if(!hasCard)btn=t("Открыть","Ашу");
  const isPri=cheapest&&state==="ok";
  let ins="";
  if(p&&state!=="empty"){
    if(Array.isArray(cfg.inst)){
      const n=cfg.inst.includes(24)?24:(cfg.inst.includes(12)?12:0);
      if(n)ins='<div class="bin"><em>'+t("Рассрочка","Бөліп төлеу")+'</em><span class="ichip ok"><b>'+n+' '+t("мес.","ай")+'</b> '+num(Math.round(p.v/n))+' ₸ '+t("в месяц","айына")+'</span></div>';
      else ins='<div class="bin"><em>'+t("Рассрочка","Бөліп төлеу")+'</em><span class="ichip no">'+t("нет","жоқ")+'</span></div>';
    }else ins='<div class="bin"><em>'+t("Рассрочка 12 и 24 мес.","Бөліп төлеу 12 және 24 ай")+'</em><span class="ichip unk">'+t("условия уточняем","шарттарын нақтылаудамыз")+'</span></div>';
  }
  return '<div class="br'+(isPri?' best':'')+'"><div class="brl">'+storeLogo(store,k)+'<div class="bnt"><b>'+esc(sn(store))+'</b>'+tag+'</div></div><div class="brp">'+price+'</div>'+
    (url?'<a class="bgo'+((isPri||hasCard)?' pri':'')+'" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+btn+' ↗</a>':'<span class="bgo off">'+t("нет ссылки","сілтеме жоқ")+'</span>')+ins+'</div>';
}
function kaspiBlock(v,cfg,minOff){
  const mk=latestMkt(v.id);
  const sellers=mk.filter(p=>/ · /.test(p.s)).slice(0,5),plain=mk.filter(p=>!/ · /.test(p.s))[0];
  const stt=stStatus(v.id,"Kaspi"),old=lastRec(v.id,s=>baseStore(s)==="Kaspi");
  let body="";
  if(sellers.length){const rows=sellers.map((p,i)=>{const nm=p.s.split(" · ")[1];return '<div class="srow'+(i===0?' best1':'')+'"><span class="snm"><b>'+esc(nm)+'</b><small>'+(i===0?t("самая низкая цена на Kaspi","Kaspi-дегі ең төмен баға"):t("продавец Kaspi","Kaspi сатушысы"))+'</small></span><b class="spr">'+num(p.v)+' ₸</b>'+(cfg.url?'<a class="mini" href="'+esc(cfg.url)+'" target="_blank" rel="noopener noreferrer">'+t("Купить","Сатып алу")+'</a>':'')+'</div>'});body=rows.slice(0,3).join("")+(rows.length>3?'<details class="more"><summary>'+t("Еще "+(rows.length-3)+" продавца","Тағы "+(rows.length-3)+" сатушы")+'</summary>'+rows.slice(3).join("")+'</details>':"")}
  else if(plain)body='<div class="srow"><span>'+t("Лучшая цена на Kaspi","Kaspi-дегі үздік баға")+'</span><b>'+num(plain.v)+' ₸</b></div>';
  else if(old)body='<div class="srow"><span>'+t("Последняя цена от "+dlab(old.d),"Соңғы баға: "+dlab(old.d))+'</span><b>'+num(old.v)+' ₸</b></div>';
  else body='<div class="srow"><span>'+t("Цены на Kaspi пока нет","Kaspi-де баға әзірге жоқ")+'</span></div>';
  const best=(sellers[0]||plain||old),diff=best&&minOff?best.v-minOff:null;
  let kins="";const kb=(sellers[0]||plain);
  if(kb&&Array.isArray(cfg.inst)){const n=cfg.inst.includes(24)?24:(cfg.inst.includes(12)?12:0);if(n)kins='<div class="bin kin"><em>'+t("Рассрочка","Бөліп төлеу")+'</em><span class="ichip ok"><b>'+n+' '+t("мес.","ай")+'</b> '+num(Math.round(kb.v/n))+' ₸ '+t("в месяц","айына")+'</span><span class="kn">'+t("от лучшей цены, условия у продавца","үздік бағадан, шарттары сатушыда")+'</span></div>'}
  const warn=stt&&stt.state!=="ok"?' <i class="tg wn">'+(stt.state==="site_down"?t("сайт не отвечал","сайт жауап бермеді"):t("на сайте нет данных","сайтта дерек жоқ"))+'</i>':'';
  return '<div class="kb2"><div class="kh"><div class="brl">'+storeLogo("Kaspi",4)+'<div class="bnt"><b>Kaspi</b><i class="tg pu">'+t("маркетплейс, независимые продавцы","маркетплейс, тәуелсіз сатушылар")+'</i></div>'+warn+'</div>'+
    (cfg.url?'<a class="bgo kas" href="'+esc(cfg.url)+'" target="_blank" rel="noopener noreferrer">'+t("Купить на Kaspi","Kaspi-де сатып алу")+' ↗</a>':'')+'</div>'+
    kins+'<div class="sellers">'+body+'</div>'+(diff!==null&&diff!==0?'<div class="kdiff '+(diff<0?'dn':'up')+'">'+(diff<0?t("Лучшая цена на Kaspi дешевле на "+num(-diff)+" ₸, чем у официальных магазинов.","Kaspi-дегі үздік баға ресми дүкендерден "+num(-diff)+" ₸ арзан."):t("Лучшая цена на Kaspi дороже на "+num(diff)+" ₸, чем у официальных магазинов.","Kaspi-дегі үздік баға ресми дүкендерден "+num(diff)+" ₸ қымбат."))+'</div>':'')+
    '<p class="kwarn">'+t("Продавцы независимые: подлинность товара и гарантию мы не проверяем.","Сатушылар тәуелсіз: тауардың түпнұсқалығын және кепілдікті біз тексермейміз.")+'</p></div>';
}
function answerHtml(f,v,pts){
  const lat=latest(v.id),usd=p=>p.v/rateFor(p.d)[0];
  let left="",vh="",buyCard="";
  const cfgAll=(v.stores&&v.stores.length)?v.stores:[...new Set(pts.filter(p=>!isOff(p.s)).map(p=>baseStore(p.s)))].map(s=>({store:s,url:""}));
  const offCfg=cfgAll.filter(c=>!isMkt(c.store)).sort((A,B)=>rank(A.store)-rank(B.store));
  const kCfg=cfgAll.find(c=>isMkt(c.store)&&c.store==="Kaspi");
  const o=officialOf(v.id);
  if(lat.length){
    const minV=lat[0].v,win=lat.filter(p=>p.v===minV).sort((p,q)=>rank(p.s)-rank(q.s)),first=win[0];
    const mk=latestMkt(v.id)[0];
    left='<div class="card price-card"><small>'+(f.group==="archive"?t("Последняя известная цена","Соңғы белгілі баға"):t("Дешевле всего сегодня","Бүгін ең арзан"))+(isMkt(first.s)?'':' '+t("в официальных магазинах","ресми дүкендерде"))+'</small><span class="big">'+num(minV)+' ₸</span><div class="where">'+t("около","шамамен")+' $'+num(usd(first))+'</div>'+miniStats(v)+'</div>';
    buyCard='<div class="card buycard"><h3>'+t("Где купить","Қайдан сатып алуға болады")+'</h3><div class="grp">'+t("Официальные магазины","Ресми дүкендер")+'</div>'+
      offCfg.map((c,k)=>{const p=lat.find(x=>baseStore(x.s)===c.store);return buyRow(v,c,!!p&&p.v===minV,k)}).join("")+
      (kCfg?'<div class="grp">'+t("Маркетплейс","Маркетплейс")+'</div>'+kaspiBlock(v,kCfg,minV):'')+
      '<p class="fine">'+t("Наличие и итоговую цену проверяйте на странице магазина.","Бар-жоғын және түпкілікті бағаны дүкен парағынан тексеріңіз.")+'</p></div>';
  }else{
    left='<div class="card price-card"><small>'+t("Цены магазинов","Дүкен бағалары")+'</small><span class="big">'+(o?num(o.v)+' ₸':t('нет данных','дерек жоқ'))+'</span><div class="where"><span>'+(o?t('Официальная цена на старте продаж ('+dlab(o.d)+'). Цены магазинов появятся после следующего сбора.','Сатылым басындағы ресми баға ('+dlab(o.d)+'). Дүкен бағалары келесі жинақтан кейін пайда болады.'):t('Цены появятся после следующего сбора.','Бағалар келесі жинақтан кейін пайда болады.'))+'</span></div>'+
      '</div>';
    if(offCfg.length)buyCard='<div class="card buycard"><h3>'+t("Где смотреть","Қайдан қарауға болады")+'</h3>'+offCfg.map((c,k)=>buyRow(v,c,false,k)).join("")+'</div>';
  }
  if(f.group==="archive"){
    const a=pts.filter(p=>p.s==="Маркетплейсы"),lo=a.length?a.reduce((m,p)=>p.v<m.v?p:m,a[0]):null;
    const txt=lo&&a.length>2?t('Цена на маркетплейсах: '+num(a[0].v)+' ₸ ('+dlab(a[0].d)+') → минимум '+num(lo.v)+' ₸ ('+dlab(lo.d)+'), это '+f1(pct(a[0].v,lo.v))+'. Дальше цена почти не менялась.','Маркетплейстердегі баға: '+num(a[0].v)+' ₸ ('+dlab(a[0].d)+') → ең төмені '+num(lo.v)+' ₸ ('+dlab(lo.d)+'), бұл '+f1(pct(a[0].v,lo.v))+'. Одан кейін баға дерлік өзгерген жоқ.'):t('История по статьям СМИ.','БАҚ мақалалары бойынша тарих.');
    vh='<div class="card verdict tone-mid"><div class="vt">'+t("Архивная модель","Мұрағаттағы модель")+'</div><ul><li><i></i><span>'+txt+'</span></li></ul></div>';
  }else{
    const vd=verdict(f,v,pts);
    vh='<div class="card verdict tone-'+vd.tone+'"><div class="vt">'+vd.title+'</div><ul>'+vd.reasons.slice(0,3).map(r=>'<li class="'+r[0]+'"><i></i><span>'+esc(r[1])+'</span></li>').join("")+'</ul>'+(vd.reasons.length>3?'<details class="more"><summary>'+t("Еще причины","Тағы себептер")+'</summary><ul>'+vd.reasons.slice(3).map(r=>'<li class="'+r[0]+'"><i></i><span>'+esc(r[1])+'</span></li>').join("")+'</ul></details>':'')+'</div>';
  }
  return '<div class="answer">'+left+vh+'</div>'+buyCard;
}

function calHtml(){
  const up=CAL().filter(c=>dnum(c[0])>=TN-1);
  if(!up.length)return '<p class="lead">'+t("Ближайших событий в календаре нет.","Күнтізбеде таяу оқиғалар жоқ.")+'</p>';
  const it=c=>'<div class="it"><time>'+dlab(c[0])+'</time><div><b>'+esc(c[1])+'</b><span>'+esc(c[2])+'</span></div></div>';
  return '<div class="cal">'+up.slice(0,2).map(it).join("")+'</div>'+'<details class="more"><summary>'+t("Все события и про Kaspi Жұма","Барлық оқиғалар және Kaspi Жұма туралы")+'</summary>'+(up.length>2?'<div class="cal">'+up.slice(2).map(it).join("")+'</div>':'')+
  '<p class="fine">'+t("<b>Kaspi Жұма</b> в этом году проходила 18-21 июня и 5-8 ноября. Даты объявляют за пару недель. Покупатели сообщали, что iPhone 18 Pro Max 1 ТБ в Kaspi перед Жұма подорожал с 1 284 028 до 1 616 998 ₸ (умысел не доказан), поэтому реальную скидку проверяйте по графику выше.","<b>Kaspi Жұма</b> биыл 18-21 маусымда және 5-8 қарашада өтті. Күндерін екі апта бұрын жариялайды. Сатып алушылар Жұма алдында Kaspi-де iPhone 18 Pro Max 1 ТБ 1 284 028-ден 1 616 998 ₸-ге қымбаттағанын хабарлады (ниеті дәлелденген жоқ), сондықтан нақты жеңілдікті жоғарыдағы графиктен тексеріңіз.")+'</p></details>';
}


// ---------- скрытая страница: что искали и не нашли ----------
function queries(){
  const L=readMiss().sort((a,b)=>b.c-a.c);
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Запросы без результата","Нәтижесіз сұраулар")]])+'<h1>'+t("Что искали и не нашли","Не іздеп, таппады")+'</h1><p class="sub">'+t("Здесь только поиски из этого браузера. Чтобы собирать запросы всех посетителей, нужен адрес сбора (LOG_URL в коде).","Мұнда тек осы браузердегі іздеулер. Барлық келушілердің сұрауларын жинау үшін жинау мекенжайы керек (кодтағы LOG_URL).")+'</p>'+
  (L.length?'<div class="card"><table class="d"><thead><tr><th>'+t("Запрос","Сұрау")+'</th><th>'+t("Раз","Рет")+'</th><th>'+t("Последний","Соңғысы")+'</th></tr></thead><tbody>'+L.map(r=>'<tr><td>'+esc(r.v.join(" / "))+'</td><td>'+r.c+'</td><td>'+esc(r.last.slice(0,10))+'</td></tr>').join("")+'</tbody></table><p style="margin:12px 0 0"><button class="btn" id="cp1" style="margin:0 8px 0 0;border:0;cursor:pointer">'+t("Скопировать","Көшіру")+'</button><button class="btn" id="cl1" style="margin:0;border:0;cursor:pointer;background:var(--soft);color:var(--ink)">'+t("Очистить","Тазалау")+'</button></p></div>':'<div class="empty">'+t("Пока пусто: ненайденных запросов нет.","Әзірге бос: табылмаған сұрау жоқ.")+'</div>');
  const c=document.getElementById("cp1");if(c)c.onclick=()=>{try{navigator.clipboard.writeText(L.map(r=>r.v[0]+"\t"+r.c).join("\n"))}catch(e){}};
  const d=document.getElementById("cl1");if(d)d.onclick=()=>{try{localStorage.removeItem("tm_misses")}catch(e){}queries()};
}

// ---------- график ----------
function collapseK(pts){const m={},out=[];pts.forEach(p=>{if(isMkt(p.s)&&baseStore(p.s)==="Kaspi"){if(!m[p.t]||p.v<m[p.t].v)m[p.t]=Object.assign({},p,{s:"Kaspi"})}else out.push(p)});return out.concat(Object.values(m)).sort((x,y)=>x.t-y.t)}
const SHOW_MM=false; // подписи макс./мин. на графике отключены: те же значения есть в карточке цены
function setupChart(f,v,pts){
  pts=collapseK(pts);
  const stores=[...new Set(pts.map(p=>p.s))].sort((a,b)=>rank(a)-rank(b));
  const col=s=>colorOf(s,stores.indexOf(s));
  const dmin=pts[0].t;
  const usdOf=p=>p.v/rateFor(p.d)[0];
  const val=p=>ST.cur==="kzt"?p.v:usdOf(p);
  const $=id=>document.getElementById(id);
  const bestNow=latest(v.id),minNowV=bestNow.length?bestNow[0].v:null;
  $("legend").innerHTML=stores.map(s=>'<span><i style="background:'+col(s)+'"></i>'+esc(sn(s))+'</span>').join("");
  let sel=TN,geo=null;

  function range(){let t0=ST.period==="all"?dmin:TN-(+ST.period);return[Math.min(t0,TN),TN]}
  function niceAxis(lo,hi){
    {const mid=(lo+hi)/2,minSpan=mid*0.08;if(hi-lo<minSpan){lo=mid-minSpan/2;hi=mid+minSpan/2}else{const p=(hi-lo)*0.14;lo-=p;hi+=p}}
    const raw=(hi-lo)/4,pw=Math.pow(10,Math.floor(Math.log10(raw))),m=raw/pw;
    const st=(m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*pw;
    const mn=Math.floor(lo/st)*st,mx=Math.ceil(hi/st)*st,ticks=[];
    for(let z=mn;z<=mx+st/2;z+=st)ticks.push(z);
    return{mn,mx,ticks};
  }
  const fmtY=z=>ST.cur==="kzt"?num(z):"$"+num(z);
  const money=p=>ST.cur==="kzt"?num(p.v)+" ₸":"$"+num(usdOf(p));

  function xTicks(d0,d1,x,W,L,R,H,B){
    const maxT=Math.max(2,Math.floor((W-L-R)/78)),span=d1-d0;let out="";
    const tk=(t,label)=>'<text class="tick" x="'+x(t)+'" y="'+(H-6)+'" text-anchor="middle">'+label+'</text><line x1="'+x(t)+'" x2="'+x(t)+'" y1="'+(H-B)+'" y2="'+(H-B+4)+'" stroke="var(--mute)" opacity=".6"/>';
    if(span/maxT>20){
      const a=new Date(d0*DAY),b=new Date(d1*DAY);
      const total=(b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth()+1;
      const k=[1,2,3,6,12].find(q=>total/q<=maxT)||12;
      let y=a.getUTCFullYear(),m=a.getUTCMonth()+1;if(m%k)m+=k-m%k;if(k===1)m=a.getUTCMonth()+1;
      for(;;){const yy=y+Math.floor(m/12),mm=m%12,t=Date.UTC(yy,mm,1)/DAY;if(t>d1)break;if(t>=d0)out+=tk(t,MON[mm]+" "+yy);m+=k}
    }else{
      const k=[1,2,3,7,14,30].find(q=>span/q<=maxT)||30;
      for(let t=Math.ceil(d0/k)*k;t<=d1;t+=k)out+=tk(t,dshort(t));
    }
    return out;
  }

  // состояние на выбранную дату
  function stateAt(t){
    return stores.map(s=>{let b=null;pts.forEach(p=>{if(p.s===s&&!isOff(s)&&p.t<=t&&(!b||p.t>=b.t))b=p});return b}).filter(b=>b&&t-b.t<=45);
  }
  function readout(){
    const ds=dstr(sel),rows=stateAt(sel).sort((a,b)=>a.v-b.v||rank(a.s)-rank(b.s));
    const rt=rateFor(ds);
    if(!rows.length){$("ro").innerHTML='<b>'+dlab(ds)+'</b><br>'+t('Цен на эту дату еще нет. Первые данные: ','Бұл күнге баға әлі жоқ. Алғашқы деректер: ')+dlab(dstr(dmin))+'.';return}
    const b=rows[0],now=latest(v.id)[0];
    let txt='<b>'+(sel===TN?t('Сегодня, ','Бүгін, ')+dlab(ds):dlab(ds))+'</b><br>';
    if(sel===TN||!now){txt+=t('Лучшая цена: ','Ең жақсы баға: ')+'<b>'+money(b)+'</b>, '+esc(sn(b.s))+'.'}
    else{
      const dKzt=now.v-b.v,uThen=b.v/rateFor(b.d)[0],uNow=now.v/rateFor(now.d)[0];
      const cls=x=>x>0?"up":x<0?"dn":"";
      txt+=t('Лучшая цена тогда: ','Сол кездегі ең жақсы баға: ')+'<b>'+money(b)+'</b>, '+esc(sn(b.s))+'.<br>'+t('Сегодня ','Бүгін ')+money(now)+': '+
        (dKzt===0?'<b>'+t('цена та же','баға сол күйі')+'</b>':'<span class="'+cls(dKzt)+'">'+(dKzt>0?t('дороже на ','қымбат: '):t('дешевле на ','арзан: '))+num(Math.abs(dKzt))+' ₸ ('+f1(pct(b.v,now.v))+')</span>')+
        '. '+t('В долларах ','Долларда ')+(Math.abs(uNow-uThen)<0.5?'<b>'+t('без изменений','өзгеріссіз')+'</b>':'<span class="'+cls(uNow-uThen)+'">'+f1(pct(uThen,uNow))+'</span>')+'.';
    }
    if(sel===TN)txt+='<div class="pr"><span style="color:var(--mute)">'+t('курс ','бағам ')+dec(rt[0],2)+(rt[1]?'*':'')+' ₸</span></div>';
    else txt+='<div class="pr">'+rows.map(p=>'<span><span class="dot" style="background:'+col(p.s)+'"></span>'+esc(sn(p.s))+' <b>'+money(p)+'</b></span>').join("")+'<span style="color:var(--mute)">'+t('курс ','бағам ')+dec(rt[0],2)+(rt[1]?'*':'')+' ₸</span></div>';
    $("ro").innerHTML=txt;
  }
  function placeSel(){
    if(!geo)return;
    const xx=geo.x(sel),cross=$("cross"),g=$("selg");
    cross.setAttribute("x1",xx);cross.setAttribute("x2",xx);
    g.innerHTML=stateAt(sel).map(p=>'<circle cx="'+xx+'" cy="'+geo.y(val(p))+'" r="7" fill="'+col(p.s)+'" stroke="var(--time)" stroke-width="3"/>').join("");
    $("sl").value=sel;
  }

  function draw(){
    const[t0,t1]=range(),vis=pts.filter(p=>p.t>=t0&&p.t<=t1);
    document.querySelectorAll("#sp button").forEach(b=>b.classList.toggle("on",b.dataset.p===ST.period));
    document.querySelectorAll("#sc button").forEach(b=>b.classList.toggle("on",b.dataset.c===ST.cur));
    $("cr").checked=ST.rate;
    fillTable(vis);
    sel=Math.max(t0,Math.min(sel,t1));
    const sl=$("sl");sl.min=t0;sl.max=t1;sl.step=1;sl.value=sel;$("s0").textContent=dlab(dstr(t0));$("s1").textContent=t("сегодня","бүгін");
    if(!vis.length){$("chart").innerHTML='<div class="empty">'+t('В этом периоде цен нет. Выберите "Все".','Бұл кезеңде баға жоқ. "Барлығы" таңдаңыз.')+'</div>';geo=null;readout();return}

    const cw=$("cw"),W=Math.max(280,cw.clientWidth),narrow=W<520;
    {const fu=$("fut");if(fu)fu.innerHTML=narrow&&f.group!=="archive"?CAL().filter(c=>dnum(c[0])>TN).slice(0,2).map(c=>'<span><i></i>'+esc(c[1])+' · '+dlab(c[0])+'</span>').join(""):"";}
    const L=narrow?62:74,R=narrow?14:20,T=28,H=narrow?290:320,B=26;
    const half=Math.min(Math.max(t1-t0,30),150)+1;           // "сегодня" строго по центру
    const d1=TN+half,d0=Math.min(TN-half,t0-3);
    const x=t=>L+(t-d0)/(d1-d0)*(W-L-R);
    const vals=vis.map(val),ax=niceAxis(Math.min(...vals),Math.max(...vals));
    const y=z=>T+(ax.mx-z)/(ax.mx-ax.mn)*(H-T-B);
    geo={x,y};
    let s='<rect x="'+x(TN)+'" y="'+T+'" width="'+Math.max(0,W-R-x(TN))+'" height="'+(H-T-B)+'" fill="var(--time)" opacity=".07"/>';
    ax.ticks.forEach(z=>{s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y(z)+'" y2="'+y(z)+'" stroke="var(--grid)"/><text class="tick" x="'+(L-8)+'" y="'+(y(z)+4)+'" text-anchor="end">'+fmtY(z)+'</text>'});
    s+='<text class="unit" x="'+L+'" y="14">'+(ST.cur==="kzt"?t("Цена, ₸","Бағасы, ₸"):t("Цена, $","Бағасы, $"))+'</text>'+xTicks(d0,d1,x,W,L,R,H,B);
    (f.events||[]).forEach(e=>{const t=dnum(e[0]);if(t<d0||t>TN)return;const late=x(t)>W-140;
      s+='<line x1="'+x(t)+'" x2="'+x(t)+'" y1="'+T+'" y2="'+(H-B)+'" stroke="var(--mute)" stroke-dasharray="4 4" opacity=".6"/><text class="tick" x="'+(x(t)+(late?-5:5))+'" y="'+(T+12+(narrow?60:0))+'" text-anchor="'+(late?'end':'start')+'">'+esc(evName(e[1]))+'</text>'});
    s+='<line x1="'+x(TN)+'" x2="'+x(TN)+'" y1="'+T+'" y2="'+(H-B)+'" stroke="var(--ink)" stroke-opacity=".3"/><text class="tick" x="'+x(TN)+'" y="'+(T-8)+'" text-anchor="end" style="font-weight:700;fill:var(--ink)">'+t('сегодня','бүгін')+'</text>';

    // будущие акции и события справа от "сегодня"
    {let k=0;const rowH=17;
      CAL().map(c=>({d:dnum(c[0]),n:c[1]})).filter(c=>c.d>TN&&c.d<=d1).sort((p,q)=>p.d-q.d).slice(0,narrow?0:6).forEach(c=>{
        const xx=x(c.d),lim=narrow?15:22,lab=c.n.length>lim?c.n.slice(0,lim-1)+"…":c.n,tw=lab.length*6.3+20,late=xx+tw>W-R,bx=late?xx-tw:xx,by=T+8+(k%3)*rowH;k++;
        s+='<line x1="'+xx+'" x2="'+xx+'" y1="'+T+'" y2="'+(H-B)+'" stroke="var(--time)" stroke-width="2" stroke-dasharray="5 4"/>'+
           '<rect x="'+bx+'" y="'+by+'" width="'+tw+'" height="'+(rowH-2)+'" rx="8" fill="var(--time)"/>'+
           '<text x="'+(bx+tw/2)+'" y="'+(by+11.5)+'" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#201500">'+esc(lab)+'</text>';
      });
      s+='<text class="tick" x="'+(W-R)+'" y="'+(H-B-8)+'" text-anchor="end" style="font-weight:600">'+t("впереди: акции и события","алда: акциялар мен оқиғалар")+'</text>';
    }
    const order=stores.slice().reverse();
    order.forEach(st=>{
      const sp=vis.filter(p=>p.s===st);if(!sp.length)return;const c=col(st);
      for(let k=1;k<sp.length;k++){const a=sp[k-1],b=sp[k];
        s+='<line x1="'+x(a.t)+'" y1="'+y(val(a))+'" x2="'+x(b.t)+'" y2="'+y(val(b))+'" stroke="'+c+'" stroke-width="2.4" stroke-linecap="round"'+(b.t-a.t>10?' stroke-dasharray="2 6"':'')+'/>'}
      const last=sp[sp.length-1];
      if(last.t<t1&&t1-last.t<=3)s+='<line x1="'+x(last.t)+'" y1="'+y(val(last))+'" x2="'+x(t1)+'" y2="'+y(val(last))+'" stroke="'+c+'" stroke-width="2.4" stroke-dasharray="2 5" stroke-linecap="round" opacity=".7"/>';
    });
    order.forEach(st=>{const sp=vis.filter(p=>p.s===st),c=col(st),ri=stores.indexOf(st);
      sp.forEach((p,k)=>{const lastp=k===sp.length-1,r=Math.max(3.5,(lastp?7:5)-ri*1.2);
        s+='<circle cx="'+x(p.t)+'" cy="'+y(val(p))+'" r="'+r+'" fill="'+c+'" stroke="var(--card)" stroke-width="2"/>'})});
    const spanD=Math.max(...vis.map(p=>p.t))-Math.min(...vis.map(p=>p.t));
    let mp=vis[0];vis.forEach(p=>{if(val(p)<val(mp)||(val(p)===val(mp)&&(p.t>mp.t||(p.t===mp.t&&rank(p.s)<rank(mp.s)))))mp=p});
    if(SHOW_MM&&spanD>=7){const mx=x(mp.t),my=y(val(mp)),txt=t("мин. ","мин. ")+(ST.cur==="kzt"?num(mp.v)+" ₸":"$"+num(usdOf(mp))),tw=txt.length*7+16;
      const bx=Math.min(Math.max(mx-tw/2,L),W-R-tw),by=my-38<T+4?my+16:my-38;
      s+='<circle cx="'+mx+'" cy="'+my+'" r="12" fill="none" stroke="var(--ok)" stroke-width="2.8"/>'+
         '<rect x="'+bx+'" y="'+by+'" width="'+tw+'" height="24" rx="12" fill="var(--ok)"/><text x="'+(bx+tw/2)+'" y="'+(by+16)+'" text-anchor="middle" style="font-size:12px;font-weight:700;fill:#fff">'+txt+'</text>';}

    {let hp=vis[0];vis.forEach(p=>{if(val(p)>val(hp)||(val(p)===val(hp)&&p.t>hp.t))hp=p});
      if(SHOW_MM&&spanD>=7&&val(hp)>val(mp)+1e-9){const hx=x(hp.t),hy=y(val(hp)),txt2=t("макс. ","макс. ")+(ST.cur==="kzt"?num(hp.v)+" ₸":"$"+num(usdOf(hp))),tw2=txt2.length*7+16,bx2=Math.min(Math.max(hx-tw2/2,L),W-R-tw2),by2=hy-34<T+2?hy+14:hy-34;
        s+='<circle cx="'+hx+'" cy="'+hy+'" r="11" fill="none" stroke="var(--bad)" stroke-width="2.6"/><rect x="'+bx2+'" y="'+by2+'" width="'+tw2+'" height="22" rx="11" fill="var(--bad)"/><text x="'+(bx2+tw2/2)+'" y="'+(by2+15)+'" text-anchor="middle" style="font-size:12px;font-weight:700;fill:#fff">'+txt2+'</text>';}}
    s+='<line id="cross" x1="-10" x2="-10" y1="'+T+'" y2="'+(H-B)+'" stroke="var(--time)" stroke-width="2.5"/><g id="selg"></g><rect id="hit" x="'+L+'" y="0" width="'+(W-L-R)+'" height="'+H+'" fill="transparent"/>';
    let svg='<svg id="svg1" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+t('График цены по дням','Күн сайынғы баға графигі')+'">'+s+'</svg>';
    if(ST.rate){
      const H2=150,T2=24,B2=26,mk=[],dm={};
      Object.keys(daily).forEach(k=>dm[k.slice(0,7)]=1);
      const dpts=Object.keys(daily).filter(k=>{const t=dnum(k);return t>=d0&&t<=d1}).sort();
      for(let q=new Date(d0*DAY),mm=Date.UTC(q.getUTCFullYear(),q.getUTCMonth(),1)/DAY;mm<=d1;){
        const dd=new Date(mm*DAY),key=dd.getUTCFullYear()+"-"+String(dd.getUTCMonth()+1).padStart(2,"0"),next=Date.UTC(dd.getUTCFullYear(),dd.getUTCMonth()+1,1)/DAY;
        if(key in rates&&!dm[key])mk.push([Math.max(mm,d0),Math.min(next,d1),rates[key]]);mm=next}
      if(mk.length||dpts.length){
        const allv=mk.map(q=>q[2]).concat(dpts.map(k=>daily[k])),ax2=niceAxis(Math.min(...allv),Math.max(...allv));
        const y2=z=>T2+(ax2.mx-z)/(ax2.mx-ax2.mn)*(H2-T2-B2);
        let s2='<text class="unit" x="'+L+'" y="14">'+t('Курс доллара, ₸','Доллар бағамы, ₸')+'</text>';
        ax2.ticks.forEach(z=>{s2+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y2(z)+'" y2="'+y2(z)+'" stroke="var(--grid)"/><text class="tick" x="'+(L-8)+'" y="'+(y2(z)+4)+'" text-anchor="end">'+num(z)+'</text>'});
        let path="";mk.forEach((q,i)=>{path+=(i?"L":"M")+x(q[0])+" "+y2(q[2])+"L"+x(q[1])+" "+y2(q[2])});
        s2+='<path d="'+path+'" fill="none" stroke="var(--rate)" stroke-width="2.2" stroke-linejoin="round"/>';
        if(dpts.length){let dp="";dpts.forEach((k,i)=>{dp+=(i?"L":"M")+x(dnum(k))+" "+y2(daily[k])});s2+='<path d="'+dp+'" fill="none" stroke="var(--rate)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>'}
        s2+=xTicks(d0,d1,x,W,L,R,H2,B2);
        svg+='<svg width="'+W+'" height="'+H2+'" viewBox="0 0 '+W+' '+H2+'" role="img" aria-label="'+t('Курс доллара','Доллар бағамы')+'" style="cursor:default">'+s2+'</svg>';
      }
    }
    $("chart").innerHTML=svg;
    // ползунок выровнен по области графика
    const sc=$("scw");sc.style.paddingLeft=(x(t0))+"px";sc.style.paddingRight=(W-x(t1))+"px";
    const hit=$("hit");
    function fromX(cx){const r=$("svg1").getBoundingClientRect(),px=(cx-r.left)*W/r.width;sel=Math.round(Math.max(t0,Math.min(t1,d0+(px-L)/(W-L-R)*(d1-d0))));placeSel();readout()}
    hit.addEventListener("pointermove",e=>{if(e.pointerType==="mouse"||e.buttons)fromX(e.clientX)});
    hit.addEventListener("pointerdown",e=>fromX(e.clientX));
    placeSel();readout();
  }
  function fillTable(rows){
    const tb=document.querySelector("#tbl tbody");tb.innerHTML="";
    rows.slice().sort((a,b)=>b.t-a.t||rank(a.s)-rank(b.s)).forEach(p=>tb.insertAdjacentHTML("beforeend",'<tr><td>'+dlab(p.d)+'</td><td>'+esc(sn(p.s))+'</td><td>'+num(p.v)+'</td><td>$'+num(usdOf(p))+'</td></tr>'));
  }
  $("sp").onclick=e=>{const b=e.target.closest("button");if(!b)return;ST.period=b.dataset.p;draw()};
  $("sc").onclick=e=>{const b=e.target.closest("button");if(!b)return;ST.cur=b.dataset.c;draw()};
  $("cr").onchange=e=>{ST.rate=e.target.checked;draw()};
  $("sl").oninput=e=>{sel=+e.target.value;placeSel();readout()};
  redraw=draw;draw();
}



let rt=null;
window.addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{if(redraw&&document.getElementById("chart"))redraw()},150)});

// ===== Сравнение моделей из избранного =====
let OPEN_CMP=false,CMP_SEC="all";
const CMP_COL=["var(--s0)","var(--s1)","var(--s2)"];
const SPEC_ROWS=[
 ["g",["Удобство","Ыңғайлылық"]],
 ["weight",["Вес","Салмағы"],"min"],["thick",["Толщина","Қалыңдығы"],"min"],["screen",["Экран","Экран"],"max"],["inner",["Внутренний экран (складной)","Ішкі экран (бүктелмелі)"],"max"],["cover",["Внешний экран","Сыртқы экран"],"max"],["fold",["Сгибов выдерживает","Бүгуге төзімділік"],"max"],["battery",["Батарея","Батарея"],"max"],["charge",["Зарядка","Зарядтау"],"max"],
 ["g",["Основное","Негізгі"]],
 ["camera",["Камеры","Камералар"],null],["chip",["Чип","Чип"],null],["ram",["Оперативная память","Жедел жад"],"max"],["release",["Вышел","Шыққан уақыты"],null]
];
const numIn=s=>{const m=String(s==null?"":s).replace(/\s/g,"").replace(",",".").match(/[\d.]+/);return m?parseFloat(m[0]):null};
function memGb(v){if(!v)return null;const n=numIn(v.memory);return n==null?null:(/ТБ|TB/i.test(v.memory)?n*1024:n)}
function cmpItems(){
  return FAV.map(id=>famById(id)).filter(f=>f&&f.category==="smartphones").slice(0,3).map(f=>itemsOf(brandOf(f)).find(x=>x.f===f)).filter(Boolean);
}
function favBar(){
  const fb=document.querySelector(".favlink");if(fb){const n=FAV.length;let i=fb.querySelector(".fb");if(n){if(!i){i=document.createElement("i");i.className="fb";fb.appendChild(i)}i.textContent=n}else if(i)i.remove()}
  let el=document.getElementById("cbar");
  const ftb=document.getElementById("favtabs");
  const onCmp=/^#\/compare/.test(location.hash)||(ftb&&!ftb.hidden)||location.hash===""||location.hash==="#/";
  const its=cmpItems();
  if(!its.length||onCmp){if(el)el.remove();return}
  if(!el){el=document.createElement("div");el.id="cbar";document.body.appendChild(el)}
  const ok=its.length>=2;
  el.innerHTML='<div class="cb-in"><div class="cb-chips">'+its.map(x=>'<span class="cb-chip">'+esc(x.f.name)+'<button data-rm="'+x.f.id+'" aria-label="'+t("Убрать","Алып тастау")+'">×</button></span>').join("")+'</div>'+
    (ok?'<a class="cb-go" href="#/smartphones" data-cmp>'+t("Сравнить","Салыстыру")+' ('+its.length+')</a>':'<span class="cb-hint">'+t("Добавьте еще одну модель, чтобы сравнить","Салыстыру үшін тағы бір модель қосыңыз")+'</span>')+'</div>';
  el.onclick=e=>{const g=e.target.closest("[data-cmp]");if(g){OPEN_CMP=true;if(location.hash==="#/smartphones"){e.preventDefault();route2()}return}const b=e.target.closest("[data-rm]");if(!b)return;const i=FAV.indexOf(b.dataset.rm);if(i>=0)FAV.splice(i,1);saveFav();favBar();document.querySelectorAll(".heart[data-id]").forEach(h=>{const on=FAV.includes(h.dataset.id);h.classList.toggle("on",on);h.textContent=on?"♥":"♡"})};
}
function cmpBody(its){
  const rate=rateFor(TODAY)[0];
  const d=its.map(x=>{
    const f=x.f,sp=f.specs||{},gb=memGb(x.bv),p=x.best?x.best.v:null;
    return{x,f,p,usd:p&&rate?p/rate:null,min:x.st?x.st.min.v:null,perGb:p&&gb?p/gb:null,sp,rating:f.rating||null,store:x.best?sn(x.best.s):""};
  });
  // победитель в строке: индекс или -1
  const win=(vals,dir)=>{const ok=vals.map(v=>v==null?null:v);const nn=ok.filter(v=>v!=null);if(nn.length<2||!dir)return-1;const b=dir==="min"?Math.min(...nn):Math.max(...nn);if(nn.every(v=>v===b))return-1;return ok.indexOf(b)};
  const cell=(txt,w,i)=>'<td class="'+(w===i?"w":"")+'">'+txt+'</td>';
  const miss='<span class="mut">'+t("уточняем","нақтылаймыз")+'</span>';
  const row=(lab,vals,txts,dir)=>{const w=win(vals,dir);return'<tr><td>'+lab+'</td>'+txts.map((tx,i)=>cell(tx==null?miss:tx,w,i)).join("")+'</tr>'};
  const grp=n=>'<tr class="g"><td colspan="'+(d.length+1)+'">'+n+'</td></tr>';
  const G={},grpd=n=>grp(n);let cur="price";G.price=grp(t("Цена","Баға"));
  G[cur]+=row(t("Лучшая цена","Ең жақсы баға"),d.map(z=>z.p),d.map(z=>z.p?num(z.p)+" ₸<small>"+esc(z.store)+"</small>":null),"min");
  G[cur]+=row(t("В долларах","Долларда"),d.map(z=>z.usd),d.map(z=>z.usd?"$"+num(z.usd):null),"min");
  G[cur]+=row(t("Минимум за все время","Барлық уақыттағы минимум"),d.map(z=>z.min),d.map(z=>z.min?num(z.min)+" ₸":null),"min");
  G[cur]+=row(t("Цена за 1 ГБ памяти","1 ГБ жад бағасы"),d.map(z=>z.perGb),d.map(z=>z.perGb?num(z.perGb)+" ₸":null),"min");
  SPEC_ROWS.forEach(r=>{
    if(r[0]==="g"){cur=r[1][0]==="Удобство"?"conv":"main";G[cur]=grp(t(r[1][0],r[1][1]));return}
    const opt=["inner","cover","fold"].includes(r[0]);
    if(opt&&!d.some(z=>z.sp[r[0]]))return;
    const vals=d.map(z=>numIn(z.sp[r[0]]));
    G[cur]+=row(t(r[1][0],r[1][1]),vals,d.map(z=>z.sp[r[0]]?esc(z.sp[r[0]]):(opt?t("нет","жоқ"):null)),r[2]);
  });
  cur="rev";G.rev=grp(t("Отзывы покупателей","Сатып алушылар пікірі"));
  G[cur]+=row(t("Рейтинг в магазинах","Дүкендердегі рейтинг"),d.map(z=>z.rating?z.rating.v:null),d.map(z=>z.rating?'<span class="stars">'+"★".repeat(Math.round(z.rating.v))+"☆".repeat(5-Math.round(z.rating.v))+'</span> '+dec(z.rating.v,1)+' · '+z.rating.n+' '+t("отзывов","пікір")+(z.rating.src?'<small>'+esc(z.rating.src)+'</small>':''):null),"max");
  const SECS=[["all",t("Все","Барлығы")],["price",t("Цена","Баға")],["conv",t("Удобство","Ыңғайлылық")],["main",t("Основное","Негізгі")],["rev",t("Отзывы","Пікірлер")]];
  if(!SECS.some(x=>x[0]===CMP_SEC))CMP_SEC="all";
  const rows=CMP_SEC==="all"?G.price+G.conv+G.main+G.rev:G[CMP_SEC];
  const secBar='<div class="ftabs secs" role="tablist" aria-label="'+t("Что сравнивать","Нені салыстыру")+'">'+SECS.map(x=>'<button data-sec="'+x[0]+'" class="'+(x[0]===CMP_SEC?"on":"")+'">'+x[1]+'</button>').join("")+'</div>';
  // вывод по правилам
  const L=[];
  const priced=d.filter(z=>z.p);
  if(priced.length>=2){
    const lo=priced.reduce((a,b)=>a.p<=b.p?a:b),hi=priced.reduce((a,b)=>a.p>=b.p?a:b);
    if(hi.p>lo.p)L.push('<b>'+esc(lo.f.name)+'</b> '+t("дешевле на ","арзан ")+'<b>'+num(hi.p-lo.p)+' ₸</b> ('+Math.round((hi.p-lo.p)/hi.p*100)+'%)'+t(", чем ",", ")+esc(hi.f.name)+'.');
  }
  const note=(key,lab,dir,unit)=>{const v=d.map(z=>numIn(z.sp[key]));const w=win(v,dir);if(w<0)return;const o=v.map((a,i)=>i===w?null:a).filter(a=>a!=null);if(!o.length)return;const diff=Math.abs(v[w]-(dir==="min"?Math.min(...o):Math.max(...o)));L.push(esc(d[w].f.name)+": "+lab+" "+t("на ","")+dec(diff,diff<10?1:0).replace(",0","")+" "+unit+(LANG==="kk"?"":""))};
  note("battery",t("батарея больше","батарея көбірек"),"max",t("мАч","мАч"));
  note("weight",t("легче","жеңілірек"),"min",t("г","г"));
  const rt=d.filter(z=>z.rating);if(rt.length>=2){const b=rt.reduce((a,c)=>a.rating.v>=c.rating.v?a:c);if(rt.some(z=>z!==b&&z.rating.v<b.rating.v))L.push(esc(b.f.name)+": "+t("выше оценка покупателей","сатып алушылар бағасы жоғары")+" ("+dec(b.rating.v,1)+").")}
  if(!L.length)L.push(t("Характеристики и отзывы по этим моделям еще собираются. Пока сравниваем только цены.","Бұл модельдердің сипаттамалары мен пікірлері әлі жиналуда. Әзірге тек бағаны салыстырамыз."));
  // график цен
  const ser=d.map((z,i)=>{if(!z.x.bv)return null;const m={};(byVar[z.x.bv.id]||[]).filter(p=>!isOff(p.s)).forEach(p=>{m[p.t]=Math.min(m[p.t]||1e12,p.v)});const k=Object.keys(m).map(Number).sort((a,b)=>a-b);return k.length?{k,m,c:CMP_COL[i],n:z.f.name}:null});
  let chart="";
  const sr=ser.filter(Boolean);
  if(sr.length&&sr.some(s=>s.k.length>=2)){
    const W=700,H=170,pl=44,pr=14,pt=12,pb=18;
    const all=sr.flatMap(s=>s.k.map(a=>s.m[a])),t0=Math.min(...sr.map(s=>s.k[0])),t1=Math.max(...sr.map(s=>s.k[s.k.length-1]));
    let lo=Math.min(...all),hi=Math.max(...all);const pad=Math.max((hi-lo)*.15,hi*.03);lo-=pad;hi+=pad;
    const X=a=>pl+(t1===t0?.5:(a-t0)/(t1-t0))*(W-pl-pr),Y=v=>pt+(hi-v)/(hi-lo)*(H-pt-pb);
    const grid=[0,1,2].map(i=>{const v=lo+(hi-lo)*i/2;return'<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="var(--grid)"/><text x="0" y="'+(Y(v)+4)+'" fill="var(--mute)" font-size="11">'+Math.round(v/1000)+' '+t("тыс","мың")+'</text>'}).join("");
    const lines=sr.map(s=>s.k.length>1?'<polyline fill="none" stroke="'+s.c+'" stroke-width="2.5" stroke-linejoin="round" points="'+s.k.map(a=>X(a).toFixed(1)+","+Y(s.m[a]).toFixed(1)).join(" ")+'"/>':'').join("")+sr.map(s=>{const a=s.k[s.k.length-1];return'<circle cx="'+X(a).toFixed(1)+'" cy="'+Y(s.m[a]).toFixed(1)+'" r="4.5" fill="'+s.c+'" stroke="var(--card)" stroke-width="2"/>'}).join("");
    chart='<div class="ch"><b class="cht">'+t("Цены за все время","Барлық уақыттағы баға")+'</b><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+t("График цен","Баға графигі")+'" style="width:100%;height:auto;margin-top:8px">'+grid+lines+'</svg><div class="lg">'+sr.map(s=>'<span><i style="background:'+s.c+'"></i>'+esc(s.n)+'</span>').join("")+'</div></div>';
  }
  const heads=d.map((z,i)=>'<th><a href="#/smartphones/'+brandOf(z.f)+'/'+z.f.id+'">'+esc(z.f.name)+'</a></th>').join("");
  const cards=d.map((z,i)=>{
    const best=z.p&&win(d.map(q=>q.p),"min")===i;
    return'<div class="mc"><button class="x" data-rm="'+z.f.id+'" aria-label="'+t("Убрать","Алып тастау")+'">×</button>'+artBox(z.f,"")+'<b>'+esc(z.f.name)+'</b><div class="pr">'+(z.p?num(z.p)+' ₸':'<span class="mut">'+t("цен пока нет","бағасы әзірге жоқ")+'</span>')+'</div>'+(z.usd?'<div class="us">'+t("около","шамамен")+' $'+num(z.usd)+' · '+esc(z.store)+'</div>':'')+(best?'<span class="win">'+t("самая низкая цена","ең төмен баға")+'</span>':'')+'<a class="mgo" href="#/smartphones/'+brandOf(z.f)+'/'+z.f.id+'">'+t("Где купить","Қайдан алуға болады")+' ↗</a></div>'}).join("");
  return '<div class="vd"><h3>'+t("Коротко","Қысқаша")+'</h3><ul>'+L.map(x=>'<li>'+x+'</li>').join("")+'</ul></div>'+
    '<div class="cmp-cards n'+d.length+'">'+cards+'</div>'+
    secBar+'<div class="tbw"><table class="tb"><tr><th></th>'+heads+'</tr>'+rows+'</table></div>'+(CMP_SEC==="all"||CMP_SEC==="price"?chart:"")+
    '<p class="foot" style="margin-top:14px">'+t("Лучшее значение в строке выделено зеленым. Характеристики и отзывы берутся со страниц магазинов, если их нет, пишем \"уточняем\".","Жолдағы ең жақсы мән жасылмен белгіленген. Сипаттама мен пікірлер дүкен беттерінен алынады, болмаса \"нақтылаймыз\" деп жазамыз.")+'</p>';
}
function compare(){
  const its=cmpItems();
  let h=crumbs([[HOME(),"#/"],[t("Сравнение","Салыстыру")]])+'<h1>'+t("Сравнение","Салыстыру")+(its.length?': '+its.map(x=>esc(x.f.name)).join(t(" и "," және ")):"")+'</h1>';
  if(its.length<2){
    app.innerHTML=h+'<div class="card"><p class="lead" style="margin:0 0 10px">'+t("Нажмите сердечко на двух-трех телефонах, и здесь появится сравнение: цена, характеристики, отзывы и вывод.","Екі-үш телефондағы жүрекшені басыңыз, осында баға, сипаттама, пікір және қорытынды шығады.")+'</p><a class="btn" href="#/smartphones">'+t("Выбрать телефоны","Телефондарды таңдау")+'</a></div>'+FOOT();return;
  }
  app.innerHTML=h+cmpBody(its)+FOOT();
  app.onclick=e=>{const b=e.target.closest("[data-rm]");if(!b)return;const i=FAV.indexOf(b.dataset.rm);if(i>=0)FAV.splice(i,1);saveFav();compare()};
}
function notFound(){app.innerHTML=crumbs([[HOME(),"#/"]])+'<h1>'+t("Страница не найдена","Бет табылмады")+'</h1><p class="sub"><a href="#/">'+t("На главную","Басты бетке")+'</a></p>'}
const CARS=()=>window.TM_CARS||{brands:[]};
let CAR_REM=(()=>{try{return JSON.parse(localStorage.getItem("tm_cars")||"[]")}catch(e){return[]}})();
const saveRem=()=>{try{localStorage.setItem("tm_cars",JSON.stringify(CAR_REM))}catch(e){}};
const dmy=s=>{const a=String(s).split("-");return a.length===3?a[2]+"."+a[1]+"."+a[0]:s};
function carPage(sel){
  const C=CARS(),B=C.brands[0];
  if(!B){app.innerHTML=crumbs([[HOME(),"#/"],[t("Машины","Көліктер")]])+'<h1>'+t("Машины","Көліктер")+'</h1><div class="card"><p class="lead" style="margin:0">'+t("Данные появятся позже.","Деректер кейінірек пайда болады.")+'</p></div>';return}
  const M=B.models,cur=M.find(m=>m.id===sel)||M[0],key=m=>B.id+"-"+m.id;
  const rem=m=>CAR_REM.find(r=>r.k===key(m));
  const minUsed=m=>m.used&&m.used.length?Math.min(...m.used.map(u=>u[1])):null;
  const remBlock=()=>{const L=M.filter(rem);if(!L.length)return"";
    return '<section class="card carrem"><h2 style="margin:0 0 8px">'+t("Мои запомненные","Менің есте сақтағандарым")+'</h2>'+L.map(m=>{const r=rem(m),d=m.price-r.price;
      return '<div class="crr"><b>'+B.name+' '+esc(m.name)+'</b><span>'+t("Запомнили","Есте сақтадық")+' '+num(r.price)+' ₸ ('+dmy(r.d)+')</span><span class="'+(d<0?"cdn":d>0?"cup":"cok")+'">'+t("Сейчас","Қазір")+' '+num(m.price)+' ₸ '+(d<0?"▼ "+num(-d)+" ₸ "+t("дешевле","арзан"):d>0?"▲ "+num(d)+" ₸ "+t("дороже","қымбат"):"· "+t("без изменений","өзгермеген"))+'</span></div>'}).join("")+'</section>'};
  const card=m=>{const r=rem(m),mu=minUsed(m);
    return '<article class="card carc'+(m.id===cur.id?" sel":"")+'"><a class="cname" href="#/cars/'+B.id+'/'+m.id+'"><span class="cbody">'+esc(m.body)+'</span><h3>'+B.name+' '+esc(m.name)+'</h3></a>'+
     '<div class="cp"><small>'+t("Новая, официальная цена от","Жаңа, ресми баға бастап")+'</small><b>'+num(m.price)+' ₸</b></div>'+
     (m.trims.length?'<div class="ctr">'+m.trims.map(x=>esc(x[0])+': '+num(x[1])+' ₸').join(" · ")+'</div>':'')+
     '<div class="cu">'+(mu?t("Б/у от","Қолданылған бастап")+' <b>'+num(mu)+' ₸</b>':'<span class="mut">'+t("Данные по б/у скоро","Қолданылған бойынша деректер жақында")+'</span>')+'</div>'+
     '<div class="cact"><button type="button" class="ach2'+(r?" on":"")+'" data-rem="'+m.id+'" aria-pressed="'+!!r+'">'+(r?"✓ "+t("Запомнили","Есте сақталды"):"+ "+t("Запомнить цену","Бағаны есте сақтау"))+'</button><a class="fxgo'+(m.id===cur.id?"":" pri")+'" href="#/cars/'+B.id+'/'+m.id+'">'+t("Подробнее","Толығырақ")+'</a></div></article>'};
  const used=m=>{
    if(!m.used)return '<p class="mut" style="margin:0">'+t("Пока не собрали цены б/у по этой модели.","Бұл модель бойынша қолданылған көлік бағасын әлі жинамадық.")+'</p>'+(m.note?'<p class="mut" style="margin:8px 0 0">'+esc(m.note)+'</p>':'');
    return '<div class="cuh"><span>'+t("Возраст","Жасы")+'</span><span></span><span>'+t("Цена","Баға")+'</span><span>'+t("Дешевле новой","Жаңадан арзан")+'</span></div>'+
     m.used.map(u=>{const p=Math.round((1-u[1]/m.price)*100),w=Math.min(100,Math.round(u[1]/m.price*100));
      return '<div class="cur"><span class="cul">'+esc(u[0])+(u[2]<3?' <small class="mut">('+t("мало данных","дерек аз")+')</small>':'')+'</span><span class="cbar"><i style="width:'+w+'%"></i></span><b>'+num(u[1])+' ₸</b><span class="cdis">−'+p+'%</span></div>'}).join("")+
     '<p class="mut" style="margin:10px 0 0;font-size:13px">'+t("Это цены из объявлений kolesa.kz (выборка первой страницы выдачи), а не итоговые цены сделок и не средняя по всему рынку. Торг обычно снижает цену. Всего объявлений:","Бұл kolesa.kz хабарландыруларындағы бағалар (бірінші бет таңдамасы), мәміле бағасы емес. Саудаласу бағаны төмендетеді. Барлық хабарландыру:")+' '+num(m.listings)+'.</p>'+(m.note?'<p class="mut" style="margin:6px 0 0;font-size:13px">'+esc(m.note)+'</p>':'')};
  const rv=m=>m.pros?'<div class="cpc"><div class="cpro"><h3>'+t("5 плюсов по отзывам","Пікірлер бойынша 5 артықшылық")+'</h3><ul>'+m.pros.map(x=>'<li><i aria-hidden="true">✓</i><span>'+esc(x)+'</span></li>').join("")+'</ul></div><div class="ccon"><h3>'+t("5 минусов по отзывам","Пікірлер бойынша 5 кемшілік")+'</h3><ul>'+m.cons.map(x=>'<li><i aria-hidden="true">✕</i><span>'+esc(x)+'</span></li>').join("")+'</ul></div></div><p class="mut" style="margin:10px 0 0;font-size:13px">'+t("Пересказ отзывов владельцев, не цитаты. Источник:","Иелерінің пікірлерінің мазмұны, дәйексөз емес. Дереккөз:")+' <a href="'+esc(m.rurl)+'" target="_blank" rel="noopener noreferrer">'+esc(m.rsrc)+'</a>. '+t("Отзывы с российских сайтов, машины и дороги у нас могут отличаться.","Ресей сайттарынан алынған пікірлер, біздегі көліктер мен жолдар өзгеше болуы мүмкін.")+'</p>':'<p class="mut" style="margin:0">'+t("Отзывы по этой модели добавим следующим шагом.","Бұл модель бойынша пікірлерді келесі қадамда қосамыз.")+'</p>';
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Машины","Көліктер")]])+
   '<h1>'+t("Машины в Алматы","Алматыдағы көліктер")+'</h1><p class="lead">'+t("Официальные цены, дилеры города и сколько стоит такая же машина с пробегом. Начали с Toyota.","Ресми бағалар, қала дилерлері және пробегі бар дәл сондай көлік қанша тұрады. Toyota-дан бастадық.")+'</p>'+
   '<div class="seg carb"><button class="on">'+B.name+'</button><button disabled>'+t("Другие марки скоро","Басқа маркалар жақында")+'</button></div>'+
   remBlock()+
   '<div class="cars">'+M.map(card).join("")+'</div>'+
   '<section class="card cdet" id="cdet"><div class="cdh"><h2 style="margin:0">'+B.name+' '+esc(cur.name)+'</h2><span class="mut">'+t("Новая","Жаңа")+' '+num(cur.price)+' ₸'+(cur.trims.length?' · '+cur.trims.map(x=>esc(x[0])+' '+num(x[1])+' ₸').join(" · "):"")+'</span></div>'+
   (cur.note&&!cur.used?'<p class="mut" style="margin:6px 0 0">'+esc(cur.note)+'</p>':'')+
   '<h3>'+t("Сколько стоит с пробегом и насколько дешевле новой","Пробегпен қанша тұрады және жаңадан қаншаға арзан")+'</h3>'+used(cur)+
   '<h3>'+t("Что говорят владельцы","Иелері не дейді")+'</h3>'+rv(cur)+'</section>'+
   '<h2>'+t("Официальные дилеры Toyota в Алматы","Алматыдағы ресми Toyota дилерлері")+'</h2><div class="cdl">'+B.dealers.map(d=>'<article class="card"><b>'+esc(d.name)+'</b><span>'+esc(d.addr)+'</span><a href="tel:'+d.tel.replace(/[^+\d]/g,"")+'">'+esc(d.tel)+'</a><a class="fxgo pri" href="'+esc(d.url)+'" target="_blank" rel="noopener noreferrer">'+t("Сайт дилера","Дилер сайты")+' ↗</a></article>').join("")+'</div>'+
   '<p class="mut" style="font-size:13px">'+t("Цены с официального сайта","Ресми сайттағы бағалар")+' <a href="'+esc(B.site)+'" target="_blank" rel="noopener noreferrer">toyotakz.com</a> ('+t("рекомендованная розничная цена базовой комплектации, на ","базалық жиынтықтың ұсынылатын бөлшек бағасы, ")+dmy(C.updated)+'). '+t("Цена у дилера может отличаться: уточняйте перед покупкой. Агрегаторы (newauto.kz, carguru.kz) показывают другие цифры для Land Cruiser и RAV4.","Дилердегі баға өзгеше болуы мүмкін: сатып алар алдында нақтылаңыз. Агрегаторлар (newauto.kz, carguru.kz) Land Cruiser және RAV4 үшін басқа сандарды көрсетеді.")+'</p>';
  app.onclick=e=>{const b=e.target.closest("[data-rem]");if(!b)return;const m=M.find(x=>x.id===b.dataset.rem),i=CAR_REM.findIndex(r=>r.k===key(m));
    if(i>=0)CAR_REM.splice(i,1);else CAR_REM.push({k:key(m),price:m.price,d:new Date().toISOString().slice(0,10)});saveRem();const y=window.scrollY;carPage(cur.id);window.scrollTo(0,y)};
}

function route(){
  renderTop();
  const p=location.hash.replace(/^#\/?/,"").split("/").filter(Boolean);
  redraw=null;onSearch=null;onEnter=null;window.scrollTo(0,0);
  if(!p.length)return hub();
  if(p.length===1&&p[0]==="smartphones")return home();
  if(p[0]==="about")return about();
  if(p[0]==="queries")return queries();
  if(p[0]==="compare")return compare();
  if(p[0]==="apartments")return aptPage();
  if(p[0]==="cars")return carPage(p[2]);
  if(p[0]==="currency")return fxPage((p[1]||"USD").toUpperCase());
  if(p.length===1)return brands(p[0]);
  if(p.length===2)return models(p[0],p[1]);
  const f=famById(p[2]);if(!f||f.category!==p[0]||brandOf(f)!==p[1])return notFound();
  famPage(p[0],p[1],f,p[3]);
}
document.addEventListener("click",e=>{const sb=e.target.closest("[data-sec]");if(sb){CMP_SEC=sb.dataset.sec;if(/^#\/compare/.test(location.hash))compare();else{const cb=document.getElementById("cmpbox");if(cb)cb.innerHTML=cmpBody(cmpItems())}return}
  const b=e.target.closest("[data-fav2]");if(!b)return;const id=b.dataset.fav2,i=FAV.indexOf(id);i>=0?FAV.splice(i,1):FAV.push(id);saveFav();const on=FAV.includes(id);b.classList.toggle("on",on);b.setAttribute("aria-pressed",on);b.textContent=on?"♥ "+t("В сравнении","Салыстыруда"):"♡ "+t("Сравнить с другой моделью","Басқа модельмен салыстыру");favBar()});
function showWelcome(force){
  let seen=false;try{seen=!!localStorage.getItem("tm_welcome")}catch(e){}
  if(seen&&!force)return;
  let wm=document.getElementById("wm");if(wm)wm.remove();
  wm=document.createElement("div");wm.id="wm";wm.className="wm";document.body.appendChild(wm);
  const prev=document.activeElement;
  const close=(save)=>{if(save){try{localStorage.setItem("tm_welcome","1")}catch(e){}}wm.remove();document.body.classList.remove("nosc");document.removeEventListener("keydown",esc);route2()};
  const esc=e=>{if(e.key==="Escape")close(true)};
  document.addEventListener("keydown",esc);document.body.classList.add("nosc");
  const draw=()=>{
    wm.innerHTML='<div class="wcard" role="dialog" aria-modal="true" aria-labelledby="wt"><button class="wx" data-w="skip" aria-label="'+t("Закрыть","Жабу")+'">×</button>'+
     '<div class="whead"><span class="wlogo"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 7v9l-6 4" fill="none" stroke="var(--time)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><small>'+t("НАСТРОИМ САЙТ ПОД ВАС","САЙТТЫ СІЗГЕ БАПТАЙМЫЗ")+'</small><h2 id="wt">'+t("Сәлем!","Сәлем!")+'</h2><p>'+t("Выберите язык и город, и сразу покажем, где выгодно покупать и когда лучше брать.","Тіл мен қаланы таңдаңыз, қайдан сатып алған тиімді және қашан алған дұрыс екенін бірден көрсетеміз.")+'</p></div></div>'+
     '<div class="wl">'+t("Язык","Тіл")+'</div><div class="seg wseg"><button data-lang="kk" class="'+(LANG==="kk"?"on":"")+'">Қазақша</button><button data-lang="ru" class="'+(LANG==="ru"?"on":"")+'">Русский</button></div>'+
     '<div class="wl">'+t("Город","Қала")+'</div><div class="wcities">'+CITIES.map(c=>'<button type="button" data-c="'+c[0]+'" class="'+(c[0]===CITY?"on":"")+'">'+(c[0]===CITY?'<i>✓</i>':'')+t(c[0],c[1])+'</button>').join("")+'</div>'+
     (CITY!=="Алматы"?'<p class="wnote">'+t("Цены в магазинах пока показываем по Алматы, остальные города подключим позже.","Дүкендегі бағаларды әзірге Алматы бойынша көрсетеміз, қалған қалаларды кейін қосамыз.")+'</p>':'')+
     '<button class="wgo" data-w="go">'+t("Показать цены","Бағаларды көрсету")+'</button><button class="wskip" data-w="skip">'+t("Пока пропустить","Әзірге өткізіп жіберу")+'</button><p class="wfoot">'+t("Все можно изменить позже в меню","Мұны кейін мәзірден өзгертуге болады")+'</p></div>';
    const go=wm.querySelector(".wgo");if(go)go.focus()};
  wm.onclick=e=>{
    const l=e.target.closest("[data-lang]"),c=e.target.closest("[data-c]"),w=e.target.closest("[data-w]");
    if(l){LANG=l.dataset.lang;try{localStorage.setItem("tm_lang",LANG)}catch(x){}draw();renderTop();return}
    if(c){setCity(c.dataset.c);draw();renderTop();return}
    if(w){close(true);return}
    if(e.target===wm)close(true)};
  draw();
}

function route2(){document.body.style.removeProperty("--tint");app.onclick=null;route();favBar()}
window.addEventListener("hashchange",route2);
route2();
showWelcome();
})();
