const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

/* PromoPlus cursor resolves the closest product surface so nested UI states stay accurate. */
function initPromoCursor() {
  if (!finePointer || reducedMotion) return;
  const cursor = document.querySelector('.cursor');
  const ring = cursor.querySelector('.cursor-ring');
  const dot = cursor.querySelector('.cursor-dot');
  let targetX = -100; let targetY = -100; let ringX = -100; let ringY = -100;
  const lag = parseFloat(getComputedStyle(root).getPropertyValue('--cursor-lag')) || .14;
  let activeKind = '';
  let isOnDark = false;
  const darkSurfaceSelector = [
    '.message-banner',
    '.rotation-section',
    '.type-motion-section',
    '.testimonial-section',
    '.context-cta-workflow',
    '.context-cta-proof',
    '.context-cta-project .contextual-cta-panel',
    '[data-cursor-theme="dark"]',
  ].join(',');

  root.classList.add('has-custom-cursor');
  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX; targetY = event.clientY;
    dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
    if (root.classList.contains('magnifier-active')) return;
    const pointerTarget = event.target instanceof Element ? event.target : null;
    const target = pointerTarget?.closest('[data-cursor-kind], a, button');
    const kind = target?.dataset.cursorKind || (target?.matches('a, button') ? 'button' : '');
    const nextIsOnDark = Boolean(pointerTarget?.closest(darkSurfaceSelector));
    const cursorThemeIsCurrent = cursor.classList.contains('is-on-dark') === nextIsOnDark;
    if (kind === activeKind && nextIsOnDark === isOnDark && cursorThemeIsCurrent) return;
    activeKind = kind;
    isOnDark = nextIsOnDark;
    cursor.className = `cursor${kind ? ` is-hovering is-${kind}` : ''}${isOnDark ? ' is-on-dark' : ''}`;
  }, { passive: true });

  function followRing() {
    ringX += (targetX - ringX) * lag;
    ringY += (targetY - ringY) * lag;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(followRing);
  }
  followRing();
}

/* Magnetic buttons move toward the pointer, while card tilt remains independently controlled. */
function initMagneticElements() {
  if (!finePointer || reducedMotion) return;
  document.querySelectorAll('.magnetic').forEach((item) => {
    item.addEventListener('pointermove', (event) => {
      if (item.classList.contains('tilt-card')) return;
      const rect = item.getBoundingClientRect();
      const strength = parseFloat(getComputedStyle(root).getPropertyValue('--magnetic-strength')) || .18;
      item.style.setProperty('--magnetic-x', `${(event.clientX - rect.left - rect.width / 2) * strength}px`);
      item.style.setProperty('--magnetic-y', `${(event.clientY - rect.top - rect.height / 2) * strength}px`);
    });
    item.addEventListener('pointerleave', () => {
      item.style.setProperty('--magnetic-x', '0px'); item.style.setProperty('--magnetic-y', '0px');
    });
  });
}

