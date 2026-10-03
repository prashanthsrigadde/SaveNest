const KEY="savenest_items_v1", CATKEY="savenest_categories_v1";
const defaultCats=["NEBOSH / Study","Education","Motivation","Quotes","Family","Music","Travel","Work","Baby","Watch Later","Other"];
let items=JSON.parse(localStorage.getItem(KEY)||"[]");
let cats=JSON.parse(localStorage.getItem(CATKEY)||"null")||defaultCats.slice();
let currentView="all", currentCat="", editing=null;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function save(){localStorage.setItem(KEY,JSON.stringify(items));localStorage.setItem(CATKEY,JSON.stringify(cats));}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function platform(url){try{let h=new URL(url).hostname.toLowerCase(); if(h.includes("instagram"))return"Instagram";if(h.includes("youtube")||h.includes("youtu.be"))return"YouTube";return"Web";}catch{return"Web"}}
function domain(url){try{return new URL(url).hostname.replace(/^www\./,"")}catch{return url}}
function detectTitle(url){try{let u=new URL(url);return platform(url)+" • "+u.pathname.split("/").filter(Boolean).slice(0,2).join(" / ")||platform(url)}catch{return""}}
function fmt(t){return new Date(t).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}
function toast(msg){let t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function openModal(id){$(id).classList.remove("hidden")} function closeModals(){$$(".modal").forEach(x=>x.classList.add("hidden"))}

function renderQuick(){
  const counts={}; items.forEach(i=>counts[i.category]=(counts[i.category]||0)+1);
  let arr=[["All",items.length],["Favorites",items.filter(i=>i.favorite).length],...cats.map(c=>[c,counts[c]||0]).filter(x=>x[1])];
  $("#quickRow").innerHTML=arr.map(([name,n])=>`<button class="chip ${(!currentCat&&name==="All"&&currentView==="all")||(currentView==="favorites"&&name==="Favorites")||(currentCat===name)?"active":""}" data-chip="${esc(name)}">${esc(name)} ${n}</button>`).join("");
  $$(".chip").forEach(b=>b.onclick=()=>{let v=b.dataset.chip;if(v==="All"){currentView="all";currentCat=""}else if(v==="Favorites"){currentView="favorites";currentCat=""}else{currentView="all";currentCat=v}render()});
}
function filtered(){
  let q=$("#search").value.trim().toLowerCase();
  let a=items.filter(i=>currentView==="favorites"?i.favorite:true).filter(i=>!currentCat||i.category===currentCat);
  if(q)a=a.filter(i=>[i.title,i.url,i.notes,i.category,i.platform].join(" ").toLowerCase().includes(q));
  const sort=$("#sortSelect").value;
  if(sort==="newest")a.sort((x,y)=>y.created-x.created); if(sort==="oldest")a.sort((x,y)=>x.created-y.created);
  if(sort==="az")a.sort((x,y)=>x.title.localeCompare(y.title)); if(sort==="favorite")a.sort((x,y)=>Number(y.favorite)-Number(x.favorite)||y.created-x.created);
  return a;
}
function render(){
  renderQuick();
  const a=filtered();
  $("#libraryCount").textContent=`${a.length} saved ${a.length===1?"item":"items"}`;
  $("#items").innerHTML=a.map(i=>`<article class="card">
    <div class="card-top"><span class="platform ${i.platform.toLowerCase()}">${i.platform==="Instagram"?"◎":i.platform==="YouTube"?"▶":"↗"} ${i.platform}</span>
    <button class="fav" title="Favorite" data-fav="${i.id}">${i.favorite?"♥":"♡"}</button></div>
    <h3>${esc(i.title||"Saved link")}</h3>
    <div class="url">${esc(domain(i.url))} · ${fmt(i.created)}</div>
    ${i.notes?`<div class="note">${esc(i.notes)}</div>`:""}
    <div class="meta"><span class="category-pill">${esc(i.category)}</span><div class="actions"><button class="small-btn" data-open="${i.id}">Open</button><button class="small-btn" data-edit="${i.id}">Edit</button></div></div>
  </article>`).join("");
  $("#empty").classList.toggle("hidden",a.length>0);
  if(a.length===0){$("#emptyTitle").textContent=items.length?"No matching saves":"Your nest is empty";$("#emptyText").textContent=items.length?"Try another category or search word.":"Save your first Instagram or YouTube link and organize it into a category."}
  $$("#items [data-fav]").forEach(b=>b.onclick=()=>{let i=items.find(x=>x.id===b.dataset.fav);i.favorite=!i.favorite;save();render()});
  $$("#items [data-open]").forEach(b=>b.onclick=()=>{let i=items.find(x=>x.id===b.dataset.open);window.open(i.url,"_blank","noopener,noreferrer")});
  $$("#items [data-edit]").forEach(b=>()=>{}); 
  $$("#items [data-edit]").forEach(b=>b.onclick=()=>editItem(b.dataset.edit));
  $("#clearSearch").classList.toggle("hidden",!$("#search").value);
}
function fillCats(selected=""){ $("#category").innerHTML=cats.map(c=>`<option ${c===selected?"selected":""}>${esc(c)}</option>`).join("") }
function addItem(){
  editing=null;$("#modalTitle").textContent="Save a link";$("#itemForm").reset();$("#editId").value="";fillCats(cats[0]);$("#platformHint").textContent="Paste a link to detect the platform.";openModal("#itemModal");setTimeout(()=>$("#url").focus(),100);
}
function editItem(id){
  let i=items.find(x=>x.id===id);if(!i)return;editing=id;$("#modalTitle").textContent="Edit saved link";$("#editId").value=id;$("#url").value=i.url;$("#title").value=i.title;$("#notes").value=i.notes;fillCats(i.category);$("#platformHint").textContent=`Detected platform: ${i.platform}`;openModal("#itemModal");
}
function submitItem(e){
  e.preventDefault();let url=$("#url").value.trim(), p=platform(url);
  let title=$("#title").value.trim()||detectTitle(url), category=$("#category").value, notes=$("#notes").value.trim();
  if(editing){let i=items.find(x=>x.id===editing);Object.assign(i,{url,title,category,notes,platform:p})}
  else items.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),url,title,category,notes,platform:p,favorite:false,created:Date.now()});
  save();closeModals();render();toast(editing?"Saved changes":"Added to your library");
}
function renderCats(){
  $("#catList").innerHTML=cats.map(c=>`<div class="cat-item"><span>${esc(c)}</span><button data-delcat="${esc(c)}" title="Delete">×</button></div>`).join("");
  $$("#catList [data-delcat]").forEach(b=>b.onclick=()=>{let c=b.dataset.delcat;if(cats.length<=1)return toast("Keep at least one category");let used=items.some(i=>i.category===c);if(used&&!confirm(`"${c}" is used by saved items. Delete it anyway?`))return;cats=cats.filter(x=>x!==c);items.forEach(i=>{if(i.category===c)i.category=cats[0]});save();renderCats();render()});
}
function categoriesView(){
  if(currentView!=="categories")return;
  $("#items").innerHTML=`<div class="category-screen"><div class="cat-grid">${cats.map(c=>{let n=items.filter(i=>i.category===c).length;return `<button class="big-chip" data-category="${esc(c)}"><b>${esc(c)}</b><span>${n} saved</span></button>`}).join("")}</div></div>`;
  $("#empty").classList.add("hidden");$("#libraryCount").textContent="Choose a category";
  $$(".big-chip").forEach(b=>b.onclick=()=>{currentView="all";currentCat=b.dataset.category;render()});
}
function renderAll(){render();if(currentView==="categories")categoriesView()}
function exportData(){
  let blob=new Blob([JSON.stringify({app:"SaveNest",version:1,categories:cats,items},null,2)],{type:"application/json"});
  let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="savenest-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Backup exported");
}
function importData(file){
  let r=new FileReader();r.onload=()=>{try{let d=JSON.parse(r.result);if(!Array.isArray(d.items)||!Array.isArray(d.categories))throw Error();items=d.items;cats=d.categories;save();render();toast("Backup restored")}catch{toast("That backup file is not valid SaveNest data")}};r.readAsText(file);
}

