import { Link } from "react-router";
import Logo from "@/shared/components/Logo";
import HeaderTabs from "@/shared/components/gnb/HeaderTabs";
import UserMenu from "@/shared/components/gnb/UserMenu";
import { ROUTES } from "@/shared/constants/routes";

export default function PrivateHeader() {
  return (
    <header className="bg-white">
      {/* 로고와 액션은 같은 줄에 두고, 탭은 아래 줄에서 자연스럽게 분리 */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div />
        <Link
          to={ROUTES.ARTICLES}
          aria-label="articles"
          className="flex items-center justify-center gap-3 justify-self-center"
        >
          <Logo className="md:block hidden h-[48px] w-auto" />
        </Link>
        <div className="justify-self-end">
          <UserMenu />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <HeaderTabs />
      </div>
    </header>
  );
}
