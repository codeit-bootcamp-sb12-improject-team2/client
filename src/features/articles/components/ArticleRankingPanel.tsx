import type { ArticleRankingItem, RankingType } from "@/api/rankings/types";

interface ArticleRankingPanelProps {
  title: string;
  subtitle?: string;
  rankingDate?: string;
  type: RankingType;
  items: ArticleRankingItem[];
  activeType: RankingType;
  onTypeChange: (type: RankingType) => void;
  onItemClick?: (articleId: ArticleRankingItem["articleId"]) => void;
}

const typeLabel: Record<RankingType, string> = {
  VIEW: "조회수 랭킹",
  COMMENT: "댓글 수 랭킹",
};

const rankToneClass: Record<number, string> = {
  1: "bg-[#60211a] text-white",
  2: "bg-[#7a2f25] text-white",
  3: "bg-[#9b4b41] text-white",
};

export default function ArticleRankingPanel({
  title,
  subtitle,
  rankingDate,
  type,
  items,
  activeType,
  onTypeChange,
  onItemClick,
}: ArticleRankingPanelProps) {
  return (
    <section className="rounded-[20px] border border-[#e7e2d8] bg-white/85 px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-[1px]">
      <div className="mb-4">
        <div className="text-16-b text-slate-950">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-12-r text-gray-500">{subtitle}</div>
        ) : null}
      </div>

      {/*조회수/댓글수 랭킹만 전환하고, 화면에는 TOP 3 */}
      <div className="mb-4 flex gap-2 rounded-xl bg-[#f3efe8] p-1">
        {(Object.keys(typeLabel) as RankingType[]).map((itemType) => (
          <button
            key={itemType}
            type="button"
            onClick={() => onTypeChange(itemType)}
            className={`flex-1 rounded-lg px-3 py-2 text-13-b transition ${
              activeType === itemType
                ? "bg-white text-[#60211a] shadow-sm"
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            {typeLabel[itemType]}
          </button>
        ))}
      </div>

      <div className="mb-3 text-12-r text-gray-400">
        {rankingDate
          ? `${rankingDate.replaceAll("-", ".")} 기준`
          : "랭킹 기준일 없음"}
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl bg-[#f7f6f2] px-3 py-4 text-13-r text-gray-500">
            랭킹 데이터가 없습니다.
          </div>
        ) : (
          /* 랭킹 패널은 운영 화면에서 빠르게 훑는 용도라 상위 3개만 노출 */
          items.slice(0, 3).map((item) => (
            <button
              key={`${type}-${item.articleId}`}
              type="button"
              onClick={() => onItemClick?.(item.articleId)}
              className="w-full rounded-xl border border-[#efe9df] px-3 py-3 text-left transition hover:border-[#d9cdb5] hover:bg-[#f7f1e6]"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-13-b ${rankToneClass[item.rank] ?? "bg-[#f0ead9] text-[#605331]"}`}
                >
                  {item.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-14-b text-slate-950">
                    {item.title}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-12-r text-gray-500">
                    <span>{item.source}</span>
                    <span className="font-medium text-slate-700">
                      {item.rankingCount.toLocaleString()}회
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
