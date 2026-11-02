import {
  Award,
  BadgeCheck,
  Briefcase,
  Calculator,
  Car,
  ChartColumn,
  ChartLine,
  ChartPie,
  CircleCheck,
  CirclePlay,
  ClipboardList,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  HeartPulse,
  House,
  Images,
  Info,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  Lock,
  type LucideIcon,
  type LucideProps,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  PiggyBank,
  Plane,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sprout,
  Target,
  TrendingUp,
  Trophy,
  Umbrella,
  Users,
  Wallet,
} from 'lucide-react'
import type { IconName } from '@/lib/iconNames'

const icons: Record<IconName, LucideIcon> = {
  award: Award,
  'badge-check': BadgeCheck,
  briefcase: Briefcase,
  calculator: Calculator,
  car: Car,
  'chart-column': ChartColumn,
  'chart-line': ChartLine,
  'chart-pie': ChartPie,
  'circle-check': CircleCheck,
  'circle-play': CirclePlay,
  'clipboard-list': ClipboardList,
  clock: Clock,
  compass: Compass,
  'file-text': FileText,
  'graduation-cap': GraduationCap,
  'hand-coins': HandCoins,
  'heart-handshake': HeartHandshake,
  'heart-pulse': HeartPulse,
  house: House,
  images: Images,
  info: Info,
  landmark: Landmark,
  'layout-dashboard': LayoutDashboard,
  'life-buoy': LifeBuoy,
  lightbulb: Lightbulb,
  lock: Lock,
  mail: Mail,
  'map-pin': MapPin,
  newspaper: Newspaper,
  phone: Phone,
  'piggy-bank': PiggyBank,
  plane: Plane,
  'refresh-cw': RefreshCw,
  'shield-check': ShieldCheck,
  smartphone: Smartphone,
  sprout: Sprout,
  target: Target,
  'trending-up': TrendingUp,
  trophy: Trophy,
  umbrella: Umbrella,
  users: Users,
  wallet: Wallet,
}

type IconProps = LucideProps & { icon?: string | null; fallback?: IconName }

/** Renders a CMS icon key as a decorative Lucide icon. */
export function Icon({ icon, fallback = 'circle-check', ...props }: IconProps) {
  const Component = icons[(icon as IconName) ?? fallback] ?? icons[fallback]
  return <Component aria-hidden focusable={false} {...props} />
}

export function IconTile({ name, fallback }: { name?: string | null; fallback?: IconName }) {
  return (
    <span className="icon-tile">
      <Icon icon={name} fallback={fallback} />
    </span>
  )
}
