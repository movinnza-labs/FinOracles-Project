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
  logo: { file: 'finoracles-logo.webp', alt: 'FinOracles', width: 600, height: 198 },
  retirement: { file: 'family-retirement.webp', alt: 'A happy retired couple standing together', ...fam },
  savings: {
    file: 'family-savings.webp',
    alt: 'A young couple giving a thumbs-up and holding a piggy bank',
    ...fam,
  },
  child: { file: 'family-child.webp', alt: 'Two children dressed as a doctor and an engineer', ...fam },
  home: {
    file: 'family-home.webp',
    alt: 'A smiling couple holding the keys and a model of their new home',
    ...fam,
  },
  about: { file: 'about.webp', alt: 'About FinOracles', width: 457, height: 334 },
  earning: {
    file: 'just-started-earning.webp',
    alt: 'A young professional checking a phone at a desk',
    width: 480,
    height: 480,
  },
  earlyInvestor: {
    file: 'early-investor.webp',
    alt: 'A pen pointing at a rising market chart',
    width: 480,
    height: 480,
  },
  expertise: {
    file: 'expertise-growth.webp',
    alt: 'Hand pointing a pen at a rising market chart',
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
