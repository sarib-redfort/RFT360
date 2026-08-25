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
    title: 'Learn Continuously',
    description:
      'Technology changes fast. We encourage continuous learning, experimentation, and professional development.',
    icon: 'fa-solid fa-book-open-reader',
  },
  {
    title: 'Work on Real Problems',
    description:
      'You won’t just complete tasks. You’ll work on technology challenges that have real business impact.',
    icon: 'fa-solid fa-lightbulb',
  },
  {
    title: 'Grow Your Expertise',
    description:
      'Build deeper expertise while expanding your knowledge across modern technology disciplines.',
    icon: 'fa-solid fa-chart-line',
  },
  {
    title: 'Own Your Work',
    description:
      'We value people who take responsibility, solve problems, and bring ideas to the table.',
    icon: 'fa-solid fa-key',
  },
  {
    title: 'Work With Experts',
    description:
      'Collaborate with professionals who bring different technical perspectives and experiences.',
    icon: 'fa-solid fa-people-group',
  },
  {
    title: 'Build Your Future',
    description:
      'Your growth matters to us. We aim to create opportunities for people who want to build a long-term career in technology.',
    icon: 'fa-solid fa-rocket',
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
    title: 'Cloud Engineering',
    slug: 'cloud-engineering',
    shortDescription:
      'Design, deploy, and optimize cloud environments built for scalability, reliability, and performance.',
    icon: 'fa-solid fa-cloud',
    features: ['Work with:', 'AWS', 'Azure', 'Google Cloud', 'Cloud Architecture'],
    isFeatured: true,
  },
  {
    title: 'DevOps & Automation',
    slug: 'devops-automation',
    shortDescription:
      'Build smarter development and infrastructure workflows through automation, CI/CD, and modern DevOps practices.',
    icon: 'fa-solid fa-infinity',
    features: ['Work with:', 'CI/CD', 'Jenkins', 'GitLab', 'Docker', 'Kubernetes', 'IaC'],
    isFeatured: true,
  },
  {
    title: 'Cybersecurity',
    slug: 'cybersecurity',
    shortDescription:
      'Help organizations protect their infrastructure, applications, systems, and data against evolving security threats.',
    icon: 'fa-solid fa-shield-halved',
    features: ['Work with:', 'Cloud Security', 'Infrastructure Security', 'Monitoring', 'Access Management'],
    isFeatured: true,
  },
  {
    title: 'High-Performance Computing',
    slug: 'high-performance-computing',
    shortDescription:
      'Work on powerful computing environments designed for complex, data-intensive, and computationally demanding workloads.',
    icon: 'fa-solid fa-microchip',
    features: ['Work with:', 'Linux', 'SLURM', 'PBS', 'OpenHPC', 'HPC Infrastructure'],
    isFeatured: true,
  },
  {
    title: 'IT Infrastructure',
    slug: 'it-infrastructure',
    shortDescription:
      'Design and maintain the systems that keep modern businesses connected, reliable, and operational.',
    icon: 'fa-solid fa-server',
    features: ['Work with:', 'Linux', 'Servers', 'Networking', 'Infrastructure Monitoring'],
    isFeatured: true,
  },
  {
    title: 'Technology & Operations',
    slug: 'technology-operations',
    shortDescription:
      'Support the teams, processes, and systems that turn technical expertise into reliable business outcomes.',
    icon: 'fa-solid fa-gears',
    features: ['Focus on:', 'Operations', 'Project Coordination', 'Technical Support', 'Business Technology'],
    isFeatured: true,
  },
];

