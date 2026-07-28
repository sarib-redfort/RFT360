/**
 * Seed content for RFT360 — the employer-branding platform.
 *
 * The copy here is employer-branding-first (culture, careers, life at RedFort)
 * per the business portfolio, while the section ORDER follows the planner's
 * mandated homepage flow. Everything is editable from the CMS afterwards.
 */
import {
  EmploymentType,
  ExperienceLevel,
  HomepageSectionType,
  NavLocation,
  WorkMode,
} from '@rft360/shared';

/**
 * Placeholder imagery.
 *
 * Seeded as `Media` rows whose `storageKey` is an absolute URL — the web app's
 * media resolver passes absolute URLs straight through, so these render without
 * any local files. They exist purely so the site looks complete before real
 * photography is uploaded; replace each one from the CMS media library
 * (Admin → Media) and the references update automatically.
 */
const UNSPLASH = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export const seedImages = [
  { key: 'culture-team', photo: 'photo-1522071820081-009f0129c71c', alt: 'RedFort team collaborating in the office' },
  { key: 'office-space', photo: 'photo-1497366216548-37526070297c', alt: 'The RedFort workspace' },
  { key: 'engineering', photo: 'photo-1531482615713-2afd69097998', alt: 'An engineer at work' },
  { key: 'meeting', photo: 'photo-1600880292203-757bb62b4baf', alt: 'A team planning session' },
  { key: 'celebration', photo: 'photo-1531545514256-b1400bc00f31', alt: 'The team celebrating together' },
  { key: 'hackathon', photo: 'photo-1515187029135-18ee286d815b', alt: 'Hackathon in progress' },
  { key: 'talk', photo: 'photo-1540575467063-178a50c2df87', alt: 'A tech talk being delivered' },
  { key: 'family-day', photo: 'photo-1511578314322-379afb476865', alt: 'RedFort family day' },
  { key: 'learning', photo: 'photo-1543269865-cbf427effbad', alt: 'Colleagues learning together' },
  { key: 'mentoring', photo: 'photo-1556761175-b413da4baf72', alt: 'Mentoring session at RedFort' },
  { key: 'desk', photo: 'photo-1517245386807-bb43f82c33c4', alt: 'A developer workspace' },
  { key: 'standup', photo: 'photo-1552664730-d307ca884978', alt: 'Morning stand-up' },
].map((image) => ({ ...image, url: UNSPLASH(image.photo) }));

export const cultureValues = [
  {
    title: 'People First',
    description:
      'We invest in our people the way great companies invest in their products — relentlessly. Growth, wellbeing and belonging come before everything else.',
    icon: 'fa-solid fa-people-group',
  },
  {
    title: 'Craftsmanship',
    description:
      'We take pride in the details. Whether it is a line of code or a customer conversation, we do it with care and to a standard we can be proud of.',
    icon: 'fa-solid fa-gem',
  },
  {
    title: 'Ownership',
    description:
      'Everyone here is an owner. We take responsibility end to end, make decisions close to the work, and follow through on what we start.',
    icon: 'fa-solid fa-flag-checkered',
  },
  {
    title: 'Always Learning',
    description:
      'Curiosity is in our DNA. We share what we know, ask questions freely, and treat every project as a chance to get better.',
    icon: 'fa-solid fa-graduation-cap',
  },
  {
    title: 'Integrity',
    description:
      'We do the right thing even when no one is watching. Honesty and transparency are how we build trust with each other and the world.',
    icon: 'fa-solid fa-handshake-angle',
  },
  {
    title: 'One Team',
    description:
      'We win together. We celebrate each other, cover for each other, and believe the best work happens when talented people collaborate openly.',
    icon: 'fa-solid fa-hands-holding-circle',
  },
];

