import { differenceInSeconds, formatDistanceToNow, isValid } from "date-fns";
import { ko } from "date-fns/locale";

export function formatTimeAgo(iso?: string | null): string {
  if (!iso) return "";

  const date = new Date(iso);

  if (!isValid(date)) return "";

  const sec = differenceInSeconds(new Date(), date);
  if (sec >= 0 && sec < 60) return "방금 전";
  return formatDistanceToNow(date, { addSuffix: true, locale: ko });
}
