import kebabMenuIcon from "@/assets/icons/kebab-menu-32.svg";
import personIcon from "@/assets/icons/person.svg";
import Dropdown from "@/shared/components/dropdown";

interface InterestCardHeaderProps {
  subscriberCount: number;
  isDropdownOpen: boolean;
  onKebabClick: () => void;
  onDropdownChange: (selectedItem: string) => void;
  dropdownRef: React.RefObject<HTMLButtonElement | null>;
}

export default function InterestCardHeader({
  subscriberCount,
  isDropdownOpen,
  onKebabClick,
  onDropdownChange,
  dropdownRef,
}: InterestCardHeaderProps) {
  return (
    <div>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img src={personIcon} className="h-9 w-9 opacity-30" alt="" />
          <div>
            <span className="text-14-sb text-gray-400">구독자</span>
            <div className="mt-2 text-24-b text-gray-900">
              {subscriberCount}
            </div>
          </div>
        </div>
        <button className="relative" onClick={onKebabClick} ref={dropdownRef}>
          <img src={kebabMenuIcon} className="w-8 h-8" alt="케밥" />
          {isDropdownOpen && (
            <Dropdown
              items={["키워드 수정", "관심사 삭제"]}
              onChange={onDropdownChange}
              className="right-0 top-7 z-10 min-w-32"
            />
          )}
        </button>
      </div>
    </div>
  );
}
