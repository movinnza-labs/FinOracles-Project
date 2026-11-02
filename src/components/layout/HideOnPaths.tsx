'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** Renders children except on the given paths (lets server layouts vary by route). */
export function HideOnPaths({ paths, children }: { paths: string[]; children: ReactNode }) {
  const pathname = usePathname()
  return paths.includes(pathname) ? null : children
}
