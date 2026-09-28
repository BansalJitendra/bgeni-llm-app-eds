// codegen:layout-pattern=plan-carousel
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [{"name": "My Health Care Plan", "category": "Health Insurance", "plan_type": "Individual and Floater", "description": "Comprehensive indemnity health plan with in-patient, pre- and post-hospitalisation cover, day-care procedures and sum insured restoration for individuals and families.", "sum_insured_range": "₹3 lakh to ₹75 lakh, and ₹1 crore to ₹5 crore", "eligibility_summary": "Covers self, spouse, parents, dependent children, parents-in-law, grandchildren and more; 36-month pre-existing disease waiting period; policy period 1/2/3 years.", "coverage_highlights": ["In-patient hospitalisation", "Pre- and post-hospitalisation", "Sum insured restoration", "Day-care procedures", "AYUSH cover"], "image_url": "https://www.bajajgeneralinsurance.com/content/dam/revampbagic/health-insurance/images/health-banner-img.webp"}, {"name": "Health Guard", "category": "Health Insurance", "plan_type": "Individual and Floater", "description": "Family floater and individual health plan covering hospitalisation, day-care and pre/post-hospitalisation expenses along with modern treatments.", "sum_insured_range": "₹1.5 lakh to ₹75 lakh, and ₹1 crore", "eligibility_summary": "Covers self, spouse, parents, dependent children, siblings, parents-in-law and grandchildren; 36-month pre-existing disease waiting period; policy period 1/2/3 years.", "coverage_highlights": ["In-patient hospitalisation", "Day-care procedures", "Modern treatments", "AYUSH cover", "Pre- and post-hospitalisation"], "image_url": "https://www.bajajgeneralinsurance.com/content/dam/revampbagic/health-insurance/images/healthguard.webp"}, {"name": "My Family Complete", "category": "Health Insurance", "plan_type": "Family Floater", "description": "Family health insurance plan providing complete hospitalisation cover for the whole family under a shared floater sum insured.", "coverage_highlights": ["Family floater cover", "In-patient hospitalisation", "Pre- and post-hospitalisation"], "image_url": "https://www.bajajgeneralinsurance.com/content/dam/revampbagic/health-insurance/images/Myfamilyimage.webp"}, {"name": "HERizon Care", "category": "Health Insurance", "plan_type": "Individual", "description": "Health insurance designed for women, covering hospitalisation together with women-specific health benefits.", "sum_insured_range": "₹3 lakh to ₹2 crore", "eligibility_summary": "Covers self, spouse (female), daughter, aunt and sister; 36-month pre-existing disease waiting period; policy period 1 to 5 years.", "coverage_highlights": ["Women-specific health cover", "In-patient hospitalisation", "Modern treatments", "AYUSH cover"], "image_url": "https://www.bajajgeneralinsurance.com/content/dam/revampbagic/health-insurance/images/herizon.webp"}, {"name": "Car Insurance", "category": "Motor Insurance", "description": "Comprehensive and third-party car insurance covering own damage, third-party liability and optional add-ons such as zero depreciation.", "image_url": "https://www.bajajgeneralinsurance.com/content/dam/revampbagic/motor-insurance/images/motor-banner-lop.webp"}, {"name": "Two Wheeler Insurance", "category": "Motor Insurance", "description": "Bike and two-wheeler insurance covering own damage and third-party liability, available as comprehensive and long-term cover.", "image_url": "https://www.bajajgeneralinsurance.com/content/dam/revampbagic/motor-insurance/images/bike-banner-img.webp"}, {"name": "Travel Insurance", "category": "Travel Insurance", "description": "Travel insurance covering medical emergencies, trip cancellation and baggage loss for domestic and international trips.", "image_url": "https://www.bajajgeneralinsurance.com/content/dam/revampbagic/travel-insurance/images/travel-banner-img.webp"}, {"name": "Home Insurance", "category": "Home Insurance", "description": "Home insurance protecting the house structure and its contents against fire, natural disasters, theft and other perils.", "image_url": "https://www.bajajgeneralinsurance.com/content/dam/revampbagic/home-insurance/images/home-banner-img.webp"}, {"name": "Pet Insurance", "category": "Pet Insurance", "description": "Pet insurance for dogs and cats covering veterinary treatment, hospitalisation and third-party liability.", "image_url": "https://www.bajajgeneralinsurance.com/content/dam/revampbagic/pet-insurance/images/pet-banner-img.webp"}, {"name": "Cyber Insurance", "category": "Cyber Insurance", "description": "Cyber insurance covering financial loss from online fraud, identity theft, phishing and other cyber risks.", "image_url": "https://www.bajajgeneralinsurance.com/content/dam/revampbagic/cyber-insurance/images/cyber-insurance-banner-img.webp"}];

