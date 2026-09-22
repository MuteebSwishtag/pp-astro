/* Shared, dependency-free navigation. Tracking is opt-in via data-cro-event.
   No analytics script, cookies, dataLayer, or duplicate analytics dispatch. */
(() => {
  const header=document.querySelector('.pn-header');
  if(!header)return;
  const toggle=header.querySelector('.pn-mobile-toggle');
  const triggers=[...header.querySelectorAll('.pn-trigger')];
  const mobile=matchMedia('(max-width:900px)');
  const hover=matchMedia('(hover:hover) and (pointer:fine)');
  let active=null,openTimer,closeTimer,mobileOpen=false,previousOverflow='',inertElements=[];
  function emit(element){
    // A site analytics adapter can subscribe to this event or the data attributes.
    document.dispatchEvent(new CustomEvent('promoplus:navigation',{detail:{
      event:element.dataset.croEvent,feature:element.dataset.navFeature||null,
      group:element.dataset.navGroup||null,href:element.getAttribute('href'),
      layout:mobile.matches?'mobile':'desktop'
    }}));
  }
  function clearTimers(){clearTimeout(openTimer);clearTimeout(closeTimer);}
  function closeMenu(restore=false){
    clearTimers();if(!active)return;const old=active;active=null;
    old.setAttribute('aria-expanded','false');document.getElementById(old.getAttribute('aria-controls')).hidden=true;
    if(restore)old.focus();
  }
  function openMenu(trigger,focusFirst=false){
    clearTimers();if(active!==trigger){closeMenu();active=trigger;trigger.setAttribute('aria-expanded','true');document.getElementById(trigger.getAttribute('aria-controls')).hidden=false;emit(trigger);}
    if(focusFirst)document.getElementById(trigger.getAttribute('aria-controls')).querySelector('a,button')?.focus();
  }
  function positionMobile(){header.style.setProperty('--pn-bottom',header.getBoundingClientRect().bottom+'px');}
  function setMobile(open,restore=false){
    if(open===mobileOpen)return;mobileOpen=open;closeMenu();
    toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    toggle.querySelector('.pn-mobile-label').textContent=open?'Close':'Menu';
    header.classList.toggle('is-mobile-open',open);
    if(open){
      positionMobile();previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
      inertElements=[...document.body.children].filter(el=>el!==header&&!['SCRIPT','STYLE','LINK'].includes(el.tagName)).map(el=>[el,el.inert]);
      inertElements.forEach(([el])=>el.inert=true);triggers[0].focus();
    }else{
      document.body.style.overflow=previousOverflow;inertElements.forEach(([el,value])=>el.inert=value);inertElements=[];
      if(restore)toggle.focus();
    }
  }
  triggers.forEach((trigger,index)=>{
    trigger.addEventListener('click',()=>active===trigger?closeMenu():openMenu(trigger));
    trigger.addEventListener('pointerenter',()=>{
      if(mobile.matches||!hover.matches)return;clearTimers();openTimer=setTimeout(()=>openMenu(trigger),130);
    });
    trigger.addEventListener('pointerleave',()=>{if(mobile.matches)return;clearTimeout(openTimer);closeTimer=setTimeout(()=>closeMenu(),260);});
    trigger.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'){e.preventDefault();openMenu(trigger,true);}
      if(!mobile.matches&&['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){
        e.preventDefault();let next=e.key==='Home'?0:e.key==='End'?triggers.length-1:(index+(e.key==='ArrowRight'?1:triggers.length-1))%triggers.length;
        closeMenu();triggers[next].focus();
      }
    });
    const panel=document.getElementById(trigger.getAttribute('aria-controls'));
    panel.addEventListener('pointerenter',()=>clearTimers());
    panel.addEventListener('pointerleave',()=>{if(!mobile.matches)closeTimer=setTimeout(()=>{if(!panel.contains(document.activeElement)&&document.activeElement!==trigger)closeMenu();},260);});
  });
  toggle.addEventListener('click',()=>setMobile(!mobileOpen,true));
  document.addEventListener('click',e=>{
    const blocked=e.target.closest('[data-nav-route][aria-disabled=true]');if(blocked){e.preventDefault();return;}
    const link=e.target.closest('a[data-cro-event]');if(link){emit(link);closeMenu();if(mobileOpen)setMobile(false);}
    if(!header.contains(e.target))closeMenu();
  });
  document.addEventListener('focusin',e=>{
    if(active&&!mobileOpen&&!header.contains(e.target))closeMenu();
    else if(active&&!mobileOpen&&header.contains(e.target)&&!document.getElementById(active.getAttribute('aria-controls')).contains(e.target)&&e.target!==active)closeMenu();
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(active){e.preventDefault();closeMenu(true);}
      else if(mobileOpen){e.preventDefault();setMobile(false,true);}
    }
    if(e.key==='Tab'&&mobileOpen){
      const items=[...header.querySelectorAll('a,button')].filter(el=>el.getClientRects().length&&!el.disabled);
      const first=items[0],last=items.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  function scrollState(){header.classList.toggle('is-sticky',scrollY>(document.querySelector('.pn-announcement')?.offsetHeight||0));if(mobileOpen)positionMobile();}
  addEventListener('scroll',scrollState,{passive:true});scrollState();
  addEventListener('resize',()=>{if(mobileOpen)positionMobile();},{passive:true});
  mobile.addEventListener('change',()=>{if(mobileOpen)setMobile(false);closeMenu();});
})();
