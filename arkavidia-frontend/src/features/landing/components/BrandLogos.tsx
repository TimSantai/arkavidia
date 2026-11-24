import {
  SiClaude,
  SiFastapi,
  SiGithub,
  SiGooglegemini,
  SiNotion,
  SiPostgresql,
  SiSupabase,
  SiWhatsapp,
} from "@icons-pack/react-simple-icons"
import { RiOpenaiFill } from "react-icons/ri"
import type { EcosystemBrandId } from "../landingData"

export function BrandLogo({
  brandId,
  size = 16,
  className = "shrink-0",
}: {
  brandId: EcosystemBrandId
  size?: number
  className?: string
}) {
  switch (brandId) {
    case "chatgpt":
      return <RiOpenaiFill size={size} className={className} aria-hidden="true" />
    case "claude":
      return <SiClaude size={size} color="default" className={className} aria-hidden="true" />
    case "gemini":
      return <SiGooglegemini size={size} color="default" className={className} aria-hidden="true" />
    case "notion":
      return <SiNotion size={size} color="currentColor" className={className} aria-hidden="true" />
    case "whatsapp":
      return <SiWhatsapp size={size} color="default" className={className} aria-hidden="true" />
    case "github":
      return <SiGithub size={size} color="currentColor" className={className} aria-hidden="true" />
    case "postgresql":
      return <SiPostgresql size={size} color="default" className={className} aria-hidden="true" />
    case "supabase":
      return <SiSupabase size={size} color="default" className={className} aria-hidden="true" />
    case "fastapi":
      return <SiFastapi size={size} color="default" className={className} aria-hidden="true" />
  }
}
