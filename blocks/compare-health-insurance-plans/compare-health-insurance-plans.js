// codegen:layout-pattern=comparison
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Health Guard',
    fit_summary: 'Families and individuals wanting broad hospitalisation cover with modern treatments and AYUSH.',
    sum_insured_range: '₹1.5 lakh to ₹75 lakh, and ₹1 crore',
    plan_type: 'Individual and Floater',
    eligible_members: ['Self', 'Spouse', 'Parents', 'Dependent children', 'Siblings', 'Parents-in-law', 'Grandchildren'],
    policy_duration: '1 / 2 / 3 years',
    waiting_periods: ['36-month pre-existing disease waiting period'],
    coverage_highlights: ['In-patient hospitalisation', 'Day-care procedures', 'Modern treatments', 'AYUSH cover', 'Pre- and post-hospitalisation'],
    add_ons: ['Room rent modification', 'Voluntary co-payment'],
    limitations: ['36-month pre-existing disease waiting', 'Sub-limits may apply on certain treatments'],
    details_url: 'https://www.bajajgeneralinsurance.com/health-insurance/health-guard.html',
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/health-insurance/images/healthguard.webp',
  },
  {
    name: 'My Family Complete',
    fit_summary: 'Whole family wanting complete hospitalisation cover under a shared floater sum insured.',
    sum_insured_range: 'Shared family floater sum insured',
    plan_type: 'Family Floater',
    eligible_members: ['Self', 'Spouse', 'Dependent children', 'Parents'],
    policy_duration: '1 year',
    waiting_periods: ['Standard pre-existing disease waiting period applies'],
    coverage_highlights: ['Family floater cover', 'In-patient hospitalisation', 'Pre- and post-hospitalisation'],
    add_ons: [],
    limitations: ['Cover shared across all insured members', 'Refer policy wording for exclusions'],
    details_url: 'https://www.bajajgeneralinsurance.com/health-insurance/my-family-complete.html',
    image_url: 'https://www.bajajgeneralinsurance.com/content/dam/revampbagic/health-insurance/images/Myfamilyimage.webp',
  },
];

// Brand palette from DESIGN_TOKENS (Assurance Blue). getThemedCardBg darkens
// PALETTE[0] to luminance <= 0.12 so white text keeps WCAG AA contrast.
const PALETTE = ['#005dac', '#f58220', '#ffffff', '#454545', '#131619', '#ff3b30'];
const ACCENT = '#005dac';
const CTA_BG = '#f58220';
const CTA_FG = '#ffffff';
const CARD_COLORS = ['#005dac', '#f58220', '#0fb5ae', '#9256d9', '#2dca72', '#e68619'];

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
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

function prettifyLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(v) {
  if (v === undefined || v === null || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  return String(v);
}

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      items = structuredContent?.plans || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  if (!items || !items.length) items = SAMPLE_DATA;

  block.textContent = '';
  renderComparison(block, items, bridge);

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

function renderComparison(block, items, bridge) {
  const planA = items[0] || {};
  const planB = items[1] || items[0] || {};
  const plans = [planA, planB];

  const card = document.createElement('div');
  card.className = 'compare-health-insurance-plans-card';

  // ---- Header panels (image + name + fit summary) ----
  const buildHeaderPanel = (plan, idx) => {
    const panel = document.createElement('div');
    panel.className = 'compare-health-insurance-plans-header-panel';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'compare-health-insurance-plans-header-image';
    const fallbackColor = CARD_COLORS[idx % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (plan.image_url) {
      const img = document.createElement('img');
      img.src = plan.image_url;
      img.alt = plan.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imageWrap.appendChild(img);
    } else {
      imageWrap.appendChild(colorDiv());
    }
    panel.appendChild(imageWrap);

    const content = document.createElement('div');
    content.className = 'compare-health-insurance-plans-header-content';
    content.style.background = theme ? theme.bg : '#003a6b';
    content.style.color = theme ? theme.fg : '#ffffff';

    const title = document.createElement('h3');
    title.className = 'compare-health-insurance-plans-header-title';
    title.textContent = plan.name || '';
    content.appendChild(title);

    if (plan.fit_summary) {
      const desc = document.createElement('p');
      desc.className = 'compare-health-insurance-plans-header-desc';
      desc.textContent = plan.fit_summary;
      content.appendChild(desc);
    }

    panel.appendChild(content);
    return panel;
  };

  const buildRowSpacer = () => {
    const spacer = document.createElement('div');
    spacer.className = 'compare-health-insurance-plans-row-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    return spacer;
  };

  const headerRow = document.createElement('div');
  headerRow.className = 'compare-health-insurance-plans-header-row';
  headerRow.appendChild(buildRowSpacer());
  headerRow.appendChild(buildHeaderPanel(planA, 0));
  headerRow.appendChild(buildHeaderPanel(planB, 1));
  card.appendChild(headerRow);

  // ---- Attribute table (one row per comparable field, header fields excluded) ----
  const HEADER_KEYS = { name: true, fit_summary: true, image_url: true, details_url: true };
  const ROW_FIELDS = [
    ['sum_insured_range', 'Sum Insured'],
    ['plan_type', 'Plan Type'],
    ['eligible_members', 'Members'],
    ['policy_duration', 'Duration'],
    ['waiting_periods', 'Waiting'],
    ['coverage_highlights', 'Hospitalisation'],
    ['add_ons', 'Add-ons'],
    ['limitations', 'Limitations'],
  ];

  const rows = [];
  ROW_FIELDS.forEach(([key, label]) => {
    if (HEADER_KEYS[key]) return;
    const a = planA[key];
    const b = planB[key];
    if (a === undefined && b === undefined) return;
    rows.push({ label, a, b });
  });

  const table = document.createElement('div');
  table.className = 'compare-health-insurance-plans-table';

  rows.forEach((row) => {
    const tr = document.createElement('div');
    tr.className = 'compare-health-insurance-plans-table-row';

    const label = document.createElement('div');
    label.className = 'compare-health-insurance-plans-table-label';
    label.textContent = row.label;
    tr.appendChild(label);

    const da = formatValue(row.a);
    const db = formatValue(row.b);
    const differs = da !== db;
    [da, db].forEach((text) => {
      const val = document.createElement('div');
      val.className = 'compare-health-insurance-plans-table-value'
        + (differs ? ' compare-health-insurance-plans-table-value-diff' : '');
      val.textContent = text;
      tr.appendChild(val);
    });

    table.appendChild(tr);
  });

  // ---- Per-plan "Estimate Premium" CTA row ----
  const ctaRow = document.createElement('div');
  ctaRow.className = 'compare-health-insurance-plans-table-row compare-health-insurance-plans-cta-row';
  ctaRow.appendChild(buildRowSpacer());
  plans.forEach((plan) => {
    const cta = document.createElement('button');
    cta.className = 'compare-health-insurance-plans-table-cta';
    cta.type = 'button';
    cta.textContent = 'Estimate Premium';
    if (bridge) {
      cta.addEventListener('click', () => {
        if (plan.details_url) bridge.openLink(plan.details_url);
        else bridge.sendMessage(`Estimate premium for ${plan.name || ''}`);
      });
    }
    ctaRow.appendChild(cta);
  });
  table.appendChild(ctaRow);

  // ---- Shared "Get Quote" CTA row (aligned to the two per-plan buttons combined) ----
  const sharedRow = document.createElement('div');
  sharedRow.className = 'compare-health-insurance-plans-table-row compare-health-insurance-plans-cta-row compare-health-insurance-plans-shared-cta-row';
  const sharedCta = document.createElement('button');
  sharedCta.className = 'compare-health-insurance-plans-table-cta compare-health-insurance-plans-shared-cta';
  sharedCta.type = 'button';
  sharedCta.textContent = 'Get Quote';
  if (bridge) {
    sharedCta.addEventListener('click', () => {
      bridge.sendMessage(`Get a quote comparing ${planA.name || ''} and ${planB.name || ''}`);
    });
  }
  sharedRow.appendChild(sharedCta);
  table.appendChild(sharedRow);

  card.appendChild(table);
  block.appendChild(card);
}
