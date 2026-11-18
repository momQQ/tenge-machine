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
const ICO={search:'<circle cx="21" cy="21" r="12"/><path d="M31 31l11 11"/>',heart:'<path d="M24 42S6 31 6 18c0-6 5-10 10-10 4 0 7 2 8 5 1-3 4-5 8-5 5 0 10 4 10 10 0 13-18 24-18 24z"/>',home2:'<rect x="6" y="6" width="15" height="15" rx="3"/><rect x="27" y="6" width="15" height="15" rx="3"/><rect x="6" y="27" width="15" height="15" rx="3"/><rect x="27" y="27" width="15" height="15" rx="3"/>',phone:'<rect x="14" y="4" width="20" height="40" rx="5"/><path d="M21 9h6"/>',car:'<path d="M6 30l4-12h28l4 12v8H6z"/><circle cx="14" cy="34" r="3"/><circle cx="34" cy="34" r="3"/>',home:'<path d="M6 24L24 8l18 16"/><path d="M12 22v18h24V22"/>',gold:'<path d="M8 34l6-12h20l6 12z"/><path d="M16 22l3-8h10l3 8"/>',cash:'<rect x="6" y="12" width="36" height="24" rx="4"/><circle cx="24" cy="24" r="6"/>'};
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
  if(cur==="USD"&&Object.keys(R).length>12){const ks=Object.keys(R).sort().slice(-13);const m=ks.map(k=>[k+"-15",R[k]]);const cut=h.length?h[0][0]:"9";const mm=m.filter(x=>x[0]<cut);return {h:mm.concat(h),note:t("До августа это средние значения за месяц","До августа это средние значения за месяц")}}
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
   '<h2>'+(M?t("Когда цена может вырасти: ","Баға қашан өсуі мүмкін: "):t("Когда курс может вырасти: ","Бағам қашан өсуі мүмкін: "))+t(FXC[cur].n[0],FXC[cur].n[1])+'</h2>'+
   '<div class="fxan">'+
    '<div class="card"><h3>'+t("Что показывают цифры сейчас","Қазір сандар не көрсетеді")+'</h3>'+(st?(innerWidth<=700?'':'<div class="chrt">'+perBar()+fxChart(fxSer(cur).h)+(fxSer(cur).note?'<p class="mut pnote">'+fxSer(cur).note+'</p>':'')+'</div>')+'<div class="fxv '+vt+'"><b>'+(vt==="buy"?t("Для покупки момент удачный","Сатып алуға сәті түсті"):vt==="sell"?t("Для продажи момент удачный","Сатуға сәті түсті"):t("Ждать или нет: без явного перекоса","Күту керек пе: айқын ауытқу жоқ"))+'</b><span>'+verdict+'</span>'+(cur==="USD"&&seasNote?'<span>'+seasNote+'</span>':'')+'</div>':'<p class="mut">'+t("История цен копится с первого сбора, график и вывод появятся через несколько дней."+(cur==="XAG"?" Для серебра это цены ЦентрКредит, официальной цены Нацбанка нет.":""),"Баға тарихы алғашқы жинаудан бастап жиналады, график пен қорытынды бірнеше күннен кейін пайда болады.")+'</p>')+'</div>'+
