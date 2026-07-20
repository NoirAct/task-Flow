import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { appApi, type TeamRole } from "@/services/app";

const ROLES: TeamRole[] = ["ADMIN", "MANAGER", "DEVELOPER", "VIEWER"];

export function TeamPage() {
  const { t } = useTranslation(["team", "common"]);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("DEVELOPER");
  const [devInviteUrl, setDevInviteUrl] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: appApi.listTeams,
  });

  const detailQuery = useQuery({
    queryKey: ["team", selectedId],
    queryFn: () => appApi.getTeam(selectedId!),
    enabled: Boolean(selectedId),
  });

  const createMutation = useMutation({
    mutationFn: () => appApi.createTeam({ name, description: description || null }),
    onSuccess: async (result) => {
      setCreateOpen(false);
      setName("");
      setDescription("");
      setSelectedId(result.team.id);
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      appApi.invite(selectedId!, { email: inviteEmail, role: inviteRole }),
    onSuccess: async (result) => {
      setInviteEmail("");
      setDevInviteUrl(result.invite.inviteUrl ?? null);
      await queryClient.invalidateQueries({ queryKey: ["team", selectedId] });
    },
  });

  const teams = data?.teams ?? [];
  const team = detailQuery.data?.team;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("team:title")}</h1>
          <p className="mt-1 text-sm text-fg-muted">{t("team:subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>{t("team:create")}</Button>
      </div>

      {teams.length === 0 ? (
        <EmptyState title={t("team:empty")} description={t("team:emptyDescription")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {teams.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                  selectedId === item.id
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-surface hover:border-fg-subtle/40"
                }`}
              >
                <p className="font-medium text-fg">{item.name}</p>
                <p className="text-xs text-fg-muted">
                  {item.memberCount} · {item.projectCount}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            {!selectedId ? (
              <p className="text-sm text-fg-muted">{t("team:emptyDescription")}</p>
            ) : detailQuery.isLoading || !team ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-fg">{team.name}</h2>
                  <p className="text-sm text-fg-muted">{team.description || "—"}</p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-fg-muted">{t("team:members")}</h3>
                  <ul className="space-y-2">
                    {team.members?.map((member) => (
                      <li key={member.id} className="flex items-center gap-2">
                        <Avatar name={member.user.name} src={member.user.avatarUrl} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{member.user.name}</p>
                          <p className="truncate text-xs text-fg-muted">{member.user.email}</p>
                        </div>
                        <Badge>{t(`team:roles.${member.role}`)}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <h3 className="text-sm font-medium text-fg-muted">{t("team:invite")}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder={t("team:email")}
                      className="min-w-55 flex-1"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                      className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {t(`team:roles.${role}`)}
                        </option>
                      ))}
                    </select>
                    <Button
                      loading={inviteMutation.isPending}
                      disabled={!inviteEmail.trim()}
                      onClick={() => inviteMutation.mutate()}
                    >
                      {t("team:sendInvite")}
                    </Button>
                  </div>
                  {devInviteUrl ? (
                    <p className="break-all text-xs text-accent">
                      <Link to={`/app/team/invites/${devInviteUrl.split("/").pop()}`}>
                        {devInviteUrl}
                      </Link>
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title={t("team:create")}>
        <div className="space-y-3">
          <Input label={t("team:name")} value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label={t("team:description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            className="w-full"
            loading={createMutation.isPending}
            disabled={name.trim().length < 2}
            onClick={() => createMutation.mutate()}
          >
            {t("team:create")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export function AcceptInvitePage() {
  const { token = "" } = useParams();
  const { t } = useTranslation("team");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => appApi.acceptInvite(token),
    onSuccess: () => setDone(true),
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border border-border bg-surface p-6">
      <h1 className="text-xl font-semibold">{t("acceptInvite")}</h1>
      {done ? (
        <p className="text-sm text-success">{t("inviteAccepted")}</p>
      ) : (
        <>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
            {t("acceptInvite")}
          </Button>
        </>
      )}
      <Link to="/app/team" className="block text-sm text-accent hover:underline">
        {t("title")}
      </Link>
    </div>
  );
}
