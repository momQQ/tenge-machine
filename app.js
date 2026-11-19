(function(){
const X0=window.TM_FX||{};
const app=document.getElementById("app"),topEl=document.getElementById("top");
let LANG="ru";
try{const s=localStorage.getItem("tm_lang");LANG=s||((navigator.language||"").toLowerCase().startsWith("kk")?"kk":"ru")}catch(e){}
const t=(ru,kk)=>LANG==="kk"?kk:ru;
function setLang(l){LANG=l;try{localStorage.setItem("tm_lang",l)}catch(e){}route()}
const CITY="Алматы";
const AVC=["#3b5bdb","#d6336c","#0f9d8a","#e8590c","#7048e8","#1c7ed6","#2f9e44","#c2255c"];
const avatar=n=>{n=String(n||"?");const c=AVC[[...n].reduce((a,ch)=>a+ch.charCodeAt(0),0)%AVC.length],m=n.match(/[A-Za-zА-Яа-яЁё0-9]/);return '<span class="av" style="background:'+c+'" aria-hidden="true">'+esc((m?m[0]:"?").toUpperCase())+'</span>'};
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
const rates=window.TM_RATES||{};
const dstr=n=>new Date(n*DAY).toISOString().slice(0,10);
const dlab=d=>{const p=d.split("-");return +p[2]+" "+MON[+p[1]-1]+" "+p[0]};
const dshort=n=>{const x=new Date(n*DAY);return x.getUTCDate()+" "+MON[x.getUTCMonth()]};
const TODAY=(()=>{const x=new Date(Date.now()+5*36e5).toISOString().slice(0,10);return X0.updated&&X0.updated>x?X0.updated:x})();
const TN=dnum(TODAY);
const ICO={search:'<circle cx="21" cy="21" r="12"/><path d="M31 31l11 11"/>',heart:'<path d="M24 42S6 31 6 18c0-6 5-10 10-10 4 0 7 2 8 5 1-3 4-5 8-5 5 0 10 4 10 10 0 13-18 24-18 24z"/>',info:'<circle cx="24" cy="24" r="17"/><path d="M24 22v11"/><circle cx="24" cy="15.5" r="1.6" fill="currentColor"/>',
  wal:'<rect x="5" y="11" width="38" height="26" rx="6"/><path d="M5 18h38M33 27h5"/>',
  home2:'<rect x="6" y="6" width="15" height="15" rx="3"/><rect x="27" y="6" width="15" height="15" rx="3"/><rect x="6" y="27" width="15" height="15" rx="3"/><rect x="27" y="27" width="15" height="15" rx="3"/>',phone:'<rect x="14" y="4" width="20" height="40" rx="5"/><path d="M21 9h6"/>',car:'<path d="M6 30l4-12h28l4 12v8H6z"/><circle cx="14" cy="34" r="3"/><circle cx="34" cy="34" r="3"/>',home:'<path d="M6 24L24 8l18 16"/><path d="M12 22v18h24V22"/>',gold:'<path d="M8 34l6-12h20l6 12z"/><path d="M16 22l3-8h10l3 8"/>',cash:'<rect x="6" y="12" width="36" height="24" rx="4"/><circle cx="24" cy="24" r="6"/>'};
const sv=k=>'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">'+ICO[k]+'</svg>';
let SEARCH_Q="",onSearch=null,onEnter=null;
function crumbs(parts){return '<p class="crumbs">'+parts.map(p=>p[1]?'<a href="'+p[1]+'">'+esc(p[0])+'</a>':esc(p[0])).join(" / ")+'</p>'}
const HOME=()=>t("Главная","Басты бет");

const dc2=x=>x>=10000?num(Math.round(x)):x.toFixed(2).replace(".",",");
// ---------- главная ----------

// ---------- валюты ----------
const FXC={USD:{s:"$",n:["Доллар","Доллар"],f:"США"},EUR:{s:"€",n:["Евро","Еуро"],f:"Европа"},RUB:{s:"₽",n:["Рубль","Рубль"],f:"Россия"},CNY:{s:"¥",n:["Юань","Юань"],f:"Китай"},GBP:{s:"£",n:["Фунт стерлингов","Фунт стерлинг"],f:"Великобритания"},XAU:{s:"Au",n:["Золото","Алтын"],m:1},XAG:{s:"Ag",n:["Серебро","Күміс"],m:1}};
const FXK=["USD","EUR","RUB","CNY","GBP"],FXA=[...FXK],isM=k=>k==="XAU"||k==="XAG",fxList=k=>isM(k)?((window.TM_FX&&TM_FX.banks)||[]):((window.TM_FX&&TM_FX.exchangers)||[]),fxAvail=()=>FXA.filter(k=>fxList(k).some(e=>e.rates&&e.rates[k])),fxDc=x=>x>=10000?num(Math.round(x)):dec(x,2);let FXMODE="buy",FXGRP="all",FXALL=false;
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
let FXPER="90",HOME_OPEN=false;
const PERS=()=>[["7",t("Неделя","Апта")],["30",t("Месяц","Ай")],["90",t("3 мес","3 ай")],["365",t("Год","Жыл")]];
function fxSer(cur,per){
  const h=((window.TM_FX||{}).nbk||{})[cur]||[],n=+(per||FXPER);
  if(n<365)return {h:h.slice(-n),note:""};
  if(h.length>=250)return {h:h.slice(-365),note:""};
  const R=window.TM_RATES||{};
  if(cur==="USD"&&Object.keys(R).length>12){const ks=Object.keys(R).sort().slice(-13);const m=ks.map(k=>[k+"-15",R[k]]);const cut=h.length?h[0][0]:"9";const mm=m.filter(x=>x[0]<cut);return {h:mm.concat(h),note:t("До августа это средние значения за месяц","Тамызға дейін бұл айлық орташа мәндер")}}
  return {h:h,note:t("Годовая история копится, пока есть ","Жылдық тарих жиналуда, әзірге ")+h.length+t(" дн."," күн")};
}
const perBar=()=>'<div class="perb" role="group" aria-label="'+t("Период графика","График кезеңі")+'">'+PERS().map(p=>'<button type="button" data-per="'+p[0]+'" class="'+(FXPER===p[0]?"on":"")+'">'+p[1]+'</button>').join("")+'</div>';
function perLab(){const p=PERS().find(x=>x[0]===FXPER);return p?p[1]:""}
document.addEventListener("click",e=>{const b=e.target.closest("[data-per]");if(!b)return;FXPER=b.dataset.per;const y=window.scrollY;route();window.scrollTo(0,y)});
function fxChart(h){
  const W=640,H=190,P=34,v=h.map(x=>x[1]),mn=Math.min(...v),mx=Math.max(...v),r=(mx-mn)||1;
  const X=i=>P+i*(W-P-8)/(h.length-1),Y=x=>H-22-(x-mn)/r*(H-44);
  const pts=h.map((p,i)=>X(i).toFixed(1)+","+Y(p[1]).toFixed(1)).join(" ");
  const dec2=x=>x<20?x.toFixed(2):x.toFixed(1);
  return '<svg class="fxch" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+t("График официального курса","Ресми бағам графигі")+'"><line x1="'+P+'" x2="'+(W-8)+'" y1="'+Y(mx)+'" y2="'+Y(mx)+'" class="gl"/><line x1="'+P+'" x2="'+(W-8)+'" y1="'+Y(mn)+'" y2="'+Y(mn)+'" class="gl"/>'+
   '<polyline points="'+pts+'" fill="none" stroke="var(--time)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+X(h.length-1)+'" cy="'+Y(v[v.length-1])+'" r="4.5" fill="var(--time)" stroke="var(--card)" stroke-width="2"/>'+
   '<text x="'+P+'" y="'+(Y(mx)-5)+'" class="gt">'+t("макс ","макс ")+dec2(mx)+'</text><text x="'+(P+90)+'" y="'+(Y(mn)+14)+'" class="gt">'+t("мин ","мин ")+dec2(mn)+'</text>'+
   '<text x="'+P+'" y="'+(H-2)+'" class="gt">'+h[0][0].slice(5).split("-").reverse().join(".")+'</text><text x="'+(W-8)+'" y="'+(H-2)+'" text-anchor="end" class="gt">'+h[h.length-1][0].slice(5).split("-").reverse().join(".")+'</text></svg>';
}
const SYM={USD:"$",EUR:"€",RUB:"₽",CNY:"¥",GBP:"£"};
function fxPage(cur){
  const FX=window.TM_FX,AV=fxAvail();
  if(!AV.length){app.innerHTML=crumbs([[HOME(),"#/"],[t("Валюта","Валюта")]])+'<h1>'+t("Валюта","Валюта")+'</h1><div class="card"><p class="lead" style="margin:0">'+t("Курсы появятся после первого сбора данных. Он запускается каждое утро.","Бағамдар деректерді алғашқы жинаудан кейін пайда болады. Ол күн сайын таңертең іске қосылады.")+'</p></div>'+FOOT();return}
  if(!FX||!FXC[cur]||!AV.includes(cur))cur=AV[0];const M=isM(cur);
  const C=FXC[cur],MN=LANG==="kk"?FXM_KK:FXM_RU,dc=fxDc,U=M?t("г","г"):cur;
  const st=fxStat(cur),exAll=fxList(cur).filter(e=>e.rates&&e.rates[cur]),ex=exAll.filter(e=>FXGRP=="all"||(e.type||"exchanger")===FXGRP);
  let mode=FXMODE,amt=M?10:1000,showAll=FXALL;const LIM=innerWidth<=700?5:10;
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
    return rows.slice(0,showAll?999:LIM).map((e,i)=>{const r=e.rates[cur],v=val(e),diff=st?(v/st.last-1)*100:0,tot=amt*v,sav=Math.abs(val(best)-v)*amt;
      return '<tr class="'+(i===0?"best":"")+'"><td class="fxn"><span class="rk">'+(i+1)+'</span><div><b>'+avatar(e.name)+esc(e.name)+'</b> <span class="tb">'+((e.type||"exchanger")==="bank"?t("Банк","Банк"):t("Обменник","Айырбастау"))+'</span><small>'+esc(e.addr)+'</small></div></td>'+
      '<td class="fxr'+(mode==="sell"?" hot":"")+'">'+dc(r[0])+'</td><td class="fxr'+(mode==="buy"?" hot":"")+'">'+dc(r[1])+'</td>'+
      '<td class="fxd">'+(st?'<em class="'+(diff>0?"up":"dn")+'">'+f1(diff)+'</em>':'')+'</td><td class="fxtot">'+num(Math.round(tot))+' ₸'+(i>0?(sav>=1?'<small>'+(mode==="buy"?'+':'−')+num(Math.round(sav))+' ₸ '+t("к лучшему","үздікке қарағанда")+'</small>':''):'<small class="ok">'+t("лучший вариант","үздік нұсқа")+'</small>')+'</td>'+
      '<td class="fxu">'+esc(e.upd.slice(11))+'</td><td><a class="fxgo'+(i===0?" pri":"")+'" href="'+esc(e.url)+'" target="_blank" rel="noopener noreferrer">'+t("Сайт","Сайт")+' ↗</a></td></tr>'}).join("");
  }
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Валюта","Валюта")]])+
   '<h1>'+t("Курсы валют в Алматы","Алматыдағы валюта бағамдары")+'</h1><p class="sub">'+t("Сравниваем обменники и банки: доллар, евро, рубль, юань и фунт. Показываем, где выгоднее купить и продать. Данные Нацбанка на ","Айырбастау пункттері мен банктерді салыстырамыз: валюта, алтын және күміс. Қайда сатып алу және сату тиімді екенін көрсетеміз. Ұлттық банк деректері: ")+esc(FX&&FX.updated||TODAY)+'.</p>'+
   (FX&&FX.demo?'<div class="demo">'+t("Демо-данные: обменники и курсы на странице выдуманы для макета. Реальные появятся после подключения источника.","Демо-деректер: беттегі айырбастау пункттері мен бағамдар макет үшін ойдан шығарылған. Нақтылары дереккөз қосылғаннан кейін шығады.")+'</div>':'')+
   '<section class="card fxpick" id="fxp"><div class="fxq"><span class="ql">'+t("1. Что хотите сделать","1. Не істегіңіз келеді")+'</span><div class="seg big" id="fxm"><button data-m="buy" class="'+(mode==="buy"?"on":"")+'">'+t("Хочу купить","Сатып алғым келеді")+'</button><button data-m="sell" class="'+(mode==="sell"?"on":"")+'">'+t("Хочу продать","Сатқым келеді")+'</button></div></div>'+
    '<div class="fxq"><span class="ql">'+t("2. Выберите валюту или металл","2. Валюта немесе металды таңдаңыз")+'</span><div class="fxt" role="tablist">'+fxAvail().map(k=>{const s2=fxStat(k);return '<button type="button" role="tab" aria-selected="'+(k===cur)+'" class="'+(k===cur?"on":"")+'" data-c="'+k+'"><span class="fxs">'+FXC[k].s+'</span><b>'+t(FXC[k].n[0],FXC[k].n[1])+'</b>'+(s2?'<span>'+dc(s2.last)+' ₸</span>':'')+'</button>'}).join("")+'</div></div>'+
    '<div class="fxq"><span class="ql">'+t("3. Где","3. Қайда")+'</span><div class="seg" id="fxg">'+[["all",t("Все","Барлығы")],["exchanger",t("Обменники","Айырбастау")],["bank",t("Банки","Банктер")]].map(g=>'<button data-g="'+g[0]+'" class="'+(FXGRP===g[0]?"on":"")+'">'+g[1]+' <small>'+(g[0]==="all"?exAll.length:exAll.filter(e=>(e.type||"exchanger")===g[0]).length)+'</small></button>').join("")+(M?'<button disabled class="soonb2" title="'+t("Скоро: б/у золото","Жақында: қолданыстағы алтын")+'">'+t("Ломбарды","Ломбардтар")+' <small>'+t("скоро","жақында")+'</small></button>':'')+'</div></div>'+
    '<div class="fxq"><span class="ql">'+t("4. Где выгоднее всего","4. Қайда ең тиімді")+': '+(mode==="buy"?t("купить ","сатып алу ")+(M?t(C.n[0],C.n[1]).toLowerCase():cur):t("продать ","сату ")+(M?t(C.n[0],C.n[1]).toLowerCase():cur))+(st?' <span class="mut">· '+t("цена Нацбанка ","ҰБ бағасы ")+dc(st.last)+' ₸'+(M?t(" за 1 г"," 1 г үшін"):"")+', <em class="'+(st.ch>0?"up":"dn")+'">'+f1(st.ch)+'</em> '+t("за 30 дней","30 күнде")+'</span>':'')+'</span>'+
    '<div class="fxt3">'+ex.slice().sort((x,y)=>mode==="buy"?x.rates[cur][1]-y.rates[cur][1]:y.rates[cur][0]-x.rates[cur][0]).slice(0,3).map((e,i)=>{const v=mode==="buy"?e.rates[cur][1]:e.rates[cur][0];return '<div class="fxo3'+(i===0?" first":"")+'"><span class="rk">'+(i+1)+'</span><div class="o3n"><b>'+avatar(e.name)+esc(e.name)+'</b><small>'+esc(e.addr)+'</small></div><div class="o3p"><b>'+dc(v)+' ₸</b><small>'+(mode==="buy"?t("за 1 ","1 ")+U:t("за 1 ","1 ")+U)+' · '+t("разница ","айырма ")+f1((e.rates[cur][1]/e.rates[cur][0]-1)*100).replace('+','')+'</small></div><a class="fxgo'+(i===0?" pri":"")+'" href="'+esc(e.url)+'" target="_blank" rel="noopener noreferrer">'+t("Сайт","Сайт")+' ↗</a></div>'}).join("")+'</div></div></section>'+
   '<div class="card fxbox"><div class="fxtool"><h2 style="margin:0;font-size:18px">'+(M?t("Все банки","Барлық банктер"):t("Все обменники","Барлық айырбастау пункттері"))+'</h2>'+
   '<label class="fxamt">'+t("Количество","Мөлшері")+', '+U+' <span class="fxaw"><input id="fxa" inputmode="numeric" value="'+amt+'" aria-label="'+t("Сумма в валюте","Валюта сомасы")+'"><i id="fxs">'+(SYM[cur]||cur)+'</i></span></label></div>'+
   '<div class="fxwrap"><table class="fxtb"><thead><tr><th>'+(M?t("Банк","Банк"):t("Обменник","Айырбастау пункті"))+'</th><th>'+(M?t("Выкупает у вас","Сізден сатып алады"):t("Покупает у вас","Сізден сатып алады"))+'</th><th>'+t("Продает вам","Сізге сатады")+'</th><th>'+t("К курсу НБ","ҰБ бағамына")+'</th><th id="fxth">'+t("Вы заплатите","Сіз төлейсіз")+'</th><th>'+t("Обновлен","Жаңартылды")+'</th><th></th></tr></thead><tbody id="fxb"></tbody></table></div>'+
   (ex.length>LIM&&!showAll?'<button type="button" class="fxmore" id="fxmore">'+t("Показать все ("+ex.length+")","Барлығын көрсету ("+ex.length+")")+'</button>':'')+'<p class="mut fxnote">'+t("Источники: ifin.kz, сайт ЦентрКредит. ","Дереккөздер: ifin.kz, ЦентрКредит сайты. ")+t("Курсы обменников меняются в течение дня, перед визитом проверьте на сайте. Мы не проводим операции, только сравниваем.","Айырбастау пункттерінің бағамы күн ішінде өзгереді, барар алдында сайтта тексеріңіз. Біз операция жасамаймыз, тек салыстырамыз.")+'</p></div>'+
   tipHtml("cur","Проведите пальцем по графику, чтобы увидеть курс на любую дату. Зеленая плашка внизу графика говорит, пора ли брать.","Кез келген күнгі бағамды көру үшін графикті саусақпен жүргізіңіз. Графиктің астындағы жасыл жолақ алуға болатынын айтады.")+tgBlock(cur)+curTools()+tmBlock(cur)+
   '<div id="fcw"></div><h2>'+(M?t("Когда цена может вырасти: ","Баға қашан өсуі мүмкін: "):t("Когда курс может вырасти: ","Бағам қашан өсуі мүмкін: "))+t(FXC[cur].n[0],FXC[cur].n[1])+'</h2>'+
   '<div class="fxan">'+
    '<div class="card"><h3>'+t("Что показывают цифры сейчас","Қазір сандар не көрсетеді")+'</h3>'+(st?(innerWidth<=700?'':'<div class="chrt">'+perBar()+fxChart(fxSer(cur).h)+(fxSer(cur).note?'<p class="mut pnote">'+fxSer(cur).note+'</p>':'')+'</div>')+'<div class="fxv '+vt+'"><b>'+(vt==="buy"?t("Для покупки момент удачный","Сатып алуға сәті түсті"):vt==="sell"?t("Для продажи момент удачный","Сатуға сәті түсті"):t("Ждать или нет: без явного перекоса","Күту керек пе: айқын ауытқу жоқ"))+'</b><span>'+verdict+'</span>'+(cur==="USD"&&seasNote?'<span>'+seasNote+'</span>':'')+'</div>':'<p class="mut">'+t("История цен копится с первого сбора, график и вывод появятся через несколько дней."+(cur==="XAG"?" Для серебра это цены ЦентрКредит, официальной цены Нацбанка нет.":""),"Баға тарихы алғашқы жинаудан бастап жиналады, график пен қорытынды бірнеше күннен кейін пайда болады.")+'</p>')+'</div>'+
'<div class="card sea"><h3>'+t("Сезонность: ближайшие 6 месяцев","Маусымдылық: алдағы 6 ай")+'</h3><p class="mut" style="margin:0 0 12px">'+(M?t("Когда спрос на металл обычно выше или ниже. Типичная картина, а не расчет по данным сайта.","Металл сұранысы қашан жоғары немесе төмен. Типтік көрініс, сайт деректері бойынша есеп емес."):t("Как в среднем менялся курс к прошлому месяцу за "+(Object.keys(rates).length)+" мес. наблюдений.","Бақылаудың "+(Object.keys(rates).length)+" айында бағам өткен айға қатысты орта есеппен қалай өзгерді."))+'</p><div class="sx">'+
     next.map(([m,x],i)=>{let up,w,lab,sub;if(M){const lv=FXGM[m][0];up=lv===2;w=15+lv*30;lab=[t("низкий","төмен"),t("средний","орташа"),t("высокий","жоғары")][lv];sub=t("спрос","сұраныс")}else{up=!x||x.v>=0;w=x?Math.max(4,Math.min(48,Math.abs(x.v)/maxA*48)):2;lab=x?f1(x.v):"—";sub=x?(x.v>=0?t("дорожает","қымбаттайды"):t("дешевеет","арзандайды")):""}
      return '<div class="sxr'+(i===0?" now":"")+'"><div class="sxm">'+MN[m-1]+(i===0?'<em>'+t("сейчас","қазір")+'</em>':'')+'</div><div class="sxt"><i class="'+(up?"up":"dn")+'" style="width:'+w+'%"></i></div><div class="sxv '+(up?"up":"dn")+'">'+lab+'<small>'+sub+'</small></div></div>'}).join("")+'</div><p class="mut" style="margin:12px 0 0;font-size:13px">'+t("Красное: обычно дорожает, зеленое: дешевеет. Данных мало, это ориентир, а не правило.","Қызыл: әдетте қымбаттайды, жасыл: арзандайды. Деректер аз, бұл бағдар, ереже емес.")+'</p></div>'+'</div>'+
   (innerWidth<=700?'<span class="fxcalx"></span><div class="fxcal fxcalx" style="display:none">':'<h3 class="fxh3">'+t("Ближайшие 6 месяцев","Алдағы 6 ай")+'</h3><div class="fxcal">')+next.map(([m,x])=>'<div class="card"><b>'+MN[m-1]+'</b><span class="mut">'+(M?t(FXGM[m][1],FXGM[m][2]):t(FXN[m][0],FXN[m][1]))+'</span>'+(M?'<em class="'+(FXGM[m][0]===2?"up":FXGM[m][0]===0?"dn":"")+'">'+t("спрос ","сұраныс ")+[t("ниже среднего","орташадан төмен"),t("средний","орташа"),t("выше среднего","орташадан жоғары")][FXGM[m][0]]+'</em>':x?'<em class="'+(x.v>=0?"up":"dn")+'">'+t("в прошлые годы ","өткен жылдары ")+f1(x.v)+'</em>':'')+'</div>').join("")+'</div>'+
   '<h3 class="fxh3">'+t(M?"Что влияет на цену":"Что влияет на курс",M?"Бағаға не әсер етеді":"Бағамға не әсер етеді")+'</h3><div class="fxfac">'+(M?FXGF.map(f=>'<div class="card'+(f[0].includes("серебр")&&cur==="XAU"?" dim":"")+'"><div class="fh"><b>'+t(f[0],f[1])+'</b><span class="ar '+f[2]+'">'+(f[2]==="up"?t("цена вверх","баға жоғары"):t("цена вниз","баға төмен"))+'</span></div><p>'+t(f[3],f[4])+'</p></div>'):FXF.map(f=>'<div class="card'+(f[2].includes(cur)?"":" dim")+'"><div class="fh"><b>'+t(f[0],f[1])+'</b><span class="ar '+f[3]+'">'+(f[3]==="up"?t("курс вверх","бағам жоғары"):t("курс вниз","бағам төмен"))+'</span></div><p>'+t(f[4],f[5])+'</p></div>')).join("")+'</div>'+
   '<p class="mut fxdis">'+t("Это ориентир по прошлым данным и типичным причинам, а не обещание и не финансовый совет. Курс может пойти в другую сторону из-за событий, которые заранее не видны.","Бұл өткен деректер мен әдеттегі себептерге негізделген бағдар, уәде де, қаржылық кеңес те емес. Бағам алдын ала көрінбейтін оқиғаларға байланысты басқа бағытқа кетуі мүмкін.")+'</p>'+FOOT();
  const MOB=innerWidth<=700;
  function mcards(){
    const rows=ex.slice().sort((a,b)=>mode==="buy"?a.rates[cur][1]-b.rates[cur][1]:b.rates[cur][0]-a.rates[cur][0]);
    const val=e=>mode==="buy"?e.rates[cur][1]:e.rates[cur][0],best=rows[0];
    return rows.slice(0,showAll?999:LIM).map((e,i)=>{const v=val(e),tot=amt*v,sav=best?Math.abs(val(best)-v)*amt:0;
      const chip=i===0?'<em class="xc ok">'+t("лучший курс","үздік бағам")+'</em>':(sav>=1?'<em class="xc bad">'+(mode==="buy"?"+":"−")+num(Math.round(sav))+' ₸ '+t("к лучшему","үздікке қарағанда")+'</em>':'');
      return '<article class="kr'+(i===0?" best":"")+'"><div class="k1"><div class="kn"><b>'+esc(e.name)+'</b></div><a class="kb" href="'+esc(e.url)+'" target="_blank" rel="noopener noreferrer">'+t("Перейти","Өту")+'</a></div>'+
      '<div class="k2"><span>'+((e.type||"exchanger")==="bank"?t("Банк","Банк"):t("Обменник","Айырбастау"))+'</span><span>'+t("обновлено ","жаңартылды ")+esc(e.upd.slice(11))+'</span></div>'+
      '<div class="k3"><b>'+dc(v)+' <small>₸ / '+U+'</small></b>'+chip+'</div>'+
      '<div class="k4">'+(mode==="buy"?t("Вы заплатите ","Сіз төлейсіз "):t("Вы получите ","Сіз аласыз "))+'<b>'+num(Math.round(tot))+' ₸</b></div>'+
      (e.addr?'<a class="k5" href="https://2gis.kz/almaty/search/'+encodeURIComponent(e.name+" "+e.addr)+'" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg><span>'+esc(e.addr)+'</span><b>'+t("Открыть в 2ГИС","2ГИС-те ашу")+' ↗</b></a>':'')+'</article>'
    }).join("")}
  if(MOB){
    const pk=document.getElementById("fxp"),bx=document.querySelector(".fxbox");
    const chips=fxAvail().map(k=>'<button type="button" data-c="'+k+'" class="mch'+(k===cur?" on":"")+'">'+flag(k,24)+k+'</button>').join("");
    const SR=fxSer(cur);const hero=st?'<div class="mh"><div class="mh1"><span>'+t("Официальный курс Нацбанка","Ұлттық банк бағамы")+'</span><em class="'+(st.ch>0?"up":"dn")+'">'+(st.ch>0?"▲ ":"▼ ")+f1(st.ch)+' · 30 '+t("дн.","күн")+'</em></div><b class="mh2">'+dc(st.last)+' ₸</b>'+perBar()+bigChart(SR.h.map(x=>x[1]),perLab(),SR.h.map(x=>x[0]))+'<div class="mmm"><span>'+t("мин ","мин ")+dc(Math.min(...SR.h.map(x=>x[1])))+'</span><span>'+t("макс ","макс ")+dc(Math.max(...SR.h.map(x=>x[1])))+'</span></div>'+(SR.note?'<p class="pnote">'+SR.note+'</p>':'')+'<p class="mh3 '+vt+'">'+(vt==="buy"?t("Сейчас курс в нижней трети за 3 месяца: хороший момент покупать.","Қазір бағам 3 айдың төменгі үштен біріндe: сатып алуға жақсы сәт."):vt==="sell"?t("Курс в верхней трети за 3 месяца: выгоднее продавать, покупку отложите.","Бағам жоғарғы үштен бірінде: сату тиімді, сатып алуды кейінге қалдырыңыз."):t("Курс в середине диапазона за 3 месяца: явного преимущества нет.","Бағам диапазон ортасында: айқын артықшылық жоқ."))+'</p></div>':'';
    if(pk)pk.outerHTML='<section class="mfx" id="fxp">'+hero+'<div class="mchs">'+chips+'</div><div class="mfxs"><div class="seg big" id="fxm"><button data-m="buy" class="'+(mode==="buy"?"on":"")+'">'+t("Купить","Сатып алу")+'</button><button data-m="sell" class="'+(mode==="sell"?"on":"")+'">'+t("Продать","Сату")+'</button></div></div><div class="seg" id="fxg">'+[["all",t("Все","Барлығы")],["exchanger",t("Обменники","Айырбастау")],["bank",t("Банки","Банктер")]].map(g=>'<button data-g="'+g[0]+'" class="'+(FXGRP===g[0]?"on":"")+'">'+g[1]+'</button>').join("")+'</div><label class="mamt"><span>'+t("Сумма в ","Сома ")+U+'</span><span class="fxaw"><input id="fxa" inputmode="numeric" value="'+amt+'" aria-label="'+t("Сумма в валюте","Валюта сомасы")+'"><i id="fxs">'+(SYM[cur]||cur)+'</i></span></label></section>';
    if(bx)bx.outerHTML='<section class="mlist"><div id="fxcards"></div>'+(ex.length>LIM&&!showAll?'<button type="button" class="fxmore" id="fxmore">'+t("Показать все ("+ex.length+")","Барлығын көрсету ("+ex.length+")")+'</button>':'')+'<p class="mut fxnote">'+t("Источники: ifin.kz, сайт ЦентрКредит. Курсы меняются в течение дня, перед визитом проверьте на сайте. Мы не проводим операции, только сравниваем.","Дереккөздер: ifin.kz, ЦентрКредит сайты. Бағамдар күн ішінде өзгереді, барар алдында сайттан тексеріңіз. Біз операция жасамаймыз, тек салыстырамыз.")+'</p></section>';
  }
  if(MOB){const sec=document.getElementById("fxp"),ml=document.querySelector(".mlist");if(sec&&ml)sec.appendChild(ml)}
  const draw=()=>{if(MOB){document.getElementById("fxcards").innerHTML=mcards();return}document.getElementById("fxb").innerHTML=tbl();document.getElementById("fxth").textContent=mode==="buy"?t("Вы заплатите","Сіз төлейсіз"):t("Вы получите","Сіз аласыз")};
  draw();tmInit();tgInit();cvInit();bgInit();
  document.getElementById("fxp").onclick=e=>{const m=e.target.closest("[data-m]"),c=e.target.closest("[data-c]");
    const g=e.target.closest("[data-g]");
    if(g){FXGRP=g.dataset.g;FXALL=false;const y=window.scrollY;fxPage(cur);window.scrollTo(0,y);return}
    if(m){FXMODE=m.dataset.m;const y=window.scrollY;fxPage(cur);window.scrollTo(0,y)}
    else if(c){FXALL=false;history.replaceState(null,"","#/currency/"+c.dataset.c);const y=window.scrollY;fxPage(c.dataset.c);window.scrollTo(0,y)}};
  const mo=document.getElementById("fxmore");if(mo)mo.onclick=()=>{FXALL=true;const y=window.scrollY;fxPage(cur);window.scrollTo(0,y)};
  document.getElementById("fxa").oninput=e=>{amt=parseInt(String(e.target.value).replace(/\D/g,""),10)||0;draw()};
  onSearch=()=>{};onEnter=()=>{location.hash="#/smartphones"};
  if(window.__goList){window.__goList=0;const tg=MOB?document.querySelector(".mchs"):document.querySelector(".fxbox");if(tg)setTimeout(()=>{const th=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--toph"))||0;window.scrollTo(0,Math.max(0,tg.getBoundingClientRect().top+window.scrollY-th-10))},30)}
}
document.addEventListener("click",e=>{if(e.target.closest(".bmore"))window.__goList=1});

// ---------- квартиры ----------
const QEND={I:3,II:6,III:9,IV:12};
function dpast(d){const m=/(IV|III|II|I) кв\. (\d{4})/.exec(d);if(!m||/Сдан|Построен/.test(d))return d;const e=new Date(+m[2],QEND[m[1]],0);return e<new Date()?d+" ("+t("срок прошел, уточняйте","мерзімі өтті, нақтылаңыз")+")":d}
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
  const card=(tt,c,line,ic)=>c?'<a class="card apt3" href="#apt-'+c.id+'" data-goto="'+c.id+'"><span class="a3i">'+ic+'</span><small>'+tt+'</small><b class="a3n">'+t("ЖК ","ТК ")+esc(c.name)+'</b><em>'+line+'</em><span class="a3d">'+esc(dn(c.dev))+'</span><span class="a3d">'+esc((c.district||"").split(",")[0])+'</span><span class="a3g">'+t("Показать карточку","Карточканы көрсету")+' ↓</span></a>':"";
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
const likes=()=>{try{return JSON.parse(localStorage.getItem("tm_like")||"[]").filter(id=>APT().complexes.some(c=>c.id===id)).slice(-2)}catch(e){return[]}};
const setLikes=a=>{try{localStorage.setItem("tm_like",JSON.stringify(a))}catch(e){}window.__lk=a};
function cmpBar(){
  let el=document.getElementById("cmpbar");const L=window.__lk||likes(),A=APT().complexes;
  if(!/^#\/apartments/.test(location.hash)||!L.length){if(el)el.remove();return}
  if(!el){el=document.createElement("div");el.id="cmpbar";document.body.appendChild(el)}
  const nm=id=>(A.find(c=>c.id===id)||{}).name||id;
  el.innerHTML=L.length>1?'<div class="cb2"><div><b>'+t("Сравнить ","Салыстыру ")+L.length+t(" ЖК?"," ТК?")+'</b><span>'+L.map(i=>esc(nm(i))).join(", ")+'</span></div><a href="#/duel/'+L.join("/")+'">'+t("Сравнить","Салыстыру")+'</a><button type="button" id="cbx" aria-label="'+t("Сбросить","Тазарту")+'">×</button></div>':'<div class="cb2 one"><div><b>'+esc(nm(L[0]))+'</b><span>'+t("Отметьте сердечком еще один или два ЖК, чтобы сравнить","Салыстыру үшін тағы бір-екі ТК-ны жүрекшемен белгілеңіз")+'</span></div><button type="button" id="cbx" aria-label="'+t("Сбросить","Тазарту")+'">×</button></div>';
  document.getElementById("cbx").onclick=()=>{setLikes([]);document.querySelectorAll(".lk.on").forEach(b=>{b.classList.remove("on");b.setAttribute("aria-pressed","false")});cmpBar()};
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-like]");if(!b)return;e.preventDefault();let L=likes();const id=b.dataset.like;L=L.includes(id)?L.filter(x=>x!==id):L.concat(id).slice(-3);setLikes(L);document.querySelectorAll("[data-like]").forEach(x=>{const on=L.includes(x.dataset.like);x.classList.toggle("on",on);x.setAttribute("aria-pressed",on)});cmpBar()});
document.addEventListener("click",e=>{const g=e.target.closest("[data-goto]");if(!g)return;e.preventDefault();const el=document.getElementById("apt-"+g.dataset.goto);if(!el){APT_DEV="all";APT_DIST="all";APT_CLS="all";APT_ONLY.clear();aptPage();aptHero()}const c=document.getElementById("apt-"+g.dataset.goto);if(!c)return;c.classList.remove("mhide");c.scrollIntoView({behavior:"smooth",block:"center"});c.classList.add("pulse");setTimeout(()=>c.classList.remove("pulse"),1800)});
function aptCard(c){
  const A=APT(),dev=A.developers.find(d=>d.id===c.dev)||{name:c.dev},P=c.m2*APT_AREA,mn=t("мес","ай");
  const kf=(lab,val,sub,off)=>'<div class="kf'+(off?" off":"")+'"><small>'+lab+'</small><b>'+val+'</b><span>'+sub+'</span></div>';
  const mortPay=c.mort?Math.round(aptMonthly(P*(1-c.mort.pct/100),c.mort.rate,c.mort.years)/1000)*1000:0;
  const instPay=c.inst?Math.round(P*(1-c.inst.pct/100)/c.inst.months/1000)*1000:0;
  const keys=kf(t("Ипотека","Ипотека"),c.mort?t("от ","бастап ")+c.mort.pct+'%':t("не указано","көрсетілмеген"),c.mort?c.mort.rate+'% · '+c.mort.years+' '+t("лет","жыл"):t("уточняйте","нақтылаңыз"),!c.mort)+
   kf(t("Рассрочка","Бөліп төлеу"),c.inst?c.inst.pct+'%':t("не указано","көрсетілмеген"),c.inst?c.inst.months+' '+mn:t("уточняйте","нақтылаңыз"),!c.inst)+
   kf(t("Сдача","Тапсыру"),c.status==="done"?t("Сдан","Тапсырылған"):c.delivery[0].split(": ").pop(),c.status==="done"?"":(dpast(c.delivery[0].split(": ").pop())!==c.delivery[0].split(": ").pop()?'<i class="late">'+t("срок прошел","мерзімі өтті")+'</i> ':"")+(c.delivery.length>1?c.delivery.length+" "+t("очереди","кезек"):t("одна очередь","бір кезек")));
  const pay=(c.mort||c.inst)?'<div class="apay">'+(c.mort?'<div><small>'+t("Ипотека, взнос ≈ ","Ипотека, жарна ≈ ")+mln(P*c.mort.pct/100)+'</small><b>≈ '+num(mortPay)+' ₸/'+mn+'</b></div>':'')+(c.inst?'<div><small>'+t("Рассрочка, взнос ≈ ","Бөліп төлеу, жарна ≈ ")+mln(P*c.inst.pct/100)+'</small><b>≈ '+num(instPay)+' ₸/'+mn+'</b></div>':'')+'</div>':'<p class="mut anone">'+t("Условия взноса и рассрочки не указаны, уточняйте у застройщика.","Жарна мен бөліп төлеу шарттары көрсетілмеген, құрылысшыдан нақтылаңыз.")+'</p>';
  const sale=c.units[0]&&c.units[1]?'<div class="abar"><div><i style="width:'+Math.round(c.units[1]/c.units[0]*100)+'%"></i></div><span>'+t("в продаже ","сатылымда ")+c.units[1]+' '+t("из ","/ ")+c.units[0]+'</span></div>':(c.units[0]?'<div class="abar"><span>'+t("Квартир: ","Пәтер: ")+c.units[0]+'</span></div>':'');
  return '<article class="card aptc" id="apt-'+c.id+'"><div class="aimg">'+aptArt(c)+(c.img?'<img class="aphoto" src="'+esc(c.img)+'" alt="'+esc(c.name)+'" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'<span class="adev2 '+c.dev+'">'+esc(dev.name)+'</span><div class="atag">'+(aptD(c)!=null?'<span class="cl ndist">'+kmTxt(aptD(c))+'</span>':'')+'<span class="cl '+c.cls+'">'+t(CLSN[c.cls][0],CLSN[c.cls][1])+'</span><span class="st '+c.status+'">'+(c.status==="done"?t("Сдан","Тапсырылған"):t("Строится","Салынуда"))+'</span></div></div>'+
   '<div class="abody"><div class="aname"><h3>'+esc(c.name)+'</h3><button type="button" class="lk'+(likes().includes(c.id)?" on":"")+'" data-like="'+c.id+'" aria-pressed="'+likes().includes(c.id)+'" aria-label="'+t("Добавить к сравнению","Салыстыруға қосу")+'"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 5 6 5c2 0 3.4 1.1 4.3 2.4h3.4C14.6 6.1 16 5 18 5c3.3 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z"/></svg></button></div><small class="mut">'+esc(c.district)+'</small>'+
   '<div class="ap"><div><small>'+(c.resale?t("от (не от застройщика)","бастап (құрылысшыдан емес)"):t("Цена от","Бағасы бастап"))+'</small><b>'+num(c.m2)+' ₸<i>/м²</i></b></div><div><small>'+APT_AREA+' м² '+t("от","бастап")+'</small><b>≈ '+mln(P)+'</b></div></div>'+
   '<div class="akf">'+keys+'</div>'+pay+(c.mort?'<div class="apm"><span>'+t("Ипотека ≈ ","Ипотека ≈ ")+num(mortPay)+' ₸/'+mn+'</span><span>'+t("нужен доход от ","табыс кемінде ")+num(mortPay*2)+' ₸</span></div>':'')+
   (c.promos.length?'<div class="ach">'+c.promos.map(p=>'<span class="pr">'+esc(p)+'</span>').join("")+'</div>':'')+
   '<details class="adet"><summary>'+t("Все очереди сдачи","Барлық тапсыру кезеңдері")+'</summary><ul>'+c.delivery.map(d=>'<li>'+esc(dpast(d))+'</li>').join("")+'</ul></details>'+sale+
   '<div class="afoot"><span class="mut">'+esc(c.upd)+'</span><span class="afl"><a class="fxgo" href="https://2gis.kz/almaty/search/'+encodeURIComponent(c.name+" ЖК")+'" target="_blank" rel="noopener noreferrer">'+t("На карте","Картада")+' ↗</a><a class="fxgo pri" href="'+esc(c.url)+'" target="_blank" rel="noopener noreferrer">'+t("Подробнее","Толығырақ")+' ↗</a></span></div>'+
   (c.stale?'<p class="mut astale">'+t("Данные могут быть устаревшими: источник не получает подробности от этого застройщика.","Деректер ескірген болуы мүмкін: дереккөз бұл құрылысшыдан толық мәлімет алмайды.")+'</p>':'')+'</div></article>';
}
const DMAP={alatau:{d:"M20 28q0-8 8-8h169q8 0 8 8v109q0 8-8 8H28q-8 0-8-8z",x:112,y:82},zhetysu:{d:"M215 28q0-8 8-8h134q8 0 8 8v79q0 8-8 8H223q-8 0-8-8z",x:290,y:66},turksib:{d:"M375 28q0-8 8-8h149q8 0 8 8v79q0 8-8 8H383q-8 0-8-8z",x:458,y:66},nauryz:{d:"M20 163q0-8 8-8h79q8 0 8 8v159q0 8-8 8H28q-8 0-8-8z",x:68,y:240},auezov:{d:"M125 163q0-8 8-8h104q8 0 8 8v79q0 8-8 8H133q-8 0-8-8z",x:185,y:205},almaly:{d:"M255 133q0-8 8-8h109q8 0 8 8v74q0 8-8 8H263q-8 0-8-8z",x:318,y:170},medeu:{d:"M390 133q0-8 8-8h134q8 0 8 8v124q0 8-8 8H398q-8 0-8-8z",x:465,y:197},bostandyk:{d:"M125 268q0-8 8-8h122v-33q0-8 8-8h109q8 0 8 8v95q0 8-8 8H133q-8 0-8-8z",x:255,y:285}};
let LF=0;
function leafLoad(ok,bad){
  if(window.L){ok();return}
  if(LF===2){bad&&bad();return}
  if(LF===1){document.addEventListener("tm-leaf",e=>e.detail?ok():(bad&&bad()),{once:true});return}
  LF=1;const U="https://unpkg.com/leaflet@1.9.4/dist/",done=g=>{LF=g?3:2;document.dispatchEvent(new CustomEvent("tm-leaf",{detail:g}))};
  const l=document.createElement("link");l.rel="stylesheet";l.href=U+"leaflet.css";document.head.appendChild(l);
  const s=document.createElement("script");s.src=U+"leaflet.js";s.onload=()=>{done(1);ok()};s.onerror=()=>{done(0);bad&&bad()};document.head.appendChild(s);
}
function aptLeaf(){
  const el=document.getElementById("lmap");if(!el)return;
  if(!window.L){leafLoad(aptLeaf,()=>{el.innerHTML='<p class="mut" style="padding:20px;text-align:center">'+t("Карта не загрузилась. Список ЖК ниже работает как обычно.","Карта жүктелмеді. ТК тізімі төменде жұмыс істейді.")+'</p>'});return}
  const A=APT(),m=L.map(el,{scrollWheelZoom:false,zoomSnap:.5,tap:false,zoomControl:true}).setView([43.2420,76.9000],11.5);
  m.attributionControl.setPrefix(false);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(m);
  const b=[],G=n=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(n+" ЖК Алматы"),D=n=>"https://2gis.kz/almaty/search/"+encodeURIComponent(n+" ЖК");
  A.complexes.filter(c=>c.ll).forEach(c=>{b.push(c.ll);
    const ic=L.divIcon({className:"lpin d-"+c.dev,html:"<i></i><span>"+Math.round(c.m2/1000)+"k</span>",iconSize:[16,16],iconAnchor:[8,8]});
    L.marker(c.ll,{icon:ic}).addTo(m).bindPopup("<b>"+esc(c.name)+"</b><br>"+esc(c.district||"")+(c.lla?"<br><i>"+t("метка примерная, по району","белгі шамамен, аудан бойынша")+"</i>":"")+"<br><b>"+num(c.m2)+" ₸/м²</b><div class=\"lpl\"><a href=\""+D(c.name)+"\" target=\"_blank\" rel=\"noopener noreferrer\">2ГИС</a><a href=\""+G(c.name)+"\" target=\"_blank\" rel=\"noopener noreferrer\">Google Maps</a></div>")});
  if(APT_PT){L.marker(APT_PT.ll,{icon:L.divIcon({className:"lme",html:"<i></i>",iconSize:[22,22],iconAnchor:[11,11]})}).addTo(m);if(APT_R){const ci=L.circle(APT_PT.ll,{radius:APT_R*1000,color:"#2742c9",weight:2,fillOpacity:.07}).addTo(m);b.length=0;b.push(...ci.getBounds().pad(.05).getSouthWest&&[[ci.getBounds().getSouth(),ci.getBounds().getWest()],[ci.getBounds().getNorth(),ci.getBounds().getEast()]])}else b.push(APT_PT.ll)}
  const lab=()=>el.classList.toggle("lbl",m.getZoom()>=13);
  m.on("zoomend",lab);lab();
  const fit=()=>{m.invalidateSize();if(b.length>1)m.fitBounds(b,{padding:[24,24]});lab()};
  fit();setTimeout(fit,300);setTimeout(fit,1200);
  if(window.ResizeObserver){let first=true;new ResizeObserver(()=>{m.invalidateSize();if(first){first=false;fit()}}).observe(el)}
  addEventListener("orientationchange",()=>setTimeout(fit,300));
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
  return '<section class="card amapc"><div class="amh"><div><h2 style="margin:0">'+t("Где находятся ЖК","ТК қайда орналасқан")+'</h2><p class="mut" style="margin:4px 0 0;font-size:13.5px">'+t("Положение меток примерное, точное место смотрите в 2ГИС по кнопке \"На карте\". Точка это ЖК: нажмите на нее, увидите цену и кнопки 2ГИС и Google Maps. Приблизьте карту, и появятся цены за м² (тыс. ₸).","Белгілердің орны шамамен, нақты орынды \"Картада\" батырмасы арқылы 2ГИС-тен қараңыз. Нүктені басыңыз: баға және 2ГИС пен Google Maps батырмалары шығады. Картаны үлкейтсеңіз, м² бағасы (мың ₸) көрінеді.")+'</p></div>'+(APT_DIST!=="all"?'<button type="button" class="ach2 on" data-dist="all">'+t("Показать все районы","Барлық аудандар")+' ×</button>':'')+'</div>'+
   '<div class="amw" id="aml">'+'<div id="lmap" class="lmap"></div>'+'<div class="amside"><div class="amleg"><span class="lg bi"></span>BI Group <span class="lg bz"></span>BAZIS-A</div>'+
   A.districts.filter(d=>(by[d[0]]||[]).length).map(d=>'<button type="button" class="amrow'+(APT_DIST===d[0]?" on":"")+'" data-dist="'+d[0]+'"><b>'+esc(t(d[1],d[2]))+'</b><span>'+by[d[0]].map(c=>esc(c.name)).join(", ")+'</span></button>').join("")+
   (none.length?'<button type="button" class="amrow'+(APT_DIST==="none"?" on":"")+'" data-dist="none"><b>'+t("Район не указан","Аудан көрсетілмеген")+'</b><span>'+none.map(c=>esc(c.name)).join(", ")+'</span></button>':'')+'</div></div></section>';
}

function finBlock(kind){
  const F=window.TM_FIN;if(!F)return"";
  const mort=kind==="mort";
  const rn=x=>{const m=String(x).replace(",",".").match(/\d+(\.\d+)?/);return m?parseFloat(m[0]):0},col=v=>v<=10?"g":v<=17?"y":"r";
  const rows=(mort?F.mortgage:F.deposits).map(r=>{
    const v=Math.max.apply(null,(r[1].replace(/,\s*затем.*$/,"").replace(",",".").match(/\d+(\.\d+)?/g)||[0]).map(Number)),m=r[1].match(/^(.*?),\s*(затем .*)$/),main=m?m[1]:r[1],sub=m?m[2]:"";
    return '<div class="mqi"><div class="mqt"><div class="mqn">'+esc(r[0])+'</div><div class="mqd">'+(mort?'<b>'+t("Взнос ","Жарна ")+esc(r[2])+'</b> · ':'<b>'+esc(r[2])+'</b> · ')+esc(r[3])+'</div></div><div class="mqv '+(mort?col(v):"g")+'"><strong'+(main.length>7?' class="sm"':'')+'>'+esc(main)+'</strong><span>'+(sub?esc(sub):(mort?t("в год","жылына"):t("в год","жылына")))+'</span></div></div>'}).join("");
  const h=mort?t("Ипотека: сколько платить в месяц","Ипотека: айына қанша төлеу керек"):t("Куда положить деньги: депозиты","Ақшаны қайда салу керек: депозиттер");
  const intro=mort?t("Ставка: сколько банк берет за год. Взнос: сколько денег нужно отдать сразу. Посчитайте свой платеж ниже.","Мөлшерлеме: банк жылына қанша алады. Жарна: бірден қанша ақша беру керек. Төлемді төменде есептеңіз."):t("Чем выше ставка, тем больше денег вам выплатит банк за год.","Мөлшерлеме жоғары болған сайын банк жылына көбірек төлейді.");
  const n=mort?t("Ставки по статьям krisha.kz и finratings.kz за октябрь и ноябрь 2026, в банках они меняются. Базовая ставка Нацбанка ","Мөлшерлемелер krisha.kz және finratings.kz мақалалары бойынша, банктерде өзгереді. Ұлттық банктің базалық мөлшерлемесі ")+F.base.rate+"% ("+F.base.date+").":t("Данные zakon.kz от 2 ноября 2026. ","zakon.kz деректері, 2026 жылғы 2 қараша. ")+esc(F.ins)+'. <a href="'+F.srcDep+'" target="_blank" rel="noopener">'+t("Источник","Дереккөз")+'</a>.';
  const calc=mort?'<div class="mqc" id="mqc"><div class="mqf"><label>'+t("Цена квартиры, ₸","Пәтер бағасы, ₸")+'<input id="mq-p" inputmode="numeric" value="25 000 000"></label><label>'+t("Первый взнос","Алғашқы жарна")+'<select id="mq-d"><option value="10">10%</option><option value="20" selected>20%</option><option value="30">30%</option><option value="50">50%</option></select></label><label>'+t("Срок","Мерзімі")+'<select id="mq-y"><option value="10">10 '+t("лет","жыл")+'</option><option value="15" selected>15 '+t("лет","жыл")+'</option><option value="20">20 '+t("лет","жыл")+'</option><option value="25">25 '+t("лет","жыл")+'</option></select></label><label>'+t("Банк","Банк")+'<select id="mq-b">'+F.mortgage.map((r,i)=>'<option value="'+rn(r[1])+'"'+(r[0].indexOf("Bereke")>=0?" selected":"")+'>'+esc(r[0])+' · '+esc(r[1].replace(/,\s*затем.*$/,""))+'</option>').join("")+'</select></label></div><div class="mqo"><span>'+t("Платеж в месяц","Айлық төлем")+'</span><strong id="mq-r">...</strong><em id="mq-x"></em></div></div>':'';
  return '<section class="nfin" id="'+(mort?"mort":"dep")+'"><h2>'+h+'</h2><p class="mqin">'+intro+'</p>'+calc+(mort?'<div class="nfl"><span class="g">'+t("до 10%","10%-ға дейін")+'</span><span class="y">10–17%</span><span class="r">'+t("выше 17%","17%-дан жоғары")+'</span></div>':'')+'<div class="mql">'+rows+'</div><p class="mut nfnote">'+n+' '+t("Проверено ","Тексерілді ")+F.updated+'.</p></section>';
}
function finCalc(){
  const c=document.getElementById("mqc");if(!c)return;
  const g=id=>document.getElementById(id);
  const go=()=>{const P=parseFloat(String(g("mq-p").value).replace(/\D/g,""))||0,d=+g("mq-d").value,y=+g("mq-y").value,rate=+g("mq-b").value,L=P*(1-d/100),r=rate/1200,k=y*12;
    const pay=r?L*r/(1-Math.pow(1+r,-k)):L/k;
    g("mq-r").textContent=P?"≈ "+num(Math.round(pay/1000)*1000)+" ₸":"—";
    g("mq-x").textContent=P?t("Отдать сразу: ","Бірден беру: ")+num(Math.round(P*d/100))+" ₸. "+t("Переплата банку: ","Банкке артық төлем: ")+num(Math.round((pay*k-L)/1000)*1000)+" ₸. "+t("Банк обычно хочет, чтобы платеж был не больше половины дохода: нужно от ","Банк әдетте төлем табыстың жартысынан аспауын қалайды: қажет ")+num(Math.round(pay*2/1000)*1000)+" ₸ "+t("в месяц.","айына."):""};
  c.querySelectorAll("input,select").forEach(x=>{x.oninput=go;x.onchange=go});
  g("mq-p").onblur=()=>{const v=String(g("mq-p").value).replace(/\D/g,"");g("mq-p").value=v?num(+v):"";go()};
  go();
}
/* v16: converter, budget, lightbox */
let CV={a:100000,f:"KZT",to:"USD"};
const CVL=["KZT","USD","EUR","RUB","CNY","GBP"];
function cvRate(k){if(k==="KZT")return 1;const s=fxStat(k);return s?s.last:null}
function cvOut(){const rf=cvRate(CV.f),rt=cvRate(CV.to);if(!rf||!rt||!(CV.a>=0))return"";const r=CV.a*rf/rt;return (r>=100?num(r):dec(r,2))+" "+(CV.to==="KZT"?"₸":CV.to)}
function convBlock(){
  if(!fxStat("USD"))return"";
  const op=s=>CVL.map(k=>'<option value="'+k+'"'+(k===s?" selected":"")+'>'+k+'</option>').join("");
  return '<section class="cvb" id="conv"><h2>'+t("Конвертер","Конвертер")+'</h2><div class="cvr"><input id="cva" inputmode="decimal" value="'+CV.a+'" aria-label="'+t("Сумма","Сома")+'"><select id="cvf" aria-label="'+t("Из","Қайдан")+'">'+op(CV.f)+'</select></div>'+
  '<button class="cvs" id="cvw" type="button" aria-label="'+t("Поменять местами","Орнын ауыстыру")+'"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v14M3 14l4 4 4-4M17 20V6M13 10l4-4 4 4"/></svg></button>'+
  '<div class="cvr cvo"><output id="cvo">'+cvOut()+'</output><select id="cvt" aria-label="'+t("В","Қайда")+'">'+op(CV.to)+'</select></div>'+
  '<p class="mut">'+t("По официальному курсу Нацбанка. В обменнике курс другой: смотрите таблицу ниже.","Ұлттық банктің ресми бағамы бойынша. Айырбастау пунктінде бағам басқа: төмендегі кестені қараңыз.")+'</p></section>';
}
function cvInit(){
  const a=document.getElementById("cva");if(!a)return;
  const up=()=>{CV.a=parseFloat(String(a.value).replace(/\s/g,"").replace(",","."))||0;document.getElementById("cvo").textContent=cvOut()};
  a.addEventListener("input",up);
  document.getElementById("cvf").addEventListener("change",e=>{CV.f=e.target.value;up()});
  document.getElementById("cvt").addEventListener("change",e=>{CV.to=e.target.value;up()});
  document.getElementById("cvw").addEventListener("click",()=>{const x=CV.f;CV.f=CV.to;CV.to=x;document.getElementById("cvf").value=CV.f;document.getElementById("cvt").value=CV.to;up()});
}
let BUD={m:30,a:45};
function budList(){const A=APT();return A.complexes.filter(c=>c.m2*BUD.a<=BUD.m*1e6).sort((x,y)=>y.m2-x.m2)}
function budBlock(){
  const L=budList(),A=APT(),dn=id=>(A.developers.find(d=>d.id===id)||{}).name||id;
  const rows=L.slice(0,6).map(c=>'<button class="bdr" type="button" data-bud="'+c.id+'"><span><b>'+esc(c.name)+'</b><small>'+esc(dn(c.dev))+' · '+num(c.m2)+' ₸/м²</small></span><em>'+dec(c.m2*BUD.a/1e6,1)+' '+t("млн","млн")+'</em></button>').join("");
  return '<section class="card bud" id="bud"><h2>'+t("Подбор под ваш бюджет","Бюджетіңізге сай таңдау")+'</h2><div class="bdi"><label class="fxamt">'+t("Бюджет, млн ₸","Бюджет, млн ₸")+' <input id="bdm" inputmode="decimal" value="'+BUD.m+'"></label>'+
   '<div class="bda" id="bdc">'+[30,45,60,80].map(v=>'<button type="button" data-ba="'+v+'" class="'+(BUD.a===v?"on":"")+'">'+v+' м²</button>').join("")+'</div></div>'+
   '<p class="bds" id="bds">'+(L.length?t("Подходит ЖК: ","Сәйкес ТК: ")+'<b>'+L.length+'</b>. '+t("Показаны самые дорогие, что вам по карману.","Қалтаңызға сай ең қымбаттары көрсетілген."):t("Для "+BUD.a+" м² за "+BUD.m+" млн пока ничего нет. Попробуйте меньшую площадь или больший бюджет.","Бұл бюджетке "+BUD.a+" м² әзірге жоқ. Аумағын кішірейтіп немесе бюджетті арттырып көріңіз."))+'</p>'+
   '<div class="bdl" id="bdl">'+rows+'</div><p class="mut">'+t("Цена считается как цена за м² от застройщика, умноженная на площадь. Итог зависит от этажа и планировки.","Баға құрылысшының м² бағасын ауданға көбейту арқылы есептеледі. Қорытынды баға қабатқа және жоспарлауға байланысты.")+'</p></section>';
}
function budInit(){
  const root=document.getElementById("bud");if(!root)return;
  const draw=()=>{const nb=document.createElement("div");nb.innerHTML=budBlock();root.querySelector("#bds").outerHTML=nb.querySelector("#bds").outerHTML;root.querySelector("#bdl").outerHTML=nb.querySelector("#bdl").outerHTML;root.querySelectorAll("#bdc button").forEach(b=>b.classList.toggle("on",+b.dataset.ba===BUD.a))};
  root.querySelector("#bdm").addEventListener("input",e=>{BUD.m=parseFloat(String(e.target.value).replace(",","."))||0;draw()});
  root.querySelector("#bdc").addEventListener("click",e=>{const b=e.target.closest("[data-ba]");if(!b)return;BUD.a=+b.dataset.ba;draw()});
  root.addEventListener("click",e=>{const b=e.target.closest("[data-bud]");if(b)aptGo(b.dataset.bud)});
}
/* lightbox */
function lbOpen(id){
  const c=APT().complexes.find(x=>x.id===id);if(!c)return;
  const im=(c.imgs&&c.imgs.length?c.imgs:[c.img]).filter(Boolean);if(!im.length)return;
  let i=0;const o=document.createElement("div");o.className="lb";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");
  const show=()=>{o.querySelector("img").src=im[i];o.querySelector(".lbn").textContent=im.length>1?(i+1)+" / "+im.length:""};
  o.innerHTML='<button class="lbx" type="button" aria-label="'+t("Закрыть","Жабу")+'">×</button><img alt="'+esc(c.name)+'" referrerpolicy="no-referrer"><div class="lbc"><b>'+esc(c.name)+'</b><span class="lbn"></span>'+(c.url?'<a href="'+esc(c.url)+'" target="_blank" rel="noopener noreferrer">'+t("Все фото и планировки на krisha.kz","krisha.kz-тегі барлық фото және жоспарлар")+'</a>':'')+'</div>';
  document.body.appendChild(o);document.body.classList.add("lbo");show();requestAnimationFrame(()=>o.classList.add("in"));
  const go=d=>{i=(i+d+im.length)%im.length;show()},close=()=>{o.classList.remove("in");document.body.classList.remove("lbo");document.removeEventListener("keydown",kd);setTimeout(()=>o.remove(),220)};
  const kd=e=>{if(e.key==="Escape")close();else if(e.key==="ArrowRight")go(1);else if(e.key==="ArrowLeft")go(-1)};
  document.addEventListener("keydown",kd);
  o.addEventListener("click",e=>{if(e.target.closest(".lbx")||e.target===o)close()});
  let sx=0,sy=0;o.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  o.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dy)>80&&Math.abs(dy)>Math.abs(dx))close();else if(Math.abs(dx)>50)go(dx<0?1:-1)},{passive:true});
}
document.addEventListener("click",e=>{const p=e.target.closest(".aptc .aimg");if(!p||e.target.closest("[data-like],a,button"))return;const card=p.closest(".aptc");if(card&&card.id&&p.querySelector(".aphoto"))lbOpen(card.id.replace(/^apt-/,""))});

/* theme */
const THM=()=>document.documentElement.getAttribute("data-theme")==="dark";
function setTheme(d,anim){const r=document.documentElement;if(anim){r.classList.add("tmx");setTimeout(()=>r.classList.remove("tmx"),450)}r.setAttribute("data-theme",d?"dark":"light");try{localStorage.setItem("tm_theme",d?"dark":"light")}catch(e){}
  document.querySelectorAll('meta[name="theme-color"]').forEach(m=>m.setAttribute("content",d?"#0b0e14":"#ffffff"));document.querySelectorAll(".thm").forEach(b=>{b.innerHTML=thmIco();b.setAttribute("aria-label",d?t("Светлая тема","Жарық тақырып"):t("Темная тема","Қараңғы тақырып"))})}
const thmIco=()=>THM()?'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>':'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
document.addEventListener("click",e=>{const b=e.target.closest(".thm");if(!b)return;setTheme(!THM(),true);b.classList.add("sp");setTimeout(()=>b.classList.remove("sp"),400)});
try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",e=>{if(!localStorage.getItem("tm_theme"))setTheme(e.matches,true)})}catch(e){}

/* v20: verdict, freshness warning, wallet */
function staleInfo(){
  const u=X0.updated_at||(X0.updated?X0.updated+"T12:00:00Z":null);if(!u)return null;
  const hrs=(Date.now()-Date.parse(u))/36e5;if(!isFinite(hrs))return null;
  return hrs>30?{lvl:"old",hrs}:hrs>8&&X0.updated_at?{lvl:"warn",hrs}:null;
}
function staleHtml(){
  const s=staleInfo();if(!s)return"";
  const d=Math.floor(s.hrs/24);
  const tx=s.lvl==="old"?t("Курсы не обновлялись "+(d>=1?d+" дн.":"больше суток")+" Уточните в обменнике.","Бағамдар "+(d>=1?d+" күн":"бір тәуліктен астам")+" жаңартылмады. Пункттен нақтылаңыз."):t("Данные устарели, проверьте в обменнике.","Деректер ескірген, пункттен тексеріңіз.");
  return '<div class="stl '+s.lvl+'" role="status">'+tx+'</div>';
}
const MAPQ=()=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(t("обмен валюты","валюта айырбастау"));
function verdictBlock(){
  const st=fxStat("USD");if(!st)return"";
  const pos=st.pos,vt=pos<.33?"buy":pos>.66?"sell":"mid";
  const H={buy:[t("Покупать","Сатып алу"),t("Курс в нижней трети за 3 месяца.","Бағам 3 айдың төменгі үштен бірінде.")],
   mid:[t("Не спешить","Асықпаңыз"),t("Курс посередине диапазона.","Бағам диапазонның ортасында.")],
   sell:[t("Дорого","Қымбат"),t("Курс в верхней трети за 3 месяца.","Бағам 3 айдың жоғарғы үштен бірінде.")]}[vt];
  return '<section class="vrd '+vt+'"><div class="vrh"><div class="vrt"><small>'+t("Совет по доллару","Доллар бойынша кеңес")+'</small><b>'+H[0]+'</b></div><div class="vra"><a class="vb" href="#/currency/USD">'+t("Где выгоднее","Қайда тиімді")+'</a><a class="vb vb2 vbi" href="#near" data-near="1" aria-label="'+t("Обменник рядом","Жақын айырбастау")+'"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg></a></div></div><p>'+H[1]+'</p>'+staleHtml()+'</section>';
}
/* wallet */
const WL=()=>{try{return JSON.parse(localStorage.getItem("tm_wallet")||"[]")}catch(e){return[]}};
const WS=v=>{try{localStorage.setItem("tm_wallet",JSON.stringify(v))}catch(e){}};
function walletPage(){
  const L=WL(),cur=["USD","EUR","RUB","CNY","GBP"];
  let tot=0,cost=0;
  const rows=L.map((w,i)=>{const s=fxStat(w.c);const now=s?s.last:null;const val=now?w.a*now:null,cs=w.a*w.r,pl=val!=null?val-cs:null;if(val!=null){tot+=val;cost+=cs}
    return '<div class="wr"><div class="wrl"><b>'+num(w.a)+' '+w.c+'</b><small>'+t("куплено по ","куплынған баға ")+dec(w.r,2)+' ₸ · '+esc(w.d||"")+'</small></div><div class="wrr"><b>'+(val!=null?num(val)+' ₸':"")+'</b>'+(pl!=null?'<em class="'+(pl>=0?"up2":"dn2")+'">'+(pl>=0?"+":"")+num(pl)+' ₸ ('+(pl>=0?"+":"")+dec(pl/cs*100,1)+'%)</em>':'')+'</div><button class="wx" type="button" data-wdel="'+i+'" aria-label="'+t("Удалить","Жою")+'">×</button></div>'}).join("");
  const sum=L.length?'<section class="wsum '+(tot-cost>=0?"win":"loss")+'"><small>'+t("Сейчас по курсу Нацбанка","Қазір ҰБ бағамы бойынша")+'</small><b>'+num(tot)+' ₸</b><span>'+(tot-cost>=0?t("Выигрыш ","Пайда "):t("Убыток ","Шығын "))+num(Math.abs(tot-cost))+' ₸</span></section>':"";
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Мои деньги","Менің ақшам")]])+'<h1>'+t("Мои деньги","Менің ақшам")+'</h1><p class="sub">'+t("Запишите, сколько валюты вы купили и по какому курсу. Сайт покажет, выгодно ли вы купили. Данные хранятся только в вашем телефоне.","Қанша валюта және қандай бағамен сатып алғаныңызды жазыңыз. Сайт тиімді сатып алғаныңызды көрсетеді. Деректер тек телефоныңызда сақталады.")+'</p>'+tipHtml("wal","Запишите покупку один раз, и сайт сам покажет выигрыш или убыток по текущему курсу. Данные остаются только в вашем телефоне.","Сатып алуды бір рет жазыңыз, сайт ағымдағы бағам бойынша пайда не шығынды өзі көрсетеді. Деректер тек телефоныңызда қалады.")+sum+
  '<section class="card wf"><h2>'+t("Добавить покупку","Сатып алуды қосу")+'</h2><div class="wg"><label>'+t("Валюта","Валюта")+'<select id="wc">'+cur.map(c=>'<option>'+c+'</option>').join("")+'</select></label><label>'+t("Сколько","Қанша")+'<input id="wa" inputmode="decimal" placeholder="1000"></label><label>'+t("Курс покупки, ₸","Сатып алу бағамы, ₸")+'<input id="wr" inputmode="decimal" placeholder="445"></label></div><button class="vb wadd" id="wadd" type="button">'+t("Добавить","Қосу")+'</button><p class="mut" id="wmsg"></p></section>'+
  '<div class="wl">'+(rows||'<div class="card"><p class="lead" style="margin:0">'+t("Пока пусто. Добавьте первую покупку выше.","Әзірге бос. Жоғарыда алғашқы сатып алуды қосыңыз.")+'</p></div>')+'</div><p class="mut">'+t("Расчет по официальному курсу Нацбанка, в обменнике вы продадите по курсу покупки обменника. Это не финансовая рекомендация.","Есеп Ұлттық банктің ресми бағамы бойынша, айырбастау пунктінде сіз пункттің сатып алу бағамымен сатасыз. Бұл қаржылық кеңес емес.")+'</p>'+finBlock("dep")+FOOT();
  const msg=document.getElementById("wmsg");
  document.getElementById("wadd").onclick=()=>{const c=document.getElementById("wc").value,n=s=>parseFloat(String(s).replace(/\s/g,"").replace(",","."));const am=n(document.getElementById("wa").value),r=n(document.getElementById("wr").value);
    if(!(am>0)||!(r>0)){msg.textContent=t("Впишите сумму и курс числами.","Соманы және бағамды санмен жазыңыз.");return}
    const L2=WL();L2.push({c,a:am,r,d:new Date().toISOString().slice(0,10)});WS(L2);walletPage()};
  app.querySelectorAll("[data-wdel]").forEach(b=>b.onclick=()=>{const L2=WL();L2.splice(+b.dataset.wdel,1);WS(L2);walletPage()});
  document.title=t("Мои деньги","Менің ақшам")+" | Тиімді сәт";
}

/* near me */
let NEAR={cur:"USD",pos:null,err:"",busy:false};
const hav=(a,b)=>{const R=6371,r=Math.PI/180,dl=(b[0]-a[0])*r,dn=(b[1]-a[1])*r,x=Math.sin(dl/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
const kmTxt=k=>k<1?Math.round(k*10)*100+" "+t("м","м"):dec(k,1)+" "+t("км","км");
function nearList(){
  const G=(window.TM_GEO||{}).points||[],EX=X0.exchangers||[],c=NEAR.cur;
  if(!G.length)return '<p class="mut">'+t("Адреса обменников пока собираются, список появится после ближайшего обновления данных. Пока можно найти обменник на карте.","Айырбастау пункттерінің мекенжайлары жиналып жатыр, тізім келесі деректер жаңартылғаннан кейін шығады. Әзірге картадан іздей аласыз.")+'</p><a class="vb" href="'+MAPQ()+'" target="_blank" rel="noopener noreferrer">'+t("Открыть карту","Картаны ашу")+'</a>';
  if(!NEAR.pos)return"";
  const L=G.map(p=>{const e=EX.find(x=>x.id===p.ex);return e&&e.rates&&e.rates[c]?{p,e,d:hav(NEAR.pos,p.ll)}:null}).filter(Boolean).sort((x,y)=>x.d-y.d).slice(0,5);
  if(!L.length)return '<p class="mut">'+t("Рядом нет обменников с этой валютой.","Жақын жерде бұл валюта бар пункттер жоқ.")+'</p>';
  const best=Math.min.apply(null,L.map(x=>x.e.rates[c][1]));
  return '<div class="nl">'+L.map(x=>{const q=encodeURIComponent(t("Алматы, ","Алматы, ")+x.p.addr),r=x.e.rates[c];
    return '<div class="nr"><div class="nrl"><b>'+esc(x.e.name)+(r[1]===best?' <em class="nbest">'+t("лучший курс","үздік бағам")+'</em>':'')+'</b><small>'+esc(x.p.addr)+' · '+kmTxt(x.d)+'</small></div><div class="nrr"><small>'+t("купить","сатып алу")+'</small><b>'+dc2(r[1])+'</b></div><a class="nrt" href="https://www.google.com/maps/dir/?api=1&destination='+x.p.ll[0]+','+x.p.ll[1]+'&travelmode=walking" target="_blank" rel="noopener noreferrer" aria-label="'+t("Маршрут","Маршрут")+'"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-8-8 18-2-8z"/></svg></a></div>'}).join("")+'</div>';
}
function nearBlock(){
  if(!fxStat("USD"))return"";
  const chips=["USD","EUR","RUB","CNY","GBP"].map(k=>'<button type="button" data-nc="'+k+'" class="'+(NEAR.cur===k?"on":"")+'">'+k+'</button>').join("");
  return '<section class="nearb" id="near"><h2>'+t("Обменники рядом","Жақын айырбастау пункттері")+'</h2><div class="nch">'+chips+'</div><div id="nbody">'+(!((window.TM_GEO||{}).points||[]).length?nearList():NEAR.pos?nearList():'<p class="mut">'+(NEAR.err||t("Покажем ближайшие обменники и курс в них. Местоположение остается в вашем телефоне и никуда не отправляется.","Ең жақын айырбастау пункттерін және олардағы бағамды көрсетеміз. Орналасқан жер телефоныңызда қалады және ешқайда жіберілмейді."))+'</p>'+(NEAR.err?"":'<button class="vb" type="button" id="ngo">'+t("Найти рядом со мной","Жақынды табу")+'</button>'))+'</div></section>';
}
function nearGo(){
  const b=document.getElementById("nbody");if(!b)return;
  if(!navigator.geolocation){NEAR.err=t("Браузер не дает определить местоположение.","Браузер орналасқан жерді анықтауға мүмкіндік бермейді.");b.innerHTML='<p class="mut">'+NEAR.err+'</p>';return}
  b.innerHTML='<p class="mut">'+t("Определяем местоположение...","Орналасқан жер анықталуда...")+'</p>';
  navigator.geolocation.getCurrentPosition(p=>{NEAR.pos=[p.coords.latitude,p.coords.longitude];NEAR.err="";b.innerHTML=nearList()||""},
    e=>{NEAR.err=e&&e.code===1?t("Доступ к местоположению запрещен. Разрешите его в настройках браузера или найдите обменник на карте.","Орналасқан жерге рұқсат жоқ. Браузер баптауларында рұқсат беріңіз немесе картадан іздеңіз."):t("Не удалось определить местоположение.","Орналасқан жерді анықтау мүмкін болмады.");
      b.innerHTML='<p class="mut">'+NEAR.err+'</p><a class="vb" href="'+MAPQ()+'" target="_blank" rel="noopener noreferrer">'+t("Открыть карту","Картаны ашу")+'</a>'},{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
}
document.addEventListener("click",e=>{
  if(e.target.closest("#ngo")){nearGo();return}
  const c=e.target.closest("[data-nc]");if(c){NEAR.cur=c.dataset.nc;document.querySelectorAll("[data-nc]").forEach(x=>x.classList.toggle("on",x===c));const b=document.getElementById("nbody");if(b&&NEAR.pos)b.innerHTML=nearList();return}
  const n=e.target.closest("[data-near]");if(n){e.preventDefault();const s=document.getElementById("near");if(s){s.scrollIntoView({behavior:"smooth",block:"center"});if(!NEAR.pos&&!NEAR.err&&(window.TM_GEO||{}).points&&TM_GEO.points.length)setTimeout(nearGo,350)}}
});

/* apartments near point */
let APT_PT=null,APT_R=5;
const aptD=c=>APT_PT&&c.ll?hav(APT_PT.ll,c.ll):null;
function aptSetPt(ll,label){APT_PT={ll,label};APT_SORT="near";APT_DEV="all";APT_DIST="all";if(typeof APT_RD==="function")APT_RD()}
function aptNearBlock(){
  const A=APT(),RS=[[2,"2 км"],[5,"5 км"],[10,"10 км"],[20,"20 км"],[0,t("Любое","Кез келген")]];
  if(!APT_PT)return '<section class="card apn" id="apn"><h2>'+t("Квартиры рядом с работой или домом","Жұмысқа немесе үйге жақын пәтерлер")+'</h2><p class="mut">'+t("Укажите, где вы работаете или живете, и мы покажем ближайшие ЖК. Сверху будут самые близкие и самые недорогие.","Қай жерде жұмыс істейтініңізді немесе тұратыныңызды көрсетіңіз, біз ең жақын ТК-ны көрсетеміз. Жоғарыда ең жақын және ең арзандары болады.")+'</p>'+
   '<div class="apns"><input id="npa" type="search" enterkeyhint="search" placeholder="'+t("Адрес, например: Абая 150","Мекенжай, мысалы: Абай 150")+'"><button type="button" class="vb" id="npg">'+t("Найти","Іздеу")+'</button></div>'+
   '<div class="apnb"><button type="button" class="apnc" id="npm"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'+t("Указать на карте","Картада көрсету")+'</button><button type="button" class="apnc" id="npl"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>'+t("Я здесь","Мен осындамын")+'</button></div><p class="mut" id="npe"></p></section>';
  const In=A.complexes.filter(c=>c.ll).map(c=>({c,d:aptD(c)})).filter(x=>x.d!=null&&(!APT_R||x.d<=APT_R));
  const near=In.slice().sort((x,y)=>x.d-y.d)[0],cheap=In.slice().sort((x,y)=>x.c.m2-y.c.m2)[0];
  const tile=(k,x)=>x?'<button type="button" class="apnt" data-nj="'+x.c.id+'"><small>'+k+'</small><b>'+esc(x.c.name)+'</b><span>'+kmTxt(x.d)+' · '+num(x.c.m2)+' ₸/м²</span></button>':"";
  return '<section class="card apn" id="apn"><div class="apnh"><h2>'+t("Рядом: ","Жақын: ")+esc(APT_PT.label||"")+'</h2><button type="button" class="apnx" id="npx">'+t("Сбросить","Тазарту")+'</button></div>'+
   '<div class="nch">'+RS.map(r=>'<button type="button" data-nr="'+r[0]+'" class="'+(APT_R===r[0]?"on":"")+'">'+r[1]+'</button>').join("")+'</div>'+
   (In.length?'<p class="mut">'+t("ЖК в этой области: ","Осы аймақтағы ТК: ")+'<b>'+In.length+'</b></p><div class="apnts">'+tile(t("Ближайший","Ең жақын"),near)+tile(t("Самая низкая цена","Ең төмен баға"),cheap)+'</div><div class="apsr"><button type="button" data-ns="near" class="'+(APT_SORT==="near"?"on":"")+'">'+t("Сначала ближайшие","Алдымен ең жақындары")+'</button><button type="button" data-ns="m2" class="'+(APT_SORT==="m2"?"on":"")+'">'+t("Сначала дешевле","Алдымен арзандары")+'</button></div>':'<p class="mut">'+t("В этой области ЖК нет. Увеличьте радиус.","Бұл аймақта ТК жоқ. Радиусты үлкейтіңіз.")+'</p>')+'</section>';
}
async function aptGeocode(q){
  const url="https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=kz&viewbox=76.70,43.45,77.20,43.10&bounded=1&q="+encodeURIComponent(/алматы|almaty/i.test(q)?q:"Алматы, "+q);
  const r=await fetch(url,{headers:{"Accept-Language":"ru"}});const j=await r.json();return j[0]?{ll:[+j[0].lat,+j[0].lon],label:q}:null;
}
function aptPick(){
  if(!window.L){leafLoad(aptPick,()=>{const e=document.getElementById("npe");if(e)e.textContent=t("Карта не загрузилась. Введите адрес в строке выше.","Карта жүктелмеді. Мекенжайды жоғарыдағы жолға енгізіңіз.")});return}
  const o=document.createElement("div");o.className="pkm";o.innerHTML='<div class="pkh"><b>'+t("Нажмите на карте, где вы работаете или живете","Жұмыс істейтін немесе тұратын жерді картадан басыңыз")+'</b><button type="button" class="lbx pkx" aria-label="'+t("Закрыть","Жабу")+'">×</button></div><div id="pkmap"></div><div class="pkf"><button type="button" class="vb" id="pkok" disabled>'+t("Готово","Дайын")+'</button></div>';
  document.body.appendChild(o);document.body.classList.add("lbo");
  const m=L.map("pkmap",{tap:false}).setView([43.2420,76.9000],11);L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(m);m.attributionControl.setPrefix(false);
  setTimeout(()=>m.invalidateSize(),50);let mk=null,pt=null;
  m.on("click",e=>{pt=[e.latlng.lat,e.latlng.lng];if(mk)mk.setLatLng(e.latlng);else mk=L.marker(e.latlng).addTo(m);document.getElementById("pkok").disabled=false});
  const close=()=>{o.remove();document.body.classList.remove("lbo")};
  o.querySelector(".pkx").onclick=close;document.getElementById("pkok").onclick=()=>{if(pt){close();aptSetPt(pt,t("точка на карте","картадағы нүкте"))}};
}
function aptNearInit(){
  const g=document.getElementById("npg");
  if(g){const go=async()=>{const q=document.getElementById("npa").value.trim(),e=document.getElementById("npe");if(q.length<3){e.textContent=t("Введите адрес подробнее.","Мекенжайды толығырақ енгізіңіз.");return}e.textContent=t("Ищем адрес...","Мекенжай ізделуде...");
      try{const r=await aptGeocode(q);if(r)aptSetPt(r.ll,r.label);else e.textContent=t("Адрес не нашли. Попробуйте точнее или укажите на карте.","Мекенжай табылмады. Нақтырақ жазыңыз немесе картада көрсетіңіз.")}catch(x){e.textContent=t("Нет связи с поиском адресов. Укажите точку на карте.","Мекенжай іздеу қолжетімсіз. Нүктені картада көрсетіңіз.")}};
    g.onclick=go;document.getElementById("npa").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();go()}};
    document.getElementById("npm").onclick=aptPick;
    document.getElementById("npl").onclick=()=>{const e=document.getElementById("npe");if(!navigator.geolocation){e.textContent=t("Браузер не дает определить местоположение.","Браузер орналасқан жерді анықтауға мүмкіндік бермейді.");return}e.textContent=t("Определяем местоположение...","Орналасқан жер анықталуда...");
      navigator.geolocation.getCurrentPosition(p=>aptSetPt([p.coords.latitude,p.coords.longitude],t("ваше местоположение","сіздің орныңыз")),()=>{e.textContent=t("Доступ к местоположению запрещен. Введите адрес или укажите точку на карте.","Орналасқан жерге рұқсат жоқ. Мекенжайды енгізіңіз немесе картада көрсетіңіз.")},{enableHighAccuracy:true,timeout:10000,maximumAge:60000})}}
  const x=document.getElementById("npx");if(x)x.onclick=()=>{APT_PT=null;if(APT_SORT==="near")APT_SORT="m2";APT_RD()};
  document.querySelectorAll("[data-nr]").forEach(b=>b.onclick=()=>{APT_R=+b.dataset.nr;APT_RD()});
  document.querySelectorAll("[data-ns]").forEach(b=>b.onclick=()=>{APT_SORT=b.dataset.ns;APT_RD()});
  document.querySelectorAll("[data-nj]").forEach(b=>b.onclick=()=>aptGo(b.dataset.nj));
}

/* v21 effects */
const RM=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
function countUp(el,to,fmt,ms){if(RM()||!el){return}const t0=performance.now(),from=0;const step=n=>{const k=Math.min(1,(n-t0)/ms),e=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*e);if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
function confetti(x,y){if(RM())return;const c=document.createElement("canvas");c.className="cfx";c.width=innerWidth;c.height=innerHeight;document.body.appendChild(c);const g=c.getContext("2d"),cols=["#1faa59","#ffb020","#2742c9","#e5534b","#34d399"];
  const P=Array.from({length:46},()=>({x,y,vx:(Math.random()-.5)*9,vy:-Math.random()*9-3,s:4+Math.random()*5,c:cols[Math.random()*5|0],r:Math.random()*6}));let f=0;
  (function L(){g.clearRect(0,0,c.width,c.height);P.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.r+=.2;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);g.restore()});if(++f<70)requestAnimationFrame(L);else c.remove()})()}
function buzz(n){try{navigator.vibrate&&navigator.vibrate(n||8)}catch(e){}}
function fx2(){
  if(RM())return;
  const w=document.querySelector(".wsum b");if(w){const v=parseInt(w.textContent.replace(/\D/g,""),10);if(v)countUp(w,v,x=>num(x)+" ₸",900)}
  const o=document.getElementById("cvo");
  document.querySelectorAll(".vrd b").forEach(b=>{const s=b.textContent;b.innerHTML=[...s].map((ch,i)=>'<span class="lt" style="animation-delay:'+(i*35)+'ms">'+(ch===" "?"&nbsp;":ch)+'</span>').join("")});
}
document.addEventListener("click",e=>{const b=e.target.closest("button,.vb,.btab a,.nch button");if(b)buzz(6);
  if(e.target.closest("#wadd")){setTimeout(()=>{const s=document.querySelector(".wsum.win");if(s){const r=s.getBoundingClientRect();confetti(r.left+r.width/2,r.top+r.height/2)}},60)}});
document.addEventListener("input",e=>{if(e.target.id==="cva"||e.target.id==="cvf"||e.target.id==="cvt"){const o=document.getElementById("cvo");if(o){o.classList.remove("tk");void o.offsetWidth;o.classList.add("tk")}}});

/* installment vs mortgage */
let CI={id:null};
function ciRes(){
  const A=APT(),c=A.complexes.find(x=>x.id===CI.id);if(!c)return"";
  const P=c.m2*APT_AREA,row=(h,pay,tot,over,sub)=>'<div class="cir"><div><b>'+h+'</b><small>'+sub+'</small></div><div class="cip"><small>'+t("платеж в месяц","айлық төлем")+'</small><b>'+num(Math.round(pay/1000)*1000)+' ₸</b></div><div class="cio"><small>'+t("переплата","артық төлем")+'</small><b>'+(over>0?num(Math.round(over/1000)*1000)+' ₸':t("нет","жоқ"))+'</b></div></div>';
  let out='<p class="mut">'+t("Квартира "+APT_AREA+" м², цена ≈ ","Пәтер "+APT_AREA+" м², бағасы ≈ ")+mln(P)+'</p>';
  const R=[];
  if(c.inst){const L=P*(1-c.inst.pct/100),pay=L/c.inst.months;R.push({k:"i",pay,over:0,tot:P});out+=row(t("Рассрочка ","Бөліп төлеу ")+c.inst.months+t(" мес."," ай"),pay,P,0,t("взнос ","жарна ")+mln(P*c.inst.pct/100))}
  else out+='<div class="cir off"><div><b>'+t("Рассрочки нет","Бөліп төлеу жоқ")+'</b></div></div>';
  if(c.mort){[5,10].forEach(y=>{const L=P*(1-c.mort.pct/100),pay=aptMonthly(L,c.mort.rate,y),over=pay*y*12-L;R.push({k:"m"+y,pay,over});out+=row(t("Ипотека на "+y+" лет","Ипотека "+y+" жылға"),pay,0,over,c.mort.rate+"%, "+t("взнос ","жарна ")+mln(P*c.mort.pct/100))})}
  else out+='<div class="cir off"><div><b>'+t("Ипотеки нет","Ипотека жоқ")+'</b></div></div>';
  const ri=R.find(x=>x.k==="i"),m5=R.find(x=>x.k==="m5"),m10=R.find(x=>x.k==="m10");
  if(ri&&m10)out+='<p class="civ">'+t("Рассрочка без переплаты, но платеж в ","Бөліп төлеу артық төлемсіз, бірақ төлем ")+dec(ri.pay/m10.pay,1)+t(" раза выше, чем по ипотеке на 10 лет. Ипотека на 5 лет дороже по платежу на "," есе жоғары, ипотека 10 жылға қарағанда. 5 жылдық ипотека төлемі "+" ")+num(Math.round((m5.pay-m10.pay)/1000)*1000)+t(" ₸ в месяц, зато переплата меньше на "," ₸ артық, бірақ артық төлем ")+num(Math.round((m10.over-m5.over)/1000)*1000)+" ₸.</p>";
  return out+'<p class="mut">'+t("Цена в рассрочке у застройщика может быть выше цены за м² на сайте, уточняйте. Расчет ориентировочный.","Бөліп төлеудегі баға сайттағы м² бағасынан жоғары болуы мүмкін, нақтылаңыз. Есеп шамамен.")+'</p>';
}
function ciBlock(){
  const A=APT();if(!A.complexes.length)return"";
  if(!CI.id)CI.id=(A.complexes.find(c=>c.inst&&c.mort)||A.complexes[0]).id;
  return '<section class="card cib" id="cib"><h2>'+t("Рассрочка или ипотека","Бөліп төлеу немесе ипотека")+'</h2><p class="mut">'+t("Выберите ЖК, и мы сравним платеж и переплату.","ТК таңдаңыз, біз төлем мен артық төлемді салыстырамыз.")+'</p><select id="cis" aria-label="ЖК">'+A.complexes.map(c=>'<option value="'+esc(c.id)+'"'+(c.id===CI.id?" selected":"")+'>'+esc(c.name)+'</option>').join("")+'</select><div id="cir">'+ciRes()+'</div></section>';
}
function ciInit(){const s=document.getElementById("cis");if(s)s.onchange=()=>{CI.id=s.value;document.getElementById("cir").innerHTML=ciRes()}}
/* currency budget */
let BG={m:1000000};
function bgRows(){
  return ["USD","EUR","RUB","CNY","GBP"].map(k=>{const L=fxList(k).filter(e=>e.rates&&e.rates[k]&&e.type!=="bank");if(!L.length)return"";const b=L.slice().sort((x,y)=>x.rates[k][1]-y.rates[k][1])[0],p=b.rates[k][1],n=BG.m/p;
    return '<a class="bgr" href="#/currency/'+k+'">'+flag(k,36)+'<div><b>'+(n>=100?num(n):dec(n,2))+' '+k+'</b><small>'+esc(b.name)+' · '+dc2(p)+' ₸</small></div></a>'}).join("");
}
function bgBlock(){
  if(!fxStat("USD"))return"";
  return '<section class="bgb"><h2>'+t("На сколько хватит","Қанша жетеді")+'</h2><label class="bgi"><span>'+t("У меня, ₸","Менде, ₸")+'</span><input id="bgm" inputmode="numeric" value="'+num(BG.m)+'"></label><div id="bgl">'+bgRows()+'</div><p class="mut">'+t("Считаем по самому выгодному обменнику для покупки. Это ориентир: уточните курс на месте.","Сатып алу үшін ең тиімді айырбастау пункті бойынша есептейміз. Бұл бағдар: бағамды жерінде нақтылаңыз.")+'</p></section>';
}
function bgInit(){const i=document.getElementById("bgm");if(!i)return;i.oninput=()=>{BG.m=parseFloat(String(i.value).replace(/\D/g,""))||0;document.getElementById("bgl").innerHTML=bgRows()};i.onblur=()=>{i.value=num(BG.m)}}
/* wrong rate */
function wrongBtns(){
  const S=window.TM_SITE||{};if(!S.whatsapp)return;
  const cur=((location.hash.match(/currency\/([A-Za-z]{3})/)||[])[1]||"USD").toUpperCase();
  const mk=name=>'<a class="wrong" target="_blank" rel="noopener noreferrer" href="https://wa.me/'+S.whatsapp+'?text='+encodeURIComponent(t("Курс не совпал. Обменник: "+name+", валюта: "+cur+". На сайте один курс, в обменнике другой. Дата: "+new Date().toLocaleString("ru-RU"),"Бағам сәйкес келмеді. Пункт: "+name+", валюта: "+cur+". Сайтта бір бағам, пунктте басқа. Күні: "+new Date().toLocaleString("kk-KZ")))+'">'+t("Курс не совпал","Бағам сәйкес емес")+'</a>';
  document.querySelectorAll("article.kr").forEach(el=>{if(el.querySelector(".wrong"))return;const n=el.querySelector(".kn b");if(n)el.insertAdjacentHTML("beforeend",mk(n.textContent))});
  document.querySelectorAll(".fxtab tbody tr, table.fxt tbody tr").forEach(tr=>{if(tr.querySelector(".wrong"))return;const n=tr.querySelector("td b, td:first-child");const last=tr.lastElementChild;if(n&&last)last.insertAdjacentHTML("beforeend",mk(n.textContent.trim()))});
}
/* seo pages */
function bestPage(n){
  n=[20,25,30,40,50].includes(+n)?+n:30;const A=APT(),area=45,L=A.complexes.filter(c=>c.m2*area<=n*1e6).sort((x,y)=>x.m2-y.m2);
  const dn=id=>(A.developers.find(d=>d.id===id)||{}).name||id;
  const chips=[20,25,30,40,50].map(v=>'<a class="bch'+(v===n?" on":"")+'" href="#/best/'+v+'">'+t("до ","дейін ")+v+' '+t("млн","млн")+'</a>').join("");
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Квартиры","Пәтерлер"),"#/apartments"],[t("До "+n+" млн","Дейін "+n+" млн")]])+'<h1>'+t("Лучшие ЖК Алматы до "+n+" млн ₸","Алматының "+n+" млн ₸ дейінгі үздік ТК-сы")+'</h1><p class="sub">'+t("Новостройки, где квартира "+area+" м² стоит не больше "+n+" млн ₸ по минимальной цене за м². Всего подходит: "+L.length+".","Жаңа құрылыстар, мұнда "+area+" м² пәтер м² ең төмен бағасы бойынша "+n+" млн ₸ аспайды. Барлығы: "+L.length+".")+'</p><div class="bchs">'+chips+'</div>'+
   (L.length?'<div class="bdl">'+L.map(c=>'<a class="bdr" href="#/apartments" data-bj="'+c.id+'"><span><b>'+esc(c.name)+'</b><small>'+esc(dn(c.dev))+' · '+esc(c.district||"")+' · '+num(c.m2)+' ₸/м²</small></span><em>'+dec(c.m2*area/1e6,1)+' '+t("млн","млн")+'</em></a>').join("")+'</div>':'<div class="card"><p class="lead" style="margin:0">'+t("Пока ничего нет. Попробуйте большую сумму.","Әзірге ештеңе жоқ. Үлкенірек соманы көріңіз.")+'</p></div>')+
   '<p class="mut">'+t("Цена считается как минимальная цена за м² от застройщика, умноженная на "+area+" м². Итог зависит от этажа и планировки. Не является финансовой рекомендацией.","Баға құрылысшының м² ең төмен бағасын "+area+" м² көбейту арқылы есептеледі. Қорытынды баға қабатқа және жоспарлауға байланысты. Қаржылық кеңес емес.")+'</p>'+FOOT();
  app.querySelectorAll("[data-bj]").forEach(x=>x.onclick=e=>{e.preventDefault();aptGo(x.dataset.bj)});
  document.title=t("Лучшие ЖК Алматы до "+n+" млн ₸","Алматының "+n+" млн ₸ дейінгі үздік ТК-сы")+" | Тиімді сәт";
}
let P725={p:25000000,y:25};
function p725Res(){const P=P725.p,L=P*.8,pay=aptMonthly(L,7,P725.y);return '<small>'+t("Платеж в месяц","Айлық төлем")+'</small><b>≈ '+num(Math.round(pay/1000)*1000)+' ₸</b><span>'+t("Первый взнос 20%: ","Алғашқы жарна 20%: ")+num(Math.round(P*.2))+' ₸. '+t("Нужный доход: от ","Қажет табыс: ")+num(Math.round(pay*2/1000)*1000)+' ₸. '+t("Переплата: ","Артық төлем: ")+num(Math.round((pay*P725.y*12-L)/1000)*1000)+' ₸.</span>'}
function p725(){return '<section class="card p725" id="p725"><h2>'+t("Платеж по 7-20-25","7-20-25 бойынша төлем")+'</h2><div class="wg"><label>'+t("Цена квартиры, ₸","Пәтер бағасы, ₸")+'<input id="p7p" inputmode="numeric" value="'+num(P725.p)+'"></label><label>'+t("Срок","Мерзімі")+'<select id="p7y">'+[10,15,20,25].map(y=>'<option value="'+y+'"'+(y===P725.y?" selected":"")+'>'+y+t(" лет"," жыл")+'</option>').join("")+'</select></label></div><div class="p7r" id="p7r">'+p725Res()+'</div></section>'}
function p725Init(){const p=document.getElementById("p7p"),y=document.getElementById("p7y");if(!p)return;const up=()=>{P725.p=parseFloat(String(p.value).replace(/\D/g,""))||0;P725.y=+y.value;document.getElementById("p7r").innerHTML=p725Res()};p.oninput=up;y.onchange=up;p.onblur=()=>{p.value=num(P725.p)}}

function ipotekaPage(){
  const A=APT(),M=A.complexes.filter(c=>c.mort).sort((x,y)=>x.mort.rate-y.mort.rate);
  const L=(u,x)=>'<a href="'+u+'" target="_blank" rel="noopener noreferrer">'+x+'</a>';
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Квартиры","Пәтерлер"),"#/apartments"],[t("Ипотека","Ипотека")]])+'<h1>'+t("Ипотека 7-20-25 в Алматы","Алматыдағы 7-20-25 ипотекасы")+'</h1><p class="sub">'+t("Государственная программа: ставка 7%, первый взнос от 20%, срок до 25 лет. Посчитайте платеж и посмотрите ЖК, где можно взять ипотеку.","Мемлекеттік бағдарлама: мөлшерлеме 7%, алғашқы жарна 20%-дан, мерзімі 25 жылға дейін. Төлемді есептеңіз және ипотека алуға болатын ТК-ны қараңыз.")+'</p>'+p725()+
   '<h2>'+t("Другие ипотеки банков","Банктердің басқа ипотекалары")+'</h2>'+finBlock("mort")+'<h2>'+t("ЖК с ипотекой","Ипотекасы бар ТК")+'</h2><div class="bdl">'+M.map(c=>'<a class="bdr" href="#/apartments" data-bj="'+c.id+'"><span><b>'+esc(c.name)+'</b><small>'+t("ставка от ","мөлшерлеме ")+c.mort.rate+'%, '+t("взнос ","жарна ")+c.mort.pct+'%</small></span><em>'+num(c.m2)+' ₸/м²</em></a>').join("")+'</div>'+
   '<p class="mut">'+t("Лимиты программы и очередь на получение меняются. Актуальные условия смотрите у банков и в новостях: ","Бағдарлама лимиттері мен кезек өзгеріп отырады. Өзекті шарттарды банктерден және жаңалықтардан қараңыз: ")+L("https://krisha.kz/content/news/2026/kak-budet-rabotat-ipoteka-7-20-25-v-2027-godu","krisha.kz")+', '+L("https://finratings.kz/news/13285-ot-7-20-25-do-nauryz-kakie-ipoteki-seichas-dostupny-v-kazakhstane/amp","finratings.kz")+'. '+t("Не является финансовой рекомендацией.","Қаржылық кеңес емес.")+'</p>'+FOOT();
  finCalc();p725Init();app.querySelectorAll("[data-bj]").forEach(x=>x.onclick=e=>{e.preventDefault();aptGo(x.dataset.bj)});
  const mg=document.getElementById("mq-b");if(mg&&!window.__ip){window.__ip=1}
  document.title=t("Ипотека 7-20-25 в Алматы","Алматыдағы 7-20-25 ипотекасы")+" | Тиімді сәт";
}

/* telegram bot link */
const BOTU=()=>{const S=window.TM_SITE||{};return S.bot?"https://t.me/"+String(S.bot).replace(/^@/,""):""};
let TGV={cur:"USD",v:0};
function tgBlock(cur){
  const u=BOTU();if(!u)return"";
  const c=cur||TGV.cur,st=fxStat(c);if(!st)return"";
  if(TGV.cur!==c||!TGV.v){TGV.cur=c;TGV.v=Math.round(st.last*(st.last>=100?0.98:0.95)*(st.last>=100?1:100))/(st.last>=100?1:100)}
  const chips=["USD","EUR","RUB","CNY","GBP"].map(k=>'<button type="button" data-tgc="'+k+'" class="'+(c===k?"on":"")+'">'+k+'</button>').join("");
  return '<section class="tgb" id="tgb"><h2>'+t("Сообщим, когда курс подойдет","Бағам қолайлы болғанда хабарлаймыз")+'</h2><div class="nch">'+chips+'</div><label class="bgi"><span>'+t("Когда ","Қашан ")+c+' '+t("дойдет до, ₸","жеткенде, ₸")+'</span><input id="tgv" inputmode="decimal" value="'+String(TGV.v).replace(".",",")+'"></label><a class="vb tgl" id="tgl" target="_blank" rel="noopener noreferrer" href="'+u+'?start=alert_'+c+'_'+TGV.v+'">'+t("Включить в Telegram","Telegram-да қосу")+'</a><p class="mut">'+t("Откроется наш бот, там нажмите Start. Сейчас "+c+" ≈ "+dc2(st.last)+" ₸. Это бесплатно, пришлем одно сообщение, когда курс дойдет.","Біздің бот ашылады, онда Start басыңыз. Қазір "+c+" ≈ "+dc2(st.last)+" ₸. Тегін, бағам жеткенде бір хабарлама жібереміз.")+'</p></section>';
}
function tgInit(){
  const i=document.getElementById("tgv");if(!i)return;const u=BOTU();
  const up=()=>{const v=parseFloat(String(i.value).replace(",","."));if(v>0){TGV.v=v;document.getElementById("tgl").href=u+"?start=alert_"+TGV.cur+"_"+v}};
  i.oninput=up;
  document.querySelectorAll("[data-tgc]").forEach(b=>b.onclick=()=>{TGV.cur=b.dataset.tgc;TGV.v=0;const s=document.getElementById("tgb");s.outerHTML=tgBlock(TGV.cur);tgInit()});
}

/* onboarding, tips, install */
const LS={g:k=>{try{return localStorage.getItem(k)}catch(e){return null}},s:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const ONB=()=>[
 {k:"g",h:t("Скажем, когда брать валюту","Валютаны қашан алуды айтамыз"),p:t("Зеленая зона значит курс низкий и можно покупать. Красная значит дорого, лучше подождать.","Жасыл аймақ бағам төмен екенін білдіреді, сатып алуға болады. Қызыл қымбат, күткен жөн.")},
 {k:"r",h:t("Покажем, где выгоднее","Қайда тиімді екенін көрсетеміз"),p:t("Сравниваем обменники и банки Алматы. Лучший курс сразу сверху, а рядом можно найти ближайший пункт.","Алматы айырбастау пункттері мен банктерін салыстырамыз. Ең жақсы бағам жоғарыда, жақын пункт те табылады.")},
 {k:"m",h:t("Квартиры рядом с вами","Сізге жақын пәтерлер"),p:t("Укажите работу или дом, и мы покажем ближайшие ЖК. Сверху самые близкие и самые недорогие.","Жұмысты немесе үйді көрсетіңіз, біз ең жақын ТК-ны көрсетеміз. Жоғарыда ең жақын және ең арзандары.")},
 {k:"a",h:t("Не нужно проверять каждый день","Күнде тексерудің қажеті жоқ"),p:t("Включите оповещение в Telegram, и мы напишем, когда курс дойдет до нужного. А в разделе Мои деньги видно, выгодно ли вы купили.","Telegram-да ескертуді қосыңыз, бағам керекті деңгейге жеткенде жазамыз. Менің ақшам бөлімінде тиімді сатып алғаныңыз көрінеді.")}];
const ONBV={
 g:()=>'<div class="ob-g"><div class="ob-bar"><i></i></div><div class="ob-lab"><span>'+t("дешево","арзан")+'</span><span>'+t("дорого","қымбат")+'</span></div><div class="ob-ok">'+t("Покупать","Сатып алу")+'</div></div>',
 r:()=>'<div class="ob-r">'+[["Казпочта","444,90",1],["Большая Монета","445,50",0],["Valuta Exchange","446,00",0]].map((x,i)=>'<div class="ob-row" style="animation-delay:'+(i*260+300)+'ms"><b>'+x[0]+'</b><span>'+x[1]+' ₸</span>'+(x[2]?'<em>'+t("лучший","үздік")+'</em>':'')+'</div>').join("")+'</div>',
 m:()=>'<div class="ob-m"><svg viewBox="0 0 280 200"><g stroke="currentColor" stroke-opacity=".12" stroke-width="2"><path d="M0 60H280M0 130H280M70 0V200M150 0V200M220 0V200"/></g><circle class="ob-c" cx="140" cy="100" r="64"/><g class="ob-pin" style="animation-delay:.9s"><circle cx="100" cy="72" r="8"/></g><g class="ob-pin" style="animation-delay:1.2s"><circle cx="176" cy="84" r="8"/></g><g class="ob-pin" style="animation-delay:1.5s"><circle cx="150" cy="138" r="8"/></g><circle class="ob-me" cx="140" cy="100" r="7"/></svg><div class="ob-tag">'+t("Ближайший: 1,6 км","Ең жақын: 1,6 км")+'</div></div>',
 a:()=>'<div class="ob-a"><div class="ob-n"><div class="ob-ni">T</div><div><b>USD 439,80</b><small>'+t("Курс дошел до вашей цели","Бағам мақсатқа жетті")+'</small></div></div><div class="ob-w"><small>'+t("Мои деньги","Менің ақшам")+'</small><b>+12 400 ₸</b></div></div>'};
let ONB_T=null;
function onbOpen(force){
  if(!force&&LS.g("tm_onb"))return;if(document.querySelector(".onb"))return;
  const S=ONB(),o=document.createElement("div");o.className="onb";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label",t("Как пользоваться сайтом","Сайтты қалай қолдану"));
  o.innerHTML='<div class="obp">'+S.map(()=>'<span><i></i></span>').join("")+'</div><button type="button" class="obs">'+t("Пропустить","Өткізу")+'</button><div class="obv"></div><div class="obt"><h2></h2><p></p></div><button type="button" class="obn vb"></button>';
  document.body.appendChild(o);document.body.classList.add("lbo");requestAnimationFrame(()=>o.classList.add("in"));
  let i=0;const RMo=RM(),MS=5200;
  const bars=[...o.querySelectorAll(".obp span")];
  const show=n=>{clearTimeout(ONB_T);i=Math.max(0,Math.min(S.length-1,n));
    o.querySelector(".obv").innerHTML='<div class="obi">'+ONBV[S[i].k]()+'</div>';o.querySelector("h2").textContent=S[i].h;o.querySelector("p").textContent=S[i].p;
    o.querySelector(".obn").textContent=i===S.length-1?t("Начать","Бастау"):t("Далее","Әрі қарай");
    bars.forEach((b,k)=>{b.className=k<i?"obd":k===i?"obc2":"";const f=b.firstChild;f.style.animation="none";void f.offsetWidth;if(k===i&&!RMo&&i<S.length-1)f.style.animation="obf "+MS+"ms linear forwards";else f.style.animation=""});
    o.dataset.k=S[i].k;
    if(!RMo&&i<S.length-1)ONB_T=setTimeout(()=>show(i+1),MS)};
  const close=()=>{clearTimeout(ONB_T);LS.s("tm_onb","1");o.classList.remove("in");document.body.classList.remove("lbo");setTimeout(()=>o.remove(),250)};
  o.querySelector(".obn").onclick=()=>i===S.length-1?close():show(i+1);
  o.querySelector(".obs").onclick=close;
  o.querySelector(".obv").onclick=e=>{const r=e.currentTarget.getBoundingClientRect();show(e.clientX<r.left+r.width*.35?i-1:i+1)};
  let sx=0;o.addEventListener("touchstart",e=>{sx=e.touches[0].clientX},{passive:true});o.addEventListener("touchend",e=>{const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>50)show(d<0?i+1:i-1)},{passive:true});
  document.addEventListener("keydown",function kd(e){if(!document.body.contains(o)){document.removeEventListener("keydown",kd);return}if(e.key==="Escape")close();if(e.key==="ArrowRight")show(i+1);if(e.key==="ArrowLeft")show(i-1)});
  show(0);
}
document.addEventListener("click",e=>{if(e.target.closest("[data-onb]")){e.preventDefault();onbOpen(true)}});
/* tips */
function tipHtml(id,ru,kk){if(LS.g("tm_tip_"+id))return"";return '<div class="tip" data-tip="'+id+'"><span class="tipi">i</span><p>'+t(ru,kk)+'</p><button type="button" class="tipx" aria-label="'+t("Скрыть","Жасыру")+'">×</button></div>'}
document.addEventListener("click",e=>{const x=e.target.closest(".tipx");if(!x)return;const b=x.closest(".tip");LS.s("tm_tip_"+b.dataset.tip,"1");b.classList.add("out");setTimeout(()=>b.remove(),250)});
function secNav(L){
  return '<nav class="qk sn" aria-label="'+t("Разделы страницы","Бет бөлімдері")+'">'+L.map(x=>'<a href="#" data-sn="'+x[0]+'">'+x[1]+'</a>').join("")+'</nav>';
}
document.addEventListener("click",e=>{const q=e.target.closest("[data-sn]");if(!q)return;e.preventDefault();const el=document.getElementById(q.dataset.sn);if(el)el.scrollIntoView({behavior:RM()?"auto":"smooth",block:"start"})});
function curTools(){
  return secNav([["conv",t("Конвертер","Конвертер")],["near",t("Обменник рядом","Жақын пункт")],["bgw",t("На сколько хватит","Неге жетеді")],["tmc",t("Машина времени","Уақыт машинасы")],["fcw",t("Прогноз","Болжам")]])+nearBlock()+convBlock()+'<div id="bgw">'+bgBlock()+'</div>';
}
function hubCards(){
  const A=APT(),n=A.complexes.length;
  const card=(h,ic,ti,tx)=>'<a class="hub" href="'+h+'"><span class="hbi">'+ic+'</span><div><b>'+ti+'</b><small>'+tx+'</small></div><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></a>';
  return '<section class="hubs" aria-label="'+t("Разделы","Бөлімдер")+'">'+
   card("#/currency",'$',t("Все про валюту","Валюта туралы бәрі"),t("Где выгоднее, конвертер, обменник рядом, на сколько хватит, прогноз","Қайда тиімді, конвертер, жақын пункт, неге жетеді, болжам"))+
   card("#/apartments",'⌂',t("Все про квартиры","Пәтерлер туралы бәрі"),t(n+" ЖК: рядом с вами, подбор по бюджету, рассрочка или ипотека, карта",n+" ТК: жақын, бюджетке сай, бөліп төлеу немесе ипотека, карта"))+
   card("#/wallet",'₸',t("Мои деньги","Менің ақшам"),t("Выгодно ли вы купили, депозиты","Тиімді сатып алдыңыз ба, депозиттер"))+'</section>';
}
function quickBar(){
  const Q=[["#/currency",t("Валюта","Валюта"),"c"],["#/apartments",t("Квартиры","Пәтерлер"),"a"],["#/wallet",t("Мои деньги","Менің ақшам"),"w"],["#/best/30",t("ЖК до 30 млн","30 млн дейін ТК"),"b"],["#/ipoteka",t("Ипотека","Ипотека"),"i"]];
  return '<nav class="qk" aria-label="'+t("Быстрые действия","Жылдам әрекеттер")+'">'+Q.map(q=>'<a href="'+q[0]+'"'+(q[0][1]!=="/"?' data-qs="'+q[0]+'"':'')+'>'+q[1]+'</a>').join("")+'</nav>';
}
document.addEventListener("click",e=>{const q=e.target.closest("[data-qs]");if(!q)return;e.preventDefault();const el=document.querySelector(q.dataset.qs);if(el)el.scrollIntoView({behavior:RM()?"auto":"smooth",block:"center"})});
/* install */
let DIP=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();DIP=e;instShow()});
function isStandalone(){return matchMedia("(display-mode: standalone)").matches||navigator.standalone}
function instShow(){
  if(isStandalone()||LS.g("tm_inst")||document.getElementById("inst"))return;
  const v=+(LS.g("tm_visits")||0);if(v<3)return;
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent),el=document.createElement("div");el.id="inst";el.className="inst";
  el.innerHTML='<div><b>'+t("Добавьте сайт на экран","Сайтты экранға қосыңыз")+'</b><span>'+(DIP?t("Откроется как приложение, без адресной строки.","Қосымша сияқты ашылады, мекенжай жолынсыз."):ios?t("Нажмите Поделиться, затем На экран Домой.","Бөлісу, содан кейін Үйге қосу түймесін басыңыз."):t("В меню браузера выберите Установить приложение.","Браузер мәзірінен Қосымшаны орнату таңдаңыз."))+'</span></div>'+(DIP?'<button type="button" class="vb" id="instgo">'+t("Установить","Орнату")+'</button>':"")+'<button type="button" class="instx" aria-label="'+t("Закрыть","Жабу")+'">×</button>';
  document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add("in"));
  const hide=()=>{LS.s("tm_inst","1");el.classList.remove("in");setTimeout(()=>el.remove(),250)};
  el.querySelector(".instx").onclick=hide;const g=document.getElementById("instgo");if(g)g.onclick=async()=>{try{DIP.prompt();await DIP.userChoice}catch(x){}hide()};
}
(function(){const v=+(LS.g("tm_visits")||0)+1;LS.s("tm_visits",String(v));setTimeout(instShow,4000)})();
setTimeout(()=>{if(/^#?\/?$/.test(location.hash))onbOpen(false)},700);

function aphBlock(){
  const H=window.TM_APH||{snaps:[]},S=H.snaps||[];if(!S.length)return"";
  const f=ruDate(S[0].date);
  if(S.length<2)return '<section class="card aphc"><h2>'+t("История цен ЖК","ТК бағаларының тарихы")+'</h2><p class="mut">'+t("Мы начали копить реальную историю цен за м² с "+f+". Пока цены не менялись. Когда появится изменение, здесь будет график и разница по каждому ЖК. Прошлые цены мы не придумываем.","Нақты м² баға тарихын "+f+" бастап жинай бастадық. Әзірге бағалар өзгерген жоқ. Өзгеріс болғанда, мұнда график пен әр ТК бойынша айырма пайда болады. Өткен бағаларды ойдан шығармаймыз.")+'</p></section>';
  const med=s=>{const v=Object.values(s.m2).sort((a,b)=>a-b);return v[Math.floor(v.length/2)]};
  const pts=S.map(s=>med(s)),mn=Math.min.apply(null,pts),mx=Math.max.apply(null,pts),W=300,Hh=90;
  const xy=pts.map((v,i)=>[10+i*(W-20)/(pts.length-1),Hh-12-(mx===mn?.5:(v-mn)/(mx-mn))*(Hh-30)]);
  return '<section class="card aphc"><h2>'+t("История цен ЖК","ТК бағаларының тарихы")+'</h2><p class="mut">'+t("Медианная цена за м² по всем ЖК. Данные с "+f+".","Барлық ТК бойынша м² медианалық бағасы. Деректер "+f+" бастап.")+'</p><svg viewBox="0 0 '+W+' '+Hh+'" class="aphs" role="img"><polyline fill="none" stroke="#10131a" stroke-width="2.5" stroke-linejoin="round" points="'+xy.map(p=>p.join(",")).join(" ")+'"/>'+xy.map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4" fill="#fff" stroke="#10131a" stroke-width="2.5"/>').join("")+'</svg><p><b>'+num(pts[pts.length-1])+' ₸/м²</b> '+t("сейчас","қазір")+', '+(pts[pts.length-1]>=pts[0]?"+":"")+dec((pts[pts.length-1]-pts[0])/pts[0]*100,1)+'% '+t("с начала записи","жазба басынан бері")+'.</p></section>';
}

function aptPage(){
  const A=APT();
  if(!A.complexes.length){app.innerHTML=crumbs([[HOME(),"#/"],[t("Квартиры","Пәтерлер")]])+'<h1>'+t("Квартиры","Пәтерлер")+'</h1><div class="card"><p class="lead" style="margin:0">'+t("Данные по жилым комплексам появятся после первого сбора.","Тұрғын үй кешендері бойынша деректер алғашқы жинаудан кейін шығады.")+'</p></div>'+FOOT();return}
  let list=A.complexes.filter(c=>(APT_DEV==="all"||c.dev===APT_DEV)&&(APT_CLS==="all"||c.cls===APT_CLS)&&(APT_DIST==="all"||(APT_DIST==="none"?!c.dist:c.dist===APT_DIST)));
  if(APT_ONLY.has("inst"))list=list.filter(c=>c.inst);
  if(APT_ONLY.has("mort"))list=list.filter(c=>c.mort);
  if(APT_ONLY.has("promo"))list=list.filter(c=>c.promos.length);
  if(APT_ONLY.has("soon"))list=list.filter(c=>c.status==="done"||c.first[0]<=2026);
  if(APT_PT)list=list.filter(c=>{const d=aptD(c);return d!=null&&(!APT_R||d<=APT_R)});
  list=list.slice().sort((a,b)=>APT_SORT==="near"&&APT_PT?(aptD(a)-aptD(b)):APT_SORT==="m2"||APT_SORT==="near"?a.m2-b.m2:APT_SORT==="down"?((a.mort?a.mort.pct:99)-(b.mort?b.mort.pct:99)||a.m2-b.m2):(a.first[0]*10+a.first[1])-(b.first[0]*10+b.first[1]));
  const cnt=id=>A.complexes.filter(c=>id==="all"||c.dev===id).length;
  const chip=(k,lab)=>'<button type="button" class="ach2'+(APT_ONLY.has(k)?" on":"")+'" data-o="'+k+'">'+lab+'</button>';
  const MOBA=innerWidth<=700;
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Квартиры","Пәтерлер")]])+
   '<h1>'+t("Квартиры от застройщиков в Алматы","Алматыдағы құрылысшылардан пәтерлер")+'</h1><p class="sub">'+t("Сравниваем жилые комплексы: цена за м², первый взнос, рассрочка, ипотека, акции и сроки сдачи. Данные krisha.kz и kn.kz на ","Тұрғын үй кешендерін салыстырамыз: м² бағасы, алғашқы жарна, бөліп төлеу, ипотека, акциялар және тапсыру мерзімі. krisha.kz және kn.kz деректері: ")+esc(A.updated)+'.</p>'+
   secNav([["apn",t("Рядом с вами","Жақын")],["aml",t("Карта","Карта")],["alist",t("Все ЖК","Барлық ТК")],["bud",t("Подбор по бюджету","Бюджет бойынша")],["cib",t("Рассрочка или ипотека","Бөліп төлеу/ипотека")],["aphw",t("История цен","Баға тарихы")],["mort",t("Ипотека","Ипотека")]])+tipHtml("apt","Нажмите сердечко на двух-трех ЖК, чтобы сравнить их в таблице. Нажмите на фото, чтобы открыть его.","Екі-үш ТК-да жүрекшені басып, оларды кестеде салыстырыңыз. Фотоны ашу үшін оны басыңыз.")+aptNearBlock()+aptMap()+
   (MOBA?'<div class="aprm"><label class="fxamt">'+t("Площадь, м²","Ауданы, м²")+' <input id="apa" inputmode="numeric" value="'+APT_AREA+'"></label><label class="fxamt">'+t("Сначала","Алдымен")+' <select id="aps"><option value="m2"'+(APT_SORT==="m2"?" selected":"")+'>'+t("дешевле","арзан")+'</option><option value="down"'+(APT_SORT==="down"?" selected":"")+'>'+t("меньше взнос","жарна аз")+'</option><option value="date"'+(APT_SORT==="date"?" selected":"")+'>'+t("раньше сдача","ертерек тапсыру")+'</option></select></label></div><section class="alist"><div class="afbar" id="aptf"><div class="afc" id="aptd">'+[["all",t("Все","Барлығы")]].concat(A.developers.map(d=>[d.id,d.name])).map(d=>'<button type="button" data-d="'+d[0]+'" class="'+(APT_DEV===d[0]?"on":"")+'">'+esc(d[1])+' <small>'+cnt(d[0])+'</small></button>').join("")+'</div><div class="afc" id="aptc">'+[["all",t("Любой","Кез келген")],["comfort",t("Комфорт","Комфорт")],["business",t("Бизнес","Бизнес")]].map(x=>'<button type="button" data-c="'+x[0]+'" class="cl-'+x[0]+(APT_CLS===x[0]?" on":"")+'">'+x[1]+'</button>').join("")+'<i class="afd"></i>'+chip("inst",t("Рассрочка","Бөліп төлеу"))+chip("mort",t("Ипотека","Ипотека"))+chip("promo",t("Акция","Акция"))+chip("soon",t("Сдан или 2026","Тапсырылған немесе 2026"))+'</div></div>':'<section class="card aptf" id="aptf"><div class="fxq"><span class="ql">'+t("Застройщик","Құрылысшы")+'</span><div class="seg" id="aptd">'+[["all",t("Все","Барлығы")]].concat(A.developers.map(d=>[d.id,d.name])).map(d=>'<button data-d="'+d[0]+'" class="'+(APT_DEV===d[0]?"on":"")+'">'+esc(d[1])+' <small>'+cnt(d[0])+'</small></button>').join("")+'</div></div>'+
   '<div class="aptrow"><label class="fxamt">'+t("Площадь квартиры, м²","Пәтер ауданы, м²")+' <input id="apa" inputmode="numeric" value="'+APT_AREA+'"></label>'+
    '<div class="seg" id="aptc">'+[["all",t("Любой класс","Кез келген сынып")],["comfort",t("Комфорт","Комфорт")],["business",t("Бизнес","Бизнес")]].map(x=>'<button data-c="'+x[0]+'" class="'+(APT_CLS===x[0]?"on":"")+'">'+x[1]+'</button>').join("")+'</div>'+
    '<label class="fxamt">'+t("Сначала","Алдымен")+' <select id="aps"><option value="m2"'+(APT_SORT==="m2"?" selected":"")+'>'+t("дешевле","арзан")+'</option><option value="down"'+(APT_SORT==="down"?" selected":"")+'>'+t("меньше взнос","жарна аз")+'</option><option value="date"'+(APT_SORT==="date"?" selected":"")+'>'+t("раньше сдача","ертерек тапсыру")+'</option></select></label></div>'+
   '<div class="ach">'+chip("inst",t("Есть рассрочка","Бөліп төлеу бар"))+chip("mort",t("Ипотека от 20%","Ипотека 20%-дан"))+chip("promo",t("Есть акция","Акция бар"))+chip("soon",t("Сдан или 2026","Тапсырылған немесе 2026"))+'</div></section>')+
   '<p class="mut" style="margin:6px 2px 10px">'+t("Показано ЖК: ","Көрсетілген ТК: ")+list.length+'. '+t("Сумма по площади это оценка по минимальной цене за м² в ЖК, реальная цена зависит от планировки и этажа.","Аудан бойынша сома ТК-дегі м²-дің ең төмен бағасы бойынша бағалау, нақты баға жоспарлау мен қабатқа байланысты.")+'</p>'+
   '<div class="aptg" id="alist">'+(list.length?list.map(aptCard).join(""):'<div class="card"><p class="lead" style="margin:0">'+t("Ничего не нашли, снимите часть фильтров.","Ештеңе табылмады, кейбір сүзгілерді алып тастаңыз.")+'</p></div>')+'</div>'+(MOBA?'</section>':'')+
   '<div class="hsec" id="atop"><h2>'+t("Где выгодно сейчас","Қазір қайда тиімді")+'</h2></div>'+aptTop()+budBlock()+ciBlock()+'<div id="aphw">'+aphBlock()+'</div>'+finBlock("mort")+'<h2>'+t("Условия рассрочки застройщиков","Құрылысшылардың бөліп төлеу шарттары")+'</h2><div class="aptpl">'+A.developers.map(d=>'<div class="card"><h3>'+esc(d.name)+'</h3><p class="mut" style="margin:0 0 8px">'+esc(d.note)+'</p>'+d.plans.map(p=>'<div class="al"><b>'+esc(p[0])+'</b><span>'+esc(p[1])+'</span></div>').join("")+'<p class="mut apromo">'+esc(d.promo)+'</p></div>').join("")+'</div>'+
   '<h2>'+t("Что проверить перед покупкой","Сатып алар алдында не тексеру керек")+'</h2><div class="card"><ul class="achk">'+[t("Цену до акции и итоговую цену за м² после скидки.","Акцияға дейінгі бағаны және жеңілдіктен кейінгі м² бағасын."),t("Действует ли скидка при ипотеке или только при полной оплате.","Жеңілдік ипотекада ма, әлде толық төлемде ғана жұмыс істейді ме."),t("К каким этажам и планировкам привязана скидка.","Жеңілдік қай қабаттар мен жоспарларға байланысты."),t("Есть ли надбавка за рассрочку и какие обязательные доплаты.","Бөліп төлеу үшін үстеме және міндетті қосымша төлемдер бар ма."),t("Срок сдачи очереди и репутацию застройщика, разрешение на строительство.","Кезекті тапсыру мерзімі және құрылысшының беделі, құрылыс рұқсаты.")].map(x=>'<li>'+x+'</li>').join("")+'</ul></div>'+
   '<p class="mut fxdis">'+t("Цены и условия берутся с публичных страниц и могут отличаться от итоговых, уточняйте у застройщика. Это не предложение и не финансовый совет. Платеж по ипотеке и рассрочке приблизительный, без страховок и комиссий.","Бағалар мен шарттар ашық беттерден алынады және соңғысынан өзгеше болуы мүмкін, құрылысшыдан нақтылаңыз. Бұл ұсыныс та, қаржылық кеңес те емес. Ипотека мен бөліп төлеу төлемі шамамен, сақтандыру мен комиссиясыз.")+'</p>'+FOOT();
  const rd=()=>{const y=window.scrollY,sl=[...document.querySelectorAll(".afc")].map(x=>x.scrollLeft);aptPage();aptHero();document.querySelectorAll(".afc").forEach((x,i)=>{x.scrollLeft=sl[i]||0});window.scrollTo(0,y)};
  window.APT_RD=rd;
  aptLeaf();finCalc();budInit();aptNearInit();ciInit();
  document.querySelectorAll("[data-dist]").forEach(x=>{const go=()=>{const v=x.dataset.dist;APT_DIST=APT_DIST===v&&v!=="all"?"all":v;rd();const l=document.querySelector(".aptg");if(l)l.scrollIntoView({behavior:"smooth",block:"start"})};x.onclick=go;x.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}}});
  document.querySelectorAll("[data-pin]").forEach(x=>{const go=e=>{e.stopPropagation();const c=APT().complexes.find(q=>q.id===x.dataset.pin);APT_DIST=c&&c.dist?c.dist:"all";APT_DEV="all";rd()};x.onclick=go});
  document.getElementById("aptd").onclick=e=>{const b=e.target.closest("[data-d]");if(b){APT_DEV=b.dataset.d;rd()}};
  document.getElementById("aptc").onclick=e=>{const b=e.target.closest("[data-c]");if(b){APT_CLS=b.dataset.c;rd()}};
  document.getElementById("aps").onchange=e=>{APT_SORT=e.target.value;rd()};
  document.getElementById("apa").onchange=e=>{const v=parseInt(String(e.target.value).replace(/\D/g,""),10);APT_AREA=v>=10&&v<=500?v:50;rd()};
  document.querySelectorAll("#aptf [data-o]").forEach(b=>b.onclick=()=>{const k=b.dataset.o;APT_ONLY.has(k)?APT_ONLY.delete(k):APT_ONLY.add(k);rd()});
  onSearch=()=>{};onEnter=()=>{location.hash="#/smartphones"};
}

const MONF=LG=>LG==="kk"?["қаңтар","ақпан","наурыз","сәуір","мамыр","маусым","шілде","тамыз","қыркүйек","қазан","қараша","желтоқсан"]:["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const ruDate=s=>{const m=String(s||"").match(/^(\d{4})-(\d{2})-(\d{2})/);return m?(+m[3])+" "+MONF(LANG)[+m[2]-1]+" "+m[1]:""};
function fresh(){
  const u=X0.updated_at;
  if(u){const mi=Math.max(0,Math.round((Date.now()-Date.parse(u))/60000));
    const w=mi<2?t("только что","жаңа ғана"):mi<60?mi+t(" мин назад"," мин бұрын"):mi<1440?Math.round(mi/60)+t(" ч назад"," сағ бұрын"):ruDate(u);
    return t("Курсы обновлены: ","Бағамдар жаңартылды: ")+w+".";}
  return X0.updated?t("Курсы обновлены: ","Бағамдар жаңартылды: ")+ruDate(X0.updated)+".":"";
}
const CONTACT=()=>'<section class="contact card"><div><b>'+t("Нашли ошибку или хотите добавить ЖК или обменник?","Қате таптыңыз ба немесе ТК не айырбастау пунктін қосқыңыз келе ме?")+'</b><span>'+t("Напишите мне напрямую, отвечу лично.","Маған тікелей жазыңыз, өзім жауап беремін.")+'</span></div><div class="cbtns"><a class="cwa" href="https://wa.me/77776265885?text='+encodeURIComponent(t("Здравствуйте! Пишу с сайта Тиімді сәт.","Сәлеметсіз бе! Тиімді сәт сайтынан жазып тұрмын."))+'" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.1 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1 2.8.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z"/></svg>WhatsApp</a><a class="cig" href="https://instagram.com/mqq.btw" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>@mqq.btw</a></div></section>';
const FOOT=()=>(location.hash.replace(/^#\/?/,"")?staleHtml():"")+CONTACT()+'<p class="foot">'+t("Данные берутся из публичных источников, это ориентир, а не финансовый совет. Курсы и цены меняются в течение дня.","Деректер ашық дереккөздерден алынады, бұл бағдар, қаржылық кеңес емес. Бағамдар мен бағалар күн ішінде өзгереді.")+' '+fresh()+' <a href="#/about">'+t("Как мы считаем","Біз қалай есептейміз")+'</a></p>';

function setToph(){const e=document.getElementById("top");if(e)document.documentElement.style.setProperty("--toph",e.offsetHeight+"px")}
addEventListener("resize",setToph);
function renderTop(){
  document.documentElement.lang=LANG==="kk"?"kk":"ru";
  if(!window.TM_STUB)document.title=t("Тиімді сәт: курс валют и цены на квартиры в Алматы","Тиімді сәт: Алматыдағы валюта бағамы және пәтер бағасы");
  const h=location.hash,on=r=>r.test(h)?"on":"";
  topEl.innerHTML='<div class="topin">'+
  '<a class="logo" href="#/"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 7v9l-6 4" fill="none" stroke="var(--time)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Тиімді сәт</span></a>'+
  '<div class="sbox2"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="q" type="search" autocomplete="off" placeholder="'+t("Поиск","Іздеу")+'" aria-label="'+t("Поиск","Іздеу")+'" value="'+esc(SEARCH_Q)+'"></div>'+
  '<div class="tact"><button class="thm" type="button" aria-label="'+(THM()?t("Светлая тема","Жарық тақырып"):t("Темная тема","Қараңғы тақырып"))+'">'+thmIco()+'</button><div class="lang" role="group" aria-label="Язык / Тіл"><button data-l="kk" class="'+(LANG==="kk"?"on":"")+'">ҚАЗ</button><button data-l="ru" class="'+(LANG==="ru"?"on":"")+'">РУС</button></div></div></div>'+
  '<nav class="catnav"><div class="topin"><a class="'+(h===""||h==="#/"||h==="#"?"on":"")+'" href="#/">'+sv("home2")+t("Главная","Басты бет")+'</a><a class="'+on(/^#\/currency/)+'" href="#/currency">'+sv("cash")+t("Валюта","Валюта")+'</a><a class="'+on(/^#\/(apartments|duel)/)+'" href="#/apartments">'+sv("home")+t("Квартиры","Пәтерлер")+'</a><a class="nl" href="#/about">'+t("Как мы считаем","Біз қалай есептейміз")+'</a></div></nav>';
  setToph();requestAnimationFrame(setToph);
  const qi=document.getElementById("q");
  qi.oninput=e=>{SEARCH_Q=e.target.value;gsShow()};qi.onblur=()=>setTimeout(gsClose,120);qi.onfocus=()=>{if(SEARCH_Q.trim())gsShow()};
  qi.onkeydown=e=>{if(e.key==="Escape"){gsClose();qi.blur();return}if(e.key!=="Enter")return;e.preventDefault();GS_L=gsList(SEARCH_Q);if(GS_L.length)gsPick(0)};
  topEl.querySelectorAll(".lang button").forEach(b=>b.onclick=()=>setLang(b.dataset.l));
}
let TBL=null;
function tbi(el){const on=el.querySelector("a.on"),old=el.querySelector(".tbi");if(old)old.remove();if(!on)return;const s=document.createElement("span");s.className="tbi";s.style.width=on.offsetWidth+"px";s.style.transform="translateX("+(TBL!=null?TBL:on.offsetLeft)+"px)";el.insertBefore(s,el.firstChild);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{s.style.transform="translateX("+on.offsetLeft+"px)";TBL=on.offsetLeft}))}
function bottomBar(){
  const h=location.hash,on=r=>r.test(h)?"on":"";
  let el=document.getElementById("btab");if(!el){el=document.createElement("nav");el.id="btab";el.className="btab";el.setAttribute("aria-label",t("Основное меню","Негізгі мәзір"));document.body.appendChild(el)}
  const it=(href,ic,l,cls)=>'<a class="'+cls+'" href="'+href+'"'+(cls==="on"?' aria-current="page"':'')+'>'+sv(ic)+'<span>'+l+'</span></a>';
  el.innerHTML=it("#/","home2",t("Главная","Басты"),(h===""||h==="#/"||h==="#")?"on":"")+it("#/currency","cash",t("Валюта","Валюта"),on(/^#\/currency/))+it("#/apartments","home",t("Квартиры","Пәтер"),on(/^#\/(apartments|duel)/))+it("#/wallet","wal",t("Мои деньги","Ақшам"),on(/^#\/wallet/))+it("#/about","info",t("О проекте","Жоба"),on(/^#\/about/));
  tbi(el)
}
function mobileCollapse(){
  if(innerWidth>700)return;
  const mk=(head,body,open)=>{const d=document.createElement("details");d.className="mcol";if(open)d.open=true;const sm=document.createElement("summary");sm.textContent=head.textContent;d.appendChild(sm);head.parentNode.insertBefore(d,head);d.appendChild(body);head.remove()};
  const af=app.querySelector(".aptf");if(af&&!af.closest(".mcol")){const d=document.createElement("details");d.className="mcol";const sm=document.createElement("summary");sm.textContent=LANG==="kk"?"Сүзгілер":"Фильтры";d.appendChild(sm);af.parentNode.insertBefore(d,af);d.appendChild(af)}
  const ag=app.querySelector(".aptg");if(ag&&!ag.dataset.m){ag.dataset.m="1";const cs=[...ag.children];if(cs.length>3){cs.slice(3).forEach(c=>c.classList.add("mhide"));const b=document.createElement("button");b.type="button";b.className="fxmore";b.textContent=(LANG==="kk"?"Барлығын көрсету":"Показать все")+" ("+cs.length+")";b.onclick=()=>{ag.querySelectorAll(".mhide").forEach(c=>c.classList.remove("mhide"));b.remove()};ag.after(b)}}
  app.querySelectorAll("h3.fxh3").forEach(h=>{const b=h.nextElementSibling;if(b)mk(h,b,false)});
  app.querySelectorAll(":scope > h2").forEach(h=>{if(/Ближайшие|Что влияет|Условия рассрочки|Что проверить|Официальные дилеры|Что добавим/i.test(h.textContent)){const b=h.nextElementSibling;if(b&&b.tagName!=="H2")mk(h,b,false)}});
}


const NORM=s=>String(s||"").toLowerCase().replace(/ё/g,"е").replace(/ү/g,"у").replace(/ұ/g,"у").replace(/қ/g,"к").replace(/ғ/g,"г").replace(/ң/g,"н").replace(/ә/g,"а").replace(/ө/g,"о").replace(/һ/g,"х").replace(/і/g,"и").replace(/[^a-z0-9а-я₸$€₽¥£ ]+/g," ").replace(/\s+/g," ").trim();
const LAT={a:"а",b:"б",v:"в",g:"г",d:"д",e:"е",z:"з",i:"и",k:"к",l:"л",m:"м",n:"н",o:"о",p:"п",r:"р",s:"с",t:"т",u:"у",f:"ф",h:"х",y:"ы"};
function aptGo(id){APT_DEV="all";APT_DIST="all";APT_CLS="all";APT_ONLY.clear();
  const fin=()=>{const c=document.getElementById("apt-"+id);if(!c)return;c.classList.remove("mhide");c.scrollIntoView({behavior:"smooth",block:"center"});c.classList.add("pulse");setTimeout(()=>c.classList.remove("pulse"),1800)};
  if(location.hash==="#/apartments"){aptPage();aptHero();setTimeout(fin,80)}else{location.hash="#/apartments";setTimeout(fin,500)}}
function secGo(h,sel){const go=()=>{const e=document.querySelector(sel);if(e)e.scrollIntoView({behavior:"smooth",block:"start"})};if(location.hash===h)go();else{location.hash=h;setTimeout(go,550)}}
function gsList(q){
  const raw=q.trim();if(raw.length<1)return[];const n=NORM(raw),R=[];if(!n)return[];
  const n2=n.replace(/[a-z]/g,c=>LAT[c]||c);const sc1=(x,q)=>{if(x===q)return 4;if(x.startsWith(q))return 3;if(x.split(" ").some(w=>w.startsWith(q)))return 2;return x.includes(q)&&q.length>=2?1:0};const sc=(txt)=>{const x=NORM(txt);if(!x)return 0;const x2=x.replace(/[a-z]/g,c=>LAT[c]||c);return Math.max(sc1(x,n),sc1(x2,n2),n2!==n?sc1(x,n2):0)};
  const A=APT(),dn=id=>(A.developers.find(d=>d.id===id)||{}).name||id;
  A.complexes.forEach(c=>{const s=Math.max(sc(c.name),sc(dn(c.dev))-1,sc(c.district||"")-1);if(s>0)R.push({s:s+.5,k:t("ЖК","ТК"),n:c.name,sub:dn(c.dev)+" · "+num(c.m2)+" ₸/м²",go:()=>aptGo(c.id)})});
  A.developers.forEach(d=>{const s=sc(d.name);if(s>0)R.push({s:s+.3,k:t("Застройщик","Құрылысшы"),n:d.name,sub:A.complexes.filter(c=>c.dev===d.id).length+" "+t("ЖК","ТК"),go:()=>{APT_DEV=d.id;APT_DIST="all";APT_CLS="all";APT_ONLY.clear();if(location.hash==="#/apartments")route();else location.hash="#/apartments"}}) });
  const CUR={USD:["доллар","dollar","usd","$","бакс","доллары"],EUR:["евро","euro","eur","€"],RUB:["рубл","rub","₽","рос"],CNY:["юан","yuan","cny","¥","кита"],GBP:["фунт","pound","gbp","£","англ"]};
  FXK.forEach(k=>{const w=CUR[k].concat([k.toLowerCase(),NORM(FXC[k].n[0]),NORM(FXC[k].n[1])]);const s=Math.max.apply(null,w.map(x=>{x=NORM(x);return x&&(x===n?4:x.startsWith(n)||n.startsWith(x)&&x.length>=3?3:x.includes(n)&&n.length>=2?1:0)}));if(s>0)R.push({s:s+.4,k:t("Валюта","Валюта"),n:FXC[k].n[LANG==="kk"?1:0]+" "+k,sub:t("где выгодно купить и продать","қайда тиімді сатып алу және сату"),go:()=>{location.hash="#/currency/"+k}})});
  const seen={};((window.TM_FX&&(TM_FX.exchangers||[]).concat(TM_FX.banks||[]))||[]).forEach(e=>{const nm=e.name||"";if(!nm||seen[nm])return;seen[nm]=1;const s=sc(nm);if(s>0)R.push({s:s,k:t("Обменник","Айырбастау"),n:nm,sub:t("курсы в Алматы","Алматыдағы бағам"),go:()=>{location.hash="#/currency/USD"}})});
  const SEC=[["ипотек mortgage кредит ставк взнос","Ипотека и ежемесячный платеж","Ипотека және айлық төлем",()=>secGo("#/apartments","#mort")],["депозит вклад проценты накоплен","Депозиты: где ставки выше","Депозиттер: мөлшерлеме қайда жоғары",()=>secGo("#/currency/USD","#dep")],["рассрочк installment","Рассрочка застройщиков","Құрылысшылардың бөліп төлеуі",()=>secGo("#/apartments",".aptpl")],["сезонн прогноз когда","Сезонность: когда брать валюту","Маусымдылық: валютаны қашан алу",()=>secGo("#/currency/USD",".sea")],["карта где находятся map","Карта ЖК","ТК картасы",()=>secGo("#/apartments",".amapc")],["сравн дуэль duel","Сравнить два ЖК","Екі ТК-ны салыстыру",()=>{location.hash="#/apartments"}],["как считаем источник данные о сайте","Как мы считаем","Біз қалай есептейміз",()=>{location.hash="#/about"}],["квартир новостро пәтер жк","Все квартиры","Барлық пәтерлер",()=>{location.hash="#/apartments"}],["курс валют обмен","Все курсы валют","Барлық валюта бағамдары",()=>{location.hash="#/currency"}]];
  SEC.forEach(x=>{if(x[0].split(" ").some(w=>w&&n.length>=2&&(w.startsWith(n)||n.startsWith(w)&&w.length>=4)))R.push({s:1.2,k:t("Раздел","Бөлім"),n:t(x[1],x[2]),sub:"",go:x[3]})});
  R.sort((a,b)=>b.s-a.s);return R.slice(0,8);
}
let GS_L=[];
function gsClose(){const b=document.getElementById("gs");if(b)b.remove()}
function gsPick(i){const r=GS_L[i];if(!r)return;gsClose();SEARCH_Q="";const q=document.getElementById("q");if(q){q.value="";q.blur()}r.go()}
function gsShow(){
  let b=document.getElementById("gs");GS_L=gsList(SEARCH_Q);
  if(!SEARCH_Q.trim()){if(b)b.remove();return}
  if(!b){b=document.createElement("div");b.id="gs";b.className="gs";b.setAttribute("role","listbox");document.querySelector(".sbox2").appendChild(b);
    b.addEventListener("pointerdown",e=>e.preventDefault());
    b.addEventListener("click",e=>{const r=e.target.closest("[data-i]");if(r)gsPick(+r.dataset.i)})}
  b.innerHTML=GS_L.length?GS_L.map((x,i)=>'<button type="button" role="option" data-i="'+i+'"><i>'+esc(x.k)+'</i><span><b>'+esc(x.n)+'</b>'+(x.sub?'<small>'+esc(x.sub)+'</small>':'')+'</span></button>').join(""):'<div class="gse"><b>'+t("Ничего не нашли","Ештеңе табылмады")+'</b><small>'+t("Попробуйте: доллар, ипотека, Каспий, BI Group","Мынаны көріңіз: доллар, ипотека, Каспий, BI Group")+'</small></div>';
}

function duelPage(a,b,c3){
  const L=APT().complexes,pick=id=>L.find(x=>x.id===id);
  const S=[pick(a)||L[0],pick(b)||L[1]||L[0]];const T=c3?pick(c3):null;if(T)S.push(T);
  const N=S.length,opt=(sel,none)=>(none?'<option value="">'+t("+ третий ЖК","+ үшінші ТК")+'</option>':"")+L.map(x=>'<option value="'+esc(x.id)+'"'+(x.id===sel?" selected":"")+'>'+esc(x.name)+'</option>').join("");
  const dev=x=>{const d=APT().developers.find(q=>q.id===x.dev);return d?d.name:"—"};
  const cl=x=>({business:t("Бизнес","Бизнес"),comfort:t("Комфорт","Комфорт"),econom:t("Эконом","Эконом"),premium:t("Премиум","Премиум")}[x.cls]||x.cls||"—");
  const mp=x=>x.mort?Math.round(aptMonthly(x.m2*APT_AREA*(1-x.mort.pct/100),x.mort.rate,x.mort.years)/1000)*1000:null;
  const R=[
    [t("Застройщик","Құрылысшы"),dev,null],
    [t("Район","Аудан"),x=>x.district||"—",null],
    [t("Цена за м²","м² бағасы"),x=>x.m2?num(x.m2)+" ₸":"—",x=>x.m2,-1],
    [t("Цена за ","Бағасы ")+APT_AREA+" м²",x=>mln(x.m2*APT_AREA),x=>x.m2,-1],
    [t("Класс","Сынып"),cl,null],
    [t("Ближайшая сдача","Жақын тапсыру"),x=>x.status==="done"?t("Сдан","Тапсырылған"):dpast((x.delivery||["—"])[0].split(": ").pop()),null],
    [t("Рассрочка","Бөліп төлеу"),x=>x.inst?t("взнос ","жарна ")+x.inst.pct+"%, "+x.inst.months+t(" мес."," ай"):"—",x=>x.inst?x.inst.months:0,1],
    [t("Ипотека","Ипотека"),x=>x.mort?t("от ","бастап ")+x.mort.rate+"%, "+t("взнос ","жарна ")+x.mort.pct+"%":"—",x=>x.mort?x.mort.rate:null,-1],
    [t("Платеж по ипотеке в месяц","Ипотека бойынша айлық төлем"),x=>mp(x)?"≈ "+num(mp(x))+" ₸":"—",mp,-1],
    [t("Нужный доход (платеж x 2)","Қажет табыс (төлем x 2)"),x=>mp(x)?"≈ "+num(mp(x)*2)+" ₸":"—",x=>mp(x)?mp(x)*2:null,-1],
    [t("Акции","Акциялар"),x=>(x.promos&&x.promos.length)?x.promos.join("; "):"—",null]];
  const rows=R.map(r=>{const vs=S.map(x=>r[2]?r[2](x):null),ok=vs.filter(v=>v!=null),mx=Math.max.apply(null,ok.concat([0])),best=ok.length>1&&new Set(ok).size>1?(r[3]>0?Math.max.apply(null,ok):Math.min.apply(null,ok)):null;
    return '<div class="dr"><div class="dl">'+r[0]+'</div>'+S.map((x,k)=>'<div class="dv'+(best!=null&&vs[k]===best?" win":"")+'">'+esc(r[1](x))+((vs[k]!=null&&mx>0&&ok.length>1)?'<i class="dbr" style="width:'+Math.max(8,Math.round(vs[k]/mx*100))+'%"></i>':'')+'</div>').join("")+'</div>'}).join("");
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Квартиры","Пәтерлер"),"#/apartments"],[t("Сравнение","Салыстыру")]])+'<div class="duel n'+N+'"><h1>'+t("Сравнить ЖК","ТК салыстыру")+'</h1><div class="dsel s'+N+'"><select id="da" aria-label="1">'+opt(S[0].id)+'</select><select id="db" aria-label="2">'+opt(S[1].id)+'</select><select id="dc" aria-label="3">'+opt(T?T.id:"",!T)+'</select></div><div class="dtab" style="--n:'+N+'">'+rows+'</div><p class="dnote">'+t("Зеленым отмечено то, что выгоднее для покупателя. Платеж по ипотеке считаем для площади "+APT_AREA+" м² и срока из условий застройщика. Данные ориентировочные, уточняйте у застройщика.","Жасылмен сатып алушыға тиімдісі белгіленген. Ипотека төлемін "+APT_AREA+" м² ауданға және құрылысшы шарттарындағы мерзімге есептейміз. Деректер шамамен, құрылысшыдан нақтылаңыз.")+'</p></div>'+FOOT();
  const go=()=>{const v=["da","db","dc"].map(i=>document.getElementById(i).value).filter(Boolean);location.hash="#/duel/"+v.join("/")};
  ["da","db","dc"].forEach(i=>document.getElementById(i).onchange=go);
  document.title=t("Сравнение ЖК Алматы","Алматы ТК салыстыру")+" | Тиімді сәт";
}

function aptHero(){
  const A=APT(),L=A.complexes;if(!L.length)return;
  const h=app.querySelector("h1");if(!h)return;
  const min=L.reduce((a,c)=>c.m2<a.m2?c:a,L[0]),mort=L.filter(c=>c.mort).reduce((a,c)=>(!a||c.mort.rate<a.mort.rate)?c:a,null),inst=L.filter(c=>c.inst).reduce((a,c)=>(!a||c.inst.months>a.inst.months)?c:a,null);
  const sub=app.querySelector(".sub");
  const d=document.createElement("section");d.className="ahero";
  d.innerHTML='<span class="ahl">'+t("Новостройки Алматы","Алматы жаңа құрылыстары")+'</span><div class="ahn">'+num(min.m2)+'<i>₸/м²</i></div><div class="ahs">'+t("минимальная цена за м² среди "+L.length+" ЖК","м² бойынша ең төмен баға, "+L.length+" ТК арасында")+'</div>'+
   '<div class="aht"><div><small>'+t("Ипотека от","Ипотека бастап")+'</small><b>'+(mort?mort.mort.rate+'%':'—')+'</b></div><div><small>'+t("Рассрочка до","Бөліп төлеу")+'</small><b>'+(inst?inst.inst.months+' '+t("мес.","ай"):'—')+'</b></div><div><small>'+t("Застройщиков","Құрылысшы")+'</small><b>'+A.developers.length+'</b></div></div>'+
   '';
  h.classList.add("sr");h.insertAdjacentElement("beforebegin",d);
  if(sub)sub.classList.add("sr");
}
function duelLink(){
  const a=document.createElement("a");a.className="duelb";a.href="#/duel";a.textContent=t("Сравнить два ЖК","Екі ТК салыстыру");
  const h=app.querySelector("h1,h2");if(h)h.insertAdjacentElement("afterend",a);else app.prepend(a)}


const FLG={
USD:'<rect width="48" height="48" fill="#fff"/>'+[0,2,4,6].map(i=>'<rect y="'+(i*48/7)+'" width="48" height="'+(48/7)+'" fill="#C8283B"/>').join("")+'<rect width="24" height="26" fill="#2B3F8C"/>'+[[6,6],[12,6],[18,6],[9,12],[15,12],[6,18],[12,18],[18,18]].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="1.4" fill="#fff"/>').join(""),
EUR:'<rect width="48" height="48" fill="#2149A6"/>'+Array.from({length:12},(_,i)=>'<circle cx="'+(24+14*Math.sin(i*Math.PI/6)).toFixed(1)+'" cy="'+(24-14*Math.cos(i*Math.PI/6)).toFixed(1)+'" r="2.1" fill="#FFD83D"/>').join(""),
RUB:'<rect width="48" height="16" fill="#fff"/><rect y="16" width="48" height="16" fill="#2A56C6"/><rect y="32" width="48" height="16" fill="#D8283A"/>',
CNY:'<rect width="48" height="48" fill="#D8281F"/><path d="M14 6l2.6 8h8.4l-6.8 5 2.6 8-6.8-5-6.8 5 2.6-8-6.8-5h8.4z" fill="#FFDE00" transform="translate(2 2) scale(.9)"/><circle cx="31" cy="9" r="1.8" fill="#FFDE00"/><circle cx="36" cy="14" r="1.8" fill="#FFDE00"/><circle cx="36" cy="21" r="1.8" fill="#FFDE00"/><circle cx="31" cy="26" r="1.8" fill="#FFDE00"/>',
GBP:'<rect width="48" height="48" fill="#1F3A8F"/><path d="M0 0L48 48M48 0L0 48" stroke="#fff" stroke-width="8"/><path d="M0 0L48 48M48 0L0 48" stroke="#C8283B" stroke-width="3"/><path d="M24 0v48M0 24h48" stroke="#fff" stroke-width="14"/><path d="M24 0v48M0 24h48" stroke="#C8283B" stroke-width="8"/>'};
const flag=(k,sz)=>'<svg class="fl" viewBox="0 0 48 48" width="'+(sz||40)+'" height="'+(sz||40)+'" aria-hidden="true">'+(FLG[k]||'')+'</svg>';
const BCD={};let BCN=0;
const bcDate=s=>{const m=String(s).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);if(!m)return String(s);const ms=LANG==="kk"?["қаң","ақп","нау","сәу","мам","мау","шіл","там","қыр","қаз","қар","жел"]:["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];return (m[3]?(+m[3])+" ":"")+ms[+m[2]-1]+" "+m[1]};
function bigChart(v,lab,dates){
  if(v.length<2)return"";const mn=Math.min(...v),mx=Math.max(...v),W=320,H=120,pd=10;
  const p=v.map((y,i)=>[i*W/(v.length-1),H-pd-(y-mn)/((mx-mn)||1)*(H-2*pd)]);
  let d="M"+p[0][0].toFixed(1)+" "+p[0][1].toFixed(1);
  for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],cx=(a[0]+b[0])/2;d+=" C"+cx.toFixed(1)+" "+a[1].toFixed(1)+" "+cx.toFixed(1)+" "+b[1].toFixed(1)+" "+b[0].toFixed(1)+" "+b[1].toFixed(1)}
  const l=p[p.length-1];
  const id=++BCN;BCD[id]={v:v,d:dates||[],p:p,W:W,H:H};
  return '<div class="bc" data-bc="'+id+'"><svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399" stop-opacity=".35"/><stop offset="1" stop-color="#34d399" stop-opacity="0"/></linearGradient></defs><path d="'+d+' L'+W+' '+H+' L0 '+H+'Z" fill="url(#bcg)"/><path d="'+d+'" fill="none" stroke="#34d399" stroke-width="2.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg><b class="bcv"></b><i style="left:'+(l[0]/W*100)+'%;top:'+(l[1]/H*100)+'%"></i><em class="bct"></em><span class="bcl">'+(lab||"")+'</span></div>';
}
(function(){
  const at=(bc,cl)=>{const D=BCD[bc.dataset.bc];if(!D)return;const r=bc.getBoundingClientRect(),n=D.v.length;
    const i=cl===null?n-1:Math.max(0,Math.min(n-1,Math.round((cl-r.left)/r.width*(n-1))));
    const dot=bc.querySelector("i"),vl=bc.querySelector(".bcv"),tp=bc.querySelector(".bct");
    dot.style.left=(D.p[i][0]/D.W*100)+"%";dot.style.top=(D.p[i][1]/D.H*100)+"%";
    vl.style.left=(D.p[i][0]/D.W*100)+"%";
    const live=cl!==null;bc.classList.toggle("act",live);
    tp.textContent=(D.d[i]?bcDate(D.d[i])+": ":"")+dc2(D.v[i])+" ₸";
    const px=D.p[i][0]/D.W*100;tp.style.left=Math.max(22,Math.min(78,px))+"%"};
  let cur=null;
  document.addEventListener("pointerdown",e=>{const bc=e.target.closest&&e.target.closest(".bc");if(!bc)return;cur=bc;at(bc,e.clientX)});
  document.addEventListener("pointermove",e=>{const bc=cur||(e.pointerType==="mouse"&&e.target.closest&&e.target.closest(".bc"));if(bc)at(bc,e.clientX)});
  const end=()=>{if(cur){const b=cur;cur=null;setTimeout(()=>at(b,null),1400)}};
  document.addEventListener("pointerup",end);document.addEventListener("pointercancel",end);
  document.addEventListener("pointerout",e=>{const bc=e.target.closest&&e.target.closest(".bc");if(bc&&e.pointerType==="mouse"&&!bc.contains(e.relatedTarget))at(bc,null)});
})();
function tmBlock(cur){
  const S=fxSer(cur,365).h;if(!S||S.length<10)return"";const sy=(typeof SYM!=="undefined"&&SYM[cur])||cur;
  return '<section class="card tmc" id="tmc" data-cur="'+cur+'"><div class="tmh"><h2>'+t("Машина времени","Уақыт машинасы")+'</h2><span class="shg"><button type="button" class="shr" data-share="'+cur+'">'+t("Поделиться","Бөлісу")+'</button><button type="button" class="shr" data-share="'+cur+'" data-story="1">Stories</button></span></div><p class="mut" style="margin:0 0 12px">'+t("Двигайте ползунок и смотрите, сколько тенге стоили 1000 "+sy+" раньше.","Жүгірткіні жылжытып, бұрын 1000 "+sy+" қанша теңге тұрғанын көріңіз.")+'</p><div class="tmd" id="tmd"></div><input id="tmq" type="range" min="0" max="'+(S.length-1)+'" value="0" aria-label="'+t("Дата","Күні")+'"><div class="tmx"><span id="tmx0"></span><span>'+t("сегодня","бүгін")+'</span></div><div class="tmr"><div><small>'+t("Тогда","Сол кезде")+'</small><b id="tmt"></b></div><div><small>'+t("Сейчас","Қазір")+'</small><b id="tmn"></b></div></div><div class="tmv" id="tmv"></div></section>'}
function tmInit(){
  const c=document.getElementById("tmc");if(!c)return;const cur=c.dataset.cur,S=fxSer(cur,365).h,q=document.getElementById("tmq"),sy=(typeof SYM!=="undefined"&&SYM[cur])||cur,now=S[S.length-1][1];
  const go=()=>{const i=+q.value,p=S[i],th=p[1]*1000,nw=now*1000,d=(nw-th)/th*100;
    document.getElementById("tmd").textContent=bcDate(p[0]);document.getElementById("tmx0").textContent=bcDate(S[0][0]);
    document.getElementById("tmt").textContent="1000 "+sy+" = "+num(Math.round(th))+" ₸";document.getElementById("tmn").textContent=num(Math.round(nw))+" ₸";
    const v=document.getElementById("tmv"),ab=Math.abs(d);
    v.className="tmv "+(Math.abs(d)<.05?"":d>0?"up":"dn");
    v.textContent=Math.abs(d)<.05?t("Курс почти не изменился.","Бағам дерлік өзгерген жоқ."):d>0?t("С тех пор "+cur+" подорожал на "+dec(ab,1)+"%. Каждые 1000 "+sy+" сейчас дороже на "+num(Math.round(nw-th))+" ₸.","Содан бері "+cur+" "+dec(ab,1)+"% қымбаттады. 1000 "+sy+" қазір "+num(Math.round(nw-th))+" ₸ қымбат."):t("С тех пор "+cur+" подешевел на "+dec(ab,1)+"%. Каждые 1000 "+sy+" сейчас дешевле на "+num(Math.round(th-nw))+" ₸.","Содан бері "+cur+" "+dec(ab,1)+"% арзандады. 1000 "+sy+" қазір "+num(Math.round(th-nw))+" ₸ арзан.");
    q.style.setProperty("--p",(i/(S.length-1)*100)+"%")};
  q.oninput=go;go();
}
function shareCard(cur,story){
  const st=fxStat(cur);if(!st)return;const W=1080,H=story?1920:1350,cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d");
  const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,"#0e1a2b");g.addColorStop(.6,"#11263d");g.addColorStop(1,"#0c3a36");x.fillStyle=g;x.fillRect(0,0,W,H);
  const r=x.createRadialGradient(W*.85,H*.1,0,W*.85,H*.1,600);r.addColorStop(0,"rgba(52,211,153,.35)");r.addColorStop(1,"rgba(52,211,153,0)");x.fillStyle=r;x.fillRect(0,0,W,H);
  const F="Inter, Arial, sans-serif";
  if(story){const nm=FXC[cur].n[LANG==="kk"?1:0],dn=st.ch<0;x.fillStyle="#fff";x.font="800 96px "+F;x.fillText(nm+(LANG==="kk"?(dn?" түсті,":" өсті,"):(dn?" упал,":" вырос,")),80,230);x.fillStyle=dn?"#4ade80":"#ffd37a";x.fillText(LANG==="kk"?(dn?"аламыз ба?":"күтеміз бе?"):(dn?"берем?":"ждем?"),80,340);x.translate(0,330)}
  x.fillStyle="#fff";x.font="700 44px "+F;x.fillText("Тиімді сәт",80,120);
  x.fillStyle="rgba(255,255,255,.65)";x.font="500 40px "+F;x.fillText(t("Официальный курс Нацбанка РК","ҚР Ұлттық банкінің ресми бағамы"),80,300);
  x.fillStyle="#fff";x.font="700 64px "+F;x.fillText(FXC[cur].n[LANG==="kk"?1:0]+" · "+cur,80,400);
  x.font="600 210px "+F;x.fillText(dc2(st.last),80,640);const wd=x.measureText(dc2(st.last)).width;x.fillStyle="rgba(255,255,255,.6)";x.font="500 110px "+F;x.fillText("₸",100+wd,640);
  const up=st.ch>0;x.fillStyle=up?"#ff8a7a":"#4ade80";x.font="700 64px "+F;x.fillText((up?"▲ ":"▼ ")+f1(st.ch).replace("+","").replace("-","")+" "+t("за 30 дн.","30 күнде"),80,780);
  const vt=st.pos<.33?t("Курс в нижней трети за 3 месяца. Для покупки момент хороший.","Бағам 3 айдың төменгі үштен бірінде. Сатып алуға сәті жақсы."):st.pos>.66?t("Курс в верхней трети за 3 месяца. Выгоднее продавать.","Бағам жоғарғы үштен бірінде. Сату тиімді."):t("Курс в середине диапазона. Явного преимущества нет.","Бағам диапазонның ортасында. Айқын артықшылық жоқ.");
  x.fillStyle="#fff";x.font="500 50px "+F;const words=vt.split(" ");let line="",y=930;words.forEach(w=>{const tt=line?line+" "+w:w;if(x.measureText(tt).width>900){x.fillText(line,80,y);y+=68;line=w}else line=tt});x.fillText(line,80,y);
  x.fillStyle="rgba(255,255,255,.55)";x.font="500 38px "+F;x.fillText(location.protocol==="file:"?"momqq.github.io/tenge-machine":location.host+location.pathname.replace(/index\.html$/,""),80,1250);x.fillText(new Date().toLocaleDateString(LANG==="kk"?"kk-KZ":"ru-RU"),80,1300);
  cv.toBlob(async b=>{const f=new File([b],"tiimdi-sat-"+cur+".png",{type:"image/png"});
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:"Тиімді сәт",text:cur+" "+dc2(st.last)+" ₸"});return}}catch(e){if(e&&e.name==="AbortError")return}
    const u=URL.createObjectURL(b),l=document.createElement("a");l.href=u;l.download=f.name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)},"image/png");
}
document.addEventListener("click",e=>{const s=e.target.closest("[data-share]");if(s){e.preventDefault();shareCard(s.dataset.share,s.hasAttribute("data-story"))}});

