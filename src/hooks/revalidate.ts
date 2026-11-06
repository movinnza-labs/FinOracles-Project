import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'
import { revalidateTag } from 'next/cache'
import { tags } from '../lib/cacheTags'

const expire = (tag: string) => {
  try {
    revalidateTag(tag, { expire: 0 })
  } catch {
    // Outside the Next.js runtime (seed script, CLI) there is no cache to expire.
  }
}

/**
 * Every CMS write expires the matching cache tags used by lib/queries.ts so the
 * public site reflects edits immediately.
 */
export const revalidateCollection: CollectionAfterChangeHook = ({ collection, doc, previousDoc, req }) => {
  if (req.context?.disableRevalidate) return doc
  expire(tags.collection(collection.slug))
  expire(tags.sitemap)
  for (const slug of new Set([doc?.slug, previousDoc?.slug])) {
    if (typeof slug === 'string') expire(tags.doc(collection.slug, slug))
  }
  return doc
}

export const revalidateCollectionDelete: CollectionAfterDeleteHook = ({ collection, doc, req }) => {
  if (req.context?.disableRevalidate) return doc
  expire(tags.collection(collection.slug))
  expire(tags.sitemap)
  if (typeof doc?.slug === 'string') expire(tags.doc(collection.slug, doc.slug))
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ global, doc, req }) => {
  if (req.context?.disableRevalidate) return doc
  expire(tags.global(global.slug))
  return doc
}
