// codegen:layout-pattern=generic-form
// Sample data for standalone/preview mode.
// In production, the confirmation object comes dynamically from bridge.toolResult.
// samplePayload lists the policyholder's Bajaj General plans — used to populate the
// policy picker so the form reflects the plans actually held.
const SAMPLE_PLANS = [
  { name: 'My Health Care Plan', category: 'Health Insurance' },
  { name: 'Health Guard', category: 'Health Insurance' },
  { name: 'My Family Complete', category: 'Health Insurance' },
  { name: 'HERizon Care', category: 'Health Insurance' },
  { name: 'Car Insurance', category: 'Motor Insurance' },
  { name: 'Two Wheeler Insurance', category: 'Motor Insurance' },
  { name: 'Travel Insurance', category: 'Travel Insurance' },
  { name: 'Home Insurance', category: 'Home Insurance' },
  { name: 'Pet Insurance', category: 'Pet Insurance' },
  { name: 'Cyber Insurance', category: 'Cyber Insurance' },
];

// Brand colors from DESIGN_TOKENS.color (Assurance Blue). getThemedCardBg darkens
// PALETTE[0] (#005dac) to luminance <= 0.12 so white text has WCAG AA contrast.
const PALETTE = ['#005dac', '#f58220', '#454545'];
const CTA_REST = '#f58220';
const CTA_HOVER = '#d96f14';
const ACCENT = '#005dac';

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CLAIM_TYPES = [
  'Health Cashless',
  'Health Reimbursement',
  'Motor Accident',
  'Motor Theft',
  'Travel',
  'Home',
  'Pet',
  'Cyber',
  'Commercial',
];

// Documents that adapt to the selected claim pathway.
const DOC_MAP = {
  'Health Cashless': ['Policy copy / e-card', 'Photo ID proof', 'Hospital admission note', 'Doctor prescription', 'Pre-authorisation form'],
  'Health Reimbursement': ['Policy copy / e-card', 'Photo ID proof', 'Itemised hospital bills', 'Discharge summary', 'Doctor prescription', 'Payment receipts'],
  'Motor Accident': ['Policy copy', 'Driving licence', 'Registration certificate (RC)', 'FIR (if applicable)', 'Damage photos', 'Repair estimate'],
  'Motor Theft': ['Policy copy', 'Registration certificate (RC)', 'FIR copy', 'Original keys', 'RTO transfer papers'],
  Travel: ['Policy copy', 'Passport / ID', 'Tickets & boarding pass', 'Medical report', 'Original bills & receipts'],
  Home: ['Policy copy', 'Photos of damage', 'Ownership / rent proof', 'Repair or replacement estimate'],
  Pet: ['Policy copy', 'Vaccination record', 'Veterinary bills', 'Treatment prescription'],
  Cyber: ['Policy copy', 'Screenshots of fraud', 'Bank / transaction statement', 'Police / cyber-cell complaint'],
  Commercial: ['Policy copy', 'Incident report', 'Loss estimate', 'Supporting invoices'],
};

function isConfirmation(obj) {
  return !!(obj && (obj.confirmation_id || obj.status || obj.assistance_channel));
}

export default async function decorate(block, bridge) {
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      if (isConfirmation(structuredContent)) confirmation = structuredContent;
    }
    render(block, confirmation, bridge);
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    render(block, null, bridge);
  }
}

