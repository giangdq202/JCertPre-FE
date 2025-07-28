import React from "react";
import clsx from "clsx";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  // Generate page numbers (compact: show first, last, near current)
  const pages: (number | "ellipsis")[] = [];
  const push = (v: number | "ellipsis") => pages.push(v);

  for (let p = 1; p <= totalPages; p++) {
    if (
      p === 1 ||
      p === totalPages ||
      (p >= page - 1 && p <= page + 1) ||
      (page <= 2 && p <= 3) ||
      (page >= totalPages - 1 && p >= totalPages - 2)
    ) {
      push(p);
    } else if (
      pages[pages.length - 1] !== "ellipsis" // avoid duplicates
    ) {
      push("ellipsis");
    }
  }

  return (
    <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-700">
      {/* Summary & page size */}
      <div>
        Hiển thị {start}–{end} của {total.toLocaleString("vi-VN")} kết quả
      </div>

      <div className="flex items-center gap-2">
        <span>Hiển thị:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          className="border rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-green-400"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1 justify-center">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={clsx(
            "px-3 py-1 rounded-md border transition",
            page <= 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "hover:bg-gray-100 border-gray-300"
          )}
        >
          « Trước
        </button>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className="px-2">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={clsx(
                "w-8 h-8 rounded-md text-center border text-sm",
                p === page
                  ? "bg-green-600 text-white border-green-600"
                  : "hover:bg-gray-100 border-gray-300"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={clsx(
            "px-3 py-1 rounded-md border transition",
            page >= totalPages
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "hover:bg-gray-100 border-gray-300"
          )}
        >
          Tiếp »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