/* Strong tilt moves each project in 3D and drives a directional glare and shadow. */
function initTiltCards() {
  if (!finePointer || reducedMotion) return;
  document.querySelectorAll('.tilt-card, [data-product-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const strength = card.matches('[data-product-tilt]') ? 12 : (parseFloat(getComputedStyle(root).getPropertyValue('--tilt-strength')) || 20);
      const rotateY = (x - .5) * strength;
      const rotateX = (.5 - y) * strength;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-18px) scale(1.02)`;
      card.style.boxShadow = `${-rotateY * 1.2}px ${22 + rotateX}px 40px rgba(25, 22, 18, .28)`;
      card.style.setProperty('--gx', `${x * 100}%`); card.style.setProperty('--gy', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; card.style.boxShadow = ''; });
  });
}

/* The soft spotlight follows the pointer, adding visible depth without covering content. */
function initCursorSpotlight() {
  if (!finePointer || reducedMotion) return;
  window.addEventListener('pointermove', (event) => {
    root.style.setProperty('--mx', `${event.clientX}px`); root.style.setProperty('--my', `${event.clientY}px`);
  }, { passive: true });
}

/* Section groups and individual words reveal as they cross into the viewport. */
function initTextReveals() {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .18 });
  document.querySelectorAll('.section-intro, .reveal-item, .word-reveal, .feature-card, .testimonial-card, .trust-item').forEach((item) => observer.observe(item));
}

/* Messy Workflow Cleanup: cards keep separate 3D paths, then converge as the stage enters view. */
function initMessyWorkflow() {
  const stage = document.querySelector('.messy-stage');
  if (!stage) return;
  const section = stage.closest('.problem-section');
  const cards = [...stage.querySelectorAll('.messy-card')];
  if (reducedMotion) return;
  const background = stage.querySelector('.messy-background');
  const foreground = stage.querySelector('.messy-foreground');
  let active = false;
  let ticking = false;
  const paths = [
    [[-250, -170, -70, 18, -24, -14], [-24, -28, -70, 4, -5, -4]],
    [[245, -155, -35, -15, 21, 13], [-14, -17, -36, -3, 5, 3]],
    [[-270, 40, 20, -12, -18, 11], [-4, -5, -2, 2, -3, -2]],
    [[245, 45, 48, 19, 15, -10], [8, 8, 30, -2, 3, 2]],
    [[-135, 190, -30, -21, 14, 15], [18, 19, -34, 3, -4, 4]],
    [[145, 180, 70, 14, -19, -17], [28, 29, 55, -3, 4, -3]],
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { active = entry.isIntersecting; if (active) update(); });
  }, { threshold: .12 });
  observer.observe(section || stage);

  function update() {
    if (!active) return;
    const rect = (section || stage).getBoundingClientRect();
    const desktopSequence = window.innerWidth > 760;
    /* On desktop, the sticky chapter supplies a concise 1.2 viewport-length scroll.
       Mobile keeps a compact entrance-based progression. */
    const scrollRange = Math.max(1, (section?.offsetHeight || stage.offsetHeight) - window.innerHeight);
    const rawProgress = desktopSequence
      ? -rect.top / scrollRange
      : (window.innerHeight - stage.getBoundingClientRect().top) / (window.innerHeight * 1.35);
    const progress = Math.max(0, Math.min(1, rawProgress));
    const scale = window.innerWidth < 760 ? .5 : 1;
    const lerp = (from, to) => from + (to - from) * progress;
    cards.forEach((card, index) => {
      const [start, end] = paths[index];
      const x = lerp(start[0], end[0]) * scale;
      const y = lerp(start[1], end[1]) * scale;
      const z = lerp(start[2], end[2]);
      const rx = lerp(start[3], end[3]);
      const ry = lerp(start[4], end[4]);
      const rz = lerp(start[5], end[5]);
      card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
    });
    background.style.transform = `translate3d(0, ${(progress - .5) * 52}px, 0) rotate(${(progress - .5) * -4}deg)`;
    foreground.style.transform = `translate3d(0, ${(progress - .5) * -110}px, 0)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!active || ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
}

