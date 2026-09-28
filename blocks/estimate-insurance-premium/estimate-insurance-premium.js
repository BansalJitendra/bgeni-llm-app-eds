// codegen:layout-pattern=generic-detail
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  insurance_type: 'Health Insurance',
  estimated_premium: 18450,
  currency: 'INR',
  billing_period: 'per year',
  coverage_summary: 'Health Guard family floater, ₹10 lakh sum insured for 2 adults + 2 children',
  assumptions: [
    'Family floater covering 2 adults (age 38, 36) and 2 children',
    'Sum insured of ₹10 lakh, 1-year policy term',
    'No pre-existing declared conditions',
    'Metro-tier city location',
  ],
  premium_factors: [
    'Age of eldest insured member',
    'Sum insured selected',
    'City / zone of residence',
    'Number of members covered',
    'Add-ons and deductible chosen',
  ],
  missing_information: [
    'Exact date of birth for each member',
    'Any pre-existing medical conditions',
    'Preferred add-ons (e.g. maternity, personal accident)',
  ],
  disclaimer: 'This is an indicative estimate only. The final premium is subject to validation, plan configuration, applicable taxes, underwriting and selected add-ons.',
  next_step_url: 'https://www.bajajgeneralinsurance.com/health-insurance/health-guard-policy.jsp',
};

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

function formatPremium(amount, currency) {
  if (amount === undefined || amount === null || amount === '') return '';
  const num = Number(amount);
  if (Number.isNaN(num)) return String(amount);
  const symbol = CURRENCY_SYMBOLS[currency] || (currency ? `${currency} ` : '');
  const grouped = currency === 'INR'
    ? num.toLocaleString('en-IN')
    : num.toLocaleString('en-US');
  return `${symbol}${grouped}`;
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';

  if (!item || (item.estimated_premium === undefined && !item.insurance_type)) {
    const empty = document.createElement('p');
    empty.className = 'estimate-insurance-premium-empty';
    empty.textContent = 'No premium estimate is available yet.';
    block.appendChild(empty);
  } else {
    renderEstimate(block, item, bridge);
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

function buildList(titleText, items, className) {
  const section = document.createElement('div');
  section.className = `estimate-insurance-premium-section ${className}`;

  const title = document.createElement('h3');
  title.className = 'estimate-insurance-premium-section-title';
  title.textContent = titleText;
  section.appendChild(title);

  const list = document.createElement('ul');
  list.className = 'estimate-insurance-premium-list';
  items.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = entry;
    list.appendChild(li);
  });
  section.appendChild(list);
  return section;
}

function renderEstimate(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'estimate-insurance-premium-card';

  // 1. Hero section
  const hero = document.createElement('div');
  hero.className = 'estimate-insurance-premium-hero';

  const pill = document.createElement('span');
  pill.className = 'estimate-insurance-premium-pill';
  pill.textContent = 'Indicative estimate — not a final offer';
  hero.appendChild(pill);

  if (item.insurance_type) {
    const heading = document.createElement('h2');
    heading.className = 'estimate-insurance-premium-type';
    heading.textContent = item.insurance_type;
    hero.appendChild(heading);
  }

  const amountRow = document.createElement('div');
  amountRow.className = 'estimate-insurance-premium-amount-row';

  const amount = document.createElement('span');
  amount.className = 'estimate-insurance-premium-amount';
  amount.textContent = formatPremium(item.estimated_premium, item.currency);
  amountRow.appendChild(amount);

  if (item.billing_period) {
    const period = document.createElement('span');
    period.className = 'estimate-insurance-premium-period';
    period.textContent = item.billing_period;
    amountRow.appendChild(period);
  }
  hero.appendChild(amountRow);

  if (item.coverage_summary) {
    const summary = document.createElement('p');
    summary.className = 'estimate-insurance-premium-summary';
    summary.textContent = item.coverage_summary;
    hero.appendChild(summary);
  }
  card.appendChild(hero);

  // 2. Assumptions
  if (Array.isArray(item.assumptions) && item.assumptions.length) {
    card.appendChild(buildList('Assumptions', item.assumptions, 'estimate-insurance-premium-assumptions'));
  }

  // 3. Premium factors
  if (Array.isArray(item.premium_factors) && item.premium_factors.length) {
    card.appendChild(buildList('What affects your price', item.premium_factors, 'estimate-insurance-premium-factors'));
  }

  // 4. Missing information — warning callout
  if (Array.isArray(item.missing_information) && item.missing_information.length) {
    const warn = document.createElement('div');
    warn.className = 'estimate-insurance-premium-section estimate-insurance-premium-missing';

    const title = document.createElement('h3');
    title.className = 'estimate-insurance-premium-section-title';
    title.textContent = 'Still needed for a final quote';
    warn.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'estimate-insurance-premium-warn-list';
    item.missing_information.forEach((entry) => {
      const li = document.createElement('li');
      const glyph = document.createElement('span');
      glyph.className = 'estimate-insurance-premium-warn-glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = '⚠';
      li.appendChild(glyph);
      const text = document.createElement('span');
      text.textContent = entry;
      li.appendChild(text);
      list.appendChild(li);
    });
    warn.appendChild(list);
    card.appendChild(warn);
  }

  // Disclaimer footnote
  if (item.disclaimer) {
    const note = document.createElement('p');
    note.className = 'estimate-insurance-premium-disclaimer';
    note.textContent = item.disclaimer;
    card.appendChild(note);
  }

  // CTAs
  const actions = document.createElement('div');
  actions.className = 'estimate-insurance-premium-actions';

  const adjustBtn = document.createElement('button');
  adjustBtn.type = 'button';
  adjustBtn.className = 'estimate-insurance-premium-btn estimate-insurance-premium-btn-secondary';
  adjustBtn.textContent = 'Adjust Coverage';
  if (bridge) {
    adjustBtn.addEventListener('click', () => {
      const type = item.insurance_type || 'insurance';
      bridge.sendMessage(`I would like to adjust the coverage for this ${type} estimate`);
    });
  }
  actions.appendChild(adjustBtn);

  const quoteBtn = document.createElement('button');
  quoteBtn.type = 'button';
  quoteBtn.className = 'estimate-insurance-premium-btn estimate-insurance-premium-btn-primary';
  quoteBtn.textContent = 'Get Quote';
  if (bridge) {
    quoteBtn.addEventListener('click', () => {
      if (item.next_step_url) {
        bridge.openLink(item.next_step_url);
      } else {
        const type = item.insurance_type || 'insurance';
        bridge.sendMessage(`I would like to get a final quote for this ${type} estimate`);
      }
    });
  }
  actions.appendChild(quoteBtn);
  card.appendChild(actions);

  block.appendChild(card);
}
