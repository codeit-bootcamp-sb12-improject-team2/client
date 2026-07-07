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
    <div className="bg-gray-100 rounded-2xl p-1">
      <div className="flex justify-between items-center ml-2">
        <span className="text-12-r text-gray-400">구독자</span>
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
      <div className="flex items-center gap-1 ml-1">
        <img src={personIcon} className="w-5 h-5" alt="사람모양" />
        <span className="text-20-b text-gray-900">{subscriberCount}</span>
      </div>
    </div>
  );
}