export const perks = [
  {
    title: 'Competitive Salary',
    description:
      'Market-leading compensation with annual reviews and performance bonuses that recognise the impact you make.',
    icon: 'fa-solid fa-sack-dollar',
  },
  {
    title: 'Health & Wellness',
    description:
      'Comprehensive health cover for you and your family, plus mental-health support and a wellness stipend.',
    icon: 'fa-solid fa-heart-pulse',
  },
  {
    title: 'Learning Budget',
    description:
      'An annual budget for courses, certifications, books and conferences. Your growth is our investment.',
    icon: 'fa-solid fa-book-open-reader',
  },
  {
    title: 'Flexible Hours',
    description:
      'We care about outcomes, not clock-watching. Flexible timings and a hybrid-friendly culture that respects your life.',
    icon: 'fa-solid fa-clock',
  },
  {
    title: 'Modern Workspace',
    description:
      'A vibrant office with the latest equipment, collaborative spaces, free meals and endless coffee.',
    icon: 'fa-solid fa-building-user',
  },
  {
    title: 'Career Growth',
    description:
      'Clear career ladders, regular mentorship, and real opportunities to grow into leadership from within.',
    icon: 'fa-solid fa-arrow-trend-up',
  },
];

export const statistics = [
  { value: '250+', label: 'Team Members', icon: 'fa-solid fa-users' },
  { value: '10+', label: 'Years of Excellence', icon: 'fa-solid fa-award' },
  { value: '15+', label: 'Cities Represented', icon: 'fa-solid fa-city' },
  { value: '96%', label: 'Employee Retention', icon: 'fa-solid fa-heart' },
];

/** Seeded as "What Our Teams Do" — RedFort's internal disciplines. */
export const services = [
  {
    title: 'Engineering',
    slug: 'engineering',
    shortDescription:
      'Our engineers build robust, high-performance products across web, mobile and cloud using modern stacks.',
    icon: 'fa-solid fa-code',
    features: ['Web & Mobile', 'Cloud & DevOps', 'Platform Engineering'],
    isFeatured: true,
  },
  {
    title: 'Product & Design',
    slug: 'product-design',
    shortDescription:
      'Designers and product managers who craft intuitive experiences people genuinely love to use.',
    icon: 'fa-solid fa-pen-ruler',
    features: ['UX Research', 'Product Strategy', 'Design Systems'],
    isFeatured: true,
  },
  {
    title: 'Quality Assurance',
    slug: 'quality-assurance',
    shortDescription:
      'QA specialists who safeguard quality with rigorous automated and manual testing at every stage.',
    icon: 'fa-solid fa-vials',
    features: ['Automation', 'Performance Testing', 'Security Testing'],
    isFeatured: true,
  },
  {
    title: 'Data & AI',
    slug: 'data-ai',
    shortDescription:
      'Data scientists and ML engineers turning information into intelligent, real-world products.',
    icon: 'fa-solid fa-brain',
    features: ['Machine Learning', 'Analytics', 'Data Engineering'],
    isFeatured: true,
  },
  {
    title: 'People & Culture',
    slug: 'people-culture',
    shortDescription:
      'The team behind our team — hiring brilliant people and nurturing a workplace where they thrive.',
    icon: 'fa-solid fa-people-arrows',
    features: ['Talent Acquisition', 'Learning & Development', 'Employee Experience'],
    isFeatured: true,
  },
  {
    title: 'Business Operations',
    slug: 'business-operations',
    shortDescription:
      'Operations, finance and strategy professionals who keep RedFort running and growing smoothly.',
    icon: 'fa-solid fa-briefcase',
    features: ['Strategy', 'Finance', 'Operations'],
    isFeatured: true,
  },
];

/** Seeded as "Domains We Work In". */
export const industries = [
  { name: 'Fintech', slug: 'fintech', icon: 'fa-solid fa-credit-card' },
  { name: 'E-Commerce', slug: 'e-commerce', icon: 'fa-solid fa-cart-shopping' },
  { name: 'Healthcare', slug: 'healthcare', icon: 'fa-solid fa-house-medical' },
  { name: 'Education', slug: 'education', icon: 'fa-solid fa-graduation-cap' },
  { name: 'Logistics', slug: 'logistics', icon: 'fa-solid fa-truck-fast' },
  { name: 'Enterprise', slug: 'enterprise', icon: 'fa-solid fa-building-columns' },
];

