// One physical layout for every view. All positions are in master photograph pixels.
// Detail views share the SAME field of view; neighbors are never generated separately.
window.SNEAKER_GEOMETRY = Object.freeze({
  master: 'media-v15/wall-3200.webp', width: 5504, height: 3072,
  frameWidth: 1376, frameHeight: 768,
  shelfCentersX: [710, 1745, 2790, 3825, 4864],
  rowCentersY: [970, 2010],
  names: ['Foundry 01','Yard 02','Hangar 03','Tier 04','Escarp 05','Index 06','Frame 07','Form 08','Plinth 09','Grade 10'],
  frame(n) {
    if (!Number.isInteger(n) || n < 1 || n > 10) throw new RangeError('Invalid shoe');
    const col = (n - 1) % 5, row = Math.floor((n - 1) / 5);
    return { n, x: Math.max(0, Math.min(this.width - this.frameWidth, this.shelfCentersX[col] - this.frameWidth / 2)),
      y: this.rowCentersY[row] - this.frameHeight / 2,
      width: this.frameWidth, height: this.frameHeight };
  },
  mount(container, n) {
    if(window.SNEAKER_DELIVERY)return SNEAKER_DELIVERY.mount(container,n);
    const frame = this.frame(n), image = new Image();
    container.classList.add('spatial-frame');
    container.dataset.viewShoe = n;
    image.alt = `Close-up of ${this.names[n - 1].toLowerCase()}`;
    image.src = this.master;
    Object.assign(container.style, {position:'relative', overflow:'hidden', aspectRatio:`${frame.width}/${frame.height}`});
    Object.assign(image.style, {position:'absolute', maxWidth:'none', width:`${100*this.width/frame.width}%`,
      height:`${100*this.height/frame.height}%`, left:`${-100*frame.x/frame.width}%`, top:`${-100*frame.y/frame.height}%`});
    container.replaceChildren(image);
    window.SNEAKER_DETAIL_QUALITY?.mount(container,n);
    window.SNEAKER_LED_DETAIL?.mount(container,n);
    return frame;
  }
});

;
window.SNEAKER_LED_CAMERAS={"1": {"forward": "shoe_01_camera_matched_v9.mp4", "reverse": "shoe_01_camera_matched_v9_reverse.mp4"}, "2": {"forward": "shoe_02_camera_matched_v9.mp4", "reverse": "shoe_02_camera_matched_v9_reverse.mp4"}, "3": {"forward": "shoe_03_camera_matched_v9.mp4", "reverse": "shoe_03_camera_matched_v9_reverse.mp4"}, "4": {"forward": "shoe_04_camera_matched_v9.mp4", "reverse": "shoe_04_camera_matched_v9_reverse.mp4"}, "5": {"forward": "shoe_05_camera_matched_v9.mp4", "reverse": "shoe_05_camera_matched_v9_reverse.mp4"}, "6": {"forward": "shoe_06_camera_matched_v9.mp4", "reverse": "shoe_06_camera_matched_v9_reverse.mp4"}, "7": {"forward": "shoe_07_camera_matched_v9.mp4", "reverse": "shoe_07_camera_matched_v9_reverse.mp4"}, "8": {"forward": "shoe_08_camera_matched_v9.mp4", "reverse": "shoe_08_camera_matched_v9_reverse.mp4"}, "9": {"forward": "shoe_09_camera_matched_v9.mp4", "reverse": "shoe_09_camera_matched_v9_reverse.mp4"}, "10": {"forward": "shoe_10_camera_matched_v9.mp4", "reverse": "shoe_10_camera_matched_v9_reverse.mp4"}};

;
// Concept collection. English storefront, EUR prices, EU sizing.
const collectionSizes=['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'];
const collectionPrices=[5990,5490,5990,5690,5290,4490,5790,5690,4290,5190];
window.SNEAKER_PRODUCTS=[
 ['FOUNDRY 01','Peach orange','Sculpted lines. A translucent amber sole.','Horizontal overlays, tonal laces and three transparent supports.'],
 ['YARD 02','Forest / Bone','A high collar with a distinctive buckle closure.','Light contrast panels, a padded collar and a straight sole profile.'],
 ['HANGAR 03','Cobalt / White','Padded panels with a clear blue sole.','Cobalt laces, light woven panels and a white toe.'],
 ['TIER 04','Lilac / Cream','Soft volumes. A layered silhouette.','A mid-cut collar, overlapping panels and twin pull tabs.'],
 ['ESCARP 05','Graphite / Olive','A rugged profile, finished with orange laces.','A protected toe and a deeply sculpted outsole.'],
 ['INDEX 06','Sand / Burgundy','A low profile with diagonal panelling.','A soft-touch finish and a speckled sole.'],
 ['FRAME 07','Graphite / Cobalt','An enveloping collar. A sharp flash of blue.','A high-cut profile and a flat gum-coloured sole.'],
 ['FORM 08','Pearl / Silver','Continuous knit over a clear amber sole.','A silver heel and one uninterrupted translucent sole chamber.'],
 ['PLINTH 09','White / Terracotta','Clean lines, grounded in terracotta.','A low-cut shape, white laces and a stitched toe.'],
 ['GRADE 10','Coral / Blue / Lime','A woven upper on a sculpted foundation.','A stretch collar and vertical grooves along the sole.']
].map(([name,color,description,details],i)=>({id:i+1,name,color,description,details,price:collectionPrices[i],currency:'INR',productId:`concept-${String(i+1).padStart(2,'0')}`,sizes:[...collectionSizes],concept:true}));

