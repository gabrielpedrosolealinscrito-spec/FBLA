/* compass.jsx — procedural compass marks for Potential. Exports CompassMark, Stars. */
const GOLD="#E2B56B", GOLD_L="#EFD2A0", GOLD_D="#C99A4E", GOLD_DIM="rgba(226,181,107,.32)", IVORY="rgba(243,237,225,.6)";
const C=100;

const rad = a => a*Math.PI/180;
function pt(a,r){ return [ +(C+r*Math.sin(rad(a))).toFixed(2), +(C-r*Math.cos(rad(a))).toFixed(2) ]; }

/* interlocking-circle rosette (the "waves") */
function rosette(n,R,r,sw,col){
  let s="";
  for(let i=0;i<n;i++){ const [x,y]=pt(i*360/n,R); s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}"/>`; }
  return s;
}
function ring(R,sw,col,dash){ return `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${col}" stroke-width="${sw}"${dash?` stroke-dasharray="${dash}"`:""}/>`; }

function tickRing(n,R,len,sw,col,cardLen){
  let s="";
  for(let i=0;i<n;i++){ const a=i*360/n; const L=(cardLen&&i%(n/4)===0)?cardLen:len;
    const [x1,y1]=pt(a,R); const [x2,y2]=pt(a,R-L);
    s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`; }
  return s;
}

/* one faceted compass point (kite) — two triangles, light & dark */
function point(a,L,w,sh,facet){
  const t=rad(a), dx=Math.sin(t), dy=-Math.cos(t), px=Math.cos(t), py=Math.sin(t);
  const bx=C+dx*sh, by=C+dy*sh, tx=C+dx*L, ty=C+dy*L;
  const sL=[(bx-px*w).toFixed(2),(by-py*w).toFixed(2)], sR=[(bx+px*w).toFixed(2),(by+py*w).toFixed(2)];
  const tip=[tx.toFixed(2),ty.toFixed(2)];
  if(facet){
    return `<path d="M${C} ${C} L${sL} L${tip} Z" fill="${GOLD_L}"/>`+
           `<path d="M${C} ${C} L${tip} L${sR} Z" fill="${GOLD_D}"/>`;
  }
  return `<path d="M${C} ${C} L${sL} L${tip} L${sR} Z" fill="none" stroke="${GOLD}" stroke-width="1.4" stroke-linejoin="round"/>`;
}
function star(cardL,diagL,w,facet){
  let s="";
  [0,90,180,270].forEach(a=>s+=point(a,cardL,w,cardL*0.3,facet));
  [45,135,225,315].forEach(a=>s+=point(a,diagL,w*0.78,diagL*0.32,facet));
  return s;
}
function starburst(cardL,diagL,minorL){
  let s=star(cardL,diagL,8,true);
  // 8 thin minor spikes between
  [22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].forEach(a=>{
    const [x2,y2]=pt(a,minorL); s+=`<line x1="100" y1="100" x2="${x2}" y2="${y2}" stroke="${GOLD_DIM}" stroke-width="1.1"/>`; });
  return s;
}
function needle(L,w){
  // north (gold) + south (dim) slim diamond
  const n=point(0,L,w,L*0.0,true).replace(GOLD_L,GOLD).replace(GOLD_D,GOLD_D);
  const t=rad(180), dx=Math.sin(t),dy=-Math.cos(t),px=Math.cos(t),py=Math.sin(t);
  const sh=0, bx=C,by=C,tx=C+dx*L*0.78,ty=C+dy*L*0.78;
  const south=`<path d="M${C} ${C} L${(bx-px*w).toFixed(2)} ${(by-py*w).toFixed(2)} L${tx.toFixed(2)} ${ty.toFixed(2)} L${(bx+px*w).toFixed(2)} ${(by+py*w).toFixed(2)} Z" fill="rgba(226,181,107,.28)"/>`;
  // build north as faceted diamond
  const t2=rad(0), d2x=Math.sin(t2),d2y=-Math.cos(t2),p2x=Math.cos(t2),p2y=Math.sin(t2);
  const ntx=C+d2x*L, nty=C+d2y*L;
  const nL=[(C-p2x*w).toFixed(2),(C-p2y*w).toFixed(2)], nR=[(C+p2x*w).toFixed(2),(C+p2y*w).toFixed(2)];
  const north=`<path d="M${C} ${C} L${nL} L${ntx.toFixed(2)} ${nty.toFixed(2)} Z" fill="${GOLD_L}"/>`+
              `<path d="M${C} ${C} L${ntx.toFixed(2)} ${nty.toFixed(2)} L${nR} Z" fill="${GOLD_D}"/>`;
  return south+north;
}
function hub(r){ return `<circle cx="100" cy="100" r="${r}" fill="${GOLD}"/><circle cx="100" cy="100" r="${r*0.42}" fill="#0B0E16"/>`; }
function cardinals(R){
  return ["N","E","S","W"].map((c,i)=>{ const [x,y]=pt(i*90,R);
    return `<text x="${x}" y="${y}" fill="${IVORY}" font-family="'JetBrains Mono',monospace" font-size="11" text-anchor="middle" dominant-baseline="central">${c}</text>`;}).join("");
}

function Layer({html,spin,dur}){
  return <div className={"layer"+(spin?" "+spin:"")} style={dur?{animationDuration:dur}:null}>
    <svg viewBox="0 0 200 200" dangerouslySetInnerHTML={{__html:html}}/>
  </div>;
}

/* kind → ordered layers */
function layersFor(kind){
  switch(kind){
    case "A": return [
      {html:rosette(20,86,14,1,GOLD_DIM), spin:"cw", dur:"34s"},
      {html:ring(64,1,GOLD_DIM)},
      {html:star(58,34,8,true), spin:"ccw", dur:"48s"},
      {html:hub(6)},
    ];
    case "B": return [
      {html:ring(92,1,GOLD_DIM)+tickRing(72,90,5,1,GOLD_DIM,11), spin:"ccw", dur:"90s"},
      {html:ring(58,0.9,GOLD_DIM)},
      {html:cardinals(78)},
      {html:star(50,28,7,true), spin:"cw", dur:"40s"},
      {html:hub(5.5)},
    ];
    case "C": return [
      {html:ring(91,0.9,GOLD_DIM)+tickRing(60,90,3.4,0.9,GOLD_DIM), spin:"ccw", dur:"64s"},
      {html:ring(70,0.8,GOLD_DIM)},
      {html:starburst(74,46,58), spin:"cw", dur:"52s"},
      {html:hub(5)},
    ];
    case "D": return [
      {html:rosette(22,84,18,1.3,GOLD), spin:"cw", dur:"28s"},
      {html:ring(44,1,GOLD_DIM)},
      {html:needle(40,8.5), spin:"cw", dur:"9s"},
      {html:hub(6)},
    ];
    case "E": return [
      {html:ring(88,0.8,GOLD_DIM)+ring(80,0.8,GOLD_DIM)+tickRing(4,88,12,1.1,GOLD_DIM)},
      {html:needle(64,6), spin:"cw", dur:"20s"},
      {html:hub(5)},
    ];
    default: return [];
  }
}

function CompassMark({kind,size=200}){
  const layers = layersFor(kind);
  return <span className="mark" style={{width:size,height:size}}>
    {layers.map((l,i)=><Layer key={i} html={l.html} spin={l.spin} dur={l.dur}/>)}
  </span>;
}

/* subtle star field (stable positions) */
const STARDOTS = (()=>{ let r=7; const rnd=()=>{ r=(r*9301+49297)%233280; return r/233280; };
  return Array.from({length:26},()=>({x:rnd()*100,y:rnd()*100,tw:rnd()>0.6})); })();
function Stars(){
  return <div className="stars">{STARDOTS.map((s,i)=>
    <i key={i} className={s.tw?"t":""} style={{left:s.x+"%",top:s.y+"%",animationDelay:(i%5)+"s"}}/>)}</div>;
}

Object.assign(window,{CompassMark,Stars});
