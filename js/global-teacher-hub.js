(() => {
  'use strict';

  const guides = [
    {
      id: 'before-you-arrive',
      category: 'start',
      title: 'Before you arrive in Vietnam',
      summary: 'Build a clean arrival file before you travel: passport, entry status, employment contacts, qualifications, insurance and essential digital copies.',
      icon: 'fa-plane',
      level: 'Arrival checklist',
      points: [
        'Check your passport validity and your lawful entry basis before booking travel.',
        'Keep digital and offline copies of your passport, entry approval or visa information, qualifications and employment documents.',
        'Confirm your first accommodation address and who will handle temporary-residence declaration.',
        'Save your school, recruiter or employer contact details separately from chat apps.',
        'Arrange appropriate travel or health insurance and keep emergency contact information accessible.'
      ],
      note: 'Entry conditions depend on nationality, passport, purpose of entry and current immigration rules. Confirm the current official procedure before travelling.'
    },
    {
      id: 'first-24-hours',
      category: 'start',
      title: 'Your first 24 hours in Vietnam',
      summary: 'A practical arrival checklist covering accommodation, connectivity, documents, navigation and emergency readiness.',
      icon: 'fa-plane-arrival',
      level: 'Practical guide',
      points: [
        'Confirm your accommodation address and check-in arrangements.',
        'Keep passport and entry-status information secure and accessible.',
        'Set up a local SIM/eSIM if needed and save your employer or school contact.',
        'Save essential emergency information and locate a suitable nearby medical facility.',
        'Confirm that your accommodation provider is handling temporary-residence declaration where required.'
      ]
    },
    {
      id: 'first-30-days',
      category: 'start',
      title: 'First 30 days checklist',
      summary: 'Organize legal status, employment, banking, healthcare, housing, commuting and school onboarding without losing track of important documents.',
      icon: 'fa-list-check',
      level: 'Checklist',
      points: [
        'Confirm your visa/residence and work-authorization plan with your employer.',
        'Keep secure copies of every submitted document, receipt and approval.',
        'Review your employment contract, salary payment method and onboarding schedule.',
        'Set up a realistic monthly budget and identify reliable commute options.',
        'Confirm healthcare, insurance and emergency arrangements.',
        'Create a personal expiry calendar for passport, visa/residence and work documents.'
      ]
    },
    {
      id: 'document-vault',
      category: 'start',
      title: 'Build your personal document vault',
      summary: 'Keep sensitive legal and career documents organized without exposing identity files in public chats or social media.',
      icon: 'fa-vault',
      level: 'Privacy & readiness',
      points: [
        'Create separate folders for identity, immigration, work authorization, qualifications, tax/insurance and contracts.',
        'Use encrypted or access-controlled cloud storage for sensitive files.',
        'Name files consistently and keep a record of which version was submitted to which authority or employer.',
        'Do not publish passport scans, criminal records, residence cards or health records in public groups.',
        'Keep an offline emergency copy of essential identity and insurance information.'
      ]
    },
    {
      id: 'evisa',
      category: 'legal',
      title: 'Vietnam e-Visa & online visa services',
      summary: 'Use official immigration channels to check electronic-visa eligibility, application steps, status and lawful entry conditions.',
      icon: 'fa-laptop-file',
      level: 'Official-source review required',
      points: [
        'Start from the Vietnam Immigration Department or an official public-service portal rather than an advertisement or visa agent.',
        'Check eligibility for your passport and travel purpose before applying.',
        'Confirm permitted entry points, validity, number of entries, fee and processing information on the live official service.',
        'Make sure your name, passport number, date of birth and passport expiry are entered exactly as shown in the passport.',
        'Save the application reference, payment record and issued electronic document.'
      ],
      sources: [
        ['Vietnam Immigration Department', 'https://xuatnhapcanh.gov.vn/'],
        ['National Public Service Portal', 'https://dichvucong.gov.vn/'],
        ['Ministry of Public Security Public Services', 'https://dichvucong.bocongan.gov.vn/']
      ],
      note: 'Portal endpoints and legal conditions can change. IVS does not hard-code the current e-visa fee, duration, eligibility list or processing time until live verification is completed.'
    },
    {
      id: 'visa-residence',
      category: 'legal',
      title: 'Visa, entry status & lawful stay',
      summary: 'Understand the difference between entering Vietnam, remaining lawfully, working lawfully and obtaining longer-term residence status.',
      icon: 'fa-passport',
      level: 'Official-source review required',
      points: [
        'Know your current entry or visa status and the date it ceases to be valid.',
        'Do not assume that a visa authorizes employment; work authorization is a separate compliance question.',
        'Confirm whether a change of employer, passport, address or work location affects your immigration process.',
        'Use the Immigration Department and competent public-service portals for current procedures.',
        'Never assume a recruiter or agent can guarantee approval.'
      ],
      sources: [
        ['Vietnam Immigration Department', 'https://xuatnhapcanh.gov.vn/'],
        ['National Public Service Portal', 'https://dichvucong.gov.vn/']
      ]
    },
    {
      id: 'temporary-residence',
      category: 'legal',
      title: 'Temporary residence declaration',
      summary: 'One of the first administrative items to confirm after checking into a hotel, apartment or rented house.',
      icon: 'fa-house-user',
      level: 'High-priority admin guide',
      points: [
        'Ask the hotel, landlord, host or accommodation manager how your temporary residence is being declared.',
        'Keep your accommodation address and contact details accurate.',
        'If you move, confirm what needs to be updated and who is responsible.',
        'Keep evidence of your rental or accommodation arrangement where practical.',
        'Use the competent immigration/public-security channel for current procedural requirements.'
      ],
      sources: [
        ['Vietnam Immigration Department', 'https://xuatnhapcanh.gov.vn/'],
        ['Ministry of Public Security Public Services', 'https://dichvucong.bocongan.gov.vn/']
      ],
      note: 'The exact declaration workflow may be carried out by the accommodation provider and can vary by accommodation type and local system.'
    },
    {
      id: 'trc',
      category: 'legal',
      title: 'Temporary Residence Card (TRC)',
      summary: 'A longer-term residence document for eligible categories of foreigners; eligibility depends on the legal basis for residence.',
      icon: 'fa-address-card',
      level: 'Official-source review required',
      points: [
        'Confirm the legal category that could support your TRC rather than assuming every worker qualifies automatically.',
        'Check the relationship between your work authorization, sponsor and immigration status.',
        'Prepare passport and sponsor/employment/family/investment evidence applicable to your category.',
        'Ask what happens to your residence status if employment or sponsorship ends.',
        'Use the competent immigration authority for the current application procedure.'
      ],
      sources: [['Vietnam Immigration Department', 'https://xuatnhapcanh.gov.vn/']]
    },
    {
      id: 'work-permit',
      category: 'legal',
      title: 'Work permit & work authorization',
      summary: 'The core compliance area for most foreign teachers: identify the lawful basis before you teach, change employers or change work locations.',
      icon: 'fa-id-card',
      level: 'P0 legal verification',
      points: [
        'Ask which legal basis your employer is using for your employment and work authorization.',
        'Prepare degree, professional/teaching qualifications and experience evidence where applicable.',
        'Check whether health, criminal-record, legalization or Vietnamese translation documents are required for your exact case.',
        'Confirm what needs to happen before changing employer, job title, school, work location or province.',
        'Keep copies of all employer submissions and approvals provided to you.',
        'Do not rely on old online checklists for exact deadlines, fees, qualification thresholds or exemption criteria.'
      ],
      sources: [
        ['National Public Service Portal', 'https://dichvucong.gov.vn/'],
        ['National Legal Database', 'https://vbpl.vn/'],
        ['Government Legal Documents', 'https://vanban.chinhphu.vn/']
      ],
      note: 'The foreign-worker framework changed after the historical Decree 152/2020 and Decree 70/2023 period. The current 2026 governing instrument and competent authority must be live-verified before publishing exact substantive requirements.'
    },
    {
      id: 'work-permit-exemption',
      category: 'legal',
      title: 'Work permit exemption: do not confuse exemption with “no procedure”',
      summary: 'Some foreign workers may fall into statutory exemption categories, but administrative confirmation or employer obligations may still apply.',
      icon: 'fa-file-circle-check',
      level: 'P0 legal verification',
      points: [
        'Identify the exact statutory exemption category rather than relying on a recruiter label.',
        'Confirm whether a confirmation filing, notice or other employer-side step applies to that category.',
        'Collect evidence proving the exemption basis.',
        'Check whether the exemption is linked to a specific employer, role, project, duration or location.',
        'Re-check immigration/residence status separately.'
      ],
      sources: [
        ['National Public Service Portal', 'https://dichvucong.gov.vn/'],
        ['National Legal Database', 'https://vbpl.vn/']
      ],
      note: 'Exact exemption categories and filing requirements are high-risk legal facts and must be verified against the current instrument.'
    },
    {
      id: 'teacher-legalization',
      category: 'legal',
      title: 'Degree, certificate & consular legalization',
      summary: 'Foreign-issued documents may need authentication/legalization and Vietnamese translation depending on the document, country, treaty and procedure.',
      icon: 'fa-stamp',
      level: 'Document compliance',
      points: [
        'Ask the receiving authority/employer exactly which document and form of authentication is required.',
        'Check whether a treaty or bilateral arrangement changes legalization requirements.',
        'Do not alter or laminate original certificates before checking procedure requirements.',
        'Use competent consular/legalization channels and qualified translation/certification services where required.',
        'Keep scans of the pre-legalized and finalized document sets.'
      ],
      sources: [
        ['Consular Department information', 'https://lanhsuvietnam.gov.vn/'],
        ['National Legal Database', 'https://vbpl.vn/']
      ]
    },
    {
      id: 'criminal-record',
      category: 'legal',
      title: 'Criminal record / judicial record for employment',
      summary: 'Foreign-worker dossiers may require criminal-record evidence; the accepted source depends on residence history and the current procedure.',
      icon: 'fa-file-shield',
      level: 'Official-source review required',
      points: [
        'Confirm whether the procedure requires a Vietnamese judicial record, an overseas record, or another acceptable form of evidence.',
        'Check validity/recency requirements on the live official procedure.',
        'If using a foreign document, verify legalization and translation requirements.',
        'Keep sensitive criminal-record documents private and submit only through legitimate channels.',
        'Do not order multiple certificates until the receiving authority confirms what is accepted.'
      ],
      sources: [['National Public Service Portal', 'https://dichvucong.gov.vn/']]
    },
    {
      id: 'vneid',
      category: 'legal',
      title: 'VNeID & digital public services for foreigners',
      summary: 'Digital identity can simplify some public-service interactions, but the current foreigner process and available features must be checked before relying on older instructions.',
      icon: 'fa-mobile-screen-button',
      level: 'P0 procedure verification',
      points: [
        'Use only official VNeID applications, government pages and competent authorities for identity procedures.',
        'Do not publish passport, residence-card or identity screenshots publicly.',
        'Keep screenshots used for troubleshooting anonymized whenever possible.',
        'Check the current eligibility, account level/verification process and supported services for foreigners.',
        'Keep your registered phone/email access secure because identity-linked accounts are sensitive.'
      ],
      sources: [
        ['Ministry of Public Security Public Services', 'https://dichvucong.bocongan.gov.vn/'],
        ['National Public Service Portal', 'https://dichvucong.gov.vn/']
      ],
      internalLink: '/Pages/blogs/blog-vneid-guide.html'
    },
    {
      id: 'tax-pit',
      category: 'legal',
      title: 'Personal income tax (PIT) for foreign teachers',
      summary: 'Understand tax residency, withholding, taxpayer registration and annual finalization as separate questions.',
      icon: 'fa-receipt',
      level: 'P1 tax verification',
      points: [
        'Ask whether the employer is withholding tax and what supporting payslip/tax records you will receive.',
        'Do not assume nationality determines tax residency; current statutory tests must be applied.',
        'Keep salary, allowance, bonus and tax-withholding records.',
        'Check whether you need direct annual finalization or can authorize an employer where legally allowed.',
        'Review tax obligations before changing employer or leaving Vietnam.'
      ],
      sources: [
        ['Vietnam Tax Authority', 'https://gdt.gov.vn/'],
        ['Electronic Tax Portal', 'https://thuedientu.gdt.gov.vn/'],
        ['National Legal Database', 'https://vbpl.vn/']
      ],
      note: 'IVS does not publish 2026 tax rates, deductions or residency thresholds until the current consolidated legal basis and tax guidance are live-verified.'
    },
    {
      id: 'social-insurance',
      category: 'legal',
      title: 'Social & health insurance for foreign employees',
      summary: 'Check whether statutory social/health insurance applies to your employment and how it interacts with private insurance.',
      icon: 'fa-shield-heart',
      level: 'P1 insurance verification',
      points: [
        'Ask your employer which statutory insurance schemes apply to your specific employment status.',
        'Review your payslip for deductions and employer contributions where applicable.',
        'Keep social-insurance/health-insurance identifiers and records.',
        'Understand that statutory coverage and private expat medical insurance are different products.',
        'Check what happens to records/benefits when changing employer or leaving Vietnam.'
      ],
      sources: [
        ['Vietnam Social Security', 'https://baohiemxahoi.gov.vn/'],
        ['Social Security Public Services', 'https://dichvucong.baohiemxahoi.gov.vn/']
      ]
    },
    {
      id: 'driving-licence',
      category: 'legal',
      title: 'Foreign driving licence & licence conversion',
      summary: 'Do not assume that a foreign licence or an international permit is automatically valid for every driver or vehicle in Vietnam.',
      icon: 'fa-car-side',
      level: 'High-change legal area',
      points: [
        'Check the current legal route that applies to your licence, nationality/residence and vehicle category.',
        'If conversion is available, verify the current authority, required documents and translation rules.',
        'Never drive a motorbike merely because a rental shop accepts your passport.',
        'Confirm insurance coverage and vehicle registration before driving.',
        'Use the current public-service portal for the relevant procedure.'
      ],
      sources: [['National Public Service Portal', 'https://dichvucong.gov.vn/']],
      note: 'Vietnam’s road-law framework changed from 2025, so old expatriate blog instructions can be unreliable.'
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
        'Professional photo where appropriate.',
        'Keep passport, criminal record, health documents and residence documents private until legitimately requested.'
      ]
    },
    {
      id: 'teacher-qualification',
      category: 'career',
      title: 'Teacher qualifications: employment law vs education-sector rules',
      summary: 'A foreign teacher can face more than one compliance layer, depending on role and provider type.',
      icon: 'fa-graduation-cap',
      level: 'Career/legal crossover',
      points: [
        'Identify the teaching role: language, subject teacher, international curriculum, vocational or other education activity.',
        'Check the employer/provider type because education-sector requirements can differ.',
        'Separate work-permit qualification rules from education-sector teacher requirements.',
        'Confirm whether a degree, teaching/pedagogical certificate, language-teaching qualification or experience evidence is required for the exact role.',
        'Do not accept a generic “native speaker = qualified” claim as a compliance answer.'
      ],
      sources: [
        ['Education Authority Portal', 'https://moet.gov.vn/'],
        ['National Legal Database', 'https://vbpl.vn/']
      ]
    },
    {
      id: 'cv-guide',
      category: 'career',
      title: 'Build a Vietnam-ready teacher CV',
      summary: 'Make it easy for a school to understand what you can teach, where you are, when you are available and what evidence you can provide.',
      icon: 'fa-file-lines',
      level: 'Career guide',
      points: [
        'Use a concise 1–2 page CV with clear employment dates and teaching responsibilities.',
        'State current city/country, relocation status and availability.',
        'List degree, teaching qualifications and relevant certifications accurately.',
        'Specify age groups, subjects, curricula, classroom size and online/offline experience.',
        'Add measurable outcomes or responsibilities where possible.',
        'Do not include full passport number, date-of-birth documents or criminal-record scans on the public CV.'
      ]
    },
    {
      id: 'demo-lesson',
      category: 'career',
      title: 'Prepare for a demo lesson',
      summary: 'A short demo should show classroom control, clear objectives, learner engagement and your ability to adapt—not just presentation skills.',
      icon: 'fa-person-chalkboard',
      level: 'Teaching practice',
      points: [
        'Ask for age, level, class size, time limit, topic and available equipment in advance.',
        'Set one realistic learning objective.',
        'Plan an opening, guided practice, learner interaction, quick assessment and close.',
        'Use instructions that are short, staged and easy to check.',
        'Prepare a low-tech backup in case slides, audio or internet fail.',
        'Ask how the school defines successful performance before you begin.'
      ]
    },
    {
      id: 'contract-checklist',
      category: 'career',
      title: 'Teaching contract checklist',
      summary: 'Resolve duties, schedule, pay, probation, leave, tax, authorization support and exit terms before signing.',
      icon: 'fa-file-signature',
      level: 'Career readiness',
      points: [
        'Confirm employer legal name, job title, duties and primary workplace.',
        'Separate teaching hours from preparation, meetings and administrative hours.',
        'Confirm salary, allowances, payment date, extra-class terms and probation.',
        'Clarify tax, insurance and visa/work-authorization responsibilities.',
        'Read termination, notice, confidentiality, intellectual-property and media-consent clauses.',
        'Ask how schedule changes, cancellations, substitute classes and travel between sites are handled.'
      ],
      note: 'This is a practical checklist, not legal advice.'
    },
    {
      id: 'school-due-diligence',
      category: 'career',
      title: 'Check a school or center before accepting a job',
      summary: 'Reduce recruitment fraud and bad-fit employment by verifying the organization, role and operational expectations.',
      icon: 'fa-school-circle-check',
      level: 'Career safety',
      points: [
        'Confirm the organization’s legal/business identity and actual workplace address.',
        'Ask who will be your contractual employer and who pays salary.',
        'Request a written job description and contract before major relocation commitments.',
        'Ask current teachers about payroll reliability, management, schedule changes and support.',
        'Be cautious if asked to start teaching before lawful work authorization is addressed.',
        'Avoid large upfront recruitment fees or “guaranteed permit” claims.'
      ]
    },
    {
      id: 'teachermatch',
      category: 'career',
      title: 'Find teaching jobs with Aivy TeacherMatch',
      summary: 'Use the dedicated IVS recruitment platform for teacher profiles, job discovery, applications and employer connections.',
      icon: 'fa-briefcase',
      level: 'IVS ecosystem',
      points: [
        'Create an English-first teacher profile.',
        'Discover teaching opportunities and review role details.',
        'Track applications through a dedicated recruitment workflow.',
        'Use platform communication rather than sending sensitive files to unknown contacts.',
        'Schools and education centers can use the employer workflow to find and evaluate candidates.'
      ],
      externalLink: 'https://ivslearning.top/',
      actionLabel: 'Open Aivy TeacherMatch'
    },
    {
      id: 'housing',
      category: 'living',
      title: 'Housing & rental checklist',
      summary: 'Reduce deposit, utility and residence-registration problems by checking the property and written terms before paying.',
      icon: 'fa-house',
      level: 'Practical guide',
      points: [
        'Verify the address, landlord/property identity and written rental terms.',
        'Clarify deposit, notice period, utility rates, service charges and refund conditions.',
        'Photograph existing damage and meter readings before moving in.',
        'Ask who handles temporary-residence declaration.',
        'Avoid undocumented cash-only arrangements where possible.',
        'Do not pay a large deposit merely from photos or a social-media listing without verification.'
      ]
    },
    {
      id: 'banking',
      category: 'living',
      title: 'Banking, payments & money safety',
      summary: 'Understand local payment habits while protecting cards, OTPs, banking access and identity documents.',
      icon: 'fa-building-columns',
      level: 'Practical guide',
      points: [
        'Bank-account requirements for foreigners can vary by bank and legal/residence status.',
        'Ask the bank directly what identity and residence documents are currently accepted.',
        'Never share OTP codes, PINs, passwords or remote-access credentials.',
        'Verify account names and transaction details before sending money.',
        'Keep salary and tax records for later administrative needs.',
        'Use official bank apps downloaded from trusted app stores.'
      ]
    },
    {
      id: 'sim-internet',
      category: 'living',
      title: 'SIM, mobile data & internet',
      summary: 'Set up reliable connectivity while keeping subscriber registration and account recovery secure.',
      icon: 'fa-sim-card',
      level: 'Practical guide',
      points: [
        'Prefer official carrier stores or authorized channels for SIM/eSIM setup.',
        'Keep the number registered correctly under the required identity information.',
        'Protect SIM account recovery because phone numbers are commonly linked to banking and digital services.',
        'Keep a backup method for accessing email and two-factor authentication.',
        'Use caution with unofficial “pre-registered” SIM cards.'
      ]
    },
    {
      id: 'transport',
      category: 'living',
      title: 'Transport & getting around',
      summary: 'Plan commuting, ride-hailing and longer trips while paying attention to driver identity, road safety and licence requirements.',
      icon: 'fa-motorcycle',
      level: 'Practical guide',
      points: [
        'Use reputable ride-hailing or transport services and verify the vehicle/driver shown in the app.',
        'Do not assume a foreign driving licence is automatically valid in Vietnam.',
        'Use a helmet on motorbikes and confirm insurance/rental conditions.',
        'Learn your school commute before your first teaching day.',
        'Allow extra travel time during heavy rain and peak traffic.'
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
      summary: 'Set up a simple medical plan before you need it: nearby care, insurance contacts, allergies, medication and emergency information.',
      icon: 'fa-heart-pulse',
      level: 'Practical guide',
      points: [
        'Know what your insurance covers and whether pre-authorization is required.',
        'Identify a suitable nearby clinic or hospital before an emergency happens.',
        'Keep medication names, allergies and emergency contacts accessible.',
        'Keep receipts and medical documents for insurance claims.',
        'If you have a chronic condition, carry a concise medical summary and medication list.'
      ]
    },
    {
      id: 'cost-of-living',
      category: 'living',
      title: 'Build a realistic monthly budget',
      summary: 'Plan for housing, deposits, utilities, food, commuting, healthcare, taxes, insurance and emergency reserves—not just advertised rent.',
      icon: 'fa-wallet',
      level: 'Practical guide',
      points: [
        'Separate one-time arrival costs from recurring monthly expenses.',
        'Budget for deposits, utilities, phone/internet, transport and document-related costs.',
        'Keep a reserve for healthcare, travel or an employment gap.',
        'Do not assume gross salary equals spendable income; ask about tax and statutory deductions.',
        'Compare housing cost against commute time and transport expense.'
      ]
    },
    {
      id: 'culture-workplace',
      category: 'living',
      title: 'Working across cultures in Vietnamese schools',
      summary: 'Understand communication, hierarchy, parent expectations and classroom culture without reducing Vietnam to stereotypes.',
      icon: 'fa-people-group',
      level: 'Cultural guide',
      points: [
        'Ask how decisions are made and who should be informed about schedule/classroom issues.',
        'Clarify expected communication channels with managers, Vietnamese teachers and parents.',
        'Give feedback privately and constructively when possible.',
        'Avoid assuming one school represents all Vietnamese workplaces.',
        'Learn useful Vietnamese greetings and classroom phrases; small efforts improve rapport.'
      ]
    },
    {
      id: 'scam-safety',
      category: 'safety',
      title: 'Scams, recruitment fraud & document safety',
      summary: 'Protect yourself from fake jobs, housing scams, payment fraud and unnecessary sharing of identity documents.',
      icon: 'fa-shield-halved',
      level: 'Safety',
      points: [
        'Verify employer identity before sharing sensitive documents.',
        'Be cautious with large upfront recruitment or “guaranteed permit” fees.',
        'Do not send passport scans through public channels to unknown recruiters.',
        'Never share bank OTPs, PINs or passwords.',
        'Preserve evidence and contact your bank/platform quickly if fraud occurs.',
        'Treat urgent requests to transfer money or install remote-access software as high risk.'
      ]
    },
    {
      id: 'lost-passport',
      category: 'safety',
      title: 'Lost or stolen passport',
      summary: 'A calm sequence for protecting yourself, contacting diplomatic support and rebuilding immigration/work records.',
      icon: 'fa-address-card',
      level: 'Emergency guide',
      points: [
        'Ensure personal safety and preserve any digital copy of the passport/visa you already have.',
        'Contact the competent local authority where required and obtain any report/evidence needed for replacement steps.',
        'Contact your embassy/consulate for replacement or emergency travel-document guidance.',
        'Notify your employer and relevant immigration support if work/residence documents are affected.',
        'Do not publish passport scans on social media when seeking help.'
      ]
    },
    {
      id: 'job-dispute',
      category: 'safety',
      title: 'If salary, contract or employment problems occur',
      summary: 'Preserve evidence first, distinguish a workplace dispute from immigration/work-authorization issues, and seek competent support early.',
      icon: 'fa-scale-balanced',
      level: 'Support guide',
      points: [
        'Keep your signed contract, schedules, attendance, payslips, bank records and written communications.',
        'Write down dates, amounts and specific events while they are fresh.',
        'Avoid surrendering original passport or personal documents without a lawful and clearly documented reason.',
        'Ask for disputed decisions or deductions in writing.',
        'Seek qualified legal/administrative assistance for serious disputes rather than relying only on social-media advice.'
      ]
    },
    {
      id: 'emergency-prep',
      category: 'safety',
      title: 'Personal emergency readiness',
      summary: 'Keep a small emergency pack of information so you are not searching for documents during a medical, security or travel problem.',
      icon: 'fa-kit-medical',
      level: 'Safety checklist',
      points: [
        'Save national emergency numbers and your nearest suitable medical facility.',
        'Keep an emergency contact in Vietnam and one outside Vietnam.',
        'Store passport/insurance copies securely online and offline.',
        'Carry essential medication and a short allergy/medical note if needed.',
        'Know how to contact your embassy or consulate.'
      ]
    },
    {
      id: 'facebook-community',
      category: 'community',
      title: 'Teacher Jobs HCMC & Dong Nai Facebook Group',
      summary: 'Join the community group for local teacher-job discussions, networking and practical peer information.',
      icon: 'fa-brands fa-facebook-f',
      level: 'Community channel',
      points: [
        'Use the group for peer discussion, networking and local market signals.',
        'Verify job posts and employer identity independently.',
        'Do not upload passport, residence-card, criminal-record or banking documents into public group posts.',
        'Use Aivy TeacherMatch or a secure employer channel for formal applications where possible.'
      ],
      externalLink: 'https://www.facebook.com/groups/teacherjobshcmcdongnai/',
      actionLabel: 'Open Facebook Group'
    },
    {
      id: 'zalo-community',
      category: 'community',
      title: 'Foreign Teacher Community on Zalo',
      summary: 'Join the Zalo group for faster local communication and community support.',
      icon: 'fa-comments',
      level: 'Community channel',
      points: [
        'Use the group for community questions and local coordination.',
        'Verify administrative/legal answers against official sources.',
        'Avoid sending sensitive identity or banking files to unknown group members.',
        'Move formal recruitment or support matters to a verified private channel.'
      ],
      externalLink: 'https://zalo.me/g/xjbhgl706',
      actionLabel: 'Join Zalo Group'
    },
    {
      id: 'zalo-oa',
      category: 'community',
      title: 'IVS Official Zalo OA',
      summary: 'Follow the IVS Official Account for IVS updates and an official IVS contact channel.',
      icon: 'fa-comment-dots',
      level: 'Official IVS support channel',
      points: [
        'Use the IVS OA for official IVS communication and support.',
        'For urgent emergencies, use competent emergency or government channels instead.',
        'For legal/administrative procedures, IVS guidance should always link back to primary official sources.'
      ],
      externalLink: 'https://zalo.me/1582587135739746654',
      actionLabel: 'Open IVS Zalo OA'
    },
    {
      id: 'public-service-search',
      category: 'tools',
      title: 'Find a Vietnamese administrative procedure online',
      summary: 'Use the National Public Service Portal as the starting discovery layer for current administrative procedures and online services.',
      icon: 'fa-landmark',
      level: 'Government utility',
      points: [
        'Search by procedure name, responsible authority and locality.',
        'Read the procedure record rather than relying only on search-result snippets.',
        'Check required documents, filing method, authority, fee and processing time on the live record.',
        'Save the exact procedure URL and date you checked it.',
        'If an online service redirects to a ministry/provincial portal, confirm the domain before entering identity information.'
      ],
      externalLink: 'https://dichvucong.gov.vn/',
      actionLabel: 'Open National Public Service Portal'
    },
    {
      id: 'legal-document-search',
      category: 'tools',
      title: 'Check whether a legal document is current',
      summary: 'Use official legal databases to verify document status, amendments, replacement instruments and effective dates.',
      icon: 'fa-book-open',
      level: 'Legal research tool',
      points: [
        'Search by document number and title.',
        'Check effective date and current-effect/status information.',
        'Read amendments and replacement documents, not only the original text.',
        'Prefer consolidated/current texts where officially available.',
        'Record the source URL and verification date before using a legal requirement on the website.'
      ],
      sources: [
        ['National Legal Database', 'https://vbpl.vn/'],
        ['Government Legal Documents', 'https://vanban.chinhphu.vn/']
      ]
    },
    {
      id: 'budget-tool',
      category: 'tools',
      title: 'Monthly budget planner',
      summary: 'Estimate your Vietnam monthly baseline across housing, utilities, food, transport, healthcare and savings.',
      icon: 'fa-calculator',
      level: 'Planning tool',
      points: [
        'Housing and utilities',
        'Mobile and internet',
        'Food and groceries',
        'Transport',
        'Healthcare/insurance',
        'Taxes/statutory deductions where applicable',
        'Savings and emergency fund'
      ],
      note: 'City-level costs vary significantly. Use current local listings and your actual commute rather than generic online averages.'
    }
  ];

  const categories = {
    all: 'All guides',
    start: 'Start here',
    legal: 'Legal & immigration',
    career: 'Teaching & career',
    living: 'Living in Vietnam',
    safety: 'Safety & support',
    community: 'Community',
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
      action = `<a class="guide-action" href="${escapeHtml(guide.externalLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(guide.actionLabel || 'Open resource')} <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>`;
    } else if (guide.internalLink) {
      action = `<a class="guide-action" href="${escapeHtml(guide.internalLink)}">Open full guide <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`;
    }

    const iconClass = guide.icon.startsWith('fa-brands ') ? guide.icon : `fa-solid ${guide.icon}`;

    return `
      <article class="guide-card" data-category="${escapeHtml(guide.category)}">
        <div class="guide-card-top">
          <span class="guide-icon" aria-hidden="true"><i class="${escapeHtml(iconClass)}"></i></span>
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