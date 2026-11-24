import type { RichBlock } from './lexical'

/**
 * Longer page content from the SEO recommendations (product pages 400–600 words, service pages
 * 300+ words) and the first four suggested blog posts, which are created as drafts for review.
 * Kept factual and general: no return figures or tax amounts, which change and are regulated.
 * Used by the seed and by the 20261123 content migration.
 */

/** "Who should consider it" and "How it works with FinOracles" per product (by slug). */
export const productSections: Record<string, { whoShouldConsider: string; howItWorks: string }> = {
  'mutual-funds': {
    whoShouldConsider: [
      'Mutual funds suit almost anyone who wants their savings to grow over time without picking individual shares. They are a natural fit if you are saving for a long-term goal such as retirement, a child’s education or a home, if you have just started earning and want to build a monthly investing habit, or if you already invest and want a clearer, better-diversified portfolio.',
      'Because mutual funds range from equity to debt and hybrid schemes, there is usually a category to match your time horizon and comfort with risk. If you need regular income, a Systematic Withdrawal Plan (SWP) can help, and if you are investing a large amount, a Systematic Transfer Plan (STP) lets you move into equity gradually.',
    ].join('\n\n'),
    howItWorks: [
      'As an AMFI-registered mutual fund distributor in Satara (ARN 300933), we start by understanding your goals, timelines and risk profile. Based on this, we suggest a mix of schemes from leading fund houses and help you decide between a SIP, a lumpsum investment or both.',
      'Once you agree, we complete your KYC and account set-up and help you invest online through your E-Wealth account, where you can track every holding in one place. After that, we review your portfolio with you at regular intervals and suggest rebalancing when your goals, income or market conditions change, so your investments stay aligned with what you are saving for.',
    ].join('\n\n'),
  },
  nps: {
    whoShouldConsider: [
      'NPS is designed for people who want a disciplined, low-cost way to build a retirement corpus. It suits salaried employees who want to add to their employer’s retirement benefits, self-employed professionals and business owners who have no pension of their own, and anyone who wants long-term savings that discourage early withdrawals.',
      'It works best when you start early and contribute regularly, because the money stays invested until retirement and has time to compound. NPS also complements mutual fund investments by giving you a dedicated pool of savings for life after work, with tax benefits as per prevailing tax laws.',
    ].join('\n\n'),
    howItWorks: [
      'We help with NPS account opening in Satara from start to finish: checking your eligibility, completing the registration and KYC, and choosing between Active Choice and Auto Choice for your asset allocation. We explain the account types, the role of pension fund managers and the rules on partial withdrawals and exit, so you know exactly how your money will be handled.',
      'Once your account is open, we help you plan a contribution that fits your budget and retirement goal, and review your allocation as you get closer to retirement. If you also invest in mutual funds, we look at both together so your retirement plan stays balanced.',
    ].join('\n\n'),
  },
  'equity-etfs': {
    whoShouldConsider: [
      'Direct equity and ETFs suit investors with a long time horizon who are comfortable with market ups and downs. ETFs are a good starting point if you want low-cost, diversified exposure to an index such as the Nifty 50 or the Sensex without choosing individual companies. Direct equity suits investors who want to own specific businesses and are willing to follow them over time.',
      'Both work best as part of a wider plan. If you are new to the markets, you might begin with index ETFs or mutual funds and add direct shares gradually as your experience and portfolio grow.',
    ].join('\n\n'),
    howItWorks: [
      'If you want to invest in ETFs or shares, the first step is a demat and trading account, and we help you open one. We then look at your goals and risk profile to decide how much of your portfolio should be in equity, and suggest a mix of index ETFs, sector ETFs and direct shares that fits.',
      'You place orders on the stock exchange through your trading account, and we help you follow a disciplined approach, such as investing a fixed amount at regular intervals. We review your equity allocation periodically and suggest rebalancing when it drifts too far from your plan.',
    ].join('\n\n'),
  },
  pms: {
    whoShouldConsider: [
      'Portfolio Management Services are meant for experienced, high-net-worth investors. SEBI currently sets a minimum investment of ₹50 lakh, so PMS usually makes sense for investors who already have a well-diversified base of mutual funds and other assets, and who want a more concentrated, personalised equity portfolio on top of it.',
      'PMS suits investors who are comfortable with higher volatility, have a long investment horizon and want each security held directly in their own name. If you are still building your core portfolio, mutual funds are often the better place to start.',
    ].join('\n\n'),
    howItWorks: [
      'We help you compare portfolio management services in Satara and across India, explaining each manager’s investment approach, performance disclosures, fee structure and risks. Once you choose a strategy, we help you complete the documentation with the portfolio manager.',
      'After your portfolio is set up, the portfolio manager makes the day-to-day investment decisions and you receive regular statements. We meet you periodically to review how the PMS fits with the rest of your wealth, using your Client Desk to see all your holdings together.',
    ].join('\n\n'),
  },
  'loan-against-mutual-funds': {
    whoShouldConsider: [
      'A loan against mutual funds suits investors who need money for a short-term need, such as a business requirement, a medical bill, education fees or a home renovation, but do not want to sell their long-term investments. Redeeming units early can set back your goals, attract exit loads and create capital gains tax, while a loan lets your funds stay invested.',
      'It is most useful when you have a clear plan to repay within a reasonable time. Because the loan is secured by your units, the process is largely digital and needs little paperwork.',
    ].join('\n\n'),
    howItWorks: [
      'We start by checking which of your mutual fund holdings can be pledged and how much you could borrow against them, based on the lender’s loan-to-value limits for equity and debt funds. We then help you compare terms from our lending partners and complete the application.',
      'Once the loan is approved, your units are marked as pledged with the lender and the money is credited to your bank account. Your investments stay in your name and continue to reflect market movements. When you repay the loan, the pledge is released. We keep an eye on your pledged portfolio, so you know if market movements affect your borrowing limit.',
    ].join('\n\n'),
  },
  'health-insurance': {
    whoShouldConsider: [
      'Everyone needs health insurance, whatever their age. A single hospital stay can cost more than several years of premiums, and medical costs keep rising. Cover is especially important for families with young children, for parents and senior citizens, and for self-employed people who have no employer policy. Even if your employer provides group cover, a personal plan protects you if you change jobs or retire.',
      'Buying cover while you are young and healthy usually means lower premiums and fewer exclusions, and it lets waiting periods for pre-existing conditions run out sooner.',
    ].join('\n\n'),
    howItWorks: [
      'We help you choose health insurance in Satara by first understanding your family, local hospital costs and any existing medical conditions. We then compare individual and family floater plans, explaining the sum insured, room rent limits, co-payments, waiting periods and the cashless hospital network near you.',
      'Once you choose a plan, we help with the proposal form and medical disclosures, so a claim is not rejected later for missing information. When you need to claim, our team helps with the paperwork and follows up with the insurer. We also remind you before renewal and check whether your cover is still enough.',
    ].join('\n\n'),
  },
  'life-insurance': {
    whoShouldConsider: [
      'Life insurance is essential for anyone whose family depends on their income: parents with young children, people supporting a spouse or elderly parents, and anyone with a home loan or other debts their family would otherwise have to repay. It also matters for business owners whose partners or family rely on them.',
      'A term plan gives the highest cover for the premium, which makes it the foundation of most protection plans. The younger and healthier you are when you buy, the lower the premium usually is, and for most term plans it stays the same for the whole policy term.',
    ].join('\n\n'),
    howItWorks: [
      'We help you work out how much cover your family would need by looking at your income, expenses, loans and future goals such as your children’s education. We then compare term plans and other life insurance in Satara from leading insurers, explaining the cover, riders, claim process and exclusions.',
      'Once you choose a policy, we help with the application and medical tests and make sure your nominee details are correct. We review your cover when your life changes, for example after marriage, the birth of a child or a new home loan, and support your family through the claim process if it is ever needed.',
    ].join('\n\n'),
  },
  'personal-accident-insurance': {
    whoShouldConsider: [
      'Personal accident cover is valuable for anyone who commutes daily, rides a two-wheeler, drives long distances or works in a physically demanding job. It is also important for the main earner in a family, because an accident can stop income at the same time as it brings new expenses.',
      'Health insurance pays hospital bills, but it does not replace lost income or pay a lump sum for permanent disability. Personal accident insurance fills that gap at a relatively low premium and works well alongside your health and life cover. It is also worth reviewing any accident cover you already have through your employer or a loan, since it may end when you change jobs or repay the loan.',
    ].join('\n\n'),
    howItWorks: [
      'We help you choose a policy with the right sum insured for your income and responsibilities. We explain what each plan covers, such as accidental death, permanent total or partial disability and temporary disability, and optional benefits like hospital cash or an education benefit for children. We also check that the sum insured keeps pace with your income, and suggest increasing it at renewal as your responsibilities grow.',
      'Once you choose a plan, we help you buy it with minimal paperwork. If you ever need to claim, our team helps you gather the documents and follows up with the insurer, so your family can focus on recovery.',
    ].join('\n\n'),
  },
  'vehicle-insurance': {
    whoShouldConsider: [
      'Every car and two-wheeler on Indian roads needs at least third-party insurance under the Motor Vehicles Act. Comprehensive cover is recommended if your vehicle is new or valuable, used every day or bought on a loan, because it also pays for damage to your own vehicle from accidents, theft, fire and natural calamities.',
      'Add-ons such as zero depreciation, engine protection and roadside assistance are worth considering for newer vehicles, where repair and replacement costs are high.',
    ].join('\n\n'),
    howItWorks: [
      'We help you buy or renew vehicle insurance in Satara by comparing third-party and comprehensive plans from leading insurers. We explain the insured declared value (IDV), your no-claim bonus and which add-ons make sense for your car or bike, so you pay only for the cover you need.',
      'We remind you before your policy expires, so you do not lose your no-claim bonus or drive without cover. If you have an accident, our team guides you through the claim, from informing the insurer to the survey and repairs.',
    ].join('\n\n'),
  },
  'overseas-insurance': {
    whoShouldConsider: [
      'Overseas insurance is for anyone travelling outside India, whether for a holiday, higher studies, business or to visit family. Some countries require travel insurance for a visa, and even where it is optional, medical treatment abroad can be very expensive. Students on long courses need plans built for long stays, and frequent business travellers can consider multi-trip cover.',
      'Senior citizens visiting family abroad should arrange cover well before the trip, since plans and premiums vary with age and health. Families travelling together can often buy a single policy that covers everyone on the trip.',
    ].join('\n\n'),
    howItWorks: [
      'We help you find the right travel insurance for abroad based on your destination, the length of your trip and its purpose. We compare plans for medical emergencies and hospitalisation, trip delays and cancellations, loss of baggage and passport, and personal liability, and check that the cover meets any visa requirements. We also point out common exclusions, such as pre-existing conditions and adventure sports, so there are no surprises later.',
      'Once you choose a plan, the policy is issued quickly so you can carry it with you. If something goes wrong during your trip, we help you reach the insurer’s assistance team and support you with the claim when you return.',
    ].join('\n\n'),
  },
}

