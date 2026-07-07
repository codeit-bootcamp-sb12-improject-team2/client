import closeIcon from "@/assets/icons/close-secondary-24.svg";
import {
  getArticles,
  getArticle,
  getArticleSource,
  restoreArticles,
} from "@/api/articles";
import { getArticleRanking } from "@/api/rankings";
import type { ArticleRankingItem, RankingType } from "@/api/rankings/types";
import type {
  ArticleListItem,
  ArticlesOrderBy,
  RestoreArticlesParams,
} from "@/api/articles/types";
import type { InterestListItem } from "@/api/interests/types";
import Button from "@/shared/components/button/Button";
import EmptyState from "@/shared/components/EmptyState";
import DateRangePicker from "@/shared/components/DateRangePicker";
import ArticleDetailModal from "@/shared/components/modal/ArticleDetailModal";
import ArticleModal from "@/shared/components/modal/ArticleModal";
import SearchBar from "@/shared/components/SearchBar";
import SelectBox from "@/shared/components/SelectBox";
import CheckboxList from "@/shared/components/CheckboxList";
import NewsCard from "@/features/articles/components/NewsCard";
import ArticleRankingPanel from "@/features/articles/components/ArticleRankingPanel";
import { useAuthInfo } from "@/features/auth/hooks/useAuthInfo";
import useArticleDetailModal from "@/shared/hooks/useArticleDetailModal";
import useArticleRecoveryModal from "@/shared/hooks/useArticleRecoveryModal";
import type { SortDirection } from "@/types/direction";
import type { InterestId } from "@/types/ids";
import type { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { toast } from "react-toastify";
import { getUserActivities } from "@/api/user-activities";
import { format, subDays } from "date-fns";

interface ApiErrorResponse {
  message: string;
  code: string;
  timestamp: string;
  details?: Record<string, unknown>;
  exceptionType?: string;
  status?: number;
}

type ArticlePageCursor = {
  cursor: string | null;
  after: string | null;
};

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { articleId } = useParams();

  const location = useLocation();
  const stateArticle = location.state?.article;

  const {
    openModal: detailOpenModal,
    onClose: detailOnClose,
    initialData: detailData,
  } = useArticleDetailModal();

  const sortOptions = ["게시일", "조회수", "댓글수"];
  const directionOptions = ["내림차순", "오름차순"];

  const orderByParam =
    (searchParams.get("orderBy") as ArticlesOrderBy) || "publishDate";
  const orderBy =
    orderByParam === "publishDate" ||
    orderByParam === "commentCount" ||
    orderByParam === "viewCount"
      ? orderByParam
      : "publishDate";

  const directionBy =
    (searchParams.get("direction") as SortDirection) || "DESC";
  const direction =
    directionBy === "ASC" || directionBy === "DESC" ? directionBy : "DESC";

  const limit = 7;
  const keyword = searchParams.get("keyword") || "";
  const interestId = (searchParams.get("interestId") as InterestId) || "";
  const sourceInParam = searchParams.get("sourceIn") || "";
  const searchParamsString = searchParams.toString();

  const [selectedInterest, setSelectedInterest] = useState<
    InterestListItem | undefined
  >();
  const [searchInput, setSearchInput] = useState(keyword);

  const today = new Date();
  const weekAgo = subDays(today, 7);

  const [fromDate, setFromDate] = useState(format(weekAgo, "yyyy.MM.dd"));
  const [toDate, setToDate] = useState(format(today, "yyyy.MM.dd"));

  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [nextAfter, setNextAfter] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageHistory, setPageHistory] = useState<ArticlePageCursor[]>([
    { cursor: null, after: null },
  ]);

  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [rankingType, setRankingType] = useState<RankingType>("VIEW");
  const [rankingItems, setRankingItems] = useState<ArticleRankingItem[]>([]);
  const [rankingDate, setRankingDate] = useState<string>("");
  const [interests, setInterests] = useState<InterestListItem[]>([]);
  const [articleSourceOptions, setArticleSourceOptions] = useState<string[]>(
    [],
  );
  const [articleSourceIn, setArticleSourceIn] = useState<string[]>([]);

  const navigate = useNavigate();

  const { userId } = useAuthInfo();

  const {
    isOpen: recoveryIsOpen,
    openModal: recoveryOpenModal,
    onClose: recoveryOnClose,
  } = useArticleRecoveryModal();

  const sortMap: Record<string, string> = {
    게시일: "publishDate",
    조회수: "viewCount",
    댓글수: "commentCount",
  };

  const reverseSortMap: Record<string, string> = {
    publishDate: "게시일",
    viewCount: "조회수",
    commentCount: "댓글수",
  };

  const [sortValue, setSortValue] = useState(
    reverseSortMap[orderBy] || "게시일",
  );
  const [directionValue, setDirectionValue] = useState(
    direction === "DESC" ? "내림차순" : "오름차순",
  );

  const resetPaging = () => {
    //  필터가 바뀌면 커서/페이지 상태를 처음부터 다시
    setNextCursor(null);
    setNextAfter(null);
    setHasNext(false);
    setTotalPages(1);
    setPageIndex(0);
    setPageHistory([{ cursor: null, after: null }]);
  };

  const toApiDate = (value: string, endOfDay: boolean) =>
    // 화면의 yyyy.MM.dd 값을 백엔드가 받는 ISO 비슷한 문자열로
    value
      ? `${value.replace(/\./g, "-")}T${endOfDay ? "23:59:59" : "00:00:00"}+09:00`
      : "";

  const effectivePublishDateFrom = fromDate
    ? toApiDate(fromDate, false)
    : undefined;
  const effectivePublishDateTo = toDate ? toApiDate(toDate, true) : undefined;

  const fetchPageData = useCallback(
    async (pageCursor: ArticlePageCursor) => {
      if (!userId) return null;

      try {
        const sourceInArray = sourceInParam ? sourceInParam.split(",") : [];
        const params = {
          keyword,
          interestId,
          publishDateFrom: effectivePublishDateFrom,
          publishDateTo: effectivePublishDateTo,
          orderBy,
          direction,
          limit,
          cursor: pageCursor.cursor || undefined,
          after: pageCursor.after || undefined,
          sourceIn: sourceInArray.length > 0 ? sourceInArray : undefined,
        };

        const response = await getArticles(params, userId);
        return response;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    [
      keyword,
      interestId,
      orderBy,
      direction,
      effectivePublishDateFrom,
      effectivePublishDateTo,
      limit,
      userId,
      sourceInParam,
    ],
  );

  const buildPaginationItems = useCallback(
    (currentPage: number, pageCount: number) => {
      if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, index) => index + 1);
      }

      if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, "ellipsis", pageCount];
      }

      if (currentPage >= pageCount - 3) {
        return [
          1,
          "ellipsis",
          pageCount - 4,
          pageCount - 3,
          pageCount - 2,
          pageCount - 1,
          pageCount,
        ];
      }

      return [
        1,
        "ellipsis",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis",
        pageCount,
      ];
    },
    [],
  );

  const fetchInterestData = useCallback(async () => {
    try {
      const response = await getUserActivities(userId);
      const subscriptions = response?.subscriptions || [];
      const userInterests = subscriptions.map((sub) => ({
        id: sub.interestId,
        name: sub.interestName,
        keywords: sub.interestKeywords,
        subscriberCount: sub.interestSubscriberCount,
        subscribedByMe: true,
      }));
      setInterests(userInterests);
    } catch (error) {
      console.error(error);
    }
  }, [userId]);

  const fetchArticleSources = useCallback(async () => {
    try {
      const sources = await getArticleSource();
      setArticleSourceOptions(sources);

      // URL 파라미터에서 sourceIn 읽어서 초기화
      if (sourceInParam) {
        const sourceInArray = sourceInParam.split(",");
        setArticleSourceIn(sourceInArray);
      } else {
        setArticleSourceIn([]);
      }
    } catch (error) {
      console.error(error);
    }
  }, [sourceInParam]);

  const fetchDailyRankings = useCallback(async (type: RankingType) => {
    try {
      // 조회수/댓글수 랭킹은 같은 API에서 타입만 바꿔 가져옴
      const response = await getArticleRanking(type);
      setRankingItems(response?.articles || []);
      setRankingDate(response?.date || "");
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchArticleSources();
  }, [fetchArticleSources]);

  useEffect(() => {
    fetchDailyRankings(rankingType);
  }, [fetchDailyRankings, rankingType]);

  const interestNames = useMemo(
    () => (interests || []).map((interest) => interest.name),
    [interests],
  );

  const handleInterestChange = (value: string) => {
    const selectedInterestData = interests.find(
      (interest) => interest.name === value,
    );

    if (selectedInterestData) {
      setSelectedInterest(selectedInterestData);
      resetPaging();
    }
  };

  useEffect(() => {
    if (selectedInterest) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("interestId", selectedInterest.id);
        return newParams;
      });
    }
  }, [selectedInterest]);

  const handleSortOption = (value: string) => {
    setSortValue(value);
    const newOrderBy = sortMap[value];
    if (!newOrderBy || newOrderBy === orderBy) return;

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("orderBy", newOrderBy);
      return newParams;
    });
    resetPaging();
  };
  const handleDirectionOption = (value: string) => {
    setDirectionValue(value);
    const newDirection = value === "오름차순" ? "ASC" : "DESC";
    if (newDirection === direction) return;

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("direction", newDirection);
      return newParams;
    });
    resetPaging();
  };

  const handleArticleSourceOption = (values: string[]) => {
    setArticleSourceIn(values);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (values.length > 0) {
        newParams.set("sourceIn", values.join(","));
      } else {
        newParams.delete("sourceIn");
      }
      return newParams;
    });
    resetPaging();
  };

  const handleClearInterest = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("interestId");
      return newParams;
    });
    setSelectedInterest(undefined);
    resetPaging();
  };

  const handleFromDateChange = (value: string) => {
    setFromDate(value);
    resetPaging();
  };

  const handleToDateChange = (value: string) => {
    setToDate(value);
    resetPaging();
  };

  const handleSearch = (searchKeyword: string) => {
    if ((searchKeyword ?? "") === keyword) return;

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (searchKeyword) {
        newParams.set("keyword", searchKeyword);
      } else {
        newParams.delete("keyword");
      }
      newParams.delete("interestId");
      return newParams;
    });
    setSelectedInterest(undefined);
    resetPaging();
  };

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  useEffect(() => {
    if (searchInput === "" && keyword) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("keyword");
        newParams.delete("interestId");
        return newParams;
      });
      setSelectedInterest(undefined);
      setNextCursor(null);
      setNextAfter(null);
      setHasNext(false);
    }
  }, [searchInput, keyword]);

  useEffect(() => {
    const nextKeyword = searchInput.trim();

    if (nextKeyword === keyword) return;

    const timer = window.setTimeout(() => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);

        if (nextKeyword) {
          newParams.set("keyword", nextKeyword);
        } else {
          newParams.delete("keyword");
        }

        newParams.delete("interestId");
        return newParams;
      });

      setSelectedInterest(undefined);
      setNextCursor(null);
      setNextAfter(null);
      setHasNext(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, keyword, setSearchParams]);

  useEffect(() => {
    fetchInterestData();
  }, [fetchInterestData]);

  useEffect(() => {
    if (interests.length > 0 && interestId) {
      const matchedInterest = interests.find(
        (interest) => interest.id === interestId,
      );
      if (matchedInterest) {
        setSelectedInterest(matchedInterest);
      }
    } else if (!interestId) {
      setSelectedInterest(undefined);
    }
  }, [interests, interestId]);

  useEffect(() => {
    let cancelled = false;

    const preloadPages = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const loadedHistory: ArticlePageCursor[] = [];
        let cursor: string | null = null;
        let after: string | null = null;
        let firstResponse: Awaited<ReturnType<typeof fetchPageData>> | null =
          null;

        for (let i = 0; i < 4; i += 1) {
          const response = await fetchPageData({ cursor, after });
          if (!response || cancelled) return;

          if (i === 0) {
            firstResponse = response;
          }

          loadedHistory.push({ cursor, after });

          if (!response.hasNext) break;
          cursor = response.nextCursor;
          after = response.nextAfter;
        }

        if (cancelled) return;

        setSortValue(reverseSortMap[orderBy] || "게시일");
        setDirectionValue(direction === "DESC" ? "내림차순" : "오름차순");
        setPageIndex(0);
        setPageHistory(loadedHistory);

        if (firstResponse) {
          setHasNext(firstResponse.hasNext);
          setNextCursor(firstResponse.nextCursor);
          setNextAfter(firstResponse.nextAfter);
          setTotalPages(
            Math.max(1, Math.ceil(firstResponse.totalElements / limit)),
          );
          setArticles(firstResponse.content);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    preloadPages();

    return () => {
      cancelled = true;
    };
  }, [fetchPageData, orderBy, direction, searchParamsString, userId]);

  useEffect(() => {
    if (articleId) {
      if (stateArticle && stateArticle.id === articleId) {
        handleViewArticle(stateArticle);
      } else if (articles.length > 0) {
        const article = articles.find((a) => a.id === articleId);
        if (article) {
          handleViewArticle(article);
        }
      }
    }
  }, [articleId, articles, stateArticle]);

  const handleRestoreArticle = async (data: RestoreArticlesParams) => {
    try {
      // 복구 모달은 달력 입력과 수동 입력을 모두 허용하므로
      // 백엔드가 받을 수 있는 ISO 계열 문자열로만 한 번 정리한다.
      const normalizeRestoreDate = (value: string, endOfDay: boolean) => {
        const trimmed = value.trim();
        if (!trimmed) return trimmed;
        const [rawDatePart] = trimmed.split("T");
        const datePart = rawDatePart.includes(".")
          ? rawDatePart.replace(/\./g, "-")
          : rawDatePart;
        return `${datePart}${endOfDay ? "T23:59:59" : "T00:00:00"}`;
      };

      const formattedData = {
        from: normalizeRestoreDate(data.from, false),
        to: normalizeRestoreDate(data.to, true),
      };

      await restoreArticles(formattedData);

      const response = await fetchPageData({ cursor: null, after: null });
      if (response) {
        setHasNext(response.hasNext);
        setNextCursor(response.nextCursor);
        setNextAfter(response.nextAfter);
        setArticles(response.content);
      }

      toast.success("기사가 복구되었습니다.");

      recoveryOnClose();
    } catch (error) {
      console.error(error);

      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "오류가 발생했습니다.";

      toast.error(errorMessage);
    }
  };

  const handleViewArticle = useCallback(
    (article: ArticleListItem) => {
      detailOpenModal(article);
    },
    [detailOpenModal],
  );

  const handleRankingItemClick = useCallback(
    async (articleId: ArticleRankingItem["articleId"]) => {
      if (!userId) return;

      try {
        const article = await getArticle(articleId, userId);
        handleViewArticle(article);
      } catch (error) {
        console.error(error);
      }
    },
    [handleViewArticle, userId],
  );

  const handlePrevPage = async () => {
    if (pageIndex === 0 || isLoading) return;

    const prevIndex = pageIndex - 1;
    const prevPage = pageHistory[prevIndex];
    if (!prevPage) return;

    const response = await fetchPageData(prevPage);
    if (response) {
      setHasNext(response.hasNext);
      setNextCursor(response.nextCursor);
      setNextAfter(response.nextAfter);
      setArticles(response.content);
      setPageIndex(prevIndex);
    }
  };

  const handleNextPage = async () => {
    if (!hasNext || isLoading || !nextCursor || !nextAfter) return;

    const nextPage = { cursor: nextCursor, after: nextAfter };
    const response = await fetchPageData(nextPage);
    if (!response) return;

    setPageIndex((prev) => prev + 1);
    setPageHistory((prev) => [...prev, nextPage]);
    setHasNext(response.hasNext);
    setNextCursor(response.nextCursor);
    setNextAfter(response.nextAfter);
    setArticles(response.content);
  };

  const handlePageJump = async (targetIndex: number) => {
    if (targetIndex === pageIndex || isLoading) return;

    const cachedPage = pageHistory[targetIndex];
    if (cachedPage) {
      const response = await fetchPageData(cachedPage);
      if (response) {
        setHasNext(response.hasNext);
        setNextCursor(response.nextCursor);
        setNextAfter(response.nextAfter);
        setArticles(response.content);
        setPageIndex(targetIndex);
      }
      return;
    }

    if (targetIndex < pageHistory.length) return;

    let currentHistory = [...pageHistory];
    let currentHasNext = hasNext;
    let currentCursor = nextCursor;
    let currentAfter = nextAfter;
    let latestResponse: Awaited<ReturnType<typeof fetchPageData>> | null = null;
    let currentIndex = pageHistory.length - 1;

    while (currentIndex < targetIndex && currentHasNext) {
      if (!currentCursor || !currentAfter) return;

      const nextPage = { cursor: currentCursor, after: currentAfter };
      const response = await fetchPageData(nextPage);
      if (!response) return;

      currentHistory = [...currentHistory, nextPage];
      currentIndex += 1;
      latestResponse = response;
      currentHasNext = response.hasNext;
      currentCursor = response.nextCursor;
      currentAfter = response.nextAfter;
    }

    if (currentIndex === targetIndex && latestResponse) {
      setPageHistory(currentHistory);
      setHasNext(latestResponse.hasNext);
      setNextCursor(latestResponse.nextCursor);
      setNextAfter(latestResponse.nextAfter);
      setArticles(latestResponse.content);
      setPageIndex(targetIndex);
    }
  };

  const reachablePageCount = Math.min(
    totalPages,
    pageHistory.length + (hasNext ? 1 : 0),
  );

  const paginationItems = useMemo(
    () => buildPaginationItems(pageIndex + 1, reachablePageCount),
    [buildPaginationItems, pageIndex, reachablePageCount],
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f8f7f3]">
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="grid min-w-0 items-end gap-3 xl:grid-cols-[332px_repeat(3,minmax(0,160px))_minmax(280px,320px)_auto]">
            <div className="min-w-0 max-w-[332px]">
              <SearchBar
                width="w-full"
                height="h-11"
                onSearch={handleSearch}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="min-w-0 shrink-0">
              <div className="text-14-m text-gray-900 mb-2">정렬</div>
              <SelectBox
                items={sortOptions}
                value={sortValue}
                onChange={handleSortOption}
                className="h-10"
              />
            </div>

            <div className="min-w-0 shrink-0">
              <div className="text-14-m text-gray-900 mb-2">정렬 방향</div>
              <SelectBox
                items={directionOptions}
                value={directionValue}
                onChange={handleDirectionOption}
                className="h-10"
              />
            </div>

            <div className="min-w-0 shrink-0">
              <div className="text-14-m text-gray-900 mb-2">출처</div>
              <CheckboxList
                items={articleSourceOptions}
                values={articleSourceIn}
                onChange={handleArticleSourceOption}
                className="h-10"
                placeholder="전체"
              />
            </div>

            <div className="min-w-0 shrink-0">
              <DateRangePicker
                title="날짜"
                fromValue={fromDate}
                toValue={toDate}
                onFromChange={handleFromDateChange}
                onToChange={handleToDateChange}
                className="relative w-full"
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={recoveryOpenModal}
              // 기사 복구 버튼 색상
              className="w-fit shrink-0 justify-self-start px-4 !border-[#60211a] !text-[#60211a] hover:!border-[#4e1c15] hover:!text-[#4e1c15]"
            >
              기사 복구
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[332px_minmax(0,1fr)]">
          <aside className="h-fit space-y-4 xl:sticky xl:top-4">
            <ArticleRankingPanel
              title="일간 랭킹"
              rankingDate={rankingDate}
              type={rankingType}
              activeType={rankingType}
              onTypeChange={setRankingType}
              items={rankingItems}
              onItemClick={handleRankingItemClick}
            />
          </aside>

          <main className="space-y-5">
            <div className="flex min-w-0 items-center gap-3">
              {keyword ? (
                <div className="flex min-w-0 items-center gap-3">
                  <div className="shrink-0 whitespace-nowrap text-24-b leading-none text-[#60211a]">
                    {keyword}
                  </div>
                  <div className="shrink-0 whitespace-nowrap text-24-b leading-none text-gray-900">
                    관련 기사 목록
                  </div>
                </div>
              ) : interests.length > 0 ? (
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex shrink-0 items-center gap-2">
                    <SelectBox
                      items={interestNames}
                      value={selectedInterest?.name}
                      onChange={handleInterestChange}
                      placeholder="관심사 선택"
                      noBorder={true}
                      textClassName="text-24-b leading-none"
                      noBackground={true}
                    />
                    {selectedInterest && (
                      <button
                        type="button"
                        onClick={handleClearInterest}
                        aria-label="관심사 선택 해제"
                        className="flex-shrink-0 cursor-pointer p-1"
                      >
                        <img src={closeIcon} alt="" />
                      </button>
                    )}
                  </div>
                  <div className="shrink-0 whitespace-nowrap text-24-b leading-none text-gray-900">
                    관련 기사 목록
                  </div>
                </div>
              ) : (
                <div className="shrink-0 whitespace-nowrap text-24-b leading-none text-gray-900">
                  관련 기사 목록
                </div>
              )}
            </div>

            <ArticleModal
              isOpen={recoveryIsOpen}
              onClose={recoveryOnClose}
              onSave={handleRestoreArticle}
            />

            {articles.length === 0 ? (
              <div className="flex min-h-[420px] w-full items-center justify-center px-4 text-center">
                {interestId ? (
                  <EmptyState message="관련된 기사가 없습니다." />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-6">
                    <EmptyState message="관심사를 등록하면 맞춤 기사를 확인하실 수 있어요." />
                    <Button
                      onClick={() => navigate("/interests")}
                      className="w-[160px]"
                      size="sm"
                    >
                      관심사 등록하기
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full">
                {articles.map((article) => (
                  <div key={article.id}>
                    <NewsCard
                      article={article}
                      onClick={() => handleViewArticle(article)}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 w-full">
              <div className="border-t border-[#e6e0d6] pt-4">
                <nav
                  aria-label="기사 목록 페이지 이동"
                  className="flex w-full items-center justify-center gap-4 text-16-m"
                >
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={pageIndex === 0 || isLoading}
                    className="inline-flex items-center gap-1 text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-300"
                  >
                    <span>이전</span>
                    <span aria-hidden="true">‹</span>
                  </button>

                  <div className="flex items-center gap-3">
                    {paginationItems.map((item, index) =>
                      item === "ellipsis" ? (
                        <span
                          key={`ellipsis-${index}-${pageIndex}-${totalPages}`}
                          className="inline-flex h-10 min-w-10 items-center justify-center px-1 text-gray-400"
                          aria-hidden="true"
                        >
                          …
                        </span>
                      ) : (
                        (() => {
                          const pageNumber = item as number;
                          const isActive = pageNumber === pageIndex + 1;
                          return (
                            <button
                              key={pageNumber}
                              type="button"
                              onClick={() => handlePageJump(pageNumber - 1)}
                              aria-current={isActive ? "page" : undefined}
                              className={`inline-flex h-10 min-w-10 items-center justify-center px-2 transition-colors ${
                                isActive
                                  ? "border-b-2 border-slate-900 text-slate-900 font-semibold"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              {isActive && (
                                <span className="sr-only">현재페이지 </span>
                              )}
                              {pageNumber}
                            </button>
                          );
                        })()
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={!hasNext || isLoading}
                    className="inline-flex items-center gap-1 text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-300"
                  >
                    <span aria-hidden="true">›</span>
                    <span>다음</span>
                  </button>
                </nav>
              </div>
            </div>
          </main>
        </div>
      </div>
      {detailData && (
        <ArticleDetailModal onClose={detailOnClose} articleId={detailData.id} />
      )}
    </div>
  );
}
