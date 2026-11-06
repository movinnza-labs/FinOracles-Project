/** Login screen logo for the Payload admin (admin.components.graphics.Logo). */
export default function Logo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin graphic; next/image adds nothing here
    <img className="fo-admin-logo" src="/images/finoracles/finoracles-logo.webp" alt="FinOracles" width={240} height={79} />
  )
}
