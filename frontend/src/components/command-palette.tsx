import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { appApi } from "@/services/app";

type CommandPaletteProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof appApi.search>> | null>(
    null,
  );
  const navigate = useNavigate();
  const { t } = useTranslation("nav");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => {
      void appApi.search(query).then(setResults).catch(() => setResults(null));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query, open]);

  if (!open) return null;

  function go(path: string) {
    setOpen(false);
    setQuery("");
    navigate(path);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[15vh]">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        onClick={() => setOpen(false)}
      />
      <Command
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-lg border border-border bg-surface shadow-xl"
        shouldFilter={false}
      >
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder={t("search")}
          className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none"
        />
        <Command.List className="max-h-80 overflow-auto p-2">
          <Command.Empty className="px-2 py-6 text-center text-sm text-fg-muted">—</Command.Empty>

          <Command.Group heading="Navigate" className="text-xs text-fg-subtle">
            {[
              ["/app", "Dashboard"],
              ["/app/projects", "Projects"],
              ["/app/calendar", "Calendar"],
              ["/app/team", "Team"],
              ["/app/settings", "Settings"],
            ].map(([path, label]) => (
              <Command.Item
                key={path}
                onSelect={() => go(path)}
                className="cursor-pointer rounded-md px-2 py-2 text-sm aria-selected:bg-canvas"
              >
                {label}
              </Command.Item>
            ))}
          </Command.Group>

          {(results?.projects.length ?? 0) > 0 ? (
            <Command.Group heading="Projects" className="mt-2 text-xs text-fg-subtle">
              {results!.projects.map((project) => (
                <Command.Item
                  key={project.id}
                  onSelect={() => go(`/app/projects/${project.id}/board`)}
                  className="cursor-pointer rounded-md px-2 py-2 text-sm aria-selected:bg-canvas"
                >
                  {project.key} · {project.name}
                </Command.Item>
              ))}
            </Command.Group>
          ) : null}

          {(results?.tasks.length ?? 0) > 0 ? (
            <Command.Group heading="Tasks" className="mt-2 text-xs text-fg-subtle">
              {results!.tasks.map((task) => (
                <Command.Item
                  key={task.id}
                  onSelect={() => go(`/app/projects/${task.projectId}/board`)}
                  className="cursor-pointer rounded-md px-2 py-2 text-sm aria-selected:bg-canvas"
                >
                  {task.projectKey} · {task.title}
                </Command.Item>
              ))}
            </Command.Group>
          ) : null}
        </Command.List>
      </Command>
    </div>
  );
}