/* Artwork to Mockup Motion: artwork travels into the product while the final proof lifts forward. */
function initArtworkMotion() {
  const stage = document.querySelector('.artwork-stage');
  if (!stage) return;
  const file = stage.querySelector('.artwork-file-card');
  const blank = stage.querySelector('.blank-product-card');
  const finalCard = stage.querySelector('.final-mockup-card');
  const grid = stage.querySelector('.placement-grid');
  const token = stage.querySelector('.logo-transfer');
  const emptyEditor = stage.querySelector('.editor-empty');
  const placedEditor = stage.querySelector('.editor-placed');
  const confirmation = stage.querySelector('.placement-confirmation');
  const motionStatus = stage.querySelector('.motion-sequence-status');
  const motionStep = motionStatus?.querySelector('span');
  const motionLabel = motionStatus?.querySelector('b');
  const motionCount = motionStatus?.querySelector('i');
  const stepCopy = stage.closest('.artwork-motion-section')?.querySelector('.artwork-step-copy');
  const stepIndex = stepCopy?.querySelector('span');
  const stepLabel = stepCopy?.querySelector('b');
  const stepCaption = stage.closest('.artwork-motion-section')?.querySelector('.artwork-step-caption');
  const stepKicker = stepCaption?.querySelector('p');
  const stepTitle = stepCaption?.querySelector('h3');
  const stepText = stepCaption?.querySelector('span');
  const captionProgress = [...(stepCaption?.querySelectorAll('.artwork-caption-progress i') || [])];
  const section = stage.closest('.artwork-motion-section');
  const hold = stage.closest('.artwork-scroll-layout') || stage;
  const stickyStart = Math.max(0, hold.offsetTop - section.offsetTop - 80);
  const labels = [...stage.querySelectorAll('.side-label')];
  const sideNames = [...stage.querySelectorAll('.side-name, .final-side-name')];
  let active = false;
  let ticking = false;

  function setSide(side) {
    stage.dataset.side = side;
    labels.forEach((label) => label.classList.toggle('is-active', label.dataset.side === side));
    sideNames.forEach((label) => { label.textContent = side.toUpperCase(); });
  }
  labels.forEach((label) => {
    label.addEventListener('pointerenter', () => setSide(label.dataset.side));
    label.addEventListener('click', () => setSide(label.dataset.side));
  });
  if (reducedMotion) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { active = entry.isIntersecting; if (active) update(); });
  }, { threshold: 0, rootMargin: '200px 0px 200px' });
  observer.observe(stage);

  function update() {
    if (!active) return;
    const mobile = window.innerWidth < 760;
    const rect = stage.getBoundingClientRect();
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    // Measure from the moment the stage reaches its sticky position until its bottom leaves the section.
    const desktopStart = sectionTop + stickyStart;
    const desktopEnd = sectionTop + section.offsetHeight - hold.offsetHeight - 80;
    const desktopProgress = (window.scrollY - desktopStart) / Math.max(1, desktopEnd - desktopStart);
    const mobileProgress = (window.innerHeight - rect.top) / (window.innerHeight * .8);
    const progress = Math.max(0, Math.min(1, mobile ? mobileProgress : desktopProgress));
    const clamp = (value) => Math.max(0, Math.min(1, value));
    const ease = (value) => value * value * (3 - 2 * value);
    const travel = ease(clamp((progress - .10) / .30));
    const place = ease(clamp((progress - .32) / .25));
    const reveal = ease(clamp((progress - .48) / .22));
    const preview = ease(clamp((progress - .62) / .20));
    const closeup = ease(clamp((progress - .82) / .18));
    const fileX = (mobile ? 92 : 285) * travel;
    const fileY = (mobile ? 108 : 78) * travel;
    const tokenTravel = ease(clamp((progress - .30) / .45));
    const tokenX = stage.clientWidth * (mobile ? .38 : .48) * tokenTravel;
    const tokenY = (mobile ? -18 : -28) * tokenTravel;

    file.style.transform = `translate3d(${fileX}px, ${fileY}px, ${travel * 84}px) rotate(${travel * 7}deg) scale(${1 - travel * .48})`;
    file.style.opacity = `${1 - place * .92}`;
    token.style.transform = `translate3d(${tokenX}px, ${tokenY}px, ${30 + tokenTravel * 90}px) rotate(${tokenTravel * 12}deg) scale(${.72 + tokenTravel * .32})`;
    token.style.opacity = `${clamp((progress - .26) / .12) * (1 - clamp((progress - .76) / .18))}`;
    blank.style.transform = `translate(-50%, -50%) translate3d(${preview * -24}px, ${-10 - preview * 8}px, ${32 + reveal * 64}px) rotateY(${-8 + reveal * 7}deg) rotateZ(${(progress - .5) * -2}deg) scale(${1 + reveal * .035})`;
    const closeupX = -(stage.clientWidth * (mobile ? .08 : .30)) * closeup;
    const closeupY = (mobile ? -52 : -132) * closeup;
    // Keep the final review screen crisp: it enlarges from a larger native card instead of a heavy GPU scale.
    const finalScale = mobile ? .76 + preview * .24 + closeup * .28 : .76 + preview * .24 + closeup * .22;
    finalCard.style.transform = `translate3d(${(1 - preview) * (mobile ? 76 : 148) + closeupX}px, ${(1 - preview) * (mobile ? 44 : 68) + closeupY}px, ${-35 + preview * 118 + closeup * 50}px) rotateY(${-10 + preview * 8}deg) rotateZ(${5 - preview * 3}deg) scale(${finalScale})`;
    finalCard.style.opacity = `${.25 + preview * .75}`;
    grid.style.transform = `translate3d(0, ${(progress - .5) * 30}px, 0) rotate(${(progress - .5) * 2}deg) scale(${1 + reveal * .025})`;
    emptyEditor.style.opacity = `${1 - reveal}`;
    placedEditor.style.opacity = `${reveal}`;
    placedEditor.style.transform = `scale(${.96 + reveal * .04})`;
    confirmation.style.opacity = `${reveal}`;
    confirmation.style.transform = `translateY(${(1 - reveal) * 8}px)`;
    blank.style.opacity = `${1 - closeup * .86}`;
    file.style.opacity = `${(1 - place * .92) * (1 - closeup)}`;
    grid.style.opacity = `${.55 * (1 - closeup * .8)}`;

    const storyIndex = progress < .30 ? 0 : progress < .53 ? 1 : progress < .76 ? 2 : 3;
    const stories = [
      ['STEP 01 · SOURCE FILE', 'Start with the<br>right artwork.', 'Upload the original logo once, then keep it attached to every version and product side.'],
      ['STEP 02 · PLACEMENT', 'Place it on the<br>right product side.', 'Choose Front, Back, or Sleeve and keep the placement connected to the project.'],
      ['STEP 03 · MOCKUP', 'Generate a clean<br>client preview.', 'The approved artwork becomes a polished product mockup without leaving the workflow.'],
      ['STEP 04 · CLIENT PREVIEW', 'Version 3 is ready<br>for review.', 'Share one clear preview link so feedback and the next decision stay in context.'],
    ];
    const story = stories[storyIndex];
    stepKicker.innerHTML = story[0]; stepTitle.innerHTML = story[1]; stepText.textContent = story[2];
    captionProgress.forEach((marker, index) => {
      marker.classList.toggle('is-active', index === storyIndex);
      marker.classList.toggle('is-complete', index < storyIndex);
    });
    const shortStep = progress < .30 ? ['01 / 04', 'Upload<br>artwork']
      : progress < .53 ? ['02 / 04', 'Place on<br>Front']
        : progress < .76 ? ['03 / 04', 'Generate<br>mockup']
          : ['04 / 04', 'Ready for<br>review'];
    stepIndex.textContent = shortStep[0]; stepLabel.innerHTML = shortStep[1];
    stepCopy.style.opacity = `${1 - closeup * .55}`;
    // Keep the narrative visible during the final close-up so the result has time to land.
    stepCaption.style.opacity = '1';
    stepCaption.style.transform = 'translateY(0)';

    const state = progress < .30 ? ['01', 'Upload artwork', '01 / 04', 'upload']
      : progress < .53 ? ['02', 'Place on Front', '02 / 04', 'place']
        : progress < .76 ? ['03', 'Generate mockup', '03 / 04', 'generate']
          : closeup < .12 ? ['04', 'Client-ready preview', '04 / 04', 'complete']
            : ['04', 'Version 3 ready for review', '04 / 04', 'closeup'];
    motionStep.textContent = state[0]; motionLabel.textContent = state[1]; motionCount.textContent = state[2];
    stage.dataset.motionPhase = state[3];
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!active || ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
}

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
function initClientApproval() {
  const stage = document.querySelector('.approval-stage');
  if (!stage) return;
  const status = stage.querySelector('.approval-status');
  const pins = [...stage.querySelectorAll('.comment-pin')];
  let active = false;
  let ticking = false;

  pins.forEach((pin) => {
    const bubble = stage.querySelector(`.comment-bubble[data-comment="${pin.dataset.comment}"]`);
    pin.addEventListener('pointerenter', () => bubble?.classList.add('is-expanded'));
    pin.addEventListener('pointerleave', () => bubble?.classList.remove('is-expanded'));
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      active = entry.isIntersecting;
      if (active) { stage.classList.add('is-visible'); update(); }
    });
  }, { threshold: .18 });
  observer.observe(stage);

  function update() {
    if (!active || reducedMotion) return;
    const rect = stage.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    const approved = progress > .76;
    stage.classList.toggle('is-approved', approved);
    status.textContent = approved ? 'Approved' : 'In Review';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!active || ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
}

