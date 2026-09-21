(() => {
  const form=document.querySelector('.auth-form');
  if(!form)return;
  const status=document.querySelector('.auth-status');
  const showStatus=message=>{status.textContent=message;status.setAttribute('role','status')};
  const error=(input,message)=>{input.setAttribute('aria-invalid','true');document.getElementById(input.id+'-error').textContent=message};
  const clear=input=>{input.removeAttribute('aria-invalid');document.getElementById(input.id+'-error').textContent=''};
  form.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{clear(input);status.textContent=''}));
  document.querySelectorAll('.auth-visibility').forEach(button=>button.addEventListener('click',()=>{
    const input=document.getElementById(button.getAttribute('aria-controls'));
    const showing=input.type==='password';input.type=showing?'text':'password';
    button.textContent=showing?'Hide':'Show';button.setAttribute('aria-label',(showing?'Hide':'Show')+' '+(input.id.includes('confirm')?'confirm password':'password'));
  }));
  document.querySelectorAll('[data-provider]').forEach(button=>button.addEventListener('click',()=>showStatus(button.dataset.provider+' sign-in is not connected to this page yet.')));
  document.querySelector('[data-recovery]')?.addEventListener('click',()=>showStatus('Password recovery is not connected to this page yet.'));
  form.addEventListener('submit',event=>{
    event.preventDefault();let first=null;
    form.querySelectorAll('input').forEach(input=>{
      clear(input);let message='';
      if(!input.value.trim())message='This field is required.';
      else if(input.type==='email'&&!input.validity.valid)message='Enter a valid email address.';
      else if(input.name==='confirm_password'&&input.value!==form.elements.password.value)message='Passwords do not match.';
      if(message){error(input,message);first??=input}
    });
    if(first){first.focus();return}
    showStatus('This screen is ready for the PromoPlus authentication service. No account details were sent or saved.');
  });
})();
