export default function NotchBorder({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 350"
      className={`absolute inset-0 w-full h-full pointer-events-none mt-9 ${className}`}
    >
      <path
        d="M 24,4
           H 276
           Q 296,4 296,24
           V 140
           A 20,20 0 0 0 296,180
           V 326
           Q 296,346 276,346
           H 24
           Q 4,346 4,326
           V 24
           Q 4,4 24,4
           Z"
        fill="white"
        stroke="#60211a"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}