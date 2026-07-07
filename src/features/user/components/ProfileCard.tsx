import { useAuthInfo } from "@/features/auth/hooks/useAuthInfo";
import EditProfileButton from "./EditNicknameButton";

export default function ProfileCard() {
  const { userName, userEmail } = useAuthInfo();

  return (
    <aside className="w-[260px] rounded-2xl border border-[#e8e2d8] bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-18-sb text-slate-950">{userName}</p>
          <span className="mt-1 block truncate text-16-r text-slate-500">
            {userEmail}
          </span>
        </div>
        <EditProfileButton />
      </div>
    </aside>
  );
}