/** Sections appended to each service page's content (by slug). The first heading marks them as added. */
export const serviceSections: Record<string, RichBlock[]> = {
  'client-desk': [
    { h2: 'Who it is for' },
    'The Client Desk is for families who hold investments and insurance across different products, fund houses and family members, and find it hard to see the full picture. It suits busy professionals and business owners who want one clear report instead of many separate statements, and families planning shared goals such as a child’s education or retirement. It is also helpful when you want to share a clear summary of your investments with a family member or your chartered accountant.',
    { h2: 'How it works' },
    'Once you are a FinOracles client, we bring the details of your family’s mutual funds, insurance policies and other holdings together into one consolidated portfolio statement. You can see what each family member owns, how your money is allocated and how your investments have moved over time.',
    {
      ul: [
        'Every family member’s mutual fund holdings in one place',
        'Life, health and general insurance policies with their renewal dates',
        'Your overall allocation across equity, debt and other assets',
        'Progress towards each of your financial goals',
      ],
    },
    'Because everything sits in one report, it becomes much easier to spot gaps, such as a goal that is under-funded, an insurance policy that is due for renewal or too much money in one type of investment.',
    'Your dedicated relationship manager uses this report in regular review meetings to check whether you are on track and to suggest changes. Whenever you have a question, you have one person to call who already knows your complete financial picture.',
  ],
  'e-wealth-account': [
    { h2: 'Who it is for' },
    'The E-Wealth account is for investors who want to manage their investments online, at their own convenience, while still having expert guidance. It suits salaried professionals who prefer to invest from a phone or laptop, families who want every member’s investments under one login, and anyone who wants to start, pause or change SIPs without paperwork. It is also useful if you travel often or live away from Satara, since you can invest and track your portfolio from anywhere.',
    { h2: 'How it works' },
    'We help you open your NJ E-Wealth account by completing your KYC and account details. The process is simple and takes only a few minutes once your documents are ready. Once it is active, you can log in at any time to do the following.',
    {
      ul: [
        'View your complete portfolio and holdings',
        'Invest through lumpsum or SIP, redeem, or switch between schemes',
        'Download account statements and capital gains reports',
      ],
    },
    'Every transaction is recorded in one place, so you can see the effect of a new SIP or a redemption on your overall portfolio straight away. You can also view the holdings of each family member, which makes it easier to plan goals together.',
    'You are never on your own. Our team shares recommendations based on your goals, and if you have a question about a transaction or your portfolio, you can call your relationship manager. Existing clients can log in from the Login page on this website.',
    'To open your account, book a free consultation and our team will guide you through each step, from KYC to your first investment.',
  ],
  'recommended-mf-portfolio': [
    { h2: 'Who it is for' },
    'Our recommended portfolios are for investors who want a well-researched mutual fund portfolio without comparing hundreds of schemes themselves. They suit first-time investors looking for a sound starting point, busy professionals who prefer a ready, goal-based plan, and existing investors whose holdings have become scattered across too many funds. It is also a practical option if you want a second opinion on the funds you already hold.',
    { h2: 'What you receive' },
    'Based on your risk profile, our research team suggests a recommended mutual fund portfolio: a diversified mix of equity, debt and hybrid schemes in proportions that suit your goals. Each recommendation comes with a clear explanation of why a fund was chosen and the role it plays, so you always know what you own.',
    'Your portfolio is built around your goals, not around past returns alone. We look at each fund’s consistency, risk, costs and the experience of its fund manager before including it.',
    'You can invest through SIP, lumpsum or both, directly from your E-Wealth account. We then monitor the portfolio and suggest timely changes when a fund no longer meets our criteria or when your allocation drifts away from your plan.',
    'If your goals or circumstances change, for example a new job, marriage or the birth of a child, we revisit your risk profile and update the recommended portfolio to match.',
    { quote: 'Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Past performance is not indicative of future returns.' },
  ],
}

