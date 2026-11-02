import type { SeedImageKey } from './images'
import { richText } from './lexical'

/**
 * Product explorer details. Kept factual and general (no return figures or
 * tax amounts, which change) so they stay accurate for a regulated distributor.
 */
const productDetails: Record<
  string,
  {
    slug: string
    tagline: string
    highlights: string[]
    idealFor: string
    enquiryLabel: string
    faqs: { question: string; answer: string }[]
  }
> = {
  'Mutual Fund Services': {
    slug: 'mutual-funds',
    faqs: [{question:"How much do I need to start investing in mutual funds?",answer:"Many schemes allow you to start a SIP with a small monthly amount, often a few hundred rupees. The exact minimum depends on the scheme, and we will suggest an amount that fits your budget and goals."},{question:"Can I stop or change my SIP later?",answer:"Yes. SIPs can usually be paused, modified or stopped at any time. An exit load may apply if you redeem units within a short period, as stated in the scheme documents."},{question:"How is FinOracles paid for mutual fund services?",answer:"As an AMFI-registered mutual fund distributor, we receive commission from fund houses on regular plans. This is included in the scheme’s expense ratio, and we are happy to explain it in detail."}],
    tagline: 'Smart diversification. Strategic growth. Managed with expertise.',
    enquiryLabel: 'Mutual Funds',
    idealFor: 'Anyone building long-term wealth for goals like retirement, education or a home',
    highlights: [
      'Equity, debt and hybrid funds from leading AMCs',
      'Invest through SIP or lumpsum, with STP and SWP options',
      'Fund selection matched to your goals and risk profile',
      'Regular portfolio reviews and rebalancing',
    ],
  },
  'National Pension System (NPS)': {
    slug: 'nps',
    faqs: [{question:"Who can open an NPS account?",answer:"Indian citizens within the eligible age range, whether salaried or self-employed, can open an NPS account. NRIs can also invest, subject to the applicable rules."},{question:"Can I withdraw from NPS before retirement?",answer:"NPS is designed for retirement, so withdrawals are restricted. Partial withdrawals are allowed for specific needs after a minimum period, as per PFRDA rules."}],
    tagline: 'Plan today. Retire with confidence.',
    enquiryLabel: 'NPS',
    idealFor: 'Salaried and self-employed individuals saving for retirement',
    highlights: [
      'Government-backed retirement scheme regulated by PFRDA',
      'Market-linked mix of equity, corporate bonds and government securities',
      'Low-cost structure built for long-term compounding',
      'Tax benefits as per prevailing tax laws',
    ],
  },
  'Equity & ETFs': {
    slug: 'equity-etfs',
    faqs: [{question:"Do I need a demat account?",answer:"Yes. Investing directly in shares and ETFs requires a demat and trading account. We can help you with the account opening process."},{question:"What is the difference between an ETF and a mutual fund?",answer:"An ETF trades on the stock exchange like a share, at market prices during the day. A mutual fund is bought from the fund house at the day’s NAV. Both can offer diversified exposure."}],
    tagline: 'Focused growth. Smart diversification. Strategic execution.',
    enquiryLabel: 'Equity & ETFs',
    idealFor: 'Investors seeking direct, market-linked growth over the long term',
    highlights: [
      'Direct equity investing through a demat and trading account',
      'Index and sector ETFs for low-cost, diversified exposure',
      'Strategies aligned with your risk profile and goals',
      'Disciplined allocation and periodic review',
    ],
  },
  'Portfolio Management Services (PMS)': {
    slug: 'pms',
    faqs: [{question:"What is the minimum investment for PMS?",answer:"SEBI currently prescribes a minimum investment of ₹50 lakh for portfolio management services."},{question:"How is PMS different from a mutual fund?",answer:"In PMS, securities are held directly in your name in a portfolio managed for you, which allows more personalisation. Mutual funds pool money from many investors into one scheme."}],
    tagline: 'Exclusive strategies. Active oversight. Structured wealth creation.',
    enquiryLabel: 'PMS',
    idealFor: 'High-net-worth investors seeking a personalised, professionally managed portfolio',
    highlights: [
      'SEBI-regulated portfolio management by professional fund managers',
      'Securities held directly in your own name',
      'Focused, research-driven investment strategies',
      'Minimum investment as prescribed by SEBI (currently ₹50 lakh)',
    ],
  },
  'Loan against Mutual Funds': {
    slug: 'loan-against-mutual-funds',
    faqs: [{question:"Will my mutual funds keep growing while pledged?",answer:"Yes. Your units stay invested and continue to reflect market movements. They are only marked as pledged with the lender until the loan is repaid."},{question:"How much can I borrow?",answer:"The loan amount depends on the type and value of the funds you pledge and on the lender’s policy. Equity funds usually have a lower loan-to-value ratio than debt funds."}],
    tagline: 'Liquidity when you need it. Growth that continues.',
    enquiryLabel: 'Loan against Mutual Funds',
    idealFor: 'Investors who need short-term funds without redeeming their investments',
    highlights: [
      'Pledge your mutual fund units instead of selling them',
      'Your investments stay invested and keep working for you',
      'Quick, largely digital process with minimal documentation',
      'Competitive terms through our lending partners',
    ],
  },
  'Health Insurance': {
    slug: 'health-insurance',
    faqs: [{question:"What is a family floater plan?",answer:"A family floater plan covers your whole family under one policy with a shared sum insured, which is often more economical than separate policies."},{question:"What is a waiting period?",answer:"Many policies have waiting periods before certain conditions or pre-existing illnesses are covered. We will explain the waiting periods of each plan before you buy."}],
    tagline: 'Protect your health. Safeguard your wealth.',
    enquiryLabel: 'Health Insurance',
    idealFor: 'Individuals and families who want protection from rising medical costs',
    highlights: [
      'Individual and family floater plans',
      'Cashless treatment at network hospitals',
      'Tax benefits as per prevailing tax laws',
      'Help with policy selection and claim support',
    ],
  },
  'Life Insurance': {
    slug: 'life-insurance',
    faqs: [{question:"How much life cover do I need?",answer:"A common starting point is a cover that can replace several years of your income and clear any loans. We will help you estimate the right amount for your family."},{question:"What is a term plan?",answer:"A term plan pays a sum to your nominee if something happens to you during the policy term. It offers high cover at a comparatively low premium."}],
    tagline: 'Secure today. Protect tomorrow.',
    enquiryLabel: 'Life Insurance',
    idealFor: 'Anyone whose family depends on their income',
    highlights: [
      'Term plans offering high cover at affordable premiums',
      'Savings and long-term protection plans',
      'Financial security for your nominees',
      'Tax benefits as per prevailing tax laws',
    ],
  },
  'Personal Accidental Insurance': {
    slug: 'personal-accident-insurance',
    faqs: [{question:"Is personal accident cover different from health insurance?",answer:"Yes. Health insurance covers medical treatment, while personal accident cover pays a benefit for accidental death or disability. The two work well together."}],
    tagline: 'Be prepared. Stay protected. Move forward with confidence.',
    enquiryLabel: 'Personal Accident Insurance',
    idealFor: 'Working professionals, commuters and frequent travellers',
    highlights: [
      'Cover for accidental death and disability',
      'Support against loss of income after an accident',
      'Affordable premiums for meaningful cover',
      'Complements your health and life insurance',
    ],
  },
  'Vehicle Insurance': {
    slug: 'vehicle-insurance',
    faqs: [{question:"Is vehicle insurance mandatory?",answer:"Third-party liability insurance is mandatory for all vehicles on Indian roads under the Motor Vehicles Act. Comprehensive cover is optional but protects your own vehicle too."},{question:"What is a zero depreciation add-on?",answer:"It lets you claim the full cost of replaced parts without deduction for depreciation, subject to the policy terms."}],
    tagline: 'Drive secure. Stay protected.',
    enquiryLabel: 'Vehicle Insurance',
    idealFor: 'Car and two-wheeler owners',
    highlights: [
      'Third-party liability cover, mandatory under the Motor Vehicles Act',
      'Comprehensive plans that cover damage to your own vehicle',
      'Useful add-ons such as zero depreciation',
      'Hassle-free renewal and claim support',
    ],
  },
  'Overseas Insurance': {
    slug: 'overseas-insurance',
    faqs: [{question:"Do I need travel insurance for my trip?",answer:"Some countries require travel insurance for a visa. Even where it is not required, it protects you from high medical costs and travel disruptions abroad."}],
    tagline: 'Travel smart. Stay protected worldwide.',
    enquiryLabel: 'Overseas Insurance',
    idealFor: 'Travellers, students studying abroad and business visitors',
    highlights: [
      'Medical emergency cover while abroad',
      'Protection against trip delays, baggage and passport loss',
      'Plans for leisure, student and business travel',
      'Coverage tailored to your destination and duration',
    ],
  },
}

