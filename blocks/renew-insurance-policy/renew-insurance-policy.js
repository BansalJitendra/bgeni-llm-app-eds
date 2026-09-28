// codegen:layout-pattern=generic-form
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  confirmation_id: 'RNW-HG-2026-0093412',
  status: 'In Progress',
  message: 'Policy located and renewal journey started. Contact details verified. Complete payment to activate continued cover.',
  renewal_amount: 18450,
  currency: 'INR',
  coverage_summary: 'Health Guard — Individual & Floater, family floater ₹10 lakh sum insured, in-patient + day-care + AYUSH cover.',
  requirements: [
    'Confirm updated registered mobile number',
    'Complete KYC re-verification',
    'Disclose any claims since last renewal',
  ],
  next_step_url: 'https://www.bajajgeneralinsurance.com',
};

// Context shown in the review header before submission (preview / no-result state).
const REVIEW_CONTEXT = {
  policy_type: 'Health Insurance',
  policy_name: 'Health Guard',
  policy_number: 'HG-4471-8890-2261',
  expiry: '31 Oct 2026',
  continuity: 'No coverage gap',
  coverage_summary: 'Family floater ₹10 lakh — in-patient hospitalisation, day-care, pre/post-hospitalisation, AYUSH cover.',
  attention: [
    'Update registered contact information',
    'Complete KYC re-verification',
    'Disclose prior claims (if any)',
  ],
};

// Brand colors from DESIGN_TOKENS' color tier.
const PALETTE = ['#005dac', '#f58220', '#ffffff', '#454545', '#131619', '#ff3b30'];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
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

function maskPolicyNumber(num) {
  if (!num) return '';
  const clean = String(num).replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  return `•••• ${clean.slice(-4)}`;
}

function formatAmount(amount, currency) {
  if (amount == null || isNaN(Number(amount))) return '';
  const n = Number(amount);
  const cur = currency || 'INR';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n);
  } catch (e) {
    return `${cur} ${n.toLocaleString('en-IN')}`;
  }
}

