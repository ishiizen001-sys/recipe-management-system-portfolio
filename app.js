document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="interactive.css">');
let ingredients=[
 {id:1,name:'国産鶏もも肉',category:'肉・魚',unit:'g',price:1.72},
 {id:2,name:'季節の彩り野菜',category:'野菜・果物',unit:'g',price:.88},
 {id:3,name:'たまご',category:'乳製品',unit:'個',price:34},
 {id:4,name:'乾燥パスタ',category:'穀物',unit:'g',price:.72},
 {id:5,name:'ミックスきのこ',category:'野菜・果物',unit:'g',price:1.36},
 {id:6,name:'ミルク',category:'乳製品',unit:'ml',price:.42}
];
let recipes=[
 {id:1,name:'香草チキンプレート',cat:'メイン',icon:'🍗',price:1380,lines:[{ingredientId:1,qty:180},{ingredientId:2,qty:90}]},
 {id:2,name:'彩り野菜のキッシュ',cat:'サイド',icon:'🥧',price:880,lines:[{ingredientId:3,qty:2},{ingredientId:2,qty:120}]},
 {id:3,name:'森のきのこパスタ',cat:'メイン',icon:'🍝',price:1180,lines:[{ingredientId:4,qty:140},{ingredientId:5,qty:130}]}
];
let view='dashboard',editing=null;
const yen=n=>'¥'+Math.round(n).toLocaleString();
const cost=r=>r.lines.reduce((s,l)=>s+(ingredients.find(i=>i.id===l.ingredientId)?.price||0)*l.qty,0);
const ratio=r=>cost(r)/r.price*100;
function card(r){let x=ratio(r);return `<article class="card"><div class="dish-art">${r.icon}</div><div class="card-body"><span class="tag">${r.cat}</span><h3>${r.name}</h3><div class="numbers"><span>1食原価<strong>${yen(cost(r))}</strong></span><span>参考売価<strong>${yen(r.price)}</strong></span></div><div class="ratio ${x>=34?'high':''}"><span>原価率</span><span>${x.toFixed(1)}%</span></div><div class="track"><i style="width:${Math.min(100,x*2)}%"></i></div>${view==='recipes'?`<button class="edit-btn" data-edit="${r.id}">編集する</button>`:''}</div></article>`}
function render(){
 if(view==='ingredients') app.innerHTML=`<section class="panel"><div class="section-head"><div><p class="eyebrow">INGREDIENT MASTER</p><h2>食材と仕入単価</h2></div><button id="addIngredient" class="primary">＋ 食材を追加</button></div><div class="table-wrap"><table><thead><tr><th>食材名</th><th>カテゴリ</th><th>単位</th><th>単価</th></tr></thead><tbody>${ingredients.map(i=>`<tr><td><input data-id="${i.id}" data-field="name" value="${i.name}"></td><td><input data-id="${i.id}" data-field="category" value="${i.category}"></td><td><select data-id="${i.id}" data-field="unit">${['g','ml','個'].map(u=>`<option ${u===i.unit?'selected':''}>${u}</option>`).join('')}</select></td><td><input data-id="${i.id}" data-field="price" type="number" step=".01" value="${i.price}"></td></tr>`).join('')}</tbody></table></div><p class="hint">編集内容はレシピ原価へ即時反映されます（画面内のみ）。</p></section>`;
 else {let top=view==='dashboard'?`<section class="metrics">${[['登録レシピ',recipes.length+'品'],['平均原価率',(recipes.reduce((s,r)=>s+ratio(r),0)/recipes.length).toFixed(1)+'%'],['食材マスタ',ingredients.length+'件'],['要確認',recipes.filter(r=>ratio(r)>=34).length+'品']].map(x=>`<article class="metric"><span>${x[0]}</span><strong>${x[1]}</strong></article>`).join('')}</section>`:'';app.innerHTML=top+`<section class="section-head ${view==='recipes'?'panel':''}"><div><p class="eyebrow">RECIPES</p><h2>${view==='recipes'?'登録レシピ':'最近のレシピ'}</h2></div><button data-new class="primary">＋ レシピを作成</button></section><section class="cards">${recipes.map(card).join('')}</section>`}
 bind();
}
function setView(v){view=v;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));let t={dashboard:['レシピ原価ダッシュボード','原価と収益性をひと目で確認できます。'],recipes:['レシピ管理','新規作成と原価計算を操作できます。'],ingredients:['食材マスタ','食材追加と単価編集を操作できます。']}[v];pageTitle.textContent=t[0];pageLead.textContent=t[1];render()}
function bind(){
 document.querySelectorAll('[data-new]').forEach(b=>b.onclick=()=>openEditor());
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEditor(+b.dataset.edit));
 document.querySelector('#addIngredient')?.addEventListener('click',()=>{ingredients.push({id:Date.now(),name:'新しい食材',category:'調味料',unit:'g',price:1});render()});
 document.querySelectorAll('table input,table select').forEach(e=>e.onchange=()=>{let i=ingredients.find(x=>x.id===+e.dataset.id);i[e.dataset.field]=e.dataset.field==='price'?+e.value:e.value;render()});
}
function line(l={ingredientId:ingredients[0].id,qty:100}){return `<div class="recipe-line"><select>${ingredients.map(i=>`<option value="${i.id}" ${i.id===l.ingredientId?'selected':''}>${i.name}（${i.unit}）</option>`).join('')}</select><input type="number" min="0" value="${l.qty}"><button type="button" class="remove-line">×</button></div>`}
function openEditor(id=null){editing=id;let r=recipes.find(x=>x.id===id),f=recipeForm;modalTitle.textContent=r?'レシピを編集':'レシピを作成';f.recipeName.value=r?.name||'';f.cat.value=r?.cat||'メイン';f.price.value=r?.price||1000;f.icon.value=r?.icon||'🍽️';recipeLines.innerHTML=(r?.lines||[{}]).map(line).join('');editor.showModal();bindLines();estimate()}
function bindLines(){document.querySelectorAll('.recipe-line select,.recipe-line input').forEach(e=>e.oninput=estimate);document.querySelectorAll('.remove-line').forEach(b=>b.onclick=()=>{if(document.querySelectorAll('.recipe-line').length>1){b.parentElement.remove();estimate()}})}
function estimate(){let n=0;document.querySelectorAll('.recipe-line').forEach(r=>n+=(ingredients.find(i=>i.id===+r.querySelector('select').value)?.price||0)*+r.querySelector('input').value);estimatedCost.textContent=yen(n)}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>setView(b.dataset.view));
closeModal.onclick=cancelModal.onclick=()=>editor.close();
addLine.onclick=()=>{recipeLines.insertAdjacentHTML('beforeend',line());bindLines();estimate()};
recipeForm.onsubmit=e=>{e.preventDefault();let f=e.currentTarget,r={id:editing||Date.now(),name:f.recipeName.value,cat:f.cat.value,price:+f.price.value,icon:f.icon.value,lines:[...document.querySelectorAll('.recipe-line')].map(x=>({ingredientId:+x.querySelector('select').value,qty:+x.querySelector('input').value}))};recipes=editing?recipes.map(x=>x.id===editing?r:x):[r,...recipes];editor.close();setView('recipes')};
render();

