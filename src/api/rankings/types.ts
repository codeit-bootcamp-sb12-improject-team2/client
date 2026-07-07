import type { ArticleId } from "@/types/ids";

export type RankingType = "VIEW" | "COMMENT";

// 백엔드 랭킹 응답은 순위, 원문 기사 식별자, 집계 수치
export type ArticleRankingItem = {
  rank: number;
  articleId: ArticleId;
  title: string;
  source: string;
  viewCount: number;
  commentCount: number;
  rankingCount: number;
  publishDate: string;
};

// 랭킹 응답은 기준일과 타입, 기사 목록
export type ArticleRankingResponse = {
  date: string;
  type: RankingType;
  articles: ArticleRankingItem[];
};
