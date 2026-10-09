
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

/* PromoPlus cursor resolves the closest product surface so nested UI states stay accurate. */
/* Magnetic buttons move toward the pointer, while card tilt remains independently controlled. */
/* Strong tilt moves each project in 3D and drives a directional glare and shadow. */
/* The soft spotlight follows the pointer, adding visible depth without covering content. */
/* Section groups and individual words reveal as they cross into the viewport. */
function initTextReveals() {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .18 });
  document.querySelectorAll('.section-intro, .reveal-item, .word-reveal, .feature-card, .testimonial-card, .trust-item').forEach((item) => observer.observe(item));
}

/* One scroll-driven narrative; all content remains visible without JavaScript. */
/* Artwork to Mockup Motion: artwork travels into the product while the final proof lifts forward. */
/* Version stack: the selected card drives the adjacent status panel and its own glare position. */
function initVersionControl() {
  const stack = document.querySelector('.version-stack');
  const details = document.querySelector('.version-details');
  if (!stack || !details) return;
  const cards = [...stack.querySelectorAll('.stack-card')];
  const title = details.querySelector('h3');
  const copy = details.querySelector('p:last-of-type');

  function select(card) {
    title.textContent = card.dataset.version;
    copy.textContent = card.dataset.detail;
    cards.forEach((item) => item.classList.toggle('is-selected', item === card));
  }
  cards.forEach((card) => {
    card.addEventListener('pointerenter', () => select(card));
    card.addEventListener('focus', () => select(card));
    card.addEventListener('pointermove', (event) => {
      if (!finePointer || reducedMotion) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--version-gx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty('--version-gy', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  });
}

/* Client approval: staged comments appear on entry, then the review becomes a timestamped approval near the exit. */
/* Six skills follow a genuine circular path; pausing the wheel lets a skill take focus. */
/* Scroll position powers the parallax planes and the large rotation object. */
function initScrollProgress() {
  const rotationSection = document.querySelector('.rotation-section');
  const rotationObject = document.querySelector('.rotation-object');
  const rotationLayers = rotationObject ? [...rotationObject.querySelectorAll('.rotation-layer')] : [];
  let ticking = false;

  function update() {
    if (rotationSection && rotationObject) {
      const rect = rotationObject.getBoundingClientRect();
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches || innerWidth <= 760;
      const p = still ? 1 : Math.max(0, Math.min(1, (innerHeight * .9 - rect.top) / (innerHeight * .65)));
      if (rect.bottom > 0 && rect.top < innerHeight || still) {
        [[-24,-10,-3],[18,20,3],[24,32,2]].forEach(([x,y,r],i)=>{
          rotationLayers[i].style.setProperty('--proof-x',x*(1-p)+'px');
          rotationLayers[i].style.setProperty('--proof-y',y*(1-p)+'px');
          rotationLayers[i].style.setProperty('--proof-angle',r*(1-p)+'deg');
        });
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
}

/* Kinetic letters separate, lift, and turn on pointer movement while remaining legible. */
/* One reusable lens clones only the active display headline, scales it, and anchors its text under the pointer. */
/* Story panels update the sticky card's copy and transform state while read. */
/* Mobile visitors keep one restrained conversion action after leaving the hero. */
function initMobileQuickCTA() {
  const quickCTA = document.querySelector('.mobile-quick-cta');
  const finalCTA = document.querySelector('.cta-section');
  if (!quickCTA || !finalCTA) return;
  let ticking = false;

  function update() {
    const finalRect = finalCTA.getBoundingClientRect();
    const finalVisible = finalRect.top < window.innerHeight && finalRect.bottom > 0;
    const shouldShow = matchMedia('(max-width: 760px)').matches && window.scrollY > window.innerHeight * .72 && !finalVisible;
    quickCTA.classList.toggle('is-visible', shouldShow);
    ticking = false;
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
}

/* Testimonial carousel: cloned edge sequences create a seamless, one-direction infinite loop. */
function initTestimonials() {
  const carousel = document.querySelector('.testimonial-carousel');
  if (!carousel) return;
  const viewport = carousel.querySelector('.testimonial-viewport');
  const track = carousel.querySelector('.testimonial-stage');
  const originalCards = [...track.querySelectorAll('.testimonial-card')];
  const previous = carousel.querySelector('.testimonial-prev');
  const next = carousel.querySelector('.testimonial-next');
  const status = document.querySelector('.testimonial-carousel-status span');
  const total = originalCards.length;
  if (!total) return;

  const makeCloneSet = () => originalCards.map((card) => {
    const clone = card.cloneNode(true);
    clone.classList.add('testimonial-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('tabindex', '-1');
    clone.querySelectorAll('[tabindex]').forEach((item) => item.setAttribute('tabindex', '-1'));
    return clone;
  });

  const before = document.createDocumentFragment();
  makeCloneSet().forEach((card) => before.appendChild(card));
  track.insertBefore(before, track.firstChild);
  makeCloneSet().forEach((card) => track.appendChild(card));

  let logicalIndex = 0;
  let physicalIndex = total;
  let moving = false;

  function visibleCount() {
    if (window.innerWidth <= 760) return 1;
    if (window.innerWidth <= 980) return 2;
    return 3;
  }

  function stepSize() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const cardWidth = originalCards[0]?.getBoundingClientRect().width || 0;
    return cardWidth + gap;
  }

  function positionTrack(animate = true) {
    if (!animate || reducedMotion) track.style.transition = 'none';
    track.style.transform = `translate3d(${-physicalIndex * stepSize()}px, 0, 0)`;
    if (!animate || reducedMotion) {
      track.getBoundingClientRect();
      track.style.transition = '';
    }
  }

  function updateStatus() {
    const visible = Math.min(visibleCount(), total);
    const first = String(logicalIndex + 1).padStart(2, '0');
    const lastIndex = (logicalIndex + visible - 1) % total;
    const last = String(lastIndex + 1).padStart(2, '0');
    if (status) status.textContent = `${first}–${last}`;
  }

  function normalizeTrack() {
    if (physicalIndex >= total * 2) physicalIndex -= total;
    if (physicalIndex < total) physicalIndex += total;
    positionTrack(false);
    moving = false;
  }

  function move(direction) {
    if (moving) return;
    moving = true;
    logicalIndex = (logicalIndex + direction + total) % total;
    physicalIndex += direction;
    positionTrack(true);
    updateStatus();
    if (reducedMotion) normalizeTrack();
  }

  track.addEventListener('transitionend', (event) => {
    if (event.propertyName === 'transform') normalizeTrack();
  });
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });
  window.addEventListener('resize', () => {
    physicalIndex = total + logicalIndex;
    positionTrack(false);
    updateStatus();
  });

  previous.disabled = false;
  next.disabled = false;
  positionTrack(false);
  updateStatus();
}
/* Production-ready initialization groups keep each PromoPlus effect easy to locate and tune. */
function initReducedMotion() {
  root.classList.toggle('reduced-motion', reducedMotion);
}

/* Keep the hidden comparison sections in the source, but place the detailed journey at their former position. */
function initVersionStack() { initVersionControl(); }
function initProductionReveal() { initScrollProgress(); }
function initFeatureCards() {  }


 initReducedMotion(); initTestimonials();

   initTextReveals();   
initVersionStack();   initProductionReveal(); initFeatureCards();    initMobileQuickCTA();

/* Pricing analytics and signup integration hooks; no invented checkout destination. */
(() => {
  const section=document.querySelector('#pricing');
  if(!section)return;
  const emit=(event,extra={})=>document.dispatchEvent(new CustomEvent('promoplus:pricing',{detail:{event,...extra}}));
  section.addEventListener('click',e=>{const target=e.target.closest('[data-cro-event]');if(target&&target.dataset.croEvent!=='pricing_custom_click')emit(target.dataset.croEvent,{plan:target.dataset.signupPlan||null,available:target.getAttribute('aria-disabled')!=='true'});});
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){emit('pricing_view');observer.disconnect();}},{threshold:.15});observer.observe(section);
  const arrival=()=>{if(location.hash==='#pricing')emit('pricing_navigation_arrival');};window.addEventListener('hashchange',arrival);arrival();
})();
/* Keep the floating mobile action clear of the existing page ending. */
(() => {
  const quick=document.querySelector('.mobile-quick-cta');
  if(!quick)return;
  const visible=new Set();
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>entry.isIntersecting?visible.add(entry.target):visible.delete(entry.target));
    quick.classList.toggle('is-ending-hidden',visible.size>0);
  },{rootMargin:'0px 0px 80px 0px'});
  document.querySelectorAll('.faq-section,.cta-section,main + footer').forEach(el=>observer.observe(el));
})();



