const approvalComments=[
  {author:'Sarah / Client',copy:'Can we move the artwork slightly higher?',meta:'Front · Placement'},
  {author:'Promo team',copy:'Updated in Version 3 and ready for your review.',meta:'V3 · Revision complete'}
];
function initApprovalPortalDemo(){
  const pins=[...document.querySelectorAll('.review-pin')];
  const author=document.querySelector('#comment-author');
  const copy=document.querySelector('#comment-copy');
  const meta=document.querySelector('#comment-meta');
  const approve=document.querySelector('#approve-design');
  const request=document.querySelector('#request-change');
  const label=document.querySelector('#approval-state-label');
  const detail=document.querySelector('#approval-state-detail');
  const screenStatus=document.querySelector('#approval-screen-status');
  const dot=document.querySelector('#approval-state-dot');
  if(!pins.length||!approve)return;
  // Comment pins share a single accessible detail panel instead of duplicating content.
  pins.forEach((pin,index)=>pin.addEventListener('click',()=>{
    pins.forEach(item=>item.classList.remove('is-active'));pin.classList.add('is-active');
    author.textContent=approvalComments[index].author;copy.textContent=approvalComments[index].copy;meta.textContent=approvalComments[index].meta;
  }));
  approve.addEventListener('click',()=>{
    label.textContent='Approved';detail.textContent='Decision recorded';screenStatus.textContent='Approved';
    screenStatus.style.background='#dff3bf';dot.style.background='#b7f500';
  });
  request.addEventListener('click',()=>{
    label.textContent='Revision requested';detail.textContent='Feedback sent';screenStatus.textContent='Changes requested';
    screenStatus.style.background='#f5e2da';dot.style.background='#ef8c72';
  });
}
document.addEventListener('DOMContentLoaded',initApprovalPortalDemo);
