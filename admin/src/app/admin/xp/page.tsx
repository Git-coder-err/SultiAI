"use client";

import { BarChart } from "@/components/ChartCard";
import { StatCard } from "@/components/StatCard";
import { Avatar, Card, CardHeader, ErrorState, LoadingState } from "@/components/ui";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";

export default function AdminXpPage() {
  const { data, loading, error, reload } = useAsync(() => api.getXpOverview(), []);

  if (loading) return <LoadingState label="Loading XP data..." />;
  if (error || !data) return <ErrorState message={error ?? "Failed to load XP data"} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">XP & Rewards</h1>
        <p className="mt-1 text-sm text-ink-soft">Gamification metrics and top learners.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total XP awarded" value={data.totalXpAwarded.toLocaleString()} delta="All-time" icon="⚡" />
        <StatCard label="Avg daily XP" value={data.avgDailyXp.toLocaleString()} tone="amber" delta="Last 7 days" icon="📈" />
        <StatCard label="Daily rewards claimed" value={data.dailyRewardsClaimed.toLocaleString()} tone="green" icon="🎁" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Level distribution" subtitle="Active users by level" />
          <div className="p-6">
            <BarChart data={data.levelDistribution} color="#ffb347" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Top learners" subtitle="Highest XP this month" />
          <ul className="divide-y divide-line">
            {data.topUsers.map((u, i) => (
              <li key={u.id} className="flex items-center gap-4 px-6 py-3.5">
                <span className={`w-6 text-center text-sm font-extrabold ${i === 0 ? "text-accent" : "text-ink-faint"}`}>
                  {i + 1}
                </span>
                <Avatar name={u.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{u.name}</p>
                  <p className="text-xs text-ink-faint">
                    Level {u.level} · {u.streak > 0 ? `${u.streak}-day streak` : "no streak"}
                  </p>
                </div>
                <span className="text-sm font-bold tabular-nums text-brand-dark">{u.xp.toLocaleString()} XP</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}