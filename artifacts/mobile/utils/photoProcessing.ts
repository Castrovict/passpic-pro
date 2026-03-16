import { ValidationResult } from "@/context/PhotoContext";

export function simulateValidation(uri: string): ValidationResult {
  const seed = uri.length + Date.now();
  const rand = (i: number) => ((seed * (i + 7) * 31337) % 100) / 100;

  const r0 = rand(0);
  const r1 = rand(1);
  const r2 = rand(2);
  const r3 = rand(3);
  const r4 = rand(4);

  const checks = [
    {
      label: "Face detected",
      passed: r0 > 0.1,
      message: r0 > 0.1 ? "Face clearly visible" : "No face detected in photo",
    },
    {
      label: "Neutral expression",
      passed: r1 > 0.2,
      message: r1 > 0.2 ? "Expression is neutral" : "Smile detected — keep a neutral expression",
    },
    {
      label: "Eyes open",
      passed: r2 > 0.15,
      message: r2 > 0.15 ? "Eyes are open and visible" : "Eyes appear closed or partially closed",
    },
    {
      label: "Good lighting",
      passed: r3 > 0.25,
      message: r3 > 0.25 ? "Lighting is even and bright" : "Uneven lighting detected",
    },
    {
      label: "Plain background",
      passed: r4 > 0.2,
      message: r4 > 0.2 ? "Background removed successfully" : "Background may not be fully removed",
    },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);
  const isValid = passed >= 4;

  return { isValid, checks, score };
}

export function formatDimensions(widthMm: number, heightMm: number): string {
  return `${widthMm}×${heightMm}mm`;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Improvement";
}