;
(() => {
  const images=new Map();
  const detailURL=n=>{
    const mobile=matchMedia('(max-width:760px)').matches,pixels=innerWidth*devicePixelRatio;
    const width=!mobile&&pixels>2752?3840:pixels>1376?2752:1376;
    return `media-v15/${mobile?'mobile-detail':'detail'}-${String(n).padStart(2,'0')}-${width}.webp`;
  };
  function load(n){
    const url=detailURL(n);
    if(!images.has(url)){
      const image=new Image();image.decoding='async';image.src=url;
      images.set(url,{image,ready:image.decode()});
      images.get(url).ready.catch(()=>images.delete(url));
    }
    return images.get(url);
  }
  function mount(container,n){
    const cached=load(n),image=cached.image.cloneNode();
    image.alt=`Close-up of ${SNEAKER_GEOMETRY.names[n-1]}`;image.className='delivered-detail';
    container.classList.add('spatial-frame');container.dataset.viewShoe=n;
    Object.assign(container.style,{position:'relative',overflow:'hidden',aspectRatio:'1376/768'});
    Object.assign(image.style,{display:'block',width:'100%',height:'100%',objectFit:'fill'});
    container.replaceChildren(image);container.qualityReady=cached.ready;return SNEAKER_GEOMETRY.frame(n);
  }
  window.SNEAKER_DELIVERY={load,mount,detailURL};
})();

;
window.SNEAKER_VISUAL={
 mount(container,n,{alt=''}={}){
  const image=new Image();container.classList.add('shoe-visual');container.dataset.shoe=n;
  image.src=`media-v18/thumb-${String(n).padStart(2,'0')}.webp`;image.alt=alt;image.decoding='async';
  Object.assign(image.style,{display:'block',width:'100%',height:'100%',objectFit:'contain'});container.append(image);return image;
 }
};

