import { ArrowLeft, ShieldCheck } from 'lucide-react'

/** Below the admin login form (admin.components.afterLogin): back link and a note on access. */
export default function LoginFooter() {
  return (
    <div className="fo-login-footer">
      <p className="fo-login-footer__note">
        <ShieldCheck size={15} aria-hidden="true" />
        Authorised FinOracles staff only
      </p>
      <a className="fo-login-footer__back" href="/">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to website
      </a>
    </div>
  )
}
