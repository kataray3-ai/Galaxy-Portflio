export interface SkillPlanet {
  id: string;
  index: string;
  name: string;
  shortName: string;
  sector: string;
  orbitRadius: number;
  orbitSpeed: number;
  initialAngle: number;
  tilt: number;
  colorHex: string;
  accentHex: string;
  planetStyle: 'crystal' | 'prism' | 'gyro' | 'ringed' | 'octa' | 'torus';
  headline: string;
  summary: string;
  tools: string[];
  deliverables: string[];
  outcomeMetric: string;
}

export interface ProgramService {
  id: string;
  category: 'Training & Courses' | 'Consulting' | 'Mentorship';
  title: string;
  format: string;
  duration: string;
  summary: string;
  highlights: string[];
  featured?: boolean;
}

export interface ExperienceMilestone {
  id: string;
  period: string;
  role: string;
  organization: string;
  location: string;
  description: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  organization: string;
  platform: string;
  rating: string;
  quote: string;
  outcome: string;
}

export const HERO_METRICS = [
  {
    value: '8+ Years',
    label: 'Digital & AI Strategy',
    context: 'Hands-on campaign & training leadership',
  },
  {
    value: '10,000+',
    label: 'Learners Mentored',
    context: 'Students, professionals & founders trained',
  },
  {
    value: '4.9 / 5.0',
    label: 'Verified Rating',
    context: 'Across Google, UrbanPro & Justdial reviews',
  },
  {
    value: '50+',
    label: 'Campus & Corp Sessions',
    context: 'Delhi University colleges & enterprise teams',
  },
];

