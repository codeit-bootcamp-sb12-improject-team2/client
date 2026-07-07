import { useCallback, useEffect, useRef, useState } from "react";
import ModalLayout from "@/shared/components/modal/ModalLayout";
import Button from "@/shared/components/button/Button";
import SelectBox from "@/shared/components/SelectBox";
import Input from "@/shared/components/Input";
import CommentCard from "@/features/comments/components/CommentCard";
import {
  addLikeComment,
  createComment,
  deleteComment,
  deleteLikeComment,
  getComments,
  updateComment,
} from "@/api/comments";
import { useAuthInfo } from "@/features/auth/hooks/useAuthInfo";
import type { ArticleListItem } from "@/api/articles/types";
import type { CommentItem, CommentsOrderBy } from "@/api/comments/types";
import type { ArticleId, CommentId } from "@/types/ids";
import { toast } from "react-toastify";
import type { SortDirection } from "@/types/direction";
import { format } from "date-fns";
import Label from "@/shared/components/Label";
import commentIcon from "@/assets/icons/comment.svg";
import aiSummaryIcon from "@/assets/icons/ai-summary.svg";
import useConfirmModal from "@/shared/hooks/useConfirmModal";
import ConfirmModal from "@/shared/components/modal/ConfirmModal";
import { addArticleView, getArticle, getArticleSummary } from "@/api/articles";
import { toastApiError } from "@/shared/utils/toastApiError";

interface ArticleDetailModalProps {
  articleId: ArticleId;
  onClose: () => void;
}

const articleSummaryCache = new Map<
  ArticleId,
  { summary: string; keywords: string[] }
>();

