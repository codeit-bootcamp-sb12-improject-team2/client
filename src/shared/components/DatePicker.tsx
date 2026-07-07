import { useEffect, useId, useRef, useState, type ReactElement } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

interface DatePickerProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  inputSize?: "sm" | "md";
  label?: string;
  editable?: boolean;
}

export default function DatePicker({
  value = "",
  placeholder = "날짜 선택",
  onChange,
  className = "",
  inputSize = "md",
  label,
  editable = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const selectedDate = value ? new Date(value.replace(/\./g, "-")) : undefined;

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    const formattedDate = format(date, "yyyy.MM.dd");
    onChange?.(formattedDate);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    handleDateSelect(today);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderCalendar = (): ReactElement[][] => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows: ReactElement[][] = [];
    let days: ReactElement[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isTodayDate = isToday(day);
        const isWeekend =
          currentDay.getDay() === 0 || currentDay.getDay() === 6;

        days.push(
          <button
            key={day.toString()}
            type="button"
            onClick={() => handleDateSelect(currentDay)}
            className={`
              flex h-10 w-10 items-center justify-center rounded-lg text-14-m transition-colors
              ${!isCurrentMonth ? "text-gray-300" : isWeekend ? "text-gray-500" : "text-gray-900"}
              // 달력 선택/오늘 강조색
              ${isSelected ? "bg-[#60211a] text-white font-semibold" : ""}
              ${isTodayDate && !isSelected ? "border border-[#60211a]" : ""}
              ${isCurrentMonth && !isSelected ? "hover:bg-gray-100" : ""}
            `}
          >
            {format(day, "d")}
          </button>,
        );

        day = addDays(day, 1);
      }

      rows.push(days);
      days = [];
    }

    return rows;
  };

  const sizeClasses = {
    sm: "min-h-10 py-1.5 px-3",
    md: "min-h-14 py-4 px-5",
  };

  const calendarWeeks = renderCalendar();

  return (
    <div className={className} ref={containerRef}>
      <div className="calendar-conts relative mt-1">
        {editable ? (
          <div
            className={`calendar-input flex w-full items-center gap-2 rounded-xl border bg-white px-4 ${sizeClasses[inputSize]} border-gray-200 outline-none focus-within:border-[#60211a]`}
          >
            <input
              id={inputId}
              type="text"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className={`flex-1 bg-transparent text-16-m outline-none ${value ? "text-gray-900" : "text-gray-400"}`}
            />
            {label && <span className="text-14-m text-gray-500">{label}</span>}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="달력 열기"
              className="shrink-0 text-[#60211a] hover:text-[#4e1c15]"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
                />
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            id={inputId}
            onClick={() => setIsOpen(!isOpen)}
            className={`calendar-input flex w-full items-center gap-2 rounded-xl border bg-white px-4 text-left ${sizeClasses[inputSize]} border-gray-200 outline-none focus:border-[#60211a]`}
          >
            <span
              className={`text-16-m ${value ? "text-gray-900" : "text-gray-400"}`}
            >
              {value || placeholder}
            </span>
            {label && <span className="text-14-m text-gray-500">{label}</span>}
            <span className="ml-auto shrink-0 text-[#60211a]">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
                />
              </svg>
            </span>
          </button>
        )}

        {isOpen && (
          <div className="krds-calendar-area absolute left-0 top-full z-50 mt-2 w-[340px] rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
            <div className="calendar-wrap bottom" aria-label="달력">
              <div className="calendar-head mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="btn-cal-move prev inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                  aria-label="이전 달"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="calendar-switch-wrap text-16-b text-gray-900">
                  {format(currentMonth, "yyyy년 M월")}
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="btn-cal-move next inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                  aria-label="다음 달"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              <div className="calendar-body">
                <div className="calendar-table-wrap">
                  <table className="calendar-tbl w-full border-collapse">
                    <caption className="sr-only">
                      {format(currentMonth, "yyyy년 M월")}
                    </caption>
                    <thead>
                      <tr className="text-14-m text-gray-600">
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
                      {calendarWeeks.map((week, index) => (
                        <tr key={`week-${index}`}>
                          {week.map((dayButton, dayIndex) => (
                            <td
                              key={`day-${index}-${dayIndex}`}
                              className="py-1"
                            >
                              <div className="flex justify-center">
                                {dayButton}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="calendar-footer mt-4 border-t border-gray-200 pt-4">
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
                    onClick={() => setIsOpen(false)}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    // 달력 확인 버튼 색상
                    className="krds-btn small primary rounded-md bg-[#60211a] px-3 py-2 text-14-m text-white hover:bg-[#4e1c15]"
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
  );
}