function initStorytelling() {
  const visual = document.querySelector('.story-visual');
  if (!visual) return;
  const section = visual.closest('.product-journey');
  if (section?.hidden) return;
  const storyCard = section?.querySelector('.journey-story-card');
  const storyTitle = storyCard?.querySelector('#story-title');
  const storyMeta = storyCard?.querySelector('.story-meta');
  const bigStep = section?.querySelector('.journey-big-step');
  const cardStep = section?.querySelector('.journey-card-step');
  const railItems = [...(section?.querySelectorAll('.journey-step-rail i') || [])];
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const panel = entry.target;
    section.querySelectorAll('.story-panel').forEach((item) => item.classList.toggle('is-active', item === panel));
    visual.dataset.state = panel.dataset.state;
    section.dataset.journeyState = panel.dataset.state;
    visual.dataset.cursorKind = panel.dataset.cursorKind;
    visual.dataset.cursorLabel = panel.dataset.cursorLabel;
    visual.querySelector('.story-kicker').textContent = panel.dataset.kicker;
    if (storyTitle) storyTitle.innerHTML = panel.dataset.title;
    if (storyMeta) storyMeta.textContent = panel.dataset.meta;
    const step = Number(panel.dataset.step) || 1;
    visual.querySelector('.story-progress-current').textContent = String(step).padStart(2, '0');
    visual.querySelector('.story-progress b').style.width = `${(step / 6) * 100}%`;
    if (bigStep) bigStep.textContent = String(step).padStart(2, '0');
    if (cardStep) cardStep.textContent = `${String(step).padStart(2, '0')} / 06`;
    railItems.forEach((item, index) => item.classList.toggle('is-active', index < step));
  }), { threshold: .58 });
  section.querySelectorAll('.story-panel').forEach((panel) => observer.observe(panel));
}


