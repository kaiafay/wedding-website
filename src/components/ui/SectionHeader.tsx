export default function SectionHeader({
  label,
  title,
  titleClassName,
  nowrap,
}: {
  label: string;
  title: string;
  titleClassName?: string;
  nowrap?: boolean;
}) {
  const noWrapStyle = nowrap ? ({ whiteSpace: "nowrap" } as const) : undefined;
  return (
    <div className="flex items-center gap-6 mb-16">
      <span
        className="font-sans"
        style={{
          fontSize: 10,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "var(--mauve)",
          ...noWrapStyle,
        }}
      >
        {label}
      </span>
      <span
        className={`font-script${titleClassName ? ` ${titleClassName}` : ""}`}
        style={{
          fontSize: 44,
          color: "var(--charcoal)",
          lineHeight: 1,
          ...noWrapStyle,
        }}
      >
        {title}
      </span>
      <div className="flex-1" style={{ height: 1, background: "var(--rule)" }} />
    </div>
  );
}
