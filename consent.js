/* ============================================================
   META NEO · COOKIE CONSENT

   UK PECR requires prior consent before non-essential cookies are
   set, and refusing must be as easy as accepting. So GA4, the Meta
   Pixel and the Whop Pixel are NOT in the page markup — they live
   here and only run once someone has actually said yes.

   No choice stored  -> nothing loads, banner shown.
   "Accept"          -> all three load, choice remembered.
   "Reject"          -> nothing loads, choice remembered.
   Footer "Cookies"  -> reopens the banner so a choice can change.
   ============================================================ */
(function () {
  var KEY = 'mn_cookie_consent';
  var loaded = false;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  /* ---- the trackers, loaded only on consent ---- */
  function loadTrackers() {
    if (loaded) return;
    loaded = true;

    /* Google Analytics 4 */
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=G-18K8CPN87X';
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', 'G-18K8CPN87X');

    /* Meta Pixel */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init','999061072661691');fbq('track','PageView');

    /* Whop Pixel — snippet exactly as supplied by Whop */
    !function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_5Is5uNpJHKrYQ6");whop.track("page");
  }

  /* ---- banner ---- */
  function styles() {
    if (document.getElementById('mn-cc-style')) return;
    var s = document.createElement('style');
    s.id = 'mn-cc-style';
    s.textContent =
      '#mn-cc{position:fixed;left:0;right:0;bottom:0;z-index:9000;background:#0e1116;' +
      'border-top:1px solid rgba(255,255,255,.14);padding:18px 24px;' +
      'padding-bottom:calc(18px + env(safe-area-inset-bottom,0px));' +
      'display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap;' +
      "font-family:'Archivo',system-ui,sans-serif;color:#f3f5f8;box-shadow:0 -18px 44px -24px rgba(0,0,0,.9)}" +
      '#mn-cc p{margin:0;font-size:13.5px;line-height:1.6;color:#9aa2b1;max-width:620px}' +
      '#mn-cc a{color:#2fd6dd}' +
      '#mn-cc .mn-cc-btns{display:flex;gap:10px;flex-wrap:wrap}' +
      "#mn-cc button{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.06em;" +
      'padding:11px 20px;border-radius:3px;cursor:pointer;border:1px solid transparent;transition:.2s}' +
      '#mn-cc .mn-acc{background:#2fd6dd;color:#04211f}' +
      '#mn-cc .mn-acc:hover{background:#54e7ee}' +
      '#mn-cc .mn-rej{background:transparent;color:#f3f5f8;border-color:rgba(255,255,255,.3)}' +
      '#mn-cc .mn-rej:hover{border-color:#f3f5f8}' +
      '#mn-cc button:focus-visible{outline:2px solid #2fd6dd;outline-offset:2px}' +
      '@media(max-width:620px){#mn-cc{padding:16px 18px;gap:14px}#mn-cc .mn-cc-btns{width:100%}' +
      '#mn-cc button{flex:1 1 0}}';
    document.head.appendChild(s);
  }

  /* Reserve space for the bar so it never covers the control that has focus
     (WCAG 2.4.11), and keep that in step as the bar rewraps on resize. */
  var syncing = null;
  function reserve(bar) {
    function sync() {
      var h = bar.offsetHeight + 'px';
      document.body.style.paddingBottom = h;
      document.documentElement.style.scrollPaddingBottom = h;
    }
    sync();
    syncing = sync;
    addEventListener('resize', sync);
    addEventListener('orientationchange', sync);
  }
  function release() {
    document.body.style.paddingBottom = '';
    document.documentElement.style.scrollPaddingBottom = '';
    if (syncing) {
      removeEventListener('resize', syncing);
      removeEventListener('orientationchange', syncing);
      syncing = null;
    }
  }

  /* Rejecting after accepting must actually stop the processing, not merely
     decline to start more. Every sender on the site is guarded by
     typeof gtag/fbq === 'function', so clearing the globals silences all of
     them at once, with no reload and no per-page edits. */
  function stopTrackers() {
    try { window.gtag('consent', 'update', { ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied' }); } catch (e) {}
    try { window.fbq('consent', 'revoke'); } catch (e) {}
    try { window['ga-disable-G-18K8CPN87X'] = true; } catch (e) {}
    window.gtag = undefined; window.fbq = undefined; window.whop = undefined;
    loaded = false;
    /* drop the identifiers already on the device */
    try {
      var host = location.hostname, parts = host.split('.'), domains = ['', host];
      if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
      domains.push('.' + host);
      document.cookie.split(';').forEach(function (c) {
        var name = c.split('=')[0].trim();
        if (!/^(_ga|_gid|_gat|_fbp|_fbc|whop)/.test(name)) return;
        domains.forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      });
    } catch (e) {}
  }

  function close(bar) { release(); bar.remove(); }

  function show(current) {
    if (document.getElementById('mn-cc')) return;
    styles();
    var bar = document.createElement('div');
    bar.id = 'mn-cc';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-modal', 'false');
    bar.setAttribute('aria-label', 'Cookie choices');
    bar.innerHTML =
      '<p>We use cookies to measure how this site is used and how well our ads work. ' +
      'They are not needed for the site to function, so nothing is set unless you accept. ' +
      'You can change your mind any time from the Cookies link in the footer. ' +
      '<a href="policies.html#cookies">Read more</a>.</p>' +
      '<div class="mn-cc-btns">' +
      '<button type="button" class="mn-rej"' + (current === 'denied' ? ' aria-pressed="true"' : '') + '>Reject</button>' +
      '<button type="button" class="mn-acc"' + (current === 'granted' ? ' aria-pressed="true"' : '') + '>Accept</button>' +
      '</div>';
    document.body.appendChild(bar);
    reserve(bar);
    bar.querySelector('.mn-acc').addEventListener('click', function () {
      write('granted'); close(bar); loadTrackers(); flush();
    });
    bar.querySelector('.mn-rej').addEventListener('click', function () {
      write('denied'); stopTrackers(); close(bar);
    });
    /* Escape closes without changing a stored choice. */
    bar.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(bar); }
    });
    /* Announce it: consent is the first thing the page asks for, but the bar is
       appended last, so it would otherwise be the final stop in the tab order. */
    var first = bar.querySelector('button');
    if (first && current) { first.focus(); }
  }

  /* let the footer link reopen the choice */
  window.mnCookieSettings = function () { show(read()); };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.mn-cookies');
    if (!a) return;
    e.preventDefault();
    window.mnCookieSettings();
  });

  /* Code elsewhere on the page needs to send an event as soon as consent exists.
     Deferring everything to DOMContentLoaded would be too late: an inline script
     at the end of <body> runs BEFORE that, so gtag/fbq would not exist yet and
     its event would silently vanish. Hence a queue. */
  var queue = [];
  window.mnOnConsent = function (fn) {
    if (loaded) { try { fn(); } catch (e) {} return; }
    if (read() === 'granted') { loadTrackers(); try { fn(); } catch (e) {} return; }
    queue.push(fn);
  };
  function flush() {
    queue.splice(0).forEach(function (fn) { try { fn(); } catch (e) {} });
  }

  function start() {
    var c = read();
    /* Run synchronously: loadTrackers only touches document.head, which exists
       while the head is still parsing. Only the banner needs document.body. */
    if (c === 'granted') { loadTrackers(); flush(); return; }
    if (c === 'denied') { return; }
    if (document.body) { show(null); }
    else { document.addEventListener('DOMContentLoaded', function(){ show(null); }); }
  }
  start();
})();
