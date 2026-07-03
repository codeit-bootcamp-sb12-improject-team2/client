import HeaderTabButton from "@/shared/components/gnb/HeaderTabButton";

export default function HeaderTabs() {
  return (
    <nav
      aria-label="GNB tabs"
      className="flex items-center justify-center gap-12 overflow-x-auto border-b border-slate-200 py-0 sm:gap-16"
    >
      <HeaderTabButton variant="articles" />
      <HeaderTabButton variant="interests" />
      <HeaderTabButton variant="activities" />
    </nav>
  );
}
