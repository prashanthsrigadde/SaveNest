const KEY="savenest_items_v1", CATKEY="savenest_categories_v1";
const defaultCats=["NEBOSH / Study","Education","Motivation","Quotes","Family","Music","Travel","Work","Baby","Watch Later","Other"];
let items=readJSON(KEY,[]), cats=readJSON(CATKEY,null)||defaultCats.slice();
let currentView="all", currentCat="", editing=null;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
function save(){localStorage.setItem(KEY,JSON.stringify(items));localStorage.setItem(CATKEY,JSON.stringify(cats))}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function platform(url){try{const h=new URL(url).hostname.toLowerCase();if(h.includes("instagram"))return"Instagram";if(h.includes("youtube")||h.includes("youtu.be"))return"YouTube";return"Web"}catch{return"Web"}}
function domain(url){try{return new URL(url).hostname.replace(/^www\./,"")}catch{return url}}
function detectTitle(url){try{const u=new URL(url),path=u.pathname.split("/").filter(Boolean).slice(0,2).join(" / ");return `${platform(url)}${path?" • "+path:""}`}catch{return""}}
function fmt(t){return new Date(t).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}
function iconForCategory(name){const n=name.toLowerCase();if(n.includes("study")||n.includes("education")||n.includes("nebosh"))return"📚";if(n.includes("motivat"))return"💡";if(n.includes("quote"))return"💬";if(n.includes("family"))return"❤️";if(n.includes("music"))return"🎵";if(n.includes("travel"))return"✈️";if(n.includes("work"))return"💼";if(n.includes("baby"))return"👶";if(n.includes("watch"))return"▶️";return"📁"}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)}
function openModal(id){$(id).classList.remove("hidden")}function closeModals(){$$(".modal").forEach(x=>x.classList.add("hidden"))}
function setNav(active){$$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.view===active))}

