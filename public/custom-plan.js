(() => {
  const form=document.querySelector('.custom-plan-form');
  if(!form)return;
  const message=form.querySelector('.custom-plan-message');
  const success=document.querySelector('.custom-plan-success');
  const section=document.querySelector('#custom-plan-form');
  const trigger=document.querySelector('.pricing-custom .pricing-button[href="#custom-plan-form"]');
  const emit=(event,extra={})=>document.dispatchEvent(new CustomEvent('promoplus:pricing',{detail:{event,plan:'Custom',source:'pricing_custom',...extra}}));
  form.dataset.sourcePlan='Custom Plan';
  const params=new URLSearchParams(location.search);
  if(params.get('custom_sales')==='sent'){
    form.hidden=true;
    success.hidden=false;
    success.focus();
  }
  if(params.get('custom_sales')==='error'){
    message.textContent='We could not send your request. Please try again.';
    message.hidden=false;
  }
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
    const endpoint=form.dataset.endpoint?.trim()||form.getAttribute('action')||'/custom_sales.php';
    emit('custom_plan_form_submit',{delivery:'endpoint'});
    message.hidden=true;
    const data=new FormData(form);
    const button=form.querySelector('button[type="submit"]');
    button.disabled=true;
    try{
      const response=await fetch(endpoint,{
        method:'POST',
        body:data,
        headers:{Accept:'application/json','X-Requested-With':'XMLHttpRequest'}
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||!payload.ok){
        const error=new Error(payload.message||'Submission failed');
        error.field=payload.field;
        throw error;
      }
      form.hidden=true;success.hidden=false;success.focus();
    }catch(error){
      message.textContent=error.message||'We could not send your request. Please try again.';
      message.hidden=false;
      if(error.field&&form.elements[error.field])form.elements[error.field].focus();
    }finally{button.disabled=false}
  });
})();
