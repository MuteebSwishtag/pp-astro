const versionRecords = [
  {
    state: 'Original artwork',
    version: 'V1',
    note: 'The first artwork placement is saved as the beginning of the project history.',
    change: 'Initial placement',
    status: 'Saved',
    mark: { left: 74, top: 98, width: 42, height: 28, rotate: -8 }
  },
  {
    state: 'Client revision',
    version: 'V2',
    note: 'The logo is resized while the original version remains available for comparison.',
    change: 'Scale',
    status: 'Revision',
    mark: { left: 80, top: 92, width: 64, height: 42, rotate: 5 }
  },
  {
    state: 'Current version',
    version: 'V3',
    note: 'Artwork moved slightly upward and aligned to the product center.',
    change: 'Placement',
    status: 'In review',
    mark: { left: 83, top: 82, width: 54, height: 36, rotate: 0 }
  },
  {
    state: 'Approved version',
    version: 'Locked',
    note: 'The approved proof is clearly identified while every earlier revision stays in the audit trail.',
    change: 'Approval status',
    status: 'Approved',
    mark: { left: 83, top: 82, width: 54, height: 36, rotate: 0 }
  }
];

function initVersionControlLab() {
  const cards = [...document.querySelectorAll('.version-card')];
  const state = document.querySelector('#inspector-state');
  const version = document.querySelector('#inspector-version');
  const note = document.querySelector('#inspector-note');
  const change = document.querySelector('#inspector-change');
  const status = document.querySelector('#inspector-status');
  const mark = document.querySelector('#inspector-mark');

  if (!cards.length || !state || !mark) return;

  // A single shared render function keeps pointer and keyboard interactions identical.
  const renderVersion = (index) => {
    const record = versionRecords[index];
    if (!record) return;

    cards.forEach((card, cardIndex) => {
      const active = cardIndex === index;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-selected', String(active));
    });

    state.textContent = record.state;
    version.textContent = record.version;
    note.textContent = record.note;
    change.textContent = record.change;
    status.textContent = record.status;
    mark.style.left = `${record.mark.left}px`;
    mark.style.top = `${record.mark.top}px`;
    mark.style.width = `${record.mark.width}px`;
    mark.style.height = `${record.mark.height}px`;
    mark.style.transform = `rotate(${record.mark.rotate}deg)`;
  };

  cards.forEach((card, index) => {
    card.addEventListener('click', () => renderVersion(index));
    card.addEventListener('mouseenter', () => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) renderVersion(index);
    });
  });
}

document.addEventListener('DOMContentLoaded', initVersionControlLab);
