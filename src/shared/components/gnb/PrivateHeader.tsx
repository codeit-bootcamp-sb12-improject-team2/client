import { Link } from "react-router";
import symbolUrl from "@/assets/logos/app/symbol.svg";
import HeaderTabs from "@/shared/components/gnb/HeaderTabs";
import UserMenu from "@/shared/components/gnb/UserMenu";
import { ROUTES } from "@/shared/constants/routes";

export default function PrivateHeader() {
  return (
    <>
      {/* 헤더 색상 */}
      <header className="bg-[#f8f7f3]">
        {/* 로고와 액션은 같은 줄에 두고, 탭은 아래 줄에서 자연스럽게 분리 */}
        <div className="relative z-10 bg-[#fbfaf6]">
          <div className="mx-auto grid max-w-[1500px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 pt-5 pb-4 shadow-[0_10px_22px_-18px_rgba(92,73,46,0.22)] sm:px-6 lg:px-8">
            <Link
              to={ROUTES.ARTICLES}
              aria-label="articles"
              className="flex items-center justify-start"
            >
              <img
                src={symbolUrl}
                alt=""
                aria-hidden="true"
                className="h-10 w-10 md:h-11 md:w-11"
              />
            </Link>
            <Link
              to={ROUTES.ARTICLES}
              aria-label="articles"
              // MONEW 텍스트 색상
              className="justify-self-center text-[28px] font-extrabold tracking-tight text-[#4a3d25] md:text-[30px]"
            >
              MONEW
            </Link>
            <div className="justify-self-end">
              <UserMenu />
            </div>
          </div>
        </div>

        {/* 헤더 구분선 색상 */}
        <div className="relative z-0 bg-[#f8f7f3] pb-1">
          <HeaderTabs />
        </div>
      </header>
    </>
  );
}
