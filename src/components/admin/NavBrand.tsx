/** Brand block at the top of the admin side navigation (admin.components.beforeNavLinks). */
export default function NavBrand() {
  return (
    <a className="fo-nav-brand" href="/admin" aria-label="FinOracles CMS dashboard">
      {/* eslint-disable-next-line @next/next/no-img-element -- admin graphic; next/image adds nothing here */}
      <img src="/images/finoracles/finoracles-logo.webp" alt="" width={150} height={50} />
      <span className="fo-nav-brand__tag">Content Manager</span>
    </a>
  )
}
