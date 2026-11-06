'use client'

import { useEffect, useState } from 'react'

const greetingFor = (date: Date) => {
  const hour = date.getHours()
  return hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
}

/**
 * Time-of-day greeting from the viewer's own clock, refreshed every minute so an open
 * dashboard moves from morning to afternoon. `initial` is the server's guess (IST), shown
 * until the browser takes over, which avoids a hydration mismatch.
 */
export function Greeting({ initial }: { initial: string }) {
  const [text, setText] = useState(initial)

  useEffect(() => {
    const update = () => setText(greetingFor(new Date()))
    update()
    const timer = setInterval(update, 60_000)
    return () => clearInterval(timer)
  }, [])

  return <>{text}</>
}
