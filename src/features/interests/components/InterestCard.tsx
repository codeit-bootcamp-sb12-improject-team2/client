import checkIcon from "@/assets/icons/check-default.svg";
import Button from "@/shared/components/button/Button";
import { useRef, useState } from "react";
import type { InterestId } from "@/types/ids";
import { useClosePopup } from "@/shared/hooks/useClosePopup";
import useInterestEditModal from "@/shared/hooks/useInterestEditModal";
import InterestEditModal from "@/shared/components/modal/InterestEditModal";
import ConfirmModal from "@/shared/components/modal/ConfirmModal";
import useConfirmModal from "@/shared/hooks/useConfirmModal";
import InterestCardHeader from "@/shared/components/interestCard/InterestCardHeader";
import NotchBorder from "@/shared/components/interestCard/NotchBorder";

interface InterestCardProps {
  interestId: InterestId;
  name: string;
  keywords: string[];
  subscriberCount: number;
  isSubscribed?: boolean;
  onSubscribeClick: (id: InterestId, isSubscribed: boolean) => void;
  onSaveKeyword: (id: InterestId, keywords: string[]) => void;
  onDeleteInterest: (id: InterestId) => void;
}

export default function InterestCard({
  interestId,
  name,
  keywords,
  subscriberCount,
  isSubscribed = false,
  onSubscribeClick,
  onSaveKeyword,
  onDeleteInterest,
}: InterestCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLButtonElement>(null);

  const { isOpen, openModal, onClose, initialData } = useInterestEditModal();
  const {
    isOpen: isConfirmOpen,
    openModal: openConfirmModal,
    onClose: closeConfirmModal,
    initialData: confirmModalData,
  } = useConfirmModal();

  useClosePopup(dropdownRef, () => setIsDropdownOpen(false), isDropdownOpen);

  const handleSubscribeClick = () => {
    onSubscribeClick(interestId, isSubscribed);
  };

  const handleDropdownChange = (selectedItem: string) => {
    if (selectedItem === "키워드 수정") {
      openModal({ keywords });
    } else if (selectedItem === "관심사 삭제") {
      openConfirmModal({
        title: "관심사 삭제",
        message: `'${name}' 관심사를 정말 삭제하시겠습니까?\n삭제된 관심사는 복구할 수 없습니다.`,
        confirmText: "삭제",
        cancelText: "취소",
        onConfirm: () => onDeleteInterest(interestId),
      });
    }
    setIsDropdownOpen(false);
  };

  const handleKeywordSave = (updatedKeywords: string[]) => {
    onSaveKeyword(interestId, updatedKeywords);
    onClose();
  };

  return (
    <div className="relative h-full w-full">
      <NotchBorder />

      <div className="relative z-10 flex h-full flex-col px-8 py-7">
        <InterestCardHeader
          subscriberCount={subscriberCount}
          isDropdownOpen={isDropdownOpen}
          onKebabClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onDropdownChange={handleDropdownChange}
          dropdownRef={dropdownRef}
        />

        <div className="flex flex-1 flex-col pt-9">
          <span className="text-14-sb text-gray-400">관심사</span>
          <h2 className="mt-3 mb-6 text-24-b text-gray-900">{name}</h2>

          <div className="mb-6 flex flex-1 flex-wrap content-start gap-3">
            {keywords.map((keyword, index) => (
              <div
                key={index}
                className="h-fit rounded-lg bg-gray-100 px-3 py-1.5 text-14-m text-gray-500"
              >
                {keyword}
              </div>
            ))}
          </div>

          <div className="absolute right-8 bottom-8 flex justify-end">
            {isSubscribed ? (
              <Button
                variant="secondary"
                size="sm"
                className="min-w-[88px] gap-1 px-4"
                onClick={handleSubscribeClick}
              >
                <img src={checkIcon} className="w-4 h-4" alt="체크" />
                구독 중
              </Button>
            ) : (
              <Button
                className="min-w-[88px] px-4 !transition-none hover:!bg-[#60211a]"
                size="sm"
                onClick={handleSubscribeClick}
              >
                구독하기
              </Button>
            )}
          </div>
        </div>

        <InterestEditModal
          isOpen={isOpen}
          onClose={onClose}
          onSave={handleKeywordSave}
          initialData={initialData}
        />

        {confirmModalData && (
          <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={closeConfirmModal}
            onConfirm={confirmModalData.onConfirm}
            title={confirmModalData.title}
            message={confirmModalData.message}
            confirmText={confirmModalData.confirmText}
            cancelText={confirmModalData.cancelText}
          />
        )}
      </div>
    </div>
  );
}