/**
 * All default website content, taken from the approved FinOracles design.
 * `img` resolves an image key to whatever the caller needs: a Media ID when
 * seeding the database, or a static Media-like object for the pre-seed fallback.
 */
export const buildContent = <T>(img: (key: SeedImageKey) => T) => {
  const phone = { display: '+91 920 930 9822', number: '+919209309822' }

  const siteSettings = {
    siteName: 'FinOracles',
    legalName: 'FinOracles Services Pvt. Ltd.',
    tagline: 'Wings for a Wealthy Future',
    logo: img('logo'),
    defaultDescription:
      'FinOracles Services Pvt. Ltd. is an AMFI-registered mutual fund distributor in Satara offering financial planning, mutual funds, NPS, PMS and insurance with expert guidance.',
    defaultOgImage: img('retirement'),
    twitterHandle: '',
    phones: [phone, { display: '+91 932 590 0406', number: '+919325900406' }],
    emails: [{ email: 'connect@finoracles.com' }, { email: 'finoracles@gmail.com' }],
    address: {
      full: 'Finoracles Services Pvt. Ltd., Vijay millennium, ZP Chowk, Kalyani Nagar, Sadar Bazar, Satara, Maharashtra 415002',
      street: 'Vijay Millennium, ZP Chowk, Kalyani Nagar, Sadar Bazar',
      locality: 'Satara',
      region: 'Maharashtra',
      postalCode: '415002',
      country: 'IN',
      mapUrl: 'https://maps.google.com/?q=Vijay+Millennium+ZP+Chowk+Satara+415002',
    },
    businessHours: 'Monday - Saturday: 9:00 AM - 7:00 PM',
    openingHours: 'Mo-Sa 09:00-19:00',
    whatsapp: { number: '919209309822', message: 'Hello FinOracles' },
    socials: [
      { platform: 'facebook', url: 'https://www.facebook.com/finoraclessatara' },
      { platform: 'instagram', url: 'https://www.instagram.com/finoracles' },
      { platform: 'linkedin', url: 'https://www.linkedin.com/company/finoracles-services-pvt-ltd/' },
      { platform: 'youtube', url: 'https://www.youtube.com/@finoracles' },
      { platform: 'whatsapp', url: 'https://whatsapp.com/channel/0029Va9oPxNBlHpU9acUq50Q' },
    ] as { platform: 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'whatsapp' | 'x'; url: string }[],
    registration: {
      registeredName: 'FINORACLES SERVICES PVT LTD',
      statement: 'AMFI- Registered Mutual Fund Distributor',
      arn: '300933',
      initialRegistration: '04/07/2024',
      validity: '04/04/2027',
    },
    regulators: [
      { name: 'SEBI', url: 'https://www.sebi.gov.in/' },
      { name: 'RBI', url: 'https://www.rbi.org.in/' },
      { name: 'BSE', url: 'https://www.bseindia.com/' },
      { name: 'NSE', url: 'https://www.nseindia.com/' },
      { name: 'CDSL', url: 'https://www.cdslindia.com/' },
      { name: 'AMFI', url: 'https://www.amfiindia.com/' },
      { name: 'IRDA', url: 'https://irdai.gov.in/' },
    ],
    disclaimer: 'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.',
  }

  const nav = [
    { label: 'Home', url: '/' },
    { label: 'About Us', url: '/about' },
    { label: 'Products', url: '/products' },
    { label: 'Services', url: '/services' },
    { label: 'Tools', url: '/tools' },
    { label: 'Blog', url: '/blog' },
    { label: 'Contact', url: '/contact' },
  ]

  const header = {
    navItems: nav.map((n) => ({ ...n, newTab: false })),
    cta: { label: 'Free Consultation', url: '/contact', newTab: false },
    showPhone: false,
    topBar: { enabled: true, showArn: true, loginLabel: 'Client Login', loginUrl: '/login' },
  }

  const footer = {
    ctaBand: {
      enabled: true,
      heading: 'Not sure where to start?',
      text: 'Talk to our team for a free, no-obligation consultation. We will understand your goals and suggest the right next step.',
      buttonLabel: 'Book a Free Consultation',
      buttonUrl: '/contact',
    },
    aboutTitle: 'About FinOracles',
    aboutText:
      'Your trusted partner in financial planning and wealth management. We help you achieve your financial goals with expert guidance.',
    columns: [
      {
        title: 'Quick Links',
        links: [...nav.slice(1), { label: 'Client Login', url: '/login' }].map((n) => ({ ...n, newTab: false })),
      },
      {
        title: 'Our Products',
        links: [
          { label: 'Mutual Funds', url: '/products/mutual-funds' },
          { label: 'NPS', url: '/products/nps' },
          { label: 'Equity & ETFs', url: '/products/equity-etfs' },
          { label: 'PMS', url: '/products/pms' },
          { label: 'Health Insurance', url: '/products/health-insurance' },
          { label: 'Life Insurance', url: '/products/life-insurance' },
        ].map((n) => ({ ...n, newTab: false })),
      },
    ],
    showRegulators: true,
    legalLinks: [
      { label: 'Privacy Policy', url: '/privacy-policy', newTab: false },
      { label: 'Disclaimer', url: '/disclaimer', newTab: false },
    ],
    copyright: '© {year} FinOracles Services Pvt. Ltd. All Rights Reserved.',
    credit: { prefix: 'Designed & developed by', label: 'Movinnza', url: 'https://movinnza.in/' },
  }

  const homePage = {
    hero: {
      badgeText: 'AMFI- Registered Mutual Fund Distributor',
      badgeHighlight: 'ARN 300933',
      titlePrefix: 'FinOracles Services Pvt. Ltd.: Wings for a Wealthy Future.',
      title: 'Wings for a Wealthy Future',
      lead: 'Your trusted partner in financial planning and wealth management. We help you achieve your financial goals with expert guidance.',
      primaryCta: { label: 'Contact Us', url: '#contact', newTab: false },
      showPhoneButton: true,
      figures: [
        { value: '15+', label: 'Years of Expertise' },
        { value: '6000', label: 'Happy Clients' },
        { value: '15000', label: 'Lacs AUM' },
      ],
      slides: [
        {
          image: img('retirement'),
          title: 'Happy',
          titleAccent: 'Retirement',
          headline: "Retire with Freedom, Not Financial Worry",
          lead: "Build a retirement plan that gives you steady income, lasting security and the freedom to enjoy your golden years.",
          description: 'Retirement should be about freedom, not financial worry.',
          more: [
            'Retirement is not the end of a journey, it is the beginning of a new chapter. A phase where time becomes yours, passions rediscover you, and peace replaces pressure.',
            'But a happy retirement is built long before it arrives. Rising living costs, healthcare needs, and lifestyle aspirations require careful and disciplined financial planning.',
            'At FinOracles Services Pvt. Ltd., we design structured retirement strategies focused on wealth accumulation, income stability, and long-term security. Through strategic asset allocation and risk-managed planning, we help ensure your golden years remain truly golden.',
            'Because retirement should be about freedom, not financial worry.',
          ].join('\n\n'),
        },
        {
          image: img('savings'),
          title: 'Wealth',
          titleAccent: 'Building',
          headline: "Build Wealth with Clarity and Discipline",
          lead: "Personalised investment planning and strategic asset allocation to turn your ambitions into lasting wealth.",
          description: 'True wealth is built with clarity, discipline, and a well-defined strategy.',
          more: [
            'True wealth is not created by chance, it is built with clarity, discipline, and a well-defined strategy. Every financial decision you make today shapes the opportunities you experience tomorrow.',
            'At FinOracles Services Pvt. Ltd., we transform ambition into structured action. Through personalized investment planning, strategic asset allocation, and proactive risk management, we design financial pathways aligned with your long-term aspirations.',
            'We believe wealth building is a continuous journey, one that requires foresight, adaptability, and expert guidance. Markets evolve, priorities shift, and life changes, but a strong financial foundation ensures stability through every phase.',
            'Because wealth building is not just about returns, it is about creating freedom, security, and a legacy that endures for generations.',
          ].join('\n\n'),
        },
        {
          image: img('child'),
          title: "Child's",
          titleAccent: 'Future',
          headline: "Secure Your Child's Future Today",
          lead: "Goal-based plans for quality education, global opportunities and every milestone ahead.",
          description: "Your child's future is your greatest investment in hope, opportunity, and legacy.",
          more: [
            'Every parent dreams of giving their child the best, quality education, global exposure, meaningful opportunities, and the freedom to choose their own path. But meaningful dreams require thoughtful planning.',
            "The financial decisions you make today become the stepping stones for their tomorrow. Rising education costs, international aspirations, and life's uncertainties make early and structured planning essential.",
            "At FinOracles Services Pvt. Ltd., we create goal-based investment strategies designed specifically for your child's milestones. Through disciplined savings, strategic asset allocation, and risk protection, we help you build a secure financial foundation that grows alongside them.",
            "Because your child's future isn't just a responsibility, it is your greatest investment in hope, opportunity, and legacy.",
          ].join('\n\n'),
        },
        {
          image: img('home'),
          title: 'Owning a',
          titleAccent: 'House',
          headline: "Make Your Dream Home a Reality",
          lead: "A clear financial roadmap, from goal-based savings to loan planning, for confident homeownership.",
          description: 'A home is a milestone built on smart financial decisions.',
          more: [
            'A home is more than walls and a roof, it is security, stability, and a place where memories are created. It represents achievement, independence, and long-term financial strength.',
            'With rising property values and evolving financial commitments, owning a home requires thoughtful planning and disciplined execution.',
            'At FinOracles Services Pvt. Ltd., we help you structure a clear financial roadmap, from goal-based savings and investment strategies to loan planning and risk management, ensuring your journey to homeownership is confident and well-prepared.',
            "Because owning a house is not just a purchase, it's a milestone built on smart financial decisions.",
          ].join('\n\n'),
        },
        {
          image: img('home'),
          title: 'Owning a',
          titleAccent: 'Car',
          headline: "Drive Ahead with Confidence",
          lead: "Plan your next car the smart way, without straining your long-term financial stability.",
          description: 'Every milestone deserves a plan that drives you forward with confidence.',
          more: [
            'Owning a car is more than convenience, it represents progress, independence, and the freedom to move forward on your own terms. It marks a milestone of personal and financial growth.',
            'But smart ownership begins with smart planning. From budgeting and saving to managing loans and insurance, every step matters.',
            'At FinOracles Services Pvt. Ltd., we help you create a structured financial approach that makes your goal achievable without straining your long-term stability.',
            'Because every milestone in life, big or small, deserves a plan that drives you forward with confidence.',
          ].join('\n\n'),
        },
      ],
    },
    whatWeDo: {
      enabled: true,
      heading: 'What We Do',
      items: [
        {
          icon: 'clipboard-list',
          title: 'Financial Planning',
          text: 'Get customized guidance across investments, expenses, insurance, loans, estate planning, and taxes.',
        },
        {
          icon: 'trending-up',
          title: 'Investment Advisory',
          text: 'Implement your customized guidance by buying all the recommended financial products on one single platform.',
        },
        {
          icon: 'shield-check',
          title: 'Risk Management',
          text: 'Track your journey and review/rebalance your investments to make sure they are aligned with your needs.',
        },
      ],
    },
    needs: {
      enabled: true,
      heading: 'WHAT ARE YOUR FINANCIAL NEEDS?',
      lead: 'Everyone has various financial needs which is to be achieved for leading a beautiful and stress-free life.\n\nBut before reaching these needs certain bridge of multiple realities has to be crossed.',
      items: [
        { title: "I'M THINKING OF MY CHILD'S FUTURE", image: img('child'), icon: 'graduation-cap', url: '/contact?goal=child-future' },
        { title: 'I WANT TO FULFILL MY DREAMS', image: img('savings'), icon: 'piggy-bank', url: '/products/mutual-funds' },
        { title: "I'M PREPARING TO RETIRE", image: img('retirement'), icon: 'umbrella', url: '/products/nps' },
        { title: 'I HAVE JUST STARTED EARNING', image: img('earning'), icon: 'wallet', url: '/products/mutual-funds' },
        { title: 'I WANT TO OWN A HOME', image: img('home'), icon: 'house', url: '/contact?goal=own-home' },
        { title: "I'M AN EARLY INVESTOR", image: img('earlyInvestor'), icon: 'sprout', url: '/products/equity-etfs' },
      ],
    },
    guidance: {
      enabled: true,
      heading: 'GET PERSONALISED GUIDANCE',
      subheading: 'FROM AN EXPERIENCED MUTUAL FUND DISTRIBUTOR!',
      quote:
        "Investing in any financial products without guidance of a financial planner is like taking a medicine without doctor's diagnosis.",
      lead: 'We offer our expert advice for choosing the best investments products which will lead to your financial freedom.',
      steps: [
        {
          icon: 'clipboard-list',
          title: 'ASSESSMENT',
          text: 'Get customised guidance across various financial products and services like mutual funds, insurance, loans, need based investing, estate planning, and taxes.',
        },
        {
          icon: 'circle-check',
          title: 'EXECUTING',
          text: 'Implement the tailored options by transacting in all the recommended financial products on one single platform.',
        },
        {
          icon: 'refresh-cw',
          title: 'TRACKING',
          text: 'Track your journey by reviewing and rebalancing your investments on a timely basis to make sure they are aligned with your financial needs.',
        },
      ],
    },
    products: {
      enabled: true,
      heading: 'Our Products',
      lead: 'If you are looking for the right financial product, you are at the right place. Starting from mutual funds to insurance, we have them all.',
      ctaUrl: '#contact',
    },
    about: {
      enabled: true,
      image: img('about'),
      badgeValue: '15+',
      badgeLabel: 'Years of Expertise',
      eyebrow: 'Who We Are?',
      headingStart: 'Empowering Your',
      headingAccent: 'Financial Journey',
      headingEnd: 'With Clarity.',
      intro:
        'FinOracles Services Pvt. Ltd. is a trusted financial solutions partner committed to designing structured, goal-driven investment strategies.',
      body: [
        'We are a team of experienced financial professionals offering comprehensive, tailor-made solutions that align with your financial aspirations. From investment planning to wealth optimization, we provide a seamless, one-stop approach to managing and growing your finances.',
        "Customer-centric at our core, we combine expertise, discipline, and strategic insight to deliver efficient solutions that build long-term value. At FinOracles, we don't just manage investments, we design financial confidence.",
      ].join('\n\n'),
      values: [
        { title: 'Client Centric', text: 'Your goals are our priority.' },
        { title: 'Transparent', text: 'No hidden agendas, just growth.' },
      ],
    },
    team: {
      enabled: true,
      heading: 'Meet Our Team',
      lead: 'The dedicated professionals behind FinOracles, committed to guiding your financial journey with expertise and care.',
    },
    expertise: {
      enabled: true,
      heading: 'Core Expertise',
      lead: 'At FinOracles Services Pvt. Ltd., we deliver strategic, goal-oriented financial solutions designed to optimize growth and manage risk with precision.',
      items: [
        { icon: 'compass', label: 'Financial Planning' },
        { icon: 'trending-up', label: 'Investment Advisory' },
        { icon: 'wallet', label: 'Money Management' },
        { icon: 'shield-check', label: 'Risk Management' },
        { icon: 'umbrella', label: 'Insurance Solutions' },
      ],
      body: [
        'With a client-first approach and deep industry insight, we create customized strategies that align perfectly with your financial objectives.',
        'At FinOracles, we combine strategy, discipline, and expertise to build lasting financial value.',
      ].join('\n\n'),
      image: img('expertise'),
      vision: {
        heading: 'Our Vision',
        text: 'To be a trusted financial partner that not only manages wealth but also spreads financial awareness, empowering individuals and families to secure their financial future.',
        tagline: "At FinOracles, we don't just manage wealth, we value your investments.",
      },
    },
    services: {
      enabled: true,
      heading: 'Our Services',
      lead: 'We understand that merely having a rich product basket is not enough for our valued clients. What clients really need is a holistic platform for an entire family.',
    },
    resources: {
      enabled: true,
      heading: 'Resources',
      lead: 'Empower yourself with knowledge. Explore our comprehensive collection of financial resources.',
      items: [
        {
          icon: 'newspaper',
          title: 'Financial Blogs',
          text: 'Expert insights on market trends, investment strategies, and financial planning tips.',
          url: '/blog',
        },
        {
          icon: 'circle-play',
          title: 'Video Library',
          text: 'Learn about mutual funds, insurance, and wealth management through easy videos.',
          url: 'https://www.youtube.com/@finoracles',
        },
        {
          icon: 'images',
          title: 'Image Library',
          text: 'Visual guides, infographics, and charts to help you understand financial concepts better.',
          url: 'https://www.instagram.com/finoracles',
        },
        {
          icon: 'mail',
          title: 'Newsletters',
          text: 'Stay updated with our weekly financial newsletters, market insights, and expert opinions.',
          url: '',
        },
      ],
    },
    tools: {
      enabled: true,
      heading: 'Financial Tools',
      lead: 'Plan better with our smart financial calculators and planning tools.',
      card: {
        icon: 'calculator',
        title: 'Financial Tools & Calculators',
        text: 'Access all our financial calculators including SIP, Lumpsum, Retirement Planner, and more.',
        label: 'Access All Calculators',
        url: 'https://sites.njwebnest.in/viewtemplates/template8/index.php/tools/tools-and-calculators',
        newTab: true,
      },
    },
    logins: {
      enabled: true,
      heading: 'Access Your Account',
      lead: 'Secure login for clients, partners, and employees.',
      items: [
        {"label":"Client Login","url":"https://ewa.njindiaonline.com/ewa/login","newTab":true,"audience":"client","description":"Your E-Wealth Account: all your investments in one secure place.","features":[{"text":"View your complete portfolio and holdings"},{"text":"Invest, redeem and start SIPs online"},{"text":"Download statements and capital gains reports"}]},
        {"label":"NJ Partner Login","url":"https://www.njindiaonline.com/pdesk/login.fin?cmdAction=login","newTab":true,"audience":"partner","description":"Partner desk for NJ Wealth partners."},
        {"label":"Star Atom Login","url":"https://atompro.starhealth.in/sso/login","newTab":true,"audience":"partner","description":"Star Health portal for insurance advisors."},
        {"label":"ABSLI Login","url":"https://lifeinsurancepartners.adityabirlacapital.com","newTab":true,"audience":"partner","description":"Aditya Birla Sun Life Insurance partner portal."},
        {"label":"Employee Login","url":"/admin","newTab":false,"audience":"employee","description":"FinOracles team access to the website CMS."},
      ],
    },
    contact: {
      enabled: true,
      heading: 'Contact Us',
      lead: 'Get in touch with our team for any queries or support.',
      formHeading: 'Send us a Message',
    },
    stats: {
      enabled: true,
      items: [
        { icon: 'users', value: 200, suffix: '', label: 'Team Members' },
        { icon: 'chart-column', value: 15000, suffix: '', label: 'Lacs AUM' },
        { icon: 'heart-handshake', value: 6000, suffix: '', label: 'Happy Clients' },
        { icon: 'trophy', value: 100, suffix: '', label: 'Awards Wins' },
      ],
    },
    meta: {
      title: 'FinOracles Services Pvt. Ltd. | Wings for a Wealthy Future',
      description:
        'AMFI-registered mutual fund distributor in Satara. Financial planning, mutual funds, NPS, PMS and insurance with expert, goal-based guidance from FinOracles.',
      image: img('retirement'),
    },
  }

  const products = [
    {
      name: 'Mutual Fund Services',
      category: 'invest',
      icon: 'chart-pie',
      description:
        'Mutual funds offer professionally managed, diversified investment solutions across equities, debt, and money market instruments. At FinOracles Services Pvt. Ltd., we help you select the right funds aligned with your financial goals and risk appetite, ensuring disciplined growth with balanced risk exposure. Smart diversification. Strategic growth. Managed with expertise.',
    },
    {
      name: 'National Pension System (NPS)',
      category: 'invest',
      icon: 'landmark',
      description:
        'The National Pension System (NPS) is a government-backed retirement savings solution designed to build long-term financial security. At FinOracles Services Pvt. Ltd., we help you structure your NPS investments strategically, balancing equity and debt exposure to create a disciplined retirement corpus with tax efficiency and sustainable growth. Plan today. Retire with confidence.',
    },
    {
      name: 'Equity & ETFs',
      category: 'invest',
      icon: 'chart-line',
      description:
        'Equity investments and Exchange Traded Funds (ETFs) offer direct exposure to market growth and long-term wealth creation. At FinOracles Services Pvt. Ltd., we design disciplined equity and ETF strategies aligned with your risk profile and financial goals, combining research-driven insights with strategic allocation to optimize returns. Focused growth. Smart diversification. Strategic execution.',
    },
    {
      name: 'Portfolio Management Services (PMS)',
      category: 'invest',
      icon: 'briefcase',
      description:
        'Portfolio Management Services (PMS) offer personalized, professionally managed investment strategies tailored to high-value portfolios. At FinOracles Services Pvt. Ltd., we provide customized portfolio solutions with focused research, active management, and strategic asset allocation, designed to optimize returns while managing risk effectively. Exclusive strategies. Active oversight. Structured wealth creation.',
    },
    {
      name: 'Loan against Mutual Funds',
      category: 'borrow',
      icon: 'hand-coins',
      description:
        'Unlock liquidity without disturbing your long-term investments. A Loan against Mutual Funds allows you to access funds by pledging your mutual fund holdings, ensuring immediate financial flexibility while your investments continue to grow. At FinOracles Services Pvt. Ltd., we facilitate a seamless and efficient process with competitive terms and minimal documentation. Liquidity when you need it. Growth that continues.',
    },
    {
      name: 'Health Insurance',
      category: 'protect',
      icon: 'heart-pulse',
      description:
        "Health insurance is essential for protecting both your finances and your family's well-being against unexpected medical expenses. At FinOracles Services Pvt. Ltd., we help you choose the right health coverage tailored to your needs, ensuring comprehensive protection, cashless benefits, and long-term security. Protect your health. Safeguard your wealth.",
    },
    {
      name: 'Life Insurance',
      category: 'protect',
      icon: 'shield-check',
      description:
        'Life insurance is the foundation of financial security, ensuring your loved ones remain protected, no matter what the future holds. At FinOracles Services Pvt. Ltd., we help you select the right life insurance solutions aligned with your protection needs, financial goals, and long-term legacy planning. Secure today. Protect tomorrow.',
    },
    {
      name: 'Personal Accidental Insurance',
      category: 'protect',
      icon: 'life-buoy',
      description:
        'Personal Accidental Insurance provides financial protection against unforeseen accidents, disability, or loss of income. At FinOracles Services Pvt. Ltd., we help you choose comprehensive coverage that safeguards you and your family from unexpected financial setbacks. Be prepared. Stay protected. Move forward with confidence.',
    },
    {
      name: 'Vehicle Insurance',
      category: 'protect',
      icon: 'car',
      description:
        'Vehicle insurance protects you against financial loss arising from accidents, theft, or unforeseen damages. At FinOracles Services Pvt. Ltd., we assist you in selecting the right coverage, from third-party liability to comprehensive plans, ensuring complete protection and hassle-free claim support. Drive secure. Stay protected.',
    },
    {
      name: 'Overseas Insurance',
      category: 'protect',
      icon: 'plane',
      description:
        'Overseas Insurance provides essential financial protection while you travel, study, or work abroad, covering medical emergencies, travel disruptions, and unforeseen risks. At FinOracles Services Pvt. Ltd., we help you choose comprehensive international coverage tailored to your destination and duration, ensuring complete peace of mind beyond borders. Travel smart. Stay protected worldwide.',
    },
  ].map((p, order) => {
    const extra = productDetails[p.name]
    return {
      ...p,
      // The closing slogan becomes the tagline instead of trailing the paragraph.
      description: extra ? p.description.replace(` ${extra.tagline}`, '') : p.description,
      tagline: extra?.tagline,
      highlights: extra?.highlights.map((text) => ({ text })) ?? [],
      idealFor: extra?.idealFor,
      enquiryLabel: extra?.enquiryLabel,
      slug: extra?.slug,
      faqs: extra?.faqs ?? [],
      order,
    }
  })

  const team = [
    { name: 'Sandeep Kothawale', role: 'MD', photo: img('sandeep'), isLeader: true },
    { name: 'Priyanka Jadhav', role: 'Senior Relationship Manager', photo: img('priyankaJadhav') },
    { name: 'Priyanka Phalke', role: 'HRM', photo: img('priyankaPhalke') },
    { name: 'Renuka Bokil', role: 'Account & Admin', photo: img('renuka') },
    { name: 'Mangesh Pawaskar', role: 'Marketing Manager', photo: img('mangesh') },
    { name: 'Rushikesh Shinde', role: 'Star Health Unit Manager', photo: img('rushikesh') },
    { name: 'Priyanka Gole', role: 'Star Health Back Office', photo: img('priyankaGole') },
    { name: 'Payal Chavan', role: 'Relationship Manager', photo: img('payal') },
    { name: 'Dhanshree Shinde', role: 'Relationship Manager', photo: img('dhanshree') },
  ].map((m, order) => ({ isLeader: false, ...m, order }))

  const services = [
    {
      title: 'Client Desk',
      slug: 'client-desk',
      features: [{"text":"A consolidated view of your family’s entire wealth"},{"text":"Clear reports across mutual funds, insurance and other holdings"},{"text":"A dedicated relationship manager for reviews and support"}],
      icon: 'layout-dashboard',
      image: img('home'),
      summary:
        'The Client Desk is a premium offering for our clients which consolidates entire wealth, providing a comprehensive view of all your investments and financial assets in one place.',
      content: richText([
        'The Client Desk is a premium offering for our clients which consolidates entire wealth, providing a comprehensive view of all your investments and financial assets in one place.',
        { h2: 'What you get' },
        {
          ul: [
            'A single, consolidated view of your family’s investments',
            'Clear reporting across mutual funds, insurance and other holdings',
            'A dedicated relationship manager for reviews and support',
          ],
        },
        'Talk to our team to get your Client Desk set up.',
      ]),
    },
    {
      title: 'E-Wealth A/c Service',
      slug: 'e-wealth-account',
      features: [{"text":"Consolidated portfolio view in one account"},{"text":"Easy online transactions, anytime"},{"text":"Expert recommendations across all your investments"}],
      icon: 'smartphone',
      image: img('savings'),
      summary:
        'As a client of our E-Wealth A/c service you can enjoy some big, tangible benefits including consolidated portfolio view, easy transactions, and expert recommendations across all your investments.',
      content: richText([
        'As a client of our E-Wealth A/c service you can enjoy some big, tangible benefits including consolidated portfolio view, easy transactions, and expert recommendations across all your investments.',
        { h2: 'Benefits' },
        { ul: ['Consolidated portfolio view', 'Easy online transactions', 'Expert recommendations across all your investments'] },
      ]),
    },
    {
      title: 'Recommended MF Portfolio',
      slug: 'recommended-mf-portfolio',
      features: [{"text":"Portfolios matched to your goals and risk profile"},{"text":"Curated by research experts using market analysis"},{"text":"Timely reviews and rebalancing"}],
      icon: 'target',
      image: img('retirement'),
      summary:
        'Every investor aims to maximise returns while minimising risk. Our recommended portfolios are carefully curated by research experts based on market analysis and risk profiling.',
      content: richText([
        'Every investor aims to maximise returns while minimising risk. Our recommended portfolios are carefully curated by research experts based on market analysis and risk profiling.',
        { h2: 'How it works' },
        {
          ul: [
            'We understand your goals, time horizon and risk appetite',
            'We recommend a diversified mutual fund portfolio matched to your profile',
            'We review and rebalance it on a timely basis',
          ],
        },
      ]),
    },
  ].map((s, order) => ({ ...s, order, showOnHome: true }))

  const categories = [
    { title: 'Financial Planning', slug: 'financial-planning' },
    { title: 'Mutual Funds', slug: 'mutual-funds' },
    { title: 'Insurance', slug: 'insurance' },
  ]

  const posts = [
    {
      title: 'Why a Systematic Investment Plan (SIP) Builds Wealth Steadily',
      slug: 'why-sip-builds-wealth',
      excerpt:
        'A SIP turns investing into a monthly habit. Here is how disciplined, regular investing helps you stay invested through market ups and downs.',
      coverImage: img('savings'),
      category: 'mutual-funds',
      content: richText([
        'A Systematic Investment Plan (SIP) lets you invest a fixed amount in a mutual fund at regular intervals, usually monthly. Instead of trying to time the market, you build your investment gradually and consistently.',
        { h2: 'Discipline over timing' },
        'Because the amount and date are fixed, a SIP removes the temptation to wait for the “right” moment. Investing becomes a habit, just like any other monthly commitment.',
        { h2: 'Rupee cost averaging' },
        'When markets fall, your fixed instalment buys more units; when they rise, it buys fewer. Over time this can smooth out your average purchase cost.',
        { h2: 'Start small, step up later' },
        {
          ul: [
            'Begin with an amount that fits your budget comfortably',
            'Increase your SIP as your income grows',
            'Link each SIP to a clear goal such as retirement or a child’s education',
          ],
        },
        { quote: 'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.' },
      ]),
    },
    {
      title: 'Retirement Planning: Start Earlier Than You Think',
      slug: 'retirement-planning-start-early',
      excerpt:
        'A happy retirement is built long before it arrives. Learn the steps to estimate your needs and build a disciplined retirement corpus.',
      coverImage: img('retirement'),
      category: 'financial-planning',
      content: richText([
        'Retirement is the beginning of a new chapter, but a comfortable one depends on decisions you make years in advance.',
        { h2: 'Estimate what you will need' },
        'Start by listing your expected monthly expenses in retirement, then factor in inflation, healthcare costs and lifestyle goals.',
        { h2: 'Use the right mix of products' },
        {
          ul: [
            'Mutual funds for long-term growth',
            'The National Pension System (NPS) for disciplined, tax-efficient saving',
            'Health insurance to protect your savings from medical expenses',
          ],
        },
        { h2: 'Review regularly' },
        'Your plan should change as your life does. Review and rebalance your portfolio at least once a year with your advisor.',
      ]),
    },
    {
      title: 'Health Insurance: Protecting Your Family and Your Savings',
      slug: 'health-insurance-protect-savings',
      excerpt:
        'An unexpected hospital bill can undo years of saving. Here is what to look for when choosing health cover for your family.',
      coverImage: img('child'),
      category: 'insurance',
      content: richText([
        'Health insurance protects both your family’s well-being and your long-term financial plan from unexpected medical expenses.',
        { h2: 'What to look for' },
        {
          ul: [
            'Adequate sum insured for your city and family size',
            'A wide cashless hospital network',
            'Clear terms on waiting periods and pre-existing conditions',
          ],
        },
        { h2: 'Get expert help' },
        'Our team can compare options and help you choose cover that fits your needs and budget.',
      ]),
    },
  ]

  const pages = [
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      hero: {
        eyebrow: 'Legal',
        heading: 'Privacy Policy',
        lead: 'How FinOracles Services Pvt. Ltd. collects, uses and protects your personal information.',
      },
      layout: [
        {
          blockType: 'content',
          width: 'narrow',
          background: 'white',
          body: richText([
            'This Privacy Policy explains how FinOracles Services Pvt. Ltd. ("FinOracles", "we", "us") handles personal information collected through this website. By using this website or submitting an enquiry, you agree to the practices described here.',
            { h2: 'Information we collect' },
            {
              ul: [
                'Details you share through our enquiry form, such as your name, phone number, email address, the product you are interested in and your message.',
                'Basic technical information sent by your browser, such as pages visited, device type and approximate location, used to keep the website secure and improve it.',
              ],
            },
            { h2: 'How we use your information' },
            {
              ul: [
                'To respond to your enquiry and contact you about the products or services you asked about.',
                'To provide financial product distribution services you choose to take up with us.',
                'To meet legal and regulatory requirements applicable to us.',
              ],
            },
            'We do not sell your personal information. We share it only with our employees and partners (such as fund houses, insurers or platforms you choose to transact with) where needed to serve you, or when required by law.',
            { h2: 'Data security and retention' },
            'We use reasonable technical and organisational measures to protect your information, and keep it only for as long as needed for the purposes above or as required by law.',
            { h2: 'Your rights' },
            'You may ask us to access, correct or delete your personal information, or withdraw your consent to being contacted, by writing to connect@finoracles.com.',
            { h2: 'Contact' },
            'For any questions about this policy, contact FinOracles Services Pvt. Ltd., Vijay Millennium, ZP Chowk, Kalyani Nagar, Sadar Bazar, Satara, Maharashtra 415002, or email connect@finoracles.com.',
            'We may update this policy from time to time. The latest version will always be available on this page.',
          ]),
        },
      ],
      meta: {
        title: 'Privacy Policy | FinOracles',
        description: 'How FinOracles Services Pvt. Ltd. collects, uses and protects your personal information.',
      },
    },
    {
      title: 'Disclaimer',
      slug: 'disclaimer',
      hero: {
        eyebrow: 'Legal',
        heading: 'Disclaimer',
        lead: 'Important information about investing with FinOracles Services Pvt. Ltd.',
      },
      layout: [
        {
          blockType: 'content',
          width: 'narrow',
          background: 'white',
          body: richText([
            'FinOracles Services Pvt. Ltd. is an AMFI-registered Mutual Fund Distributor (ARN 300933).',
            'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.',
            'Past performance is not indicative of future returns. The information on this website is for general awareness only and should not be considered as investment advice. Please consult our team before making any investment decision.',
          ]),
        },
        {
          blockType: 'cta',
          heading: 'Have a question?',
          text: 'Our team is happy to help you understand any product before you invest.',
          links: [{ label: 'Contact Us', url: '/#contact', newTab: false, style: 'primary' }],
        },
      ],
      meta: {
        title: 'Disclaimer | FinOracles',
        description: 'Regulatory disclaimer and registration details for FinOracles Services Pvt. Ltd.',
      },
    },
  ]

  return { siteSettings, header, footer, homePage, products, team, services, categories, posts, pages }
}

export type SeedContent = ReturnType<typeof buildContent>
