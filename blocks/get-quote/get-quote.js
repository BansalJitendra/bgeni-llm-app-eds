// codegen:layout-pattern=booking-form
// Sample data for standalone/preview mode.
// In production, the confirmation result comes from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'My Health Care Plan',
    category: 'Health Insurance',
    plan_type: 'Individual and Floater',
    description: 'Comprehensive indemnity health plan with in-patient, pre- and post-hospitalisation cover, day-care procedures and sum insured restoration for individuals and families.',
    sum_insured_range: '₹3 lakh to ₹75 lakh, and ₹1 crore to ₹5 crore',
    eligibility_summary: 'Covers self, spouse, parents, dependent children, parents-in-law, grandchildren and more; 36-month pre-existing disease waiting period; policy period 1/2/3 years.',
    coverage_highlights: ['In-patient hospitalisation', 'Pre- and post-hospitalisation', 'Sum insured restoration', 'Day-care procedures', 'AYUSH cover'],
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/health-insurance/images/health-banner-img.webp',
  },
  {
    name: 'Health Guard',
    category: 'Health Insurance',
    plan_type: 'Individual and Floater',
    description: 'Family floater and individual health plan covering hospitalisation, day-care and pre/post-hospitalisation expenses along with modern treatments.',
    sum_insured_range: '₹1.5 lakh to ₹75 lakh, and ₹1 crore',
    eligibility_summary: 'Covers self, spouse, parents, dependent children, siblings, parents-in-law and grandchildren; 36-month pre-existing disease waiting period; policy period 1/2/3 years.',
    coverage_highlights: ['In-patient hospitalisation', 'Day-care procedures', 'Modern treatments', 'AYUSH cover', 'Pre- and post-hospitalisation'],
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/health-insurance/images/healthguard.webp',
  },
  {
    name: 'My Family Complete',
    category: 'Health Insurance',
    plan_type: 'Family Floater',
    description: 'Family health insurance plan providing complete hospitalisation cover for the whole family under a shared floater sum insured.',
    coverage_highlights: ['Family floater cover', 'In-patient hospitalisation', 'Pre- and post-hospitalisation'],
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/health-insurance/images/Myfamilyimage.webp',
  },
  {
    name: 'HERizon Care',
    category: 'Health Insurance',
    plan_type: 'Individual',
    description: 'Health insurance designed for women, covering hospitalisation together with women-specific health benefits.',
    sum_insured_range: '₹3 lakh to ₹2 crore',
    eligibility_summary: 'Covers self, spouse (female), daughter, aunt and sister; 36-month pre-existing disease waiting period; policy period 1 to 5 years.',
    coverage_highlights: ['Women-specific health cover', 'In-patient hospitalisation', 'Modern treatments', 'AYUSH cover'],
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/health-insurance/images/herizon.webp',
  },
  {
    name: 'Car Insurance',
    category: 'Motor Insurance',
    description: 'Comprehensive and third-party car insurance covering own damage, third-party liability and optional add-ons such as zero depreciation.',
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/motor-insurance/images/motor-banner-lop.webp',
  },
  {
    name: 'Two Wheeler Insurance',
    category: 'Motor Insurance',
    description: 'Bike and two-wheeler insurance covering own damage and third-party liability, available as comprehensive and long-term cover.',
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/motor-insurance/images/bike-banner-img.webp',
  },
  {
    name: 'Travel Insurance',
    category: 'Travel Insurance',
    description: 'Travel insurance covering medical emergencies, trip cancellation and baggage loss for domestic and international trips.',
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/travel-insurance/images/travel-banner-img.webp',
  },
  {
    name: 'Home Insurance',
    category: 'Home Insurance',
    description: 'Home insurance protecting the house structure and its contents against fire, natural disasters, theft and other perils.',
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/home-insurance/images/home-banner-img.webp',
  },
  {
    name: 'Pet Insurance',
    category: 'Pet Insurance',
    description: 'Pet insurance for dogs and cats covering veterinary treatment, hospitalisation and third-party liability.',
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/pet-insurance/images/pet-banner-img.webp',
  },
  {
    name: 'Cyber Insurance',
    category: 'Cyber Insurance',
    description: 'Cyber insurance covering financial loss from online fraud, identity theft, phishing and other cyber risks.',
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/cyber-insurance/images/cyber-insurance-banner-img.webp',
  },
];

// Brand colors from DESIGN_TOKENS' color tier.
const PALETTE = ['#005dac', '#f58220', '#ffffff', '#454545', '#131619'];
const CTA_REST = '#f58220';
const CTA_HOVER = '#d96f12';
const ACCENT = '#005dac';

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#005dac', '#f58220', '#0fb5ae', '#9256d9', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export default async function decorate(block, bridge) {
  let result = null;
  let plan = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      // Detail/confirmation concept — structuredContent IS the result object (flat).
      const _result = await bridge.toolResult;
      result = _result?.structuredContent || null;
    }
  }

  // Choose the plan to show in the form header. Prefer the plan matching the
  // returned insurance context; fall back to Health Guard (the requested plan).
  plan = SAMPLE_DATA.find((p) => p.name === 'Health Guard') || SAMPLE_DATA[0];

  block.textContent = '';
  if (result && (result.confirmation_id || result.status)) {
    renderConfirmation(block, result, bridge);
  } else {
    renderForm(block, plan, bridge);
  }

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function buildHeader(plan) {
  const header = el('div', 'gq-header');
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  if (plan && plan.image_url) {
    const img = document.createElement('img');
    img.className = 'gq-hero';
    img.src = plan.image_url;
    img.alt = plan.name || 'Insurance plan';
    img.onerror = () => {
      const d = el('div', 'gq-hero');
      d.style.cssText = `background-color:${CARD_COLORS[0]};`;
      if (img.parentNode) img.parentNode.replaceChild(d, img);
    };
    header.appendChild(img);
  }

  const meta = el('div', 'gq-header-meta');
  const title = el('h3', 'gq-title', plan ? plan.name : 'Your quote');
  meta.appendChild(title);
  if (plan && plan.category) {
    const chip = el('span', 'gq-chip', plan.category + (plan.plan_type ? ` · ${plan.plan_type}` : ''));
    meta.appendChild(chip);
  }
  if (plan && plan.description) {
    const desc = el('p', 'gq-desc', plan.description);
    meta.appendChild(desc);
  }
  header.appendChild(meta);
  return header;
}

