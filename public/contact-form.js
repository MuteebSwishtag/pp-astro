(() => {
  const form=document.querySelector('.contact-form');
  if(!form)return;
  const message=form.querySelector('.contact-message');
  const success=document.querySelector('.contact-success');
  const params=new URLSearchParams(location.search);
  if(params.get('contact')==='sent'){
    form.hidden=true;
    success.hidden=false;
    success.focus();
  }
  if(params.get('contact')==='error'){
    message.textContent='We could not send your message. Please try again.';
    message.hidden=false;
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const endpoint=form.dataset.endpoint?.trim()||form.getAttribute('action')||'/contact.php';
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
      form.hidden=true;
      success.hidden=false;
      success.focus();
    }catch(error){
      message.textContent=error.message||'We could not send your message. Please try again.';
      message.hidden=false;
      if(error.field&&form.elements[error.field])form.elements[error.field].focus();
    }finally{
      button.disabled=false;
    }
  });
})();