;
(() => {
  'use strict';
  const scene=document.querySelector('#scene'),catalog=window.SNEAKER_PRODUCTS;
  if(!scene||!catalog)return;
  const node=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
  const products=new Map(catalog.map(p=>[p.id,p])),sizes=new Map(),labels=[];
  const storageKey='ascenta.sneakers.bag.v1';
  let active=null,bag=[],addTimer;
  try{
    const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');
    if(Array.isArray(saved))for(const line of saved){
      const product=products.get(line.id);
      if(!product||!product.sizes.includes(line.size)||!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>99)continue;
      const duplicate=bag.find(x=>x.id===line.id&&x.size===line.size);
      if(duplicate)duplicate.quantity=Math.min(99,duplicate.quantity+line.quantity);
      else bag.push({id:line.id,size:line.size,quantity:line.quantity});
    }
  }catch{}
  const panel=node('section','scene-product');panel.hidden=true;panel.setAttribute('aria-label','Product information and size selection');
  const heading=node('div','product-heading'),kicker=node('p','product-kicker'),title=node('h1'),description=node('p');heading.append(kicker,title,description);
  const plane=node('div','product-plane'),color=node('p','product-color'),price=node('p','product-price');
  const sizeField=node('div','size-field'),sizeLabel=node('label','size-label','Choose your size'),sizeUnit=node('span','size-unit','EU');
  sizeLabel.htmlFor='product-size';
  const sizeSelect=node('select','size-select');sizeSelect.id='product-size';sizeSelect.setAttribute('aria-label','Select size, EU');
  const sizeTop=node('div','size-top');sizeTop.append(sizeLabel,sizeUnit);
  const sizeControl=node('div','size-control');sizeControl.append(sizeSelect);sizeField.append(sizeTop,sizeControl);
  const add=node('button','add-to-bag');add.type='button';add.disabled=true;
  const addLabel=node('span','add-label','Add to bag'),addSymbol=node('span','add-symbol');addSymbol.setAttribute('aria-hidden','true');
  addSymbol.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><g class="add-arrow"><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></g><path class="add-check" d="m5 12 4 4L19 6"/></svg>';
  const addCopy=node('span','add-copy'),addHint=node('span','add-hint','Select your size to continue');
  addCopy.append(addLabel,addHint);add.append(addCopy,addSymbol);
  add.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||reducedMotion())return;
    const bounds=add.getBoundingClientRect();
    add.style.setProperty('--pointer-x',`${event.clientX-bounds.left}px`);
    add.style.setProperty('--icon-x',`${(event.clientX-bounds.left-bounds.width/2)*.035}px`);
    add.style.setProperty('--icon-y',`${(event.clientY-bounds.top-bounds.height/2)*.12}px`);
  });
  add.addEventListener('pointerleave',()=>{add.style.setProperty('--icon-x','0px');add.style.setProperty('--icon-y','0px');});
  const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resetAdd(){clearTimeout(addTimer);add.classList.remove('is-added');addLabel.textContent='Add to bag';addHint.textContent=sizes.has(active)?`${sizeText(sizes.get(active))} / Ready to add`:'Select your size to continue';}
  const more=node('details','product-more'),summary=node('summary','','Design details'),design=node('p');more.append(summary,design);
  const selection=node('p','selection-message');selection.setAttribute('role','status');selection.setAttribute('aria-live','polite');
  const purchaseHeader=node('div','purchase-header');purchaseHeader.append(color,price);
  const collectionNote=node('p','purchase-note','GULLY LABS // ARCHIVAL 01');
  plane.append(collectionNote,purchaseHeader,sizeField,add,selection,more);panel.append(heading,plane);scene.append(panel);
  const toggle=node('button','bag-toggle');toggle.type='button';toggle.setAttribute('aria-controls','scene-bag');toggle.setAttribute('aria-expanded','false');(document.querySelector('#header-actions')||scene).append(toggle);
  const bagPanel=node('dialog','scene-bag');bagPanel.id='scene-bag';bagPanel.hidden=true;bagPanel.setAttribute('role','dialog');bagPanel.setAttribute('aria-modal','true');bagPanel.setAttribute('aria-labelledby','bag-title');
  const bagHeader=node('div','bag-header'),bagTitle=node('h2','','YOUR BAG');bagTitle.id='bag-title';
  const close=node('button','bag-close','×');close.type='button';close.setAttribute('aria-label','Close bag');bagHeader.append(bagTitle,close);
  const lines=node('ul','bag-lines'),empty=node('p','bag-empty','Your bag is empty.'),note=node('p','bag-note','Concept collection. Products are not available for purchase.'),checkout=node('button','bag-checkout','Checkout unavailable');checkout.type='button';checkout.disabled=true;
  const subtotal=node('p','bag-subtotal');subtotal.setAttribute('aria-live','polite');
  bagPanel.append(bagHeader,empty,lines,subtotal,note,checkout);document.body.append(bagPanel);
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(bag));}catch{}renderBag();}
  function priceText(p){return Number.isFinite(p.price)?('₹' + p.price.toLocaleString('en-IN')):'Price to be confirmed';}
  const sizeText=value=>String(value);
  function renderBag(){
    const count=bag.reduce((sum,l)=>sum+l.quantity,0);toggle.textContent=`Bag (${String(count).padStart(2,'0')})`;toggle.setAttribute('aria-label',`Bag (${String(count).padStart(2,'0')}), open bag`);
    lines.replaceChildren();empty.hidden=bag.length>0;
    const cents=bag.reduce((sum,line)=>sum+Math.round(products.get(line.id).price*100)*line.quantity,0);
    subtotal.hidden=bag.length===0;subtotal.replaceChildren(node('span','','Subtotal'),node('span','',priceText({price:cents/100,currency:'INR',productId:`concept-${String(i+1).padStart(2,'0')}`})));
    for(const line of bag){
      const product=products.get(line.id),row=node('li','bag-line');row.dataset.product=line.id;row.dataset.size=line.size;
      const controls=node('div','bag-line-controls'),minus=node('button','','−'),qty=node('span','',String(line.quantity)),plus=node('button','','+'),remove=node('button','bag-remove','Remove');
      for(const b of [minus,plus,remove])b.type='button';
      minus.setAttribute('aria-label',`Decrease quantity of ${product.name}, size ${line.size}`);plus.setAttribute('aria-label',`Increase quantity of ${product.name}, size ${line.size}`);remove.setAttribute('aria-label',`Remove ${product.name}, size ${line.size}`);plus.disabled=line.quantity>=99;
      const change=delta=>{line.quantity+=delta;if(line.quantity<=0)bag=bag.filter(l=>l!==line);save();};
      minus.addEventListener('click',()=>change(-1));plus.addEventListener('click',()=>change(1));remove.addEventListener('click',()=>{bag=bag.filter(l=>l!==line);save();});
      controls.append(minus,qty,plus,remove);
      const thumbnail=node('div','bag-line-photo');SNEAKER_VISUAL.mount(thumbnail,product.id,{alt:product.name+' in '+product.color});
      const copy=node('div','bag-line-copy');copy.append(node('p','bag-line-name',product.name),node('p','bag-line-meta',`EU ${sizeText(line.size)} / ${product.color}`),node('p','bag-line-price',priceText(product)),controls);
      row.append(thumbnail,copy);lines.append(row);
    }
  }
  function openBag(){bagPanel.hidden=false;bagPanel.showModal();toggle.setAttribute('aria-expanded','true');plane.inert=true;document.body.classList.add('bag-open');scene.querySelectorAll('.hit').forEach(e=>e.inert=true);close.focus({preventScroll:true});}
  function closeBag(){bagPanel.close();bagPanel.hidden=true;toggle.setAttribute('aria-expanded','false');plane.inert=false;document.body.classList.remove('bag-open');scene.querySelectorAll('.hit').forEach(e=>e.inert=false);toggle.focus({preventScroll:true});}
  toggle.addEventListener('click',()=>bagPanel.hidden?openBag():closeBag());close.addEventListener('click',closeBag);bagPanel.addEventListener('cancel',e=>{e.preventDefault();closeBag();});
  bagPanel.addEventListener('click',e=>{if(e.target===bagPanel){const r=bagPanel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeBag();}});
  document.addEventListener('keydown',e=>{
    if(bagPanel.hidden)return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeBag();return;}
    if(e.key==='Tab'){
      const focusable=[...bagPanel.querySelectorAll('button:not(:disabled)')],first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  },true);
  function selectSize(value){
    if(!products.get(active)?.sizes.includes(value))return;
    sizes.set(active,value);sizeSelect.value=String(value);
    resetAdd();add.disabled=false;selection.textContent=`EU ${sizeText(value)} selected`;
  }
  sizeSelect.addEventListener('change',()=>selectSize(sizeSelect.value));
  add.addEventListener('click',()=>{
    const product=products.get(active),size=sizes.get(active);if(!product||!product.sizes.includes(size))return;
    const line=bag.find(l=>l.id===active&&l.size===size);
    try {
      const targetProdId = `concept-${String(active).padStart(2,'0')}`;
      if (window.GullySite && typeof window.GullySite.addToCart === 'function') {
        window.GullySite.addToCart(targetProdId, String(size), 1);
      }
    } catch (err) {
      console.warn('GullySite cart sync error:', err);
    }
    if(line){if(line.quantity>=99){resetAdd();addLabel.textContent='Bag limit reached';selection.textContent='Maximum quantity reached.';addTimer=setTimeout(resetAdd,1800);return;}line.quantity++;}else bag.push({id:active,size,quantity:1});
    save();clearTimeout(addTimer);add.classList.add('is-added');addLabel.textContent='In your bag';addHint.textContent=`${product.name} / EU ${sizeText(size)}`;flyToBag(product);

    addTimer=setTimeout(resetAdd,1800);selection.textContent=`${product.name} · EU ${sizeText(size)} added to your bag`;
  });
  function flyToBag(product){
    if(reducedMotion()){toggle.animate([{opacity:.5},{opacity:1}],{duration:100});return;}
    const cartTarget = document.querySelector('#cartTrigger') || toggle; const from=addSymbol.getBoundingClientRect(),to=cartTarget.getBoundingClientRect();
    const flight=node('div','bag-flight');SNEAKER_VISUAL.mount(flight,product.id);
    document.body.append(flight);flight.style.left=`${from.x+from.width/2-45}px`;flight.style.top=`${from.y+from.height/2-30}px`;
    const dx=to.x+to.width/2-(from.x+from.width/2),dy=to.y+to.height/2-(from.y+from.height/2);
    const trip=flight.animate([
      {transform:'translate(0,0) scale(.65)',opacity:0,offset:0},
      {transform:`translate(${dx*.15}px,${Math.min(-60,dy*.2)}px) scale(1)`,opacity:1,offset:.22},
      {transform:`translate(${dx*.75}px,${dy*.8-35}px) scale(.55)`,opacity:1,offset:.75},
      {transform:`translate(${dx}px,${dy}px) scale(.12)`,opacity:0,offset:1}
    ],{duration:680,easing:'cubic-bezier(.2,.65,.25,1)',fill:'forwards'});
    trip.finished.then(()=>{flight.remove();toggle.animate([{transform:'scale(1)'},{transform:'scale(1.12)',color:'#efa767'},{transform:'scale(1)'}],{duration:300});},()=>flight.remove());
  }
  for(const p of catalog){
    const label=node('div','holo-name',p.name);label.append(node('span','',`0${p.id}`.slice(-2)+' / STUDIO'));label.dataset.product=p.id;label.setAttribute('aria-hidden','true');
    const col=(p.id-1)%5,row=Math.floor((p.id-1)/5);
    label.style.left=`${SNEAKER_GEOMETRY.shelfCentersX[col]/5504*100}%`;label.style.top=`${row===0?46.7:80.8}%`;scene.insertBefore(label,document.querySelector('#forward'));labels.push(label);
  }
  function hover(n){labels.forEach(label=>label.classList.toggle('on',Number(label.dataset.product)===n));}
  function hide(){resetAdd();panel.hidden=true;panel.classList.remove('ready');active=null;hover(null);more.open=false;if(!bagPanel.hidden)closeBag();}
  function stage(n){
    const p=products.get(n);if(!p)return;
    active=n;kicker.textContent=`LAST DEPT. / ${String(n).padStart(2,'0')}`;title.textContent=p.name;description.textContent=p.description;color.textContent=p.color;price.textContent=priceText(p);design.textContent=p.details;selection.textContent='';more.open=false;
    sizeSelect.replaceChildren();const placeholder=node('option','','Select a size');placeholder.value='';placeholder.disabled=true;placeholder.selected=true;sizeSelect.append(placeholder);
    for(const size of p.sizes){const option=node('option','',`${sizeText(size)}`);option.value=String(size);sizeSelect.append(option);}
    resetAdd();add.disabled=true;if(sizes.has(n))selectSize(sizes.get(n));plane.scrollTop=0;hover(null);

  }
  function reveal(){
    if(active===null)return;
    if(!panel.hidden)return;
    panel.hidden=false;panel.classList.add('ready');

  }
  function show(n){stage(n);reveal();
  }
  window.SNEAKER_PRODUCT_SCENE={show,stage,reveal,hide,hover,getCart:()=>bag.map(l=>({...l}))};renderBag();
})();