function fieldGroup(labelText, controlEl) {
  const wrap = el('div', 'gq-field');
  const label = el('label', 'gq-label', labelText);
  wrap.appendChild(label);
  wrap.appendChild(controlEl);
  return wrap;
}

function renderForm(block, plan, bridge) {
  const card = el('div', 'gq-card');
  card.appendChild(buildHeader(plan));

  const form = el('form', 'gq-form');
  form.setAttribute('novalidate', '');

  // Section: What you need covered
  form.appendChild(el('p', 'gq-section', 'What you need covered'));
  const typeSelect = document.createElement('select');
  typeSelect.className = 'gq-input';
  const categories = [...new Set(SAMPLE_DATA.map((p) => p.category))];
  categories.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    if (plan && c === plan.category) opt.selected = true;
    typeSelect.appendChild(opt);
  });
  form.appendChild(fieldGroup('Insurance type', typeSelect));

  // Section: Coverage preferences
  form.appendChild(el('p', 'gq-section', 'Coverage preferences'));
  const coverSelect = document.createElement('select');
  coverSelect.className = 'gq-input';
  ['Family floater', 'Individual', 'Individual + parents'].forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    coverSelect.appendChild(opt);
  });
  if (plan && /floater/i.test(plan.plan_type || '')) coverSelect.value = 'Family floater';
  form.appendChild(fieldGroup('Coverage preference', coverSelect));

  // Section: Contact details
  form.appendChild(el('p', 'gq-section', 'Contact details'));
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'gq-input';
  nameInput.placeholder = 'Full name';
  form.appendChild(fieldGroup('Applicant name', nameInput));

  const mobileInput = document.createElement('input');
  mobileInput.type = 'tel';
  mobileInput.className = 'gq-input';
  mobileInput.placeholder = '10-digit mobile number';
  form.appendChild(fieldGroup('Mobile number', mobileInput));

  const note = el('p', 'gq-note', 'Final premiums and eligibility depend on verification, selected benefits, and policy terms.');
  form.appendChild(note);

  const actions = el('div', 'gq-actions');
  const submit = el('button', 'gq-btn gq-btn-primary', 'Request Quote');
  submit.type = 'submit';
  const edit = el('button', 'gq-btn gq-btn-secondary', 'Edit Details');
  edit.type = 'button';
  actions.appendChild(submit);
  actions.appendChild(edit);
  form.appendChild(actions);

  edit.addEventListener('click', () => {
    nameInput.focus();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (bridge) {
      const who = nameInput.value.trim() || 'me';
      bridge.sendMessage(`Request an official Bajaj General quote for ${typeSelect.value} (${coverSelect.value}) for ${who}.`);
    }
  });

  card.appendChild(form);
  block.appendChild(card);
}

function renderConfirmation(block, result, bridge) {
  const card = el('div', 'gq-card');
  const header = el('div', 'gq-header gq-header-confirm');
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const check = el('div', 'gq-check', '✓');
  header.appendChild(check);
  const meta = el('div', 'gq-header-meta');
  meta.appendChild(el('h3', 'gq-title', 'Quote request received'));
  if (result.status) meta.appendChild(el('span', 'gq-chip', result.status));
  header.appendChild(meta);
  card.appendChild(header);

  const body = el('div', 'gq-confirm-body');

  if (result.confirmation_id) {
    const row = el('div', 'gq-ref');
    row.appendChild(el('span', 'gq-ref-label', 'Reference'));
    row.appendChild(el('span', 'gq-ref-value', result.confirmation_id));
    body.appendChild(row);
  }

  if (result.estimated_premium != null) {
    const row = el('div', 'gq-ref');
    row.appendChild(el('span', 'gq-ref-label', 'Est. premium'));
    const cur = result.currency || 'INR';
    row.appendChild(el('span', 'gq-ref-value', `${cur} ${result.estimated_premium}`));
    body.appendChild(row);
  }

  if (result.message) {
    body.appendChild(el('p', 'gq-message', result.message));
  }

  const actions = el('div', 'gq-actions');
  const cont = el('button', 'gq-btn gq-btn-primary', 'Continue on Bajaj General');
  cont.type = 'button';
  if (bridge) {
    cont.addEventListener('click', () => {
      if (result.next_step_url) bridge.openLink(result.next_step_url);
      else bridge.sendMessage('What is the next step for my Bajaj General quote?');
    });
  }
  actions.appendChild(cont);
  body.appendChild(actions);

  card.appendChild(body);
  block.appendChild(card);
}
