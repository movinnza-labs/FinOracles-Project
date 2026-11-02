/** Statutory notes shown with products, by category. */
export const complianceNotes: Record<string, string> = {
  invest: 'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.',
  protect: 'Insurance is the subject matter of solicitation. Please read the policy wording carefully before buying.',
  borrow: 'Loans are subject to the lender’s eligibility criteria, terms and conditions.',
}

export const productCategories = [
  { value: 'invest', label: 'Invest', blurb: 'Grow your wealth with disciplined, goal-based investing.' },
  { value: 'protect', label: 'Protect', blurb: 'Safeguard your family, health and assets against the unexpected.' },
  { value: 'borrow', label: 'Borrow', blurb: 'Access liquidity without breaking your long-term investments.' },
] as const
