/* ===== картинки на узлах ===== */
const IMAGES = [
  "https://cdn.prod.website-files.com/68afafd26a2e3b9a9615d6b4/68afbd77728ff63bc9b9c7f5_fedor7365__4e4fcc44-7364-459a-9f7c-dff5715f8cdf_auto_x2%20(1).jpg",
  "https://cdn.prod.website-files.com/68afafd26a2e3b9a9615d6b4/68afbafff751100585b4f003_fedor7365__f0cfabe1-3015-4f35-aa54-575bf0b0f390%20(1)_auto_x2.jpg",
  "https://cdn.prod.website-files.com/68afafd26a2e3b9a9615d6b4/68afba178fb41e08164edf0c_fedor7365__89bf57ea-da80-4efb-802e-3927c1ae8cc7.webp",
  "https://cdn.prod.website-files.com/68afafd26a2e3b9a9615d6b4/68afb87218e68447f39ddc36_0_1%20(60).webp",
];

/* ===== геометрия / доступ к DOM ===== */
const cx=500, cy=500, R_OUT=430, R_HOU=395, R_INN=300;
const IMG_SIDE=150, HALF=IMG_SIDE/2;

const svg   = document.getElementById('chart');
const rings = document.getElementById('rings');
const nodes = document.getElementById('nodes');
const glyphGp = document.getElementById('glyph-ring'); // не используем

const canvas = document.getElementById('aspectsCanvas');
const ctx = canvas.getContext('2d',{alpha:true});

/* если где-то остался старый крест/спицы — глушим */
const axesEl = document.getElementById('axes');
if (axesEl) axesEl.style.display = 'none';

/* ===== утилиты ===== */
const rand=(a,b)=>Math.random()*(b-a)+a;
const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
const pad2=n=>String(n).padStart(2,'0');
const deg2rad=d=>d*Math.PI/180;
const polar=(r,aDeg)=>{const a=deg2rad(aDeg);return [cx+r*Math.cos(a), cy+r*Math.sin(a)];};

/* ===== таблица под Shuffle — держим под кнопкой ===== */
function placePanelUnderShuffle(){
  const p=document.getElementById('astro-panel');
  const r=document.getElementById('shuffleImg').getBoundingClientRect();
  p.style.left=Math.max(8,Math.round(r.left))+'px';
  p.style.top =Math.round(r.bottom+8)+'px';
}
addEventListener('load',placePanelUnderShuffle);
addEventListener('resize',()=>requestAnimationFrame(placePanelUnderShuffle));
addEventListener('scroll',()=>requestAnimationFrame(placePanelUnderShuffle));

/* ===== кольца/подписи (SVG) ===== */
const ZOD_SIGNS=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const HOUSE_ROM=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
const PASTELS=["#f3c9cc","#f1e0a6","#cfe1b9","#bfe6e3","#ccd9f4","#e3c8f2","#f6d1b1","#f2e6b8","#d8efc5","#cfeff0","#d6e0fb","#edd7f8"];

function pathArc(cx,cy,r,s,e){
  const a0=deg2rad(s), a1=deg2rad(e);
  const p0=[cx+r*Math.cos(a0), cy+r*Math.sin(a0)];
  const p1=[cx+r*Math.cos(a1), cy+r*Math.sin(a1)];
  const large=((e-s)%360)>180?1:0;
  return `M ${p0[0]},${p0[1]} A ${r},${r} 0 ${large} 1 ${p1[0]},${p1[1]}`;
}
function buildRings(){
  rings.innerHTML='';
  const slice=360/12;

  // цветные сегменты
  for(let i=0;i<12;i++){
    const s=-90+i*slice, e=s+slice;
    const outer=pathArc(cx,cy,R_OUT,s,e);
    const inner=pathArc(cx,cy,R_HOU+6,e,s);
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',`${outer} L ${polar(R_HOU+6,e)[0]},${polar(R_HOU+6,e)[1]} ${inner} Z`);
    p.setAttribute('class','segment-fill');
    p.setAttribute('fill',PASTELS[i%12]);
    p.setAttribute('opacity','.85');
    rings.appendChild(p);
  }

  // границы сегментов
  for(let i=0;i<12;i++){
    const a=-90+i*slice;
    const [x1,y1]=polar(R_OUT,a), [x2,y2]=polar(R_HOU+6,a);
    const l=document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',x1); l.setAttribute('y1',y1);
    l.setAttribute('x2',x2); l.setAttribute('y2',y2);
    l.setAttribute('class','segment');
    rings.appendChild(l);
  }

  // знаки зодиака
  for(let i=0;i<12;i++){
    const a=-90+i*slice+slice/2; const [x,y]=polar(R_HOU-2,a);
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.textContent=ZOD_SIGNS[i];
    t.setAttribute('x',x); t.setAttribute('y',y);
    t.setAttribute('text-anchor','middle');
    t.setAttribute('dominant-baseline','middle');
    t.setAttribute('class','sign-label');
    rings.appendChild(t);
  }

  // делители домов
  for(let i=0;i<12;i++){
    const a=-90+i*slice;
    const [x1,y1]=polar(R_HOU,a), [x2,y2]=polar(R_INN+12,a);
    const l=document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',x1); l.setAttribute('y1',y1);
    l.setAttribute('x2',x2); l.setAttribute('y2',y2);
    l.setAttribute('class','segment house');
    rings.appendChild(l);
  }

  // римские цифры снаружи
  for(let i=0;i<12;i++){
    const a=-90+i*slice+slice/2; const [x,y]=polar(R_OUT+22,a);
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.textContent=HOUSE_ROM[i];
    t.setAttribute('x',x); t.setAttribute('y',y);
    t.setAttribute('text-anchor','middle');
    t.setAttribute('dominant-baseline','middle');
    t.setAttribute('class','house-label');
    rings.appendChild(t);
  }
}