initStorytelling();




(() => {
  const form=document.querySelector('.custom-plan-form');
  if(!form)return;
  const message=form.querySelector('.custom-plan-message');
  const success=document.querySelector('.custom-plan-success');
  const section=document.querySelector('#custom-plan-form');
  const trigger=document.querySelector('.pricing-custom .pricing-button[href="#custom-plan-form"]');
  const emit=(event,extra={})=>document.dispatchEvent(new CustomEvent('promoplus:pricing',{detail:{event,plan:'Custom',source:'pricing_custom',...extra}}));
  form.dataset.sourcePlan='Custom Plan';
  trigger?.addEventListener('click',event=>{
    event.preventDefault();
    emit('pricing_custom_click');
    form.dataset.sourcePlan='Custom Plan';
    history.replaceState(null,'','#custom-plan-form');
    section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });
  let started=false;
  const start=()=>{if(started)return;started=true;emit('custom_plan_form_start')};
  form.addEventListener('focusin',event=>{if(event.target.matches('input,textarea'))start()});
  form.addEventListener('input',start);
  if(section&&'IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      document.body.classList.toggle('is-custom-plan-visible',entries.some(entry=>entry.isIntersecting));
    },{threshold:0,rootMargin:'0px 0px -8% 0px'});
    observer.observe(section);
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    emit('custom_plan_form_submit',{delivery:form.dataset.endpoint?.trim()?'endpoint':'email_draft'});
    message.hidden=true;
    const data=new FormData(form);
    const endpoint=form.dataset.endpoint?.trim();
    if(endpoint){
      const button=form.querySelector('button[type="submit"]');
      button.disabled=true;
      try{
        const response=await fetch(endpoint,{method:'POST',body:data});
        if(!response.ok)throw new Error('Submission failed');
        form.hidden=true;success.hidden=false;success.focus();
      }catch{
        message.textContent='We could not send your request. Please try again.';
        message.hidden=false;
      }finally{button.disabled=false}
      return;
    }
    const body=[
      `Plan: ${form.dataset.sourcePlan}`,
      `Full name: ${data.get('name')}`,
      `Work email: ${data.get('email')}`,
      `Company: ${data.get('company')}`,
      `Phone: ${data.get('phone')||'—'}`,
      '',
      'What we need:',
      data.get('needs')||'—'
    ].join('\n');
    const url=`mailto:hello@swishtag.com?subject=${encodeURIComponent('PromoPlus custom plan request')}&body=${encodeURIComponent(body)}`;
    message.textContent='Your email draft is ready. Send it from your email app to complete the request.';
    message.hidden=false;
    location.href=url;
  });
})();



window.__promoWorkflowImages = {
  "choose-products-v2.png": "/assets/people/choose-products-v2.png",
  "create-mockups.png": "/assets/promoplus/hero-mockup-v2.png",
  "edit-artwork-v2.png": "/assets/promoplus/design-editor.png",
  "get-approval-v2.png": "/assets/promoplus/preview-feedback.png",
  "production-files-v2.png": "/assets/promoplus/production-file.png"
};