export const departments = [
  { name: 'Engineering', slug: 'engineering', icon: 'fa-solid fa-code' },
  { name: 'Product & Design', slug: 'product-design', icon: 'fa-solid fa-pen-ruler' },
  { name: 'Quality Assurance', slug: 'quality-assurance', icon: 'fa-solid fa-vials' },
  { name: 'Data & AI', slug: 'data-ai', icon: 'fa-solid fa-brain' },
  { name: 'People & Culture', slug: 'people-culture', icon: 'fa-solid fa-people-group' },
  { name: 'Business Operations', slug: 'business-operations', icon: 'fa-solid fa-briefcase' },
];

export const jobs = [
  {
    title: 'Senior Full-Stack Engineer',
    slug: 'senior-full-stack-engineer',
    departmentSlug: 'engineering',
    location: 'Lahore, Pakistan',
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    experienceLevel: ExperienceLevel.SENIOR,
    summary:
      'Build and scale products used by thousands, working across the stack with React, Node.js and PostgreSQL.',
    responsibilities: [
      'Design, build and ship features across the full stack',
      'Mentor junior engineers and review code with care',
      'Collaborate with product and design to solve real user problems',
      'Own the quality, performance and reliability of what you build',
    ],
    requirements: [
      '5+ years of professional software engineering experience',
      'Strong TypeScript, React and Node.js skills',
      'Solid understanding of relational databases and API design',
      'A track record of shipping and maintaining production systems',
    ],
    niceToHave: ['Experience with Next.js and NestJS', 'Cloud (AWS/GCP) experience'],
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Next.js'],
    isFeatured: true,
  },
  {
    title: 'Product Designer',
    slug: 'product-designer',
    departmentSlug: 'product-design',
    location: 'Lahore, Pakistan',
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    experienceLevel: ExperienceLevel.MID,
    summary:
      'Shape intuitive, beautiful experiences end to end — from research and wireframes to polished, shipped design.',
    responsibilities: [
      'Own the design of features from concept to delivery',
      'Run user research and translate insights into design decisions',
      'Contribute to and evolve our design system',
    ],
    requirements: [
      '3+ years designing digital products',
      'Strong portfolio demonstrating UX and UI craft',
      'Fluency with Figma and modern design workflows',
    ],
    skills: ['Figma', 'UX Research', 'Design Systems', 'Prototyping'],
    isFeatured: true,
  },
  {
    title: 'QA Automation Engineer',
    slug: 'qa-automation-engineer',
    departmentSlug: 'quality-assurance',
    location: 'Lahore, Pakistan',
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    experienceLevel: ExperienceLevel.MID,
    summary:
      'Safeguard product quality with robust automated test suites and a sharp eye for edge cases.',
    responsibilities: [
      'Build and maintain automated test suites',
      'Partner with engineers to bake quality into the process',
      'Investigate, reproduce and document defects clearly',
    ],
    requirements: [
      '3+ years in QA with automation experience',
      'Hands-on with Playwright, Cypress or Selenium',
      'Understanding of CI/CD pipelines',
    ],
    skills: ['Playwright', 'Automation', 'CI/CD', 'TypeScript'],
    isFeatured: false,
  },
  {
    title: 'Software Engineering Intern',
    slug: 'software-engineering-intern',
    departmentSlug: 'engineering',
    location: 'Lahore, Pakistan',
    employmentType: EmploymentType.INTERNSHIP,
    workMode: WorkMode.ONSITE,
    experienceLevel: ExperienceLevel.INTERNSHIP,
    summary:
      'Kick-start your career at RedFort. Learn from senior engineers while contributing to real products.',
    responsibilities: [
      'Work alongside experienced engineers on live projects',
      'Learn our tools, practices and engineering culture',
      'Take ownership of well-scoped tasks with mentorship',
    ],
    requirements: [
      'Final-year student or recent graduate in CS or related field',
      'Solid fundamentals in at least one programming language',
      'Eagerness to learn and a collaborative attitude',
    ],
    skills: ['JavaScript', 'Git', 'Problem Solving'],
    isFeatured: true,
  },
];