type DraftPost = {
  title: string
  slug: string
  excerpt: string
  /** Seed image key for the cover. */
  cover: 'retirement' | 'home' | 'savings' | 'child'
  category: 'financial-planning' | 'mutual-funds' | 'insurance'
  meta: { title: string; description: string }
  content: RichBlock[]
}

/** The first four posts suggested in the SEO plan. Created as drafts: review, then publish in the CMS. */
export const draftPosts: DraftPost[] = [
  {
    title: 'NPS Benefits: Why the National Pension System Belongs in Your Retirement Plan',
    slug: 'nps-benefits',
    excerpt:
      'The National Pension System is a low-cost, government-backed way to build a retirement corpus. Here are its main benefits and who it suits.',
    cover: 'retirement',
    category: 'financial-planning',
    meta: {
      title: 'NPS Benefits: Why NPS Belongs in Your Retirement Plan',
      description:
        'Low costs, market-linked growth, tax benefits and built-in discipline. Learn the key benefits of the National Pension System and who should invest.',
    },
    content: [
      'The [National Pension System (NPS)](/products/nps) is a government-backed retirement savings scheme regulated by the Pension Fund Regulatory and Development Authority (PFRDA). You contribute regularly during your working years, your money is invested by professional pension fund managers, and you use the corpus to fund your retirement.',
      { h2: '1. Very low costs' },
      'NPS is one of the lowest-cost investment products available in India. Lower charges mean more of your money stays invested and compounds over the decades until you retire.',
      { h2: '2. Market-linked growth with a choice of allocation' },
      'Your contributions are invested in a mix of equity, corporate bonds and government securities. With Active Choice you decide the mix yourself, within the permitted limits. With Auto Choice the mix is set by your age and becomes more conservative as you approach retirement.',
      { h2: '3. Tax benefits' },
      'Contributions to NPS can qualify for tax deductions under the Income Tax Act, including some benefits that are specific to NPS. The exact benefit depends on the tax regime you choose and on current rules, so check with your tax adviser before you rely on it.',
      { h2: '4. Built-in discipline' },
      'NPS is designed for retirement, so withdrawals before retirement are restricted to specific needs. This can feel limiting, but it protects your retirement savings from being used for other expenses along the way.',
      { h2: 'Who should consider NPS?' },
      {
        ul: [
          'Salaried employees who want to add to their employer’s retirement benefits',
          'Self-employed professionals and business owners who have no pension of their own',
          'Anyone who prefers a disciplined, long-term product for retirement savings',
        ],
      },
      'NPS works best alongside other investments. [Mutual funds](/products/mutual-funds) offer more flexibility and liquidity, while NPS gives you a dedicated pool of money for retirement. Read our guide on [why to start retirement planning early](/blog/retirement-planning-start-early) to see how the two fit together.',
      { h2: 'Getting started' },
      'Opening an NPS account takes a short registration and KYC process. [Our team](/contact) can help you open your account, choose your allocation and plan a contribution that fits your budget.',
    ],
  },
  {
    title: 'Term Insurance vs Endowment Plan: Which Is Right for You?',
    slug: 'term-insurance-vs-endowment-plan',
    excerpt:
      'Both are life insurance, but they do very different jobs. Here is how term plans and endowment plans compare on cover, cost and returns.',
    cover: 'home',
    category: 'insurance',
    meta: {
      title: 'Term Insurance vs Endowment Plan: Which Is Right for You?',
      description:
        'Term plans give high cover at a low premium; endowment plans combine insurance with savings. Compare cover, cost and returns to choose the right policy.',
    },
    content: [
      'When you buy [life insurance](/products/life-insurance), two of the most common choices are a term plan and an endowment plan. Both protect your family if something happens to you, but they are built for different purposes.',
      { h2: 'What is a term plan?' },
      'A term plan is pure protection. If you pass away during the policy term, your nominee receives the sum assured. If you survive the term, a regular term plan pays nothing back. Because there is no savings element, the premium is low for the amount of cover you get.',
      { h2: 'What is an endowment plan?' },
      'An endowment plan combines insurance with savings. It pays the sum assured if you pass away during the term, and a maturity benefit if you survive it. Part of your premium goes towards the savings element, so premiums are much higher for the same life cover.',
      { h2: 'How they compare' },
      {
        ul: [
          'Cover: a term plan gives a much higher sum assured for the same premium',
          'Cost: term premiums are low; endowment premiums are significantly higher',
          'Returns: a term plan has no maturity benefit, while an endowment plan pays one at the end of the term',
          'Flexibility: with a term plan, the money you save on premiums can be invested separately',
        ],
      },
      { h2: 'Which should you choose?' },
      'For most families, the first priority is enough cover to replace your income and clear your loans. A term plan usually achieves this at the lowest cost. Many people then invest the difference in premium separately, for example through a [SIP in mutual funds](/products/mutual-funds), to build wealth for their goals.',
      'An endowment plan can suit people who want guaranteed savings with insurance in one product and value that simplicity. The right answer depends on your income, goals and how you prefer to save.',
      'Not sure how much cover your family needs? [Talk to our team](/contact) for a free review of your protection plan.',
    ],
  },
  {
    title: 'Step-Up SIP: Grow Your Investments as Your Income Grows',
    slug: 'step-up-sip',
    excerpt:
      'A step-up SIP raises your monthly investment every year, in line with your income. Here is how it works and why it can help you reach goals sooner.',
    cover: 'savings',
    category: 'mutual-funds',
    meta: {
      title: 'Step-Up SIP: Grow Your Investments With Your Income',
      description:
        'A step-up SIP increases your monthly investment every year as your income rises. Learn how it works, why it helps and how to set one up.',
    },
    content: [
      'A regular [SIP](/blog/why-sip-builds-wealth) invests the same amount every month. A step-up SIP, also called a top-up SIP, automatically increases that amount at a fixed interval, usually once a year.',
      { h2: 'How a step-up SIP works' },
      'When you start the SIP, you choose a step-up amount or percentage. For example, you could begin with ₹5,000 a month and increase it by ₹500 every year, or by 10% every year. The increase happens automatically, so you do not have to remember to raise your investment.',
      { h2: 'Why it helps' },
      {
        ul: [
          'Your investment keeps pace with your income as you get raises and promotions',
          'It helps offset inflation, which reduces what a fixed amount can buy over time',
          'Larger contributions in later years can help you reach your goals sooner',
          'It builds the habit of investing more as you earn more, without extra effort',
        ],
      },
      { h2: 'Choosing your step-up' },
      'Pick a step-up you can sustain comfortably, ideally a little below your expected annual salary increase. It is better to raise your SIP steadily every year than to set an ambitious step-up and stop it later.',
      { h2: 'Try it with numbers' },
      'Use our [SIP and goal calculators](/tools) to see how much you might need to invest each month for a goal, then plan a step-up that gets you there. Remember that calculators are illustrations based on an assumed rate of return; actual returns will vary.',
      { h2: 'Setting up a step-up SIP' },
      'Many fund houses let you add a step-up when you start a SIP, and you can also start a new SIP alongside an existing one. [Our team](/contact) can help you choose the right funds and step-up amount for your goals.',
      { quote: 'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.' },
    ],
  },
  {
    title: 'Child Education Planning: How to Start Saving for Your Child’s Future',
    slug: 'child-education-planning',
    excerpt:
      'Education costs rise every year. A simple, step-by-step plan to estimate the amount you need and start saving for your child’s education.',
    cover: 'child',
    category: 'financial-planning',
    meta: {
      title: 'Child Education Planning: How to Start Saving Early',
      description:
        'Education costs rise every year. Estimate what you will need, start investing early and protect the plan. A step-by-step guide for parents.',
    },
    content: [
      'Whether your child dreams of becoming a doctor, an engineer or an artist, higher education is one of the biggest expenses most families will face. Education costs tend to rise faster than general inflation, so planning early makes a big difference.',
      { h2: 'Step 1: Estimate the cost' },
      'Start with today’s cost of the course you have in mind, then allow for inflation until the year your child will need the money. Our [goal planner](/tools) helps you estimate the future cost and the monthly investment needed to reach it.',
      { h2: 'Step 2: Start as early as you can' },
      'The earlier you start, the longer your money has to grow and the smaller the monthly amount you need. Even a modest SIP started when your child is young can build a meaningful fund over 15 years or more.',
      { h2: 'Step 3: Choose the right mix' },
      {
        ul: [
          'For goals more than 7 to 10 years away, [equity mutual funds](/products/mutual-funds) can offer growth potential over the long term',
          'As the goal comes closer, gradually move money into debt funds to protect what you have built',
          'Keep a separate plan for each child and each goal, such as school fees and higher studies',
        ],
      },
      { h2: 'Step 4: Protect the plan' },
      'Your child’s education fund depends on your income. A [term life insurance plan](/products/life-insurance) makes sure the goal can still be met if something happens to you, and [health insurance](/products/health-insurance) protects your savings from medical bills.',
      { h2: 'Step 5: Review every year' },
      'Check your plan once a year. Increase your SIP as your income grows, update the target if your child’s interests change, and rebalance as the goal approaches.',
      'Want a personalised plan for your child’s future? [Book a free consultation](/contact) with our team.',
      { quote: 'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.' },
    ],
  },
]