'<div class="card sea"><h3>'+t("Сезонность: ближайшие 6 месяцев","Маусымдылық: алдағы 6 ай")+'</h3><p class="mut" style="margin:0 0 12px">'+(M?t("Когда спрос на металл обычно выше или ниже. Типичная картина, а не расчет по данным сайта.","Металл сұранысы қашан жоғары немесе төмен. Типтік көрініс, сайт деректері бойынша есеп емес."):t("Как в среднем менялся курс к прошлому месяцу за "+(Object.keys(rates).length)+" мес. наблюдений.","Бақылаудың "+(Object.keys(rates).length)+" айында бағам өткен айға қатысты орта есеппен қалай өзгерді."))+'</p><div class="sx">'+
     next.map(([m,x],i)=>{let up,w,lab,sub;if(M){const lv=FXGM[m][0];up=lv===2;w=15+lv*30;lab=[t("низкий","төмен"),t("средний","орташа"),t("высокий","жоғары")][lv];sub=t("спрос","сұраныс")}else{up=!x||x.v>=0;w=x?Math.max(4,Math.min(48,Math.abs(x.v)/maxA*48)):2;lab=x?f1(x.v):"—";sub=x?(x.v>=0?t("дорожает","қымбаттайды"):t("дешевеет","арзандайды")):""}
      return '<div class="sxr'+(i===0?" now":"")+'"><div class="sxm">'+MN[m-1]+(i===0?'<em>'+t("сейчас","қазір")+'</em>':'')+'</div><div class="sxt"><i class="'+(up?"up":"dn")+'" style="width:'+w+'%"></i></div><div class="sxv '+(up?"up":"dn")+'">'+lab+'<small>'+sub+'</small></div></div>'}).join("")+'</div><p class="mut" style="margin:12px 0 0;font-size:13px">'+t("Красное: обычно дорожает, зеленое: дешевеет. Данных мало, это ориентир, а не правило.","Қызыл: әдетте қымбаттайды, жасыл: арзандайды. Деректер аз, бұл бағдар, ереже емес.")+'</p></div>'+'</div>'+
   '<h3 class="fxh3">'+t("Ближайшие 6 месяцев","Алдағы 6 ай")+'</h3><div class="fxcal">'+next.map(([m,x])=>'<div class="card"><b>'+MN[m-1]+'</b><span class="mut">'+(M?t(FXGM[m][1],FXGM[m][2]):t(FXN[m][0],FXN[m][1]))+'</span>'+(M?'<em class="'+(FXGM[m][0]===2?"up":FXGM[m][0]===0?"dn":"")+'">'+t("спрос ","сұраныс ")+[t("ниже среднего","орташадан төмен"),t("средний","орташа"),t("выше среднего","орташадан жоғары")][FXGM[m][0]]+'</em>':x?'<em class="'+(x.v>=0?"up":"dn")+'">'+t("в прошлые годы ","өткен жылдары ")+f1(x.v)+'</em>':'')+'</div>').join("")+'</div>'+
   '<h3 class="fxh3">'+t(M?"Что влияет на цену":"Что влияет на курс",M?"Бағаға не әсер етеді":"Бағамға не әсер етеді")+'</h3><div class="fxfac">'+(M?FXGF.map(f=>'<div class="card'+(f[0].includes("серебр")&&cur==="XAU"?" dim":"")+'"><div class="fh"><b>'+t(f[0],f[1])+'</b><span class="ar '+f[2]+'">'+(f[2]==="up"?t("цена вверх","баға жоғары"):t("цена вниз","баға төмен"))+'</span></div><p>'+t(f[3],f[4])+'</p></div>'):FXF.map(f=>'<div class="card'+(f[2].includes(cur)?"":" dim")+'"><div class="fh"><b>'+t(f[0],f[1])+'</b><span class="ar '+f[3]+'">'+(f[3]==="up"?t("курс вверх","бағам жоғары"):t("курс вниз","бағам төмен"))+'</span></div><p>'+t(f[4],f[5])+'</p></div>')).join("")+'</div>'+
   finBlock("dep")+'<p class="mut fxdis">'+t("Это ориентир по прошлым данным и типичным причинам, а не обещание и не финансовый совет. Курс может пойти в другую сторону из-за событий, которые заранее не видны.","Бұл өткен деректер мен әдеттегі себептерге негізделген бағдар, уәде де, қаржылық кеңес те емес. Бағам алдын ала көрінбейтін оқиғаларға байланысты басқа бағытқа кетуі мүмкін.")+'</p>'+FOOT();
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
    const SR=fxSer(cur);const hero=st?'<div class="mh"><div class="mh1"><span>'+t("Официальный курс Нацбанка","Ұлттық банк бағамы")+'</span><em class="'+(st.ch>0?"up":"dn")+'">'+(st.ch>0?"▲ ":"▼ ")+f1(st.ch)+' · 30 '+t("дн.","күн")+'</em></div><b class="mh2">'+dc(st.last)+' ₸</b>'+perBar()+bigChart(SR.h.map(x=>x[1]),perLab())+'<div class="mmm"><span>'+t("мин ","мин ")+dc(Math.min(...SR.h.map(x=>x[1])))+'</span><span>'+t("макс ","макс ")+dc(Math.max(...SR.h.map(x=>x[1])))+'</span></div>'+(SR.note?'<p class="pnote">'+SR.note+'</p>':'')+'<p class="mh3 '+vt+'">'+(vt==="buy"?t("Сейчас курс в нижней трети за 3 месяца: хороший момент покупать.","Қазір бағам 3 айдың төменгі үштен біріндe: сатып алуға жақсы сәт."):vt==="sell"?t("Курс в верхней трети за 3 месяца: выгоднее продавать, покупку отложите.","Бағам жоғарғы үштен бірінде: сату тиімді, сатып алуды кейінге қалдырыңыз."):t("Курс в середине диапазона за 3 месяца: явного преимущества нет.","Бағам диапазон ортасында: айқын артықшылық жоқ."))+'</p></div>':'';
    if(pk)pk.outerHTML='<section class="mfx" id="fxp">'+hero+'<div class="mchs">'+chips+'</div><div class="mfxs"><div class="seg big" id="fxm"><button data-m="buy" class="'+(mode==="buy"?"on":"")+'">'+t("Купить","Сатып алу")+'</button><button data-m="sell" class="'+(mode==="sell"?"on":"")+'">'+t("Продать","Сату")+'</button></div></div><div class="seg" id="fxg">'+[["all",t("Все","Барлығы")],["exchanger",t("Обменники","Айырбастау")],["bank",t("Банки","Банктер")]].map(g=>'<button data-g="'+g[0]+'" class="'+(FXGRP===g[0]?"on":"")+'">'+g[1]+'</button>').join("")+'</div><label class="mamt"><span>'+t("Сумма в ","Сома ")+U+'</span><span class="fxaw"><input id="fxa" inputmode="numeric" value="'+amt+'" aria-label="'+t("Сумма в валюте","Валюта сомасы")+'"><i id="fxs">'+(SYM[cur]||cur)+'</i></span></label></section>';
    if(bx)bx.outerHTML='<section class="mlist"><div id="fxcards"></div>'+(ex.length>LIM&&!showAll?'<button type="button" class="fxmore" id="fxmore">'+t("Показать все ("+ex.length+")","Барлығын көрсету ("+ex.length+")")+'</button>':'')+'<p class="mut fxnote">'+t("Источники: ifin.kz, сайт ЦентрКредит. Курсы меняются в течение дня, перед визитом проверьте на сайте. Мы не проводим операции, только сравниваем.","Дереккөздер: ifin.kz, ЦентрКредит сайты. Бағамдар күн ішінде өзгереді, барар алдында сайттан тексеріңіз. Біз операция жасамаймыз, тек салыстырамыз.")+'</p></section>';
  }
  if(MOB){const sec=document.getElementById("fxp"),ml=document.querySelector(".mlist");if(sec&&ml)sec.appendChild(ml)}
  const draw=()=>{if(MOB){document.getElementById("fxcards").innerHTML=mcards();return}document.getElementById("fxb").innerHTML=tbl();document.getElementById("fxth").textContent=mode==="buy"?t("Вы заплатите","Сіз төлейсіз"):t("Вы получите","Сіз аласыз")};
  draw();
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
  el.innerHTML=L.length>1?'<div class="cb2"><div><b>'+t("Сравнить два ЖК?","Екі ТК салыстыру керек пе?")+'</b><span>'+esc(nm(L[0]))+' и '+esc(nm(L[1]))+'</span></div><a href="#/duel/'+L[0]+'/'+L[1]+'">'+t("Сравнить","Салыстыру")+'</a><button type="button" id="cbx" aria-label="'+t("Сбросить","Тазарту")+'">×</button></div>':'<div class="cb2 one"><div><b>'+esc(nm(L[0]))+'</b><span>'+t("Отметьте сердечком еще один ЖК, чтобы сравнить","Салыстыру үшін тағы бір ТК-ны жүрекшемен белгілеңіз")+'</span></div><button type="button" id="cbx" aria-label="'+t("Сбросить","Тазарту")+'">×</button></div>';
  document.getElementById("cbx").onclick=()=>{setLikes([]);document.querySelectorAll(".lk.on").forEach(b=>{b.classList.remove("on");b.setAttribute("aria-pressed","false")});cmpBar()};
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-like]");if(!b)return;e.preventDefault();let L=likes();const id=b.dataset.like;L=L.includes(id)?L.filter(x=>x!==id):L.concat(id).slice(-2);setLikes(L);document.querySelectorAll("[data-like]").forEach(x=>{const on=L.includes(x.dataset.like);x.classList.toggle("on",on);x.setAttribute("aria-pressed",on)});cmpBar()});
document.addEventListener("click",e=>{const g=e.target.closest("[data-goto]");if(!g)return;e.preventDefault();const el=document.getElementById("apt-"+g.dataset.goto);if(!el){APT_DEV="all";APT_DIST="all";APT_CLS="all";APT_ONLY.clear();aptPage();aptHero()}const c=document.getElementById("apt-"+g.dataset.goto);if(!c)return;c.classList.remove("mhide");c.scrollIntoView({behavior:"smooth",block:"center"});c.classList.add("pulse");setTimeout(()=>c.classList.remove("pulse"),1800)});
function aptCard(c){
  const A=APT(),dev=A.developers.find(d=>d.id===c.dev)||{name:c.dev},P=c.m2*APT_AREA,mn=t("мес","ай");
  const kf=(lab,val,sub,off)=>'<div class="kf'+(off?" off":"")+'"><small>'+lab+'</small><b>'+val+'</b><span>'+sub+'</span></div>';
  const mortPay=c.mort?Math.round(aptMonthly(P*(1-c.mort.pct/100),c.mort.rate,c.mort.years)/1000)*1000:0;
  const instPay=c.inst?Math.round(P*(1-c.inst.pct/100)/c.inst.months/1000)*1000:0;
  const keys=kf(t("Ипотека","Ипотека"),c.mort?t("от ","бастап ")+c.mort.pct+'%':t("нет данных","дерек жоқ"),c.mort?c.mort.rate+'% · '+c.mort.years+' '+t("лет","жыл"):t("уточняйте","нақтылаңыз"),!c.mort)+
   kf(t("Рассрочка","Бөліп төлеу"),c.inst?c.inst.pct+'%':t("нет данных","дерек жоқ"),c.inst?c.inst.months+' '+mn:t("уточняйте","нақтылаңыз"),!c.inst)+
   kf(t("Сдача","Тапсыру"),c.status==="done"?t("Сдан","Тапсырылған"):c.delivery[0].split(": ").pop(),c.status==="done"?"":(dpast(c.delivery[0].split(": ").pop())!==c.delivery[0].split(": ").pop()?'<i class="late">'+t("срок прошел","мерзімі өтті")+'</i> ':"")+(c.delivery.length>1?c.delivery.length+" "+t("очереди","кезек"):t("одна очередь","бір кезек")));
  const pay=(c.mort||c.inst)?'<div class="apay">'+(c.mort?'<div><small>'+t("Ипотека, взнос ≈ ","Ипотека, жарна ≈ ")+mln(P*c.mort.pct/100)+'</small><b>≈ '+num(mortPay)+' ₸/'+mn+'</b></div>':'')+(c.inst?'<div><small>'+t("Рассрочка, взнос ≈ ","Бөліп төлеу, жарна ≈ ")+mln(P*c.inst.pct/100)+'</small><b>≈ '+num(instPay)+' ₸/'+mn+'</b></div>':'')+'</div>':'<p class="mut anone">'+t("Условия взноса и рассрочки не указаны, уточняйте у застройщика.","Жарна мен бөліп төлеу шарттары көрсетілмеген, құрылысшыдан нақтылаңыз.")+'</p>';
  const sale=c.units[0]&&c.units[1]?'<div class="abar"><div><i style="width:'+Math.round(c.units[1]/c.units[0]*100)+'%"></i></div><span>'+t("в продаже ","сатылымда ")+c.units[1]+' '+t("из ","/ ")+c.units[0]+'</span></div>':(c.units[0]?'<div class="abar"><span>'+t("Квартир: ","Пәтер: ")+c.units[0]+'</span></div>':'');
  return '<article class="card aptc" id="apt-'+c.id+'"><div class="aimg">'+aptArt(c)+(c.img?'<img class="aphoto" src="'+esc(c.img)+'" alt="'+esc(c.name)+'" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'<span class="adev2 '+c.dev+'">'+esc(dev.name)+'</span><div class="atag"><span class="cl '+c.cls+'">'+t(CLSN[c.cls][0],CLSN[c.cls][1])+'</span><span class="st '+c.status+'">'+(c.status==="done"?t("Сдан","Тапсырылған"):t("Строится","Салынуда"))+'</span></div></div>'+
   '<div class="abody"><div class="aname"><h3>'+esc(c.name)+'</h3><button type="button" class="lk'+(likes().includes(c.id)?" on":"")+'" data-like="'+c.id+'" aria-pressed="'+likes().includes(c.id)+'" aria-label="'+t("Добавить к сравнению","Салыстыруға қосу")+'"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 5 6 5c2 0 3.4 1.1 4.3 2.4h3.4C14.6 6.1 16 5 18 5c3.3 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z"/></svg></button></div><small class="mut">'+esc(c.district)+'</small>'+
   '<div class="ap"><div><small>'+(c.resale?t("от (не от застройщика)","бастап (құрылысшыдан емес)"):t("Цена от","Бағасы бастап"))+'</small><b>'+num(c.m2)+' ₸<i>/м²</i></b></div><div><small>'+APT_AREA+' м² '+t("от","бастап")+'</small><b>≈ '+mln(P)+'</b></div></div>'+
   '<div class="akf">'+keys+'</div>'+pay+
   (c.promos.length?'<div class="ach">'+c.promos.map(p=>'<span class="pr">'+esc(p)+'</span>').join("")+'</div>':'')+
   '<details class="adet"><summary>'+t("Все очереди сдачи","Барлық тапсыру кезеңдері")+'</summary><ul>'+c.delivery.map(d=>'<li>'+esc(dpast(d))+'</li>').join("")+'</ul></details>'+sale+
   '<div class="afoot"><span class="mut">'+esc(c.upd)+'</span><span class="afl"><a class="fxgo" href="https://2gis.kz/almaty/search/'+encodeURIComponent(c.name+" ЖК")+'" target="_blank" rel="noopener noreferrer">'+t("На карте","Картада")+' ↗</a><a class="fxgo pri" href="'+esc(c.url)+'" target="_blank" rel="noopener noreferrer">'+t("Подробнее","Толығырақ")+' ↗</a></span></div>'+
   (c.stale?'<p class="mut astale">'+t("Данные могут быть устаревшими: источник не получает подробности от этого застройщика.","Деректер ескірген болуы мүмкін: дереккөз бұл құрылысшыдан толық мәлімет алмайды.")+'</p>':'')+'</div></article>';
}
const DMAP={alatau:{d:"M20 28q0-8 8-8h169q8 0 8 8v109q0 8-8 8H28q-8 0-8-8z",x:112,y:82},zhetysu:{d:"M215 28q0-8 8-8h134q8 0 8 8v79q0 8-8 8H223q-8 0-8-8z",x:290,y:66},turksib:{d:"M375 28q0-8 8-8h149q8 0 8 8v79q0 8-8 8H383q-8 0-8-8z",x:458,y:66},nauryz:{d:"M20 163q0-8 8-8h79q8 0 8 8v159q0 8-8 8H28q-8 0-8-8z",x:68,y:240},auezov:{d:"M125 163q0-8 8-8h104q8 0 8 8v79q0 8-8 8H133q-8 0-8-8z",x:185,y:205},almaly:{d:"M255 133q0-8 8-8h109q8 0 8 8v74q0 8-8 8H263q-8 0-8-8z",x:318,y:170},medeu:{d:"M390 133q0-8 8-8h134q8 0 8 8v124q0 8-8 8H398q-8 0-8-8z",x:465,y:197},bostandyk:{d:"M125 268q0-8 8-8h122v-33q0-8 8-8h109q8 0 8 8v95q0 8-8 8H133q-8 0-8-8z",x:255,y:285}};
function aptLeaf(){
  const el=document.getElementById("lmap");if(!el||!window.L)return;
  const A=APT(),m=L.map(el,{scrollWheelZoom:false,zoomSnap:.5,tap:false}).setView([43.2220,76.8512],11);
  m.attributionControl.setPrefix(false);
  const cd=L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{subdomains:"abcd",maxZoom:19,detectRetina:true,attribution:"© OpenStreetMap, © CARTO"}).addTo(m);
  let fb=false;cd.on("tileerror",()=>{if(fb)return;fb=true;m.removeLayer(cd);L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(m)});
  const b=[];
  A.complexes.filter(c=>c.ll).forEach(c=>{b.push(c.ll);
    const ic=L.divIcon({className:"lpin d-"+c.dev,html:"<span>"+Math.round(c.m2/1000)+"k</span>",iconSize:[54,28],iconAnchor:[27,14]});
    L.marker(c.ll,{icon:ic}).addTo(m).bindPopup("<b>"+esc(c.name)+"</b><br>"+esc(c.district||"")+(c.lla?"<br><i>"+t("метка примерная, по району","белгі шамамен, аудан бойынша")+"</i>":"")+"<br>"+num(c.m2)+" ₸/м²<br><a href=\"https://2gis.kz/almaty/search/"+encodeURIComponent(c.name+" ЖК")+"\" target=\"_blank\" rel=\"noopener noreferrer\">2ГИС</a>")});
  const fit=()=>{m.invalidateSize();if(b.length>1)m.fitBounds(b,{padding:[30,30]})};
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
  return '<section class="card amapc"><div class="amh"><div><h2 style="margin:0">'+t("Где находятся ЖК","ТК қайда орналасқан")+'</h2><p class="mut" style="margin:4px 0 0;font-size:13.5px">'+t("Положение меток примерное, точное место смотрите в 2ГИС по кнопке \"На карте\". Метка показывает цену за м² (тыс. ₸). Нажмите на район, чтобы оставить только его ЖК.","Белгілердің орны шамамен, нақты орынды \"Картада\" батырмасы арқылы 2ГИС-тен қараңыз. Белгі м² бағасын көрсетеді (мың ₸). Тек сол аудандағы ТК қалдыру үшін ауданды басыңыз.")+'</p></div>'+(APT_DIST!=="all"?'<button type="button" class="ach2 on" data-dist="all">'+t("Показать все районы","Барлық аудандар")+' ×</button>':'')+'</div>'+
   '<div class="amw">'+(window.L?'<div id="lmap" class="lmap"></div>':g)+'<div class="amside"><div class="amleg"><span class="lg bi"></span>BI Group <span class="lg bz"></span>BAZIS-A</div>'+
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
  const MOBA=innerWidth<=700;
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Квартиры","Пәтерлер")]])+
   '<h1>'+t("Квартиры от застройщиков в Алматы","Алматыдағы құрылысшылардан пәтерлер")+'</h1><p class="sub">'+t("Сравниваем жилые комплексы: цена за м², первый взнос, рассрочка, ипотека, акции и сроки сдачи. Данные krisha.kz и kn.kz на ","Тұрғын үй кешендерін салыстырамыз: м² бағасы, алғашқы жарна, бөліп төлеу, ипотека, акциялар және тапсыру мерзімі. krisha.kz және kn.kz деректері: ")+esc(A.updated)+'.</p>'+
   '<div class="hsec"><h2>'+t("Где выгодно сейчас","Қазір қайда тиімді")+'</h2></div>'+aptTop()+aptMap()+
   (MOBA?'<div class="aprm"><label class="fxamt">'+t("Площадь, м²","Ауданы, м²")+' <input id="apa" inputmode="numeric" value="'+APT_AREA+'"></label><label class="fxamt">'+t("Сначала","Алдымен")+' <select id="aps"><option value="m2"'+(APT_SORT==="m2"?" selected":"")+'>'+t("дешевле","арзан")+'</option><option value="down"'+(APT_SORT==="down"?" selected":"")+'>'+t("меньше взнос","жарна аз")+'</option><option value="date"'+(APT_SORT==="date"?" selected":"")+'>'+t("раньше сдача","ертерек тапсыру")+'</option></select></label></div><section class="alist"><div class="afbar" id="aptf"><div class="afc" id="aptd">'+[["all",t("Все","Барлығы")]].concat(A.developers.map(d=>[d.id,d.name])).map(d=>'<button type="button" data-d="'+d[0]+'" class="'+(APT_DEV===d[0]?"on":"")+'">'+esc(d[1])+' <small>'+cnt(d[0])+'</small></button>').join("")+'</div><div class="afc" id="aptc">'+[["all",t("Любой","Кез келген")],["comfort",t("Комфорт","Комфорт")],["business",t("Бизнес","Бизнес")]].map(x=>'<button type="button" data-c="'+x[0]+'" class="cl-'+x[0]+(APT_CLS===x[0]?" on":"")+'">'+x[1]+'</button>').join("")+'<i class="afd"></i>'+chip("inst",t("Рассрочка","Бөліп төлеу"))+chip("mort",t("Ипотека","Ипотека"))+chip("promo",t("Акция","Акция"))+chip("soon",t("Сдан или 2026","Тапсырылған немесе 2026"))+'</div></div>':'<section class="card aptf" id="aptf"><div class="fxq"><span class="ql">'+t("Застройщик","Құрылысшы")+'</span><div class="seg" id="aptd">'+[["all",t("Все","Барлығы")]].concat(A.developers.map(d=>[d.id,d.name])).map(d=>'<button data-d="'+d[0]+'" class="'+(APT_DEV===d[0]?"on":"")+'">'+esc(d[1])+' <small>'+cnt(d[0])+'</small></button>').join("")+'</div></div>'+
   '<div class="aptrow"><label class="fxamt">'+t("Площадь квартиры, м²","Пәтер ауданы, м²")+' <input id="apa" inputmode="numeric" value="'+APT_AREA+'"></label>'+
    '<div class="seg" id="aptc">'+[["all",t("Любой класс","Кез келген сынып")],["comfort",t("Комфорт","Комфорт")],["business",t("Бизнес","Бизнес")]].map(x=>'<button data-c="'+x[0]+'" class="'+(APT_CLS===x[0]?"on":"")+'">'+x[1]+'</button>').join("")+'</div>'+
    '<label class="fxamt">'+t("Сначала","Алдымен")+' <select id="aps"><option value="m2"'+(APT_SORT==="m2"?" selected":"")+'>'+t("дешевле","арзан")+'</option><option value="down"'+(APT_SORT==="down"?" selected":"")+'>'+t("меньше взнос","жарна аз")+'</option><option value="date"'+(APT_SORT==="date"?" selected":"")+'>'+t("раньше сдача","ертерек тапсыру")+'</option></select></label></div>'+
   '<div class="ach">'+chip("inst",t("Есть рассрочка","Бөліп төлеу бар"))+chip("mort",t("Ипотека от 20%","Ипотека 20%-дан"))+chip("promo",t("Есть акция","Акция бар"))+chip("soon",t("Сдан или 2026","Тапсырылған немесе 2026"))+'</div></section>')+
   '<p class="mut" style="margin:6px 2px 10px">'+t("Показано ЖК: ","Көрсетілген ТК: ")+list.length+'. '+t("Сумма по площади это оценка по минимальной цене за м² в ЖК, реальная цена зависит от планировки и этажа.","Аудан бойынша сома ТК-дегі м²-дің ең төмен бағасы бойынша бағалау, нақты баға жоспарлау мен қабатқа байланысты.")+'</p>'+
   '<div class="aptg">'+(list.length?list.map(aptCard).join(""):'<div class="card"><p class="lead" style="margin:0">'+t("Ничего не нашли, снимите часть фильтров.","Ештеңе табылмады, кейбір сүзгілерді алып тастаңыз.")+'</p></div>')+'</div>'+(MOBA?'</section>':'')+
   finBlock("mort")+'<h2>'+t("Условия рассрочки застройщиков","Құрылысшылардың бөліп төлеу шарттары")+'</h2><div class="aptpl">'+A.developers.map(d=>'<div class="card"><h3>'+esc(d.name)+'</h3><p class="mut" style="margin:0 0 8px">'+esc(d.note)+'</p>'+d.plans.map(p=>'<div class="al"><b>'+esc(p[0])+'</b><span>'+esc(p[1])+'</span></div>').join("")+'<p class="mut apromo">'+esc(d.promo)+'</p></div>').join("")+'</div>'+
   finBlock("dep")+'<h2>'+t("Что проверить перед покупкой","Сатып алар алдында не тексеру керек")+'</h2><div class="card"><ul class="achk">'+[t("Цену до акции и итоговую цену за м² после скидки.","Акцияға дейінгі бағаны және жеңілдіктен кейінгі м² бағасын."),t("Действует ли скидка при ипотеке или только при полной оплате.","Жеңілдік ипотекада ма, әлде толық төлемде ғана жұмыс істейді ме."),t("К каким этажам и планировкам привязана скидка.","Жеңілдік қай қабаттар мен жоспарларға байланысты."),t("Есть ли надбавка за рассрочку и какие обязательные доплаты.","Бөліп төлеу үшін үстеме және міндетті қосымша төлемдер бар ма."),t("Срок сдачи очереди и репутацию застройщика, разрешение на строительство.","Кезекті тапсыру мерзімі және құрылысшының беделі, құрылыс рұқсаты.")].map(x=>'<li>'+x+'</li>').join("")+'</ul></div>'+
   '<p class="mut fxdis">'+t("Цены и условия берутся с публичных страниц и могут отличаться от итоговых, уточняйте у застройщика. Это не предложение и не финансовый совет. Платеж по ипотеке и рассрочке приблизительный, без страховок и комиссий.","Бағалар мен шарттар ашық беттерден алынады және соңғысынан өзгеше болуы мүмкін, құрылысшыдан нақтылаңыз. Бұл ұсыныс та, қаржылық кеңес те емес. Ипотека мен бөліп төлеу төлемі шамамен, сақтандыру мен комиссиясыз.")+'</p>'+FOOT();
  const rd=()=>{const y=window.scrollY,sl=[...document.querySelectorAll(".afc")].map(x=>x.scrollLeft);aptPage();aptHero();document.querySelectorAll(".afc").forEach((x,i)=>{x.scrollLeft=sl[i]||0});window.scrollTo(0,y)};
  aptLeaf();finCalc();
  document.querySelectorAll("[data-dist]").forEach(x=>{const go=()=>{const v=x.dataset.dist;APT_DIST=APT_DIST===v&&v!=="all"?"all":v;rd();const l=document.querySelector(".aptg");if(l)l.scrollIntoView({behavior:"smooth",block:"start"})};x.onclick=go;x.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}}});
  document.querySelectorAll("[data-pin]").forEach(x=>{const go=e=>{e.stopPropagation();const c=APT().complexes.find(q=>q.id===x.dataset.pin);APT_DIST=c&&c.dist?c.dist:"all";APT_DEV="all";rd()};x.onclick=go});
  document.getElementById("aptd").onclick=e=>{const b=e.target.closest("[data-d]");if(b){APT_DEV=b.dataset.d;rd()}};
  document.getElementById("aptc").onclick=e=>{const b=e.target.closest("[data-c]");if(b){APT_CLS=b.dataset.c;rd()}};
  document.getElementById("aps").onchange=e=>{APT_SORT=e.target.value;rd()};
  document.getElementById("apa").onchange=e=>{const v=parseInt(String(e.target.value).replace(/\D/g,""),10);APT_AREA=v>=10&&v<=500?v:50;rd()};
  document.querySelectorAll("#aptf [data-o]").forEach(b=>b.onclick=()=>{const k=b.dataset.o;APT_ONLY.has(k)?APT_ONLY.delete(k):APT_ONLY.add(k);rd()});
  onSearch=()=>{};onEnter=()=>{location.hash="#/smartphones"};
}