;
'use strict';
const scene=document.querySelector('#scene'),forward=document.querySelector('#forward'),reverse=document.querySelector('#reverse');
const back=document.querySelector('#back'),status=document.querySelector('#status'),details=document.querySelector('#details'),destination=document.querySelector('#destination');
let mode='wall',prepared=null,wantBack=false,lastButton=null,pointer={x:-1,y:-1};
const leds=[],hits=[],pc=v=>`${v*100}%`;
function off(){leds.forEach(e=>e.classList.remove('on'));window.SNEAKER_PRODUCT_SCENE?.hover(null);}
function light(n){if(mode!=='wall')return;off();const lamp=leds[n-1];if(lamp&&!lamp.getAttribute('src'))lamp.src=`led_${n}.png`;lamp?.classList.add('on');window.SNEAKER_PRODUCT_SCENE?.hover(n);prepare(n);}
function prepare(n){
  if(prepared===n&&destination.dataset.viewShoe===String(n))return;
  prepared=n;SNEAKER_GEOMETRY.mount(destination,n);
  const trip=window.SNEAKER_LED_CAMERAS?.[n];
  const deliveryWidth=innerWidth*devicePixelRatio>1920?3840:1920;
  for(const [video,key] of [[forward,'forward'],[reverse,'reverse']]){
    video.pause();video.hidden=true;video.preload=key==='reverse'?'none':'auto';
    if(trip){video.src=`media-v15/camera-${String(n).padStart(2,'0')}-${key}-${deliveryWidth}.mp4`;video.load();}else{video.removeAttribute('src');video.load();}
  }
}
function reset(){
  window.SNEAKER_PRODUCT_SCENE?.hide();
  forward.pause();reverse.pause();forward.hidden=true;reverse.hidden=true;destination.hidden=true;
  mode='wall';scene.dataset.mode=mode;wantBack=false;off();hits.forEach(h=>h.disabled=false);
  back.hidden=true;details.hidden=false;status.textContent='Explore the collection. Select a silhouette.';
  lastButton?.focus({preventScroll:true});
  const under=document.elementFromPoint(pointer.x,pointer.y)?.closest('.hit');
  if(under)light(Number(under.dataset.shoe));
}
async function playVisible(video){
  if(video.readyState<2)await new Promise((resolve,reject)=>{
    const done=()=>{cleanup();resolve();},fail=()=>{cleanup();reject(new Error('video unavailable'));};
    const timer=setTimeout(fail,15000);
    const cleanup=()=>{clearTimeout(timer);video.removeEventListener('loadeddata',done);video.removeEventListener('error',fail);};
    video.addEventListener('loadeddata',done,{once:true});video.addEventListener('error',fail,{once:true});
  });
  video.currentTime=0;
  const frame=new Promise(resolve=>video.requestVideoFrameCallback?video.requestVideoFrameCallback(resolve):video.addEventListener('playing',resolve,{once:true}));
  await video.play();await frame;video.hidden=false;
}
function imageReady(image){
  // A reload can abort an earlier decode even when the replacement image loads.
  // Gate entry on the current image request, never on an abandoned decoder.
  if(image.complete)return image.naturalWidth?Promise.resolve():Promise.reject(new Error('image unavailable'));
  return new Promise((resolve,reject)=>{
    const cleanup=()=>{clearTimeout(timer);image.removeEventListener('load',done);image.removeEventListener('error',fail);};
    const done=()=>{cleanup();resolve();},fail=()=>{cleanup();reject(new Error('image unavailable'));};
    const timer=setTimeout(fail,15000);
    image.addEventListener('load',done,{once:true});image.addEventListener('error',fail,{once:true});
  });
}
async function enter(button){
  if(mode!=='wall')return;
  if(window.SNEAKER_MOBILE?.isMobile()){window.SNEAKER_MOBILE.select(Number(button.dataset.shoe));return;}
  const n=Number(button.dataset.shoe);
  if(!window.SNEAKER_LED_CAMERAS?.[n]){location.href=`detalle.html?n=${n}`;return;}
  prepare(n);mode='outbound';scene.dataset.mode=mode;lastButton=button;
  window.SNEAKER_PRODUCT_SCENE?.hide();
  window.SNEAKER_PRODUCT_SCENE?.stage(n);
  off();leds[n-1].classList.add('on');
  hits.forEach(h=>h.disabled=true);details.hidden=true;status.textContent='';
  try{await destination.qualityReady;await Promise.all([...destination.querySelectorAll('img')].map(imageReady));await playVisible(forward);if(!wantBack&&(mode==='outbound'||mode==='detail'))window.SNEAKER_PRODUCT_SCENE?.reveal();}catch(e){console.warn('Product view failed',e);reset();status.textContent='Unable to load this view. Please try again.';}
}
async function leave(){
  if(window.SNEAKER_MOBILE?.hasDetail()){window.SNEAKER_MOBILE.close();return;}
  if(mode==='outbound'){wantBack=true;return;}
  if(mode!=='detail')return;
  mode='inbound';scene.dataset.mode=mode;back.hidden=true;
  window.SNEAKER_PRODUCT_SCENE?.hide();
  try{reverse.preload='auto';await playVisible(reverse);destination.hidden=true;forward.hidden=true;}catch(e){reset();}
}
forward.addEventListener('ended',()=>{
  mode='detail';scene.dataset.mode=mode;destination.hidden=false;forward.hidden=true;back.hidden=false;
  if(!wantBack)window.SNEAKER_PRODUCT_SCENE?.reveal();
  if(wantBack)leave();
});
reverse.addEventListener('ended',reset);
back.addEventListener('click',leave);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]'))leave();});
document.addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY};});
document.addEventListener('mouseleave',()=>{pointer={x:-1,y:-1};if(mode==='wall')off();});
window.addEventListener('blur',()=>{if(mode==='wall')off();});
fetch('zonas.json').then(r=>{if(!r.ok)throw new Error('zones unavailable');return r.json();}).then(zones=>{
  window.SNEAKER_TILE_ZONES=zones;window.dispatchEvent(new Event('sneaker-zones-ready'));
  for(const z of zones){
    const led=new Image();led.alt='';led.className='led';
    Object.assign(led.style,{left:pc(z.led[0]),top:pc(z.led[1]),width:pc(z.led[2]),height:pc(z.led[3])});
    const hit=document.createElement('button');hit.className='hit';hit.dataset.shoe=z.n;
    const productName=window.SNEAKER_PRODUCTS?.[z.n-1]?.name||SNEAKER_GEOMETRY.names[z.n-1];
    hit.setAttribute('aria-label',`Explore ${productName}`);
    Object.assign(hit.style,{left:pc(z.hit[0]),top:pc(z.hit[1]),width:pc(z.hit[2]),height:pc(z.hit[3])});
    hit.addEventListener('pointerenter',()=>light(z.n));
    hit.addEventListener('pointerleave',()=>{if(mode==='wall')off();});
    hit.addEventListener('focus',()=>{if(hit.matches(':focus-visible'))light(z.n);});
    hit.addEventListener('blur',()=>{if(mode==='wall')off();});
    hit.addEventListener('click',()=>enter(hit));
    scene.insertBefore(led,forward);scene.insertBefore(hit,forward);leds.push(led);hits.push(hit);
  }
  scene.dataset.mode='wall';
}).catch(()=>status.textContent='Unable to load the collection.');

