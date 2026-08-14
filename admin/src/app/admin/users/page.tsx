"use client";

import { useState } from "react";
import type { AdminUser, UserDetail, UserFilters, UserRole } from "@/types";
import { Avatar, Card, EmptyState, ErrorState, LoadingState, RoleBadge, StatusBadge, inputCls, selectCls } from "@/components/ui";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { ConfirmModal } from "@/components/ConfirmModal";

const PER_PAGE = 10;

const defaultFilters: UserFilters = {
  search: "",
  role: "all",
  status: "all",
  sort: "recent",
};

export default function AdminUsersPage() {
  const toast = useToast();
  const [filters, setFilters] = useState<UserFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);

  const { data, loading, error, reload } = useAsync(
    () => api.listUsers(filters, page, PER_PAGE),
    [filters, page],
  );

  const detail = useAsync<{ detail: UserDetail } | null>(
    () => (selectedId ? api.getUser(selectedId).then((detail) => ({ detail })) : Promise.resolve(null)),
    [selectedId],
  );

  function updateFilters(patch: Partial<UserFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }

  async function handleRoleChange(id: number, role: UserRole) {
    await api.updateUserRole(id, role);
    toast.push("success", `Role updated to ${role}.`);
    reload();
  }

  async function handleBan(u: AdminUser, ban: boolean) {
    await api.updateUserStatus(u.id, ban ? "banned" : "active");
    toast.push(ban ? "error" : "success", ban ? `${u.name} has been banned.` : `${u.name} has been reactivated.`);
    setBanTarget(null);
    reload();
  }

  async function handleVerify(id: number, verified: boolean) {
    await api.verifyUser(id, verified);
    toast.push("success", verified ? "Marked as verified." : "Verification removed.");
    reload();
    if (selectedId === id) detail.reload();
  }

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PER_PAGE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Users</h1>
        <p className="mt-1 text-sm text-ink-soft">{data?.total.toLocaleString()} accounts total</p>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            className={`${inputCls} lg:max-w-xs`}
            placeholder="Search name or email..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
          <div className="flex flex-wrap gap-3">
            <select
              className={selectCls}
              value={filters.role}
              onChange={(e) => updateFilters({ role: e.target.value as UserFilters["role"] })}
            >
              <option value="all">All roles</option>
              <option value="admin">Admins</option>
              <option value="moderator">Moderators</option>
              <option value="user">Users</option>
            </select>
            <select
              className={selectCls}
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value as UserFilters["status"] })}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
            <select
              className={selectCls}
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value as UserFilters["sort"] })}
            >
              <option value="recent">Recently active</option>
              <option value="xp">Highest XP</option>
              <option value="level">Highest level</option>
              <option value="joined">Newest</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <Card>
          <EmptyState title="No users found" description="Try adjusting your search or filters." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-3.5 font-semibold">User</th>
                  <th className="px-5 py-3.5 font-semibold">Role</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Level</th>
                  <th className="px-5 py-3.5 font-semibold">XP</th>
                  <th className="px-5 py-3.5 font-semibold">Streak</th>
                  <th className="px-5 py-3.5 font-semibold">Lessons</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.id} className="border-b border-line transition-colors last:border-0 hover:bg-surface/60">
                    <td className="px-5 py-3.5">
                      <button type="button" onClick={() => setSelectedId(u.id)} className="flex items-center gap-3 text-left">
                        <Avatar name={u.name} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-ink">
                            {u.name} {u.nativeSpeaker && <span title="Native speaker">🇵🇭</span>}
                          </span>
                          <span className="block truncate text-xs text-ink-faint">{u.email}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-ink">{u.level}</td>
                    <td className="px-5 py-3.5 tabular-nums text-ink-soft">{u.xp.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      {u.streak > 0 && <span className="font-semibold text-accent">🔥 {u.streak}d</span>}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-ink-soft">{u.lessons}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="rounded-lg border border-line px-2 py-1.5 text-xs text-ink"
                          title="Change role"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Mod</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setBanTarget(u)}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                            u.status === "banned"
                              ? "bg-success/10 text-success hover:bg-success hover:text-white"
                              : "bg-danger/10 text-danger hover:bg-danger hover:text-white"
                          }`}
                        >
                          {u.status === "banned" ? "Unban" : "Ban"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
            <p className="text-xs text-ink-faint">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, data.total)} of {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs text-ink-faint">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      )}

      {selectedId && (
        <UserDrawer
          loading={detail.loading}
          user={detail.data?.detail ?? null}
          onClose={() => setSelectedId(null)}
          onRoleChange={handleRoleChange}
          onVerify={handleVerify}
        />
      )}

      <ConfirmModal
        open={!!banTarget}
        title={banTarget?.status === "banned" ? "Reactivate user" : `Ban ${banTarget?.name}?`}
        message={
          banTarget?.status === "banned"
            ? "This will restore the user's account and remove the ban."
            : "The user will lose access to SultiAI. Their data remains preserved for reactivation."
        }
        confirmLabel={banTarget?.status === "banned" ? "Reactivate" : "Ban user"}
        onConfirm={() => banTarget && handleBan(banTarget, banTarget.status !== "banned")}
        onClose={() => setBanTarget(null)}
      />
    </div>
  );
}

function UserDrawer({
  loading,
  user,
  onClose,
  onRoleChange,
  onVerify,
}: {
  loading: boolean;
  user: UserDetail | null;
  onClose: () => void;
  onRoleChange: (id: number, role: UserRole) => void;
  onVerify: (id: number, verified: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <LoadingState />
        ) : user ? (
          <>
            <div className="flex items-start justify-between border-b border-line p-6">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} className="h-12 w-12 text-base" />
                <div>
                  <h2 className="text-lg font-bold text-ink">{user.name}</h2>
                  <p className="text-xs text-ink-faint">{user.email}</p>
                  <div className="mt-1.5 flex gap-2">
                    <RoleBadge role={user.role} />
                    <StatusBadge status={user.status} />
                  </div>
                </div>
              </div>
              <button type="button" onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Level", value: user.level },
                  { label: "XP", value: user.xp.toLocaleString() },
                  { label: "Streak", value: `${user.streak} days` },
                  { label: "Lessons", value: user.lessons },
                  { label: "Coins", value: user.totalCoins.toLocaleString() },
                  { label: "Daily goal", value: `${user.dailyGoal} XP` },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-line bg-surface p-4">
                    <p className="text-xs text-ink-faint">{s.label}</p>
                    <p className="mt-1 text-lg font-bold text-ink">{s.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint">Badges</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.badges.map((b) => (
                    <span key={b} className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint">Weak areas</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.weakAreas.map((w) => (
                    <span key={w} className="rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-[#b45309]">
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Native speaker</p>
                  <span className={user.nativeSpeaker ? "text-success" : "text-ink-faint"}>
                    {user.nativeSpeaker ? "✓ Verified" : "Not marked"}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Verified account</p>
                  <button
                    type="button"
                    onClick={() => onVerify(user.id, !user.verified)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      user.verified ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                    }`}
                  >
                    {user.verified ? "Remove verification" : "Verify account"}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint">Role</h3>
                <select
                  value={user.role}
                  onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)}
                  className="mt-2 w-full rounded-xl border border-line px-3.5 py-2.5 text-sm text-ink"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="rounded-2xl bg-surface p-4 text-xs text-ink-soft">
                <p>Joined: {new Date(user.joinedAt).toLocaleDateString()}</p>
                <p className="mt-1">Last active: {new Date(user.lastActive).toLocaleString()}</p>
                <p className="mt-1">Favorite category: {user.favoriteCategory}</p>
                <p className="mt-1">Feedback submitted: {user.feedbackCount}</p>
              </div>
            </div>
          </>
        ) : (
          <EmptyState title="User not found" />
        )}
      </aside>
    </div>
  );
}