export default async function decorate(block, bridge) {
  let result = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      result = SAMPLE_DATA;
    } else {
      // Single confirmation object — read structuredContent directly (flat).
      const _result = await bridge.toolResult;
      result = _result?.structuredContent || {};
    }
  } else {
    result = SAMPLE_DATA;
  }

  block.textContent = '';

  const hasConfirmation = result && (result.confirmation_id || result.status);
  if (hasConfirmation) {
    renderConfirmation(block, result, bridge);
  } else {
    renderReview(block, REVIEW_CONTEXT, bridge);
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

function buildHeader(ctx) {
  const header = document.createElement('div');
  header.className = 'rip-header';
  header.style.cssText = `background:${theme?.bg ?? '#003a6b'};color:${theme?.fg ?? '#fff'};`;

  if (ctx.policy_type) {
    const type = document.createElement('span');
    type.className = 'rip-type';
    type.textContent = ctx.policy_type;
    header.appendChild(type);
  }

  const title = document.createElement('h3');
  title.className = 'rip-title';
  title.textContent = ctx.policy_name || 'Policy Renewal';
  header.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'rip-meta';

  if (ctx.policy_number) {
    const pn = document.createElement('span');
    pn.textContent = maskPolicyNumber(ctx.policy_number);
    meta.appendChild(pn);
  }
  if (ctx.expiry) {
    const ex = document.createElement('span');
    ex.textContent = `Expires ${ctx.expiry}`;
    meta.appendChild(ex);
  }
  header.appendChild(meta);

  if (ctx.continuity) {
    const chip = document.createElement('span');
    chip.className = 'rip-chip';
    chip.textContent = ctx.continuity;
    header.appendChild(chip);
  }

  if (ctx.coverage_summary) {
    const cov = document.createElement('p');
    cov.className = 'rip-coverage';
    cov.textContent = ctx.coverage_summary;
    header.appendChild(cov);
  }

  return header;
}

function renderReview(block, ctx, bridge) {
  const card = document.createElement('div');
  card.className = 'rip-card';

  card.appendChild(buildHeader(ctx));

  const body = document.createElement('div');
  body.className = 'rip-body';

  if (Array.isArray(ctx.attention) && ctx.attention.length) {
    const attWrap = document.createElement('div');
    attWrap.className = 'rip-attention';
    const attLabel = document.createElement('span');
    attLabel.className = 'rip-attention-label';
    attLabel.textContent = 'Needs attention';
    attWrap.appendChild(attLabel);
    ctx.attention.forEach((a) => {
      const row = document.createElement('div');
      row.className = 'rip-attention-row';
      row.textContent = a;
      attWrap.appendChild(row);
    });
    body.appendChild(attWrap);
  }

  const form = document.createElement('form');
  form.className = 'rip-form';

  const fields = [
    { key: 'policy_type', label: 'Policy type', value: ctx.policy_type || '', placeholder: 'e.g. Health' },
    { key: 'policy_number', label: 'Policy number', value: ctx.policy_number || '', placeholder: 'Policy number' },
    { key: 'registered_mobile_number', label: 'Registered mobile number', value: '', placeholder: 'Registered mobile number' },
  ];

  const inputs = {};
  fields.forEach((f) => {
    const group = document.createElement('div');
    group.className = 'rip-field';
    const label = document.createElement('label');
    label.className = 'rip-label';
    label.textContent = f.label;
    label.setAttribute('for', `rip-${f.key}`);
    const input = document.createElement('input');
    input.className = 'rip-input';
    input.id = `rip-${f.key}`;
    input.type = f.key === 'registered_mobile_number' ? 'tel' : 'text';
    input.value = f.value;
    input.placeholder = f.placeholder;
    inputs[f.key] = input;
    group.appendChild(label);
    group.appendChild(input);
    form.appendChild(group);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'rip-cta';
  submit.textContent = 'Continue to Payment';
  form.appendChild(submit);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (bridge) {
      const pn = inputs.policy_number.value || ctx.policy_number || '';
      bridge.sendMessage(`Continue renewing my policy ${pn}`.trim());
    }
  });

  body.appendChild(form);
  card.appendChild(body);
  block.appendChild(card);
}

function renderConfirmation(block, result, bridge) {
  const card = document.createElement('div');
  card.className = 'rip-card';

  const header = document.createElement('div');
  header.className = 'rip-header';
  header.style.cssText = `background:${theme?.bg ?? '#003a6b'};color:${theme?.fg ?? '#fff'};`;

  const type = document.createElement('span');
  type.className = 'rip-type';
  type.textContent = 'Renewal';
  header.appendChild(type);

  const title = document.createElement('h3');
  title.className = 'rip-title';
  title.textContent = 'Renewal Started';
  header.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'rip-meta';
  if (result.confirmation_id) {
    const ref = document.createElement('span');
    ref.textContent = `Ref ${result.confirmation_id}`;
    meta.appendChild(ref);
  }
  header.appendChild(meta);

  if (result.status) {
    const chip = document.createElement('span');
    chip.className = 'rip-chip';
    chip.textContent = result.status;
    header.appendChild(chip);
  }

  if (result.coverage_summary) {
    const cov = document.createElement('p');
    cov.className = 'rip-coverage';
    cov.textContent = result.coverage_summary;
    header.appendChild(cov);
  }
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'rip-body';

  const amountStr = formatAmount(result.renewal_amount, result.currency);
  if (amountStr) {
    const amt = document.createElement('div');
    amt.className = 'rip-amount';
    const amtLabel = document.createElement('span');
    amtLabel.className = 'rip-amount-label';
    amtLabel.textContent = 'Renewal premium';
    const amtVal = document.createElement('span');
    amtVal.className = 'rip-amount-value';
    amtVal.textContent = amountStr;
    amt.appendChild(amtLabel);
    amt.appendChild(amtVal);
    body.appendChild(amt);
  }

  if (Array.isArray(result.requirements) && result.requirements.length) {
    const reqWrap = document.createElement('div');
    reqWrap.className = 'rip-attention';
    const reqLabel = document.createElement('span');
    reqLabel.className = 'rip-attention-label';
    reqLabel.textContent = 'Outstanding requirements';
    reqWrap.appendChild(reqLabel);
    result.requirements.forEach((r) => {
      const row = document.createElement('div');
      row.className = 'rip-attention-row';
      row.textContent = typeof r === 'string' ? r : (r?.label || r?.description || JSON.stringify(r));
      reqWrap.appendChild(row);
    });
    body.appendChild(reqWrap);
  }

  if (result.next_step_url) {
    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'rip-cta';
    cta.textContent = 'Continue Renewal';
    if (bridge) {
      cta.addEventListener('click', () => bridge.openLink(result.next_step_url));
    }
    body.appendChild(cta);
  }

  card.appendChild(body);
  block.appendChild(card);
}
