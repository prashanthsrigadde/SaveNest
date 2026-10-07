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
let currentView="all", currentCat="", currentSub="", editing=null, categoryManuallySet=false, subcategoryManuallySet=false;

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

function textFromUrl(url=""){
  try{
    const u=new URL(url);
    const parts=(u.pathname||"").split(/[\\/_-]+/).filter(Boolean).map(x=>decodeURIComponent(x).replace(/\.[a-z0-9]{1,5}$/i,""));
    return parts.join(" ").replace(/\b(reel|reels|shorts?|watch|video|videos|p)\b/gi," ").replace(/\s+/g," ").trim();
  }catch{return ""}
}
function cleanSourceText(raw=""){
  let s=String(raw||"");
  s=s.replace(/https?:\/\/\S+/gi," ");
  // Remove common social-media engagement/UI text. These are not content.
  s=s.replace(/\b[\d,.]+\s*(?:k|m|b)?\s*(?:likes?|liked)\b/gi," ");
  s=s.replace(/\b[\d,.]+\s*(?:k|m|b)?\s*(?:comments?|replies)\b/gi," ");
  s=s.replace(/\b[\d,.]+\s*(?:k|m|b)?\s*(?:shares?|sends?|saves?|views?)\b/gi," ");
  s=s.replace(/\b(?:like|liked|comment|comments|share|shares|send|save|saves|follow|following|subscribe|subscribed)\b\s*(?:now|this|below)?/gi," ");
  s=s.replace(/\b(?:original audio|use audio|use template|see translation|translate|more|view all|reply)\b/gi," ");
  s=s.replace(/^[\s|•·–—:,-]+|[\s|•·–—:,-]+$/g,"");
  return s.replace(/[ \t]+/g," ").replace(/\n{2,}/g,"\n").trim();
}
function classifyText(title="",text="",url=""){
  return (title+" "+cleanSourceText(text)+" "+textFromUrl(url)).replace(/[_#]+/g," ").toLowerCase();
}
function smartCategory(title="", text="", url=""){
  const s=classifyText(title,text,url);
  if(/travel|travelling|trip|vacation|holiday|tourism|tourist|destination|itinerary|places to visit|places to travel|road trip|flight|hotel|resort|beach|mountain|trek|hiking|wanderlust|visa/.test(s))return"Travel";
  if(/nebosh|hse|health and safety|risk assessment|fire safety|workplace safety|safety officer|occupational safety|ppe|hazard control/.test(s))return"NEBOSH / Study";
  if(/newborn|infant|baby|babies|parenting|breastfeed|breastfeeding|feeding baby|baby food|baby sleep/.test(s))return s.includes("family")?"Family":"Baby";
  if(/music|song|lyrics|playlist|remix|cover song|singer|artist|lofi|instrumental|album/.test(s))return"Music";
  if(/quote|quotes|saying|wisdom|one liner|life quote/.test(s))return"Quotes";
  if(/men's health|men health|male health|testosterone|erection|libido|fitness|gym|workout|strength|energy|muscle|fat loss|weight loss/.test(s))return"Motivation";
  if(/motivat|discipline|mindset|success|confidence|self respect|self-care|self care|keep going|never give up|personal growth|productivity|focus|habits|habit/.test(s))return"Motivation";
  if(/course|tutorial|learn|education|coding|programming|study|lesson|exam|certification|how to|guide|tips|skill/.test(s))return"Education";
  if(/family|wife|husband|mother|father|son|daughter|parents|relationship/.test(s))return"Family";
  if(/career|job|business|freelance|office|resume|interview|workplace/.test(s))return"Work";
  return"Other";
}
function smartSubcategory(category,title="",text="",url=""){
  const s=classifyText(title,text,url);const arr=subcats[category]||["General","Other"];
  const rules={
    "NEBOSH / Study":[[/fire|extinguisher|fire triangle/,'Fire Safety'],[/risk assessment|hazard/,'Risk Assessment'],[/workplace|occupational|ppe/,'Workplace Safety'],[/hse|safety management/,'HSE / Safety Management']],
    "Motivation":[[/men's|men |male|masculine/,'Men\'s Motivation'],[/testosterone|men's health|men health|male health|erection|libido|fitness|gym|strength|energy|muscle/,'Men\'s Health'],[/discipline|consistency|habit/,'Discipline'],[/mindset|confidence|self-belief|self respect/,'Mindset'],[/focus|productivity|time management/,'Productivity'],[/life|keep going|purpose|journey|growth/,'Life Motivation']],
    "Education":[[/computer|coding|programming|software/,'Computer Science'],[/course|class|lesson|learn|exam|certification/,'Courses'],[/skill|career/,'Skills'],[/how to|tutorial|guide|tips/,'How To']],
    "Family":[[/baby|newborn|infant/,'Baby'],[/parent|parenting/,'Parenting'],[/family|wife|husband|mother|father|son|daughter/,'Family Ideas']],
    "Baby":[[/feed|food|milk|solid/,'Feeding'],[/development|milestone|crawl|walk|sleep/,'Development'],[/activity|play|toy/,'Activities'],[/parent/,'Parenting Tips']],
    "Quotes":[[/life/,'Life Quotes'],[/success|goal|work/,'Success Quotes'],[/relationship|love|friend/,'Relationship Quotes'],[/wisdom/,'Wisdom']],
    "Music":[[/playlist|mix/,'Playlists'],[/artist|singer/,'Artists'],[/background|lofi|instrumental/,'Background Music']],
    "Travel":[[/place|destination|visit|city|country|tourist/,'Places'],[/trip|vacation|holiday|itinerary|road trip/,'Trip Ideas'],[/tip|travel hack|packing|visa|flight|hotel/,'Tips']],
    "Work":[[/career|job|resume|interview/,'Career'],[/business|startup|freelance/,'Business'],[/idea|project/,'Ideas']]
  };
  for(const [re,sub] of (rules[category]||[]))if(re.test(s)&&arr.includes(sub))return sub;
  return arr[0]||"Other";
}
function cleanTitle(raw,category,sub="",fallbackText="",url=""){
  let s=String(raw||fallbackText||textFromUrl(url)||"").replace(/https?:\/\/\S+/g,"").replace(/\s+/g," ").trim();
  if(!s||/^instagram$|^youtube$|^reel$|^shorts?$|^video$|^shared link$/i.test(s))s="";
  s=s.replace(/^[|•\-–—:]+|[|•\-–—:]+$/g,"").trim();
  const low=s.toLowerCase();
  if(category==="Travel"){
    if(/packing|travel hack|tip|visa|flight|hotel/.test(low))return s?`${s.replace(/[.!?]+$/g,"")} — Travel Tips & Ideas`:`Travel Tips — Plan Smarter, Travel Better`;
    if(s)return `${s.replace(/[.!?]+$/g,"")} — Travel Inspiration`;
    return sub&&sub!=="Other"?`${sub} — Travel Inspiration`:"Travel Inspiration — Places Worth Exploring";
  }
  if(category==="Motivation"){
    if(/first priority|yourself|self-respect|self respect/.test(low))return"Make Yourself a Priority — Self-Respect & Growth";
    if(/keep going|never give up|don't give up|progress/.test(low))return"Keep Going — Progress Over Perfection";
    if(/discipline/.test(low))return"Discipline — Build the Habits That Change Your Life";
    if(/confidence|self-belief/.test(low))return"Confidence — Believe in the Person You Are Becoming";
    if(/men's health|men health|male health|testosterone|strength|fitness|gym|energy|muscle/.test(low))return"Men's Health — Strength, Energy & Better Habits";
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
  if(category==="Work")return s?`${s.replace(/[.!?]+$/g,"")} — Work & Career Note`:`${sub||"Work"} — Useful Career Note`;
  return s||`${category||"Saved Content"} — Saved for Later`;
}
function smartReminder(title,category,sub="",raw=""){
  const s=(title+" "+raw).toLowerCase();
  if(category==="Travel"){
    if(/packing|travel tip|visa|flight|hotel|itinerary/.test(s))return"Travel reminder: save the useful details now so planning your next trip is easier. Recheck dates, costs, documents and local conditions before you travel.";
    return"Travel inspiration: keep this place or idea in mind for a future trip. When planning, compare the season, budget, route and what you actually want to experience.";
  }
  if(category==="Motivation"){
    if(/priority|yourself|self-respect/.test(s))return"Make yourself a priority without becoming selfish. Protect your health, peace, goals and growth, and give yourself the same care you give to others.";
    if(/keep going|progress|never give up/.test(s))return"You do not need to be perfect to move forward. Keep taking small steps; consistency matters more than a single bad day.";
    if(/discipline|habit|consistency/.test(s))return"Motivation changes from day to day, but disciplined action keeps you moving. Build small habits you can repeat even when you do not feel motivated.";
    if(/men's health|men health|testosterone|strength|fitness|gym|energy/.test(s))return"Build men's health through the basics: regular movement, strength training, nutritious food, enough sleep and consistent recovery. Avoid quick-fix promises.";
    if(/confidence|self-belief|mindset/.test(s))return"Confidence grows when you keep promises to yourself. Focus on steady action, learn from setbacks and become a little stronger each day.";
    return"Save this as a reminder to keep improving. Focus on what you can control today, take one useful step and let consistency create the result.";
  }
  if(category==="NEBOSH / Study")return`Study reminder: ${sub&&sub!=="Other"?sub+" requires understanding the principle, not just memorising an answer.":"Understand the concept, connect it to a real workplace situation and revise it regularly."}`;
  if(category==="Education")return"Learning reminder: understand the idea, practise it and connect it to a real example. A small amount of active learning is better than simply watching and forgetting.";
  if(category==="Quotes")return"Keep this quote as a reminder. Pause, think about how it applies to your life, and turn the message into one practical action.";
  if(category==="Family"||category==="Baby")return"Keep this for later. The useful ideas are worth revisiting when you need a practical reminder for family or parenting.";
  if(category==="Music")return"Saved because it is worth coming back to. Add it to your personal collection and enjoy it whenever you need the right mood.";
  if(category==="Work")return"Career reminder: keep the useful idea, then turn it into one practical action that can improve your skills, work or next opportunity.";
  return"Saved for later. When you revisit this, focus on the one idea that is most useful to you and turn it into a practical action.";
}
async function fetchYouTubeTitle(url){try{const u=encodeURIComponent(url);const r=await fetch(`https://www.youtube.com/oembed?url=${u}&format=json`,{headers:{Accept:"application/json"}});if(!r.ok)return"";const d=await r.json();return d.title||""}catch{return""}}
async function fetchExternalMetadata(url){
  const endpoints=[
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
    `https://api.microlink.io/?url=${encodeURIComponent(url)}&data.title.selector=title&data.description.selector=meta[name="description"]`
  ];
  for(const ep of endpoints){
    try{
      const r=await fetch(ep,{headers:{Accept:"application/json"}}); if(!r.ok)continue;
      const d=await r.json();
      const title=d.title||d.data?.title||"";
      const description=d.description||d.data?.description||"";
      if(title||description)return {title,description};
    }catch{}
  }
  return {title:"",description:""};
}
function candidateSourceTitle(sourceTitle,sourceText,category,url){
  const cleaned=cleanSourceText(sourceText);
  // Prefer the actual message/caption because SaveNest should create a useful title
  // from what the video is about, rather than blindly copying a platform title.
  if(cleaned){
    const first=cleaned.split(/[\n.!?]+/).map(x=>x.trim()).find(x=>x.length>=4&&x.length<=140);
    if(first)return first;
  }
  let s=String(sourceTitle||"").replace(/https?:\/\S+/g,"").replace(/\s+/g," ").trim();
  if(!s||/^instagram$|^youtube$|^reel$|^shorts?$|^video$|^shared link$/i.test(s))s="";
  if(s)return s;
  const fallbacks={
    "Travel":"Travel Inspiration — Places Worth Exploring",
    "Motivation":"Motivation — Keep Moving Forward",
    "NEBOSH / Study":"NEBOSH — Key Learning Point",
    "Education":"Education — Key Learning Point",
    "Quotes":"A Quote Worth Remembering",
    "Family":"Family — A Moment Worth Remembering",
    "Baby":"Baby — Helpful Parenting Note",
    "Music":"Saved Music — Track to Revisit",
    "Work":"Work & Career — Useful Idea",
    "Other":"Saved Content — Worth Revisiting"
  };
  return fallbacks[category]||"Saved Content — Worth Revisiting";
}
async function autoFillSmart({force=false}={}){
  const url=$("#url").value.trim();if(!url)return;
  let sourceTitle=$("#sharedTitle").value.trim();
  let sourceText=cleanSourceText($("#sourceText").value.trim());
  if(platform(url)==="YouTube"&&!sourceTitle)sourceTitle=await fetchYouTubeTitle(url);
  if(!sourceTitle){const meta=await fetchExternalMetadata(url);if(meta.title)sourceTitle=meta.title;if(meta.description&&!sourceText)sourceText=meta.description;}
  $("#sharedTitle").value=sourceTitle;
  $("#sourceText").value=sourceText;
  const inferredCat=smartCategory(sourceTitle,sourceText,url);
  const inferredSub=smartSubcategory(inferredCat,sourceTitle,sourceText,url);
  // Auto-classify only until the user deliberately chooses a category.
  if(!categoryManuallySet){
    $("#category").value=inferredCat;
    fillSubcats(inferredCat,inferredSub);
  } else {
    fillSubcats($("#category").value,subcategoryManuallySet?$("#subcategory").value:inferredSub);
  }
  const finalCat=$("#category").value||inferredCat;
  const finalSub=$("#subcategory").value||inferredSub;
  const baseTitle=candidateSourceTitle(sourceTitle,sourceText,finalCat,url);
  const title=cleanTitle(baseTitle,finalCat,finalSub,sourceText,url);
  const note=smartReminder(title,finalCat,finalSub,sourceText);
  // Smart details are always regenerated from the link/content on a fresh save.
  if(force||!$("#title").value)$("#title").value=title;
  if(force||!$("#notes").value)$("#notes").value=note;
  $("#smartStatus").textContent=`✨ Auto-organized: ${finalCat} → ${finalSub}`;
}
function renderStats(){$("#statTotal").textContent=items.length;$("#statCats").textContent=cats.length;$("#statFavs").textContent=items.filter(i=>i.favorite).length}
function renderCategories(){
  const counts={};items.forEach(i=>counts[i.category]=(counts[i.category]||0)+1);
  const section=document.querySelector('.category-section');
  if(currentCat || currentView==="categories" || currentView==="subcategories") section?.classList.remove('hidden');
  if(currentCat){
    // Context pages are rendered by categoriesView or the item view; don't show the home category grid.
    if(currentView!=="categories" && currentView!=="subcategories") { section?.classList.add('hidden'); return; }
  }
  const visible=cats.slice(0,6);
  $("#categoryGrid").innerHTML=visible.map(c=>{
    const n=counts[c]||0;
    return `<button class="category-card" data-category="${esc(c)}"><span class="category-icon">${iconForCategory(c)}</span><span class="category-name">${esc(c)}</span><span class="category-count">${n} saved · ${(subcats[c]||[]).length} topics</span><span class="category-arrow">→</span></button>`
  }).join("");
  if(cats.length>6)$("#categoryGrid").insertAdjacentHTML("beforeend",`<button class="category-card more-card" id="moreCategories"><span class="category-icon">＋</span><span class="category-name">View all</span><span class="category-count">${cats.length} categories</span><span class="category-arrow">→</span></button>`);
  $$('[data-category]').forEach(b=>b.onclick=()=>openCategory(b.dataset.category));
  $("#moreCategories")?.addEventListener("click",()=>{currentView="categories";currentCat="";currentSub="";setNav("categories");renderAll()});
  $("#categorySubtitle").textContent=currentCat?`Browsing ${currentCat}${currentSub?" · "+currentSub:""}`:"Choose a category to explore your saved content";
}
function openCategory(c){currentCat=c;currentSub="";currentView="subcategories";setNav("categories");renderAll()}
function filtered(){let q=$("#search").value.trim().toLowerCase();let a=items.filter(i=>currentView==="favorites"?i.favorite:true).filter(i=>!currentCat||i.category===currentCat).filter(i=>!currentSub||i.subcategory===currentSub);if(q)a=a.filter(i=>[i.title,i.url,i.notes,i.category,i.subcategory,i.platform].join(" ").toLowerCase().includes(q));const sort=$("#sortSelect").value;if(sort==="newest")a.sort((x,y)=>y.created-x.created);if(sort==="oldest")a.sort((x,y)=>x.created-y.created);if(sort==="az")a.sort((x,y)=>(x.title||"").localeCompare(y.title||""));if(sort==="favorite")a.sort((x,y)=>Number(y.favorite)-Number(x.favorite)||y.created-x.created);return a}
function card(i){return `<article class="card"><div class="card-top"><span class="platform ${i.platform.toLowerCase()}">${i.platform==="Instagram"?"◎":i.platform==="YouTube"?"▶":"↗"} ${i.platform}</span><button class="fav ${i.favorite?"is-fav":""}" title="Favorite" data-fav="${i.id}">${i.favorite?"♥":"♡"}</button></div><h3>${esc(i.title||"Saved link")}</h3><div class="url">${esc(domain(i.url))} · ${fmt(i.created)}</div>${i.notes?`<div class="note">${esc(i.notes)}</div>`:""}<div class="meta"><span class="category-pill">${iconForCategory(i.category)} ${esc(i.category)}${i.subcategory?` · ${esc(i.subcategory)}`:""}</span><div class="actions"><button class="small-btn" data-open="${i.id}">Open</button><button class="small-btn" data-edit="${i.id}">Edit</button><button class="small-btn delete-btn" data-delete="${i.id}">Delete</button></div></div></article>`}
function render(){
  renderStats();
  const section=document.querySelector('.category-section');
  if(currentView==="categories"||currentView==="subcategories"){
    section?.classList.remove('hidden');
    categoriesView();
    return;
  }
  if(currentCat){section?.classList.add('hidden');}
  else section?.classList.remove('hidden');
  renderCategories();
  const a=filtered();
  const inContext=Boolean(currentCat||currentSub);
  $("#libraryCount").textContent=`${a.length} saved ${a.length===1?"item":"items"}`;
  $("#recentKicker").textContent=inContext?"SAVED CONTENT":"LATEST";
  $("#recentTitle").textContent=currentSub||currentCat||"Recently Saved";
  $("#recentSubtitle").textContent=inContext?`${currentCat}${currentSub?` · ${currentSub}`:""} · every saved video in this topic`:`${a.length} saved items`;
  $("#viewCategories").textContent=inContext?"‹ Back to topics":"View all →";
  $("#items").innerHTML=a.slice(0,currentView==="all"&&!currentCat&&!$("#search").value?6:a.length).map(card).join("");$("#empty").classList.toggle("hidden",a.length!==0);if(!a.length){$("#emptyTitle").textContent=items.length?"Nothing found here":"Your SaveNest is waiting";$("#emptyText").textContent=items.length?"Try another category, subcategory or search word.":"Save your first Instagram or YouTube video and organize it into a category."}$$("#items [data-fav]").forEach(b=>b.onclick=()=>{const i=items.find(x=>x.id===b.dataset.fav);if(!i)return;i.favorite=!i.favorite;save();render()});$$("#items [data-open]").forEach(b=>b.onclick=()=>{
    const i=items.find(x=>x.id===b.dataset.open);
    if(!i||!i.url)return;
    const w=window.open(i.url,"_blank","noopener,noreferrer");
    if(!w)window.location.href=i.url;
  });$$("#items [data-edit]").forEach(b=>b.onclick=()=>editItem(b.dataset.edit));$$("#items [data-delete]").forEach(b=>b.onclick=()=>deleteItem(b.dataset.delete));$("#clearSearch").classList.toggle("hidden",!$("#search").value)}
function categoriesView(){
  const counts={};items.forEach(i=>counts[i.category]=(counts[i.category]||0)+1);
  if(currentView==="subcategories"){
    const subs=subcats[currentCat]||["Other"];
    const subCounts={};items.filter(i=>i.category===currentCat).forEach(i=>subCounts[i.subcategory||"Other"]=(subCounts[i.subcategory||"Other"]||0)+1);
    $("#categoryGrid").innerHTML=`<button class="category-back" id="backCats">‹ All Categories</button>`+
      subs.map(s=>`<button class="category-card large" data-subcategory="${esc(s)}"><span class="category-icon">${iconForCategory(currentCat)}</span><span class="category-name">${esc(s)}</span><span class="category-count">${subCounts[s]||0} saved</span><span class="category-arrow">→</span></button>`).join("");
    $$("#categoryGrid [data-subcategory]").forEach(b=>b.onclick=()=>{
      currentView="all";
      currentSub=(b.dataset.subcategory||"").trim();
      setNav("categories");
      renderAll();
    });
    $("#backCats").onclick=()=>{currentView="categories";currentCat="";currentSub="";renderAll()};
    $("#categorySubtitle").textContent=`${currentCat} · choose a topic`;
    $("#libraryCount").textContent=`${subs.length} topics · ${items.filter(i=>i.category===currentCat).length} saved`;
    $("#items").innerHTML="";$("#empty").classList.add("hidden");
    $("#recentTitle").textContent=currentCat;
    $("#recentKicker").textContent="TOPICS";
    $("#recentSubtitle").textContent="Open a topic to view every saved video inside it";
    $("#viewCategories").textContent="All categories →";
    return;
  }
  $("#categoryGrid").innerHTML=cats.map(c=>`<button class="category-card large" data-category="${esc(c)}"><span class="category-icon">${iconForCategory(c)}</span><span class="category-name">${esc(c)}</span><span class="category-count">${counts[c]||0} saved · ${(subcats[c]||[]).length} topics</span><span class="category-arrow">→</span></button>`).join("");
  $$("#categoryGrid [data-category]").forEach(b=>b.onclick=()=>openCategory(b.dataset.category));
  $("#categorySubtitle").textContent="Choose a category to browse by topic";
  $("#items").innerHTML="";$("#empty").classList.add("hidden");$("#libraryCount").textContent=`${cats.length} categories`;
  $("#recentTitle").textContent="Your categories";
  $("#recentKicker").textContent="ORGANIZE";
  $("#recentSubtitle").textContent="Each category opens into its own topics";
  $("#viewCategories").textContent="Home →";
}
function renderAll(){render()}
function fillCats(selected=""){const smart=smartCategory($("#sharedTitle")?.value||"",$("#sourceText")?.value||"");$("#category").innerHTML=cats.map(c=>`<option value="${esc(c)}" ${c===selected?"selected":""}>${iconForCategory(c)} ${esc(c)}</option>`).join("");if(!selected&&cats.includes(smart))$("#category").value=smart;fillSubcats($("#category").value)}
function fillSubcats(category,selected=""){const arr=subcats[category]||["Other"];$("#subcategory").innerHTML=arr.map(s=>`<option value="${esc(s)}" ${s===selected?"selected":""}>${esc(s)}</option>`).join("")}
function addItem(){editing=null;categoryManuallySet=false;subcategoryManuallySet=false;$("#modalTitle").textContent="Save a link";$("#itemForm").reset();$("#editId").value="";$("#sharedTitle").value="";$("#sourceText").value="";fillCats();$("#category").value="";$("#subcategory").innerHTML='<option value="">Auto-selected</option>';$("#smartStatus").textContent="Paste a link — SaveNest will identify the topic, create the title, reminder and category automatically.";openModal("#itemModal");setTimeout(()=>$("#url").focus(),100)}
function editItem(id){const i=items.find(x=>x.id===id);if(!i)return;editing=id;categoryManuallySet=true;subcategoryManuallySet=true;$("#modalTitle").textContent="Edit saved link";$("#editId").value=id;$("#url").value=i.url;$("#title").value=i.title;$("#notes").value=i.notes;$("#sharedTitle").value=i.sourceTitle||"";$("#sourceText").value=cleanSourceText(i.sourceText||"");fillCats(i.category);fillSubcats(i.category,i.subcategory||"");$("#platformHint").textContent=`Detected platform: ${i.platform}`;$("#smartStatus").textContent="You can edit anything before saving.";openModal("#itemModal")}
function deleteItem(id){const i=items.find(x=>x.id===id);if(!i)return;if(!confirm(`Delete “${i.title||"this saved link"}”?`))return;items=items.filter(x=>x.id!==id);save();renderAll();toast("Saved item deleted")}
async function submitItem(e){
  e.preventDefault();
  const url=$("#url").value.trim(),p=platform(url);
  if(!url)return;
  // Always perform one final automatic pass for a new shared link, but never overwrite a category the user explicitly chose.
  await autoFillSmart({force:true});
  const category=$("#category").value||smartCategory($("#sharedTitle").value,$("#sourceText").value,url);
  const subcategory=$("#subcategory").value||smartSubcategory(category,$("#sharedTitle").value,$("#sourceText").value,url);
  const cleanText=cleanSourceText($("#sourceText").value);
  $("#sourceText").value=cleanText;
  const title=$("#title").value.trim()||cleanTitle(candidateSourceTitle($("#sharedTitle").value,cleanText,category,url),category,subcategory,cleanText,url);
  const notes=$("#notes").value.trim()||smartReminder(title,category,subcategory,cleanText);
  if(editing){
    const i=items.find(x=>x.id===editing);
    if(i)Object.assign(i,{url,title,category,subcategory,notes,platform:p,sourceTitle:$("#sharedTitle").value.trim(),sourceText:$("#sourceText").value.trim()});
  }else{
    items.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),url,title,category,subcategory,notes,platform:p,favorite:false,created:Date.now(),sourceTitle:$("#sharedTitle").value.trim(),sourceText:$("#sourceText").value.trim()});
  }
  save();closeModals();renderAll();toast(editing?"Saved changes":"Automatically organized and saved");editing=null;categoryManuallySet=false;subcategoryManuallySet=false;
}
function renderCats(){
  $("#catList").innerHTML=cats.map(c=>`<div class="cat-item"><span class="cat-label">${iconForCategory(c)} ${esc(c)}</span><div class="cat-actions"><button data-editcat="${esc(c)}" title="Edit category">✎</button><button data-delcat="${esc(c)}" title="Delete category">×</button></div></div>`).join("");
  $$("#catList [data-editcat]").forEach(b=>b.onclick=()=>{
    const old=b.dataset.editcat;const next=prompt("Rename category",old)?.trim();
    if(!next||next===old)return;
    if(cats.some(c=>c.toLowerCase()===next.toLowerCase()))return toast("Category already exists");
    const idx=cats.indexOf(old);cats[idx]=next;subcats[next]=subcats[old]||["General","Other"];delete subcats[old];
    items.forEach(i=>{if(i.category===old)i.category=next});
    if(currentCat===old)currentCat=next;save();renderCats();renderAll();toast("Category updated");
  });
  $$("#catList [data-delcat]").forEach(b=>b.onclick=()=>{
    const c=b.dataset.delcat;if(cats.length<=1)return toast("Keep at least one category");
    const used=items.some(i=>i.category===c);
    if(used&&!confirm(`“${c}” contains saved items. Move them to another category before deleting?`))return;
    const target=cats.find(x=>x!==c);
    if(used){items.forEach(i=>{if(i.category===c){i.category=target;i.subcategory=(subcats[target]||["Other"])[0]}})}
    cats=cats.filter(x=>x!==c);delete subcats[c];
    if(currentCat===c){currentCat="";currentSub="";currentView="categories"}
    save();renderCats();renderAll();toast("Category deleted");
  });
}
function exportData(){const blob=new Blob([JSON.stringify({app:"SaveNest",version:3,categories:cats,subcategories:subcats,items},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="savenest-backup-v3.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Backup exported")}
function importData(file){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.items)||!Array.isArray(d.categories))throw Error();items=d.items;cats=d.categories;subcats=d.subcategories||{};for(const c of cats)subcats[c]=subcats[c]||defaultSubs[c]||["General","Other"];save();renderAll();toast("Backup restored")}catch{toast("That backup file is not valid SaveNest data")}};r.readAsText(file)}
function normalizeLibrary(){
  const validCats=new Set(cats);
  items=items.map(i=>{
    let category=validCats.has(i.category)?i.category:smartCategory(i.sourceTitle||i.title||"",cleanSourceText(i.sourceText||i.notes||""),i.url||"");
    if(!validCats.has(category))category=cats[0]||"Other";
    const arr=subcats[category]||["General","Other"];
    let sub=(i.subcategory&&arr.includes(i.subcategory))?i.subcategory:smartSubcategory(category,i.sourceTitle||i.title||"",cleanSourceText(i.sourceText||i.notes||""),i.url||"");
    if(!arr.includes(sub))sub=arr[0]||"Other";
    return {...i,category,subcategory:sub,sourceText:cleanSourceText(i.sourceText||"")};
  });
}
function ensureLegacyItems(){items=items.map(i=>{let category=i.category||smartCategory(i.sourceTitle||i.title||"",i.sourceText||i.notes||"",i.url||"");const combined=(i.sourceTitle||" ")+" "+(i.sourceText||" ")+" "+(i.title||"")+" "+(i.notes||"");if(category==="Other"&&combined.trim())category=smartCategory(i.sourceTitle||i.title||"",i.sourceText||i.notes||"",i.url||"");const subcategory=i.subcategory&&((subcats[category]||[]).includes(i.subcategory))?i.subcategory:smartSubcategory(category,i.sourceTitle||i.title||"",i.sourceText||i.notes||"",i.url||"");const title=i.title||cleanTitle(i.sourceTitle||"",category,subcategory,i.sourceText||i.notes||"",i.url||"");const notes=i.notes||smartReminder(title,category,subcategory,i.sourceText||"");return {...i,category,subcategory,title,notes}})}

$("#addBtn").onclick=addItem;$("#navAdd").onclick=addItem;$("#emptyAdd").onclick=addItem;$("#itemForm").onsubmit=submitItem;
$("#viewCategories").onclick=()=>{if(currentCat&&currentSub){currentView="subcategories";currentSub="";setNav("categories");renderAll();return}if(currentCat){currentView="subcategories";currentSub="";setNav("categories");renderAll();return}currentView="categories";currentCat="";currentSub="";setNav("categories");renderAll()};
$("#url").oninput=async()=>{categoryManuallySet=false;subcategoryManuallySet=false;const p=platform($("#url").value);$("#platformHint").textContent=$("#url").value?`Detected platform: ${p}`:"Paste a link to detect the platform.";if($("#url").value){if(p==="YouTube"){const t=await fetchYouTubeTitle($("#url").value);if(t&&!$("#sharedTitle").value)$("#sharedTitle").value=t}await autoFillSmart({force:true})}};
$("#category").onchange=()=>{categoryManuallySet=true;subcategoryManuallySet=false;fillSubcats($("#category").value);$("#smartStatus").textContent=`✏️ Category selected: ${$("#category").value}. SaveNest will keep it.`};
$("#sharedTitle").oninput=()=>{if($("#url").value){categoryManuallySet=false;autoFillSmart({force:true})}};$("#sourceText").oninput=()=>{if($("#url").value){categoryManuallySet=false;autoFillSmart({force:true})}};$("#subcategory").onchange=()=>{subcategoryManuallySet=true};
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
ensureLegacyItems();normalizeLibrary();save();save();renderAll();
function handleSharedLink(){const p=new URLSearchParams(location.search),sharedUrl=p.get("url")||p.get("text"),sharedTitle=p.get("title");if(sharedUrl){const clean=(sharedUrl.match(/https?:\/\/[^\s]+/)||[sharedUrl])[0];setTimeout(async()=>{addItem();categoryManuallySet=false;subcategoryManuallySet=false;$("#url").value=clean;$("#sharedTitle").value=sharedTitle||"";$("#sourceText").value=(p.get("text")||"").replace(clean,"").trim();$("#platformHint").textContent=`Detected platform: ${platform(clean)}`;await autoFillSmart({force:true})},180);history.replaceState({},document.title,location.pathname)}}
handleSharedLink();
