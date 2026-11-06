import { ExternalLink, LogOut } from 'lucide-react'

/**
 * Top-right admin header actions on every admin screen (admin.components.actions):
 * open the public site, and log out via Payload's built-in /admin/logout route.
 */
export default function HeaderActions() {
  return (
    <div className="fo-admin-actions">
      <a className="fo-admin-action" href="/" target="_blank" rel="noopener noreferrer">
        <ExternalLink size={15} aria-hidden="true" />
        <span>View website</span>
      </a>
      <a className="fo-admin-action fo-admin-action--logout" href="/admin/logout">
        <LogOut size={15} aria-hidden="true" />
        <span>Log out</span>
      </a>
    </div>
  )
}
