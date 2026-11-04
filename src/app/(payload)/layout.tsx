/* Payload admin root layout. Generated structure from the Payload blank template. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { Plus_Jakarta_Sans } from 'next/font/google'
import type React from 'react'
import { importMap } from './admin/importMap.js'
import './custom.css'

type Args = { children: React.ReactNode }

// Same typeface as the public site, exposed to custom.css as --font-jakarta.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} htmlProps={{ className: jakarta.variable }} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
