import type { User } from "@/api/users/types";
import type { SubscriptionInterestResponse } from "@/api/interests/types";
import type { CommentItem, LikeCommentResponse } from "@/api/comments/types";
import type { ArticleId, ArticleViewId } from "@/types/ids";

/* 작성한 댓글 내역 */
export type ActivityComment = Omit<CommentItem, "likedByMe"> & {
  articleTitle: string;
};

/* 좋아요한 댓글 내역 */
export type ActivityCommentLike = Omit<LikeCommentResponse, "likedBy">;

/* 최근 본 기사 내역 */
export type ActivityArticleView = {
  id: ArticleViewId;
  articleId: ArticleId;
  source: string;
  sourceUrl: string;
  title: string;
  publishDate: string;
  summary: string;
  commentCount: number;
  viewCount: number;
  viewedByMe: boolean;
};

/* 사용자 활동 내역 조회 - 응답 */
export type GetUserActivitiesResponse = User & {
  subscriptions: SubscriptionInterestResponse[];
  comments: ActivityComment[];
  commentLikes: ActivityCommentLike[];
  articleViews: ActivityArticleView[];
};
