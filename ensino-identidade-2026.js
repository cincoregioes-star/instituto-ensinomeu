/* Instituto EnsinoMeu — Navegacao e nomenclatura compartilhadas (2026).
   Atua apenas na apresentacao; dados, questoes, autenticacao e rotas permanecem intactos. */
(function () {
  'use strict';
  if (!document.body || document.body.dataset.ensinoDesign === '2026') return;
  document.body.dataset.ensinoDesign = '2026';
  document.body.classList.add('em-designed');
  var script = document.currentScript || document.querySelector('script[src*="ensino-identidade-2026.js"]');
  var root = new URL('.', script && script.src ? script.src : location.href);
  if (!location.pathname.startsWith(root.pathname)) return;
  var path = decodeURIComponent(location.pathname.slice(root.pathname.length)).toLowerCase();
  var home = path === '' || path === 'index.html';
  if (home) document.body.classList.add('em-home');
  if (path === 'login.html' || path === 'cadastro.html') document.body.classList.add('em-auth-page');
  var u = function (p) { return new URL(p, root).href; };
  var icons = {
    home:'<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M9 21v-7h6v7"/>',
    book:'<path d="M12 7c-3.1-2.6-7.1-2.9-10-2v14c3-1 7-.5 10 2 3-2.5 7-3 10-2V5c-3-1-7-.6-10 2Z"/><path d="M12 7v14"/>',
    game:'<path d="M6 9h12a4 4 0 0 1 3.8 3l1 5a3 3 0 0 1-4.8 3l-3-2H9l-3 2a3 3 0 0 1-4.8-3l1-5A4 4 0 0 1 6 9Z"/><path d="M7 12v5M4.5 14.5h5"/><path d="M16 13h.01M19 16h.01"/>',
    chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 9h6v6H9zM9 1v5M15 1v5M9 18v5M15 18v5M1 9h5M1 15h5M18 9h5M18 15h5"/>',
    people:'<circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2H3ZM17 4a3 3 0 0 1 0 6M17 13a5 5 0 0 1 4 5v2h-4"/>',
    graduate:'<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 12v5c4 3 8 3 12 0v-5M22 9v7"/>',
    layers:'<path d="m12 3 10 5-10 5L2 8l10-5ZM2 13l10 5 10-5M2 18l10 5 10-5"/>',
    heart:'<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/>'
  };
  function svg(key) { return '<span class="em-icon" aria-hidden="true"><svg viewBox="0 0 24 24">' + icons[key] + '</svg></span>'; }
  var sections = [
    {label:'Início',icon:'home',href:'index.html',id:'home'},
    {label:'Educação Básica',icon:'book',href:'planos.html',id:'basic'},
    {label:'Simulados Gamers',icon:'game',href:'simulados/9ano.html',id:'games',
      children:[['8º ano • Simulados','simulados/8ano.html'],['9º ano • Simulados','simulados/9ano.html']]},
    {label:'IA e Tecnologia',icon:'chip',href:'ensino-ia.html',id:'ai'},
    {label:'Cidadania e Inclusão',icon:'people',href:'cidadania.html',id:'citizenship'},
    {label:'Cursos Gratuitos',icon:'graduate',href:'catalogo-gratuito.html',id:'courses'},
    {label:'Material Didático',icon:'layers',href:'index.html#ebooks',id:'material'},
    {label:'Apoie o Instituto',icon:'heart',href:'index.html#apoie-o-instituto',id:'support'}
  ];
  function currentID(){
    if (home) return 'home';
    if (path.startsWith('simulados/')) return 'games';
    if (path.startsWith('conteudos-recuperados/') || path === 'catalogo-gratuito.html') return 'courses';
    if (path === 'cidadania.html') return 'citizenship';
    if (path.startsWith('ensino-ia') || path.startsWith('apostila-ia') || path === 'ia-tutoria.html') return 'ai';
    if (path === 'apostilas.html') return 'material';
    if (path === 'planos.html' || path === 'painel.html') return 'basic';
    return '';
  }
  function desktop(){
    return sections.map(function(x){
      var active=currentID()===x.id ? ' aria-current="page"' : '';
      var sub=x.children ? '<div class="em-submenu" aria-label="Turmas de simulados">' + x.children.map(function(c){return '<a href="'+u(c[1])+'">'+c[0]+'</a>';}).join('') + '</div>' : '';
      return '<div class="em-tab"><a class="em-nav-link" href="'+u(x.href)+'"'+active+'>'+svg(x.icon)+'<span>'+x.label+'</span></a>'+sub+'</div>';
    }).join('');
  }
  function mobile(){
    var s=sections.map(function(x){
      return '<a href="'+u(x.href)+'">'+svg(x.icon)+'<span>'+x.label+'</span></a>' +
        (x.children ? x.children.map(function(c){return '<a href="'+u(c[1])+'">↳ '+c[0]+'</a>';}).join('') : '');
    }).join('');
    return s + '<a class="em-entry-mobile" href="'+u('login.html')+'">Entrar / Cadastrar</a>';
  }
  function updateHomepage(){
    var header=document.querySelector('body > header.top');
    var nav=header && header.querySelector('nav.nav');
    if (!header || !nav) return false;
    var back=nav.querySelector('#ensino-voltar-global');
    nav.innerHTML=desktop();
    if(back) nav.prepend(back);
    var brandNote=header.querySelector('.brand small');
    if(brandNote) brandNote.textContent='EDUCAÇÃO GRATUITA • BNCC • PROFISSÕES';
    var sign=header.querySelector('.top-sign');
    if(sign){sign.textContent='Entrar / Cadastrar';sign.href=u('login.html');}
    var mobileNav=header.querySelector('.mobile-links');
    if(mobileNav){mobileNav.innerHTML=mobile();mobileNav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){var d=mobileNav.closest('details');if(d)d.open=false;});});}
    var heroEyebrow=document.querySelector('.hero .eyebrow');
    if(heroEyebrow)heroEyebrow.textContent='EDUCAÇÃO GRATUITA • BNCC • PROFISSÕES';
    var heroTitle=document.querySelector('.hero h1');
    if(heroTitle)heroTitle.innerHTML='Educação gratuita para <span>aprender, evoluir e conquistar.</span>';
    var heroLead=document.querySelector('.hero-grid p');
    if(heroLead)heroLead.innerHTML='<strong>100% gratuito.</strong> Reforço escolar alinhado à BNCC, videoaulas, apostilas digitais, simulados gamers, inteligência artificial e cursos de qualificação profissional para todas as gerações.';
    var heroActions=document.querySelectorAll('.hero .actions > a');
    if(heroActions.length >= 3){
      heroActions[1].href=u('simulados/8ano.html');heroActions[1].textContent='🎮 Simulados Gamers';
      heroActions[2].href=u('catalogo-gratuito.html');heroActions[2].textContent='🎓 Cursos profissionalizantes gratuitos';
    }
    var note=document.querySelector('.hero-note span:last-child');
    if(note)note.innerHTML='<b>Do Ensino Fundamental ao Ensino Médio e à formação profissional livre.</b> Aprenda no seu ritmo, sem mensalidade.';
    document.title='Instituto EnsinoMeu | Educação Gratuita, BNCC e Qualificação Profissional';
    var description=document.querySelector('meta[name="description"]');
    if(description)description.content='Instituto EnsinoMeu: educação gratuita, reforço escolar BNCC, videoaulas, apostilas, simulados gamers, IA e cursos de qualificação profissional.';
    if(!document.getElementById('apoie-o-instituto')){
      var section=document.createElement('section');
      section.id='apoie-o-instituto';section.className='em-apoie';
      section.setAttribute('aria-labelledby','em-support-heading');
      section.innerHTML='<div class="em-apoie-inner"><span class="em-apoie-badge" aria-hidden="true">♥</span><div><h2 id="em-support-heading">Apoie o Instituto EnsinoMeu</h2><p>Estamos preparando uma campanha de financiamento e buscando parcerias para ampliar o acesso gratuito a aulas, apostilas, simulados e cursos. Nosso compromisso é manter o conteúdo educacional acessível, sem mensalidades.</p><small>Campanha de apoio em preparação • Contribuições serão voluntárias.</small></div></div>';
      var footer=document.querySelector('footer');
      if(footer)footer.before(section);else document.body.appendChild(section);
    }
    return true;
  }
  function insertSharedHeader(){
    if(document.querySelector('.em-sitebar'))return;
    var bar=document.createElement('div');
    bar.className='em-sitebar';
    bar.setAttribute('role','banner');
    bar.innerHTML='<div class="em-sitebar-inner">'+
      '<a class="em-identity" href="'+u('index.html')+'" aria-label="Instituto EnsinoMeu — página inicial">'+
      '<img src="'+u('assets/brasao.png')+'" alt="Brasão do Instituto EnsinoMeu">'+
      '<span class="em-identity-text">INSTITUTO ENSINOMEU<small>EDUCAÇÃO GRATUITA • BNCC • PROFISSÕES</small></span></a>'+
      '<nav class="em-global-nav" aria-label="Menu institucional">'+desktop()+'</nav>'+
      '<a class="em-entry" href="'+u('login.html')+'">'+
      '<svg viewBox="0 0 24 24" aria-hidden="true">'+icons.user+'</svg><span>Entrar / Cadastrar</span></a>'+
      '<details class="em-dropdown"><summary aria-label="Abrir menu institucional">☰ Menu</summary>'+
      '<nav class="em-dropdown-links" aria-label="Menu de navegação para celular">'+mobile()+'</nav></details></div>';
    document.body.insertBefore(bar,document.body.firstChild);
    var dropdown=bar.querySelector('.em-dropdown');
    bar.querySelectorAll('.em-dropdown-links a').forEach(function(a){a.addEventListener('click',function(){dropdown.open=false;});});
    document.addEventListener('keydown',function(event){if(event.key==='Escape')dropdown.open=false;});
  }
  if(!home || !updateHomepage())insertSharedHeader();
})();
