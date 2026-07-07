import { Link, useSearchParams } from "react-router";
import {
  ACTIVITIES_TABS,
  DEFAULT_ACTIVITIES_TAB,
  activitiesPath,
} from "@/shared/constants/routes";

const LABEL: Record<(typeof ACTIVITIES_TABS)[number], string> = {
  recent: "최근 작성한 댓글",
  liked: "좋아요한 댓글",
  viewed: "최근 본 기사",
};

function useActiveTab() {
  const [sp] = useSearchParams();
  const current = (sp.get("tab") ??
    DEFAULT_ACTIVITIES_TAB) as (typeof ACTIVITIES_TABS)[number];
  return (ACTIVITIES_TABS as readonly string[]).includes(current)
    ? current
    : DEFAULT_ACTIVITIES_TAB;
}

export default function ActivitiesTabs() {
  const active = useActiveTab();

  return (
    <nav aria-label="활동내역 탭" className="min-h-[66px] w-full min-w-0">
      {/* 활동내역 탭을 랭킹 패널의 전환 버튼 톤으로 통일 */}
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#f3efe8] p-1">
        {ACTIVITIES_TABS.map((tab) => {
          const isActive = active === tab;
          return (
            <Link
              key={tab}
              to={activitiesPath(tab)}
              aria-current={isActive ? "page" : undefined}
              className={[
                "inline-flex w-full justify-center rounded-lg px-3 py-2 transition",
                "text-13-b",
                isActive
                  ? "bg-white text-[#60211a] shadow-sm"
                  : "text-gray-500 hover:text-slate-800",
              ].join(" ")}
            >
              {LABEL[tab]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