/* ===== узлы-картинки (SVG) ===== */
let imgIndex=0; const nextImg=()=>IMAGES[(imgIndex++)%IMAGES.length];
function buildNodes(){
  nodes.innerHTML='';
  const count=8;
  for(let i=0;i<count;i++){
    const a=-90+i*(360/count); const [x,y]=polar(R_INN+70,a);

    const img=document.createElementNS('http://www.w3.org/2000/svg','image');
    img.setAttribute('href',nextImg());
    img.setAttribute('x',x-HALF); img.setAttribute('y',y-HALF);
    img.setAttribute('width',IMG_SIDE); img.setAttribute('height',IMG_SIDE);
    img.setAttribute('preserveAspectRatio','xMidYMid slice');

    const frame=document.createElementNS('http://www.w3.org/2000/svg','rect');
    frame.setAttribute('x',x-HALF); frame.setAttribute('y',y-HALF);
    frame.setAttribute('width',IMG_SIDE); frame.setAttribute('height',IMG_SIDE);
    frame.setAttribute('class','node-frame');

    nodes.appendChild(img);
    nodes.appendChild(frame);
  }
}

/* ===== ПИКСЕЛЬНЫЕ ЛИНИИ И СИМВОЛЫ ===== */
const AS_STYLES = {
  red:   { color:'#d74a3a', dash:null },
  green: { color:'#2aa05b', dash:null },
  blue:  { color:'#3a79d7', dash:[8,8] },
  gray:  { color:'#202020', dash:[2,6] }
};
const AS_KEYS = Object.keys(AS_STYLES);

/* внутренняя сетка для «лестницы» */
let viewScale = 2.6;    // немного тоньше, чем было
let internal = 0;

function resizeCanvasToSVG(){
  const rect = svg.getBoundingClientRect();
  canvas.style.width  = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  internal = Math.max(360, Math.round(1000 / viewScale));
  canvas.width  = internal;
  canvas.height = internal;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.imageSmoothingEnabled = false;
}
const toPx = v => Math.round(v * internal / 1000);
function put(x,y,color){ ctx.fillStyle=color; ctx.fillRect(x,y,1,1); }

/* Брезенхэм 1px + пунктир + ПРОПУСКИ (дырки) вокруг глифов */
function line1pxWithHoles(A,B,color,dashPattern,holesPx){
  let x0=toPx(A[0]), y0=toPx(A[1]);
  let x1=toPx(B[0]), y1=toPx(B[1]);
  const dx=Math.abs(x1-x0), sx=x0<x1?1:-1;
  const dy=-Math.abs(y1-y0), sy=y0<y1?1:-1;
  let err=dx+dy;

  const useDash=Array.isArray(dashPattern)&&dashPattern.length>0;
  let segIdx=0, segLeft=useDash?dashPattern[0]:Infinity, on=true;

  while(true){
    // «дыры» вокруг символов
    let blocked=false;
    if(holesPx && holesPx.length){
      for(const h of holesPx){
        const dxh=x0-h.x, dyh=y0-h.y;
        if(dxh*dxh+dyh*dyh <= h.r2){ blocked=true; break; }
      }
    }
    if(on && !blocked) put(x0,y0,color);

    if(x0===x1 && y0===y1) break;
    const e2=2*err;
    if(e2>=dy){ err+=dy; x0+=sx; }
    if(e2<=dx){ err+=dx; y0+=sy; }

    if(useDash){
      segLeft--;
      if(segLeft<=0){
        on=!on; segIdx=(segIdx+1)%dashPattern.length; segLeft=dashPattern[segIdx];
      }
    }
  }
}

