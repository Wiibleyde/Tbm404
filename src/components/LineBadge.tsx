import { lineColors } from "@/lib/lines";
import Link from "next/link";

interface LineBadgeLine {
  code: string;
  shortName: string;
  color: string | null;
  textColor: string | null;
  mode: "TRAM" | "BUS" | "BOAT" | "OTHER";
}

interface LineBadgeProps {
  line: LineBadgeLine;
  size?: "sm" | "md" | "lg";
  href?: string;
}

const SIZES = {
  sm: "h-6 min-w-6 text-xs px-1.5",
  md: "h-8 min-w-8 text-sm px-2",
  lg: "h-14 min-w-14 text-2xl px-3 rounded-xl",
};

export function LineBadge({ line, size = "md", href }: LineBadgeProps) {
  const { bg, fg } = lineColors(line);
  const className = `inline-flex items-center justify-center rounded-md font-mono font-semibold tabular-nums transition-transform ${SIZES[size]} ${href ? "hover:scale-105" : ""}`;
  const style = { backgroundColor: bg, color: fg };

  if (href) {
    return (
      <Link href={href} className={className} style={style} title={line.shortName}>
        {line.shortName}
      </Link>
    );
  }

  return (
    <span className={className} style={style} title={line.shortName}>
      {line.shortName}
    </span>
  );
}