const CONTACT=()=>'<section class="contact card"><div><b>'+t("Нашли ошибку или хотите добавить ЖК или обменник?","Қате таптыңыз ба немесе ТК не айырбастау пунктін қосқыңыз келе ме?")+'</b><span>'+t("Напишите мне напрямую, отвечу лично.","Маған тікелей жазыңыз, өзім жауап беремін.")+'</span></div><div class="cbtns"><a class="cwa" href="https://wa.me/77776265885?text='+encodeURIComponent(t("Здравствуйте! Пишу с сайта Тиімді сәт.","Сәлеметсіз бе! Тиімді сәт сайтынан жазып тұрмын."))+'" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.1 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1 2.8.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z"/></svg>WhatsApp</a><a class="cig" href="https://instagram.com/mqq.btw" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>@mqq.btw</a></div></section>';
const FOOT=()=>CONTACT()+'<p class="foot">'+t("Данные берутся из публичных источников, это ориентир, а не финансовый совет. Курсы и цены меняются в течение дня.","Деректер ашық дереккөздерден алынады, бұл бағдар, қаржылық кеңес емес. Бағамдар мен бағалар күн ішінде өзгереді.")+(X0.updated?' '+t("Обновлено: ","Жаңартылды: ")+X0.updated+'.':'')+' <a href="#/about">'+t("Как мы считаем","Біз қалай есептейміз")+'</a></p>';