export const SKILL_PLANETS: SkillPlanet[] = [
  {
    id: 'generative-ai',
    index: '01',
    name: 'Generative AI in Marketing',
    shortName: 'Gen AI',
    sector: 'Automation & Content Systems',
    orbitRadius: 5.2,
    orbitSpeed: 0.24,
    initialAngle: 0.2,
    tilt: 0.22,
    colorHex: '#F5B041',
    accentHex: '#FDE68A',
    planetStyle: 'crystal',
    headline: 'AI-First Marketing Workflows & Prompt Engineering',
    summary:
      'Integrating ChatGPT, Canva AI, Jasper, and generative creative pipelines directly into daily campaign execution to multiply output quality and speed.',
    tools: ['ChatGPT', 'Canva AI', 'Jasper', 'AI Ad Copy Frameworks'],
    deliverables: [
      'Automated content calendars & multi-channel copy engines',
      'AI-assisted audience research & buyer persona synthesis',
      'Prompt libraries tailored for performance agencies',
    ],
    outcomeMetric: '3x faster campaign production cycles',
  },
  {
    id: 'seo-organic',
    index: '02',
    name: 'Search Engine Optimization',
    shortName: 'SEO',
    sector: 'Organic Visibility & Technical Audits',
    orbitRadius: 7.4,
    orbitSpeed: 0.19,
    initialAngle: 1.35,
    tilt: -0.18,
    colorHex: '#38BDF8',
    accentHex: '#BAE6FD',
    planetStyle: 'prism',
    headline: 'Technical, On-Page & Authority Growth Architecture',
    summary:
      'Structuring crawlable site architectures, intent-mapped content clusters, and high-authority link strategies that compound organic traffic month over month.',
    tools: ['Google Search Console', 'SEMrush', 'Schema Markup', 'Local SEO'],
    deliverables: [
      'Full technical crawl diagnostics & Core Web Vitals optimization',
      'Commercial-intent keyword architecture & topic clusters',
      'Google Business Profile & Delhi NCR local search dominance',
    ],
    outcomeMetric: 'Compounding non-paid acquisition channels',
  },
  {
    id: 'paid-ads',
    index: '03',
    name: 'Google & Meta Paid Ads',
    shortName: 'Paid Ads',
    sector: 'Performance & Lead Acquisition',
    orbitRadius: 9.6,
    orbitSpeed: 0.15,
    initialAngle: 2.5,
    tilt: 0.28,
    colorHex: '#FB923C',
    accentHex: '#FED7AA',
    planetStyle: 'gyro',
    headline: 'High-ROAS Search, Display & Social Funnel Scaling',
    summary:
      'Precision media buying across Google Ads and Meta Ads Manager—turning clicks into qualified leads through disciplined bidding, creative testing, and retargeting.',
    tools: ['Google Ads', 'Meta Ads Manager', 'Lookalike Audiences', 'ROAS Tracking'],
    deliverables: [
      'Multi-stage lead generation & e-commerce conversion funnels',
      'A/B creative testing matrices & hook optimization',
      'Cost-per-lead calibration & budget allocation models',
    ],
    outcomeMetric: 'Google & Meta Certified execution rigor',
  },
  {
    id: 'social-media',
    index: '04',
    name: 'Social Media & Brand Scaling',
    shortName: 'Social Media',
    sector: 'Community & Multi-Platform Reach',
    orbitRadius: 11.8,
    orbitSpeed: 0.12,
    initialAngle: 3.7,
    tilt: -0.24,
    colorHex: '#A78BFA',
    accentHex: '#DDD6FE',
    planetStyle: 'ringed',
    headline: 'Narrative Positioning & Organic Community Momentum',
    summary:
      'Building recognizable personal and corporate brands across Instagram, LinkedIn, and YouTube with cohesive visual storytelling and retention hooks.',
    tools: ['LinkedIn Growth', 'Instagram Reels Strategy', 'Content Storytelling', 'Community Loops'],
    deliverables: [
      'Platform-native short-form & thought-leadership playbooks',
      'Founder & executive personal branding roadmaps',
      'Engagement analytics & creator collaboration systems',
    ],
    outcomeMetric: 'Consistent brand recall & inbound trust',
  },
  {
    id: 'web-cro',
    index: '05',
    name: 'Website Design & CRO',
    shortName: 'Web & CRO',
    sector: 'Landing Pages & Conversion Architecture',
    orbitRadius: 14.0,
    orbitSpeed: 0.095,
    initialAngle: 4.85,
    tilt: 0.16,
    colorHex: '#34D399',
    accentHex: '#A7F3D0',
    planetStyle: 'octa',
    headline: 'WordPress Craft & High-Converting Landing Systems',
    summary:
      'Designing fast, responsive WordPress websites and distraction-free landing pages engineered around buyer psychology, trust signals, and frictionless inquiry flows.',
    tools: ['WordPress', 'Landing Page UX', 'Conversion Copy', 'Lead Capture Flows'],
    deliverables: [
      'Custom WordPress business & portfolio architectures',
      'Above-the-fold clarity & persuasive CTA hierarchy',
      'Mobile-first speed optimization & form conversion lifts',
    ],
    outcomeMetric: 'Built to convert traffic into revenue',
  },
  {
    id: 'analytics-gtm',
    index: '06',
    name: 'Analytics & Tag Manager',
    shortName: 'Analytics',
    sector: 'Attribution & Telemetry Intelligence',
    orbitRadius: 16.2,
    orbitSpeed: 0.075,
    initialAngle: 5.9,
    tilt: -0.15,
    colorHex: '#60A5FA',
    accentHex: '#BFDBFE',
    planetStyle: 'torus',
    headline: 'Data-Backed Attribution & Conversion Tracking',
    summary:
      'Instrumenting clean event tracking with Google Analytics 4 and Google Tag Manager so every rupee spent on marketing maps directly to measurable outcomes.',
    tools: ['Google Analytics 4', 'Google Tag Manager', 'Conversion API', 'Funnel Dashboards'],
    deliverables: [
      'End-to-end event, pixel & custom conversion setup via GTM',
      'Attribution diagnostics across organic, social & paid touchpoints',
      'Actionable executive reporting & drop-off heat analysis',
    ],
    outcomeMetric: 'Zero guesswork in marketing spend',
  },
];

export const EXPERIENCE_MILESTONES: ExperienceMilestone[] = [
  {
    id: 'digital-yamini',
    period: '2018 — Present',
    role: 'Founder, Digital Marketing & AI Trainer',
    organization: 'Digital Yamini',
    location: 'Delhi NCR, India',
    description:
      'Leading agency-style live cohorts, pre-recorded mastery programs, and growth consulting for startups, small businesses, and over 10,000 students and working professionals.',
  },
  {
    id: 'du-colleges',
    period: 'Academic Keynote Series',
    role: 'Guest Lecturer & Workshop Lead',
    organization: 'University of Delhi Colleges & MSIT',
    location: 'Hansraj · Bhagini Nivedita · Aryabhatta · MSIT',
    description:
      'Delivered practical seminars and campus-to-corporate readiness workshops on AI-powered digital marketing, personal branding, and performance analytics.',
  },
  {
    id: 'imarticus',
    period: 'Corporate & EdTech Training',
    role: 'Subject Matter Trainer & Mentor',
    organization: 'Imarticus Learning & Corporate Teams',
    location: 'Pan-India & Online',
    description:
      'Trained cohorts of aspiring marketers and enterprise teams on Google Ads, Meta Ads Manager, SEO frameworks, and live project execution.',
  },
  {
    id: 'jai-gulab-trust',
    period: 'Ongoing Social Initiative',
    role: 'Education Impact Partner',
    organization: 'Jai Gulab Baba Trust',
    location: 'India',
    description:
      'Allocating a dedicated portion of course enrollments toward funding education and digital literacy for underprivileged girls.',
  },
];