/* круг 1px */
function circle1px(rUnits,color){
  const Cx=toPx(cx), Cy=toPx(cy);
  let r=toPx(rUnits);
  let x=r, y=0, err=0;
  while(x>=y){
    put(Cx+x, Cy+y, color);  put(Cx+y, Cy+x, color);
    put(Cx-y, Cy+x, color);  put(Cx-x, Cy+y, color);
    put(Cx-x, Cy-y, color);  put(Cx-y, Cy-x, color);
    put(Cx+y, Cy-x, color);  put(Cx+x, Cy-y, color);
    if(err<=0){ y++; err+=2*y+1; }
    if(err>0){ x--; err-=2*x+1; }
  }
}

/* ===== ПИКСЕЛЬНЫЕ ГЛИФЫ ===== */
const PLANETS = ["☉","☽","☿","♀","♂","♃","♄","♅","♆","♇","☊","☋"];
const PLANET_COLORS = ["#2aa05b","#d74a3a","#3a79d7","#7d3edc","#111111"]; // зел/крас/син/фиол/чёрный

// лёгкое «сужение» (эрозия): убираем одиночные пиксели
function thinImageData(img){
  const {data:wData, width:w, height:h} = img;
  const copy = new Uint8ClampedArray(wData); // snapshot
  const idx=(x,y)=> (y*w + x)*4 + 3;         // альфа
  for(let y=1;y<h-1;y++){
    for(let x=1;x<w-1;x++){
      const a = copy[idx(x,y)];
      if(a<10) continue;
      let n=0;
      if(copy[idx(x+1,y)]>10) n++;
      if(copy[idx(x-1,y)]>10) n++;
      if(copy[idx(x,y+1)]>10) n++;
      if(copy[idx(x,y-1)]>10) n++;
      if(n<=1){ // слишком одинокий пиксель — уберём
        wData[idx(x,y)] = 0;
      }
    }
  }
  return img;
}

/* делаем «битый» символ/текст в offscreen-канвасе */
function rasterTextCanvas(text, sizePx=18, color="#000", fontFallback='"Noto Sans Symbols2","Segoe UI Symbol","DejaVu Sans",sans-serif'){
  const off=document.createElement('canvas');
  const octx=off.getContext('2d',{alpha:true});
  octx.imageSmoothingEnabled=false;
  octx.font = `${sizePx}px ${fontFallback}`;
  octx.textBaseline='alphabetic';
  const m=octx.measureText(text);
  const asc=Math.ceil(m.actualBoundingBoxAscent||sizePx*0.8);
  const desc=Math.ceil(m.actualBoundingBoxDescent||sizePx*0.2);
  const pad=2;
  off.width  = Math.ceil(m.width)+pad*2;
  off.height = asc+desc+pad*2;

  octx.font = `${sizePx}px ${fontFallback}`;
  octx.fillStyle=color;
  octx.fillText(text, pad, pad+asc);

  const img=octx.getImageData(0,0,off.width,off.height);
  thinImageData(img); // чутка потоньше
  octx.putImageData(img,0,0);
  return off;
}

function makePixelGlyphCanvas(sym, sizePx=14, color="#000"){
  return rasterTextCanvas(sym,sizePx,color);
}

/* кладём символ в наши координаты (1000×1000), возвращаем «дырку» */
function drawPixelGlyph(sym, xUnit, yUnit, sizePx, color){
  const off = makePixelGlyphCanvas(sym,sizePx,color);
  const dx = toPx(xUnit) - Math.round(off.width/2);
  const dy = toPx(yUnit) - Math.round(off.height/2);
  ctx.drawImage(off, dx, dy);
  const r = Math.ceil(Math.hypot(off.width,off.height)/2) + 5; // побольше, чтобы линия точно прервалась
  return { x: dx + Math.round(off.width/2), y: dy + Math.round(off.height/2), r2: r*r };
}

/* рисуем немного глифов и собираем «дырки» */
function drawPlanetGlyphsAndReturnHoles(){
  const holesPx = [];

  // по окружности — немного
  const aroundCount = 8;
  const baseAngle = rand(0,360);
  for(let i=0;i<aroundCount;i++){
    const a = baseAngle + i*(360/aroundCount) + rand(-10,10);
    const [x,y]=polar(R_INN - 24, a);
    const hole = drawPixelGlyph(pick(PLANETS), x, y, 13, pick(PLANET_COLORS));
    holesPx.push(hole);
  }

  // и немного хаотичных внутри
  const insideCount = 8;
  for(let i=0;i<insideCount;i++){
    const r = rand(60, R_INN - 60);
    const a = rand(0,360);
    const [x,y]=polar(r,a);
    const hole = drawPixelGlyph(pick(PLANETS), x, y, 12, pick(PLANET_COLORS));
    holesPx.push(hole);
  }
  return holesPx;
}

