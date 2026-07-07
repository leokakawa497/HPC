/*
  HPC PWA release note:
  When publishing a new app version, update CACHE_VERSION to the next value
  (for example: hpc-cache-v2, hpc-cache-v3). During activate, this service
  worker deletes older HPC caches so users do not stay stuck on old files.
  This does not touch localStorage, where the user's app data is stored.
*/
const CACHE_VERSION = 'hpc-cache-v89';
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
    'html,body{background:#FAFAFA!important;color:#111111!important}',
    'body:before{display:none!important}',
    'header{background:rgba(250,250,250,.94)!important;border-bottom:1px solid rgba(229,231,235,.75)!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}',
    '.logo{width:auto!important;min-width:132px!important;height:42px!important;background:transparent!important;box-shadow:none!important}',
    '.logo img{width:auto!important;max-width:178px!important;height:30px!important;object-fit:contain!important}',
    '.card,.score-card,.quick-card,.daily-log-btn,.sync-static,.program-card,.profile-card,.xp-card,.prof-body-stats,.weekly-goal-card,.sync-device-row,.stats-panel,.habit-row,.log-card{background:#FFFFFF!important;border-color:#E5E7EB!important;box-shadow:0 1px 2px rgba(17,24,39,.04),0 6px 18px rgba(17,24,39,.05)!important}',
    '.sync-device-row.is-coming-soon{opacity:.76;cursor:default!important}',
    '.sync-device-row.is-coming-soon .sdr-chev{display:none!important}',
    '.sync-device-row.is-coming-soon .sdr-status{color:#9CA3AF!important}',
    '.sync-device-row.is-coming-soon .sdr-dot{background:#9CA3AF!important}',
    '.sync-device-row.apple-health-priority .sdr-status span:last-child{color:#14B8A6!important}',
    'nav button{font-size:10.5px!important;gap:3px!important}',
    'nav button .ico{margin-bottom:2px!important}',
    '#sidebar .sbn span:last-child{font-weight:700}',
    '#modalAppleHealth .modal h3:after{content:"Importação manual é o fluxo recomendado agora";display:block;margin-top:5px;font-size:12px;line-height:1.35;color:#6B7280;font-weight:500}',
    '#modalAppleHealth .ah-instructions{background:#F8F9FB!important;border:1px solid #E5E7EB!important;border-radius:14px!important;padding:12px 14px!important}',
    '@media (min-width:1024px){body{padding-left:248px!important;padding-bottom:0!important}#sidebar{width:248px!important;background:#FFFFFF!important;border-right:1px solid #E5E7EB!important}header{max-width:1180px!important;margin:0 auto!important;padding:18px 28px!important;position:sticky!important;top:0!important;z-index:50!important}main{max-width:1180px!important;padding:0 28px 44px!important}#t-hoje main{display:grid!important;grid-template-columns:minmax(0,1.12fr) minmax(320px,.88fr)!important;gap:20px!important;align-items:start!important}#t-hoje .demo-banner,#t-hoje .hello{grid-column:1/-1!important}#t-hoje .score-card{grid-column:1!important;grid-row:auto!important;min-height:188px!important}#t-hoje .quick-grid{grid-column:2!important;display:grid!important;grid-template-columns:1fr!important;gap:14px!important}#t-hoje .sync-static,#t-hoje .daily-log-btn{grid-column:1/-1!important}#t-hoje .daily-log-btn{min-height:68px!important}#t-log main{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(340px,.82fr)!important;gap:18px!important;align-items:start!important}#t-log .page-head,#t-log .demo-banner{grid-column:1/-1!important}#t-log .log-card:first-of-type{grid-column:1!important}#t-log .log-card:nth-of-type(2),#t-log .log-card:nth-of-type(3),#t-log .log-card:nth-of-type(4){grid-column:2!important}#t-treino main{display:block!important}#t-treino .weekly-planner-desktop{display:none!important}#t-treino .prog-scroll{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px!important;overflow:visible!important}#t-treino .program-card{min-height:150px!important}#t-stats .stats-view{display:none!important}#t-stats .stats-view.sv-active{display:block!important}#t-stats .stats-panel{margin-bottom:16px!important}#t-profile main{display:grid!important;grid-template-columns:minmax(320px,.78fr) minmax(0,1.22fr)!important;gap:18px!important;align-items:start!important}#t-profile .profile-card,#t-profile .xp-card{grid-column:1!important}#t-profile .section-cap,#t-profile .prof-body-stats,#t-profile .weekly-goals,#t-profile .achievements,#t-profile .sync-devices-section{grid-column:2!important}}',
    '@media (min-width:1280px){#t-treino .prog-scroll{grid-template-columns:repeat(3,minmax(0,1fr))!important}}',
    '@media (max-width:767px){header{padding:12px 16px!important}.logo img{height:28px!important;max-width:168px!important}main{padding-left:14px!important;padding-right:14px!important}.score-card,.quick-card,.daily-log-btn,.sync-static{border-radius:18px!important}}'
  ].join('\n');

  function injectCss(){
    if(document.getElementById('hpc-ui-polish-style')) return;
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
    var labels={hoje:'Início',treino:'Treinos',stats:'Estatísticas',profile:'Perfil'};
    document.querySelectorAll('nav button,#sidebar .sbn').forEach(function(btn){
      var key=labelFromOnclick(btn);
      if(key&&labels[key]) setButtonLabel(btn,labels[key]);
    });
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
    polishProfileSyncRows();
    prioritizeAppleHealthImport();
    patchRenderers();
  }

  window.HPC_UI_POLISH_VERSION='hpc-ui-polish-v1';
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',runPolish,{once:true});
  else runPolish();
  setTimeout(runPolish,400);
  setTimeout(runPolish,1200);
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