function renderStats(){
  $("#statTotal").textContent=items.length;
  $("#statCats").textContent=cats.length;
  $("#statFavs").textContent=items.filter(i=>i.favorite).length;
}
function renderCategories(){
  const counts={};items.forEach(i=>counts[i.category]=(counts[i.category]||0)+1);
  const visible=cats.slice(0,6);
  $("#categoryGrid").innerHTML=visible.map(c=>{
    const n=counts[c]||0;
    const active=currentCat===c;
    return `<button class="category-card ${active?"active":""}" data-category="${esc(c)}">
      <span class="category-icon">${iconForCategory(c)}</span><span class="category-name">${esc(c)}</span><span class="category-count">${n} ${n===1?"saved":"saved"}</span><span class="category-arrow">→</span>
    </button>`
  }).join("");
  if(cats.length>6)$("#categoryGrid").insertAdjacentHTML("beforeend",`<button class="category-card more-card" id="moreCategories"><span class="category-icon">＋</span><span class="category-name">View all</span><span class="category-count">${cats.length} categories</span><span class="category-arrow">→</span></button>`);
  $$("[data-category]").forEach(b=>b.onclick=()=>{currentView="all";currentCat=b.dataset.category;setNav("all");render()});
  $("#moreCategories")?.addEventListener("click",()=>{currentView="categories";currentCat="";setNav("categories");renderAll()});
  $("#categorySubtitle").textContent=currentCat?`Showing ${currentCat}`:"Tap a category to browse";
}
function filtered(){
  let q=$("#search").value.trim().toLowerCase();
  let a=items.filter(i=>currentView==="favorites"?i.favorite:true).filter(i=>!currentCat||i.category===currentCat);
  if(q)a=a.filter(i=>[i.title,i.url,i.notes,i.category,i.platform].join(" ").toLowerCase().includes(q));
  const sort=$("#sortSelect").value;
  if(sort==="newest")a.sort((x,y)=>y.created-x.created);if(sort==="oldest")a.sort((x,y)=>x.created-y.created);if(sort==="az")a.sort((x,y)=>(x.title||"").localeCompare(y.title||""));if(sort==="favorite")a.sort((x,y)=>Number(y.favorite)-Number(x.favorite)||y.created-x.created);
  return a;
}
function card(i){
  const pClass=i.platform.toLowerCase();
  return `<article class="card">
    <div class="card-top"><span class="platform ${pClass}">${i.platform==="Instagram"?"◎":i.platform==="YouTube"?"▶":"↗"} ${i.platform}</span><button class="fav ${i.favorite?"is-fav":""}" title="Favorite" data-fav="${i.id}">${i.favorite?"♥":"♡"}</button></div>
    <h3>${esc(i.title||"Saved link")}</h3>
    <div class="url">${esc(domain(i.url))} · ${fmt(i.created)}</div>
    ${i.notes?`<div class="note">${esc(i.notes)}</div>`:""}
    <div class="meta"><span class="category-pill">${iconForCategory(i.category)} ${esc(i.category)}</span><div class="actions"><button class="small-btn" data-open="${i.id}">Open</button><button class="small-btn" data-edit="${i.id}">Edit</button><button class="small-btn delete-btn" data-delete="${i.id}" aria-label="Delete">Delete</button></div></div>
  </article>`
}
function render(){
  renderStats();renderCategories();
  const a=filtered();
  $("#libraryCount").textContent=`${a.length} saved ${a.length===1?"item":"items"}${currentCat?` in ${currentCat}`:""}`;
  $("#items").innerHTML=a.slice(0,currentView==="all"&&!currentCat&&!$("#search").value?6:a.length).map(card).join("");
  const isEmpty=a.length===0;
  $("#empty").classList.toggle("hidden",!isEmpty);
  if(isEmpty){
    $("#emptyTitle").textContent=items.length?"Nothing found here":"Your SaveNest is waiting";
    $("#emptyText").textContent=items.length?"Try another category or search word.":"Save your first Instagram or YouTube video and organize it into a category.";
  }
  $$("#items [data-fav]").forEach(b=>b.onclick=()=>{const i=items.find(x=>x.id===b.dataset.fav);if(!i)return;i.favorite=!i.favorite;save();render()});
  $$("#items [data-open]").forEach(b=>b.onclick=()=>{const i=items.find(x=>x.id===b.dataset.open);if(i)window.open(i.url,"_blank","noopener,noreferrer")});
  $$("#items [data-edit]").forEach(b=>b.onclick=()=>editItem(b.dataset.edit));
  $$("#items [data-delete]").forEach(b=>b.onclick=()=>deleteItem(b.dataset.delete));
  $("#clearSearch").classList.toggle("hidden",!$("#search").value);
}
function categoriesView(){
  if(currentView!=="categories")return;
  const counts={};items.forEach(i=>counts[i.category]=(counts[i.category]||0)+1);
  $("#categoryGrid").innerHTML=cats.map(c=>`<button class="category-card large ${currentCat===c?"active":""}" data-category="${esc(c)}"><span class="category-icon">${iconForCategory(c)}</span><span class="category-name">${esc(c)}</span><span class="category-count">${counts[c]||0} saved</span><span class="category-arrow">→</span></button>`).join("");
  $$("#categoryGrid [data-category]").forEach(b=>b.onclick=()=>{currentView="all";currentCat=b.dataset.category;setNav("all");renderAll()});
  $("#categorySubtitle").textContent="Choose a category to browse your library";
  $("#items").innerHTML="";$("#empty").classList.add("hidden");$("#libraryCount").textContent=`${cats.length} categories`;
}
function renderAll(){render();if(currentView==="categories")categoriesView()}
function fillCats(selected=""){ $("#category").innerHTML=cats.map(c=>`<option value="${esc(c)}" ${c===selected?"selected":""}>${iconForCategory(c)} ${esc(c)}</option>`).join("") }
function addItem(){editing=null;$("#modalTitle").textContent="Save a link";$("#itemForm").reset();$("#editId").value="";fillCats(cats[0]);$("#platformHint").textContent="Paste a link to detect the platform.";openModal("#itemModal");setTimeout(()=>$("#url").focus(),100)}
function editItem(id){const i=items.find(x=>x.id===id);if(!i)return;editing=id;$("#modalTitle").textContent="Edit saved link";$("#editId").value=id;$("#url").value=i.url;$("#title").value=i.title;$("#notes").value=i.notes;fillCats(i.category);$("#platformHint").textContent=`Detected platform: ${i.platform}`;openModal("#itemModal")}
function deleteItem(id){const i=items.find(x=>x.id===id);if(!i)return;if(!confirm(`Delete “${i.title||"this saved link"}”?`))return;items=items.filter(x=>x.id!==id);save();renderAll();toast("Saved item deleted")}
function submitItem(e){
  e.preventDefault();const url=$("#url").value.trim(),p=platform(url);const title=$("#title").value.trim()||detectTitle(url),category=$("#category").value,notes=$("#notes").value.trim();
  if(editing){const i=items.find(x=>x.id===editing);if(i)Object.assign(i,{url,title,category,notes,platform:p})}
  else items.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),url,title,category,notes,platform:p,favorite:false,created:Date.now()});
  save();closeModals();renderAll();toast(editing?"Saved changes":"Added to your library");editing=null;
}
function renderCats(){
  $("#catList").innerHTML=cats.map(c=>`<div class="cat-item"><span>${iconForCategory(c)} ${esc(c)}</span><button data-delcat="${esc(c)}" title="Delete">×</button></div>`).join("");
  $$("#catList [data-delcat]").forEach(b=>b.onclick=()=>{const c=b.dataset.delcat;if(cats.length<=1)return toast("Keep at least one category");const used=items.some(i=>i.category===c);if(used&&!confirm(`“${c}” is used by saved items. Move those items to the first category and delete it?`))return;cats=cats.filter(x=>x!==c);items.forEach(i=>{if(i.category===c)i.category=cats[0]});save();renderCats();renderAll();toast("Category removed")});
}
function exportData(){const blob=new Blob([JSON.stringify({app:"SaveNest",version:2,categories:cats,items},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="savenest-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Backup exported")}
function importData(file){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.items)||!Array.isArray(d.categories))throw Error();items=d.items;cats=d.categories;save();renderAll();toast("Backup restored")}catch{toast("That backup file is not valid SaveNest data")}};r.readAsText(file)}