function setToph(){const e=document.getElementById("top");if(e)document.documentElement.style.setProperty("--toph",e.offsetHeight+"px")}
addEventListener("resize",setToph);
function renderTop(){
  document.documentElement.lang=LANG==="kk"?"kk":"ru";
  if(!window.TM_STUB)document.title=t("Тиімді сәт: курс валют и цены на квартиры в Алматы","Тиімді сәт: Алматыдағы валюта бағамы және пәтер бағасы");
  const h=location.hash,on=r=>r.test(h)?"on":"";
  topEl.innerHTML='<div class="topin">'+
  '<a class="logo" href="#/"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 7v9l-6 4" fill="none" stroke="var(--time)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Тиімді сәт</span></a>'+
  '<div class="sbox2"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="q" type="search" autocomplete="off" placeholder="'+t("Поиск","Іздеу")+'" aria-label="'+t("Поиск","Іздеу")+'" value="'+esc(SEARCH_Q)+'"></div>'+
  '<div class="tact"><div class="lang" role="group" aria-label="Язык / Тіл"><button data-l="kk" class="'+(LANG==="kk"?"on":"")+'">ҚАЗ</button><button data-l="ru" class="'+(LANG==="ru"?"on":"")+'">РУС</button></div></div></div>'+
  '<nav class="catnav"><div class="topin"><a class="'+(h===""||h==="#/"||h==="#"?"on":"")+'" href="#/">'+sv("home2")+t("Главная","Басты бет")+'</a><a class="'+on(/^#\/currency/)+'" href="#/currency">'+sv("cash")+t("Валюта","Валюта")+'</a><a class="'+on(/^#\/(apartments|duel)/)+'" href="#/apartments">'+sv("home")+t("Квартиры","Пәтерлер")+'</a><a class="nl" href="#/about">'+t("Как мы считаем","Біз қалай есептейміз")+'</a></div></nav>';
  setToph();requestAnimationFrame(setToph);
  const qi=document.getElementById("q");
  qi.oninput=e=>{SEARCH_Q=e.target.value;gsShow()};qi.onblur=()=>setTimeout(()=>{const b=document.getElementById("gs");if(b)b.remove()},200);
  qi.onkeydown=e=>{if(e.key!=="Enter")return;const L=gsList(SEARCH_Q);if(L.length)location.hash=L[0][2]};
  topEl.querySelectorAll(".lang button").forEach(b=>b.onclick=()=>setLang(b.dataset.l));
}
function bottomBar(){
  const h=location.hash,on=r=>r.test(h)?"on":"";
  let el=document.getElementById("btab");if(!el){el=document.createElement("nav");el.id="btab";el.className="btab";el.setAttribute("aria-label",t("Основное меню","Негізгі мәзір"));document.body.appendChild(el)}
  const it=(href,ic,l,cls)=>'<a class="'+cls+'" href="'+href+'"'+(cls==="on"?' aria-current="page"':'')+'>'+sv(ic)+'<span>'+l+'</span></a>';
  el.innerHTML=it("#/","home2",t("Главная","Басты"),(h===""||h==="#/"||h==="#")?"on":"")+it("#/currency","cash",t("Валюта","Валюта"),on(/^#\/currency/))+it("#/apartments","home",t("Квартиры","Пәтер"),on(/^#\/(apartments|duel)/));
}
function mobileCollapse(){
  if(innerWidth>700)return;
  const mk=(head,body,open)=>{const d=document.createElement("details");d.className="mcol";if(open)d.open=true;const sm=document.createElement("summary");sm.textContent=head.textContent;d.appendChild(sm);head.parentNode.insertBefore(d,head);d.appendChild(body);head.remove()};
  const af=app.querySelector(".aptf");if(af&&!af.closest(".mcol")){const d=document.createElement("details");d.className="mcol";const sm=document.createElement("summary");sm.textContent=LANG==="kk"?"Сүзгілер":"Фильтры";d.appendChild(sm);af.parentNode.insertBefore(d,af);d.appendChild(af)}
  const ag=app.querySelector(".aptg");if(ag&&!ag.dataset.m){ag.dataset.m="1";const cs=[...ag.children];if(cs.length>3){cs.slice(3).forEach(c=>c.classList.add("mhide"));const b=document.createElement("button");b.type="button";b.className="fxmore";b.textContent=(LANG==="kk"?"Барлығын көрсету":"Показать все")+" ("+cs.length+")";b.onclick=()=>{ag.querySelectorAll(".mhide").forEach(c=>c.classList.remove("mhide"));b.remove()};ag.after(b)}}
  app.querySelectorAll("h3.fxh3").forEach(h=>{const b=h.nextElementSibling;if(b)mk(h,b,false)});
  app.querySelectorAll(":scope > h2").forEach(h=>{if(/Ближайшие|Что влияет|Условия рассрочки|Что проверить|Официальные дилеры|Что добавим/i.test(h.textContent)){const b=h.nextElementSibling;if(b&&b.tagName!=="H2")mk(h,b,false)}});
}


function gsList(q){
  q=q.trim().toLowerCase();if(q.length<2)return[];const R=[];
  APT().complexes.filter(c=>(c.name+" "+(c.district||"")).toLowerCase().includes(q)).forEach(c=>R.push([t("ЖК","ТК"),c.name,"#/apartments"]));
  FXK.filter(k=>(FXC[k].n[0]+" "+FXC[k].n[1]+" "+k).toLowerCase().includes(q)).forEach(k=>R.push([t("Валюта","Валюта"),FXC[k].n[LANG==="kk"?1:0],"#/currency/"+k]));
  if(/квар|жк|пәтер|новостр/.test(q))R.push([t("Раздел","Бөлім"),t("Квартиры","Пәтерлер"),"#/apartments"]);
  if(/курс|валю|доллар|usd|еуро|евро|руб|юан|фунт/.test(q))R.push([t("Раздел","Бөлім"),t("Валюта","Валюта"),"#/currency"]);
  return R.slice(0,8);
}
function gsShow(){
  let b=document.getElementById("gs");const L=gsList(SEARCH_Q);
  if(!L.length){if(b)b.remove();return}
  if(!b){b=document.createElement("div");b.id="gs";b.className="gs";document.querySelector(".sbox2").appendChild(b)}
  b.innerHTML=L.map(x=>'<a href="'+x[2]+'"><i>'+esc(x[0])+'</i><b>'+esc(x[1])+'</b></a>').join("");
}

function duelPage(a,b){
  const L=APT().complexes,A=L.find(x=>x.id===a)||L[0],B=L.find(x=>x.id===b)||L[1]||L[0];
  const opt=sel=>L.map(x=>'<option value="'+esc(x.id)+'"'+(x.id===sel?" selected":"")+'>'+esc(x.name)+'</option>').join("");
  const dev=x=>{const d=APT().developers.find(q=>q.id===x.dev);return d?d.name:"—"};
  const cl=x=>({business:t("Бизнес","Бизнес"),comfort:t("Комфорт","Комфорт"),econom:t("Эконом","Эконом"),premium:t("Премиум","Премиум")}[x.cls]||x.cls||"—");
  const R=[
    [t("Застройщик","Құрылысшы"),dev,null],
    [t("Район","Аудан"),x=>x.district||"—",null],
    [t("Цена за м²","м² бағасы"),x=>x.m2?num(x.m2)+" ₸":"—",x=>x.m2,-1],
    [t("Класс","Сынып"),cl,null],
    [t("Ближайшая сдача","Жақын тапсыру"),x=>x.status==="done"?t("Сдан","Тапсырылған"):dpast((x.delivery||["—"])[0].split(": ").pop()),null],
    [t("Рассрочка","Бөліп төлеу"),x=>x.inst?t("взнос ","жарна ")+x.inst.pct+"%, "+x.inst.months+t(" мес."," ай"):"—",x=>x.inst?x.inst.months:0,1],
    [t("Ипотека","Ипотека"),x=>x.mort?t("от ","бастап ")+x.mort.rate+"%, "+t("взнос ","жарна ")+x.mort.pct+"%":"—",x=>x.mort?x.mort.rate:null,-1],
    [t("Акции","Акциялар"),x=>(x.promos&&x.promos.length)?x.promos.join("; "):"—",null]];
  const rows=R.map(r=>{const va=r[2]?r[2](A):null,vb=r[2]?r[2](B):null;let wa="",wb="";if(r[2]&&va!=null&&vb!=null&&va!==vb){const aw=r[3]>0?va>vb:va<vb;wa=aw?" win":"";wb=aw?"":" win"}
    return '<div class="dr"><div class="dl">'+r[0]+'</div><div class="dv'+wa+'">'+esc(r[1](A))+'</div><div class="dv'+wb+'">'+esc(r[1](B))+'</div></div>'}).join("");
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Квартиры","Пәтерлер"),"#/apartments"],[t("Сравнение","Салыстыру")]])+'<div class="duel"><h1>'+t("Сравнить два ЖК","Екі ТК салыстыру")+'</h1><div class="dsel"><select id="da" aria-label="1">'+opt(A.id)+'</select><select id="db" aria-label="2">'+opt(B.id)+'</select></div><div class="dtab">'+rows+'</div><p class="dnote">'+t("Зеленым отмечено то, что выгоднее для покупателя. Данные ориентировочные, уточняйте у застройщика.","Жасылмен сатып алушыға тиімдісі белгіленген. Деректер шамамен, құрылысшыдан нақтылаңыз.")+'</p></div>'+FOOT();
  const go=()=>{location.hash="#/duel/"+document.getElementById("da").value+"/"+document.getElementById("db").value};
  document.getElementById("da").onchange=go;document.getElementById("db").onchange=go;
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
function bigChart(v,lab){
  if(v.length<2)return"";const mn=Math.min(...v),mx=Math.max(...v),W=320,H=120,pd=10;
  const p=v.map((y,i)=>[i*W/(v.length-1),H-pd-(y-mn)/((mx-mn)||1)*(H-2*pd)]);
  let d="M"+p[0][0].toFixed(1)+" "+p[0][1].toFixed(1);
  for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],cx=(a[0]+b[0])/2;d+=" C"+cx.toFixed(1)+" "+a[1].toFixed(1)+" "+cx.toFixed(1)+" "+b[1].toFixed(1)+" "+b[0].toFixed(1)+" "+b[1].toFixed(1)}
  const l=p[p.length-1];
  return '<div class="bc"><svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399" stop-opacity=".35"/><stop offset="1" stop-color="#34d399" stop-opacity="0"/></linearGradient></defs><path d="'+d+' L'+W+' '+H+' L0 '+H+'Z" fill="url(#bcg)"/><path d="'+d+'" fill="none" stroke="#34d399" stroke-width="2.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg><i style="left:'+(l[0]/W*100)+'%;top:'+(l[1]/H*100)+'%"></i><span class="bcl">'+(lab||"")+'</span></div>';
}
function home(){
  const nb=(X0.nbk&&X0.nbk.USD)||[],st=fxStat("USD"),A=APT(),dn=id=>(A.developers.find(d=>d.id===id)||{}).name||id;
  const bestOf=k=>{const L=fxList(k).filter(e=>e.rates&&e.rates[k]);if(!L.length)return null;return {buy:L.slice().sort((a,b)=>a.rates[k][1]-b.rates[k][1])[0],sell:L.slice().sort((a,b)=>b.rates[k][0]-a.rates[k][0])[0]}};
  const bu=bestOf("USD"),ch=st?st.ch:null;
  const vals=nb.slice(-90).map(r=>r[1]);
  const HV=fxSer("USD");const hero=st?'<section class="hero3'+(HOME_OPEN?" open":"")+'"><div class="h3top"><span class="h3l">'+flag("USD",28)+t("Доллар сегодня","Бүгінгі доллар")+'</span>'+(ch!=null?'<span class="h3d '+(ch>0?"up":"dn")+'">'+(ch>0?"▲":"▼")+" "+f1(ch).replace("+","")+' '+t("за 30 дн.","30 күнде")+'</span>':'')+'</div>'+
    '<div class="h3tg" role="button" tabindex="0" aria-expanded="false" aria-label="'+t("Подробнее","Толығырақ")+'"><div class="h3n">'+dc2(st.last)+'<i>₸</i></div><div class="h3s">'+t("Официальный курс Нацбанка РК","ҚР Ұлттық банкінің ресми бағамы")+'</div><span class="h3m">'+t("Подробнее","Толығырақ")+'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span></div><div class="h3x"><div>'+perBar()+bigChart(HV.h.map(x=>x[1]),perLab())+(HV.note?'<p class="pnote">'+HV.note+'</p>':'')+
    (bu?'<div class="h3t"><div><small>'+t("Купить дешевле всего","Ең арзан сатып алу")+'</small><b>'+dc2(bu.buy.rates.USD[1])+' ₸</b><em>'+esc(bu.buy.name)+'</em></div><div><small>'+t("Продать дороже всего","Ең қымбат сату")+'</small><b>'+dc2(bu.sell.rates.USD[0])+' ₸</b><em>'+esc(bu.sell.name)+'</em></div></div>':'')+
    '<a class="h3cta" href="#/currency/USD">'+t("Где выгодно обменять","Қайда тиімді айырбастау")+'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div></div></section>':'';
  const rows=FXK.map(k=>{const b=bestOf(k),s=fxStat(k);if(!b)return"";return '<a class="brow" href="#/currency/'+k+'">'+flag(k,44)+'<div class="bn"><b>'+k+'</b><span>'+t(FXC[k].n[0],FXC[k].n[1]).replace(/Фунт стерлинг[а-я]*/,'Фунт')+(s?' · '+dc2(s.last)+' ₸':'')+'</span></div><div class="bv"><small>'+t("Купить","Сатып алу")+'</small><b>'+dc2(b.buy.rates[k][1])+'</b></div><div class="bv"><small>'+t("Продать","Сату")+'</small><b>'+dc2(b.sell.rates[k][0])+'</b></div></a>'}).join("");
  const board=rows?'<section class="board"><div class="bh"><h2>'+t("Курсы в Алматы","Алматыдағы бағамдар")+'</h2><span>'+t("лучшая цена среди обменников и банков","айырбастау пункттері мен банктер арасындағы үздік баға")+'</span></div>'+rows+'<a class="bmore" href="#/currency">'+t("Все обменники и банки","Барлық айырбастау пункттері мен банктер")+' ›</a></section>':'';
  const rng=st?(()=>{const pos=Math.round(Math.max(0,Math.min(1,st.pos))*100),vt=st.pos<.33?"buy":st.pos>.66?"sell":"mid";
    const txt=vt==="buy"?t("Курс в нижней трети за 3 месяца: для покупки момент хороший.","Бағам 3 айдың төменгі үштен бірінде: сатып алуға сәті жақсы."):vt==="sell"?t("Курс в верхней трети за 3 месяца: выгоднее продавать, покупку лучше отложить.","Бағам жоғарғы үштен бірінде: сату тиімді, сатып алуды кейінге қалдырыңыз."):t("Курс в середине диапазона за 3 месяца: явного преимущества нет.","Бағам диапазон ортасында: айқын артықшылық жоқ.");
    return '<section class="rng '+vt+'"><h2>'+t("Когда брать доллар","Долларды қашан алу керек")+'</h2><div class="rbar"><i style="left:'+pos+'%"></i></div><div class="rlab"><span>'+t("дешево","арзан")+'</span><span>'+t("дорого","қымбат")+'</span></div><p>'+txt+'</p><a href="#/currency/USD">'+t("Сезонность и прогноз","Маусымдылық және болжам")+' ›</a></section>'})():'';
  const L=A.complexes.slice().sort((a,b)=>a.m2-b.m2).slice(0,7);
  const apts=L.length?'<div class="hsec3"><h2>'+t("Квартиры в новостройках","Жаңа құрылыстағы пәтерлер")+'</h2><a href="#/apartments">'+t("Все ЖК","Барлық ТК")+' ›</a></div><div class="hs3">'+L.map(c=>'<a class="ac3" href="#/apartments"><div class="aim">'+aptArt(c)+(c.img?'<img src="'+esc(c.img)+'" alt="'+esc(c.name)+'" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'<span class="adv">'+esc(dn(c.dev))+'</span></div><div class="abd"><b>'+esc(c.name)+'</b><span>'+esc((c.district||"").split(",")[0])+'</span><strong>'+num(c.m2)+' ₸<small>/м²</small></strong><div class="chs">'+(c.inst?'<i>'+t("Рассрочка ","Бөліп төлеу ")+c.inst.months+t(" мес."," ай")+'</i>':'')+(c.mort?'<i>'+t("Ипотека ","Ипотека ")+c.mort.rate+'%</i>':'')+'</div></div></a>').join("")+'<a class="ac3 acmp" href="#/duel"><span>⇄</span><b>'+t("Сравнить два ЖК","Екі ТК салыстыру")+'</b><small>'+t("цена, рассрочка, ипотека, сроки","баға, бөліп төлеу, ипотека, мерзім")+'</small></a></div>':'';
  const how='<section class="how"><h2>'+t("Как это работает","Бұл қалай жұмыс істейді")+'</h2><ol><li><b>'+t("Валюта","Валюта")+'</b><span>'+t("Выберите валюту. Мы покажем, где в Алматы ее купить дешевле или продать дороже.","Валютаны таңдаңыз. Алматыда оны қайда арзан сатып алуға немесе қымбат сатуға болатынын көрсетеміз.")+'</span></li><li><b>'+t("Когда брать","Қашан алу керек")+'</b><span>'+t("Зеленая полоса значит курс низкий, можно покупать. Красная значит дорого, лучше подождать.","Жасыл жолақ бағам төмен екенін білдіреді, сатып алуға болады. Қызыл жолақ қымбат дегенді білдіреді, күткен жөн.")+'</span></li><li><b>'+t("Квартиры","Пәтерлер")+'</b><span>'+t("Выберите застройщика и сравните ЖК. Нажмите сердечко на двух ЖК и сравните их. Ипотеку посчитайте внизу страницы.","Құрылысшыны таңдап, ТК-ларды салыстырыңыз. Екі ТК-да жүрекшені басып, оларды салыстырыңыз. Ипотеканы беттің төменгі жағында есептеңіз.")+'</span></li></ol></section>';
  app.innerHTML='<div class="home3">'+hero+how+board+rng+apts+'</div>'+FOOT();
  const hg=document.querySelector(".h3tg");if(hg){const tg=()=>{const o=document.querySelector(".hero3").classList.toggle("open");HOME_OPEN=o;hg.setAttribute("aria-expanded",o)};hg.onclick=tg;hg.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tg()}}}
}
function about(){
  const ru='<h1>Как мы считаем</h1><p class="sub">Откуда данные и чему можно верить.</p>'+
  '<h2>Курсы валют</h2><p>Официальный курс берем у Национального банка РК. Курсы обменников и банков Алматы собираем с публичных страниц ifin.kz и сайта ЦентрКредит каждое утро. Курс в течение дня меняется, поэтому перед визитом проверьте его на сайте обменника. Мы не проводим операции, только сравниваем.</p>'+
  '<h2>Когда выгодно покупать валюту</h2><p>Смотрим, в какой части диапазона за 3 месяца находится курс, и как менялся курс в тот же месяц в прошлые годы. Это простые правила по прошлым данным, а не прогноз.</p>'+
  '<h2>Квартиры</h2><p>Цены за м², рассрочка, ипотека и сроки сдачи берем с официальных сайтов застройщиков (BI Group, BAZIS-A) и объявлений krisha.kz. Данные обновляются вручную, поэтому могут отставать. Если срок сдачи уже прошел, мы помечаем это. Точные условия уточняйте у застройщика.</p>'+
  '<p class="foot">Сайт ничего не продает и не отвечает за условия обменников и застройщиков. Это не финансовый совет.</p>';
  const kk='<h1>Біз қалай есептейміз</h1><p class="sub">Деректер қайдан алынады және оларға сенуге бола ма.</p>'+
  '<h2>Валюта бағамы</h2><p>Ресми бағамды ҚР Ұлттық банкінен аламыз. Алматыдағы айырбастау пункттері мен банктердің бағамын ifin.kz және ЦентрКредит сайтының ашық беттерінен күн сайын таңертең жинаймыз. Бағам күн ішінде өзгереді, сондықтан баруға дейін сайттан тексеріңіз. Біз операция жасамаймыз, тек салыстырамыз.</p>'+
  '<h2>Валютаны қашан сатып алған тиімді</h2><p>Бағамның 3 айлық диапазондағы орнын және өткен жылдардағы сол айдағы өзгерісті қараймыз. Бұл өткен деректер бойынша қарапайым ережелер, болжам емес.</p>'+
  '<h2>Пәтерлер</h2><p>м² бағасын, бөліп төлеуді, ипотеканы және тапсыру мерзімін құрылысшылардың ресми сайттарынан (BI Group, BAZIS-A) және krisha.kz хабарландыруларынан аламыз. Деректер қолмен жаңартылады, сондықтан кешігуі мүмкін. Мерзімі өтсе, белгілейміз. Нақты шарттарды құрылысшыдан нақтылаңыз.</p>'+
  '<p class="foot">Сайт ештеңе сатпайды және айырбастау пункттері мен құрылысшылардың шарттарына жауап бермейді. Бұл қаржылық кеңес емес.</p>';
  app.innerHTML=crumbs([[HOME(),"#/"],[t("Как мы считаем","Біз қалай есептейміз")]])+'<div class="prose">'+(LANG==="kk"?kk:ru)+'</div>'+FOOT();
}
function notFound(){app.innerHTML=crumbs([[HOME(),"#/"]])+'<h1>'+t("Страница не найдена","Бет табылмады")+'</h1><p class="lead"><a href="#/">'+t("На главную","Басты бетке")+'</a></p>'}
function route(){
  renderTop();bottomBar();
  const p=location.hash.replace(/^#\/?/,"").split("/").filter(Boolean);
  onSearch=null;onEnter=null;window.scrollTo(0,0);setTimeout(cmpBar,0);
  if(!p.length)return home();
  if(p[0]==="about")return about();
  if(p[0]==="duel")return duelPage(p[1],p[2]);
  if(p[0]==="apartments"){aptPage();aptHero();return}
  if(p[0]==="currency"){const k=(p[1]||"USD").toUpperCase();return fxPage(FXK.includes(k)?k:"USD")}
  if(["smartphones","cars","catalog","mine","compare","queries"].includes(p[0])){location.replace("#/");return}
  notFound();
}
let __mc=0;new MutationObserver(()=>{if(__mc)return;__mc=1;try{mobileCollapse()}catch(e){}__mc=0}).observe(app,{childList:true});
window.addEventListener("hashchange",route);
route();
})();
