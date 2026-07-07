/*
  HPC PWA release note:
  When publishing a new app version, update CACHE_VERSION to the next value
  (for example: hpc-cache-v2, hpc-cache-v3). During activate, this service
  worker deletes older HPC caches so users do not stay stuck on old files.
  This does not touch localStorage, where the user's app data is stored.
*/
const CACHE_VERSION = 'hpc-cache-v90';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/real-data.js?v=hpc-cache-v74',
  './assets/supabase-config.js',
  './assets/supabase.js',
  './assets/health-parser.js?v=hpc-cache-v86',
  './assets/hpc-logo.png',
  './assets/hpc-wordmark.svg',
  './assets/hpc-wordmark.png',
  './assets/featured-workout.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

const UI_POLISH_BOOTSTRAP = `
(function(){
  var css = [
    ':root{--hpc-page:#F7F7F5;--hpc-card:#FFFFFF;--hpc-border:#E6E7EB;--hpc-text:#0F1115;--hpc-muted:#667085;--hpc-soft:#F2F4F7;--hpc-shadow:0 12px 30px rgba(15,23,42,.055),0 1px 2px rgba(15,23,42,.06)}',
    'html,body{background:var(--hpc-page)!important;color:var(--hpc-text)!important}',
    'body:before{display:none!important}',
    'button,input,textarea,select{font-family:inherit}',
    '.card,.score-card,.qcard,.daily-log-btn,.sync-bar-static,.program-card,.profile-card,.xp-card,.prof-body-stats,.weekly-goal-card,.sync-device-row,.stats-panel,.habit-row,.log-card{background:var(--hpc-card)!important;border-color:var(--hpc-border)!important;box-shadow:var(--hpc-shadow)!important}',
    'header{background:rgba(247,247,245,.96)!important;border-bottom:1px solid var(--hpc-border)!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}',
    '.logo{width:auto!important;height:38px!important;min-width:130px!important;background:transparent!important;box-shadow:none!important;justify-content:flex-start!important}',
    '.logo img{width:auto!important;height:27px!important;max-width:178px!important;object-fit:contain!important;object-position:left center!important}',
    '#sidebar{background:var(--hpc-card)!important;border-right:1px solid var(--hpc-border)!important}',
    '#sidebar .sb-brand{justify-content:flex-start!important;padding-left:28px!important}',
    '#sidebar .sbn{border-radius:16px!important;margin:4px 14px!important;min-height:56px!important;font-weight:760!important}',
    '#sidebar .sbn.active{background:#F2F4F7!important;color:#0F1115!important}',
    '#sidebar .sbn span:last-child{font-weight:760!important}',
    'nav button{font-size:10.5px!important;gap:3px!important}',
    'nav button .ico{margin-bottom:2px!important}',
    '.sync-device-row.is-coming-soon{opacity:.72;cursor:default!important}',
    '.sync-device-row.is-coming-soon .sdr-chev{display:none!important}',
    '.sync-device-row.is-coming-soon .sdr-status{color:#98A2B3!important}',
    '.sync-device-row.is-coming-soon .sdr-dot{background:#98A2B3!important}',
    '.sync-device-row.apple-health-priority .sdr-status span:last-child{color:#14B8A6!important}',
    '#modalAppleHealth .modal h3:after{content:"Importação manual é o fluxo recomendado agora";display:block;margin-top:5px;font-size:12px;line-height:1.35;color:#667085;font-weight:500}',
    '#modalAppleHealth .ah-instructions{background:#F8FAFC!important;border:1px solid var(--hpc-border)!important;border-radius:14px!important;padding:12px 14px!important}',
    '@media (min-width:1024px){body{padding-left:342px!important;padding-bottom:0!important;background:var(--hpc-page)!important}header{display:none!important}main{max-width:1180px!important;margin:0 auto!important;padding:32px 36px 64px!important}#t-hoje main{display:grid!important;grid-template-columns:minmax(0,1fr) 380px!important;grid-template-areas:"greeting greeting" "score quick" "daily sync"!important;gap:18px 22px!important;align-items:stretch!important}#t-hoje .greeting{grid-area:greeting!important;display:block!important;padding:0 0 6px!important;margin:0!important}#t-hoje .greeting h1{font-size:32px!important;line-height:1.05!important;letter-spacing:-.7px!important;font-weight:820!important;color:#0F1115!important}#t-hoje .greeting .gsub{font-size:14px!important;color:#667085!important;margin-top:6px!important}#t-hoje .score-card{grid-area:score!important;width:auto!important;min-width:0!important;min-height:236px!important;margin:0!important;border-radius:28px!important;padding:30px 32px!important;display:grid!important;grid-template-columns:minmax(0,1fr) 124px!important;grid-template-areas:"main ring" "info ring"!important;gap:14px 28px!important;align-content:center!important;align-items:center!important;overflow:hidden!important}#t-hoje .score-card .sc-ico,#t-hoje .score-card .sc-chev{display:none!important}#t-hoje .score-card .sc-main{grid-area:main!important;min-width:0!important}#t-hoje .score-card .sc-lbl{font-size:11px!important;letter-spacing:1.6px!important;color:#667085!important;margin-bottom:8px!important;font-weight:820!important}#t-hoje .score-card .sc-num{font-size:70px!important;line-height:.9!important;letter-spacing:-2px!important;font-weight:860!important;color:#0F1115!important}#t-hoje .score-card .sc-num sub{font-size:18px!important;color:#667085!important;margin-left:4px!important}#t-hoje .score-card .sc-info{grid-area:info!important;max-width:360px!important}#t-hoje .score-card .sc-status{font-size:15px!important;margin-bottom:8px!important;color:#0F1115!important;font-weight:800!important}#t-hoje .score-card .sc-desc{font-size:13.5px!important;line-height:1.5!important;color:#667085!important;max-width:300px!important}#t-hoje .score-ring{grid-area:ring!important;width:118px!important;height:118px!important;margin:0!important;justify-self:end!important;align-self:center!important}#t-hoje .score-ring circle{stroke-width:8!important}#t-hoje #prBannerSlot:empty{display:none!important}#t-hoje #prBannerSlot{grid-column:1/-1!important}#t-hoje .quick-grid{grid-area:quick!important;display:grid!important;grid-template-columns:1fr!important;gap:14px!important;margin:0!important;align-content:start!important;min-width:0!important}#t-hoje .qcard{min-height:0!important;height:auto!important;border-radius:24px!important;padding:22px 20px 18px!important;margin:0!important}#t-hoje .qcard-hdr{font-size:10px!important;letter-spacing:1.8px!important;font-weight:850!important;color:#667085!important;margin-bottom:14px!important;display:flex!important;align-items:center!important;gap:6px!important}#t-hoje .qcard-big{font-size:38px!important;line-height:.95!important;letter-spacing:-1px!important;font-weight:850!important;color:#0F1115!important}#t-hoje .qcard-big .qu{font-size:16px!important;color:#667085!important}#t-hoje .qcard-st{font-size:13px!important;margin-top:10px!important;color:#0F1115!important;font-weight:760!important}#t-hoje .qcard-bars{height:34px!important;margin-top:16px!important;gap:4px!important}#t-hoje .qcard-bars i{border-radius:999px 999px 5px 5px!important;background:#14B8A6!important}#t-hoje .qcard-bars i:nth-child(odd){background:#60A5FA!important}#t-hoje .qcard-link{font-size:13px!important;margin-top:16px!important;padding-top:14px!important;font-weight:780!important}#t-hoje .hdots{margin-top:16px!important;gap:7px!important}#t-hoje .hdot{width:28px!important;height:28px!important;border-width:1.7px!important;background:#fff!important}#t-hoje .hdot.done{background:#0F1115!important;border-color:#0F1115!important;color:#fff!important}#t-hoje .daily-log-btn{grid-area:daily!important;margin:0!important;min-height:72px!important;border-radius:22px!important;padding:0 22px!important;font-size:15px!important;font-weight:850!important;justify-content:flex-start!important;gap:12px!important}#t-hoje .daily-log-btn .dlb-chev{margin-left:auto!important}#t-hoje .sync-bar-static{grid-area:sync!important;margin:0!important;min-height:72px!important;border-radius:22px!important;padding:0 20px!important;font-size:14px!important;color:#475467!important}.sbs-badge{font-size:11px!important;padding:5px 12px!important;background:#F2F4F7!important;color:#667085!important;border-color:#E6E7EB!important}}',
    '@media (min-width:1280px){#t-hoje main{grid-template-columns:minmax(0,1fr) 410px!important;gap:20px 24px!important}#t-hoje .score-card{min-height:250px!important}}',
    '@media (max-width:767px){header{padding:12px 16px!important}.logo img{height:27px!important;max-width:168px!important}main{padding-left:14px!important;padding-right:14px!important}#t-hoje .quick-grid{grid-template-columns:1fr!important}.score-card,.qcard,.daily-log-btn,.sync-bar-static{border-radius:18px!important}}'
  ].join('\n');

  function injectCss(){
    var old=document.getElementById('hpc-ui-polish-style');
    if(old) old.remove();
    var style=document.createElement('style');
    style.id='hpc-ui-polish-style';
    style.textContent=css;
    document.head.appendChild(style);
  }

  function labelFromOnclick(node){
    var raw=node.getAttribute('onclick')||'';
    var match=raw.match(/go\\('([^']+)'/);
    return match&&match[1];
  }

  function setButtonLabel(btn,label){
    if(!btn||!label) return;
    var span=btn.querySelector(':scope > span:not(.ico):not(.sbn-ico)');
    if(span){span.textContent=label;return;}
    var nodes=Array.from(btn.childNodes).filter(function(n){return n.nodeType===3&&n.textContent.trim();});
    if(nodes[0]) nodes[0].textContent=label;
  }

  function polishNavigation(){
    var labels={hoje:'Início',treino:'Treinos',stats:'Stats',profile:'Perfil'};
    document.querySelectorAll('nav button,#sidebar .sbn').forEach(function(btn){
      var key=labelFromOnclick(btn);
      if(key&&labels[key]) setButtonLabel(btn,labels[key]);
    });
  }

  function polishHomeCopy(){
    var title=document.getElementById('greetingText');
    var sub=document.getElementById('greetingSub');
    if(title) title.textContent='Hoje';
    if(sub) sub.textContent='Score, sono e hábitos em um dashboard limpo.';
    var badge=document.querySelector('#t-hoje .sbs-badge');
    if(badge) badge.textContent='Status';
  }

  function polishProfileSyncRows(){
    document.querySelectorAll('.sync-device-row').forEach(function(row){
      var label=((row.querySelector('.sdr-lbl')||{}).textContent||'').trim();
      var status=row.querySelector('.sdr-status');
      if(label==='Huawei Health'||label==='Renpho'){
        row.classList.add('is-coming-soon');
        row.removeAttribute('onclick');
        row.onclick=null;
        if(status) status.innerHTML='<span class="sdr-dot"></span><span>Em breve</span>';
      }
      if(label==='Apple Health'){
        row.classList.add('apple-health-priority');
        if(status && /Não conectado|Conectado/.test(status.textContent)){
          status.innerHTML='<span class="sdr-dot" style="background:var(--teal)"></span><span>Importar arquivo</span>';
        }
      }
    });
  }

  function prioritizeAppleHealthImport(){
    var modal=document.getElementById('modalAppleHealth');
    var body=document.getElementById('ahModalBody');
    if(!modal||modal.dataset.manualImportFirst==='1') return;
    modal.dataset.manualImportFirst='1';
    var importBtn=modal.querySelector('button[onclick*="abrirHealthImport"]');
    if(importBtn){
      importBtn.textContent='Importar arquivo Apple Health';
      importBtn.classList.add('btn-primary');
      importBtn.style.marginTop='12px';
    }
    if(body){
      var note=document.createElement('div');
      note.className='ah-instructions';
      note.innerHTML='<b>Recomendado agora:</b><br>Exporte o ZIP/XML no app Saúde e importe aqui. O fluxo de webhook fica para depois.';
      body.insertBefore(note,body.firstChild);
    }
  }

  function patchRenderers(){
    if(typeof window.renderHome==='function'&&!window.__hpcRenderHomePolished){
      var originalHome=window.renderHome;
      window.renderHome=function(){
        var result=originalHome.apply(this,arguments);
        setTimeout(function(){polishHomeCopy();},0);
        return result;
      };
      window.__hpcRenderHomePolished=true;
    }
    if(typeof window.renderHoje==='function'&&!window.__hpcRenderHojePolished){
      var originalHoje=window.renderHoje;
      window.renderHoje=function(){
        var result=originalHoje.apply(this,arguments);
        setTimeout(function(){polishHomeCopy();},0);
        return result;
      };
      window.__hpcRenderHojePolished=true;
    }
    if(typeof window.renderProfile==='function'&&!window.__hpcRenderProfilePolished){
      var originalProfile=window.renderProfile;
      window.renderProfile=function(){
        var result=originalProfile.apply(this,arguments);
        setTimeout(function(){polishProfileSyncRows();prioritizeAppleHealthImport();},0);
        return result;
      };
      window.__hpcRenderProfilePolished=true;
    }
    if(typeof window._renderAHModal==='function'&&!window.__hpcAHModalPolished){
      var originalAH=window._renderAHModal;
      window._renderAHModal=function(){
        var result=originalAH.apply(this,arguments);
        setTimeout(function(){prioritizeAppleHealthImport();polishProfileSyncRows();},0);
        return result;
      };
      window.__hpcAHModalPolished=true;
    }
  }

  function runPolish(){
    injectCss();
    polishNavigation();
    polishHomeCopy();
    polishProfileSyncRows();
    prioritizeAppleHealthImport();
    patchRenderers();
  }

  window.HPC_UI_POLISH_VERSION='hpc-home-polish-v2';
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',runPolish,{once:true});
  else runPolish();
  setTimeout(runPolish,300);
  setTimeout(runPolish,900);
  setTimeout(runPolish,1800);
})();
`;

function appendUiPolish(response) {
  return response.text().then(text => {
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/javascript; charset=utf-8');
    headers.set('Cache-Control', 'no-store');
    return new Response(`${text}\n\n${UI_POLISH_BOOTSTRAP}`, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  });
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.pathname.endsWith('/assets/supabase-config.js')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(appendUiPolish)
        .catch(() => caches.match(event.request).then(cached => cached ? appendUiPolish(cached) : fetch(event.request).then(appendUiPolish)))
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html').then(cached => cached || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
