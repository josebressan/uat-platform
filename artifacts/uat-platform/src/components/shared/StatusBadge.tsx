import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/_/g, " ").replace(/-/g, " ");

  let colorClasses = "bg-muted text-muted-foreground border-muted-foreground/20"; // Default (Not Started, Draft, etc.)

  if (normalizedStatus.includes("pass") || normalizedStatus.includes("approved") || normalizedStatus.includes("active") || normalizedStatus.includes("closed")) {
    colorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  } else if (normalizedStatus.includes("fail") || normalizedStatus.includes("reject") || normalizedStatus.includes("critical")) {
    colorClasses = "bg-red-500/10 text-red-400 border-red-500/20";
  } else if (normalizedStatus.includes("block") || normalizedStatus.includes("high") || normalizedStatus.includes("on hold")) {
    colorClasses = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  } else if (normalizedStatus.includes("in progress") || normalizedStatus.includes("assigned") || normalizedStatus.includes("open")) {
    colorClasses = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-medium border rounded-full whitespace-nowrap backdrop-blur-sm",
        colorClasses,
        sizeClasses[size],
        className
      )}
    >
      {status}
    </span>
  );
}
