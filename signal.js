/* ============================================================
   META NEO · SIGNAL — shared behaviour
   ============================================================ */
(function(){
/* ---- background particle field ---- */
const c=document.getElementById('signal-bg');
if(c){
  const x=c.getContext('2d');let w,h,cw,ch,R,R2,pts=[];
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  /* Cap the backing store and derive density from CSS area, not device pixels.
     Keying both off devicePixelRatio made a 3x phone do far MORE work than a
     desktop: more points, more pairs, four times the fill area. */
  const dpr=Math.min(window.devicePixelRatio||1,1.5);
  const BANDS=4;
  function size(){cw=innerWidth;ch=innerHeight;w=c.width=Math.round(cw*dpr);h=c.height=Math.round(ch*dpr);R=150*dpr;R2=R*R;build();}
  function build(){pts=[];const n=Math.min(110,Math.floor(cw*ch/8000));for(let i=0;i<n;i++)pts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.22*dpr,vy:(Math.random()-.5)*.22*dpr,r:Math.random()*1.5+.4});}
  function tick(){
    x.clearRect(0,0,w,h);
    for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;}
    /* Bucket links by alpha so each band is one strokeStyle and one stroke(),
       instead of a colour-string parse and a draw call per link. */
    const bands=[];for(let b=0;b<BANDS;b++)bands.push([]);
    for(let i=0;i<pts.length;i++){const a=pts[i];
      for(let j=i+1;j<pts.length;j++){const b2=pts[j];const dx=a.x-b2.x,dy=a.y-b2.y;const d2=dx*dx+dy*dy;
        if(d2<R2){const t=1-Math.sqrt(d2)/R;let k=(t*BANDS)|0;if(k>=BANDS)k=BANDS-1;bands[k].push(a.x,a.y,b2.x,b2.y);}}}
    x.lineWidth=1;
    for(let b=0;b<BANDS;b++){const seg=bands[b];if(!seg.length)continue;
      x.strokeStyle='rgba(47,214,221,'+(((b+0.5)/BANDS)*.35).toFixed(3)+')';
      x.beginPath();
      for(let i=0;i<seg.length;i+=4){x.moveTo(seg[i],seg[i+1]);x.lineTo(seg[i+2],seg[i+3]);}
      x.stroke();}
    x.fillStyle='rgba(47,214,221,1)';
    x.beginPath();
    for(const p of pts){x.moveTo(p.x+p.r,p.y);x.arc(p.x,p.y,p.r,0,7);}
    x.fill();
    if(!reduce)requestAnimationFrame(tick);
  }
  /* Under reduced motion the loop does not run, so a resize must repaint once —
     otherwise the field vanishes for good the first time a phone's URL bar moves. */
  size();tick();let _rt;addEventListener('resize',function(){clearTimeout(_rt);_rt=setTimeout(function(){size();if(reduce)tick();},150);});
}

/* ---- nav scroll state ---- */
const nav=document.getElementById('nav');
if(nav)addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40));

/* ---- mobile menu ----
   Built from the page's own .nav-links so each page's menu matches its nav and
   no page has to carry a second copy of the markup. Anchors styled as buttons
   (the Whop CTA, "Need help?") become the full-width action at the foot of the
   panel; everything else becomes a row. */
