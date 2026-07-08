import { http } from "@/shared/lib/http";
import type { ArticleRankingResponse, RankingType } from "@/api/rankings/types";
import type { UserId } from "@/types/ids";

export async function getArticleRanking(
  type: RankingType,
  requestUserId: UserId,
): Promise<ArticleRankingResponse> {
  const { data } = await http.get<ArticleRankingResponse>(
    "/articles/rankings",
    {
      params: { type },
      headers: { "Monew-Request-User-ID": requestUserId },
    },
  );
  return data;
}