export const industries = [
  {
    name: 'Technology & Software',
    slug: 'technology-software',
    description: 'Building infrastructure that helps technology companies scale and innovate.',
    icon: 'fa-solid fa-laptop-code',
  },
  {
    name: 'Financial Services',
    slug: 'financial-services',
    description: 'Supporting secure, reliable, and resilient technology environments.',
    icon: 'fa-solid fa-building-columns',
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    description:
      'Helping power technology environments where availability and security are critical.',
    icon: 'fa-solid fa-house-medical',
  },
  {
    name: 'Education & Research',
    slug: 'education-research',
    description:
      'Supporting high-performance computing, research infrastructure, and digital environments.',
    icon: 'fa-solid fa-graduation-cap',
  },
  {
    name: 'E-commerce',
    slug: 'e-commerce',
    description: 'Building scalable infrastructure for growing digital businesses.',
    icon: 'fa-solid fa-cart-shopping',
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description:
      'Helping organizations modernize, secure, and optimize complex technology environments.',
    icon: 'fa-solid fa-city',
  },
  {
    name: 'AI & Data',
    slug: 'ai-data',
    description:
      'Supporting the infrastructure required for data-intensive workloads and intelligent applications.',
    icon: 'fa-solid fa-brain',
  },
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

/**
 * Placeholder voices supplied with the launch copy. The source document notes
 * these should be replaced with verified employee testimonials once actual team
 * feedback is collected — hence the team attributions rather than names.
 */
export const testimonials = [
  {
    authorName: 'Engineering Team',
    quote:
      'I wanted a role where I could actually solve problems — not just follow instructions.',
    rating: 5,
    isFeatured: true,
  },
  {
    authorName: 'DevOps Team',
    quote:
      'The biggest difference is the level of ownership. You get the opportunity to take responsibility for your work.',
    rating: 5,
    isFeatured: true,
  },
  {
    authorName: 'Cloud Engineering Team',
    quote:
      'There is always something new to learn. The technology keeps moving, and so do we.',
    rating: 5,
    isFeatured: true,
  },
  {
    authorName: 'Infrastructure Team',
    quote:
      'Working on real infrastructure challenges has helped me grow much faster technically.',
    rating: 5,
    isFeatured: true,
  },
  {
    authorName: 'RFT 360 Team',
    quote:
      'The best part is being surrounded by people who are willing to share knowledge and help each other improve.',
    rating: 5,
    isFeatured: true,
  },
];

export const faqs = [
  {
    question: 'What kind of people does RFT 360 look for?',
    answer:
      'We look for curious, responsible, technically capable people who enjoy solving problems and are willing to continuously learn and improve.',
    category: 'General',
  },
  {
    question: 'Do I need experience in every technology listed in the job description?',
    answer:
      'Not necessarily. Requirements vary by role. We value strong fundamentals, problem-solving ability, and the willingness to learn alongside relevant technical experience.',
    category: 'Hiring',
  },
  {
    question: 'Are there opportunities for fresh graduates?',
    answer:
      'Yes. Where suitable positions are available, we consider graduates and early-career professionals who demonstrate strong fundamentals, curiosity, and potential.',
    category: 'Hiring',
  },
  {
    question: 'What can I expect during the hiring process?',
    answer:
      'The process may include an application review, an initial discussion, a technical assessment or interview, and a final conversation depending on the role.',
    category: 'Hiring',
  },
  {
    question: 'Can I apply if there isn’t a position that matches my profile?',
    answer:
      'Yes. If you believe your skills could contribute to RFT 360, you can still share your CV with our team for future opportunities.',
    category: 'Hiring',
  },
  {
    question: 'How can I apply for a position?',
    answer:
      'Explore our current openings and submit your application through the relevant job posting. You can also contact our careers team for available opportunities.',
    category: 'Hiring',
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
      { label: 'About RFT 360', href: '/about-culture' },
      { label: 'Services', href: '/#services' },
      { label: 'Industries', href: '/#industries' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    label: 'Careers',
    children: [
      { label: 'Open Positions', href: '/careers' },
      { label: 'Our Culture', href: '/about-culture' },
      { label: 'Life at RFT 360', href: '/life-at-redfort' },
      { label: 'Employee Stories', href: '/blogs' },
    ],
  },
  {
    label: 'Disciplines',
    children: [
      { label: 'Cloud Engineering', href: '/#services' },
      { label: 'DevOps & Automation', href: '/#services' },
      { label: 'Cybersecurity', href: '/#services' },
      { label: 'High-Performance Computing', href: '/#services' },
      { label: 'IT Infrastructure', href: '/#services' },
      { label: 'Technology & Operations', href: '/#services' },
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
    eyebrow: 'Careers at RFT 360',
    heading: 'Build What’s Next.',
    headingAccent: 'Build Your Career at RFT 360.',
    subheading:
      'Where technology challenges become opportunities — and careers become long-term journeys.',
    bodyHtml:
      '<p>At RFT 360, we bring together engineers, technologists, problem-solvers, and ' +
      'innovators to build secure, scalable, and high-performance technology solutions.</p>' +
      '<p>Whether your expertise is in Cloud, DevOps, Cybersecurity, HPC, AI, or IT ' +
      'infrastructure, you’ll have the opportunity to work on meaningful technology ' +
      'challenges and grow with a team that values expertise, ownership, and continuous ' +
      'learning.</p>',
    ctaPrimary: { label: 'Explore Open Positions', href: '/careers', variant: 'primary' },
    ctaSecondary: { label: 'Meet the Team', href: '/about-culture', variant: 'outline' },
  },
  {
    type: HomepageSectionType.WHO_WE_ARE,
    name: 'Inside RFT 360',
    eyebrow: 'Inside RFT 360',
    heading: 'Where Careers Are',
    headingAccent: 'Built, Not Filled.',
    subheading: 'A job gives you responsibilities. A career gives you direction.',
    bodyHtml:
      '<p>At RFT 360, we believe great people grow when they are given meaningful challenges, ' +
      'trusted with responsibility, and surrounded by people who push them to become better.</p>' +
      '<p>Here, you can expect:</p>' +
      '<ul>' +
      '<li>Real-world technology challenges</li>' +
      '<li>Opportunities to work with modern technologies</li>' +
      '<li>Collaboration with experienced professionals</li>' +
      '<li>Continuous learning and skill development</li>' +
      '<li>Ownership of meaningful projects</li>' +
      '<li>A culture that values ideas and initiative</li>' +
      '</ul>' +
      '<p>Your next role shouldn’t just be another position. It should be your next step forward.</p>',
    imageKey: 'culture-team',
  },
  {
    type: HomepageSectionType.SERVICES,
    name: 'Disciplines',
    eyebrow: 'Disciplines',
    heading: '6 Disciplines.',
    headingAccent: 'One High-Performance Team.',
    itemLimit: 6,
  },
  {
    type: HomepageSectionType.WHY_CHOOSE_US,
    name: 'What You Get',
    eyebrow: 'What You Get',
    heading: 'What You Get When You Join',
    headingAccent: 'RFT 360',
    subheading: 'We want our people to grow alongside the technology they work with.',
    itemLimit: 6,
  },
  {
    type: HomepageSectionType.INDUSTRIES,
    name: 'Where Our Work Lands',
    eyebrow: 'Where Our Work Lands',
    heading: 'The Industries We',
    headingAccent: 'Build For',
    subheading:
      'Technology doesn’t exist in isolation. It powers the businesses, systems, and ' +
      'industries people depend on every day. RFT 360 works across technology-driven ' +
      'industries where reliability, performance, security, and scalability matter.',
    itemLimit: 7,
  },
  {
    // Not part of the supplied home-page content. Kept in the CMS but hidden, so
    // it can be switched back on without re-creating it.
    type: HomepageSectionType.CASE_STUDIES,
    name: 'Employee Success Stories',
    isVisible: false,
    eyebrow: 'Real people, real growth',
    heading: 'Where our people',
    headingAccent: 'ended up',
    itemLimit: 3,
  },
  {
    type: HomepageSectionType.TESTIMONIALS,
    name: 'What the Team Actually Says',
    heading: 'What the Team',
    headingAccent: 'Actually Says',
    itemLimit: 5,
  },
  {
    type: HomepageSectionType.FAQ,
    name: 'FAQs',
    eyebrow: 'FAQs',
    heading: 'Frequently Asked',
    headingAccent: 'Questions',
    itemLimit: 6,
    ctaPrimary: { label: 'View Open Positions', href: '/careers', variant: 'primary' },
  },
  {
    // Not part of the supplied home-page content. Hidden rather than deleted.
    type: HomepageSectionType.LATEST_BLOGS,
    name: 'Latest Blogs',
    isVisible: false,
    eyebrow: 'From the team',
    heading: 'What we’re',
    headingAccent: 'writing about',
    itemLimit: 3,
  },
  {
    type: HomepageSectionType.CONTACT_FORM,
    name: 'Contact',
    eyebrow: 'Ready to start?',
    heading: 'Ready to Build Your',
    headingAccent: 'Next Chapter?',
    subheading:
      'Whether you’re an experienced engineer, an ambitious graduate, or a technology ' +
      'professional looking for your next challenge, we’d like to hear from you.',
    bodyHtml:
      '<p>Bring your skills. Bring your curiosity. Bring your ambition.</p>' +
      '<p>Let’s build what’s next — together.</p>',
    ctaPrimary: { label: 'View Current Openings', href: '/careers', variant: 'primary' },
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