;
(() => {
  const studio=document.querySelector('#studio-dialog');
  document.querySelectorAll('[data-studio-open]').forEach(button=>button.addEventListener('click',()=>studio.showModal()));
  document.querySelector('.studio-close').addEventListener('click',()=>studio.close());
  const returnToCollection=()=>{
    if(document.querySelector('#scene').dataset.mode!=='wall')leave();
    else document.querySelector('#scene').focus({preventScroll:true});
  };
  document.querySelector('.studio-explore').addEventListener('click',()=>{studio.close();returnToCollection();});
  document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();returnToCollection();});
  document.querySelector('#details').addEventListener('click',event=>{event.preventDefault();returnToCollection();});
  const index=document.querySelector('.index-designs');
  for(const product of window.SNEAKER_PRODUCTS){
    const button=document.createElement('button');button.type='button';button.dataset.design=product.id;
    const number=document.createElement('span'),name=document.createElement('span'),arrow=document.createElement('span');
    number.className='index-number';number.textContent=String(product.id).padStart(2,'0');
    const shortName=product.name.replace(/\s\d+$/,'').toLowerCase();
    name.textContent=shortName[0].toUpperCase()+shortName.slice(1);arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
    button.append(number,name,arrow);button.setAttribute('aria-label',`Explore ${product.name}`);
    button.addEventListener('click',()=>{document.querySelector(`.hit[data-shoe="${product.id}"]`)?.click();lastButton=button;});
    button.addEventListener('pointerenter',()=>light(product.id));
    button.addEventListener('pointerleave',()=>{if(scene.dataset.mode==='wall')off();});
    button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))light(product.id);});
    button.addEventListener('blur',()=>{if(scene.dataset.mode==='wall')off();});
    index.append(button);
  }
  studio.addEventListener('click',event=>{
    if(event.target!==studio)return;
    const bounds=studio.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)studio.close();
  });
})();

