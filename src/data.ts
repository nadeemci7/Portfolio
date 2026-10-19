/*
  Everything the site says lives in this file.

  To add a project: copy one block in PROJECTS, change the text, and list the
  tools it uses in `uses` (keys from TOOLS). `face` is optional:
    color: blue | yellow | red | pink | teal | ink | cloud | orange
    shape: round | egg | bean | pill | cloud | squircle
    eyes:  dots | dashes | strobi | vee | dashdot
*/

export type ColorName = 'blue' | 'yellow' | 'red' | 'pink' | 'teal' | 'ink' | 'cloud' | 'orange'
export type Shape = 'round' | 'egg' | 'bean' | 'pill' | 'cloud' | 'squircle'
export type Eyes = 'dots' | 'dashes' | 'strobi' | 'vee' | 'dashdot'

export interface FaceSpec {
  color: ColorName
  shape: Shape
  eyes: Eyes
}

export interface Tool extends FaceSpec {
  key: string
  label: string
  size: number
}

export interface Project {
  id: string
  name: string
  kind: string
  /** what the card's character says when you hover the card */
  teaser?: string
  when?: string
  featured?: boolean
  face?: FaceSpec
  line: string
  facts?: string[]
  chain?: string[]
  stack: string[]
  uses: string[]
  links?: { label: string; href: string }[]
  /** screenshots; the first one shows on the card, all of them in the Screens tab */
  images?: { src: string; alt: string; caption: string }[]
  built: string[]
}

/* Files in public/ are referenced through BASE so they work under any path. */
const BASE = import.meta.env.BASE_URL

export const PROFILE = {
  name: 'Nadeem Ahmad',
  role: 'Full stack developer',
  email: 'nadeem25official@gmail.com',
  linkedin: 'https://www.linkedin.com/in/nadeem-ahmad25/',
  github: 'https://github.com/nadeem-25',
  location: 'Delhi, India',
  cvPdf: BASE + 'cv/Nadeem-Ahmad-CV.pdf',
  cvTex: BASE + 'cv/Nadeem-Ahmad-CV.tex',
  cvPreview: BASE + 'cv/cv-page-1.jpg',
  cvUpdated: '19 Oct 2026',
}

export const TOOLS: Tool[] = [
  { key: 'apex', label: 'Apex', color: 'blue', shape: 'round', eyes: 'strobi', size: 1.22 },
  { key: 'lwc', label: 'LWC', color: 'pink', shape: 'bean', eyes: 'dashes', size: 1.0 },
  { key: 'agentforce', label: 'Agentforce', color: 'teal', shape: 'pill', eyes: 'dashdot', size: 1.08 },
  { key: 'flows', label: 'Flows', color: 'cloud', shape: 'cloud', eyes: 'vee', size: 1.02 },
  { key: 'java', label: 'Java', color: 'yellow', shape: 'egg', eyes: 'dashes', size: 1.1 },
  { key: 'spring', label: 'Spring Boot', color: 'red', shape: 'squircle', eyes: 'dots', size: 1.0 },
  { key: 'sql', label: 'SQL', color: 'ink', shape: 'round', eyes: 'dashes', size: 0.92 },
  { key: 'nextjs', label: 'Next.js', color: 'orange', shape: 'squircle', eyes: 'dots', size: 0.9 },
]

const HF = 'https://great-codey-17397-dev-ed.develop.my.site.com'