$("#addBtn").onclick=addItem;$("#navAdd").onclick=addItem;$("#emptyAdd").onclick=addItem;$("#itemForm").onsubmit=submitItem;
$("#url").oninput=()=>{let p=platform($("#url").value);$("#platformHint").textContent=$("#url").value?`Detected platform: ${p}`:"Paste a link to detect the platform.";if(!$("#title").value&&$("#url").value)$("#title").value=detectTitle($("#url").value)};
$("#search").oninput=render;$("#clearSearch").onclick=()=>{$("#search").value="";render()};$("#sortSelect").onchange=render;
$$("[data-close]").forEach(b=>b.onclick=closeModals);
$$(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModals()}));
$("#settingsBtn").onclick=()=>openModal("#settingsModal");
$("#manageCats").onclick=()=>{closeModals();renderCats();openModal("#catModal")};
$("#catForm").onsubmit=e=>{e.preventDefault();let n=$("#newCat").value.trim();if(!n)return;if(cats.some(c=>c.toLowerCase()===n.toLowerCase()))return toast("Category already exists");cats.push(n);$("#newCat").value="";save();renderCats();render();toast("Category added")};
$("#exportBtn").onclick=exportData;$("#importBtn").onclick=()=>$("#importFile").click();$("#importFile").onchange=e=>e.target.files[0]&&importData(e.target.files[0]);
$("#clearAll").onclick=()=>{if(confirm("Delete ALL saved links? This cannot be undone.")){items=[];save();render();closeModals();toast("Library cleared")}};
$$(".nav[data-view]").forEach(b=>b.onclick=()=>{let v=b.dataset.view;if(v==="settings"){openModal("#settingsModal");return}currentView=v;currentCat="";$$(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderAll()});
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeModals()});
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
renderAll();

function handleSharedLink(){
  const p=new URLSearchParams(location.search);
  const sharedUrl=p.get("url") || p.get("text");
  const sharedTitle=p.get("title");
  if(sharedUrl){
    const clean=(sharedUrl.match(/https?:\\/\\/[^\\s]+/)||[sharedUrl])[0];
    setTimeout(()=>{
      addItem();
      $("#url").value=clean;
      $("#title").value=sharedTitle||detectTitle(clean);
      $("#platformHint").textContent=`Detected platform: ${platform(clean)}`;
    },180);
    history.replaceState({},document.title,location.pathname);
  }
}
handleSharedLink();
