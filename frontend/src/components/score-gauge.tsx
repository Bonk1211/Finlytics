"use client";

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  label: string;
  riskLevel: "Low" | "Medium" | "High";
}

export default function ScoreGauge({
  score,
  maxScore = 850,
  label,
  riskLevel,
}: ScoreGaugeProps) {
  const percentage = (score / maxScore) * 100;

  const riskColor =
    riskLevel === "Low"
      ? "var(--color-success)"
      : riskLevel === "Medium"
      ? "var(--color-warning)"
      : "var(--color-danger)";

  const riskBg =
    riskLevel === "Low"
      ? "var(--color-success-light)"
      : riskLevel === "Medium"
      ? "var(--color-warning-light)"
      : "var(--color-danger-light)";

  // SVG arc gauge
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="card flex flex-col items-center py-8">
      <p className="text-sm font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
        {label}
      </p>

      <div className="relative" style={{ width: 200, height: 120 }}>
        <svg
          width="200"
          height="120"
          viewBox="0 0 200 120"
          style={{ overflow: "visible" }}
        >
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={riskColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span
            className="text-4xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {score}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <span
          className="badge"
          style={{ background: riskBg, color: riskColor }}
        >
          {riskLevel} Risk
        </span>
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          out of {maxScore}
        </span>
      </div>
    </div>
  );
}