function render(block, confirmation, bridge) {
  block.textContent = '';
  if (confirmation) {
    renderConfirmation(block, confirmation, bridge);
  } else {
    renderForm(block, bridge);
  }
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function renderForm(block, bridge) {
  const state = {
    step: 0,
    claim_type: CLAIM_TYPES[0],
    policy_number: '',
    incident_date: '',
    incident_location: '',
    incident_summary: '',
    claimant_contact: '',
    docs: {},
  };
  const STEPS = ['Policy', 'Incident', 'Evidence'];

  const card = el('div', 'ric-card');

  const header = el('div', 'ric-header');
  header.style.cssText = `background:${theme?.bg ?? '#003a6b'};color:${theme?.fg ?? '#fff'}`;
  header.appendChild(el('h3', 'ric-title', 'Register a Claim'));
  header.appendChild(el('p', 'ric-sub', 'Bajaj General Insurance'));
  card.appendChild(header);

  // Progress indicator
  const prog = el('div', 'ric-progress');
  const dots = STEPS.map((label, i) => {
    const s = el('div', 'ric-step');
    const dot = el('span', 'ric-dot', String(i + 1));
    const lbl = el('span', 'ric-step-label', label);
    s.appendChild(dot);
    s.appendChild(lbl);
    prog.appendChild(s);
    return s;
  });
  card.appendChild(prog);

  const body = el('div', 'ric-body');
  card.appendChild(body);

  const footer = el('div', 'ric-footer');
  card.appendChild(footer);

  const disclaimer = el('p', 'ric-disclaimer', 'Registration does not confirm claim approval. Admissibility and settlement remain subject to verification and policy terms.');
  card.appendChild(disclaimer);

  block.appendChild(card);

  function field(labelText) {
    const wrap = el('div', 'ric-field');
    wrap.appendChild(el('label', 'ric-label', labelText));
    return wrap;
  }

  function selectEl(options, value, onChange) {
    const sel = el('select', 'ric-input');
    options.forEach((o) => {
      const opt = el('option', null, o);
      opt.value = o;
      if (o === value) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => onChange(sel.value));
    return sel;
  }

  function renderStep() {
    dots.forEach((s, i) => {
      s.classList.toggle('active', i === state.step);
      s.classList.toggle('done', i < state.step);
    });
    body.textContent = '';
    footer.textContent = '';

    if (state.step === 0) {
      const t = field('Claim type');
      t.appendChild(selectEl(CLAIM_TYPES, state.claim_type, (v) => { state.claim_type = v; }));
      body.appendChild(t);

      const p = field('Policy');
      const policyOpts = SAMPLE_PLANS.map((pl) => pl.name);
      const pSel = selectEl(['Select a policy…', ...policyOpts], state.policy_number || 'Select a policy…', (v) => {
        state.policy_number = v === 'Select a policy…' ? '' : v;
      });
      p.appendChild(pSel);
      body.appendChild(p);

      const num = field('Policy number');
      const numInput = el('input', 'ric-input');
      numInput.type = 'text';
      numInput.placeholder = 'e.g. OG-24-1901-8402-00000001';
      numInput.value = state.policy_number;
      numInput.addEventListener('input', () => { state.policy_number = numInput.value; });
      num.appendChild(numInput);
      body.appendChild(num);
    } else if (state.step === 1) {
      const d = field('Incident date');
      const dInput = el('input', 'ric-input');
      dInput.type = 'date';
      dInput.value = state.incident_date;
      dInput.addEventListener('input', () => { state.incident_date = dInput.value; });
      d.appendChild(dInput);
      body.appendChild(d);

      const loc = field('Incident location');
      const locInput = el('input', 'ric-input');
      locInput.type = 'text';
      locInput.placeholder = 'City / hospital / place of loss';
      locInput.value = state.incident_location;
      locInput.addEventListener('input', () => { state.incident_location = locInput.value; });
      loc.appendChild(locInput);
      body.appendChild(loc);

      const sum = field('What happened');
      const sumInput = el('textarea', 'ric-input ric-textarea');
      sumInput.rows = 3;
      sumInput.placeholder = 'Briefly describe the incident and the expenses or assistance required.';
      sumInput.value = state.incident_summary;
      sumInput.addEventListener('input', () => { state.incident_summary = sumInput.value; });
      sum.appendChild(sumInput);
      body.appendChild(sum);

      const c = field('Contact (phone or email)');
      const cInput = el('input', 'ric-input');
      cInput.type = 'text';
      cInput.placeholder = 'Best number or email to reach you';
      cInput.value = state.claimant_contact;
      cInput.addEventListener('input', () => { state.claimant_contact = cInput.value; });
      c.appendChild(cInput);
      body.appendChild(c);
    } else if (state.step === 2) {
      const intro = field('Documents available');
      body.appendChild(intro);
      const docs = DOC_MAP[state.claim_type] || DOC_MAP['Health Reimbursement'];
      const list = el('div', 'ric-checklist');
      docs.forEach((doc) => {
        const row = el('label', 'ric-check');
        const cb = el('input');
        cb.type = 'checkbox';
        cb.checked = !!state.docs[doc];
        cb.addEventListener('change', () => { state.docs[doc] = cb.checked; });
        row.appendChild(cb);
        row.appendChild(el('span', null, doc));
        list.appendChild(row);
      });
      body.appendChild(list);
    }

    // Footer buttons
    if (state.step > 0) {
      const back = el('button', 'ric-btn ric-btn-ghost', 'Back');
      back.type = 'button';
      back.addEventListener('click', () => { state.step -= 1; renderStep(); });
      footer.appendChild(back);
    }

    if (state.step < STEPS.length - 1) {
      const next = el('button', 'ric-btn ric-btn-primary', 'Continue');
      next.type = 'button';
      next.addEventListener('click', () => { state.step += 1; renderStep(); });
      footer.appendChild(next);
    } else {
      const submit = el('button', 'ric-btn ric-btn-primary', 'Register Claim');
      submit.type = 'button';
      submit.addEventListener('click', () => submitClaim(state, bridge));
      footer.appendChild(submit);

      const urgent = /Health|Motor|Travel/.test(state.claim_type);
      if (urgent) {
        const assist = el('button', 'ric-btn ric-btn-ghost', state.claim_type.startsWith('Motor') ? 'Call Roadside Assistance' : 'Find Network Provider');
        assist.type = 'button';
        assist.addEventListener('click', () => {
          if (!bridge) return;
          if (state.claim_type.startsWith('Motor')) {
            bridge.sendMessage('Connect me to Bajaj General roadside / emergency assistance for my motor claim.');
          } else {
            bridge.sendMessage(`Find a Bajaj General network hospital or provider near ${state.incident_location || 'me'} for my ${state.claim_type} claim.`);
          }
        });
        footer.appendChild(assist);
      }
    }
  }

  renderStep();
}

function submitClaim(state, bridge) {
  if (!bridge) return;
  const availableDocs = Object.keys(state.docs).filter((d) => state.docs[d]);
  const parts = [
    `Register a ${state.claim_type} insurance claim.`,
    state.policy_number ? `Policy: ${state.policy_number}.` : '',
    state.incident_date ? `Incident date: ${state.incident_date}.` : '',
    state.incident_location ? `Location: ${state.incident_location}.` : '',
    state.incident_summary ? `Details: ${state.incident_summary}.` : '',
    state.claimant_contact ? `Contact: ${state.claimant_contact}.` : '',
    availableDocs.length ? `Documents available: ${availableDocs.join(', ')}.` : '',
  ].filter(Boolean);
  bridge.sendMessage(parts.join(' '));
}

function renderConfirmation(block, c, bridge) {
  const card = el('div', 'ric-card');

  const header = el('div', 'ric-header ric-header-confirm');
  header.style.cssText = `background:${theme?.bg ?? '#003a6b'};color:${theme?.fg ?? '#fff'}`;
  header.appendChild(el('h3', 'ric-title', 'Claim Registered'));
  if (c.confirmation_id) {
    header.appendChild(el('p', 'ric-ref', `Reference: ${c.confirmation_id}`));
  }
  if (c.status) {
    const chip = el('span', 'ric-status', c.status);
    header.appendChild(chip);
  }
  card.appendChild(header);

  const body = el('div', 'ric-body');

  if (c.message) {
    body.appendChild(el('p', 'ric-message', c.message));
  }

  if (Array.isArray(c.required_documents) && c.required_documents.length) {
    body.appendChild(el('div', 'ric-section-label', 'Required documents'));
    const list = el('div', 'ric-checklist');
    const missing = new Set(Array.isArray(c.missing_documents) ? c.missing_documents : []);
    c.required_documents.forEach((doc) => {
      const row = el('div', 'ric-doc-row');
      const isMissing = missing.has(doc);
      const mark = el('span', isMissing ? 'ric-mark ric-mark-missing' : 'ric-mark ric-mark-ok', isMissing ? '!' : '✓');
      row.appendChild(mark);
      row.appendChild(el('span', 'ric-doc-name', doc));
      if (isMissing) row.appendChild(el('span', 'ric-doc-tag', 'still needed'));
      list.appendChild(row);
    });
    body.appendChild(list);
  } else if (Array.isArray(c.missing_documents) && c.missing_documents.length) {
    body.appendChild(el('div', 'ric-section-label', 'Documents still needed'));
    const list = el('div', 'ric-checklist');
    c.missing_documents.forEach((doc) => {
      const row = el('div', 'ric-doc-row');
      row.appendChild(el('span', 'ric-mark ric-mark-missing', '!'));
      row.appendChild(el('span', 'ric-doc-name', doc));
      list.appendChild(row);
    });
    body.appendChild(list);
  }

  if (c.assistance_channel) {
    const assist = el('div', 'ric-assist');
    assist.appendChild(el('span', 'ric-assist-label', 'Assistance'));
    assist.appendChild(el('span', 'ric-assist-val', c.assistance_channel));
    body.appendChild(assist);
  }

  card.appendChild(body);

  const footer = el('div', 'ric-footer');
  if (c.next_step_url && bridge) {
    const cont = el('button', 'ric-btn ric-btn-primary', 'Continue Online');
    cont.type = 'button';
    cont.addEventListener('click', () => bridge.openLink(c.next_step_url));
    footer.appendChild(cont);
  }
  if (bridge) {
    const track = el('button', 'ric-btn ric-btn-ghost', 'Track Status');
    track.type = 'button';
    track.addEventListener('click', () => bridge.sendMessage(`Track the status of my claim ${c.confirmation_id || ''}`.trim()));
    footer.appendChild(track);
  }
  card.appendChild(footer);

  const disclaimer = el('p', 'ric-disclaimer', 'Registration does not confirm claim approval. Admissibility and settlement remain subject to verification and policy terms.');
  card.appendChild(disclaimer);

  block.appendChild(card);
}
