const dashboardStatus={
  all:{count:'12',title:'Every active project',copy:'See the complete artwork workload and identify the next decision.'},
  artwork:{count:'03',title:'Pending artwork',copy:'Find projects waiting for source files or artwork preparation.'},
  approval:{count:'04',title:'Awaiting customer approval',copy:'See every client decision still needed to keep work moving.'},
  revision:{count:'02',title:'Revision requests',copy:'Surface requested changes before they become production delays.'},
  production:{count:'03',title:'Production-ready projects',copy:'Know which approved files are ready to hand off now.'}
};
function initDashboardFilters(){
  const buttons=[...document.querySelectorAll('.board-filters button')],columns=[...document.querySelectorAll('.board-columns>article')];
  const count=document.querySelector('#insight-count'),title=document.querySelector('#insight-title'),copy=document.querySelector('#insight-copy'),total=document.querySelector('#board-total');
  if(!buttons.length||!count)return;
  buttons.forEach(button=>button.addEventListener('click',()=>{
    const status=button.dataset.status,detail=dashboardStatus[status];
    buttons.forEach(item=>{item.classList.toggle('is-active',item===button);item.setAttribute('aria-selected',item===button?'true':'false')});
    columns.forEach(column=>column.classList.toggle('is-muted',status!=='all'&&column.dataset.column!==status));
    count.textContent=detail.count;title.textContent=detail.title;copy.textContent=detail.copy;if(total)total.textContent=status==='all'?'12 active projects':detail.count+' projects'; 
  }));
}
document.addEventListener('DOMContentLoaded',initDashboardFilters);
