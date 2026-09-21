const workspaceRecords = {
  products: {
    label: 'Products',
    title: 'The selected product stays attached to the project.',
    copy: 'Supplier details, product imagery, sides, and color choices remain available to everyone working on the campaign.',
    connected: 'Artwork · Mockups · Production'
  },
  artwork: {
    label: 'Artwork',
    title: 'The original source file remains easy to identify.',
    copy: 'Logos and design assets stay beside the product, revisions, and approvals that depend on them.',
    connected: 'Products · Versions · Mockups'
  },
  customer: {
    label: 'Customer information',
    title: 'The people and requirements behind the order remain visible.',
    copy: 'Customer details, campaign context, and delivery expectations stay available to the teams doing the work.',
    connected: 'Project · Notes · Approval'
  },
  approvals: {
    label: 'Approvals',
    title: 'Every decision remains attached to the exact version.',
    copy: 'The team can verify what was approved, who approved it, and when the decision was made.',
    connected: 'Customer · Version · Timestamp'
  },
  notes: {
    label: 'Notes',
    title: 'Project context stays beside the work it explains.',
    copy: 'Internal details and customer requirements remain accessible without reopening old email threads.',
    connected: 'Customer · Artwork · Team'
  },
  production: {
    label: 'Production files',
    title: 'The final output stays connected to its approved source.',
    copy: 'Production teams receive the correct file with the product, placement, and decision history still available.',
    connected: 'Approved version · Product · Handoff'
  },
  history: {
    label: 'Project history',
    title: 'The complete project story remains easy to follow.',
    copy: 'Every meaningful change and handoff creates a clear record from project setup to production.',
    connected: 'Activity · Decisions · Output'
  }
};

/* The record explorer changes one editorial layer instead of imitating a product dashboard. */
function initWorkspaceRecordExplorer() {
  const tabs = [...document.querySelectorAll('.record-tabs button')];
  const panel = document.querySelector('.record-detail');
  const objectLabel = document.querySelector('.record-object article div strong');
  if (!tabs.length || !panel || !objectLabel) return;

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    const record = workspaceRecords[tab.dataset.record];
    if (!record) return;
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    panel.classList.add('is-changing');
    window.setTimeout(() => {
      panel.querySelector(':scope > small').textContent = record.label;
      panel.querySelector('h3').textContent = record.title;
      panel.querySelector(':scope > p').textContent = record.copy;
      panel.querySelector('div strong').textContent = record.connected;
      objectLabel.textContent = record.label;
      panel.classList.remove('is-changing');
    }, reducedMotion ? 0 : 170);
  }));
}

initWorkspaceRecordExplorer();