function home(){
  const nb=(X0.nbk&&X0.nbk.USD)||[],st=fxStat("USD"),A=APT(),dn=id=>(A.developers.find(d=>d.id===id)||{}).name||id;
  const bestOf=k=>{const L=fxList(k).filter(e=>e.rates&&e.rates[k]);if(!L.length)return null;return {buy:L.slice().sort((a,b)=>a.rates[k][1]-b.rates[k][1])[0],sell:L.slice().sort((a,b)=>b.rates[k][0]-a.rates[k][0])[0]}};
  const bu=bestOf("USD"),ch=st?st.ch:null;
  const vals=nb.slice(-90).map(r=>r[1]);
  const HV=fxSer("USD");const hero=st?'<section class="hero3'+(HOME_OPEN?" open":"")+'"><div class="h3top"><span class="h3l">'+flag("USD",28)+t("Доллар сегодня","Бүгінгі доллар")+'</span>'+(ch!=null?'<span class="h3d '+(ch>0?"up":"dn")+'">'+(ch>0?"▲":"▼")+" "+f1(ch).replace("+","")+' '+t("за 30 дн.","30 күнде")+'</span>':'')+'</div>'+
    '<div class="h3tg" role="button" tabindex="0" aria-expanded="false" aria-label="'+t("Подробнее","Толығырақ")+'"><div class="h3n">'+dc2(st.last)+'<i>₸</i></div><div class="h3s">'+t("Официальный курс Нацбанка РК","ҚР Ұлттық банкінің ресми бағамы")+'</div><span class="h3m">'+t("Подробнее","Толығырақ")+'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span></div><div class="h3x"><div>'+perBar()+bigChart(HV.h.map(x=>x[1]),perLab(),HV.h.map(x=>x[0]))+(HV.note?'<p class="pnote">'+HV.note+'</p>':'')+
    (bu?'<div class="h3t"><div><small>'+t("Купить дешевле всего","Ең арзан сатып алу")+'</small><b>'+dc2(bu.buy.rates.USD[1])+' ₸</b><em>'+esc(bu.buy.name)+'</em></div><div><small>'+t("Продать дороже всего","Ең қымбат сату")+'</small><b>'+dc2(bu.sell.rates.USD[0])+' ₸</b><em>'+esc(bu.sell.name)+'</em></div></div>':'')+
    '<a class="h3cta" href="#/currency/USD">'+t("Где выгодно обменять","Қайда тиімді айырбастау")+'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div></div></section>':'';
  const rows=FXK.map(k=>{const b=bestOf(k),s=fxStat(k);if(!b)return"";return '<a class="brow" href="#/currency/'+k+'">'+flag(k,44)+'<div class="bn"><b>'+k+' <small>'+t(FXC[k].n[0],FXC[k].n[1]).replace(/Фунт стерлинг[а-я]*/,'Фунт')+'</small></b><span class="bt">'+(s?dc2(s.last)+' ₸':'')+(s&&s.ch!=null?' <em class="'+(s.ch>0?"up":"dn")+'">'+(s.ch>0?"▲":"▼")+f1(s.ch).replace("+","").replace("-","")+'</em>':'')+(s&&s.pos!=null?'<u class="gg" title="'+t("Где курс сейчас: слева дешево, справа дорого","Бағам қазір қайда: сол жақта арзан, оң жақта қымбат")+'"><i style="left:'+Math.round(Math.max(0,Math.min(1,s.pos))*100)+'%"></i></u>':'')+'</span></div><div class="bv"><small>'+t("Купить","Сатып алу")+'</small><b>'+dc2(b.buy.rates[k][1])+'</b></div><div class="bv"><small>'+t("Продать","Сату")+'</small><b>'+dc2(b.sell.rates[k][0])+'</b></div></a>'}).join("");
  const board=rows?'<section class="board"><div class="bh"><h2>'+t("Курсы в Алматы","Алматыдағы бағамдар")+'</h2><span>'+t("лучшая цена среди обменников и банков","айырбастау пункттері мен банктер арасындағы үздік баға")+'</span></div>'+rows+'<a class="bmore" href="#/currency">'+t("Все обменники и банки","Барлық айырбастау пункттері мен банктер")+' ›</a></section>':'';
  const rng=st?(()=>{const pos=Math.round(Math.max(0,Math.min(1,st.pos))*100),vt=st.pos<.33?"buy":st.pos>.66?"sell":"mid";
    const txt=vt==="buy"?t("Курс в нижней трети за 3 месяца: для покупки момент хороший.","Бағам 3 айдың төменгі үштен бірінде: сатып алуға сәті жақсы."):vt==="sell"?t("Курс в верхней трети за 3 месяца: выгоднее продавать, покупку лучше отложить.","Бағам жоғарғы үштен бірінде: сату тиімді, сатып алуды кейінге қалдырыңыз."):t("Курс в середине диапазона за 3 месяца: явного преимущества нет.","Бағам диапазон ортасында: айқын артықшылық жоқ.");
    return '<section class="rng '+vt+'"><h2>'+t("Когда брать доллар","Долларды қашан алу керек")+'</h2><div class="rbar"><i style="left:'+pos+'%"></i></div><div class="rlab"><span>'+t("дешево","арзан")+'</span><span>'+t("дорого","қымбат")+'</span></div><p>'+txt+'</p><button type="button" class="shr" data-share="USD">'+t("Поделиться картинкой","Суретпен бөлісу")+'</button><a href="#/currency/USD">'+t("Сезонность и прогноз","Маусымдылық және болжам")+' ›</a></section>'})():'';
  const L=A.complexes.slice().sort((a,b)=>a.m2-b.m2).slice(0,7);
  const apts=L.length?'<div class="hsec3"><h2>'+t("Квартиры в новостройках","Жаңа құрылыстағы пәтерлер")+'</h2><a href="#/apartments">'+t("Все ЖК","Барлық ТК")+' ›</a></div><div class="hs3">'+L.map(c=>'<a class="ac3" href="#/apartments"><div class="aim">'+aptArt(c)+(c.img?'<img src="'+esc(c.img)+'" alt="'+esc(c.name)+'" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'<span class="adv">'+esc(dn(c.dev))+'</span></div><div class="abd"><b>'+esc(c.name)+'</b><span>'+esc((c.district||"").split(",")[0])+'</span><strong>'+num(c.m2)+' ₸<small>/м²</small></strong><div class="chs">'+(c.inst?'<i>'+t("Рассрочка ","Бөліп төлеу ")+c.inst.months+t(" мес."," ай")+'</i>':'')+(c.mort?'<i>'+t("Ипотека ","Ипотека ")+c.mort.rate+'%</i>':'')+'</div></div></a>').join("")+'<a class="ac3 acmp" href="#/duel"><span>⇄</span><b>'+t("Сравнить два ЖК","Екі ТК салыстыру")+'</b><small>'+t("цена, рассрочка, ипотека, сроки","баға, бөліп төлеу, ипотека, мерзім")+'</small></a></div>':'';
  const how='<section class="how"><h2>'+t("Как это работает","Бұл қалай жұмыс істейді")+'</h2><ol><li><b>'+t("Валюта","Валюта")+'</b><span>'+t("Выберите валюту. Мы покажем, где в Алматы ее купить дешевле или продать дороже.","Валютаны таңдаңыз. Алматыда оны қайда арзан сатып алуға немесе қымбат сатуға болатынын көрсетеміз.")+'</span></li><li><b>'+t("Когда брать","Қашан алу керек")+'</b><span>'+t("Зеленая полоса значит курс низкий, можно покупать. Красная значит дорого, лучше подождать.","Жасыл жолақ бағам төмен екенін білдіреді, сатып алуға болады. Қызыл жолақ қымбат дегенді білдіреді, күткен жөн.")+'</span></li><li><b>'+t("Квартиры","Пәтерлер")+'</b><span>'+t("Выберите застройщика и сравните ЖК. Нажмите сердечко на двух ЖК и сравните их. Ипотеку посчитайте внизу страницы.","Құрылысшыны таңдап, ТК-ларды салыстырыңыз. Екі ТК-да жүрекшені басып, оларды салыстырыңыз. Ипотеканы беттің төменгі жағында есептеңіз.")+'</span></li></ol></section>';
  const tk=FXK.map(k=>{const s=fxStat(k);return s?'<span><b>'+k+'</b> '+dc2(s.last)+(s.ch!=null?' <em class="'+(s.ch>0?"up":"dn")+'">'+(s.ch>0?"▲":"▼")+f1(s.ch).replace("+","").replace("-","")+'</em>':'')+'</span>':""}).join("");
  const tick=tk?'<div class="tick" aria-hidden="true"><div class="tkt">'+tk+tk+'</div></div>':"";
  app.innerHTML='<h1 class="sr">'+t("Тиімді сәт: курс валют и новостройки Алматы","Тиімді сәт: Алматыдағы валюта бағамы және жаңа тұрғын үйлер")+'</h1>'+tick+'<div class="home3">'+quickBar()+verdictBlock()+hero+board+hubCards()+apts+tgBlock()+how+'</div>'+FOOT();tgInit();
  const hg=document.querySelector(".h3tg");if(hg){const tg=()=>{const o=document.querySelector(".hero3").classList.toggle("open");HOME_OPEN=o;hg.setAttribute("aria-expanded",o)};hg.onclick=tg;hg.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tg()}}}
}
function about(){
  const S=window.TM_SITE||{},F=window.TM_FIN||{},A=APT(),H=window.TM_APH||{snaps:[]};
  const L=(u,x)=>'<a href="'+u+'" target="_blank" rel="noopener noreferrer">'+x+'</a>';
  const src=[
    [t("Официальный курс","Ресми бағам"),L("https://nationalbank.kz","Нацбанк РК"),t("каждые 3 часа, автоматически","әр 3 сағат сайын, автоматты"),fresh().replace(/^[^:]*: /,"")],
    [t("Курсы обменников и банков","Айырбастау пункттері мен банктер бағамы"),L("https://ifin.kz","ifin.kz")+", "+L("https://www.bcc.kz","bcc.kz"),t("каждые 3 часа, автоматически","әр 3 сағат сайын, автоматты"),fresh().replace(/^[^:]*: /,"")],
    [t("Золото и серебро","Алтын және күміс"),L("https://nationalbank.kz/ru/gold/zoloto","Нацбанк")+", "+L("https://www.bcc.kz","ЦентрКредит"),t("каждые 3 часа","әр 3 сағат сайын"),""],
    [t("Цены ЖК, рассрочка, сроки","ТК бағалары, бөліп төлеу, мерзімдер"),L("https://krisha.kz","krisha.kz")+", "+L("https://kn.kz","kn.kz")+", "+t("сайты застройщиков","құрылысшы сайттары"),t("вручную","қолмен"),ruDate(A.updated)],
    [t("Ипотека и депозиты","Ипотека және депозиттер"),L("https://finratings.kz","finratings.kz")+", "+L("https://www.zakon.kz","zakon.kz"),t("вручную","қолмен"),ruDate(F.updated)],
    [t("Когда брать валюту","Валютаны қашан алу"),t("считаем сами по истории Нацбанка","Ұлттық банк тарихы бойынша өзіміз есептейміз"),t("при каждом обновлении","әр жаңартуда"),""]];
  const rows=src.map(r=>'<div class="srr"><b>'+r[0]+'</b><span>'+r[1]+'</span><small>'+r[2]+(r[3]?" · "+r[3]:"")+'</small></div>').join("");
  const first=H.snaps&&H.snaps[0]?ruDate(H.snaps[0].date):"";
  const wa=S.whatsapp?'<a class="btn" href="https://wa.me/'+S.whatsapp+'?text='+encodeURIComponent(t("Здравствуйте! Пишу с сайта Тиімді сәт.","Сәлеметсіз бе! Тиімді сәт сайтынан жазып тұрмын."))+'" target="_blank" rel="noopener noreferrer">WhatsApp</a>':"";
  const em=S.email?'<a class="btn" href="mailto:'+esc(S.email)+'">'+esc(S.email)+'</a>':"";
  const tg=BOTU()?'<a class="btn" href="'+BOTU()+'" target="_blank" rel="noopener noreferrer">'+t("Telegram-бот","Telegram-бот")+'</a>':S.telegram?'<a class="btn" href="'+esc(S.telegram)+'" target="_blank" rel="noopener noreferrer">Telegram</a>':"";
  const gh=S.repo?'<a class="btn" href="'+esc(S.repo)+'/issues" target="_blank" rel="noopener noreferrer">'+t("Сообщить об ошибке","Қате туралы хабарлау")+'</a>':"";
  const P={
    ru:{h:"О проекте",sub:"Кто мы, откуда данные и чему можно верить.",w:"Кто мы",wt:"Тиімді сәт это независимый проект для жителей Алматы. Мы показываем, где выгоднее купить или продать валюту, и сравниваем новостройки: цена за м², рассрочка, ипотека. Сайт ничего не продает и не связан с банками и застройщиками.",s:"Откуда данные",c:"Связаться",ct:"Нашли ошибку, хотите добавить ЖК или обменник? Напишите, отвечу лично.",how:"Как мы считаем",h1:"Когда выгодно покупать валюту",h1t:"Смотрим, в какой части диапазона за 3 месяца находится курс, и как менялся курс в тот же месяц в прошлые годы. Это простые правила по прошлым данным. Они не предсказывают будущее.",h2:"Квартиры",h2t:"Цены за м² это минимум по ЖК. Итоговая цена зависит от этажа, планировки и условий застройщика. Суммы в карточках считаются для выбранной площади и не включают страховку и надбавки. Историю цен мы копим сами с "+(first||"первого снимка")+": придумывать прошлые цены мы не будем.",l:"Важно знать",lt:"Сайт дает справочную информацию, а не финансовый или инвестиционный совет. Курсы и цены меняются в течение дня, перед сделкой уточняйте условия в обменнике, банке или у застройщика. Мы не отвечаем за решения, принятые только по данным сайта.",p:"Конфиденциальность",pt:"У нас нет регистрации, рекламы и сторонней аналитики, мы не собираем ваши имена, телефоны и адреса. В памяти вашего телефона (localStorage) хранятся только язык, тема, выбранные сердечком ЖК и последние настройки фильтров. Они остаются у вас и никуда не отправляются. Если вы нажмете кнопку Найти рядом, браузер спросит доступ к местоположению: оно используется только в телефоне для расчета расстояния и никуда не отправляется. Карта загружается с серверов OpenStreetMap, фото ЖК с krisha.kz, кнопка WhatsApp открывает WhatsApp. Если вы включите Telegram-бота, он хранит ваш номер чата, язык и выбранные оповещения, пока вы не напишете ему /stop."},
    kk:{h:"Жоба туралы",sub:"Біз кімбіз, деректер қайдан және оларға сенуге бола ма.",w:"Біз кімбіз",wt:"Тиімді сәт: алматылықтарға арналған тәуелсіз жоба. Валютаны қайда тиімді сатып алуға немесе сатуға болатынын көрсетеміз және жаңа ТК-ларды салыстырамыз: м² бағасы, бөліп төлеу, ипотека. Сайт ештеңе сатпайды, банктер мен құрылысшыларға тәуелді емес.",s:"Деректер қайдан",c:"Байланыс",ct:"Қате таптыңыз ба, ТК немесе айырбастау пунктін қосқыңыз келе ме? Жазыңыз, өзім жауап беремін.",how:"Біз қалай есептейміз",h1:"Валютаны қашан сатып алған тиімді",h1t:"Бағамның 3 айлық диапазондағы орнын және өткен жылдардағы сол айдағы өзгерісті қараймыз. Бұл өткен деректер бойынша қарапайым ережелер. Олар болашақты болжамайды.",h2:"Пәтерлер",h2t:"м² бағасы: ТК бойынша ең төменгі баға. Соңғы баға қабатқа, жоспарлауға және құрылысшы шарттарына байланысты. Карточкалардағы сомалар таңдалған ауданға есептеледі, сақтандыру мен үстемені қоспайды. Баға тарихын өзіміз "+(first||"алғашқы суреттен")+" бастап жинаймыз: бұрынғы бағаларды ойдан шығармаймыз.",l:"Білу маңызды",lt:"Сайт анықтамалық ақпарат береді, қаржылық немесе инвестициялық кеңес емес. Бағамдар мен бағалар күн ішінде өзгереді, мәміле алдында айырбастау пунктінен, банктен немесе құрылысшыдан шарттарды нақтылаңыз. Тек сайт деректері бойынша қабылданған шешімдерге жауап бермейміз.",p:"Құпиялылық",pt:"Бізде тіркеу, жарнама және сыртқы аналитика жоқ, аттарыңызды, телефондарыңызды және мекенжайларыңызды жинамаймыз. Телефон жадында (localStorage) тек тіл, тақырып, жүрекшемен белгіленген ТК және соңғы сүзгі баптаулары сақталады. Олар сізде қалады және ешқайда жіберілмейді. Жақынды табу батырмасын бассаңыз, браузер орналасқан жерге рұқсат сұрайды: ол тек телефонда қашықтықты есептеу үшін қолданылады және ешқайда жіберілмейді. Карта OpenStreetMap серверлерінен, ТК фотосуреттері krisha.kz-тен жүктеледі, WhatsApp батырмасы WhatsApp қосымшасын ашады. Telegram-ботты қоссаңыз, ол чат нөміріңізді, тілді және таңдалған ескертулерді сіз /stop жазғанша сақтайды."}}[LANG==="kk"?"kk":"ru"];
  app.innerHTML=crumbs([[HOME(),"#/"],[P.h]])+'<div class="prose about"><h1>'+P.h+'</h1><p class="sub">'+P.sub+'</p>'+
   '<h2>'+P.w+'</h2><p>'+P.wt+'</p>'+
   '<h2 id="sources">'+P.s+'</h2><div class="src">'+rows+'</div>'+
   '<h2>'+P.how+'</h2><h3>'+P.h1+'</h3><p>'+P.h1t+'</p><h3>'+P.h2+'</h3><p>'+P.h2t+'</p>'+
   '<h2>'+P.l+'</h2><p>'+P.lt+'</p><h2>'+P.p+'</h2><p>'+P.pt+'</p>'+
   '<p><a href="#" data-onb="1">'+t("Показать, как пользоваться сайтом","Сайтты қалай қолдануды көрсету")+'</a></p><h2>'+P.c+'</h2><p>'+P.ct+'</p><div class="cbtns2">'+wa+tg+em+gh+'</div></div>'+FOOT();
  document.title=P.h+" | Тиімді сәт";
}
function notFound(){app.innerHTML=crumbs([[HOME(),"#/"]])+'<h1>'+t("Страница не найдена","Бет табылмады")+'</h1><p class="lead"><a href="#/">'+t("На главную","Басты бетке")+'</a></p>'}
function route(){
  renderTop();bottomBar();
  const p=location.hash.replace(/^#\/?/,"").split("/").filter(Boolean);
  onSearch=null;onEnter=null;window.scrollTo(0,0);setTimeout(cmpBar,0);
  setTimeout(fxEnter,0);
  if(!p.length)return home();
  if(p[0]==="about")return about();
  if(p[0]==="wallet")return walletPage();
  if(p[0]==="best")return bestPage(p[1]);
  if(p[0]==="ipoteka")return ipotekaPage();
  if(p[0]==="duel")return duelPage(p[1],p[2],p[3]);
  if(p[0]==="apartments"){aptPage();aptHero();return}
  if(p[0]==="currency"){const k=(p[1]||"USD").toUpperCase();return fxPage(FXK.includes(k)?k:"USD")}
  if(["smartphones","cars","catalog","mine","compare","queries"].includes(p[0])){location.replace("#/");return}
  notFound();
}
function revealInit(){
  if(!("IntersectionObserver"in window)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const els=[...document.querySelectorAll("#app .card, #app .board, #app .rng, #app .how, #app .cvb, #app .aptc, #app .hsec3, #app .src")].filter(e=>e.getBoundingClientRect().top>innerHeight*.9);
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("rv-in");io.unobserve(x.target)}}),{rootMargin:"0px 0px -6% 0px",threshold:.05});
  els.forEach(e=>{e.classList.add("rv");io.observe(e)});
  setTimeout(()=>document.querySelectorAll(".rv:not(.rv-in)").forEach(e=>{if(e.getBoundingClientRect().top<innerHeight)e.classList.add("rv-in")}),1500);
}
window.addEventListener("scroll",()=>{document.documentElement.classList.toggle("scr",scrollY>8)},{passive:true});
function fxEnter(){revealInit();setTimeout(fx2,30);setTimeout(wrongBtns,60);
  app.classList.remove("pgin");void app.offsetWidth;app.classList.add("pgin");
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  document.querySelectorAll(".h3n").forEach(el=>{const n=el.firstChild;if(!n||n.nodeType!==3)return;const txt=n.nodeValue,m=txt.match(/^(\d[\d\s ]*)(?:[,.](\d+))?/);if(!m)return;const dec=m[2]?m[2].length:0,end=parseFloat((m[1].replace(/[\s ]/g,"")+(m[2]?"."+m[2]:""))),t0=performance.now(),D=800;
    const step=now=>{const k=Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3),v=end*(0.9+0.1*e);n.nodeValue=k<1?v.toFixed(dec).replace(".",","):txt;if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)});
}
let __mc=0;new MutationObserver(()=>{if(__mc)return;__mc=1;try{mobileCollapse()}catch(e){}__mc=0}).observe(app,{childList:true});
window.addEventListener("hashchange",route);
route();
})();
