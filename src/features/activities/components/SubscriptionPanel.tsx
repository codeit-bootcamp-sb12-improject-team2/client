import { useUserActivitiesList } from "@/features/activities/hooks/useUserActivitiesList";
import arrowIconUrl from "@/assets/icons/chevron-right.svg";
import SubscriptionCard from "@/features/activities/components/SubscriptionCard";
import Skeleton from "@/shared/components/Skeleton";
import { Link } from "react-router";
import { ROUTES } from "@/shared/constants/routes";

export default function SubscriptionPanel() {
  const { items, totalCount, error, loading, empty } = useUserActivitiesList(
    "subscriptions",
    10,
  );

  if (error) {
    return (
      <div>
        <p className="text-14-r text-error">{error}</p>
      </div>
    );
  }
  if (loading) {
    return <Skeleton height="132px" />;
  }

  return (
    <aside
      aria-labelledby="subs-heading"
      className="w-[260px] min-h-0 rounded-2xl border border-[#e8e2d8] bg-white p-6"
    >
      <div className="flex w-full items-center justify-between">
        <h2 id="subs-heading" className="text-18-b text-slate-950">
          총 <span className="text-[#60211a]">{totalCount}개</span>의 관심사
          구독중
        </h2>
        <Link to={ROUTES.INTERESTS} aria-label="interests">
          <img src={arrowIconUrl} alt="" />
        </Link>
      </div>

      {!empty && <div className="mt-6 h-px w-full bg-[#e8e2d8]" />}

      {!empty && (
        <ul className="flex flex-col">
          {items.map((s) => (
            <li key={s.interestId}>
              <SubscriptionCard
                name={s.interestName}
                keywords={s.interestKeywords}
              />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
