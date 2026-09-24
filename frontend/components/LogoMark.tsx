type LogoSize = "sm" | "md" | "lg" | "xl" | "hero";

type LogoMarkProps = {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
  textClassName?: string;
};

const markSizeClasses: Record<LogoSize, string> = {
  sm: "h-9 w-9 rounded-xl",
  md: "h-12 w-12 rounded-2xl",
  lg: "h-16 w-16 rounded-[22px]",
  xl: "h-20 w-20 rounded-[28px]",
  hero: "h-24 w-24 rounded-[32px]",
};

const textSizeClasses: Record<LogoSize, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
  hero: "text-5xl",
};

export function LogoMark({ size = "md", showText = false, className = "", textClassName = "" }: LogoMarkProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <span
        className={`${markSizeClasses[size]} group/logo relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-accent/30 bg-slate-950/80 shadow-[0_14px_45px_rgba(16,185,129,0.24)] ring-1 ring-white/10 transition duration-300 hover:scale-[1.03] hover:border-accent/60 hover:shadow-[0_18px_70px_rgba(16,185,129,0.34)]`}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_38%_24%,rgba(52,211,153,0.22),transparent_42%)]" />
        <img
          src="/logo.png"
          alt="Logo Gotly"
          className="relative z-10 h-[118%] w-[118%] max-w-none object-contain drop-shadow-[0_0_18px_rgba(52,211,153,0.28)] transition duration-300 group-hover/logo:scale-[1.04]"
          draggable={false}
        />
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/12 via-transparent to-transparent" />
      </span>

      {showText ? (
        <span className={`font-black tracking-[-0.04em] text-textMain ${textSizeClasses[size]} ${textClassName}`.trim()}>
          Gotly
        </span>
      ) : null}
    </span>
  );
}
