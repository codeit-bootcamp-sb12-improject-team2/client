import NotificationButton from "@/shared/components/gnb/NotificationButton";
import LogoutButton from "@/shared/components/gnb/LogoutButton";

export default function UserMenu() {
  return (
    <div className="flex items-center gap-6 h-[36px]">
      <NotificationButton />
      <LogoutButton />
    </div>
  );
}