(function(){
  const bar=document.querySelector('header.nav .nav-in');
  const links=document.querySelector('header.nav .nav-links');
  if(!bar||!links)return;
  const all=Array.from(links.querySelectorAll('a'));
  if(!all.length)return;
  const ctas=all.filter(a=>a.classList.contains('btn'));
  const rows=all.filter(a=>!a.classList.contains('btn'));

  const burger=document.createElement('button');
  burger.type='button';
  burger.className='burger';
  burger.setAttribute('aria-label','Open menu');
  burger.setAttribute('aria-expanded','false');
  burger.setAttribute('aria-controls','mn-menu');
  burger.innerHTML='<i aria-hidden="true"></i>';
  bar.appendChild(burger);

  const panel=document.createElement('div');
  panel.id='mn-menu';
  panel.hidden=false;
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-modal','true');
  panel.setAttribute('aria-label','Menu');

  const top=document.createElement('div');
  top.className='mn-m-top';
  const brand=document.querySelector('header.nav .brand');
  if(brand){
    const c=brand.cloneNode(true);
    c.removeAttribute('href');
    top.appendChild(c);
  }else{
    top.appendChild(document.createElement('span'));
  }
  const close=document.createElement('button');
  close.type='button';
  close.className='mn-m-x';
  close.setAttribute('aria-label','Close menu');
  close.innerHTML='&times;';
  top.appendChild(close);
  panel.appendChild(top);

  const list=document.createElement('nav');
  list.className='mn-m-links';
  function row(href,label){
    const l=document.createElement('a');
    l.href=href;
    l.innerHTML='<span>'+label+'</span><span class="mn-ch" aria-hidden="true">&rsaquo;</span>';
    list.appendChild(l);
  }
  rows.forEach(a=>row(a.getAttribute('href'),a.textContent.trim()));
  /* The nav bars are short — two links on most pages — so the panel also carries
     the legal page, which is in every footer but no nav. Skipped when the nav
     already links it or we are already on it. */
  const here=location.pathname.split('/').pop()||'index.html';
  if(here!=='policies.html'&&!rows.some(a=>(a.getAttribute('href')||'').indexOf('policies.html')>-1)){
    row('policies.html','Legal');
  }
  panel.appendChild(list);

  const foot=document.createElement('div');
  foot.className='mn-m-foot';
  ctas.forEach(a=>foot.appendChild(a.cloneNode(true)));
  const note=document.createElement('span');
  note.className='mn-m-note';
  note.textContent='Instant download · one-time payment';
  foot.appendChild(note);
  panel.appendChild(foot);
  const wrap=document.createElement('div');
  wrap.id='mn-menu-wrap';
  wrap.appendChild(panel);
  document.body.appendChild(wrap);

  let lastFocus=null;
  function open(){
    lastFocus=document.activeElement;
    wrap.classList.add('open');
    document.body.classList.add('mn-open');
    burger.setAttribute('aria-expanded','true');
    close.focus();
    document.addEventListener('keydown',onKey);
  }
  function shut(){
    wrap.classList.remove('open');
    document.body.classList.remove('mn-open');
    burger.setAttribute('aria-expanded','false');
    document.removeEventListener('keydown',onKey);
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  function onKey(e){
    if(e.key==='Escape'){shut();return;}
    if(e.key!=='Tab')return;
    /* Keep Tab inside the panel while it is open. */
    const f=panel.querySelectorAll('a[href],button');
    if(!f.length)return;
    const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
  burger.addEventListener('click',open);
  close.addEventListener('click',shut);
  /* A same-page jump link leaves the panel covering the target, so close on any
     link tap. Links to another page close it harmlessly on the way out. */
  list.addEventListener('click',e=>{if(e.target.closest('a'))shut();});
  foot.addEventListener('click',e=>{if(e.target.closest('a'))shut();});
  /* Resizing past the breakpoint with the panel open would leave the page
     scroll-locked behind a hidden panel. */
  addEventListener('resize',()=>{if(innerWidth>900&&wrap.classList.contains('open'))shut();});
})();

/* ---- reveal on scroll ---- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));


/* ---- email capture → Mailchimp via hidden iframe, then redirect ---- */
document.addEventListener('submit',e=>{
  if(!e.target.matches('[data-capture]'))return;
  /* The email is NOT put in the redirect URL. thank-you.html never read it, and a
     query string ends up in GA4 page_location, in the Meta referrer and in logs —
     sending personal data to Analytics breaches Google's own terms. */
  if(typeof fbq==='function')fbq('track','Lead',{content_name:'Free Guide'});
  if(typeof gtag==='function')gtag('event','generate_lead');
  setTimeout(()=>{ location.href='thank-you.html'; },700);
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
  /* Bare storefront links (footer, review links) are not a checkout. Firing a £0
     InitiateCheckout for them pollutes GA4 and Meta with phantom intent. */
  if(!value)return;
  if(typeof fbq==='function')fbq('track','InitiateCheckout',{value:value,currency:'GBP'});
  if(typeof gtag==='function')gtag('event','begin_checkout',{currency:'GBP',value:value});
});
})();
