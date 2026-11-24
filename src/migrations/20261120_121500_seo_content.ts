import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

/**
 * Content changes from the on-page SEO recommendations (20 Nov 2026) for a database that was
 * seeded before them. Every change is guarded: a value is replaced only while it still equals
 * the originally seeded text (or is empty), so anything an editor has already changed is left
 * alone. On a fresh database nothing matches and the seed writes the new values itself.
 *
 * The old and new values are written out here on purpose: a data migration must keep doing the
 * same thing even after src/seed/content.ts changes again.
 */

type Doc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
type Meta = { title: string; description: string }
type Link = { label: string; url: string }

const context = { disableRevalidate: true }

/** Fills an SEO field when it is empty or still holds the seeded value. */
const pick = (current: unknown, next: string, seeded?: string) =>
  current === null || current === undefined || current === '' || current === seeded ? next : current

const changedMeta = (meta: Doc | null | undefined, next: Meta, seeded?: Partial<Meta>) => {
  const merged = {
    ...(meta ?? {}),
    title: pick(meta?.title, next.title, seeded?.title),
    description: pick(meta?.description, next.description, seeded?.description),
  }
  const changed = merged.title !== meta?.title || merged.description !== meta?.description
  return changed ? merged : null
}

// ─── Media alt text (seeded file name → [seeded alt, new alt]) ────────────────────────────────
const altText: Record<string, [string, string]> = {
  'finoracles-logo.webp': ['FinOracles', 'FinOracles Services Pvt. Ltd. logo'],
  'family-retirement.webp': [
    'A happy retired couple standing together',
    'Happy retired couple enjoying financial freedom after planning for retirement',
  ],
  'family-savings.webp': [
    'A young couple giving a thumbs-up and holding a piggy bank',
    'Young couple with a piggy bank, saving and investing regularly for their goals',
  ],
  'family-child.webp': [
    'Two children dressed as a doctor and an engineer',
    'Two children dressed as a doctor and an engineer, dreaming of their future careers',
  ],
  'about.webp': ['About FinOracles', 'Financial advisor reviewing a client portfolio on a tablet, with a city skyline behind'],
  'early-investor.webp': [
    'A pen pointing at a rising market chart',
    'Stock market chart trending upward, for new investors starting with equity and ETFs',
  ],
  'expertise-growth.webp': [
    'Hand pointing a pen at a rising market chart',
    'Advisor pointing at a rising market chart during a finance review',
  ],
}