/* ===== основной рендер пиксельного холста ===== */
function buildAspectsCanvas(){
  resizeCanvasToSVG();
  ctx.clearRect(0,0,internal,internal);

  // контуры окружностей (битые)
  const purple='#a03bbf', gray='#4a4a4a';
  circle1px(R_OUT, purple);
  circle1px(R_HOU+6, purple);
  circle1px(R_INN, gray);

  // БОЛЬШЕ НИКАКИХ СПИЦ/КРЕСТОВ — специально не рисуем радиальные линии

  // сначала пиксельные символы → дырки
  const holesPx = drawPlanetGlyphsAndReturnHoles();

  // аспекты (тонкие, с учётом дыр)
  const anchors=[]; const n=12;
  for(let i=0;i<n;i++){
    const a=-90+i*(360/n)+rand(-1.5,1.5);
    anchors.push(polar(R_INN-6, a));
  }
  const pairs=new Set();
  while(pairs.size<16){
    const i=Math.floor(Math.random()*n), j=Math.floor(Math.random()*n);
    if(i!==j) pairs.add(i<j?`${i}-${j}`:`${j}-${i}`);
  }
  pairs.forEach(key=>{
    const [i,j]=key.split('-').map(Number);
    const st = AS_STYLES[pick(AS_KEYS)];
    line1pxWithHoles(anchors[i], anchors[j], st.color, st.dash, holesPx);
  });

  // внутренняя пунктирная орбита
  const dots = 120, r = R_INN - 60;
  for(let i=0;i<dots;i++){
    const a = i*(360/dots);
    const [x,y] = polar(r,a);
    put(toPx(x), toPx(y), '#202020');
  }
}

/* ===== Таблица ===== */
const ITEMS=[
  {sym:"☉",tag:""},{sym:"☽",tag:""},{sym:"☿",tag:""},
  {sym:"♀",tag:""},{sym:"♂",tag:""},{sym:"♃",tag:""},
  {sym:"♄",tag:"R"},{sym:"♅",tag:""},{sym:"♆",tag:"R"},
  {sym:"♇",tag:"R"},{sym:"☊",tag:""},{sym:"☋",tag:""}
];
function rndAngle(){ const d=Math.floor(rand(0,30)), m=Math.floor(rand(0,60)), s=Math.floor(rand(0,60)); return `${d}°${pad2(m)}′${pad2(s)}″`; }

function buildAstroTable(){
  const tbl=document.getElementById('astro-table'); tbl.innerHTML='';
  const start=Math.floor(rand(0,12));
  ITEMS.forEach((it,k)=>{
    const tr=document.createElement('tr');

    // «битый» символ
    const symTd=document.createElement('td'); symTd.className='sym';
    const symCanvas = rasterTextCanvas(it.sym, 22, pick(PLANET_COLORS));
    const symImg = document.createElement('img');
    symImg.src = symCanvas.toDataURL();
    symImg.width = symCanvas.width*2;
    symImg.height= symCanvas.height*2;
    symImg.style.imageRendering='pixelated';
    symTd.appendChild(symImg);

    // «битый» текст (угол + знак), и «R» если нужно — тоже пиксельно
    const txtTd=document.createElement('td'); txtTd.className='txt';
    const text = `${rndAngle()}  ${ZOD_SIGNS[(start+k)%12]}`;
    const lineCanvas = rasterTextCanvas((it.tag?'R ':'') + text, 18, '#0f0f0f', '"IBM Plex Sans","Arial",sans-serif');
    const lineImg = document.createElement('img');
    lineImg.src = lineCanvas.toDataURL();
    lineImg.width = lineCanvas.width*2;
    lineImg.height= lineCanvas.height*2;
    lineImg.style.imageRendering='pixelated';
    txtTd.appendChild(lineImg);

    tr.appendChild(symTd); tr.appendChild(txtTd); tbl.appendChild(tr);
  });
}

/* ===== Сборка и Shuffle ===== */
function buildAll(){
  buildRings();
  buildNodes();
  glyphGp.innerHTML='';
  buildAstroTable();
  buildAspectsCanvas();
  placePanelUnderShuffle();
}
buildAll();

document.getElementById('shuffle').addEventListener('click', ()=>{
  // картинки
  const shuffled=IMAGES.slice().sort(()=>Math.random()-0.5);
  nodes.querySelectorAll('image').forEach((img,i)=>img.setAttribute('href', shuffled[i%shuffled.length]));
  // пересборка пикселей/таблицы
  buildAstroTable();
  buildAspectsCanvas();
  placePanelUnderShuffle();
});

addEventListener('resize', ()=>{ buildAspectsCanvas(); });