;
(() => {
 const mobile=matchMedia('(max-width:760px)'),catalog=SNEAKER_PRODUCTS;
 const collection=document.createElement('section');collection.className='mobile-collection';collection.tabIndex=-1;collection.setAttribute('aria-label','Collection, ten silhouettes');
 const intro=document.createElement('header');intro.className='mobile-collection-heading';intro.innerHTML='<p>FOOTWEAR / SERIES 01</p><h1>A different<br>perspective.</h1><span>Tap a silhouette. Find your perspective.</span>';
 const wallImage=new Image(),lightImage=new Image();let wallReady,lightsReady;
 function warmWorld(){if(wallReady)return;wallImage.src='media-v18/mobile-wall.webp';lightImage.src='media-v18/mobile-lights.webp';wallReady=wallImage.decode();lightsReady=lightImage.decode();wallReady.catch(()=>{});lightsReady.catch(()=>{});}
 if(mobile.matches)warmWorld();
 const grid=document.createElement('div');grid.className='mobile-shelves';collection.append(intro,grid);document.body.insertBefore(collection,scene);
 const dock=document.createElement('aside');dock.className='mobile-selection';dock.hidden=true;dock.setAttribute('aria-label','Selected silhouette');
 const copy=document.createElement('div'),name=document.createElement('p'),price=document.createElement('span');copy.append(name,price);
 const open=document.createElement('button');open.type='button';open.textContent='View product';dock.append(copy,open);document.body.append(dock);
 let selected=null,opened=false,opening=false,closing=false,token=0,lastCard=null,pendingClose=false;
 const cards=new Map(),trips=new Set(),reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 const money=product=>new Intl.NumberFormat('en-IE',{style:'currency',currency:product.currency,maximumFractionDigits:0}).format(product.price);
 for(const product of catalog){
  const card=document.createElement('button');card.type='button';card.className='mobile-shoe';card.dataset.product=product.id;card.setAttribute('aria-pressed','false');
  const photo=document.createElement('div');photo.className='mobile-shoe-photo';
  const lamp=new Image();lamp.alt='';lamp.className='tile-led';if(mobile.matches)lamp.src='media-v18/mobile-lights.webp';Object.assign(lamp.style,{width:'200%',height:'625%',left:((product.id-1)%2)*-100+'%',top:Math.floor((product.id-1)/2)*-125+'%'});photo.append(lamp);
  const meta=document.createElement('div');meta.className='mobile-shoe-meta';const label=document.createElement('span'),cost=document.createElement('span');label.textContent=product.name;cost.textContent=money(product);meta.append(label,cost);card.append(photo,meta);grid.append(card);cards.set(product.id,card);
  let contact=null,ignoreClickUntil=0;
  card.addEventListener('pointerdown',event=>{
   if(event.pointerType!=='touch'||opened||opening)return;
   contact={id:event.pointerId,x:event.clientX,y:event.clientY};
   // Illuminate on contact, without waiting for touch release or any network work.
   for(const [id,item]of cards)item.setAttribute('aria-pressed',String(id===product.id));
  });
  const restoreLight=()=>{for(const [id,item]of cards)item.setAttribute('aria-pressed',String(id===selected));};
  card.addEventListener('pointercancel',()=>{contact=null;restoreLight();});
  card.addEventListener('pointerup',event=>{
   if(!contact||contact.id!==event.pointerId)return;
   const moved=Math.hypot(event.clientX-contact.x,event.clientY-contact.y);contact=null;
   ignoreClickUntil=performance.now()+800;
   if(moved>12){restoreLight();return;}
   event.preventDefault();
   // Commit the touch here: mobile browsers may consume the first synthetic
   // click when revealing a previously hidden selection control.
   if(selected===product.id)openDetail();else select(product.id);
  });
  card.addEventListener('click',event=>{
   if(event.detail!==0&&performance.now()<ignoreClickUntil)return;
   if(selected===product.id)openDetail();else select(product.id);
  });
 }
 function select(n){
  if(!mobile.matches||opened||opening)return;
  const product=catalog.find(p=>p.id===n);if(!product)return;selected=n;lastCard=cards.get(n);
  for(const [id,card]of cards)card.setAttribute('aria-pressed',String(id===n));

  name.textContent=product.name;price.textContent=product.color+' / '+money(product);dock.hidden=false;document.body.classList.add('has-mobile-selection');

 }
 function world(n){
  const node=document.createElement('div');node.className='mobile-world';
  const wall=wallImage.cloneNode();wall.alt='';wall.className='mobile-world-photo';
  const lights=new Image();lights.src='media-v18/mobile-lights.webp';lights.alt='';lights.className='mobile-world-lights';
  const col=(n-1)%2,row=Math.floor((n-1)/2);
  lights.style.clipPath=`inset(${row*20}% ${(1-col)*50}% ${(4-row)*20}% ${col*50}%)`;
  node.append(wall,lights);return node;
 }
 function mountWorld(n){
  const col=(n-1)%2,row=Math.floor((n-1)/2),node=world(n);
  Object.assign(node.style,{position:'absolute',width:'200%',height:4800/768*100+'%',left:-col*100+'%',top:-row*960/768*100+'%'});
  destination.replaceChildren(node);destination.dataset.viewShoe=n;
 }
 async function travel(from,to,n,returning=false){
  if(reduced())return;
  const bounds=grid.getBoundingClientRect(),q=bounds.width/2240,col=(n-1)%2,row=Math.floor((n-1)/2);
  const scale=to.width/(1120*q),tx=to.x-col*1120*q*scale-bounds.x*scale,ty=to.y-row*960*q*scale-bounds.y*scale;
  const layer=document.createElement('div');layer.className='mobile-camera-flight';Object.assign(layer.style,{inset:'0',width:'100vw',height:'100dvh'});
  const moving=world(n);Object.assign(moving.style,{position:'absolute',left:'0',top:'0',width:bounds.width+'px',height:bounds.height+'px',transformOrigin:'0 0'});layer.append(moving);document.body.append(layer);
  // Two compositor transforms form a moving viewport. Animating clip-path here
  // forced WebKit to repaint the entire tall wall on every camera frame.
  const cameraFrames=[],apertureFrames=[],sx=to.width/innerWidth,sy=to.height/innerHeight;
  for(let i=0;i<=32;i++){
   const t=i/32,ax=to.x*t,ay=to.y*t,aw=1+(sx-1)*t,ah=1+(sy-1)*t;
   const zoom=1+(scale-1)*t,wx=bounds.x*(1-t)+(bounds.x*scale+tx)*t,wy=bounds.y*(1-t)+(bounds.y*scale+ty)*t;
   cameraFrames.push({offset:t,transform:`translate3d(${(wx-ax)/aw}px,${(wy-ay)/ah}px,0) scale(${zoom/aw},${zoom/ah})`});
   apertureFrames.push({offset:t,transform:`translate3d(${ax}px,${ay}px,0) scale(${aw},${ah})`});
  }
  if(returning){cameraFrames.reverse();apertureFrames.reverse();for(let i=0;i<=32;i++){cameraFrames[i].offset=i/32;apertureFrames[i].offset=i/32;}}
  const options={duration:620,easing:'cubic-bezier(.32,.05,.2,1)',fill:'both'};
  layer.style.transformOrigin='0 0';
  const camera=moving.animate(cameraFrames,options);trips.add(camera);
  const aperture=layer.animate(apertureFrames,options);trips.add(aperture);
  try{await camera.finished;}catch{}finally{layer.remove();camera.cancel();aperture.cancel();trips.delete(camera);trips.delete(aperture);}
 }
 async function openDetail(){
  warmWorld();
  if(!selected||opened||opening)return;
  opening=true;const request=++token,n=selected;open.disabled=true;open.textContent='Opening';
  try{
   await Promise.all([wallReady,lightsReady]);if(request!==token||!mobile.matches)return;
   const source=lastCard.querySelector('.mobile-shoe-photo').getBoundingClientRect();
   forward.pause();reverse.pause();forward.hidden=true;reverse.hidden=true;mountWorld(n);prepared=null;
   opened=true;document.body.classList.add('mobile-detail','mobile-traveling');dock.hidden=true;scene.inert=false;collection.inert=true;
   mode='detail';scene.dataset.mode='detail';destination.hidden=true;back.hidden=false;details.hidden=true;off();SNEAKER_PRODUCT_SCENE.show(n);lastButton=lastCard;
   // Measure the same frame used by the final photograph. No generated in-between or photo swap.
   destination.hidden=false;const target=destination.getBoundingClientRect();destination.hidden=true;
   const wallScale=target.width/1120,col=(n-1)%2,row=Math.floor((n-1)/2);
   scene.style.backgroundImage='url(media-v18/wall-extended.webp)';scene.style.backgroundSize=`${2496*wallScale}px ${4800*wallScale}px`;
   scene.style.backgroundPosition=`${target.x-col*1120*wallScale}px ${target.y-row*960*wallScale}px`;scene.style.backgroundRepeat='repeat';
   await travel(source,target,n);
   if(request!==token)return;destination.hidden=false;document.body.classList.remove('mobile-traveling');back.focus({preventScroll:true});
  }catch(error){price.textContent='Unable to load. Tap to try again.';}
  finally{opening=false;open.disabled=false;open.textContent='View product';if(pendingClose){pendingClose=false;close();}}
 }
 async function close(){
  if(opening){pendingClose=true;return;}if(closing||!opened)return;
  closing=true;const request=++token;
  SNEAKER_PRODUCT_SCENE.hide();document.body.classList.add('mobile-traveling');
  const source=lastCard.querySelector('.mobile-shoe-photo').getBoundingClientRect(),target=destination.getBoundingClientRect();destination.hidden=true;
  await travel(source,target,selected,true);if(request!==token){closing=false;return;}
  opened=false;closing=false;document.body.classList.remove('mobile-detail','mobile-traveling');collection.inert=false;mode='wall';scene.dataset.mode='wall';scene.inert=mobile.matches;back.hidden=true;details.hidden=false;dock.hidden=!selected||!mobile.matches;
  if(mobile.matches)lastCard?.focus({preventScroll:true});
 }
 function sync(){
  if(mobile.matches){warmWorld();for(const lamp of grid.querySelectorAll('.tile-led'))if(!lamp.getAttribute('src'))lamp.src='media-v18/mobile-lights.webp';}
  token++;for(const trip of trips)trip.cancel();opened=false;opening=false;closing=false;pendingClose=false;document.body.classList.remove('mobile-detail','mobile-traveling');
  forward.pause();reverse.pause();forward.hidden=true;reverse.hidden=true;SNEAKER_PRODUCT_SCENE.hide();destination.hidden=true;mode='wall';scene.dataset.mode='wall';back.hidden=true;details.hidden=false;hits.forEach(hit=>hit.disabled=false);
  prepared=null;scene.inert=mobile.matches;collection.inert=!mobile.matches;dock.hidden=!mobile.matches||!selected;document.body.classList.toggle('has-mobile-selection',mobile.matches&&!!selected);off();
 }
 open.addEventListener('click',openDetail);
 document.querySelector('.skip-link')?.addEventListener('click',event=>{if(mobile.matches&&!opened){event.preventDefault();collection.focus({preventScroll:true});collection.scrollTop=0;}});
 window.SNEAKER_MOBILE={isMobile:()=>mobile.matches,hasDetail:()=>opened,select,close};mobile.addEventListener('change',sync);sync();
})();
