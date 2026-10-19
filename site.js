'use strict';
(() => {
  const menuToggle=document.getElementById('menu-toggle'), menu=document.getElementById('mobile-menu');
  if(menuToggle&&menu){
    menuToggle.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')==='true'; menuToggle.setAttribute('aria-expanded',String(!open));menuToggle.setAttribute('aria-label',open?'Abrir menu':'Fechar menu');menu.hidden=open});
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;menuToggle.setAttribute('aria-expanded','false')}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;menuToggle.setAttribute('aria-expanded','false')}});
  }
  const slides=[...document.querySelectorAll('.slide')],dots=[...document.querySelectorAll('[data-slide]')];
  const slideshow=document.getElementById('slideshow'),labels=['Mais apoio para aprender','Conhecimento para cada conquista','Curiosidade que transforma'],slideLabel=document.getElementById('slide-label');
  let active=0,interval=null;
  function showSlide(index){
    if(!slides.length)return;
    active=(index+slides.length)%slides.length;
    slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===active);slide.setAttribute('aria-hidden',String(i!==active))});
    dots.forEach((dot,i)=>{dot.classList.toggle('active',i===active);if(i===active)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current')});
    if(slideLabel)slideLabel.textContent=labels[active]||labels[0];
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stop=()=>{if(interval){clearInterval(interval);interval=null}};
  const resume=()=>{stop();if(!reduced&&slides.length>1)interval=setInterval(()=>showSlide(active+1),5200)};
  document.getElementById('prev-slide')?.addEventListener('click',()=>{showSlide(active-1);resume()});
  document.getElementById('next-slide')?.addEventListener('click',()=>{showSlide(active+1);resume()});
  dots.forEach(dot=>dot.addEventListener('click',()=>{showSlide(Number(dot.dataset.slide));resume()}));
  slideshow?.addEventListener('mouseenter',stop);slideshow?.addEventListener('mouseleave',resume);
  slideshow?.addEventListener('focusin',stop);slideshow?.addEventListener('focusout',resume);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():resume());
  showSlide(0);resume();
  const sets={fi:[1,2,3,4,5].map(i=>({label:i+'º ano',id:'fi-'+i})),fii:[6,7,8,9].map(i=>({label:i+'º ano',id:'fii-'+i})),em:[1,2,3].map(i=>({label:i+'ª série',id:'em-'+i}))};
  const options=document.getElementById('grade-options');
  document.querySelectorAll('.grade-tabs [data-stage]').forEach(tab=>tab.addEventListener('click',()=>{
    document.querySelectorAll('.grade-tabs [data-stage]').forEach(t=>{const yes=t===tab;t.classList.toggle('active',yes);t.setAttribute('aria-selected',String(yes))});
    if(!options)return;
    options.replaceChildren(...sets[tab.dataset.stage].map(({label,id})=>{
      const a=document.createElement('a');a.href='planos.html#plano-'+id;a.append(document.createTextNode(label+' '));
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','icon');svg.setAttribute('aria-hidden','true');
      const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#ico-arrow');svg.append(use);a.append(svg);return a;
    }));
  }));
  const year=document.getElementById('year');if(year)year.textContent=String(new Date().getFullYear());
})();