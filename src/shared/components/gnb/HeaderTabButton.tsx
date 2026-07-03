import { NavLink } from "react-router";
import { ROUTES } from "@/shared/constants/routes";

type HeaderTabButtonVariant = "articles" | "interests" | "activities";

const HEADER_TAB_BUTTON_TEXT: Record<HeaderTabButtonVariant, string> = {
  articles: "뉴스",
  interests: "관심사",
  activities: "활동내역",
};

const TAB_TO_PATH: Record<HeaderTabButtonVariant, string> = {
  articles: ROUTES.ARTICLES,
  interests: ROUTES.INTERESTS,
  activities: ROUTES.ACTIVITIES,
};

type HeaderTabButtonProps = {
  variant: HeaderTabButtonVariant;
  className?: string;
};

export default function HeaderTabButton({
  variant,
  className,
}: HeaderTabButtonProps) {
  return (
    <NavLink
      to={TAB_TO_PATH[variant]}
      className={({ isActive }) =>
        [
          "relative inline-flex items-center px-1 py-4 text-16-sb tracking-tight transition-colors after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-[1px] after:h-[3px] after:w-12 after:rounded-full after:transition-all",
          isActive
            ? "text-slate-950 after:bg-slate-950"
            : "text-slate-500 hover:text-slate-900 after:bg-transparent",
          className ?? "",
        ].join(" ")
      }
    >
      {HEADER_TAB_BUTTON_TEXT[variant]}
    </NavLink>
  );
}
