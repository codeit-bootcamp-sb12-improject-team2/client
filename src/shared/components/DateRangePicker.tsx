import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

interface DateRangePickerProps {
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  title?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  className?: string;
  popupDirection?: "down" | "up";
  popupMode?: "overlay" | "inline";
  compact?: boolean;
}

const parseDate = (value: string) => {
  if (!value) return undefined;

  const [year, month, day] = value.split(".").map(Number);
  if (!year || !month || !day) return undefined;

  return new Date(year, month - 1, day);
};

const formatDate = (date: Date) => format(date, "yyyy.MM.dd");

export default function DateRangePicker({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  title = "날짜선택",
  fromPlaceholder = "시작날짜",
  toPlaceholder = "종료날짜",
  className = "",
  popupDirection = "down",
  popupMode = "overlay",
  compact = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  // 취소 버튼은 열기 전의 날짜로 되돌리기 위해 이전 값을 저장
  const previousFromRef = useRef(fromValue);
  const previousToRef = useRef(toValue);
  const wasOpenRef = useRef(false);
  const inputId = useId();

  const fromDate = useMemo(() => parseDate(fromValue), [fromValue]);
  const toDate = useMemo(() => parseDate(toValue), [toValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const baseDate = fromDate || toDate || new Date();
    setCurrentMonth(baseDate);
  }, [fromDate, toDate]);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      previousFromRef.current = fromValue;
      previousToRef.current = toValue;
    }
    wasOpenRef.current = isOpen;
  }, [fromValue, isOpen, toValue]);

  const handleDateSelect = (date: Date) => {
    const nextValue = formatDate(date);

    if (!fromDate || (fromDate && toDate)) {
      onFromChange(nextValue);
      onToChange("");
    } else {
      if (date < fromDate) {
        onToChange(formatDate(fromDate));
        onFromChange(nextValue);
      } else {
        onToChange(nextValue);
      }
    }
  };

  const handleToday = () => {
    const today = new Date();
    //오늘 버튼은 시작/종료 날짜를 같은 날짜
    onFromChange(formatDate(today));
    onToChange(formatDate(today));
    setCurrentMonth(today);
    setIsOpen(true);
  };

  const handleCancel = () => {
    // 달력에서 취소하면 선택 전 상태로 원복
    onFromChange(previousFromRef.current);
    onToChange(previousToRef.current);
    setIsOpen(false);
  };

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows: Date[][] = [];
    let days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i += 1) {
        days.push(day);
        day = addDays(day, 1);
      }

      rows.push(days);
      days = [];
    }

    return rows;
  }, [currentMonth]);

  return (
    <div ref={containerRef} className={className}>
      <div className="form-group">
        <div className="form-tit mb-2 text-14-m text-gray-900">{title}</div>
        <div className="form-conts calendar-conts relative">
          <div className="calendar-input flex items-center gap-2.5">
            <div className="flex h-10 min-w-0 flex-[1.05] items-center rounded-lg border border-gray-200 bg-white px-3 transition-colors focus-within:border-[#60211a]">
              <input
                id={`${inputId}-from`}
                type="text"
                inputMode="numeric"
                placeholder={fromPlaceholder}
                title="시작날짜 입력"
                value={fromValue}
                onChange={(e) => onFromChange(e.target.value)}
                onFocus={() => setIsOpen(true)}
                className="krds-input datepicker w-full bg-transparent text-14-m outline-none text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <span className="shrink-0 text-14-m text-gray-400">-</span>
            <div className="relative flex h-10 min-w-0 flex-[1.05] items-center rounded-lg border border-gray-200 bg-white px-3 pr-10 transition-colors focus-within:border-[#60211a]">
              <input
                id={`${inputId}-to`}
                type="text"
                inputMode="numeric"
                placeholder={toPlaceholder}
                title="종료날짜 입력"
                value={toValue}
                onChange={(e) => onToChange(e.target.value)}
                onFocus={() => setIsOpen(true)}
                className="krds-input datepicker w-full bg-transparent text-14-m outline-none text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#60211a]"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="달력 열기"
              >
                <span className="sr-only">달력 열기</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M8 3v4M16 3v4M3 10h18" />
                  <path d="M8 13h.01M12 13h.01M16 13h.01M8 16h.01M12 16h.01M16 16h.01" />
                </svg>
              </button>
            </div>
          </div>

          {isOpen && (
            <div
              className={`krds-calendar-area z-50 rounded-2xl border border-gray-200 bg-white shadow-lg ${
                popupMode === "inline"
                  ? compact
                    ? "relative mt-2 w-full max-w-none p-3"
                    : "relative mt-2 w-full max-w-none p-3.5"
                  : `absolute left-0 ${
                      popupDirection === "up"
                        ? "bottom-full mb-2"
                        : "top-full mt-2"
                    } ${
                      compact
                        ? "w-[min(calc(100vw-32px),280px)] p-3"
                        : "w-[min(calc(100vw-32px),320px)] p-3.5"
                    } max-h-[calc(100vh-180px)] overflow-y-auto`
              }`}
            >
              <div className="calendar-wrap bottom" aria-label="달력">
                <div className="calendar-head mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    className={`btn-cal-move prev inline-flex items-center justify-center rounded-full border border-gray-200 bg-white text-2xl text-gray-700 hover:bg-gray-100 ${
                      compact ? "h-8 w-8" : "h-9 w-9"
                    }`}
                    onClick={() =>
                      setCurrentMonth((prev) => subMonths(prev, 1))
                    }
                    aria-label="이전 달"
                  >
                    <span aria-hidden="true">‹</span>
                  </button>

                  <div className="calendar-switch-wrap text-14-b text-gray-900">
                    {format(currentMonth, "yyyy년 M월")}
                  </div>

                  <button
                    type="button"
                    className={`btn-cal-move next inline-flex items-center justify-center rounded-full border border-gray-200 bg-white text-2xl text-gray-700 hover:bg-gray-100 ${
                      compact ? "h-8 w-8" : "h-9 w-9"
                    }`}
                    onClick={() =>
                      setCurrentMonth((prev) => addMonths(prev, 1))
                    }
                    aria-label="다음 달"
                  >
                    <span aria-hidden="true">›</span>
                  </button>
                </div>

                <div className="calendar-body">
                  <div className="calendar-table-wrap">
                    <table className="calendar-tbl w-full border-collapse">
                      <caption className="sr-only">
                        {format(currentMonth, "yyyy년 M월")}
                      </caption>
                      <thead>
                        <tr
                          className={`text-14-m text-gray-600 ${compact ? "text-[13px]" : ""}`}
                        >
                          {["일", "월", "화", "수", "목", "금", "토"].map(
                            (day) => (
                              <th key={day} className="pb-2 font-semibold">
                                {day}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {weeks.map((week, weekIndex) => (
                          <tr key={`week-${weekIndex}`}>
                            {week.map((day, dayIndex) => {
                              const isCurrentMonth = isSameMonth(
                                day,
                                startOfMonth(currentMonth),
                              );
                              const isStart = fromDate
                                ? isSameDay(day, fromDate)
                                : false;
                              const isEnd = toDate
                                ? isSameDay(day, toDate)
                                : false;
                              const isRange =
                                fromDate && toDate
                                  ? isWithinInterval(day, {
                                      start: fromDate,
                                      end: toDate,
                                    })
                                  : false;
                              const isSelected = isStart || isEnd;
                              const weekend =
                                day.getDay() === 0 || day.getDay() === 6;

                              return (
                                <td
                                  key={`day-${weekIndex}-${dayIndex}`}
                                  className="py-1"
                                >
                                  <div className="flex justify-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDateSelect(day)}
                                      className={`btn-set-date flex items-center justify-center rounded-lg text-14-m transition-colors ${
                                        compact
                                          ? "h-8 w-8 text-13-m"
                                          : "h-10 w-10"
                                      } ${
                                        !isCurrentMonth
                                          ? "text-gray-300"
                                          : weekend
                                            ? "text-gray-500"
                                            : "text-gray-900"
                                      } ${
                                        isRange && !isSelected
                                          ? // 달력 범위 배경색
                                            "bg-[#f5ecea]"
                                          : ""
                                      } ${
                                        isSelected
                                          ? "bg-[#60211a] text-white"
                                          : "hover:bg-gray-100"
                                      } ${
                                        isToday(day) && !isSelected
                                          ? "border border-[#60211a]"
                                          : ""
                                      }`}
                                    >
                                      <span>{format(day, "d")}</span>
                                    </button>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="calendar-footer mt-3 border-t border-gray-200 pt-3">
                  <div className="calendar-btn-wrap flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="krds-btn small text rounded-md px-3 py-2 text-14-m text-gray-600 hover:bg-gray-100"
                      onClick={handleToday}
                    >
                      오늘
                    </button>
                    <button
                      type="button"
                      className="krds-btn small tertiary rounded-md px-3 py-2 text-14-m text-gray-600 hover:bg-gray-100"
                      onClick={handleCancel}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      // 달력 확인 버튼 색상
                      className="krds-btn small primary rounded-md bg-[#60211a] px-4 py-2 text-14-m text-white hover:bg-[#4e1c15]"
                      onClick={() => setIsOpen(false)}
                    >
                      확인
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
