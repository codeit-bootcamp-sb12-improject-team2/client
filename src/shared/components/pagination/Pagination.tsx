interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : currentPage <= 4
        ? [1, 2, 3, 4, 5, "ellipsis", totalPages]
        : currentPage >= totalPages - 3
          ? [
              1,
              "ellipsis",
              totalPages - 4,
              totalPages - 3,
              totalPages - 2,
              totalPages - 1,
              totalPages,
            ]
          : [
              1,
              "ellipsis",
              currentPage - 1,
              currentPage,
              currentPage + 1,
              "ellipsis",
              totalPages,
            ];

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <nav
      aria-label="페이지 이동"
      className={`flex items-center justify-center gap-4 text-16-m ${className}`}
    >
      <button
        type="button"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-1 text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-300"
      >
        <span>이전</span>
        <span aria-hidden="true">‹</span>
      </button>

      <div className="flex items-center gap-3">
        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-10 min-w-10 items-center justify-center px-1 text-gray-400"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page as number)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`inline-flex h-10 min-w-10 items-center justify-center px-2 transition-colors ${
                page === currentPage
                  ? "border-b-2 border-slate-900 font-semibold text-slate-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {page === currentPage && (
                <span className="sr-only">현재페이지 </span>
              )}
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-1 text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-300"
      >
        <span aria-hidden="true">›</span>
        <span>다음</span>
      </button>
    </nav>
  );
}