export const testimonials = [
  {
    authorName: 'Ayesha Khan',
    authorRole: 'Senior Software Engineer',
    quote:
      'RedFort is the first place I have worked where growth is not just a promise on a careers page — it is built into everything. I have learned more here in two years than in the five before it.',
    rating: 5,
    isFeatured: true,
  },
  {
    authorName: 'Bilal Ahmed',
    authorRole: 'Product Designer',
    quote:
      'The culture is genuinely collaborative. Ideas are heard no matter who they come from, and the people around me push me to do my best work every single day.',
    rating: 5,
    isFeatured: true,
  },
  {
    authorName: 'Fatima Noor',
    authorRole: 'QA Lead',
    quote:
      'What sets RedFort apart is how much it invests in people. The learning budget, the mentorship, the trust to own my work — it all adds up to a place I am proud to call home.',
    rating: 5,
    isFeatured: true,
  },
];

export const faqs = [
  {
    question: 'What is RFT360?',
    answer:
      'RFT360 is our careers and culture platform. It’s where we show what we value, how we work, and what it’s actually like to build a career here.',
    category: 'General',
  },
  {
    question: 'How do I apply for a role at RedFort?',
    answer:
      'Browse our open positions on the Careers page and apply directly through the site. Upload your CV, tell us a little about yourself, and our talent team will be in touch.',
    category: 'Careers',
  },
  {
    question: 'Do you hire fresh graduates and interns?',
    answer:
      'Absolutely. We actively hire graduates and interns and invest heavily in early-career growth through structured mentorship and learning programmes.',
    category: 'Careers',
  },
  {
    question: 'Is remote or hybrid work available?',
    answer:
      'Many of our roles are hybrid-friendly. We care about outcomes and offer flexibility wherever the role allows. Each job posting lists its specific work arrangement.',
    category: 'Work Life',
  },
  {
    question: 'What is the interview process like?',
    answer:
      'Our process is designed to be respectful of your time — typically an introductory conversation, a role-specific assessment or discussion, and a final conversation with the team you would join.',
    category: 'Careers',
  },
  {
    question: 'What benefits do RedFort employees receive?',
    answer:
      'Competitive salaries, comprehensive health cover, an annual learning budget, flexible hours, a modern workspace and genuine career-growth opportunities. See the Life at RedFort page for more.',
    category: 'Benefits',
  },
];

export const caseStudies = [
  {
    title: 'From Intern to Team Lead in Three Years',
    slug: 'intern-to-team-lead',
    subtitle: 'Hamza’s journey through RedFort',
    summary:
      'Hamza joined as a software engineering intern and, through mentorship and ownership, grew into a team lead guiding a squad of eight.',
    clientName: 'Employee Story',
    results: [
      { label: 'Years to Team Lead', value: '3' },
      { label: 'Team Size', value: '8' },
      { label: 'Projects Shipped', value: '20+' },
    ],
    tags: ['Growth', 'Engineering', 'Mentorship'],
    isFeatured: true,
    imageKey: 'mentoring',
  },
  {
    title: 'Building a Culture of Continuous Learning',
    slug: 'culture-of-learning',
    subtitle: 'How our L&D programme transformed the team',
    summary:
      'A look at how RedFort’s learning-and-development initiatives helped the team upskill and earn dozens of certifications in a single year.',
    clientName: 'Culture Story',
    results: [
      { label: 'Certifications', value: '60+' },
      { label: 'Courses Completed', value: '300+' },
      { label: 'Satisfaction', value: '98%' },
    ],
    tags: ['Learning', 'Culture'],
    isFeatured: true,
    imageKey: 'learning',
  },
];

export const events = [
  {
    title: 'RedFort Annual Hackathon 2026',
    slug: 'annual-hackathon-2026',
    summary:
      '48 hours of building, collaboration and creativity as our teams compete to turn bold ideas into working prototypes.',
    location: 'RFT360 HQ, Lahore',
    isFeatured: true,
    daysFromNow: 30,
    imageKey: 'hackathon',
  },
  {
    title: 'Tech Talks: The Future of AI',
    slug: 'tech-talks-future-of-ai',
    summary:
      'An evening of talks from our Data & AI team on where machine learning is heading and how we are building with it.',
    location: 'RedFort Auditorium',
    isFeatured: false,
    daysFromNow: 14,
    imageKey: 'talk',
  },
  {
    title: 'RedFort Family Day 2025',
    slug: 'family-day-2025',
    summary:
      'A day of fun, food and games as we welcomed families to celebrate the people behind RedFort.',
    location: 'Jilani Park, Lahore',
    isFeatured: false,
    daysFromNow: -60,
    imageKey: 'family-day',
  },
];

