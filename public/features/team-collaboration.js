const teamRoleStories={
  sales:{kicker:'Sales view',title:'Start with the customer brief.',copy:'Capture the product, deadline, artwork, and client context once so the project starts clearly.',input:'Customer request',output:'Connected project'},
  design:{kicker:'Design view',title:'Create from the right source.',copy:'Work with the current product, artwork, sides, and feedback without rebuilding the brief.',input:'Approved source',output:'Client-ready mockup'},
  operations:{kicker:'Operations view',title:'Know what is ready to move.',copy:'See the version, approval status, and production details before the handoff begins.',input:'Recorded decision',output:'Production handoff'},
  owner:{kicker:'Business owner view',title:'See progress without chasing updates.',copy:'Understand what is waiting, what changed, and where the team needs support.',input:'Live workflow',output:'Operational visibility'}
};
function initTeamRoleStories(){
  const buttons=[...document.querySelectorAll('.team-role')];
  const kicker=document.querySelector('#role-kicker'),title=document.querySelector('#role-title'),copy=document.querySelector('#role-copy'),input=document.querySelector('#role-input'),output=document.querySelector('#role-output');
  if(!buttons.length||!title)return;
  buttons.forEach(button=>button.addEventListener('click',()=>{
    const story=teamRoleStories[button.dataset.role];buttons.forEach(item=>{item.classList.toggle('is-active',item===button);item.setAttribute('aria-pressed',item===button?'true':'false')});
    kicker.textContent=story.kicker;title.textContent=story.title;copy.textContent=story.copy;input.textContent=story.input;output.textContent=story.output;
  }));
}
document.addEventListener('DOMContentLoaded',initTeamRoleStories);