// ─── Products (by slug): meta + "Learn more" links ────────────────────────────────────────────
const products: Record<string, Meta & { links: Link[] }> = {
  'mutual-funds': {
    title: 'Mutual Fund Distributor in Satara | Start a SIP | FinOracles',
    description:
      'Invest in mutual funds through SIP or lumpsum with an AMFI-registered distributor in Satara. Funds matched to your goals, with regular reviews.',
    links: [
      { label: 'Try the SIP calculator', url: '/tools' },
      { label: 'Why a SIP builds wealth steadily', url: '/blog/why-sip-builds-wealth' },
      { label: 'Our recommended mutual fund portfolio', url: '/services/recommended-mf-portfolio' },
      { label: 'Need funds? Take a loan against your mutual funds', url: '/products/loan-against-mutual-funds' },
    ],
  },
  nps: {
    title: 'NPS Account Opening in Satara | National Pension System',
    description:
      'Open and manage your National Pension System (NPS) account in Satara. Plan a disciplined retirement corpus with tax benefits. Talk to FinOracles.',
    links: [
      { label: 'Retirement planning: start earlier than you think', url: '/blog/retirement-planning-start-early' },
      { label: 'Grow your retirement savings with mutual funds', url: '/products/mutual-funds' },
    ],
  },
  'equity-etfs': {
    title: 'Invest in Equity & ETFs in Satara | FinOracles',
    description:
      'Build long-term wealth with direct equity and low-cost index ETFs. FinOracles in Satara helps with demat opening, allocation and periodic reviews.',
    links: [
      { label: 'ETF or mutual fund? Explore our mutual fund services', url: '/products/mutual-funds' },
      { label: 'Portfolio Management Services (PMS)', url: '/products/pms' },
    ],
  },
  pms: {
    title: 'Portfolio Management Services (PMS) in Satara | FinOracles',
    description:
      'SEBI-regulated portfolio management services for investors with ₹50 lakh or more. Personalised, professionally managed portfolios via FinOracles, Satara.',
    links: [
      { label: 'PMS or mutual fund? Explore our mutual fund services', url: '/products/mutual-funds' },
      { label: 'Client Desk: your consolidated family wealth report', url: '/services/client-desk' },
    ],
  },
  'loan-against-mutual-funds': {
    title: 'Loan Against Mutual Funds in Satara | FinOracles',
    description:
      'Need cash without selling your investments? Pledge your mutual fund units for a loan with minimal paperwork. Your funds stay invested. Enquire today.',
    links: [
      { label: 'Mutual fund services', url: '/products/mutual-funds' },
      { label: 'Track your investments in your E-Wealth account', url: '/services/e-wealth-account' },
    ],
  },
  'health-insurance': {
    title: 'Health Insurance in Satara | Family Floater Plans',
    description:
      'Compare family floater and individual health insurance plans with cashless hospital networks. Get help choosing cover and with claims from FinOracles, Satara.',
    links: [
      { label: 'How to choose health insurance for your family', url: '/blog/health-insurance-protect-savings' },
      { label: 'Add personal accident cover', url: '/products/personal-accident-insurance' },
    ],
  },
  'life-insurance': {
    title: 'Life & Term Insurance in Satara | FinOracles',
    description:
      'Protect your family with a term plan or life insurance policy. FinOracles in Satara helps you work out the right cover and compare plans. Free consultation.',
    links: [
      { label: 'Health insurance for your family', url: '/products/health-insurance' },
      { label: 'Retirement planning: start earlier than you think', url: '/blog/retirement-planning-start-early' },
    ],
  },
  'personal-accident-insurance': {
    title: 'Personal Accident Insurance Policy | FinOracles Satara',
    description:
      'Cover for accidental death, disability and loss of income at an affordable premium. Get the right personal accident policy with FinOracles, Satara.',
    links: [
      { label: 'How it differs from health insurance', url: '/products/health-insurance' },
      { label: 'Life & term insurance', url: '/products/life-insurance' },
    ],
  },
  'vehicle-insurance': {
    title: 'Car & Bike Insurance in Satara | Vehicle Insurance Renewal',
    description:
      'Buy or renew car and two-wheeler insurance in Satara. Third-party and comprehensive plans, zero depreciation add-ons and claim support from FinOracles.',
    links: [{ label: 'Personal accident insurance for riders and drivers', url: '/products/personal-accident-insurance' }],
  },
  'overseas-insurance': {
    title: 'Overseas Travel Insurance for Abroad | FinOracles',
    description:
      'Overseas travel insurance for holidays, students and business trips. Cover for medical emergencies, delays and baggage loss abroad. Get a plan today.',
    links: [{ label: 'Health insurance for when you are back home', url: '/products/health-insurance' }],
  },
}

// ─── Services (by slug) ───────────────────────────────────────────────────────────────────────
const services: Record<string, Meta & { links: Link[]; rename?: [string, string] }> = {
  'client-desk': {
    title: 'Client Desk: Consolidated Family Wealth Report | FinOracles',
    description:
      "See your family's mutual funds, insurance and other holdings in one consolidated report, with a dedicated relationship manager for reviews.",
    links: [
      { label: 'Mutual fund services', url: '/products/mutual-funds' },
      { label: 'Health insurance', url: '/products/health-insurance' },
      { label: 'Book a free consultation', url: '/contact' },
    ],
  },
  'e-wealth-account': {
    title: 'E-Wealth Account: Invest & Track Online | FinOracles',
    description:
      'Open an E-Wealth account to view your whole portfolio, invest online, start SIPs and download statements anytime, with expert recommendations.',
    links: [
      { label: 'Already a client? Log in to E-Wealth', url: '/login' },
      { label: 'Mutual fund services', url: '/products/mutual-funds' },
      { label: 'SIP, lumpsum & goal calculators', url: '/tools' },
    ],
  },
  'recommended-mf-portfolio': {
    title: 'Recommended Mutual Fund Portfolio | FinOracles',
    description:
      'A diversified mutual fund portfolio matched to your goals and risk profile, curated by research experts and rebalanced on time. Get your portfolio.',
    links: [
      { label: 'Mutual fund services', url: '/products/mutual-funds' },
      { label: 'Why a SIP builds wealth steadily', url: '/blog/why-sip-builds-wealth' },
      { label: 'Try the SIP calculator', url: '/tools' },
    ],
    // New H1 / title; the slug (URL) stays the same.
    rename: ['Recommended MF Portfolio', 'Recommended Mutual Fund Portfolio'],
  },
}

