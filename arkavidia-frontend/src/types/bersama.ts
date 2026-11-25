export type UserRole = "member" | "lead" | "lecturer"
export type RoomType = "team" | "private"
export type MemoryItemType = "decision" | "task" | "rationale" | "note"
export type MemoryScope = "private" | "team" | "course"
export type MemorySensitivity = "normal" | "pii"
export type MemoryStatus = "proposed" | "confirmed" | "superseded"
export type EdgeKind =
  | "supersedes"
  | "depends_on"
  | "about_kc"
  | "owned_by"
  | "conflicts_with"
export type BloomLevel = "understand" | "apply" | "analyze" | "evaluate"
export type GradedBy = "ai" | "peer"

export interface User {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly initials: string
  readonly avatarUrl?: string
  readonly role: UserRole
  readonly moduleFocus?: string
}

export interface Team {
  readonly id: string
  readonly name: string
  readonly courseCode: string
  readonly description: string
  readonly inviteCode: string
  readonly members: readonly User[]
  readonly createdAt: string
}

export interface CitationRef {
  readonly id: string
  readonly label: string
  readonly sourceMessageId: string
  readonly memoryItemId?: string
  readonly excerpt: string
}

export interface ChatMessage {
  readonly id: string
  readonly teamId: string
  readonly room: RoomType
  readonly authorId: string
  readonly authorName: string
  readonly isAgent: boolean
  readonly agentKind?: "team" | "personal"
  readonly body: string
  readonly createdAt: string
  readonly scope: MemoryScope
  readonly citations?: readonly CitationRef[]
  readonly proposedMemoryId?: string
  readonly policyBlocked?: boolean
  readonly taintedPrivate?: boolean
}

export interface MemoryItemContent {
  readonly title: string
  readonly summary: string
  readonly rationale: string
  readonly rejectedAlternatives: readonly string[]
  readonly assigneeId?: string
  readonly dueDate?: string
}

export interface MemoryItem {
  readonly id: string
  readonly code: string
  readonly teamId: string
  readonly type: MemoryItemType
  readonly content: MemoryItemContent
  readonly ownerId: string
  readonly scope: MemoryScope
  readonly sensitivity: MemorySensitivity
  readonly status: MemoryStatus
  readonly aiAssisted: boolean
  readonly provenance: string
  readonly kcIds: readonly string[]
  readonly sourceMessageIds: readonly string[]
  readonly validFrom: string
  readonly validTo: string | null
  readonly recordedAt: string
  readonly supersedesId?: string
}

export interface MemoryEdge {
  readonly id: string
  readonly src: string
  readonly dst: string
  readonly kind: EdgeKind
}

export interface KnowledgeComponent {
  readonly id: string
  readonly teamId: string
  readonly code: string
  readonly name: string
  readonly description: string
  readonly criticality: "high" | "medium" | "low"
}

export interface ExplainBackQuestion {
  readonly id: string
  readonly kcId: string
  readonly itemId: string
  readonly decisionCode: string
  readonly prompt: string
  readonly bloomLevel: BloomLevel
  readonly irtA: number
  readonly irtB: number
  readonly aiAssistedContext: boolean
  readonly estimatedSeconds: number
  readonly rubricPoints: readonly string[]
  readonly decisionAuthorId: string
}

export interface CheckAttempt {
  readonly id: string
  readonly userId: string
  readonly questionId: string
  readonly answer: string
  readonly inputMode: "text" | "voice"
  readonly grade: 0 | 1 | 2 | null
  readonly gradeLabel: "belum" | "sebagian" | "paham" | "abstain"
  readonly uncertainty: number
  readonly abstained: boolean
  readonly gradedBy: GradedBy
  readonly feedback: string
  readonly assignedPeerId?: string
  readonly createdAt: string
}

export interface MasteryRecord {
  readonly userId: string
  readonly kcId: string
  readonly pMastery: number
  readonly lastEvidenceAt: string
}

export interface KcCoverageSummary {
  readonly kc: KnowledgeComponent
  readonly understoodCount: number
  readonly totalMembers: number
  readonly averageMastery: number
  readonly isSilo: boolean
  readonly experts: readonly User[]
  readonly needsSupport: readonly User[]
}

export interface PairingSuggestion {
  readonly id: string
  readonly kcId: string
  readonly kcName: string
  readonly mentor: User
  readonly learner: User
  readonly durationMinutes: number
  readonly projectedCoverageBefore: string
  readonly projectedCoverageAfter: string
  readonly reason: string
}

export interface TeamUnderstandingMetrics {
  readonly teamId: string
  readonly masteryThreshold: number
  readonly busFactor: number
  readonly giniCoefficient: number
  readonly overallCoveragePercent: number
  readonly coverageByKc: readonly KcCoverageSummary[]
  readonly pairingSuggestions: readonly PairingSuggestion[]
  readonly masteryMatrix: readonly MasteryRecord[]
}

export interface PiiMatch {
  readonly kind: "phone" | "email" | "nik" | "name"
  readonly original: string
  readonly redacted: string
}

export interface PassportPreview {
  readonly sourceMessageId: string
  readonly originalText: string
  readonly redactedSummary: string
  readonly detectedPii: readonly PiiMatch[]
  readonly suggestedTitle: string
  readonly suggestedRationale: string
  readonly targetKcId: string
}

export interface BriefingStep {
  readonly id: string
  readonly order: number
  readonly kcId: string
  readonly decisionCode: string
  readonly tutorPrompt: string
  readonly hint: string
  readonly expectedConcept: string
  readonly completed: boolean
}
