/* ============================================================
   META NEO · SIGNAL — shared behaviour
   ============================================================ */
(function(){
/* ---- background particle field ---- */
const c=document.getElementById('signal-bg');
if(c){
  const x=c.getContext('2d');let w,h,pts=[];
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function size(){w=c.width=innerWidth*devicePixelRatio;h=c.height=innerHeight*devicePixelRatio;build();}
  function build(){pts=[];const n=Math.min(110,Math.floor(w*h/30000));for(let i=0;i<n;i++)pts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.22*devicePixelRatio,vy:(Math.random()-.5)*.22*devicePixelRatio,r:Math.random()*1.5+.4});}
  function tick(){
    x.clearRect(0,0,w,h);
    for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;}
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const a=pts[i],b=pts[j];const dx=a.x-b.x,dy=a.y-b.y;const d=Math.hypot(dx,dy);if(d<150*devicePixelRatio){x.strokeStyle='rgba(47,214,221,'+(1-d/(150*devicePixelRatio))*.35+')';x.lineWidth=1;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();}}
    for(const p of pts){x.fillStyle='rgba(47,214,221,1)';x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill();}
    if(!reduce)requestAnimationFrame(tick);
  }
  size();tick();addEventListener('resize',size);
}

/* ---- nav scroll state ---- */
const nav=document.getElementById('nav');
if(nav)addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40));

/* ---- reveal on scroll ---- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));


/* ---- email capture → Mailchimp via hidden iframe, then redirect ---- */
document.addEventListener('submit',e=>{
  if(!e.target.matches('[data-capture]'))return;
  const email=(e.target.querySelector('input[type=email]')||{}).value||'';
  if(typeof fbq==='function')fbq('track','Lead',{content_name:'Free Guide'});
  if(typeof gtag==='function')gtag('event','generate_lead');
  setTimeout(()=>{ location.href='thank-you.html'+(email?'?email='+encodeURIComponent(email):''); },700);
});

/* ---- meter fill on view ---- */
const mio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('[data-fill]').forEach(b=>b.style.width=b.dataset.fill+'%');mio.unobserve(e.target);}}),{threshold:.3});
document.querySelectorAll('[data-meterwrap]').forEach(el=>mio.observe(el));

/* ---- analytics: Whop click → InitiateCheckout ---- */
document.addEventListener('click',function(e){
  const a=e.target.closest('a[href*="whop.com/metaneo"]');if(!a)return;
  const url=a.href;let value=0;
  if(url.includes('metaneoseries'))value=44.99;
  else if(url.includes('the-social-media-game-strategy')||url.includes('the-content-engine-playbook')||url.includes('the-algorithm-decoded'))value=19.99;
  if(typeof fbq==='function')fbq('track','InitiateCheckout',{value:value,currency:'GBP'});
  if(typeof gtag==='function')gtag('event','begin_checkout',{currency:'GBP',value:value});
});
})();