export const PROJECTS: Project[] = [
  {
    id: 'healthfirst',
    name: 'HealthFirst Clinics',
    kind: 'Health Cloud · live',
    teaser: '3 sites, live right now',
    when: 'Sep 2026 to now',
    featured: true,
    face: { color: 'teal', shape: 'round', eyes: 'dots' },
    line: 'A healthcare CRM for a group of clinics, built end to end on Salesforce, with three live sites: a public website, a patient portal and a doctor portal.',
    facts: ['98 Apex classes', '51 LWCs', '642 test methods', '3 live sites'],
    stack: ['Apex', 'LWC', 'Health Cloud', 'Experience Cloud', 'Service Cloud', 'Flows', 'Platform Events', 'OpenAI API'],
    uses: ['apex', 'lwc', 'flows', 'sql'],
    links: [
      { label: 'Public website', href: HF + '/healthfirst/' },
      { label: 'Patient portal', href: HF + '/patients/' },
      { label: 'Doctor portal', href: HF + '/doctors/' },
    ],
    images: [
      {
        src: BASE + 'work/healthfirst.jpg',
        alt: 'The HealthFirst Clinics public website: an inquiry form beside the headline "Trusted care in 12 cities. One place to ask."',
        caption: 'The public website. Patients send one inquiry; it becomes a Case with an SLA and a named team.',
      },
      {
        src: BASE + 'work/healthfirst-full.jpg',
        alt: 'The full HealthFirst public page: inquiry form, what happens after you send it, and specialists in 10 departments.',
        caption: 'The whole public page, from the inquiry form down to the ten departments. Scroll inside the picture.',
      },
    ],
    built: [
      '98 Apex classes (33,000+ lines), 17 triggers, 51 LWCs, 9 custom objects and 6 custom metadata types, covered by 642 Apex test methods.',
      'Three Experience Cloud sites: a public website with an inquiry form, a patient portal (appointments, bills, records, care plans) and a doctor portal (diary, patients, admissions).',
      'Inquiry handling on Cases with assignment and escalation rules, entitlement SLAs with milestones, and work queues for coordinators.',
      'AI triage that scores urgency and specialty through a Named Credential callout to OpenAI, and falls back to rule-based scoring on any timeout, rate limit or bad response.',
      "An in-app AI agent whose every read and write runs in Apex User Mode, so it can never go past the operator's sharing, object and field permissions.",
      'Booking and auto-booking on Service Appointments, bed admissions and discharge, billing with invoice lines, and Visualforce PDF invoices and prescriptions.',
      'Guest and portal flows secured with SHA-256 hashed one-time codes, per-user and daily rate limits and enumeration-safe responses, plus consent tracking, data-erasure requests, retention batch jobs and a FHIR R4 health-record export.',
    ],
  },
  {
    id: 'sales-assistant',
    name: 'Sales Assistant and Integration Hub',
    kind: 'Sales Cloud · Agentforce · Slack',
    teaser: 'Ask me about your deals',
    when: 'Oct 2026',
    featured: true,
    face: { color: 'blue', shape: 'round', eyes: 'strobi' },
    line: 'Reps ask an Agentforce agent in Slack to find, update and create Salesforce records. Behind it, a sync engine keeps Salesforce, Slack, HubSpot, TallyPrime and Meta in step.',
    facts: ['5 Apex agent actions', '4 systems synced', 'mappings in Custom Metadata'],
    stack: ['Apex', 'LWC', 'Agentforce', 'Agent Script', 'Slack API', 'HubSpot API', 'Meta Marketing API', 'TallyPrime'],
    uses: ['apex', 'lwc', 'agentforce', 'sql'],
    images: [
      {
        src: BASE + 'work/sales-assistant-slack.jpg',
        alt: 'The Sales Assistant in Slack answering "which of my deals close in the next 30 days?" and updating an opportunity after a confirm step.',
        caption: 'In Slack: a rep asks about deals closing this month, then moves one to Needs Analysis after a confirm step.',
      },
      {
        src: BASE + 'work/sales-assistant-salesforce.jpg',
        alt: 'The same Agentforce agent in the Salesforce side panel, next to the opportunity record it is talking about.',
        caption: 'The same agent inside Salesforce, in the side panel next to the deal it is working on.',
      },
    ],
    built: [
      'An Agentforce employee agent that lets reps search, read, create and update records and review their pipeline from Slack, through five Apex actions that confirm before any write.',
      'A sync engine for Slack, HubSpot, TallyPrime, Meta Ads and Meta Lead Ads, with direction, schedule and conflict rule set per connection. Field and object mappings live in Custom Metadata, so a new mapping needs no code.',
      'Opportunity changes posted to a Slack channel with before and after values and a link to the record, plus Slack channels on record pages and Sales Cloud for Slack.',
      'Credentials kept server-side in a protected custom setting and never sent to the browser. The hub is tested with Apex tests against mocked APIs.',
    ],
  },
  {
    id: 'scallor',
    name: 'Scallor',
    kind: 'SaaS platform',
    teaser: 'I catch scope creep',
    face: { color: 'ink', shape: 'round', eyes: 'dashes' },
    line: 'Delivery intelligence for consulting teams. Scallor reads SOWs, meetings, Slack, email and tickets and flags scope changes nobody priced.',
    stack: ['Next.js', 'TypeScript', 'Supabase'],
    uses: ['nextjs', 'sql'],
    links: [{ label: 'scallor.com', href: 'https://scallor.com' }],
    built: [
      "Work on the platform's API routes, server actions, scheduled jobs and webhook receivers.",
      'A focus on keeping them reliable in production as data and traffic grow.',
    ],
  },
  {
    id: 'revenue-cloud',
    name: 'Revenue Cloud POC',
    kind: 'Revenue Cloud · B2B manufacturing',
    teaser: 'Lead in, order out',
    face: { color: 'yellow', shape: 'egg', eyes: 'dashes' },
    line: 'Lead to Order for a B2B manufacturer, from the first enquiry to an activated order.',
    chain: ['Lead', 'Account', 'Opportunity', 'Quote', 'Order'],
    stack: ['Revenue Cloud', 'Sales Cloud', 'LWC', 'Apex', 'Flows', 'Reports'],
    uses: ['apex', 'lwc', 'flows', 'sql'],
    built: [
      'The whole sales lifecycle, from Lead through Account, Contact, Opportunity and Quote to an activated Order.',
      'The Revenue Cloud product catalog set up for product selection and quoting.',
      'Objects, fields, page layouts and Lightning record pages, with business rules in Validation Rules and Flows.',
      'LWCs for UI needs, Apex and SOQL behind them, and Reports and Dashboards for sales metrics.',
    ],
  },
  {
    id: 'fabric',
    name: 'Fabric Configurator',
    kind: 'Sales Cloud · manufacturing',
    teaser: 'Pick a shade, I check stock',
    when: 'Oct 2026',
    face: { color: 'pink', shape: 'cloud', eyes: 'vee' },
    line: 'A configurator on the Opportunity page for fabric deals. Reps pick fabrics and shades in a seven-tab window and see stock as they go.',
    facts: ['7-tab configuration window', 'live price book catalog'],
    stack: ['LWC', 'Apex', 'Opportunity Products', 'Permission Sets'],
    uses: ['apex', 'lwc', 'sql'],
    built: [
      'The catalog reads active price book entries live, so a new fabric shows up without a deploy.',
      'Each fabric shows its newest product image, or a colour swatch built from the shade name.',
      'Stock is checked at the opportunity, and configured fabrics are saved as Opportunity Products.',
      'Shipped as a new record page next to the existing one, so nothing that already worked was touched.',
    ],
  },
  {
    id: 'zoho-fst',
    name: 'Field Sales on Zoho CRM',
    kind: 'Zoho CRM',
    teaser: '44 modules, zero clicks',
    when: 'Oct 2026',
    face: { color: 'red', shape: 'squircle', eyes: 'dots' },
    line: "The company's Salesforce field sales app, rebuilt inside Zoho CRM and deployed by scripts through Zoho's APIs.",
    facts: ['44 modules', '467 fields', '25 Deluge functions', '9 workflow rules'],
    stack: ['Zoho CRM', 'Deluge', 'COQL', 'Node.js scripts', 'Zoho widgets'],
    uses: [],
    built: [
      'Modules, fields and lookups created through the API from one spec file, so the build can be repeated.',
      'Deluge functions and workflow rules deployed by script, with a compile-and-bisect helper to find the real error line.',
      'Approvals handled in a field ops console instead of Zoho approval processes, which lock records.',
    ],
  },
  {
    id: 'catalyst',
    name: 'Catalyst',
    kind: 'Business platform · in progress',
    teaser: 'Six clouds, one app',
    when: '2026',
    face: { color: 'cloud', shape: 'bean', eyes: 'dashdot' },
    line: "Cloud Ingenious's own business platform, with sales, marketing, order-to-cash, inventory, service and manufacturing in one app.",
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Playwright'],
    uses: ['nextjs', 'sql'],
    built: [
      'Custom objects and fields, record pages, list views and automations that workspace admins set up themselves.',
      'A super admin console on its own domain, with two-factor sign-in, that decides which features each workspace gets.',
      'Docker deployment with tested backups and point-in-time restore.',
    ],
  },
  {
    id: 'quickmart',
    name: 'Quickmart',
    kind: 'Spring Boot backend',
    teaser: 'JWT at the door',
    face: { color: 'orange', shape: 'squircle', eyes: 'dashes' },
    line: 'An e-commerce backend with products, cart, orders and payment simulation, secured with JWT.',
    stack: ['Spring Boot', 'Spring Security', 'JWT', 'Hibernate', 'MySQL', 'Swagger'],
    uses: ['java', 'spring', 'sql'],
    built: [
      'A layered backend (Controller, Service, Repository) with role-based access for Admin and User.',
      'Pagination and filtering for large lists, and stock validation that prevents overselling.',
      'Global exception handling, APIs documented in Swagger, and JPA queries tuned with indexes.',
    ],
  },
  {
    id: 'library',
    name: 'Library Manager',
    kind: 'Core Java console app',
    teaser: 'Overdue? I noticed',
    face: { color: 'yellow', shape: 'pill', eyes: 'dots' },
    line: 'Issue, return, search and member management over JDBC and MySQL, with the DAO pattern keeping SQL out of the business logic.',
    stack: ['Core Java', 'JDBC', 'MySQL', 'OOP'],
    uses: ['java', 'sql'],
    built: [
      'Handles duplicate entries, invalid input and overdue returns.',
      'Java Collections (ArrayList, HashMap) for fast in-memory lookups.',
    ],
  },
]

