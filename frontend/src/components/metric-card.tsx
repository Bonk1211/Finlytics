import { type LucideIcon } from "lucide-react";
import clsx from "clsx";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: { value: string; positive: boolean };
  icon: LucideIcon;
  iconBg?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  iconBg = "var(--color-primary-light)",
}: MetricCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: iconBg }}
        >
          <Icon className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
        </div>
        {change && (
          <span
            className={clsx("badge", change.positive ? "badge-success" : "badge-danger")}
          >
            {change.positive ? "+" : ""}
            {change.value}
          </span>
        )}
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        {title}
      </p>
      <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
