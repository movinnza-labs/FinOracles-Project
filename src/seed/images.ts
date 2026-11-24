/** Images shipped in /public/images/finoracles, uploaded into the Media collection by the seed. */
export type SeedImage = {
  file: string
  alt: string
  width: number
  height: number
}

const fam = { width: 501, height: 489 }
const portrait = { width: 480, height: 600 }

export const seedImages = {
  // Default share image (Open Graph / social cards), 1200 x 630.
  og: {
    file: 'og-default.png',
    alt: 'FinOracles Services Pvt. Ltd., Wings for a Wealthy Future. AMFI-registered mutual fund distributor, ARN 300933, Satara',
    width: 1200,
    height: 630,
  },
  logo: { file: 'finoracles-logo.webp', alt: 'FinOracles Services Pvt. Ltd. logo', width: 600, height: 198 },
  retirement: { file: 'family-retirement.webp', alt: 'Happy retired couple enjoying financial freedom after planning for retirement', ...fam },
  savings: {
    file: 'family-savings.webp',
    alt: 'Young couple with a piggy bank, saving and investing regularly for their goals',
    ...fam,
  },
  child: { file: 'family-child.webp', alt: 'Two children dressed as a doctor and an engineer, dreaming of their future careers', ...fam },
  home: {
    file: 'family-home.webp',
    alt: 'A smiling couple holding the keys and a model of their new home',
    ...fam,
  },
  about: { file: 'about.webp', alt: 'Financial advisor reviewing a client portfolio on a tablet, with a city skyline behind', width: 457, height: 334 },
  earning: {
    file: 'just-started-earning.webp',
    alt: 'A young professional checking a phone at a desk',
    width: 480,
    height: 480,
  },
  earlyInvestor: {
    file: 'early-investor.webp',
    alt: 'Stock market chart trending upward, for new investors starting with equity and ETFs',
    width: 480,
    height: 480,
  },
  expertise: {
    file: 'expertise-growth.webp',
    alt: 'Advisor pointing at a rising market chart during a finance review',
    width: 1400,
    height: 2100,
  },
  sandeep: { file: 'team/sandeep.webp', alt: 'Sandeep Kothawale', ...portrait },
  priyankaJadhav: { file: 'team/priyanka-jadhav.webp', alt: 'Priyanka Jadhav', ...portrait },
  priyankaPhalke: { file: 'team/priyanka-phalke.webp', alt: 'Priyanka Phalke', ...portrait },
  renuka: { file: 'team/renuka.webp', alt: 'Renuka Bokil', ...portrait },
  mangesh: { file: 'team/mangesh.webp', alt: 'Mangesh Pawaskar', ...portrait },
  rushikesh: { file: 'team/rushikesh.webp', alt: 'Rushikesh Shinde', ...portrait },
  priyankaGole: { file: 'team/priyanka-gore.webp', alt: 'Priyanka Gole', ...portrait },
  payal: { file: 'team/payal.webp', alt: 'Payal Chavan', ...portrait },
  dhanshree: { file: 'team/dhanshree.webp', alt: 'Dhanshree Shinde', ...portrait },
} satisfies Record<string, SeedImage>

export type SeedImageKey = keyof typeof seedImages

export const publicImagePath = (key: SeedImageKey) => `/images/finoracles/${seedImages[key].file}`