// Brand colors from DESIGN_TOKENS' color tier — used to derive the card info-strip background.
const PALETTE = ['#005dac', '#f58220'];

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
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);
const CARD_COLORS = ['#005dac', '#f58220', '#0fb5ae', '#9256d9', '#d83790', '#2dca72'];

function truncate(str, max) {
  if (!str || str.length <= max) return str;
  return `${str.slice(0, max - 1).trimEnd()}…`;
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
      // structuredContent.plans — bare array outputSchema; key derived from actionName "search_insurance_plans"
      items = structuredContent?.plans || [];
    }
  } else {
    items = SAMPLE_DATA;
  }
  if (!items || !items.length) items = SAMPLE_DATA;
  items = items.filter((it) => it.is_deal !== true);

  renderItems(block, items, bridge);

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

function renderItems(block, items, bridge) {
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'search-insurance-plans-wrapper';

  const btnLeft = document.createElement('button');
  btnLeft.className = 'search-insurance-plans-arrow search-insurance-plans-arrow-left';
  btnLeft.setAttribute('aria-label', 'Scroll left');
  btnLeft.textContent = '◄';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'search-insurance-plans-track-wrap';

  const track = document.createElement('div');
  track.className = 'search-insurance-plans-track';

  const btnRight = document.createElement('button');
  btnRight.className = 'search-insurance-plans-arrow search-insurance-plans-arrow-right';
  btnRight.setAttribute('aria-label', 'Scroll right');
  btnRight.textContent = '►';

  const fade = document.createElement('div');
  fade.className = 'search-insurance-plans-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${theme?.bg ?? '#1a1a1a'}cc)`;

  items.slice(0, 6).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'search-insurance-plans-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'search-insurance-plans-img';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imgWrap.appendChild(img);
    } else {
      imgWrap.appendChild(colorDiv());
    }
    card.appendChild(imgWrap);

    const info = document.createElement('div');
    info.className = 'search-insurance-plans-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#ffffff'};`;

    const name = document.createElement('div');
    name.className = 'search-insurance-plans-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    if (item.description) {
      const desc = document.createElement('div');
      desc.className = 'search-insurance-plans-desc';
      desc.textContent = truncate(item.description, 82);
      info.appendChild(desc);
    }

    if (item.sum_insured_range) {
      const sum = document.createElement('div');
      sum.className = 'search-insurance-plans-sum';
      sum.textContent = truncate(item.sum_insured_range, 44);
      info.appendChild(sum);
    }

    const meta = document.createElement('div');
    meta.className = 'search-insurance-plans-meta';
    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'search-insurance-plans-badge';
      badge.textContent = item.category;
      meta.appendChild(badge);
    }
    if (item.plan_type) {
      const badge = document.createElement('span');
      badge.className = 'search-insurance-plans-badge';
      badge.textContent = item.plan_type;
      meta.appendChild(badge);
    }
    if (meta.childNodes.length) info.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'search-insurance-plans-actions';

    const cta = document.createElement('button');
    cta.className = 'search-insurance-plans-cta';
    cta.textContent = 'View Plan Details';
    if (bridge) {
      cta.addEventListener('click', () => {
        if (item.details_url) {
          bridge.openLink(item.details_url);
        } else {
          bridge.sendMessage(`Tell me more about ${item.name || 'this plan'}`);
        }
      });
    }
    actions.appendChild(cta);

    const cta2 = document.createElement('button');
    cta2.className = 'search-insurance-plans-cta-secondary';
    cta2.textContent = 'Estimate Premium';
    if (bridge) {
      cta2.addEventListener('click', () => {
        bridge.sendMessage(`Estimate the premium for ${item.name || 'this plan'}`);
      });
    }
    actions.appendChild(cta2);

    info.appendChild(actions);
    card.appendChild(info);
    track.appendChild(card);
  });

  trackWrap.appendChild(track);
  trackWrap.appendChild(fade);
  wrapper.appendChild(btnLeft);
  wrapper.appendChild(trackWrap);
  wrapper.appendChild(btnRight);
  block.appendChild(wrapper);

  const cardWidth = 230 + 16;
  btnLeft.addEventListener('click', () => track.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
  btnRight.addEventListener('click', () => track.scrollBy({ left: cardWidth, behavior: 'smooth' }));
  const updateArrows = () => {
    btnLeft.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    btnRight.style.display = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4 ? 'none' : 'flex';
  };
  track.addEventListener('scroll', updateArrows);
  updateArrows();
}
