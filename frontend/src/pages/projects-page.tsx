import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ProjectFormDialog, type ProjectFormValues } from "@/features/projects/project-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { projectsApi } from "@/services/projects";
import type { Project, ProjectStatus } from "@/types/project";
import { cn } from "@/utils/cn";

type ArchiveFilter = "false" | "true" | "all";

const PER_PAGE = 12;

export function ProjectsPage() {
  const { t } = useTranslation(["projects", "common"]);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState<ArchiveFilter>("false");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, archived, favoritesOnly, status]);

  const listParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      archived,
      favorites: favoritesOnly ? ("true" as const) : undefined,
      status: status || undefined,
      page,
      perPage: PER_PAGE,
    }),
    [search, archived, favoritesOnly, status, page],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["projects", listParams],
    queryFn: () => projectsApi.list(listParams),
  });

  const projects = data?.projects ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["projects"] });

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      invalidate();
      toast.success(t("projects:toast.created"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string } & ProjectFormValues) =>
      projectsApi.update(id, body),
    onSuccess: () => {
      invalidate();
      toast.success(t("projects:toast.updated"));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: projectsApi.archive,
    onSuccess: () => {
      invalidate();
      toast.success(t("projects:toast.archived"));
    },
  });

  const restoreMutation = useMutation({
    mutationFn: projectsApi.restore,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: projectsApi.remove,
    onSuccess: () => {
      invalidate();
      toast.success(t("projects:toast.deleted"));
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: (project: Project) =>
      project.isFavorite ? projectsApi.unfavorite(project.id) : projectsApi.favorite(project.id),
    onSuccess: invalidate,
  });

  const duplicateMutation = useMutation({
    mutationFn: projectsApi.duplicate,
    onSuccess: invalidate,
  });

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setDialogOpen(true);
    setMenuOpenId(null);
  }

  async function handleFormSubmit(values: ProjectFormValues) {
    if (editing) {
      const { key: _key, ...rest } = values;
      await updateMutation.mutateAsync({ id: editing.id, ...rest });
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("projects:title")}</h1>
          <p className="mt-1 text-sm text-fg-muted">{t("projects:subtitle")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t("projects:create")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-55 flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
          <Search className="h-4 w-4 text-fg-subtle" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("projects:searchPlaceholder")}
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
        </div>

        <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
          {(
            [
              ["false", "filters.active"],
              ["true", "filters.archived"],
              ["all", "filters.all"],
            ] as const
          ).map(([value, labelKey]) => (
            <button
              key={value}
              type="button"
              onClick={() => setArchived(value)}
              className={cn(
                "rounded px-2.5 py-1.5 text-xs font-medium transition-colors",
                archived === value ? "bg-canvas text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              {t(`projects:${labelKey}`)}
            </button>
          ))}
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ProjectStatus | "")}
          className="h-9 rounded-md border border-border bg-surface px-2 text-sm text-fg outline-none focus:border-accent"
        >
          <option value="">{t("projects:filters.allStatuses")}</option>
          {(["ACTIVE", "PAUSED", "COMPLETED", "CANCELED"] as const).map((value) => (
            <option key={value} value={value}>
              {t(`projects:status.${value}`)}
            </option>
          ))}
        </select>

        <Button
          variant={favoritesOnly ? "primary" : "secondary"}
          size="sm"
          onClick={() => setFavoritesOnly((prev) => !prev)}
        >
          <Star className={cn("h-3.5 w-3.5", favoritesOnly && "fill-current")} />
          {t("projects:filters.favorites")}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-36" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title={search ? t("projects:emptySearch") : t("projects:emptyTitle")}
          description={search ? undefined : t("projects:emptyDescription")}
        />
      ) : (
        <div
          className={cn(
            "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
            isFetching && "opacity-80",
          )}
        >
          {projects.map((project) => (
            <article
              key={project.id}
              className="group relative rounded-lg border border-border bg-surface p-4 transition-colors hover:border-fg-subtle/40"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <Link
                  to={`/app/projects/${project.id}/board`}
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-bold text-white",
                      project.icon ? "text-lg" : "text-xs",
                    )}
                    style={{ backgroundColor: project.color }}
                  >
                    {project.icon || project.key.slice(0, 3)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-fg">{project.name}</h2>
                    <p className="text-xs text-fg-muted">{project.key}</p>
                  </div>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={
                      project.isFavorite
                        ? t("projects:actions.unfavorite")
                        : t("projects:actions.favorite")
                    }
                    onClick={() => favoriteMutation.mutate(project)}
                    className="rounded-md p-1.5 text-fg-subtle hover:bg-canvas hover:text-fg"
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        project.isFavorite && "fill-amber-400 text-amber-400",
                      )}
                    />
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Menu"
                      onClick={() =>
                        setMenuOpenId((current) => (current === project.id ? null : project.id))
                      }
                      className="rounded-md p-1.5 text-fg-subtle hover:bg-canvas hover:text-fg"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {menuOpenId === project.id ? (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10 cursor-default"
                          aria-label="Close menu"
                          onClick={() => setMenuOpenId(null)}
                        />
                        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-border bg-surface py-1 shadow-lg">
                          <MenuItem
                            icon={<Pencil className="h-3.5 w-3.5" />}
                            label={t("projects:actions.edit")}
                            onClick={() => openEdit(project)}
                          />
                          <MenuItem
                            icon={<Copy className="h-3.5 w-3.5" />}
                            label={t("projects:actions.duplicate")}
                            onClick={() => {
                              duplicateMutation.mutate(project.id);
                              setMenuOpenId(null);
                            }}
                          />
                          {project.isArchived ? (
                            <MenuItem
                              icon={<RotateCcw className="h-3.5 w-3.5" />}
                              label={t("projects:actions.restore")}
                              onClick={() => {
                                restoreMutation.mutate(project.id);
                                setMenuOpenId(null);
                              }}
                            />
                          ) : (
                            <MenuItem
                              icon={<Archive className="h-3.5 w-3.5" />}
                              label={t("projects:actions.archive")}
                              onClick={() => {
                                archiveMutation.mutate(project.id);
                                setMenuOpenId(null);
                              }}
                            />
                          )}
                          <MenuItem
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            label={t("projects:actions.delete")}
                            danger
                            onClick={() => {
                              if (window.confirm(t("projects:confirmDelete"))) {
                                deleteMutation.mutate(project.id);
                              }
                              setMenuOpenId(null);
                            }}
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <Link
                to={`/app/projects/${project.id}/board`}
                className="mt-1 block"
              >
                <p className="line-clamp-2 min-h-10 text-sm text-fg-muted">
                  {project.description || "—"}
                </p>
              </Link>

              {project.isArchived || project.status !== "ACTIVE" ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.status !== "ACTIVE" ? (
                    <Badge>{t(`projects:status.${project.status}`)}</Badge>
                  ) : null}
                  {project.isArchived ? <Badge>{t("projects:archivedBadge")}</Badge> : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-fg-muted">
            {t("projects:pagination.summary", { page, totalPages, total })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              {t("projects:pagination.previous")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              {t("projects:pagination.next")}
            </Button>
          </div>
        </div>
      ) : null}

      <ProjectFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        project={editing}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-canvas",
        danger ? "text-danger" : "text-fg",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