$("#addBtn").onclick=addItem;$("#navAdd").onclick=addItem;$("#emptyAdd").onclick=addItem;$("#itemForm").onsubmit=submitItem;
$("#viewCategories").onclick=()=>{currentView="categories";currentCat="";setNav("categories");renderAll()};
$("#url").oninput=()=>{const p=platform($("#url").value);$("#platformHint").textContent=$("#url").value?`Detected platform: ${p}`:"Paste a link to detect the platform.";if(!$("#title").value&&$("#url").value)$("#title").value=detectTitle($("#url").value)};
$("#search").oninput=render;$("#clearSearch").onclick=()=>{$("#search").value="";render()};$("#sortSelect").onchange=render;
$$("[data-close]").forEach(b=>b.onclick=closeModals);$$('.modal').forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModals()}));
$("#settingsBtn").onclick=()=>openModal("#settingsModal");$("#manageCats").onclick=()=>{closeModals();renderCats();openModal("#catModal")};
$("#catForm").onsubmit=e=>{e.preventDefault();const n=$("#newCat").value.trim();if(!n)return;if(cats.some(c=>c.toLowerCase()===n.toLowerCase()))return toast("Category already exists");cats.push(n);$("#newCat").value="";save();renderCats();renderAll();toast("Category added")};
$("#exportBtn").onclick=exportData;$("#importBtn").onclick=()=>$("#importFile").click();$("#importFile").onchange=e=>e.target.files[0]&&importData(e.target.files[0]);
$("#clearAll").onclick=()=>{if(confirm("Delete ALL saved links? This cannot be undone.")){items=[];save();renderAll();closeModals();toast("Library cleared")}};
$$('.nav[data-view]').forEach(b=>b.onclick=()=>{const v=b.dataset.view;if(v==="settings"){openModal("#settingsModal");return}currentView=v;currentCat="";setNav(v);renderAll()});
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeModals()});
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
renderAll();

function handleSharedLink(){
  const p=new URLSearchParams(location.search),sharedUrl=p.get("url")||p.get("text"),sharedTitle=p.get("title");
  if(sharedUrl){const clean=(sharedUrl.match(/https?:\/\/[^\s]+/)||[sharedUrl])[0];setTimeout(()=>{addItem();$("#url").value=clean;$("#title").value=sharedTitle||detectTitle(clean);$("#platformHint").textContent=`Detected platform: ${platform(clean)}`},180);history.replaceState({},document.title,location.pathname)}
}
handleSharedLink();