/* Six skills follow a genuine circular path; pausing the wheel lets a skill take focus. */
function initSkillsWheel() {
  const wheel = document.querySelector('.skills-wheel');
  const detail = document.querySelector('.feature-story');
  const skills = wheel ? [...wheel.querySelectorAll('.skill')] : [];
  if (!wheel || !detail) return;
  let paused = false;
  let pausedAt = 0;
  let started = performance.now();
  const phases = [0, 60, 120, 180, 240, 300];

  const featureRecords = {
    sides: {
      step: '01 / 06', kicker: 'Product structure',
      rows: [['Front', 'Approved'], ['Back', 'In review'], ['Sleeve', 'Pending']],
      tags: ['Mockups', 'Comments', 'Approval'],
      outcome: 'Every surface carries its own clear approval state.'
    },
    artwork: {
      step: '02 / 06', kicker: 'Source control',
      rows: [['File', 'logo-final.svg'], ['Format', 'Vector SVG'], ['Source', 'Original preserved']],
      tags: ['Product sides', 'Mockups', 'Versions'],
      outcome: 'The team always works from the right source file.'
    },
    versions: {
      step: '03 / 06', kicker: 'Revision history',
      rows: [['V1', 'Archived'], ['V2', 'Superseded'], ['V3', 'Current']],
      tags: ['Artwork', 'Feedback', 'Approval'],
      outcome: 'The current client proof is impossible to confuse.'
    },
    feedback: {
      step: '04 / 06', kicker: 'Review context',
      rows: [['Sarah', 'Move logo 8px up'], ['Surface', 'Front'], ['Version', 'V3']],
      tags: ['Client', 'Front', 'V3'],
      outcome: 'Feedback stays beside the exact item being reviewed.'
    },
    approval: {
      step: '05 / 06', kicker: 'Decision record',
      rows: [['Approved by', 'Sarah Chen'], ['Date', 'Jun 16, 2026'], ['Time', '5:37 PM · Locked']],
      tags: ['Client', 'V3', 'Timestamp'],
      outcome: 'Everyone can verify exactly what was approved.'
    },
    pdf: {
      step: '06 / 06', kicker: 'Production handoff',
      rows: [['Approved version', 'V3'], ['Sides', 'Front · Back · Sleeve'], ['Output', 'Production PDF']],
      tags: ['V3', 'Approval', 'Audit trail'],
      outcome: 'Production receives one complete, trusted file.'
    }
  };

  const selectRecord = (skill) => {
      const record = featureRecords[skill.dataset.feature] || featureRecords.sides;
      detail.dataset.feature = skill.dataset.feature || 'sides';
      detail.querySelector('.feature-kicker').textContent = record.kicker;
      detail.querySelector('h3').textContent = skill.dataset.skill;
      detail.querySelector('p').textContent = skill.dataset.copy;
      detail.querySelector('.feature-story-connects strong').textContent = record.tags.join(' + ');
      detail.querySelector('.feature-outcome strong').textContent = record.outcome;

      detail.classList.remove('is-changing');
      void detail.offsetWidth;
      detail.classList.add('is-changing');
      skills.forEach((item) => {
        const selected = item === skill;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
  };

  skills.forEach((skill) => {
    skill.setAttribute('aria-pressed', 'false');
    skill.addEventListener('pointerenter', () => selectRecord(skill));
    skill.addEventListener('focus', () => selectRecord(skill));
    skill.addEventListener('click', () => selectRecord(skill));
  });
  if (skills.length) selectRecord(skills[0]);
  if (reducedMotion || matchMedia('(max-width: 760px)').matches) return;
  // Preserve the current orbit position on hover so records never jump on resume.
  wheel.addEventListener('pointerenter', () => { paused = true; pausedAt = performance.now(); });
  wheel.addEventListener('pointerleave', () => {
    started += performance.now() - pausedAt;
    paused = false;
  });

  function orbit(time) {
    if (!paused) {
      const duration = parseFloat(getComputedStyle(root).getPropertyValue('--orbit-duration')) || 18000;
      const angleBase = -((time - started) / duration) * 360;
      const radius = wheel.clientWidth * .405;
      skills.forEach((skill, index) => {
        const angle = (angleBase + phases[index]) * Math.PI / 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * .72;
        const depthFactor = (Math.sin(angle) + 1) / 2;
        const depth = (depthFactor * 90) - 45;
        skill.style.setProperty('--skill-x', `${x}px`);
        skill.style.setProperty('--skill-y', `${y}px`);
        skill.style.setProperty('--skill-z', `${depth}px`);
        skill.style.setProperty('--skill-scale', `${.86 + (depthFactor * .18)}`);
        skill.style.opacity = `${.68 + (depthFactor * .3)}`;
        skill.style.filter = `blur(${((1 - depthFactor) * .4).toFixed(2)}px)`;
      });
    }
    requestAnimationFrame(orbit);
  }
  orbit(performance.now());
}

/* Scroll position powers the parallax planes and the large rotation object. */
function initScrollProgress() {
  const parallax = document.querySelector('.parallax-section');
  const layers = [...document.querySelectorAll('.parallax-layer')];
  const rotationSection = document.querySelector('.rotation-section');
  const rotationObject = document.querySelector('.rotation-object');
  const rotationLayers = rotationObject ? [...rotationObject.querySelectorAll('.rotation-layer')] : [];
  const rotationReadout = document.querySelector('.rotation-status span');
  let ticking = false;

  function update() {
    if (!reducedMotion && parallax) {
      const rect = parallax.getBoundingClientRect();
      const depth = parseFloat(getComputedStyle(root).getPropertyValue('--parallax-strength')) || 1.45;
      const p = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      layers.forEach((layer, index) => {
        const speed = [44, 92, 150][index] * depth;
        layer.style.transform = `translate3d(0, ${(p - .5) * speed}px, 0) rotate(${(index - 1) * p * 5}deg)`;
      });
    }
    if (!reducedMotion && rotationSection && rotationObject) {
      const rect = rotationSection.getBoundingClientRect();
      const travel = Math.max(1, rotationSection.offsetHeight - window.innerHeight);
      const p = Math.max(0, Math.min(1, -rect.top / travel));
      const power = parseFloat(getComputedStyle(root).getPropertyValue('--rotation-strength')) || 1;
      const degrees = Math.round((p * 360 - 180) * power);
      const lerp = (from, to) => from + (to - from) * p;
      rotationObject.style.transform = `rotateX(${lerp(18, -8) * power}deg) rotateY(${lerp(-14, 14) * power}deg) rotateZ(${lerp(-7, 5)}deg) scale(${lerp(.82, 1.04)})`;
      const productionOutput = rotationObject.classList.contains('production-output');
      const layerPaths = productionOutput ? [
        [[-175, -118, -60, -32], [-100, 18, -155, -14]],
        [[165, -108, -18, 24], [-22, -28, -88, 4]],
        [[155, 138, 22, 15], [72, 15, -28, 8]],
        [[-128, 178, -130, -28], [0, -8, 118, -2]],
      ] : [
        [[-190, -135, -150, -48], [-22, 10, -85, -15]],
        [[190, -80, -25, 38], [0, 0, -25, 8]],
        [[-110, 165, 95, -38], [18, -8, 45, -5]],
      ];
      rotationLayers.forEach((layer, index) => {
        const [start, end] = layerPaths[index];
        const x = lerp(start[0], end[0]) * power;
        const y = lerp(start[1], end[1]) * power;
        const z = lerp(start[2], end[2]);
        const spin = lerp(start[3], end[3]) * power;
        layer.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${spin}deg) rotateY(${(1 - p) * (index + 1) * 25 * power}deg)`;
        layer.style.boxShadow = `${(1 - p) * 35}px ${26 + (1 - p) * 30}px ${42 + (1 - p) * 28}px rgba(0,0,0,${.22 + (1 - p) * .25})`;
        if (productionOutput) layer.style.opacity = index < rotationLayers.length - 1 ? `${1 - p * .65}` : '1';
      });
      if (rotationReadout) rotationReadout.textContent = `${String(Math.abs(degrees)).padStart(3, '0')}`;
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
}

/* Kinetic letters separate, lift, and turn on pointer movement while remaining legible. */
function initTypographyMotion() {
  const word = document.querySelector('.kinetic-word');
  if (!word) return;
  word.innerHTML = [...word.textContent].map((letter) => `<span class="kinetic-letter">${letter}</span>`).join('');
  document.querySelectorAll('.word-reveal span').forEach((item, index) => { item.style.animationDelay = `${index * .07}s`; });
  document.querySelectorAll('.text-link').forEach((link) => { link.innerHTML = [...link.textContent].map((letter) => `<span class="letter">${letter === ' ' ? '&nbsp;' : letter}</span>`).join(''); });
  if (!finePointer || reducedMotion) return;
  word.addEventListener('pointermove', (event) => {
    const rect = word.getBoundingClientRect();
    word.querySelectorAll('.kinetic-letter').forEach((letter, index) => {
      const center = rect.left + ((index + .5) / word.textContent.length) * rect.width;
      const distance = Math.abs(event.clientX - center);
      const force = Math.max(0, 1 - distance / 155);
      letter.style.transform = `translate3d(${(event.clientX - center) * force * .06}px, ${-force * 18}px, 0) rotate(${(event.clientX - center) * .035}deg) scaleX(${1 + force * .08})`;
    });
  });
  word.addEventListener('pointerleave', () => word.querySelectorAll('.kinetic-letter').forEach((letter) => { letter.style.transform = ''; }));
}

/* One reusable lens clones only the active display headline, scales it, and anchors its text under the pointer. */
function initHeadlineMagnifier() {
  if (!finePointer || reducedMotion) return;
  const lens = document.querySelector('.headline-lens');
  if (!lens) return;
  const lensCopy = lens.querySelector('.headline-lens-copy');
  const cursor = document.querySelector('.cursor');
  if (!lensCopy || !cursor) return;
  document.querySelectorAll('.section-intro h2').forEach((heading) => heading.classList.add('section-title'));
  document.querySelectorAll('.parallax-copy h2, #rotation-title, .cta-section h2').forEach((heading) => heading.classList.add('display-title'));
  document.querySelectorAll('.story-visual h2').forEach((heading) => heading.classList.add('story-title'));
  const selector = '.hero-title, .section-title, .display-title, .story-title, [data-magnifier]';
  let activeTarget = null;
  let lastX = 0;
  let lastY = 0;
  let lensTicking = false;

  function copyTypeStyles(source, clone) {
    const sourceNodes = [source, ...source.querySelectorAll('*')];
    const cloneNodes = [clone, ...clone.querySelectorAll('*')];
    sourceNodes.forEach((node, index) => {
      const styles = getComputedStyle(node);
      const duplicate = cloneNodes[index];
      if (!duplicate) return;
      duplicate.removeAttribute('id');
      duplicate.removeAttribute('class');
      Object.assign(duplicate.style, {
        color: styles.color,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        fontStyle: styles.fontStyle,
        lineHeight: styles.lineHeight,
        letterSpacing: styles.letterSpacing,
        wordSpacing: styles.wordSpacing,
        textTransform: styles.textTransform,
        textDecoration: styles.textDecoration,
        textAlign: styles.textAlign,
        textShadow: styles.textShadow,
        display: styles.display,
        whiteSpace: styles.whiteSpace,
      });
    });
  }

  function updateLens(x, y) {
    if (!activeTarget) return;
    const rect = activeTarget.getBoundingClientRect();
    const rootStyles = getComputedStyle(root);
    const size = parseFloat(rootStyles.getPropertyValue('--magnifier-size')) || 184;
    const scale = parseFloat(rootStyles.getPropertyValue('--magnifier-scale')) || 1.68;
    lens.style.left = `${x - size / 2}px`;
    lens.style.top = `${y - size / 2}px`;
    // The clone is positioned inside the lens itself, so the exact text point under the cursor stays centered.
    lensCopy.style.left = `${size / 2 - (x - rect.left) * scale}px`;
    lensCopy.style.top = `${size / 2 - (y - rect.top) * scale}px`;
    lensCopy.style.width = `${rect.width}px`;
    lensCopy.style.transform = `scale(${scale})`;
  }

  // Scroll and pointer events can fire quickly; one frame keeps lens alignment smooth without repeated layout work.
  function scheduleLensUpdate() {
    if (lensTicking) return;
    lensTicking = true;
    requestAnimationFrame(() => {
      updateLens(lastX, lastY);
      lensTicking = false;
    });
  }

  document.querySelectorAll(selector).forEach((headline) => {
    headline.classList.add('magnifier-target');
    headline.addEventListener('pointerenter', (event) => {
      if (root.classList.contains('cursor-off')) return;
      activeTarget = headline;
      const clone = headline.cloneNode(true);
      copyTypeStyles(headline, clone);
      [clone, ...clone.querySelectorAll('*')].forEach((node) => {
        node.style.opacity = '1'; node.style.filter = 'none'; node.style.animation = 'none';
      });
      Object.assign(clone.style, { position: 'absolute', margin: '0', transformOrigin: 'top left' });
      lensCopy.replaceChildren(clone);
      root.classList.add('magnifier-active');
      cursor.className = 'cursor is-magnifier';
      lens.classList.toggle('on-dark', Boolean(headline.closest('.message-banner')));
      lens.classList.add('is-active');
      lastX = event.clientX; lastY = event.clientY;
      updateLens(lastX, lastY);
    });
    headline.addEventListener('pointerleave', () => {
      activeTarget = null;
      root.classList.remove('magnifier-active');
      lens.classList.remove('is-active');
      lens.classList.remove('on-dark');
      lensCopy.replaceChildren();
      cursor.className = 'cursor';
    });
  });

  window.addEventListener('pointermove', (event) => {
    if (!activeTarget) return;
    lastX = event.clientX; lastY = event.clientY;
    scheduleLensUpdate();
  }, { passive: true });
  window.addEventListener('scroll', scheduleLensUpdate, { passive: true });
  window.addEventListener('resize', () => updateLens(lastX, lastY));
}

/* Story panels update the sticky card's copy and transform state while read. */
function initStorytelling() {
  const visual = document.querySelector('.story-visual');
  if (!visual) return;
  const section = visual.closest('.product-journey');
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
function initStoryStructure() {
  const hiddenArtworkDemo = document.querySelector('.artwork-motion-section.is-temporarily-hidden');
  const productJourney = document.querySelector('.product-journey');
  if (!hiddenArtworkDemo || !productJourney) return;
  hiddenArtworkDemo.after(productJourney);
}

function initHeroOrbit() {
  const hero = document.querySelector('.hero-object');
  if (hero) hero.dataset.motion = reducedMotion ? 'reduced' : 'full';
}

function initParallaxCleanup() { initMessyWorkflow(); }
function initStickyWorkflow() { initStorytelling(); }
function initMockupMotion() { initArtworkMotion(); }
function initVersionStack() { initVersionControl(); }
function initApprovalInteraction() { initClientApproval(); }
function initProductionReveal() { initScrollProgress(); }
function initFeatureCards() { initTiltCards(); }


/* Accessible feature menu shared by the landing page and future product pages. */
function initFeaturesNavigation() {
  const nav = document.querySelector('.feature-nav');
  const trigger = nav?.querySelector('.feature-menu-trigger');
  if (!nav || !trigger) return;
  if (nav.dataset.navReady === 'true') return;
  nav.dataset.navReady = 'true';
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
  };
  trigger.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  document.addEventListener('click', (event) => { if (!nav.contains(event.target)) setOpen(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { setOpen(false); trigger.focus(); }
  });
}
initStoryStructure(); initReducedMotion(); initTestimonials();
initFeaturesNavigation();
initPromoCursor(); initMagneticElements(); initCursorSpotlight(); initTextReveals(); initHeroOrbit(); initParallaxCleanup(); initMockupMotion();
initVersionStack(); initApprovalInteraction(); initSkillsWheel(); initProductionReveal(); initFeatureCards(); initTypographyMotion(); initHeadlineMagnifier(); initStickyWorkflow(); initMobileQuickCTA();
