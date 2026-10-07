const KEY="savenest_items_v1", CATKEY="savenest_categories_v1", SUBKEY="savenest_subcategories_v1";
const defaultCats=["NEBOSH / Study","Education","Motivation","Quotes","Family","Music","Travel","Work","Baby","Watch Later","Other"];
const defaultSubs={
  "NEBOSH / Study":["Fire Safety","Risk Assessment","Workplace Safety","HSE / Safety Management","NEBOSH General","Other"],
  "Education":["Computer Science","Courses","Skills","How To","Other"],
  "Motivation":["Men's Motivation","Men's Health","Discipline","Mindset","Productivity","Life Motivation","Other"],
  "Quotes":["Life Quotes","Success Quotes","Relationship Quotes","Wisdom","Other"],
  "Family":["Baby","Parenting","Family Ideas","Memories","Other"],
  "Music":["Songs","Playlists","Artists","Background Music","Other"],
  "Travel":["Places","Trip Ideas","Tips","Other"],
  "Work":["Career","Business","Ideas","Other"],
  "Baby":["Feeding","Development","Activities","Parenting Tips","Other"],
  "Watch Later":["Important","Interesting","Other"],
  "Other":["General","Other"]
};
let items=readJSON(KEY,[]), cats=readJSON(CATKEY,null)||defaultCats.slice();
let subcats=readJSON(SUBKEY,null)||{};
for(const c of cats) subcats[c]=Array.isArray(subcats[c])&&subcats[c].length?subcats[c]:((defaultSubs[c]||["General","Other"]).slice());
let currentView="all", currentCat="", currentSub="", editing=null;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
function save(){localStorage.setItem(KEY,JSON.stringify(items));localStorage.setItem(CATKEY,JSON.stringify(cats));localStorage.setItem(SUBKEY,JSON.stringify(subcats))}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function platform(url){try{const h=new URL(url).hostname.toLowerCase();if(h.includes("instagram"))return"Instagram";if(h.includes("youtube")||h.includes("youtu.be"))return"YouTube";return"Web"}catch{return"Web"}}
function domain(url){try{return new URL(url).hostname.replace(/^www\./,"")}catch{return url}}
function fmt(t){return new Date(t).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}
function iconForCategory(name){const n=name.toLowerCase();if(n.includes("study")||n.includes("education")||n.includes("nebosh"))return"📚";if(n.includes("motivat"))return"💡";if(n.includes("quote"))return"💬";if(n.includes("family"))return"❤️";if(n.includes("music"))return"🎵";if(n.includes("travel"))return"✈️";if(n.includes("work"))return"💼";if(n.includes("baby"))return"👶";if(n.includes("watch"))return"▶️";return"📁"}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)}
function openModal(id){$(id).classList.remove("hidden")}function closeModals(){$$(".modal").forEach(x=>x.classList.add("hidden"))}
function setNav(active){$$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.view===active))}

