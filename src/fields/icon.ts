import type { SelectField } from 'payload'
import { iconOptions } from '../lib/iconNames'

export const iconField = (overrides: Partial<SelectField> = {}): SelectField =>
  ({
    name: 'icon',
    type: 'select',
    options: iconOptions,
    admin: { description: 'Line icon shown with this item.' },
    ...overrides,
  }) as SelectField