export const PATH = [
  {
    years: '2026 to now',
    title: 'Full Stack Developer (Salesforce)',
    org: 'Cloud Ingenious',
    now: true,
    text: "Salesforce builds for clients on Health Cloud, Sales Cloud, Revenue Cloud and Agentforce, plus the company's own products: a field sales app on Zoho CRM and Catalyst, a business platform.",
    color: 'teal' as ColorName,
  },
  {
    years: 'Jul 2025 to now',
    title: 'Full Stack Java Developer course',
    org: 'QSpiders',
    text: 'Core and Advanced Java, JDBC, Servlets, JSP and Spring Boot, with full stack projects on REST APIs and MySQL.',
    color: 'yellow' as ColorName,
  },
  {
    years: '2021 to 2024',
    title: 'BCA (Honours)',
    org: 'Magadh University',
    text: 'CGPA 73.3%. Data structures, DBMS, software engineering, OOP and web technologies.',
    color: 'blue' as ColorName,
  },
  {
    years: 'Dec 2022 to Feb 2023',
    title: 'Web Development Intern',
    org: 'JMI Model United Nations',
    text: 'Responsive pages in HTML, CSS and JavaScript, with lazy loading that kept the site fast for 500+ concurrent users, and form validation that cut input errors.',
    color: 'pink' as ColorName,
  },
  {
    years: '2018 to 2021',
    title: 'BA (Honours) in Sociology',
    org: 'Patliputra University',
    text: '',
    color: 'cloud' as ColorName,
  },
]

