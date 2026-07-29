"use client";

import { useMemo, useState } from "react";
import { useAllUsers, useUpdateUserStatus } from "@/hooks/useAdmin";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectItem } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/Dialog";
import { cn, formatDate } from "@/lib/utils";
import { UserRole } from "@/types";
import type { User } from "@/types";

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: UserRole }) {
  const map = { [UserRole.CUSTOMER]: "emerald", [UserRole.PROVIDER]: "purple", [UserRole.ADMIN]: "red" } as const;
  return <Badge tone={map[role]} size="sm">{role}</Badge>;
}

// ─── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ user, open, onClose }: { user: User | null; open: boolean; onClose: () => void }) {
  const update = useUpdateUserStatus();
  if (!user) return null;
  const activate = !user.isActive;
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activate ? "Activate user" : "Suspend user"}</DialogTitle>
          <DialogDescription>
            {activate
              ? `Activate "${user.name}"? They will be able to log in again.`
              : `Suspend "${user.name}"? They will not be able to log in until reactivated.`}
          </DialogDescription>
          <DialogClose />
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="md" onClick={onClose} disabled={update.isPending}>Cancel</Button>
          <Button
            variant={activate ? "primary" : "destructive"}
            size="md"
            isLoading={update.isPending}
            onClick={async () => {
              await update.mutateAsync({ id: user.id, data: { isActive: activate } });
              onClose();
            }}
          >
            {activate ? "Activate" : "Suspend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "active" | "suspended">("ALL");
  const [target, setTarget]       = useState<User | null>(null);

  const { data: users = [], isLoading, isError, error, refetch } = useAllUsers();

  const filtered = useMemo(() => {
    let list = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (roleFilter !== "ALL") list = list.filter((u) => u.role === roleFilter);
    if (statusFilter === "active")    list = list.filter((u) => u.isActive);
    if (statusFilter === "suspended") list = list.filter((u) => !u.isActive);
    return list;
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isLoading ? "Loading…" : `${users.length} total users`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <Input
            type="search" placeholder="Search name or email…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "ALL")} placeholder="Role" className="w-40">
          <SelectItem value="ALL">All roles</SelectItem>
          <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
          <SelectItem value={UserRole.PROVIDER}>Provider</SelectItem>
          <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} placeholder="Status" className="w-40">
          <SelectItem value="ALL">All status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5"><Skeleton variant="text" className="h-4 w-40 rounded-full" /><Skeleton variant="text" className="h-3 w-28 rounded-full" /></div>
              <Skeleton className="h-5 w-20 rounded-full" /><Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="font-semibold text-red-800">Failed to load users</p>
          <p className="mt-1 text-sm text-red-700">{error?.message}</p>
          <button type="button" onClick={() => void refetch()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Try again</button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState tone="users" title="No users found" description="Try adjusting your search or filters." size="sm" />
      )}

      {/* Mobile cards */}
      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((u) => (
              <div key={u.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                      u.role === UserRole.ADMIN ? "bg-linear-to-br from-red-400 to-rose-400" :
                      u.role === UserRole.PROVIDER ? "bg-linear-to-br from-indigo-400 to-sky-400" :
                      "bg-linear-to-br from-emerald-400 to-teal-400")}>
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{u.name}</p>
                      <p className="truncate text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={u.isActive ? "active" : "suspended"} />
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex gap-2"><RoleBadge role={u.role} /><span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span></div>
                  {u.role !== UserRole.ADMIN && (
                    <Button
                      variant={u.isActive ? "destructive" : "primary"}
                      size="sm"
                      onClick={() => setTarget(u)}
                    >
                      {u.isActive ? "Suspend" : "Activate"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                          u.role === UserRole.ADMIN ? "bg-linear-to-br from-red-400 to-rose-400" :
                          u.role === UserRole.PROVIDER ? "bg-linear-to-br from-indigo-400 to-sky-400" :
                          "bg-linear-to-br from-emerald-400 to-teal-400")}>
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{u.name}</p>
                          <p className="truncate text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><RoleBadge role={u.role} /></TableCell>
                    <TableCell><StatusBadge status={u.isActive ? "active" : "suspended"} /></TableCell>
                    <TableCell className="text-xs text-slate-500">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {u.role !== UserRole.ADMIN ? (
                        <Button
                          variant={u.isActive ? "destructive" : "primary"}
                          size="sm"
                          onClick={() => setTarget(u)}
                        >
                          {u.isActive ? "Suspend" : "Activate"}
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <ConfirmDialog user={target} open={Boolean(target)} onClose={() => setTarget(null)} />
    </div>
  );
}