function smartCategory(title="", text=""){const s=(title+" "+text).toLowerCase();
  if(/nebosh|hse|health and safety|risk assessment|fire safety|workplace safety|safety officer/.test(s))return"NEBOSH / Study";
  if(/baby|newborn|infant|parenting|feeding|breastfeed/.test(s))return s.includes("family")?"Family":"Baby";
  if(/music|song|lyrics|playlist|remix|cover/.test(s))return"Music";
  if(/quote|quotes|saying|wisdom/.test(s))return"Quotes";
  if(/motivat|discipline|mindset|success|confidence|self respect|self-care|men's health|men health|testosterone|fitness|gym|energy|strength/.test(s))return"Motivation";
  if(/course|tutorial|learn|education|coding|programming|study|lesson/.test(s))return"Education";
  if(/family|wife|husband|parent|mother|father|son|daughter/.test(s))return"Family";
  return"Other";
}
function smartSubcategory(category,title="",text=""){const s=(title+" "+text).toLowerCase();const arr=subcats[category]||["General","Other"];
  const rules={
    "NEBOSH / Study":[[/fire|extinguisher|fire triangle/,"Fire Safety"],[/risk assessment|hazard/,"Risk Assessment"],[/workplace|occupational|ppe/,"Workplace Safety"],[/hse|safety management/,"HSE / Safety Management"]],
    "Motivation":[[/men's|men |male|masculine/,"Men's Motivation"],[/testosterone|men's health|men health|erection|libido|fitness|gym|strength|energy/,"Men's Health"],[/discipline|consistency|habit/,"Discipline"],[/mindset|confidence|self-belief|self respect/,"Mindset"],[/focus|productivity|time management/,"Productivity"],[/life|keep going|purpose|journey/,"Life Motivation"]],
    "Education":[[/computer|coding|programming|software/,"Computer Science"],[/course|class|lesson|learn/,"Courses"],[/skill|career/,"Skills"],[/how to|tutorial|guide/,"How To"]],
    "Family":[[/baby|newborn|infant/,"Baby"],[/parent|parenting/,"Parenting"],[/family|wife|husband|mother|father|son|daughter/,"Family Ideas"]],
    "Baby":[[/feed|food|milk|solid/,"Feeding"],[/development|milestone|crawl|walk|sleep/,"Development"],[/activity|play|toy/,"Activities"],[/parent/,"Parenting Tips"]],
    "Quotes":[[/life/,"Life Quotes"],[/success|goal|work/,"Success Quotes"],[/relationship|love|friend/,"Relationship Quotes"],[/wisdom/,"Wisdom"]],
    "Music":[[/playlist|mix/,"Playlists"],[/artist|singer/,"Artists"],[/background|lofi|instrumental/,"Background Music"]]
  };
  for(const [re,sub] of (rules[category]||[]))if(re.test(s)&&arr.includes(sub))return sub;
  return arr[0]||"Other";
}
function cleanTitle(raw,category,sub=""){let s=String(raw||"").replace(/https?:\/\/\S+/g,"").replace(/\s+/g," ").trim();
  if(!s||/^instagram$|^youtube$|^reel$|^shorts?$/i.test(s))s="";
  s=s.replace(/^[|•\-–—:]+|[|•\-–—:]+$/g,"").trim();
  const low=s.toLowerCase();
  if(category==="Motivation"){
    if(/first priority|yourself/.test(low))return"Make Yourself a Priority — Self-Respect & Growth";
    if(/keep going|never give up|don't give up/.test(low))return"Keep Going — Progress Over Perfection";
    if(/discipline/.test(low))return"Discipline — Build the Habits That Change Your Life";
    if(/confidence|self-belief/.test(low))return"Confidence — Believe in the Person You Are Becoming";
    if(/men's health|men health|testosterone|strength|fitness|gym|energy/.test(low))return"Men's Health — Strength, Energy & Better Habits";
    if(/success|goal/.test(low))return"Success Mindset — Small Actions, Big Results";
    if(/mindset/.test(low))return"Mindset — Train Your Thinking, Change Your Direction";
    if(s)return `${s.replace(/[.!?]+$/g,"")} — A Reminder to Keep Growing`;
    return sub&&sub!=="Other"?`${sub} — Build Yourself Every Day`:"Motivation — Keep Moving Forward";
  }
  if(category==="Quotes")return s?`${s.replace(/[.!?]+$/g,"")} — Life Reminder`:`A Quote Worth Remembering`;
  if(category==="NEBOSH / Study")return s?`${s.replace(/[.!?]+$/g,"")} — NEBOSH Study Note`:`${sub||"NEBOSH"} — Key Learning Point`;
  if(category==="Education")return s?`${s.replace(/[.!?]+$/g,"")} — Learning Note`:`${sub||"Education"} — Key Learning Point`;
  if(category==="Baby")return s?`${s.replace(/[.!?]+$/g,"")} — Baby Care Note`:`${sub||"Baby"} — Helpful Parenting Note`;
  if(category==="Family")return s?`${s.replace(/[.!?]+$/g,"")} — Family Reminder`:`Family — A Moment Worth Remembering`;
  if(category==="Music")return s?`${s.replace(/[.!?]+$/g,"")} — Saved Music`:`${sub||"Music"} — Saved Track`;
  return s||`${category||"Saved Content"} — Saved for Later`;
}
function smartReminder(title,category,sub="",raw=""){const s=(title+" "+raw).toLowerCase();
  if(category==="Motivation"){
    if(/priority|yourself|self-respect/.test(s))return"Make yourself a priority without becoming selfish. Protect your health, peace, goals and growth, and give yourself the same care you give to others.";
    if(/keep going|progress|never give up/.test(s))return"You do not need to be perfect to move forward. Keep taking small steps; consistency matters more than a single bad day.";
    if(/discipline|habit|consistency/.test(s))return"Motivation changes from day to day, but disciplined action keeps you moving. Build small habits you can repeat even when you do not feel motivated.";
    if(/men's health|men health|testosterone|strength|fitness|gym|energy/.test(s))return"Build men's health through the basics: regular movement, strength training, nutritious food, enough sleep and consistent recovery. Avoid quick-fix promises.";
    if(/confidence|self-belief|mindset/.test(s))return"Confidence grows when you keep promises to yourself. Focus on steady action, learn from setbacks and become a little stronger each day.";
    return"Save this as a reminder to keep improving. Focus on what you can control today, take one useful step and let consistency create the result.";
  }
  if(category==="NEBOSH / Study")return`Study reminder: ${sub&&sub!=="Other"?sub+" requires understanding the principle, not just memorising an answer." : "Understand the concept, connect it to a real workplace situation and revise it regularly."}`;
  if(category==="Education")return"Learning reminder: understand the idea, practise it and connect it to a real example. A small amount of active learning is better than simply watching and forgetting.";
  if(category==="Quotes")return"Keep this quote as a reminder. Pause, think about how it applies to your life, and turn the message into one practical action.";
  if(category==="Family"||category==="Baby")return"Keep this for later. The useful ideas are worth revisiting when you need a practical reminder for family or parenting.";
  if(category==="Music")return"Saved because it is worth coming back to. Add it to your personal collection and enjoy it whenever you need the right mood.";
  return"Saved for later. When you revisit this, focus on the one idea that is most useful to you and turn it into a practical action.";
}
async function fetchYouTubeTitle(url){try{const u=encodeURIComponent(url);const r=await fetch(`https://www.youtube.com/oembed?url=${u}&format=json`,{headers:{Accept:"application/json"}});if(!r.ok)return"";const d=await r.json();return d.title||""}catch{return""}}
async function autoFillSmart({force=false}={}){
  const url=$("#url").value.trim();if(!url)return;
  let sourceTitle=$("#sharedTitle").value.trim();
  if(platform(url)==="YouTube"&&!sourceTitle)sourceTitle=await fetchYouTubeTitle(url);
  const cat=smartCategory(sourceTitle,$("#sourceText").value);
  const sub=smartSubcategory(cat,sourceTitle,$("#sourceText").value);
  if(force||!$("#category").value)$("#category").value=cat;
  fillSubcats($("#category").value,sub);
  const finalCat=$("#category").value, finalSub=$("#subcategory").value;
  const title=cleanTitle(sourceTitle,finalCat,finalSub);
  const note=smartReminder(title,finalCat,finalSub,$("#sourceText").value);
  if(force||!$("#title").value)$("#title").value=title;
  if(force||!$("#notes").value)$("#notes").value=note;
  $("#smartStatus").textContent="✨ Smart title & reminder prepared";
}
function renderStats(){$("#statTotal").textContent=items.length;$("#statCats").textContent=cats.length;$("#statFavs").textContent=items.filter(i=>i.favorite).length}
function renderCategories(){const counts={};items.forEach(i=>counts[i.category]=(counts[i.category]||0)+1);const visible=cats.slice(0,6);$("#categoryGrid").innerHTML=visible.map(c=>{const n=counts[c]||0;return `<button class="category-card" data-category="${esc(c)}"><span class="category-icon">${iconForCategory(c)}</span><span class="category-name">${esc(c)}</span><span class="category-count">${n} saved</span><span class="category-arrow">→</span></button>`}).join("");if(cats.length>6)$("#categoryGrid").insertAdjacentHTML("beforeend",`<button class="category-card more-card" id="moreCategories"><span class="category-icon">＋</span><span class="category-name">View all</span><span class="category-count">${cats.length} categories</span><span class="category-arrow">→</span></button>`);$$("[data-category]").forEach(b=>b.onclick=()=>openCategory(b.dataset.category));$("#moreCategories")?.addEventListener("click",()=>{currentView="categories";currentCat="";currentSub="";setNav("categories");renderAll()});$("#categorySubtitle").textContent=currentCat?`Showing ${currentCat}${currentSub?" / "+currentSub:""}`:"Tap a category to browse"}
function openCategory(c){currentCat=c;currentSub="";currentView="subcategories";setNav("categories");renderAll()}
function filtered(){let q=$("#search").value.trim().toLowerCase();let a=items.filter(i=>currentView==="favorites"?i.favorite:true).filter(i=>!currentCat||i.category===currentCat).filter(i=>!currentSub||i.subcategory===currentSub);if(q)a=a.filter(i=>[i.title,i.url,i.notes,i.category,i.subcategory,i.platform].join(" ").toLowerCase().includes(q));const sort=$("#sortSelect").value;if(sort==="newest")a.sort((x,y)=>y.created-x.created);if(sort==="oldest")a.sort((x,y)=>x.created-y.created);if(sort==="az")a.sort((x,y)=>(x.title||"").localeCompare(y.title||""));if(sort==="favorite")a.sort((x,y)=>Number(y.favorite)-Number(x.favorite)||y.created-x.created);return a}
function card(i){return `<article class="card"><div class="card-top"><span class="platform ${i.platform.toLowerCase()}">${i.platform==="Instagram"?"◎":i.platform==="YouTube"?"▶":"↗"} ${i.platform}</span><button class="fav ${i.favorite?"is-fav":""}" title="Favorite" data-fav="${i.id}">${i.favorite?"♥":"♡"}</button></div><h3>${esc(i.title||"Saved link")}</h3><div class="url">${esc(domain(i.url))} · ${fmt(i.created)}</div>${i.notes?`<div class="note">${esc(i.notes)}</div>`:""}<div class="meta"><span class="category-pill">${iconForCategory(i.category)} ${esc(i.category)}${i.subcategory?` · ${esc(i.subcategory)}`:""}</span><div class="actions"><button class="small-btn" data-open="${i.id}">Open</button><button class="small-btn" data-edit="${i.id}">Edit</button><button class="small-btn delete-btn" data-delete="${i.id}">Delete</button></div></div></article>`}
function render(){renderStats();renderCategories();if(currentView==="categories"||currentView==="subcategories"){categoriesView();return}const a=filtered();$("#libraryCount").textContent=`${a.length} saved ${a.length===1?"item":"items"}${currentCat?` in ${currentCat}${currentSub?` / ${currentSub}`:""}`:""}`;$("#items").innerHTML=a.slice(0,currentView==="all"&&!currentCat&&!$("#search").value?6:a.length).map(card).join("");$("#empty").classList.toggle("hidden",a.length!==0);if(!a.length){$("#emptyTitle").textContent=items.length?"Nothing found here":"Your SaveNest is waiting";$("#emptyText").textContent=items.length?"Try another category, subcategory or search word.":"Save your first Instagram or YouTube video and organize it into a category."}$$("#items [data-fav]").forEach(b=>b.onclick=()=>{const i=items.find(x=>x.id===b.dataset.fav);if(!i)return;i.favorite=!i.favorite;save();render()});$$("#items [data-open]").forEach(b=>b.onclick=()=>{const i=items.find(x=>x.id===b.dataset.open);if(i)window.open(i.url,"_blank","noopener,noreferrer")});$$("#items [data-edit]").forEach(b=>b.onclick=()=>editItem(b.dataset.edit));$$("#items [data-delete]").forEach(b=>b.onclick=()=>deleteItem(b.dataset.delete));$("#clearSearch").classList.toggle("hidden",!$("#search").value)}
function categoriesView(){const counts={};items.forEach(i=>counts[i.category]=(counts[i.category]||0)+1);if(currentView==="subcategories"){const subs=subcats[currentCat]||["Other"];const subCounts={};items.filter(i=>i.category===currentCat).forEach(i=>subCounts[i.subcategory||"Other"]=(subCounts[i.subcategory||"Other"]||0)+1);$("#categoryGrid").innerHTML=`<button class="category-back" id="backCats">← All Categories</button>`+subs.map(s=>`<button class="category-card large" data-subcategory="${esc(s)}"><span class="category-icon">${iconForCategory(currentCat)}</span><span class="category-name">${esc(s)}</span><span class="category-count">${subCounts[s]||0} saved</span><span class="category-arrow">→</span></button>`).join("");$$("#categoryGrid [data-subcategory]").forEach(b=>b.onclick=()=>{currentView="all";currentSub=b.dataset.subcategory;setNav("categories");render()});$("#backCats").onclick=()=>{currentView="categories";currentCat="";currentSub="";renderAll()};$("#categorySubtitle").textContent=`${currentCat} · choose a subcategory`;$("#items").innerHTML="";$("#empty").classList.add("hidden");$("#libraryCount").textContent=`${subs.length} subcategories`;return}
  $("#categoryGrid").innerHTML=cats.map(c=>`<button class="category-card large" data-category="${esc(c)}"><span class="category-icon">${iconForCategory(c)}</span><span class="category-name">${esc(c)}</span><span class="category-count">${counts[c]||0} saved · ${(subcats[c]||[]).length} subcategories</span><span class="category-arrow">→</span></button>`).join("");$$("#categoryGrid [data-category]").forEach(b=>b.onclick=()=>openCategory(b.dataset.category));$("#categorySubtitle").textContent="Choose a category to browse your library";$("#items").innerHTML="";$("#empty").classList.add("hidden");$("#libraryCount").textContent=`${cats.length} categories`}
function renderAll(){render()}
function fillCats(selected=""){const smart=smartCategory($("#sharedTitle")?.value||"",$("#sourceText")?.value||"");$("#category").innerHTML=cats.map(c=>`<option value="${esc(c)}" ${c===selected?"selected":""}>${iconForCategory(c)} ${esc(c)}</option>`).join("");if(!selected&&cats.includes(smart))$("#category").value=smart;fillSubcats($("#category").value)}
function fillSubcats(category,selected=""){const arr=subcats[category]||["Other"];$("#subcategory").innerHTML=arr.map(s=>`<option value="${esc(s)}" ${s===selected?"selected":""}>${esc(s)}</option>`).join("")}
function addItem(){editing=null;$("#modalTitle").textContent="Save a link";$("#itemForm").reset();$("#editId").value="";$("#sharedTitle").value="";$("#sourceText").value="";fillCats();$("#smartStatus").textContent="Paste a link — SaveNest will prepare a smart title and reminder.";openModal("#itemModal");setTimeout(()=>$("#url").focus(),100)}
function editItem(id){const i=items.find(x=>x.id===id);if(!i)return;editing=id;$("#modalTitle").textContent="Edit saved link";$("#editId").value=id;$("#url").value=i.url;$("#title").value=i.title;$("#notes").value=i.notes;$("#sharedTitle").value=i.sourceTitle||"";$("#sourceText").value=i.sourceText||"";fillCats(i.category);fillSubcats(i.category,i.subcategory||"");$("#platformHint").textContent=`Detected platform: ${i.platform}`;$("#smartStatus").textContent="You can edit anything before saving.";openModal("#itemModal")}
function deleteItem(id){const i=items.find(x=>x.id===id);if(!i)return;if(!confirm(`Delete “${i.title||"this saved link"}”?`))return;items=items.filter(x=>x.id!==id);save();renderAll();toast("Saved item deleted")}
async function submitItem(e){e.preventDefault();const url=$("#url").value.trim(),p=platform(url);await autoFillSmart({force:!$("#title").value.trim()||!$("#notes").value.trim()});const category=$("#category").value,subcategory=$("#subcategory").value;let title=$("#title").value.trim()||cleanTitle($("#sharedTitle").value,category,subcategory);let notes=$("#notes").value.trim()||smartReminder(title,category,subcategory,$("#sourceText").value);if(editing){const i=items.find(x=>x.id===editing);if(i)Object.assign(i,{url,title,category,subcategory,notes,platform:p,sourceTitle:$("#sharedTitle").value.trim(),sourceText:$("#sourceText").value.trim()})}else items.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),url,title,category,subcategory,notes,platform:p,favorite:false,created:Date.now(),sourceTitle:$("#sharedTitle").value.trim(),sourceText:$("#sourceText").value.trim()});save();closeModals();renderAll();toast(editing?"Saved changes":"Smart-saved to your library");editing=null}
function renderCats(){$("#catList").innerHTML=cats.map(c=>`<div class="cat-item"><span>${iconForCategory(c)} ${esc(c)}</span><button data-delcat="${esc(c)}">×</button></div>`).join("");$$("#catList [data-delcat]").forEach(b=>b.onclick=()=>{const c=b.dataset.delcat;if(cats.length<=1)return toast("Keep at least one category");const used=items.some(i=>i.category===c);if(used&&!confirm(`“${c}” is used by saved items. Move those items to the first category and delete it?`))return;cats=cats.filter(x=>x!==c);delete subcats[c];items.forEach(i=>{if(i.category===c){i.category=cats[0];i.subcategory=(subcats[cats[0]]||["Other"])[0]}});save();renderCats();renderAll();toast("Category removed")})}
function exportData(){const blob=new Blob([JSON.stringify({app:"SaveNest",version:3,categories:cats,subcategories:subcats,items},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="savenest-backup-v3.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Backup exported")}
function importData(file){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.items)||!Array.isArray(d.categories))throw Error();items=d.items;cats=d.categories;subcats=d.subcategories||{};for(const c of cats)subcats[c]=subcats[c]||defaultSubs[c]||["General","Other"];save();renderAll();toast("Backup restored")}catch{toast("That backup file is not valid SaveNest data")}};r.readAsText(file)}
function ensureLegacyItems(){items=items.map(i=>{const category=i.category||smartCategory(i.title||"",i.notes||"");const subcategory=i.subcategory||smartSubcategory(category,i.title||"",i.notes||"");return {...i,category,subcategory,title:i.title||cleanTitle(i.title,category,subcategory),notes:i.notes||smartReminder(i.title||"",category,subcategory,i.notes||"")}})}

$("#addBtn").onclick=addItem;$("#navAdd").onclick=addItem;$("#emptyAdd").onclick=addItem;$("#itemForm").onsubmit=submitItem;
$("#viewCategories").onclick=()=>{currentView="categories";currentCat="";currentSub="";setNav("categories");renderAll()};
$("#url").oninput=async()=>{const p=platform($("#url").value);$("#platformHint").textContent=$("#url").value?`Detected platform: ${p}`:"Paste a link to detect the platform.";if($("#url").value){if(p==="YouTube"){const t=await fetchYouTubeTitle($("#url").value);if(t&&!$("#sharedTitle").value)$("#sharedTitle").value=t}await autoFillSmart({force:true})}};
$("#category").onchange=()=>{fillSubcats($("#category").value);if($("#url").value)autoFillSmart({force:true})};
$("#sharedTitle").oninput=()=>{if($("#url").value)autoFillSmart({force:true})};$("#sourceText").oninput=()=>{if($("#url").value)autoFillSmart({force:true})};
$("#regenerateSmart").onclick=()=>autoFillSmart({force:true});
$("#search").oninput=render;$("#clearSearch").onclick=()=>{$("#search").value="";render()};$("#sortSelect").onchange=render;
$$("[data-close]").forEach(b=>b.onclick=closeModals);$$('.modal').forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModals()}));
$("#settingsBtn").onclick=()=>openModal("#settingsModal");$("#manageCats").onclick=()=>{closeModals();renderCats();openModal("#catModal")};
$("#catForm").onsubmit=e=>{e.preventDefault();const n=$("#newCat").value.trim();if(!n)return;if(cats.some(c=>c.toLowerCase()===n.toLowerCase()))return toast("Category already exists");cats.push(n);subcats[n]=["General","Other"];$("#newCat").value="";save();renderCats();renderAll();toast("Category added")};
$("#exportBtn").onclick=exportData;$("#importBtn").onclick=()=>$("#importFile").click();$("#importFile").onchange=e=>e.target.files[0]&&importData(e.target.files[0]);
$("#clearAll").onclick=()=>{if(confirm("Delete ALL saved links? This cannot be undone.")){items=[];save();renderAll();closeModals();toast("Library cleared")}};
$$('.nav[data-view]').forEach(b=>b.onclick=()=>{const v=b.dataset.view;if(v==="settings"){openModal("#settingsModal");return}currentView=v;currentCat="";currentSub="";setNav(v);renderAll()});
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeModals()});
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
ensureLegacyItems();save();renderAll();
function handleSharedLink(){const p=new URLSearchParams(location.search),sharedUrl=p.get("url")||p.get("text"),sharedTitle=p.get("title");if(sharedUrl){const clean=(sharedUrl.match(/https?:\/\/[^\s]+/)||[sharedUrl])[0];setTimeout(async()=>{addItem();$("#url").value=clean;$("#sharedTitle").value=sharedTitle||"";$("#platformHint").textContent=`Detected platform: ${platform(clean)}`;await autoFillSmart({force:true})},180);history.replaceState({},document.title,location.pathname)}}
handleSharedLink();
