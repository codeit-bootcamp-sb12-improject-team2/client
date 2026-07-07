import { useEffect, useState } from "react";
import ModalLayout from "@/shared/components/modal/ModalLayout";
import DateRangePicker from "@/shared/components/DateRangePicker";
import Button from "@/shared/components/button/Button";
import type { RestoreArticlesParams } from "@/api/articles/types";

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RestoreArticlesParams) => void | Promise<void>;
}

export default function ArticleModal({
  isOpen,
  onClose,
  onSave,
}: ArticleModalProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const isFormValid = fromDate.trim() !== "" && toDate.trim() !== "";

  useEffect(() => {
    if (!isOpen) {
      setFromDate("");
      setToDate("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormValid) {
      await onSave({
        from: fromDate,
        to: toDate,
      });
      onClose();
    }
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      width="w-[560px]"
      panelClassName="overflow-visible flex flex-col"
      scrollable={false}
    >
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
        <h2 className="text-24-sb">기사 복구</h2>

        <DateRangePicker
          title="날짜"
          fromValue={fromDate}
          toValue={toDate}
          onFromChange={setFromDate}
          onToChange={setToDate}
          className="relative w-full"
          compact
        />

        <Button
          size="sm"
          className="w-fit self-end px-5"
          disabled={!isFormValid}
          type="submit"
        >
          복구하기
        </Button>
      </form>
    </ModalLayout>
  );
}
