const productionSurfaceDetails={
  front:{index:'01',title:'Front artwork',copy:'Centered 3.5 in below collar with approved scale and color reference.'},
  back:{index:'02',title:'Back artwork',copy:'Full back placement aligned to the approved product proof and final dimensions.'},
  sleeve:{index:'03',title:'Sleeve artwork',copy:'Left sleeve mark positioned from the seam with production-safe spacing.'}
};

function initProductionSurfaceTabs(){
  const tabs=[...document.querySelectorAll('.surface-tabs button')];
  const index=document.querySelector('#surface-index');
  const title=document.querySelector('#surface-title');
  const copy=document.querySelector('#surface-copy');
  if(!tabs.length||!index||!title||!copy)return;
  // One shared detail panel keeps the production file interaction lightweight.
  tabs.forEach(tab=>tab.addEventListener('click',()=>{
    const detail=productionSurfaceDetails[tab.dataset.side];
    tabs.forEach(item=>{item.classList.remove('is-active');item.setAttribute('aria-selected','false')});
    tab.classList.add('is-active');tab.setAttribute('aria-selected','true');
    index.textContent=detail.index;title.textContent=detail.title;copy.textContent=detail.copy;
  }));
}

document.addEventListener('DOMContentLoaded',initProductionSurfaceTabs);
