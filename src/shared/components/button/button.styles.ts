type Variant = "primary" | "secondary" | "tertiary";
type Size = "sm" | "lg";

export type ButtonStyleProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

const baseStyles = `inline-flex items-center justify-center gap-2.5
  transition select-none focus:outline-none
  disabled:bg-gray-200 disabled:text-gray-600 disabled:border-none`;

// 버튼 색상: 기본/주요 액션
const primaryStyles = `bg-[#60211a] text-white
  hover:bg-[#4e1c15]`;

// 버튼 색상: 보조 액션
const secondaryStyles = `bg-white border border-[#60211a] text-[#60211a]
  hover:border-[#4e1c15] hover:text-[#4e1c15]`;

// 버튼 색상: 비활성/중립 액션
const tertiaryStyles = `bg-white border border-gray-400 text-gray-400
  hover:border-gray-600 hover:text-gray-600`;

const variantStyles: Record<Variant, string> = {
  primary: primaryStyles,
  secondary: secondaryStyles,
  tertiary: tertiaryStyles,
};

const sizeStyles: Record<Size, string> = {
  sm: "h-[40px] rounded-[10px] text-14-sb",
  lg: "h-[56px] rounded-[12px] text-20-sb",
};

export const cx = (...xs: Array<string | false | null | undefined>) => {
  return xs.filter(Boolean).join(" ");
};

export const buttonClass = ({
  variant = "primary",
  size = "lg",
  fullWidth = false,
}: ButtonStyleProps) => {
  return cx(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    fullWidth && "w-full",
  );
};
