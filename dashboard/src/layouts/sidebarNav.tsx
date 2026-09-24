import type { ReactNode } from "react";
import {
  MessageSquareText,
  Timer,
  SlidersHorizontal,
  Waypoints,
  Link2,
  Database,
  Cpu,
  Users as UsersIcon,
  Activity,
  Sparkles,
  Puzzle,
  HardDrive,
  GraduationCap,
  Shield,
  Notebook,
  LayoutDashboard,
  ClipboardCheck,
  ScrollText,
} from "lucide-react";
import type { OctopUser } from "../api/modules/auth";
import { navAllowed } from "../utils/permissions";

export const EXPANDED_WIDTH = 220;
export const COLLAPSED_WIDTH = 56;

const iconSize = 16;
const iconStroke = 1.8;

export interface NavItem {
  key: string;
  path: string;
  icon: ReactNode;
  labelKey: string;
  badge?: string;
}

export interface NavSection {
  /** When omitted, items render flat without a group header. */
  groupKey?: string;
  items: NavItem[];
}

/**
 * Catalog of nav item keys that live under settings / control / admin groups.
 * Permission-independent — used for pane/route helpers; visibility still
 * comes from {@link buildNavSections}.
 */
export const SIDEBAR_GROUPED_NAV_KEYS = [
  "channels",
  "knowledge-bases",
  "workbench",
  "remote-desktop",
  "acp",
  "admin-users",
  "models",
  "admin-storage",
  "admin-plugins",
  "admin-security",
  "admin-advanced",
  "agent-config",
  // AI-MOM navigation
  "token-usage",
  "approvals",
  "decisions",
  "settings-skills",
  "settings-memory",
] as const;

const GROUPED_NAV_KEY_SET = new Set<string>(SIDEBAR_GROUPED_NAV_KEYS);

export function isGroupedNavKey(key: string): boolean {
  return GROUPED_NAV_KEY_SET.has(key);
}

export function buildNavSections(
  user: OctopUser | null,
  _opts?: { mobileEnabled?: boolean },
): NavSection[] {
  // Primary (flat) entries.
  const sections: NavSection[] = [
    {
      items: [
        {
          key: "home",
          path: "/home",
          icon: <LayoutDashboard size={iconSize} strokeWidth={iconStroke} />,
          labelKey: "nav.home",
        },
        {
          key: "chat",
          path: "/chat",
          icon: <MessageSquareText size={iconSize} strokeWidth={iconStroke} />,
          labelKey: "nav.chat",
        },
        {
          key: "experts",
          path: "/experts",
          icon: <GraduationCap size={iconSize} strokeWidth={iconStroke} />,
          labelKey: "nav.experts",
        },
      ],
    },
  ];

  // Keep the existing permission gate: users without the connectors module
  // would only hit the route guard otherwise.
  if (navAllowed(user, "connectors")) {
    sections[0].items.push({
      key: "connectors",
      path: "/connectors",
      icon: <Link2 size={iconSize} strokeWidth={iconStroke} />,
      labelKey: "nav.connectors",
    });
  }
  sections[0].items.push({
    key: "tasks",
    path: "/tasks",
    icon: <Timer size={iconSize} strokeWidth={iconStroke} />,
    labelKey: "nav.tasks",
  });

  // 更多 — approvals / decisions / usage.
  sections.push({
    groupKey: "nav.more",
    items: [
      {
        key: "approvals",
        path: "/approvals",
        icon: <ClipboardCheck size={iconSize} strokeWidth={iconStroke} />,
        labelKey: "nav.approvals",
      },
      {
        key: "decisions",
        path: "/decisions",
        icon: <ScrollText size={iconSize} strokeWidth={iconStroke} />,
        labelKey: "nav.decisions",
      },
      {
        key: "token-usage",
        path: "/token-usage",
        icon: <Activity size={iconSize} strokeWidth={iconStroke} />,
        labelKey: "nav.tokenUsage",
      },
    ],
  });

  // 设置 — 通道 / 技能 / 记忆 / 知识库.
  const settingsItems: NavItem[] = [];
  if (navAllowed(user, "channels")) {
    settingsItems.push({
      key: "channels",
      path: "/personalization/channels",
      icon: <Waypoints size={iconSize} strokeWidth={iconStroke} />,
      labelKey: "nav.channels",
    });
  }
  // Skills/memory tabs have no module gate in Personalization; neither do these.
  settingsItems.push({
    key: "settings-skills",
    path: "/personalization/skills",
    icon: <Sparkles size={iconSize} strokeWidth={iconStroke} />,
    labelKey: "nav.skills",
  });
  settingsItems.push({
    key: "settings-memory",
    path: "/personalization/memory",
    icon: <Notebook size={iconSize} strokeWidth={iconStroke} />,
    labelKey: "nav.memory",
  });
  if (navAllowed(user, "knowledge-bases")) {
    settingsItems.push({
      key: "knowledge-bases",
      path: "/knowledge-bases",
      icon: <Database size={iconSize} strokeWidth={iconStroke} />,
      labelKey: "nav.knowledgeBases",
    });
  }
  if (settingsItems.length > 0) {
    sections.push({ groupKey: "nav.settings", items: settingsItems });
  }

  // 管理 — unchanged permission gates and routes.
  const adminItems: NavItem[] = [];
  if (navAllowed(user, "admin-users")) {
    adminItems.push({
      key: "admin-users",
      path: "/admin/users",
      icon: <UsersIcon size={iconSize} strokeWidth={iconStroke} />,
      labelKey: "nav.adminUsers",
    });
  }
  if (navAllowed(user, "models")) {
    adminItems.push({
      key: "models",
      path: "/admin/models",
      icon: <Cpu size={iconSize} strokeWidth={iconStroke} />,
      labelKey: "nav.models",
    });
  }
  if (navAllowed(user, "admin-storage")) {
    adminItems.push({
      key: "admin-storage",
      path: "/admin/backend",
      icon: <HardDrive size={iconSize} strokeWidth={iconStroke} />,
      labelKey: "nav.adminStorage",
    });
  }
  if (navAllowed(user, "admin-plugins")) {
    adminItems.push({
      key: "admin-plugins",
      path: "/admin/plugins",
      icon: <Puzzle size={iconSize} strokeWidth={iconStroke} />,
      labelKey: "nav.adminPlugins",
    });
  }
  if (navAllowed(user, "admin-security")) {
    adminItems.push({
      key: "admin-security",
      path: "/admin/security",
      icon: <Shield size={iconSize} strokeWidth={iconStroke} />,
      labelKey: "nav.security",
    });
  }
  if (navAllowed(user, "admin-advanced")) {
    adminItems.push({
      key: "admin-advanced",
      path: "/admin/advanced",
      icon: <SlidersHorizontal size={iconSize} strokeWidth={iconStroke} />,
      labelKey: "nav.adminAdvanced",
    });
  }
  if (adminItems.length > 0) {
    sections.push({ groupKey: "nav.admin", items: adminItems });
  }
  return sections;
}

// 控制 group (工作台/远程桌面/ACP) intentionally no longer rendered.
// The /workbench, /remote-desktop and /acp routes and pages remain
// reachable by URL; only the menu entries are hidden.
