import { http } from "@/shared/lib/http";
import type { ArticleRankingResponse, RankingType } from "@/api/rankings/types";

export async function getArticleRanking(
  type: RankingType,
): Promise<ArticleRankingResponse> {
  // 랭킹은 type 하나만 바꿔서 같은 엔드포인트로 조회
  const { data } = await http.get<ArticleRankingResponse>(
    "/articles/rankings",
    {
      params: { type },
    },
  );
  return data;
}
