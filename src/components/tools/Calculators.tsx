'use client'

import Link from 'next/link'
import { useId, useMemo, useState } from 'react'
import { ArrowRight, Info } from 'lucide-react'
import styles from './Calculators.module.css'

type Mode = 'sip' | 'lumpsum' | 'goal'

const tabs: { value: Mode; label: string }[] = [
  { value: 'sip', label: 'SIP Calculator' },
  { value: 'lumpsum', label: 'Lumpsum Calculator' },
  { value: 'goal', label: 'Goal Planner' },
]

const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Math.max(0, Math.round(n)),
  )

/** "₹12.5 lakh" style summary for large amounts. */
const inWords = (n: number) => {
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} crore`
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} lakh`
  return ''
}

// Future value of a monthly SIP (payments at the start of each month).
const sipFutureValue = (monthly: number, annualRate: number, years: number) => {
  const i = annualRate / 12 / 100
  const n = years * 12
  if (i === 0) return monthly * n
  return monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)
}

type SliderProps = {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  format: (v: number) => string
}

function Slider({ label, value, onChange, min, max, step, format }: SliderProps) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  // Text being typed; clamped only on blur so "2000" can be typed digit by digit.
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => {
    if (draft === null) return
    const v = Number(draft)
    onChange(draft.trim() === '' || Number.isNaN(v) ? value : Math.min(max, Math.max(min, v)))
    setDraft(null)
  }
  return (
    <div className={styles.slider}>
      <div className={styles.sliderHead}>
        <label htmlFor={id}>{label}</label>
        <input
          type="number"
          aria-label={`${label} value`}
          value={draft ?? value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            setDraft(e.target.value)
            const v = Number(e.target.value)
            if (e.target.value !== '' && v >= min && v <= max) onChange(v)
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
          }}
          className={styles.number}
        />
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          setDraft(null)
          onChange(Number(e.target.value))
        }}
        style={{ '--fill': `${pct}%` } as React.CSSProperties}
        aria-valuetext={format(value)}
      />
      <div className={styles.range}>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

export function Calculators() {
  const [mode, setMode] = useState<Mode>('sip')
  const baseId = useId()

  // SIP
  const [monthly, setMonthly] = useState(5000)
  const [sipRate, setSipRate] = useState(12)
  const [sipYears, setSipYears] = useState(10)
  // Lumpsum
  const [amount, setAmount] = useState(100000)
  const [lumpRate, setLumpRate] = useState(12)
  const [lumpYears, setLumpYears] = useState(10)
  // Goal
  const [goalToday, setGoalToday] = useState(2500000)
  const [goalYears, setGoalYears] = useState(15)
  const [goalRate, setGoalRate] = useState(12)
  const [inflation, setInflation] = useState(6)

  const result = useMemo(() => {
    if (mode === 'sip') {
      const total = sipFutureValue(monthly, sipRate, sipYears)
      const invested = monthly * sipYears * 12
      return { invested, gains: total - invested, total, label: 'Estimated value' }
    }
    if (mode === 'lumpsum') {
      const total = amount * Math.pow(1 + lumpRate / 100, lumpYears)
      return { invested: amount, gains: total - amount, total, label: 'Estimated value' }
    }
    const futureGoal = goalToday * Math.pow(1 + inflation / 100, goalYears)
    const perRupee = sipFutureValue(1, goalRate, goalYears)
    const sip = perRupee > 0 ? futureGoal / perRupee : 0
    const invested = sip * goalYears * 12
    return { invested, gains: futureGoal - invested, total: futureGoal, label: 'Goal value after inflation', sip }
  }, [mode, monthly, sipRate, sipYears, amount, lumpRate, lumpYears, goalToday, goalYears, goalRate, inflation])

  const investedPct = result.total > 0 ? Math.min(100, (result.invested / result.total) * 100) : 0
  const pctFmt = (v: number) => `${v}%`
  const yrFmt = (v: number) => `${v} yr`
  const moneyFmt = (v: number) => inr(v)

  return (
    <div className={styles.calc}>
      <div role="tablist" aria-label="Calculators" className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.value}
            id={`${baseId}-${t.value}`}
            type="button"
            role="tab"
            aria-selected={mode === t.value}
            aria-controls={`${baseId}-panel`}
            className={styles.tab}
            onClick={() => setMode(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-${mode}`} className={styles.body}>
        <div className={styles.inputs}>
          {mode === 'sip' && (
            <>
              <Slider label="Monthly investment" value={monthly} onChange={setMonthly} min={500} max={200000} step={500} format={moneyFmt} />
              <Slider label="Expected return (p.a.)" value={sipRate} onChange={setSipRate} min={1} max={20} step={0.5} format={pctFmt} />
              <Slider label="Time period" value={sipYears} onChange={setSipYears} min={1} max={40} step={1} format={yrFmt} />
            </>
          )}
          {mode === 'lumpsum' && (
            <>
              <Slider label="One-time investment" value={amount} onChange={setAmount} min={5000} max={10000000} step={5000} format={moneyFmt} />
              <Slider label="Expected return (p.a.)" value={lumpRate} onChange={setLumpRate} min={1} max={20} step={0.5} format={pctFmt} />
              <Slider label="Time period" value={lumpYears} onChange={setLumpYears} min={1} max={40} step={1} format={yrFmt} />
            </>
          )}
          {mode === 'goal' && (
            <>
              <Slider label="Goal amount (today's value)" value={goalToday} onChange={setGoalToday} min={100000} max={50000000} step={50000} format={moneyFmt} />
              <Slider label="Years to goal" value={goalYears} onChange={setGoalYears} min={1} max={40} step={1} format={yrFmt} />
              <Slider label="Expected return (p.a.)" value={goalRate} onChange={setGoalRate} min={1} max={20} step={0.5} format={pctFmt} />
              <Slider label="Expected inflation (p.a.)" value={inflation} onChange={setInflation} min={0} max={12} step={0.5} format={pctFmt} />
            </>
          )}
        </div>

        <div className={styles.result} aria-live="polite">
          {mode === 'goal' && 'sip' in result ? (
            <>
              <p className={styles.resultLabel}>Monthly SIP needed</p>
              <p className={styles.resultValue}>{inr(result.sip ?? 0)}</p>
              <p className={styles.resultSub}>
                to reach {inr(result.total)}
                {inWords(result.total) && ` (₹${inWords(result.total)})`} in {goalYears} years
              </p>
            </>
          ) : (
            <>
              <p className={styles.resultLabel}>{result.label}</p>
              <p className={styles.resultValue}>{inr(result.total)}</p>
              {inWords(result.total) && <p className={styles.resultSub}>≈ ₹{inWords(result.total)}</p>}
            </>
          )}

          <div className={styles.bar} aria-hidden>
            <span style={{ width: `${investedPct}%` }} />
          </div>
          <dl className={styles.breakdown}>
            <div>
              <dt>
                <i className={styles.dotInvested} /> Amount invested
              </dt>
              <dd>{inr(result.invested)}</dd>
            </div>
            <div>
              <dt>
                <i className={styles.dotGains} /> Estimated returns
              </dt>
              <dd>{inr(result.gains)}</dd>
            </div>
          </dl>

          <Link href="/contact?interest=Mutual%20Funds" className="btn btn--primary">
            Start Investing with Us <ArrowRight aria-hidden />
          </Link>
          <p className={styles.note}>
            <Info aria-hidden />
            Illustration only, based on the assumed rate of return you choose. Returns are not guaranteed; mutual fund
            investments are subject to market risks.
          </p>
        </div>
      </div>
    </div>
  )
}