export const galleryAlbums = [
  {
    title: 'Life at the Office',
    slug: 'life-at-the-office',
    description: 'Glimpses of a typical day at RedFort — from focused work to shared laughter.',
    imageKey: 'office-space',
    photoKeys: ['office-space', 'engineering', 'desk', 'standup', 'meeting', 'mentoring'],
  },
  {
    title: 'Team Celebrations',
    slug: 'team-celebrations',
    description: 'The moments we come together to celebrate wins, milestones and each other.',
    imageKey: 'celebration',
    photoKeys: ['celebration', 'family-day', 'hackathon', 'culture-team'],
  },
];

export const certifications = [
  { name: 'ISO 27001 Certified', issuer: 'ISO', icon: 'fa-solid fa-shield-halved' },
  { name: 'Great Place to Work', issuer: 'GPTW', icon: 'fa-solid fa-award' },
  { name: 'ISO 9001 Quality', issuer: 'ISO', icon: 'fa-solid fa-certificate' },
];

export const awards = [
  { title: 'Best Places to Work 2025', issuer: 'TechPakistan', icon: 'fa-solid fa-trophy' },
  { title: 'Employer of the Year', issuer: 'HR Excellence Awards', icon: 'fa-solid fa-medal' },
  { title: 'Top Tech Employer', issuer: 'Rozee.pk', icon: 'fa-solid fa-star' },
];

export const teamMembers = [
  {
    name: 'Usman Malik',
    role: 'Chief Executive Officer',
    bio: 'Usman leads RedFort with a people-first vision, building a company where talented individuals do the best work of their careers.',
    isLeadership: true,
  },
  {
    name: 'Sana Riaz',
    role: 'Chief Technology Officer',
    bio: 'Sana heads our engineering org, championing craftsmanship, mentorship and a culture of continuous learning.',
    isLeadership: true,
  },
  {
    name: 'Ahmed Sheikh',
    role: 'Head of People & Culture',
    bio: 'Ahmed shapes the employee experience at RedFort, from hiring brilliant people to helping them grow and thrive.',
    isLeadership: true,
  },
  {
    name: 'Zara Iqbal',
    role: 'Head of Product & Design',
    bio: 'Zara leads product and design, ensuring everything we build is intuitive, beautiful and genuinely useful.',
    isLeadership: true,
  },
];

/**
 * Footer navigation — two columns, each a parent item whose children are the
 * links. Seeded so the footer is CMS-driven out of the box; edit or add
 * columns in Admin → Navigation.
 */
