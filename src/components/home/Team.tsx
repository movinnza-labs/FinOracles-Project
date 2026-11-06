import Image from 'next/image'
import type { HomePage, TeamMember } from '@/types/content'
import { SectionHead } from '@/components/ui/SectionHead'
import { getImage } from '@/lib/media'
import styles from './Team.module.css'

export function Team({ data, members }: { data: HomePage['team']; members: TeamMember[] }) {
  if (!data?.enabled || !members.length) return null
  const leader = members.find((m) => m.isLeader)
  const others = members.filter((m) => m !== leader)
  const leaderPhoto = leader ? getImage(leader.photo) : null

  return (
    <section className="section section--tinted" aria-labelledby="team">
      <div className="container">
        <SectionHead id="team" heading={data.heading} lead={data.lead} />
        <div className={leader ? styles.layout : undefined}>
          {leader && (
            <article className={`${styles.leader} reveal`}>
              {leaderPhoto && (
                <Image src={leaderPhoto.src} alt={leader.name} width={leaderPhoto.width} height={leaderPhoto.height} sizes="(max-width: 767px) 140px, 300px" />
              )}
              <div>
                <h3 className="h4">{leader.name}</h3>
                <p>{leader.role}</p>
              </div>
            </article>
          )}
          <ul role="list" className={styles.team}>
            {others.map((m) => {
              const photo = getImage(m.photo, 'card')
              return (
                <li key={m.id} className="reveal">
                  {photo && <Image src={photo.src} alt={m.name} width={photo.width} height={photo.height} sizes="(max-width: 767px) 45vw, (max-width: 1279px) 22vw, 180px" />}
                  <h3 className="h5">{m.name}</h3>
                  <p>{m.role}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