export default function ArticleDetailModal({
  articleId,
  onClose,
}: ArticleDetailModalProps) {
  const [article, setArticle] = useState<ArticleListItem | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryKeywords, setSummaryKeywords] = useState<string[]>([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const commentItems = ["등록순", "좋아요순"];

  const limit = 5;
  const [orderBy, setOrderBy] = useState<CommentsOrderBy>("createdAt");
  const orderByDisplayValue = orderBy === "createdAt" ? "등록순" : "좋아요순";

  const [comments, setComments] = useState<CommentItem[]>([]);

  const [writtenComment, setWrittenComment] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [nextAfter, setNextAfter] = useState<string | null>(null);

  const observerRef = useRef<IntersectionObserver>(null);
  const lastElementRef = useRef<HTMLDivElement>(null);

  const {
    isOpen: isConfirmOpen,
    openModal: openConfirmModal,
    onClose: closeConfirmModal,
    initialData: confirmData,
  } = useConfirmModal();

  const { userId } = useAuthInfo();

  useEffect(() => {
    if (articleId) {
      getArticle(articleId, userId).then((res) => {
        setArticle(res);
        if (!res.viewedByMe) {
          addArticleView(articleId, userId);
        }
      });
    }
  }, [articleId, userId]);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);

    if (!article) return;
    try {
      const params = {
        articleId: article.id,
        orderBy,
        direction:
          orderBy === "createdAt"
            ? ("ASC" as SortDirection)
            : ("DESC" as SortDirection),
        limit,
      };
      const response = await getComments(params, userId);
      setComments(response.content);
      setHasNext(response.hasNext);
      setNextCursor(response.nextCursor);
      setNextAfter(response.nextAfter);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [article, orderBy, userId]);

  const fetchMoreData = useCallback(async () => {
    if (!article || !hasNext || !userId || isLoading) return;

    setIsLoading(true);

    try {
      const params = {
        articleId: article.id,
        orderBy,
        direction:
          orderBy === "createdAt"
            ? ("ASC" as SortDirection)
            : ("DESC" as SortDirection),
        limit,
        cursor: nextCursor || undefined,
        after: nextAfter || undefined,
      };
      const response = await getComments(params, userId);
      setComments((prev) => [...prev, ...response.content]);
      setHasNext(response.hasNext);
      setNextCursor(response.nextCursor);
      setNextAfter(response.nextAfter);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    orderBy,
    limit,
    nextCursor,
    nextAfter,
    article,
    hasNext,
    isLoading,
    userId,
  ]);

  useEffect(() => {
    if (article) {
      setComments([]);
      fetchInitialData();
    }
  }, [fetchInitialData, article, orderBy]);

  useEffect(() => {
    if (isLoading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext) {
          fetchMoreData();
        }
      },
      {
        threshold: 0,
        rootMargin: "0px 0px 200px 0px",
      },
    );
    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNext, isLoading, fetchMoreData]);

  const handleCloseModal = () => {
    onClose();
  };

  const handleClick = () => {
    if (article) {
      window.open(article.sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleAiSummaryClick = () => {
    if (!article) return;

    setIsSummaryOpen(true);
    const cachedSummary = articleSummaryCache.get(article.id);
    if (cachedSummary) {
      // 캐시가 있으면 바로 보여주고 API 호출은 생략
      setIsSummaryLoading(false);
      setSummaryError("");
      setSummaryText(cachedSummary.summary);
      setSummaryKeywords(cachedSummary.keywords);
      return;
    }

    setIsSummaryLoading(true);
    setSummaryError("");
    setSummaryText("");
    setSummaryKeywords([]);

    getArticleSummary(article.id)
      .then((response) => {
        if (!response.summary.trim()) {
          setSummaryError("AI 요약 응답이 비어 있습니다.");
          return;
        }

        articleSummaryCache.set(article.id, {
          summary: response.summary,
          keywords: response.keywords ?? [],
        });
        setSummaryText(response.summary);
        setSummaryKeywords(response.keywords ?? []);
      })
      .catch((error) => {
        console.error(error);
        setSummaryError("AI 요약을 불러오지 못했습니다.");
      })
      .finally(() => {
        setIsSummaryLoading(false);
      });
  };

  const handleApplyFilters = (value: string) => {
    if (value === "등록순") {
      setOrderBy("createdAt");
    } else if (value === "좋아요순") {
      setOrderBy("likeCount");
    }
  };

  const handleLikeClick = async (commentId: CommentId) => {
    try {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      if (comment.likedByMe) {
        await deleteLikeComment(commentId, userId);
      } else {
        await addLikeComment(commentId, userId);
      }

      await fetchInitialData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditSave = async (commentId: CommentId, newContent: string) => {
    try {
      await updateComment(commentId, { content: newContent }, userId);

      fetchInitialData();
      toast.success("댓글이 수정되었습니다.");
    } catch (error) {
      console.error(error);
      toast.error("댓글 수정 중 오류가 발생했습니다.");
    }
  };

  const handleAddComment = async (content: string) => {
    if (!article || !content.trim()) return;

    try {
      const params = {
        articleId: article.id,
        userId,
        content: content.trim(),
      };
      await createComment(params);

      setWrittenComment("");
      await fetchInitialData();
      toast.success("댓글 작성 완료");
    } catch (error) {
      console.error(error);
      toastApiError(error);
    }
  };

  const handleDeleteComment = async (commentId: CommentId) => {
    openConfirmModal({
      title: "댓글 삭제",
      message: "정말 삭제하시겠습니까?",
      onConfirm: async () => {
        try {
          await deleteComment(commentId);
          toast.success("댓글이 삭제되었습니다.");
          await fetchInitialData();
        } catch (error) {
          console.error(error);
          toast.error("댓글 삭제 중 오류가 발생했습니다.");
        }
      },
      confirmText: "삭제",
      cancelText: "취소",
    });
  };

  if (!article) return null;

  const formattedDate = format(article.publishDate, "yyyy.MM.dd");

  return (
    <>
      <ModalLayout
        isOpen={article !== null}
        onClose={handleCloseModal}
        width="w-[894px]"
        noPadding={true}
        disableClose={isConfirmOpen || isSummaryOpen}
      >
        <div className="h-auto rounded-tr-3xl rounded-tl-3xl bg-[#fffefd] pt-10 px-10 pb-6">
          <div className="text-20-b text-gray-900 mb-2">
            <span dangerouslySetInnerHTML={{ __html: article.title }} />
          </div>

          <div className="flex items-center gap-4  pb-6 mb-6 border-b border-gray-200">
            <Label label={article.source} />
            <div className="flex items-center gap-3">
              <span className="text-14-r text-gray-400">{formattedDate}</span>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <span className="text-14-r text-gray-400">읽음</span>
                <span className="text-14-r text-gray-400">
                  {article.viewCount}
                </span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <img src={commentIcon} className="w-5 h-5" alt="댓글" />
                <span className="text-14-r text-gray-400">
                  {article.commentCount}
                </span>
              </div>
            </div>
          </div>
          <div className="mb-6 flex items-center gap-1.5">
            <Button
              size="sm"
              className="w-[162px]"
              variant="primary"
              onClick={handleClick}
            >
              전체 기사 보러가기 →
            </Button>
            <button
              type="button"
              onClick={handleAiSummaryClick}
              className="inline-flex h-10 items-center justify-center gap-0.5 rounded-full border border-[#60211a] bg-white px-2 text-14-m text-[#60211a] transition hover:bg-[#fffdf8]"
              aria-label="AI 요약"
              title="AI 요약"
            >
              <img src={aiSummaryIcon} className="h-8 w-8" alt="" />
              <span>요약하기</span>
            </button>
          </div>

          <div className="text-18-r text-gray-500 mb-6">
            <span dangerouslySetInnerHTML={{ __html: article.summary }} />
          </div>
        </div>

        <div className="rounded-br-3xl rounded-bl-3xl bg-[#fcfbf8] pt-3 px-10 pb-8">
          <div className="mb-2 w-[110px]">
            <SelectBox
              items={commentItems}
              value={orderByDisplayValue}
              onChange={handleApplyFilters}
              placeholder="등록순"
              noBorder={true}
              textClassName="text-14-m text-gray-400"
              noBackground={true}
            />
          </div>
          <div className="mb-2 flex items-center gap-3">
            <Input
              placeholder="댓글을 입력하세요"
              className="flex-1"
              value={writtenComment}
              onChange={(e) => setWrittenComment(e.target.value)}
            />
            {/* 댓글 작성 아이콘 색상: 입력 전 중립 / 입력 후 Deep Wine */}
            <Button
              type="button"
              variant={writtenComment.trim() ? "primary" : "tertiary"}
              aria-label="댓글 작성"
              title="댓글 작성"
              disabled={!writtenComment.trim()}
              className="h-[52px] w-[52px] shrink-0 rounded-full p-0"
              onClick={() => handleAddComment(writtenComment)}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12H18M12 5L19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
          <div>
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                ref={index === comments.length - 1 ? lastElementRef : null}
              >
                <CommentCard
                  userNickname={comment.userNickname}
                  createdAt={new Date(comment.createdAt)}
                  likeCount={comment.likeCount}
                  content={comment.content}
                  isLiked={comment.likedByMe}
                  onLikeClick={handleLikeClick}
                  onEditSave={handleEditSave}
                  commentId={comment.id}
                  isMyComment={comment.userId === userId}
                  onDelete={handleDeleteComment}
                />
              </div>
            ))}
          </div>
        </div>
      </ModalLayout>

      {isSummaryOpen && article && (
        <ModalLayout
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          width="w-[560px]"
          noPadding={true}
          scrollable={false}
          panelClassName="px-8 pt-8 pb-6"
        >
          <div className="mb-6 flex items-center gap-2">
            <span className="text-20-b text-gray-900">AI 요약</span>
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-12-b text-amber-700">
              AI
            </span>
          </div>

          <div className="mb-4 rounded-2xl border border-[#e8e2d8] bg-[#fbfaf6] px-5 py-4">
            <div className="mb-2 text-16-b text-gray-900">
              <span dangerouslySetInnerHTML={{ __html: article.title }} />
            </div>
            {isSummaryLoading ? (
              <div className="text-16-r leading-7 text-gray-600">
                요약을 불러오는 중입니다.
              </div>
            ) : summaryError ? (
              <div className="text-16-r leading-7 text-gray-600">
                {summaryError}
              </div>
            ) : (
              <>
                <div className="whitespace-pre-line text-16-r leading-7 text-gray-600">
                  {summaryText}
                </div>
                {summaryKeywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {summaryKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-cyan-50 px-3 py-1 text-12-m text-cyan-700"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="text-13-r text-gray-400">
            {summaryError || "AI 기사 1개를 바탕으로 생성되었습니다."}
          </div>
        </ModalLayout>
      )}

      {confirmData && (
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmData.onConfirm}
          title={confirmData.title}
          message={confirmData.message}
          confirmText={confirmData.confirmText}
          cancelText={confirmData.cancelText}
        />
      )}
    </>
  );
}