// ─── Posts (by slug): meta + phrases to link in the body (first occurrence) ───────────────────
const posts: Record<string, Meta & { links: [string, string][] }> = {
  'why-sip-builds-wealth': {
    title: 'Benefits of SIP: How a SIP Builds Wealth Steadily',
    description:
      'How does a SIP work? Learn how rupee cost averaging and disciplined monthly investing help you build wealth through market ups and downs.',
    links: [
      ['mutual fund', '/products/mutual-funds'],
      ['Begin with an amount that fits your budget', '/tools'],
    ],
  },
  'retirement-planning-start-early': {
    title: 'Retirement Planning in India: Start Earlier Than You Think',
    description:
      'Estimate your retirement needs, choose the right mix of mutual funds, NPS and health cover, and review your plan every year. A step-by-step guide.',
    links: [
      ['Mutual funds', '/products/mutual-funds'],
      ['The National Pension System (NPS)', '/products/nps'],
      ['Health insurance', '/products/health-insurance'],
      ['your advisor', '/contact'],
    ],
  },
  'health-insurance-protect-savings': {
    title: 'How to Choose Health Insurance for Your Family',
    description:
      'An unexpected hospital bill can undo years of saving. What to check before buying health insurance: sum insured, cashless network and waiting periods.',
    links: [
      ['Health insurance', '/products/health-insurance'],
      ['Our team', '/contact'],
    ],
  },
}

// ─── Lexical helpers ──────────────────────────────────────────────────────────────────────────
const textNode = (base: Doc, text: string): Doc => ({ ...base, text })
const linkNode = (base: Doc, url: string, text: string): Doc => ({
  type: 'link',
  version: 3,
  direction: 'ltr',
  format: '',
  indent: 0,
  fields: { linkType: 'custom', url, newTab: false },
  children: [textNode(base, text)],
})

/**
 * Links the first plain-text occurrence of `phrase` (case-sensitive) to `url`. Skips text that
 * is already inside a link, and does nothing if that URL is already linked anywhere in the post.
 */
const linkPhrase = (root: Doc, phrase: string, url: string): boolean => {
  const hasLink = (node: Doc): boolean =>
    (node.type === 'link' && node.fields?.url === url) || (node.children ?? []).some(hasLink)
  if (hasLink(root)) return false

  const visit = (node: Doc): boolean => {
    if (node.type === 'link' || !Array.isArray(node.children)) return false
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]
      if (child.type === 'text' && typeof child.text === 'string') {
        const at = child.text.indexOf(phrase)
        if (at === -1) continue
        const before = child.text.slice(0, at)
        const after = child.text.slice(at + phrase.length)
        const replacement = [
          ...(before ? [textNode(child, before)] : []),
          linkNode(child, url, phrase),
          ...(after ? [textNode(child, after)] : []),
        ]
        node.children.splice(i, 1, ...replacement)
        return true
      }
      if (visit(child)) return true
    }
    return false
  }
  return visit(root)
}

