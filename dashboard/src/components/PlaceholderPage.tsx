import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Construction } from "lucide-react";
import PageShell from "../layouts/PageShell";

interface PlaceholderPageProps {
  /** i18n key of the page title (also shown in the content card). */
  titleKey: string;
  /** Optional icon; defaults to a construction icon. */
  icon?: ReactNode;
}

/**
 * Generic placeholder page for menu entries whose real pages are not built yet.
 * Keeps the standard {@link PageShell} chrome; the content card just shows the
 * page title with a "coming soon" note.
 */
export default function PlaceholderPage({
  titleKey,
  icon,
}: PlaceholderPageProps) {
  const { t } = useTranslation();
  const title = t(titleKey);

  return (
    <PageShell title={title}>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <span style={{ color: "var(--fn-text-quaternary, #bfbfbf)" }}>
          {icon ?? <Construction size={48} strokeWidth={1.4} />}
        </span>
        <div style={{ fontSize: 16, fontWeight: 500 }}>{title}</div>
        <div
          style={{
            fontSize: 13,
            color: "var(--fn-text-secondary)",
          }}
        >
          {t("placeholder.comingSoon", "功能建设中，敬请期待")}
        </div>
      </div>
    </PageShell>
  );
}
