/** Cache tags shared by the data layer (lib/queries.ts) and the CMS revalidation hooks. */
export const tags = {
  collection: (slug: string) => `collection:${slug}`,
  doc: (slug: string, docSlug: string) => `doc:${slug}:${docSlug}`,
  global: (slug: string) => `global:${slug}`,
  sitemap: 'sitemap',
}
