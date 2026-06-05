/* Potential compass mark — inline SVG generator + auto-hydrate.
   Needs compass.css. The mark spins (ticks + star counter-rotate as stacked HTML layers).
   Usage (plain HTML): <span class="compass" data-compass="120"></span>
   Usage (JS/React):   el.innerHTML = compassMarkup(120)  /  {__html: compassMarkup(120)} */
(function(){
  var C=100, GOLD_L="#EFD2A0", GOLD_D="#C99A4E", DIM="rgba(226,181,107,.34)", HUB="#E2B56B";
  function pt(a,r){var t=a*Math.PI/180;return [(C+r*Math.sin(t)).toFixed(2),(C-r*Math.cos(t)).toFixed(2)];}
  function ring(R,sw,col){return '<circle cx="100" cy="100" r="'+R+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'"/>';}
  function tickRing(n,R,len,sw,col,cardLen){var s="";for(var i=0;i<n;i++){var a=i*360/n;var L=(cardLen&&i%(n/4)===0)?cardLen:len;var p1=pt(a,R),p2=pt(a,R-L);s+='<line x1="'+p1[0]+'" y1="'+p1[1]+'" x2="'+p2[0]+'" y2="'+p2[1]+'" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round"/>';}return s;}
  function point(a,L,w,sh){var t=a*Math.PI/180,dx=Math.sin(t),dy=-Math.cos(t),px=Math.cos(t),py=Math.sin(t);
    var bx=C+dx*sh,by=C+dy*sh,tx=(C+dx*L).toFixed(2),ty=(C+dy*L).toFixed(2);
    var sL=(bx-px*w).toFixed(2)+" "+(by-py*w).toFixed(2), sR=(bx+px*w).toFixed(2)+" "+(by+py*w).toFixed(2);
    return '<path d="M100 100 L'+sL+' L'+tx+' '+ty+' Z" fill="'+GOLD_L+'"/><path d="M100 100 L'+tx+' '+ty+' L'+sR+' Z" fill="'+GOLD_D+'"/>';}
  function star(cardL,diagL,w){var s="";[0,90,180,270].forEach(function(a){s+=point(a,cardL,w,cardL*0.3);});[45,135,225,315].forEach(function(a){s+=point(a,diagL,w*0.78,diagL*0.32);});return s;}
  function hub(r){return '<circle cx="100" cy="100" r="'+r+'" fill="'+HUB+'"/><circle cx="100" cy="100" r="'+(r*0.4).toFixed(2)+'" fill="#0B0E16"/>';}

  // FINAL mark — Option B, bigger star, no N/E/S/W
  var TICKS = ring(94,1,DIM)+tickRing(72,92,5,1,DIM,11);
  var INNER = ring(74,0.9,DIM);
  var STAR  = star(66,40,9);
  var HUBM  = hub(6.5);
  function svg(inner){return '<svg viewBox="0 0 200 200" fill="none" aria-hidden="true">'+inner+'</svg>';}

  // inner layers (assumes a sized, position:relative parent)
  function layers(){
    return '<span class="cmp-layer cmp-ticks">'+svg(TICKS)+'</span>'+
           '<span class="cmp-layer">'+svg(INNER)+'</span>'+
           '<span class="cmp-layer cmp-star">'+svg(STAR+HUBM)+'</span>';
  }
  // full self-sizing mark (use in React / innerHTML)
  function markup(size){
    size = size || 120;
    return '<span class="compass" style="width:'+size+'px;height:'+size+'px">'+layers()+'</span>';
  }
  window.compassLayers = layers;
  window.compassMarkup = markup;

  function hydrate(){
    document.querySelectorAll('.compass[data-compass]').forEach(function(el){
      if(el.dataset.cmpDone) return;
      var s = parseFloat(el.dataset.compass)||120;
      el.style.width=s+"px"; el.style.height=s+"px";
      el.innerHTML = layers();
      el.dataset.cmpDone="1";
    });
  }
  window.hydrateCompass = hydrate;
  if(document.readyState!=="loading") hydrate();
  else document.addEventListener("DOMContentLoaded", hydrate);
})();