export const TOOLBOX: { title: string; color: ColorName; items: string[] }[] = [
  {
    title: 'Salesforce development',
    color: 'blue',
    items: ['Apex', 'Triggers', 'Batch and Queueable Apex', 'SOQL', 'SOSL', 'Lightning Web Components', 'Aura', 'Visualforce PDF', 'Platform Events', 'Inbound Email Services', 'Custom Metadata'],
  },
  {
    title: 'Salesforce platform',
    color: 'pink',
    items: ['Health Cloud', 'Service Cloud', 'Sales Cloud', 'Revenue Cloud', 'Experience Cloud', 'Flows', 'Entitlements and Milestones', 'Reports and Dashboards'],
  },
  {
    title: 'AI and agents',
    color: 'teal',
    items: ['Agentforce', 'Agent Script', 'Salesforce for Slack', 'OpenAI API', 'Named Credentials'],
  },
  {
    title: 'Security and integration',
    color: 'cloud',
    items: ['REST APIs', 'Webhooks', 'Apex User Mode', 'Profiles and Permission Sets', 'Sharing Rules', 'Guest User Security', 'Protected Custom Settings'],
  },
  {
    title: 'Java and backend',
    color: 'yellow',
    items: ['Java 8+', 'Spring Boot', 'Spring Security', 'JWT', 'Hibernate', 'JPA', 'MySQL', 'PostgreSQL', 'Database design (3NF)'],
  },
  {
    title: 'Web and tools',
    color: 'orange',
    items: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Supabase', 'HTML and CSS', 'Zoho CRM and Deluge', 'Salesforce CLI', 'Git', 'Postman', 'Maven'],
  },
]