export const PROGRAMS_SERVICES: ProgramService[] = [
  {
    id: 'ai-mastery-course',
    category: 'Training & Courses',
    title: 'AI-Powered Digital Marketing Mastery Course',
    format: 'Live Online & Pre-Recorded · Dual Certification',
    duration: 'Comprehensive Cohort',
    summary:
      'An agency-style practical curriculum covering SEO, Google & Meta Ads, WordPress design, Content Strategy, and Generative AI tools with live case studies.',
    highlights: [
      'Hands-on execution with ChatGPT, Canva AI, Jasper & GA4',
      'Real-world campaign simulations & portfolio building',
      'Dual certification upon completing capstone projects',
      'Portion of every enrollment supports Jai Gulab Baba Trust',
    ],
    featured: true,
  },
  {
    id: 'corporate-campus-workshops',
    category: 'Training & Courses',
    title: 'Corporate Training & Campus Bootcamps',
    format: 'On-Site & Virtual Workshops',
    duration: '1-Day Intensive to Multi-Week',
    summary:
      'Custom curriculum tailored for university students (as delivered at DU colleges & MSIT) and corporate marketing teams upgrading to AI-assisted growth workflows.',
    highlights: [
      'Campus-to-corporate practical skill bridge',
      'Live tool demonstrations & campaign audits',
      'Interactive Q&A, resume alignment & career roadmaps',
    ],
  },
  {
    id: 'business-growth-consulting',
    category: 'Consulting',
    title: 'Business Growth & Performance Consulting',
    format: '1-on-1 Advisory & Execution',
    duration: 'Monthly Retainer or Audit',
    summary:
      'End-to-end digital presence scaling for startups, local brands, and founders focused on turning website clicks into qualified inbound leads and measurable ROI.',
    highlights: [
      'Full-funnel Google & Meta Ads management & optimization',
      'Technical & local SEO positioning for organic lead flow',
      'WordPress landing page & CRO architecture redesign',
    ],
  },
  {
    id: 'career-freelance-mentorship',
    category: 'Mentorship',
    title: 'Freelancing & Career Mentorship',
    format: 'Direct Mentorship & Reviews',
    duration: 'Personalized Sprints',
    summary:
      'Targeted portfolio reviews, mock interviews, and client-acquisition playbooks for job seekers, career switchers, and independent digital marketing freelancers.',
    highlights: [
      'Live portfolio & case-study critique',
      'Mock technical interviews for performance & SEO roles',
      'Freelance pricing, pitching & retainer frameworks',
    ],
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't1',
    name: 'Riya Malhotra',
    role: 'Performance Marketing Executive',
    organization: 'D2C Growth Agency, Gurugram',
    platform: 'Google Reviews',
    rating: '5.0 / 5',
    quote:
      'Before joining Yamini Ma’am’s cohort, I only knew textbook definitions of SEO and Ads. Working through live Google Ads budgets and AI copy workflows gave me the confidence to handle real client accounts from day one.',
    outcome: 'Transitioned from fresher to agency role in 8 weeks',
  },
  {
    id: 't2',
    name: 'Ankit Verma',
    role: 'Founder',
    organization: 'Local Wellness & Retail Brand, New Delhi',
    platform: 'Direct Client',
    rating: '5.0 / 5',
    quote:
      'Our website had traffic but barely any inquiry calls. Yamini restructured our landing pages, fixed our Tag Manager conversion events, and rebuilt our Meta lead campaigns so every ad rupee was accountable.',
    outcome: 'Predictable weekly inbound lead pipeline',
  },
  {
    id: 't3',
    name: 'Sneha Joshi',
    role: 'Final-Year Commerce Student',
    organization: 'University of Delhi Workshop Attendee',
    platform: 'UrbanPro',
    rating: '4.9 / 5',
    quote:
      'Her session at college completely demystified how Generative AI fits into real digital marketing jobs. She breaks down complex dashboards like GA4 and Meta Ads Manager with remarkable clarity and patience.',
    outcome: 'Built a live freelance portfolio before graduation',
  },
];

export const CONTACT_DETAILS = {
  brand: 'Digital Yamini',
  person: 'Yamini Katara',
  website: 'https://digitalyamini.com',
  websiteDisplay: 'digitalyamini.com',
  email: 'connect@digitalyamini.com',
  phone: '+91 9871082825',
  phoneHref: 'tel:+919871082825',
  whatsappHref: 'https://wa.me/919871082825',
  address: 'S-4/74, Old Mahavir Nagar, Janakpuri East, New Delhi – 110018, India',
  credentials: 'Google & Meta Certified Trainer & Strategist',
};
