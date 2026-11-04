/** Compact brand mark for the admin nav and breadcrumbs (admin.components.graphics.Icon). Same mark as app/icon.svg, in the logo red. */
export default function Icon() {
  return (
    <svg className="fo-admin-icon" viewBox="0 0 64 64" width="28" height="28" aria-label="FinOracles" role="img">
      <rect width="64" height="64" rx="14" fill="#c82c24" />
      <path d="M20 46V18h24v6H27v6h14v6H27v10z" fill="#fff" />
      <path d="M38 40l8-8v14h-8z" fill="#fae4e2" />
    </svg>
  )
}