(() => {
  const root = document.querySelector('#pp-hero');
  if (!root) return;
  const tabs = [...root.querySelectorAll('.pp-navigation [role="tab"]')];
  const steps = [
    { eyebrow: '01 · PRODUCT LIBRARY', title: 'Choose the product you want to make yours.', description: 'Browse apparel, bags, caps, and drinkware in the product library and select the mockup that fits your project.', proof: 'Product views live beside the workspace.', image: 'choose-products-v2.png', alt: 'Choosing a hoodie in the PromoPlus product library', label: 'APPLICATION CAPTURE' },
    { eyebrow: '02 · CREATE MOCKUPS', title: 'Build a promotional product mockup in minutes.', description: "Place your client's logo on each side, set colors, and create virtual proofs that show exactly how the product will be decorated.", proof: 'Front, back, and sleeve views in one project.', image: 'create-mockups.png', alt: 'Promotional product mockup software in PromoPlus', label: 'PRODUCT DESIGN REFERENCE', linkText: 'virtual proofs', linkHref: '/features/online-mockup-designer' },
    { eyebrow: '03 · EDIT ARTWORK', title: 'Update artwork without losing a version.', description: 'Resize, reposition, or replace artwork on any side. Each change is saved as a new version, so nothing is overwritten.', proof: 'Every version stays in the project history.', image: 'edit-artwork-v2.png', alt: 'Editing artwork placement on a promotional product mockup', label: 'PRODUCT DESIGN REFERENCE', linkText: 'new version', linkHref: '/features/artwork-version-control' },
    { eyebrow: '04 · GET APPROVAL', title: 'Send one link. Get a clear approval.', description: 'Clients review the latest mockup in one artwork approval portal, comment on the exact side, request changes, or approve.', proof: 'Automated artwork approval tracking with timestamps.', image: 'get-approval-v2.png', alt: 'Client artwork approval screen in PromoPlus', label: 'APPLICATION CAPTURE', linkText: 'artwork approval portal', linkHref: '/features/customer-approval-portal' },
    { eyebrow: '05 · PRODUCTION FILES', title: 'Hand off a production-ready proof.', description: 'Our artwork proofing software turns approved artwork into a two-page PDF: the product proof, then the artwork inspection sheet.', proof: 'No guessing which file is final.', image: 'production-files-v2.png', alt: 'Production-ready proof PDF generated by PromoPlus', label: 'PRODUCT DESIGN REFERENCE', linkText: 'artwork proofing software', linkHref: '/features/production-ready-file-generation' }
  ];
  const panel = root.querySelector('#pp-story-panel');
  const productionPreview = root.querySelector('.pp-production-preview');
  const productionDownload = root.querySelector('.pp-story-download');
  let current = 0;
  function show(index, focus = false) {
    current = (index + steps.length) % steps.length;
    const step = steps[current];
    for (const [id, value] of [['pp-story-eyebrow', step.eyebrow], ['pp-story-title', step.title], ['pp-story-proof', step.proof], ['pp-story-image-label', step.label], ['pp-story-counter', `${String(current + 1).padStart(2, '0')} / 05`]]) root.querySelector(`#${id}`).textContent = value;
    const description = root.querySelector('#pp-story-description');
    const linkIndex = step.linkText ? step.description.indexOf(step.linkText) : -1;
    if (linkIndex >= 0) {
      const link = document.createElement('a');
      link.href = step.linkHref;
      link.textContent = step.linkText;
      link.style.color = 'inherit';
      link.style.textDecoration = 'inherit';
      description.replaceChildren(
        document.createTextNode(step.description.slice(0, linkIndex)),
        link,
        document.createTextNode(step.description.slice(linkIndex + step.linkText.length))
      );
    } else {
      description.textContent = step.description;
    }
    const image = root.querySelector('#pp-story-image');
    image.src = window.__promoWorkflowImages[step.image];
    image.hidden = current === 4;
    productionPreview.hidden = current !== 4;
    productionDownload.hidden = current !== 4;
    root.classList.toggle("pp-production-active", current === 4);
    image.alt = step.alt;
    panel.setAttribute('aria-labelledby', tabs[current].id);
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === current)); tab.tabIndex = i === current ? 0 : -1; });
    if (focus) tabs[current].focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => show(i));
    tab.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight') next = i + 1;
      else if (e.key === 'ArrowLeft') next = i - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = 4;
      else return;
      e.preventDefault();
      show(next, true);
    });
  });
  root.querySelector('#pp-story-prev').addEventListener('click', () => show(current - 1));
  root.querySelector('#pp-story-next').addEventListener('click', () => show(current + 1));
})();

