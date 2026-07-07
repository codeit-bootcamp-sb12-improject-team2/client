import Label from "@/shared/components/Label";
import commentIcon from "@/assets/icons/comment.svg";
import { format } from "date-fns";
import type { ArticleListItem } from "@/api/articles/types";

interface NewsCardProps {
  article: ArticleListItem;
  onClick: () => void;
  compact?: boolean;
}

export default function NewsCard({
  article,
  onClick,
  compact = false,
}: NewsCardProps) {
  const formattedDate = format(article.publishDate, "yyyy.MM.dd");

  return (
    <article
      className={[
        "cursor-pointer border-b border-[#e8e2d8] last:border-b-0",
        compact ? "py-6" : "py-7",
      ].join(" ")}
      onClick={onClick}
    >
      <div className={compact ? "space-y-3" : "space-y-4"}>
        <div
          className={[
            "max-w-[920px]",
            compact ? "space-y-2" : "space-y-3",
          ].join(" ")}
        >
          <div
            className={
              compact
                ? "text-20-b leading-tight text-slate-950"
                : "text-24-b leading-tight text-slate-950 lg:text-26-b"
            }
          >
            <span dangerouslySetInnerHTML={{ __html: article.title }} />
          </div>
          <div
            className={
              compact
                ? "text-16-r leading-relaxed text-slate-500"
                : "text-18-r leading-relaxed text-slate-500 lg:text-19-r"
            }
          >
            <span dangerouslySetInnerHTML={{ __html: article.summary }} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label label={article.source} />
          <div className="flex items-center gap-3 text-14-r text-gray-400">
            <span>{formattedDate}</span>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1">
              <span>읽음</span>
              <span>{article.viewCount}</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1">
              <img src={commentIcon} className="h-5 w-5" alt="댓글" />
              <span>{article.commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
