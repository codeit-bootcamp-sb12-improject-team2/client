import { http } from "@/shared/lib/http";
import type * as T from "@/api/articles/types";
import type { UserId, ArticleId } from "@/types/ids";

/* 기사 뷰 등록 */
export async function addArticleView(
  articleId: ArticleId,
  requestUserId: UserId,
): Promise<T.AddArticleViewResponse> {
  const { data } = await http.post<T.AddArticleViewResponse>(
    `/articles/${articleId}/article-views`,
    undefined,
    { headers: { "Monew-Request-User-ID": requestUserId } },
  );
  return data;
}

/* 뉴스 기사 목록 조회 */
export async function getArticles(
  params: T.GetArticlesParams,
  requestUserId: UserId,
): Promise<T.GetArticlesResponse> {
  const { data } = await http.get<T.GetArticlesResponse>("/articles", {
    params,
    headers: { "Monew-Request-User-ID": requestUserId },
  });
  return data;
}

/* 뉴스 기사 상세 조회 */
export async function getArticle(
  articleId: ArticleId,
  requestUserId: UserId,
): Promise<T.ArticleListItem> {
  const { data } = await http.get<T.ArticleListItem>(`/articles/${articleId}`, {
    headers: { "Monew-Request-User-ID": requestUserId },
  });
  return data;
}

/* 뉴스 기사 AI 요약 조회 */
export async function getArticleSummary(
  articleId: ArticleId,
): Promise<T.GetArticleSummaryResponse> {
  //  AI 요약은 articleId만 보내고 summary/keywords만...
  const { data } = await http.get<T.GetArticleSummaryResponse>("/ai/summary", {
    params: { articleId },
  });
  return data;
}

/* 출처 목록 조회 */
export async function getArticleSource(): Promise<T.ArticleSource[]> {
  const { data } = await http.get<T.ArticleSource[]>("/articles/sources");
  return data;
}

/* 뉴스 복구 */
export async function restoreArticles(
  params: T.RestoreArticlesParams,
): Promise<T.RestoreArticlesResponse> {
  const { data } = await http.get<T.RestoreArticlesResponse>(
    "/articles/restore",
    {
      params,
    },
  );
  return data;
}

/* 뉴스 기사 논리 삭제 */
export async function deleteArticle(articleId: ArticleId): Promise<void> {
  await http.delete<void>(`/articles/${articleId}`);
}

/* 뉴스 기사 물리 삭제 */
export async function hardDeleteArticle(articleId: ArticleId): Promise<void> {
  await http.delete<void>(`/articles/${articleId}/hard`);
}
