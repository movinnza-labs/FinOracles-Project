import type { ServerProps } from 'payload'
import {
  ArrowUpRight,
  BellRing,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  House,
  ImagePlus,
  Inbox,
  MessageSquareText,
  Package,
  PenSquare,
  Settings,
  UserPlus,
  Users,
} from 'lucide-react'
import { Greeting } from './Greeting'

const ADMIN = '/admin'

const greeting = () => {
  const hour = Number(
    new Intl.DateTimeFormat('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()),
  )
  return hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
}

// Matches the status options in collections/Enquiries.ts.
const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  'in-progress': 'Contacted',
  converted: 'Converted',
  closed: 'Closed',
}

const formatToday = () =>
  new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(
    new Date(),
  )

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(
    new Date(iso),
  )

/**
 * Branded overview above Payload's collection cards (admin.components.beforeDashboard):
 * live counts, new leads and quick actions (logout lives in HeaderActions on every screen).
 * Queries run with the viewer's access.
 */
export default async function DashboardWelcome({ payload, user }: ServerProps) {
  if (!user) return null
  const asUser = { overrideAccess: false, user } as const

  const [newLeads, leads, posts, products, services, team, recent] = await Promise.all([
    payload.count({ collection: 'enquiries', where: { status: { equals: 'new' } }, ...asUser }),
    payload.count({ collection: 'enquiries', ...asUser }),
    payload.count({ collection: 'posts', ...asUser }),
    payload.count({ collection: 'products', ...asUser }),
    payload.count({ collection: 'services', ...asUser }),
    payload.count({ collection: 'team-members', ...asUser }),
    payload.find({
      collection: 'enquiries',
      sort: '-createdAt',
      limit: 5,
      depth: 0,
      select: { name: true, phone: true, interest: true, status: true, createdAt: true },
      ...asUser,
    }),
  ])

  const name = (user as { name?: string | null }).name || user.email
  const hasNewLeads = newLeads.totalDocs > 0
  const stats = [
    { label: 'New enquiries', value: newLeads.totalDocs, href: `${ADMIN}/collections/enquiries?where[status][equals]=new`, icon: BellRing, tone: 'red' },
    { label: 'All enquiries', value: leads.totalDocs, href: `${ADMIN}/collections/enquiries`, icon: Inbox, tone: 'charcoal' },
    { label: 'Blog posts', value: posts.totalDocs, href: `${ADMIN}/collections/posts`, icon: BookOpen, tone: 'grey' },
    { label: 'Products', value: products.totalDocs, href: `${ADMIN}/collections/products`, icon: Package, tone: 'red' },
    { label: 'Services', value: services.totalDocs, href: `${ADMIN}/collections/services`, icon: BriefcaseBusiness, tone: 'charcoal' },
    { label: 'Team members', value: team.totalDocs, href: `${ADMIN}/collections/team-members`, icon: Users, tone: 'grey' },
  ]
  const actions = [
    { label: 'Write a blog post', hint: 'Publish news & insights', href: `${ADMIN}/collections/posts/create`, icon: PenSquare },
    { label: 'Edit homepage', hint: 'Hero, sections & stats', href: `${ADMIN}/globals/home-page`, icon: House },
    { label: 'Add a product', hint: 'Mutual funds, insurance…', href: `${ADMIN}/collections/products/create`, icon: Package },
    { label: 'Add team member', hint: 'Photo, role & bio', href: `${ADMIN}/collections/team-members/create`, icon: UserPlus },
    { label: 'Upload images', hint: 'Media library', href: `${ADMIN}/collections/media/create`, icon: ImagePlus },
    { label: 'Site settings', hint: 'Contact, SEO & socials', href: `${ADMIN}/globals/site-settings`, icon: Settings },
  ]

  return (
    <section className="fo-dash" aria-label="Overview">
      <div className="fo-dash__hero">
        <div className="fo-dash__hero-text">
          <p className="fo-dash__eyebrow">
            <CalendarDays size={14} aria-hidden="true" />
            {formatToday()}
          </p>
          <h1 className="fo-dash__title">
            <Greeting initial={greeting()} />, {name}
          </h1>
          <p className="fo-dash__lead">Manage your website content, products and incoming leads from one place.</p>
        </div>
        <a
          className={`fo-btn ${hasNewLeads ? 'fo-btn--red' : 'fo-btn--light'}`}
          href={`${ADMIN}/collections/enquiries${hasNewLeads ? '?where[status][equals]=new' : ''}`}
        >
          <Inbox size={16} aria-hidden="true" />
          {hasNewLeads ? `${newLeads.totalDocs} new ${newLeads.totalDocs === 1 ? 'enquiry' : 'enquiries'}` : 'Open enquiries'}
        </a>
      </div>

      <div className="fo-dash__stats">
        {stats.map(({ label, value, href, icon: StatIcon, tone }) => (
          <a key={label} href={href} className={`fo-stat fo-stat--${tone}`}>
            <span className="fo-stat__top">
              <span className="fo-stat__chip">
                <StatIcon size={18} aria-hidden="true" />
              </span>
              <ArrowUpRight size={16} aria-hidden="true" className="fo-stat__arrow" />
            </span>
            <span className="fo-stat__value">{value}</span>
            <span className="fo-stat__label">{label}</span>
          </a>
        ))}
      </div>

      <div className="fo-dash__grid">
        <div className="fo-panel">
          <h2 className="fo-panel__title">Quick actions</h2>
          <div className="fo-quick">
            {actions.map(({ label, hint, href, icon: ActionIcon }) => (
              <a key={label} href={href} className="fo-quick__item">
                <span className="fo-quick__icon">
                  <ActionIcon size={18} aria-hidden="true" />
                </span>
                <span className="fo-quick__text">
                  <span className="fo-quick__label">{label}</span>
                  <span className="fo-quick__hint">{hint}</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="fo-panel">
          <div className="fo-panel__head">
            <h2 className="fo-panel__title">Latest enquiries</h2>
            <a href={`${ADMIN}/collections/enquiries`} className="fo-panel__link">
              View all
            </a>
          </div>
          {recent.docs.length === 0 ? (
            <div className="fo-empty">
              <span className="fo-empty__icon">
                <MessageSquareText size={22} aria-hidden="true" />
              </span>
              <p className="fo-empty__title">No enquiries yet</p>
              <p className="fo-empty__text">Leads from the website contact forms will appear here.</p>
              <a className="fo-panel__link" href="/contact" target="_blank" rel="noopener noreferrer">
                Open the contact page
              </a>
            </div>
          ) : (
            <ul className="fo-leads">
              {recent.docs.map((lead) => (
                <li key={lead.id}>
                  <a href={`${ADMIN}/collections/enquiries/${lead.id}`} className="fo-lead">
                    <span className="fo-lead__name">{lead.name}</span>
                    <span className="fo-lead__meta">
                      {lead.phone}
                      {lead.interest ? ` · ${lead.interest}` : ''} · {formatDate(lead.createdAt)}
                    </span>
                    <span className={`fo-badge fo-badge--${lead.status ?? 'new'}`}>
                      {STATUS_LABELS[lead.status ?? 'new']}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
