// Scales the fixed-size .post canvas to fit the viewport, letterboxed.
(function(){
  function fit(){
    var post = document.querySelector('.post');
    var stage = document.querySelector('.stage');
    if(!post||!stage) return;
    var w = post.offsetWidth, h = post.offsetHeight;
    var s = Math.min(window.innerWidth/w, window.innerHeight/h);
    post.style.transform = 'scale('+s+')';
    stage.style.width = (w*s)+'px';
    stage.style.height = (h*s)+'px';
  }
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  document.addEventListener('DOMContentLoaded', fit);
  fit();
})();