// ─── Migration ────────────────────────────────────────────────────────────────────────────────
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const log = (msg: string) => payload.logger.info(`[seo-content] ${msg}`)
  const common = { req, context, overrideAccess: true, depth: 0 } as const

  // Media alt text
  for (const [filename, [seeded, next]] of Object.entries(altText)) {
    // Payload renames a duplicate upload "about.webp" to "about-1.webp", so match those too.
    const base = filename.replace(/\.webp$/, '')
    const sameFile = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-\\d+)?\\.webp$`)
    const { docs } = await payload.find({ collection: 'media', where: { filename: { like: base } }, limit: 50, ...common })
    for (const doc of docs) {
      if (!sameFile.test(doc.filename ?? '') || doc.alt !== seeded) continue
      await payload.update({ collection: 'media', id: doc.id, data: { alt: next }, ...common })
      log(`alt text: ${filename}`)
    }
  }

  // Homepage
  const home = (await payload.findGlobal({ slug: 'home-page', ...common })) as Doc
  if (home?.hero) {
    const data: Doc = {}

    if (home.hero.titlePrefix === 'FinOracles Services Pvt. Ltd.: Wings for a Wealthy Future.') {
      data.hero = { ...home.hero, titlePrefix: 'Financial Advisor & Mutual Fund Distributor in Satara' }
    }

    const meta = changedMeta(
      home.meta,
      {
        title: 'Financial Advisor in Satara | FinOracles Services Pvt. Ltd.',
        description:
          'AMFI-registered mutual fund distributor (ARN 300933) in Satara. Goal-based financial planning, SIPs, NPS, PMS and insurance. Book a free consultation.',
      },
      {
        title: 'FinOracles Services Pvt. Ltd. | Wings for a Wealthy Future',
        description:
          'AMFI-registered mutual fund distributor in Satara. Financial planning, mutual funds, NPS, PMS and insurance with expert, goal-based guidance from FinOracles.',
      },
    )
    // Only the seeded meta is replaced; an empty homepage meta would otherwise silently gain one.
    if (meta && home.meta?.title === 'FinOracles Services Pvt. Ltd. | Wings for a Wealthy Future') data.meta = meta

    const cardLinks: Record<string, string> = {
      'Financial Planning': '/services',
      'Investment Advisory': '/products/mutual-funds',
      'Risk Management': '/products/health-insurance',
    }
    const whatWeDoItems = (home.whatWeDo?.items ?? []).map((item: Doc) =>
      !item.url && cardLinks[item.title] ? { ...item, url: cardLinks[item.title] } : item,
    )
    if (JSON.stringify(whatWeDoItems) !== JSON.stringify(home.whatWeDo?.items ?? [])) {
      data.whatWeDo = { ...home.whatWeDo, items: whatWeDoItems }
    }

    const needLinks: Record<string, string> = {
      '/contact?goal=child-future': '/products/mutual-funds',
      '/contact?goal=own-home': '/products/mutual-funds',
    }
    const needItems = (home.needs?.items ?? []).map((item: Doc) =>
      needLinks[item.url] ? { ...item, url: needLinks[item.url] } : item,
    )
    if (JSON.stringify(needItems) !== JSON.stringify(home.needs?.items ?? [])) {
      data.needs = { ...home.needs, items: needItems }
    }

    const seededPhrase = 'From investment planning to wealth optimization,'
    if (typeof home.about?.body === 'string' && home.about.body.includes(seededPhrase)) {
      data.about = {
        ...home.about,
        body: home.about.body.replace(
          seededPhrase,
          'From [investment planning](/products/mutual-funds) to [wealth optimization](/services),',
        ),
      }
    }

    const expertiseLinks: Record<string, string> = {
      'Insurance Solutions': '/products/life-insurance',
      'Money Management': '/services/client-desk',
    }
    const expertiseItems = (home.expertise?.items ?? []).map((item: Doc) =>
      !item.url && expertiseLinks[item.label] ? { ...item, url: expertiseLinks[item.label] } : item,
    )
    if (JSON.stringify(expertiseItems) !== JSON.stringify(home.expertise?.items ?? [])) {
      data.expertise = { ...home.expertise, items: expertiseItems }
    }

    // "Newsletters" card: no sign-up exists yet, and the card links nowhere.
    const resources = home.resources?.items ?? []
    const keptResources = resources.filter((item: Doc) => !(item.title === 'Newsletters' && !item.url))
    if (keptResources.length !== resources.length) data.resources = { ...home.resources, items: keptResources }

    if (Object.keys(data).length) {
      await payload.updateGlobal({ slug: 'home-page', data: data as never, ...common })
      log(`homepage: ${Object.keys(data).join(', ')}`)
    }
  }

  // Footer: "Insurance" pointed at the all-products page
  const footer = (await payload.findGlobal({ slug: 'footer', ...common })) as Doc
  if (footer?.columns?.length) {
    let changed = false
    const columns = footer.columns.map((col: Doc) => ({
      ...col,
      links: (col.links ?? []).map((l: Doc) => {
        if (l.label === 'Insurance' && l.url === '/products') {
          changed = true
          return { ...l, url: '/products/health-insurance' }
        }
        return l
      }),
    }))
    if (changed) {
      await payload.updateGlobal({ slug: 'footer', data: { columns } as never, ...common })
      log('footer: Insurance link')
    }
  }

  // Products
  for (const [slug, next] of Object.entries(products)) {
    const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1, ...common })
    const doc = docs[0] as Doc | undefined
    if (!doc) continue
    const data: Doc = {}
    const meta = changedMeta(doc.meta, next)
    if (meta) data.meta = meta
    if (!doc.relatedLinks?.length) data.relatedLinks = next.links
    if (Object.keys(data).length) {
      await payload.update({ collection: 'products', id: doc.id, data: data as never, ...common })
      log(`product ${slug}: ${Object.keys(data).join(', ')}`)
    }
  }

  // Services
  for (const [slug, next] of Object.entries(services)) {
    const { docs } = await payload.find({ collection: 'services', where: { slug: { equals: slug } }, limit: 1, ...common })
    const doc = docs[0] as Doc | undefined
    if (!doc) continue
    const data: Doc = {}
    const meta = changedMeta(doc.meta, next)
    if (meta) data.meta = meta
    if (!doc.relatedLinks?.length) data.relatedLinks = next.links
    if (next.rename && doc.title === next.rename[0]) data.title = next.rename[1]
    if (Object.keys(data).length) {
      await payload.update({ collection: 'services', id: doc.id, data: data as never, ...common })
      log(`service ${slug}: ${Object.keys(data).join(', ')}`)
    }
  }

  // Posts (published versions only; drafts are left for the editor)
  for (const [slug, next] of Object.entries(posts)) {
    const { docs } = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1, ...common })
    const doc = docs[0] as Doc | undefined
    if (!doc || doc._status !== 'published') continue
    const data: Doc = {}
    const meta = changedMeta(doc.meta, next)
    if (meta) data.meta = meta
    if (doc.content?.root) {
      const content = structuredClone(doc.content)
      const linked = next.links.filter(([phrase, url]) => linkPhrase(content.root, phrase, url))
      if (linked.length) data.content = content
    }
    if (Object.keys(data).length) {
      await payload.update({ collection: 'posts', id: doc.id, data: { ...data, _status: 'published' } as never, ...common })
      log(`post ${slug}: ${Object.keys(data).join(', ')}`)
    }
  }

  // Pages: Privacy Policy and Disclaimer
  const pages: Record<string, { meta: Meta; seeded: Meta }> = {
    'privacy-policy': {
      meta: {
        title: 'Privacy Policy | FinOracles',
        description:
          'How FinOracles Services Pvt. Ltd. collects, uses and protects the personal information you share through this website and our enquiry forms.',
      },
      seeded: {
        title: 'Privacy Policy | FinOracles',
        description: 'How FinOracles Services Pvt. Ltd. collects, uses and protects your personal information.',
      },
    },
    disclaimer: {
      meta: {
        title: 'Disclaimer & ARN 300933 Registration | FinOracles',
        description:
          'Regulatory disclaimer for FinOracles Services Pvt. Ltd., an AMFI-registered mutual fund distributor (ARN 300933). Read before you invest.',
      },
      seeded: {
        title: 'Disclaimer | FinOracles',
        description: 'Regulatory disclaimer and registration details for FinOracles Services Pvt. Ltd.',
      },
    },
  }
  for (const [slug, { meta: next, seeded }] of Object.entries(pages)) {
    const { docs } = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, ...common })
    const doc = docs[0] as Doc | undefined
    if (!doc || doc._status !== 'published') continue
    const data: Doc = {}
    const meta = changedMeta(doc.meta, next, seeded)
    if (meta) data.meta = meta
    // Disclaimer CTA: the homepage anchor became a real contact page.
    let ctaChanged = false
    const layout = (doc.layout ?? []).map((block: Doc) =>
      block.blockType !== 'cta'
        ? block
        : {
            ...block,
            links: (block.links ?? []).map((l: Doc) => {
              if (l.url !== '/#contact') return l
              ctaChanged = true
              return { ...l, url: '/contact' }
            }),
          },
    )
    if (ctaChanged) data.layout = layout
    if (Object.keys(data).length) {
      await payload.update({ collection: 'pages', id: doc.id, data: { ...data, _status: 'published' } as never, ...common })
      log(`page ${slug}: ${Object.keys(data).join(', ')}`)
    }
  }
}

/** Content-only migration: rolling back the code leaves the improved content in place. */
export async function down(_args: MigrateDownArgs): Promise<void> {}
