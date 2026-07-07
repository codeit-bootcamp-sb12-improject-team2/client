import HeaderTabButton from "@/shared/components/gnb/HeaderTabButton";

export default function HeaderTabs() {
  return (
    <nav
      aria-label="GNB tabs"
      className="mx-auto flex max-w-[1500px] items-center justify-center gap-10 overflow-x-auto px-4 py-2 sm:gap-14 sm:px-6 lg:px-8"
    >
      <HeaderTabButton variant="articles" />
      <HeaderTabButton variant="interests" />
      <HeaderTabButton variant="activities" />
    </nav>
  );
}
