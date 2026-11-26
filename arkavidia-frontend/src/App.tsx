import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { LoginPage } from "@/features/auth/LoginPage"
import { TeamsPage } from "@/features/auth/TeamsPage"
import { ExplainBackPage } from "@/features/explain-back/ExplainBackPage"
import { LandingPage } from "@/features/landing/LandingPage"
import { PersonalAgentPage } from "@/features/personal-agent/PersonalAgentPage"
import { ProjectBrainPage } from "@/features/project-brain/ProjectBrainPage"
import { TeamChatPage } from "@/features/team-chat/TeamChatPage"
import { TeamHomePage } from "@/features/team-home/TeamHomePage"
import { TutoredBriefingPage } from "@/features/tutored-briefing/TutoredBriefingPage"
import { UnderstandingMapPage } from "@/features/understanding-map/UnderstandingMapPage"

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/teams" element={<TeamsPage />} />

          <Route path="/teams/:teamId" element={<AppShell />}>
            <Route index element={<Navigate to="chat" replace />} />
            <Route path="home" element={<TeamHomePage />} />
            {/* Track A — Collaboration, Chat & Memory Layer */}
            <Route path="chat" element={<TeamChatPage />} />
            <Route path="private" element={<PersonalAgentPage />} />
            <Route path="brain" element={<ProjectBrainPage />} />

            {/* Track B — Understanding, Evaluation & Onboarding Layer */}
            <Route path="understanding" element={<UnderstandingMapPage />} />
            <Route path="check" element={<ExplainBackPage />} />
            <Route path="briefing" element={<TutoredBriefingPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
