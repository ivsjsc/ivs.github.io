(() => {
  'use strict';

  const guides = [
    {
      id: 'first-24-hours',
      category: 'start',
      title: 'Your first 24 hours in Vietnam',
      summary: 'A practical arrival checklist covering accommodation, connectivity, documents, local navigation and emergency readiness.',
      icon: 'fa-plane-arrival',
      level: 'Practical guide',
      points: [
        'Confirm your accommodation address and check-in arrangements.',
        'Keep passport and entry-status information secure and accessible.',
        'Set up a local SIM/eSIM if needed and save your employer or school contact.',
        'Save essential emergency information and locate a suitable nearby medical facility.',
        'Confirm who is handling temporary-residence registration for your accommodation.'
      ],
      note: 'Administrative requirements can depend on your status and accommodation type. Confirm current requirements with the competent authority or your host/employer.'
    },
    {
      id: 'first-30-days',
      category: 'start',
      title: 'First 30 days checklist',
      summary: 'Organize work authorization, banking, healthcare, housing, commuting and school onboarding without missing critical admin steps.',
      icon: 'fa-list-check',
      level: 'Checklist',
      points: [
        'Confirm your visa, residence and work-authorization plan with your employer.',
        'Keep secure copies of submitted documents, receipts and important correspondence.',
        'Review your employment contract, salary payment method and onboarding schedule.',
        'Set up a realistic monthly budget and identify your regular commute options.',
        'Confirm healthcare and insurance arrangements.'
      ]
    },
    {
      id: 'work-permit',
      category: 'legal',
      title: 'Work permit & work authorization',
      summary: 'Understand the document categories and questions to confirm before teaching or changing employers in Vietnam.',
      icon: 'fa-id-card',
      level: 'Official-source review required',
      points: [
        'Ask which legal basis your employer is using for your work authorization.',
        'Prepare degree, teaching qualification and experience evidence where applicable.',
        'Check whether health, criminal-record, legalization or Vietnamese translation documents are required for your case.',
        'Do not rely on old online checklists for exact deadlines, fees or exemption criteria.',
        'Keep copies of all employer submissions and approvals provided to you.'
      ],
      sources: [
        ['Vietnam legal documents', 'https://vanban.chinhphu.vn/'],
        ['National legal database', 'https://vbpl.vn/'],
        ['National Public Service Portal', 'https://dichvucong.gov.vn/']
      ],
      note: 'Legal requirements change. Exact eligibility, documents, deadlines, fees and exemptions must be checked against current official sources.'
    },
    {
      id: 'visa-residence',
      category: 'legal',
      title: 'Visa, entry status & residence',
      summary: 'A safe starting point for checking visa status, residence procedures and immigration-related changes.',
      icon: 'fa-passport',
      level: 'Official-source review required',
      points: [
        'Know your current entry/visa status and its validity period.',
        'Confirm whether a change of employer, passport, address or work location affects your immigration process.',
        'Ask your accommodation provider how temporary-residence registration is handled.',
        'Use the Immigration Department or competent public-service portal for current procedures.',
        'Never assume an agent or recruiter can guarantee approval.'
      ],
      sources: [
        ['Vietnam Immigration Department', 'https://xuatnhapcanh.gov.vn/'],
        ['National Public Service Portal', 'https://dichvucong.gov.vn/']
      ]
    },
    {
      id: 'vneid',
      category: 'legal',
      title: 'VNeID & digital public services',
      summary: 'Understand where digital identity may help and how to find IVS guidance without exposing personal identity information.',
      icon: 'fa-mobile-screen-button',
      level: 'Guide',
      points: [
        'Use only official apps and government portals for identity-related procedures.',
        'Do not publish passport, residence-card or identity screenshots publicly.',
        'Keep screenshots used for support anonymized whenever possible.',
        'Check the current eligibility and process before relying on older instructions.'
      ],
      internalLink: '/Pages/blogs/blog-vneid-guide.html'
    },
    {
      id: 'teacher-documents',
      category: 'career',
      title: 'Foreign teacher document checklist',
      summary: 'Prepare a professional application pack while keeping sensitive identity documents out of public profiles.',
      icon: 'fa-folder-open',
      level: 'Career readiness',
      points: [
        'CV/resume with current location, availability, education and teaching experience.',
        'Degree and teaching qualifications ready for secure employer review when needed.',
        'Clear list of subjects, age groups and curriculum experience.',
        'Short professional introduction and optional teaching-demo portfolio.',
        'Keep passport, criminal record and health documents private until legitimately requested through a secure process.'
      ]
    },
    {
      id: 'contract-checklist',
      category: 'career',
      title: 'Teaching contract checklist',
      summary: 'Questions to resolve before signing: duties, schedule, pay, probation, leave, authorization support and exit terms.',
      icon: 'fa-file-signature',
      level: 'Career readiness',
      points: [
        'Confirm employer legal name, job title, duties and primary workplace.',
        'Separate teaching hours from required preparation, meetings and administrative hours.',
        'Confirm salary, allowances, payment date, overtime/extra-class terms and probation.',
        'Clarify tax, insurance and visa/work-authorization responsibilities.',
        'Read termination, notice, confidentiality, IP and media-consent clauses.'
      ],
      note: 'This is a practical checklist, not legal advice.'
    },
    {
      id: 'teachermatch',
      category: 'career',
      title: 'Find teaching jobs with Aivy TeacherMatch',
      summary: 'Use the dedicated IVS recruitment marketplace for teacher profiles, job discovery, applications and employer connections.',
      icon: 'fa-briefcase',
      level: 'IVS ecosystem',
      points: [
        'Create an English-first teacher profile.',
        'Discover teaching opportunities and review role details.',
        'Use the platform application and communication flow instead of sending sensitive files to unknown contacts.',
        'Schools and education centers can use the employer workflow to find candidates.'
      ],
      externalLink: 'https://ivslearning.top/'
    },
    {
      id: 'housing',
      category: 'living',
      title: 'Housing & rental checklist',
      summary: 'Reduce deposit and registration problems by checking the property, contract, utility billing and landlord responsibilities.',
      icon: 'fa-house',
      level: 'Practical guide',
      points: [
        'Verify the address, landlord/property identity and written rental terms.',
        'Clarify deposit, notice period, utility rates and refund conditions.',
        'Photograph existing damage before moving in.',
        'Ask who handles temporary-residence registration.',
        'Avoid undocumented cash-only arrangements where possible.'
      ]
    },
    {
      id: 'banking',
      category: 'living',
      title: 'Banking, payments & money safety',
      summary: 'Understand the local payment landscape while protecting cards, OTPs and identity documents.',
      icon: 'fa-building-columns',
      level: 'Practical guide',
      points: [
        'Bank-account requirements for foreigners can vary by bank and legal status.',
        'QR payments and domestic transfers are widely used, but eligibility differs by provider.',
        'Never share OTP codes or remote-access credentials.',
        'Verify account names and transaction details before sending money.',
        'Keep tax and salary records for later administrative needs.'
      ]
    },
    {
      id: 'transport',
      category: 'living',
      title: 'Transport & getting around',
      summary: 'Plan commuting, ride-hailing and longer trips while paying attention to licence and insurance requirements.',
      icon: 'fa-motorcycle',
      level: 'Practical guide',
      points: [
        'Use reputable ride-hailing or transport services and verify the vehicle/driver shown in the app.',
        'Do not assume a foreign driving licence is automatically valid in Vietnam.',
        'Use a helmet on motorbikes and confirm insurance/rental conditions.',
        'Learn your school commute before your first teaching day.'
      ],
      sources: [
        ['Google Maps', 'https://maps.google.com/'],
        ['Grab Vietnam', 'https://www.grab.com/vn/'],
        ['Be', 'https://be.com.vn/']
      ]
    },
    {
      id: 'healthcare',
      category: 'living',
      title: 'Healthcare & insurance readiness',
      summary: 'Set up a simple medical plan before you need it: nearby care, insurance contacts, allergies and emergency information.',
      icon: 'fa-heart-pulse',
      level: 'Practical guide',
      points: [
        'Know what your insurance covers and whether pre-authorization is required.',
        'Identify a suitable nearby clinic or hospital.',
        'Keep medication names, allergies and emergency contacts accessible.',
        'Keep receipts and medical documents for insurance claims.'
      ]
    },
    {
      id: 'scam-safety',
      category: 'safety',
      title: 'Scams, recruitment fraud & document safety',
      summary: 'Protect yourself from fake job offers, housing scams, payment fraud and unnecessary sharing of identity documents.',
      icon: 'fa-shield-halved',
      level: 'Safety',
      points: [
        'Verify employer identity before sharing sensitive documents.',
        'Be cautious with large upfront recruitment or “guaranteed permit” fees.',
        'Do not send passport scans through public channels to unknown recruiters.',
        'Never share bank OTPs or passwords.',
        'Preserve evidence and contact your bank/platform quickly if fraud occurs.'
      ]
    },
    {
      id: 'lost-passport',
      category: 'safety',
      title: 'Lost or stolen passport',
      summary: 'A calm sequence for protecting yourself, contacting diplomatic support and rebuilding immigration documents.',
      icon: 'fa-address-card',
      level: 'Emergency guide',
      points: [
        'Ensure personal safety and preserve any digital copy of the passport/visa you already have.',
        'Contact the competent local authority where required.',
        'Contact your embassy/consulate for replacement or emergency travel-document guidance.',
        'Notify your employer and relevant immigration support if your work/residence documents are affected.',
        'Do not publish passport scans on social media when seeking help.'
      ]
    },
    {
      id: 'budget-tool',
      category: 'tools',
      title: 'Monthly budget planner',
      summary: 'Estimate your Vietnam monthly baseline across housing, utilities, food, transport, healthcare and savings.',
      icon: 'fa-calculator',
      level: 'Tool concept',
      points: [
        'Housing and utilities',
        'Mobile and internet',
        'Food and groceries',
        'Transport',
        'Healthcare/insurance',
        'Savings and emergency fund'
      ],
      note: 'A calculator can be added as a dedicated interactive tool after city-level cost data is sourced and reviewed.'
    }
  ];

  const categories = {
    all: 'All guides',
    start: 'Start here',
    legal: 'Legal & immigration',
    career: 'Teaching & career',
    living: 'Living in Vietnam',
    safety: 'Safety & support',
    tools: 'Tools'
  };

  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const grid = document.getElementById('guide-grid');
  const searchInput = document.getElementById('guide-search');
  const resultCount = document.getElementById('guide-result-count');
  const filterButtons = [...document.querySelectorAll('[data-guide-filter]')];
  let activeCategory = 'all';

  function guideMatches(guide, query) {
    if (activeCategory !== 'all' && guide.category !== activeCategory) return false;
    if (!query) return true;
    const haystack = [
      guide.title,
      guide.summary,
      guide.level,
      categories[guide.category],
      ...(guide.points || [])
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  }

  function renderGuide(guide) {
    const points = (guide.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join('');
    const sources = (guide.sources || []).map(([label, url]) => (
      `<a class="guide-source" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>${escapeHtml(label)}</a>`
    )).join('');

    let action = '';
    if (guide.externalLink) {
      action = `<a class="guide-action" href="${escapeHtml(guide.externalLink)}" target="_blank" rel="noopener noreferrer">Open Aivy TeacherMatch <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>`;
    } else if (guide.internalLink) {
      action = `<a class="guide-action" href="${escapeHtml(guide.internalLink)}">Open full guide <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`;
    }

    return `
      <article class="guide-card" data-category="${escapeHtml(guide.category)}">
        <div class="guide-card-top">
          <span class="guide-icon" aria-hidden="true"><i class="fa-solid ${escapeHtml(guide.icon)}"></i></span>
          <span class="guide-category">${escapeHtml(categories[guide.category])}</span>
        </div>
        <h3>${escapeHtml(guide.title)}</h3>
        <p>${escapeHtml(guide.summary)}</p>
        <div class="guide-meta"><span>${escapeHtml(guide.level)}</span></div>
        <details>
          <summary>Read guide</summary>
          <div class="guide-details">
            <ul>${points}</ul>
            ${guide.note ? `<p class="guide-note"><strong>Note:</strong> ${escapeHtml(guide.note)}</p>` : ''}
            ${sources ? `<div class="guide-sources">${sources}</div>` : ''}
            ${action}
          </div>
        </details>
      </article>`;
  }

  function render() {
    if (!grid) return;
    const query = (searchInput?.value || '').trim().toLowerCase();
    const filtered = guides.filter((guide) => guideMatches(guide, query));
    grid.innerHTML = filtered.map(renderGuide).join('');
    if (resultCount) resultCount.textContent = `${filtered.length} guide${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="guide-empty"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><h3>No matching guide yet</h3><p>Try another keyword or choose a different category.</p></div>';
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.guideFilter || 'all';
      filterButtons.forEach((item) => item.classList.toggle('active', item === button));
      render();
    });
  });

  searchInput?.addEventListener('input', render);

  document.querySelectorAll('[data-scroll-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.querySelector(button.dataset.scrollTarget || '');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  render();
})();