export const footerColumns = [
  {
    label: 'Explore',
    children: [
      { label: 'Home', href: '/' },
      { label: 'About Culture', href: '/about-culture' },
      { label: 'Life at RFT360', href: '/life-at-redfort' },
      { label: 'Events', href: '/events' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Blogs', href: '/blogs' },
    ],
  },
  {
    label: 'Careers',
    children: [
      { label: 'Open Positions', href: '/careers' },
      { label: 'Our Culture', href: '/about-culture' },
      { label: 'Life at RFT360', href: '/life-at-redfort' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

/** Navigation — the eight planner pages, in order. */
export const navigationItems = [
  { label: 'Home', href: '/', location: NavLocation.HEADER, order: 0 },
  { label: 'About Culture', href: '/about-culture', location: NavLocation.HEADER, order: 1 },
  { label: 'Careers', href: '/careers', location: NavLocation.HEADER, order: 2 },
  { label: 'Life at RedFort', href: '/life-at-redfort', location: NavLocation.HEADER, order: 3 },
  { label: 'Events', href: '/events', location: NavLocation.HEADER, order: 4 },
  { label: 'Gallery', href: '/gallery', location: NavLocation.HEADER, order: 5 },
  { label: 'Blogs', href: '/blogs', location: NavLocation.HEADER, order: 6 },
  { label: 'Contact', href: '/contact', location: NavLocation.HEADER, order: 7 },
];

/** The eight planner pages with hero copy. */
export const pages = [
  {
    slug: 'about-culture',
    title: 'About Culture',
    eyebrow: 'Who we are',
    heading: 'A culture built around',
    headingAccent: 'people',
    subheading:
      'At RedFort, our culture is not a poster on the wall — it is how we work, grow and win together every day.',
  },
  {
    slug: 'careers',
    title: 'Careers',
    eyebrow: 'Join the team',
    heading: 'Build your career',
    headingAccent: 'at RFT360',
    subheading:
      'Work on hard problems with brilliant people, and grow faster than you thought possible. Explore our open roles.',
  },
  {
    slug: 'life-at-redfort',
    title: 'Life at RedFort',
    eyebrow: 'Life here',
    heading: 'More than',
    headingAccent: 'a workplace',
    subheading:
      'Discover what it is really like to work at RedFort — the people, the perks, the growth and the everyday moments.',
  },
  {
    slug: 'events',
    title: 'Events',
    eyebrow: 'What’s happening',
    heading: 'Events at',
    headingAccent: 'RFT360',
    subheading:
      'From hackathons to family days, our events bring people together and make RedFort more than just a company.',
  },
  {
    slug: 'gallery',
    title: 'Gallery',
    eyebrow: 'In pictures',
    heading: 'Moments at',
    headingAccent: 'RFT360',
    subheading: 'A visual journey through life, work and celebration at RedFort.',
  },
  {
    slug: 'blogs',
    title: 'Blogs',
    eyebrow: 'From our team',
    heading: 'Insights &',
    headingAccent: 'stories',
    subheading:
      'Thoughts on technology, culture and careers from the people who make RedFort what it is.',
  },
  {
    slug: 'contact',
    title: 'Contact',
    eyebrow: 'Get in touch',
    heading: 'Let’s',
    headingAccent: 'talk',
    subheading:
      'Questions about careers, culture or RedFort in general? We would love to hear from you.',
  },
];

/**
 * Homepage sections in the planner's mandated order. `type` drives which linked
 * records render; the copy is the editable heading/subheading.
 */
export const homepageSections = [
  {
    type: HomepageSectionType.HERO,
    name: 'Hero',
    eyebrow: 'RFT360 · Lahore, Pakistan',
    heading: 'Build Your Career',
    headingAccent: 'at RedFort',
    subheading: 'Work with people who care about the craft. Grow faster than you expected.',
    ctaPrimary: { label: 'Explore Careers', href: '/careers', variant: 'primary' },
    ctaSecondary: { label: 'Life at RedFort', href: '/life-at-redfort', variant: 'outline' },
  },
  {
    type: HomepageSectionType.WHO_WE_ARE,
    name: 'Who We Are',
    eyebrow: 'Inside RedFort',
    heading: 'Where careers are',
    headingAccent: 'built, not filled',
    subheading:
      'We build products people rely on — and a workplace people stay in. This is where we tell that story.',
    imageKey: 'culture-team',
  },
  {
    type: HomepageSectionType.SERVICES,
    name: 'What Our Teams Do',
    eyebrow: 'Six disciplines',
    heading: 'The teams you could',
    headingAccent: 'join',
    subheading: 'Engineering, design, QA, data, people and operations — six teams, one standard.',
    itemLimit: 6,
  },
  {
    type: HomepageSectionType.WHY_CHOOSE_US,
    name: 'Why Work With Us',
    eyebrow: 'What you get',
    heading: 'Benefits that',
    headingAccent: 'actually matter',
    subheading: 'Not ping-pong tables. Real salary, real cover, real time to learn.',
    itemLimit: 6,
  },
  {
    type: HomepageSectionType.INDUSTRIES,
    name: 'Domains We Work In',
    eyebrow: 'Where our work lands',
    heading: 'Industries we',
    headingAccent: 'build for',
    subheading: 'Deep expertise across the industries shaping tomorrow.',
    itemLimit: 6,
  },
  {
    type: HomepageSectionType.CASE_STUDIES,
    name: 'Employee Success Stories',
    eyebrow: 'Real people, real growth',
    heading: 'Where our people',
    headingAccent: 'ended up',
    subheading: 'Real stories from real people who have grown their careers at RedFort.',
    itemLimit: 3,
  },
  {
    type: HomepageSectionType.TESTIMONIALS,
    name: 'Testimonials',
    eyebrow: 'Unedited',
    heading: 'What the team',
    headingAccent: 'actually says',
    subheading: 'No marketing polish — just what it’s like to work here.',
    itemLimit: 3,
  },
  {
    type: HomepageSectionType.FAQ,
    name: 'FAQ',
    eyebrow: 'Before you apply',
    heading: 'Questions we get',
    headingAccent: 'a lot',
    subheading: 'Everything you need to know about careers and life at RedFort.',
    itemLimit: 6,
  },
  {
    type: HomepageSectionType.LATEST_BLOGS,
    name: 'Latest Blogs',
    eyebrow: 'From the team',
    heading: 'What we’re',
    headingAccent: 'writing about',
    subheading: 'Stories and perspectives from the RedFort team.',
    itemLimit: 3,
  },
  {
    type: HomepageSectionType.CONTACT_FORM,
    name: 'Contact Form',
    eyebrow: 'Next step',
    heading: 'Let’s talk about',
    headingAccent: 'your career',
    subheading:
      'Whether you have a question or are ready to apply, we would love to hear from you.',
    ctaPrimary: { label: 'View Open Roles', href: '/careers', variant: 'primary' },
  },
];

export const postCategories = [
  { name: 'Engineering', slug: 'engineering', color: '#DE181B' },
  { name: 'Culture', slug: 'culture', color: '#13120D' },
  { name: 'Careers', slug: 'careers', color: '#DE181B' },
];

export const tags = [
  { name: 'Life at RedFort', slug: 'life-at-redfort' },
  { name: 'Growth', slug: 'growth' },
  { name: 'Engineering', slug: 'engineering' },
  { name: 'Hiring', slug: 'hiring' },
];

export const posts = [
  {
    title: 'Why We Put People First at RedFort',
    slug: 'why-we-put-people-first',
    categorySlug: 'culture',
    excerpt:
      'A look inside the philosophy that shapes everything we do — and why investing in people is the best investment we make.',
    contentHtml:
      '<h2>People are the product</h2><p>At RedFort, we believe that when you take care of your people, they take care of everything else. Our culture is built on a simple idea: hire brilliant people, give them meaningful work, and get out of their way.</p><p>This is not just a nice sentiment. It shapes how we hire, how we grow careers, and how we make decisions every day.</p><h3>What this looks like in practice</h3><p>From our learning budgets to our mentorship programmes, every part of the RedFort experience is designed to help people do the best work of their careers — and to enjoy doing it.</p>',
    tagSlugs: ['life-at-redfort', 'growth'],
    isFeatured: true,
    imageKey: 'culture-team',
  },
  {
    title: 'From Intern to Engineer: A Growth Story',
    slug: 'intern-to-engineer-growth-story',
    categorySlug: 'careers',
    excerpt:
      'How our internship programme turns eager graduates into confident engineers — and what we look for.',
    contentHtml:
      '<h2>Starting your journey</h2><p>Every senior engineer was once a beginner. At RedFort, our internship programme is designed to accelerate that journey with real projects, real mentorship and real ownership.</p><p>We do not believe in coffee-fetching internships. From day one, our interns work alongside senior engineers on live products.</p>',
    tagSlugs: ['hiring', 'growth', 'engineering'],
    isFeatured: false,
    imageKey: 'mentoring',
  },
  {
    title: 'Engineering Excellence: How We Build',
    slug: 'engineering-excellence-how-we-build',
    categorySlug: 'engineering',
    excerpt:
      'A peek into the engineering practices, tools and principles that help our teams ship quality software.',
    contentHtml:
      '<h2>Craftsmanship at scale</h2><p>Great software is not an accident. It is the result of deliberate practices, the right tools and a culture that values quality. Here is how we build at RedFort.</p><p>We invest in code review, automated testing, and continuous learning — because the details are what separate good from great.</p>',
    tagSlugs: ['engineering'],
    isFeatured: false,
    imageKey: 'engineering',
  },
];
