import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ClipboardCheck,
  Gauge,
  GraduationCap,
  LayoutGrid,
  MessagesSquare,
  ShieldCheck,
  Timer,
} from "lucide-react";
import PageShell from "../../layouts/PageShell";
import { useUserRole } from "../../hooks/useUserRole";

interface WorkplaceCardDef {
  key: string;
  icon: ReactNode;
}

// Placeholder blocks; replaced by real widgets when the data is available.
const ADMIN_CARDS: WorkplaceCardDef[] = [
  { key: "systemStatus", icon: <Activity size={16} /> },
  { key: "pendingApprovals", icon: <ClipboardCheck size={16} /> },
  { key: "resourceUsage", icon: <Gauge size={16} /> },
  { key: "securityOverview", icon: <ShieldCheck size={16} /> },
];

const USER_CARDS: WorkplaceCardDef[] = [
  { key: "myTasks", icon: <Timer size={16} /> },
  { key: "myExperts", icon: <GraduationCap size={16} /> },
  { key: "recentChats", icon: <MessagesSquare size={16} /> },
  { key: "quickAccess", icon: <LayoutGrid size={16} /> },
];

function WorkplaceCard({ card }: { card: WorkplaceCardDef }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        border: "1px solid var(--fn-border-secondary, var(--fn-border-color))",
        borderRadius: 8,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 140,
        background: "var(--fn-bg-container)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <span style={{ color: "var(--fn-text-tertiary)" }}>{card.icon}</span>
        {t(`workplace.cards.${card.key}`)}
      </div>
      {/* Static placeholder rows. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 10,
              borderRadius: 4,
              background: "var(--fn-fill-quaternary, rgba(0,0,0,0.06))",
              width: i === 0 ? "60%" : i === 1 ? "90%" : "40%",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 工作台 — role-aware landing page. The cards are static placeholders;
 * admins and regular users see different sections by design.
 */
export default function Workplace() {
  const { t } = useTranslation();
  const role = useUserRole();
  const isAdmin = role === "admin";
  const cards = isAdmin ? ADMIN_CARDS : USER_CARDS;

  return (
    <PageShell title={t("nav.home")}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 13, color: "var(--fn-text-secondary)" }}>
          {t(isAdmin ? "workplace.adminGreeting" : "workplace.userGreeting")}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {cards.map((card) => (
            <WorkplaceCard key={card.key} card={card} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
