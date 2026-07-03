import { Outlet } from "react-router";
import { PrivateHeader } from "@/shared/components/gnb";

export default function PrivateLayout() {
  return (
    <div className="min-h-dvh text-slate-900">
      {/* 공통 헤더 */}
      <PrivateHeader />

      {/* 페이지별 콘텐츠 영역 */}
      <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <Outlet />
      </main>
    </div>
  );
}
