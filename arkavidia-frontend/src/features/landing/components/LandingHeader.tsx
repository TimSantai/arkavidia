import { FlaskConical, Lock, Users, Workflow, type LucideIcon } from "lucide-react"
import { FloatingNav, type FloatingNavItem } from "@/components/ui/floating-navbar"
import { NAV_LINKS } from "../landingData"

const NAV_ICONS: Readonly<Record<string, LucideIcon>> = {
  "#cara-kerja": Workflow,
  "#privasi": Lock,
  "#riset": FlaskConical,
  "#tim": Users,
}

export function LandingHeader() {
  const navItems: readonly FloatingNavItem[] = NAV_LINKS.map((item) => {
    const Icon = NAV_ICONS[item.href] ?? Workflow
    return {
      name: item.label,
      link: item.href,
      icon: <Icon className="size-4" aria-hidden="true" />,
    }
  })

  return <FloatingNav navItems={navItems} />
}
