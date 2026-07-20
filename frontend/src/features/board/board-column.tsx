import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TaskCard } from "@/features/board/task-card";
import { Button } from "@/components/ui/button";
import type { BoardColumn } from "@/types/board";
import { cn } from "@/utils/cn";

type BoardColumnProps = {
  column: BoardColumn;
  onAddTask: (columnId: string, title: string) => Promise<void>;
  onOpenTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
};

export function BoardColumnView({
  column,
  onAddTask,
  onOpenTask,
  onDeleteTask,
}: BoardColumnProps) {
  const { t } = useTranslation(["board", "common"]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  const columnLabel = t(`columns.${column.key}`, { defaultValue: column.name });

  async function submit() {
    const value = title.trim();
    if (!value) return;
    setSubmitting(true);
    try {
      await onAddTask(column.id, value);
      setTitle("");
      setAdding(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className={cn(
        "flex h-full w-72 shrink-0 flex-col rounded-lg border border-border bg-canvas/60",
        isOver && "border-accent/50 bg-accent-soft/40",
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-fg">{columnLabel}</h2>
          <p className="text-xs text-fg-muted">{column.tasks.length}</p>
        </div>
      </header>

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.length === 0 ? (
            <p className="px-1 py-6 text-center text-xs text-fg-subtle">{t("emptyColumn")}</p>
          ) : (
            column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpen={onOpenTask}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </SortableContext>
      </div>

      <div className="border-t border-border p-2">
        {adding ? (
          <div className="space-y-2">
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submit();
                if (event.key === "Escape") {
                  setAdding(false);
                  setTitle("");
                }
              }}
              placeholder={t("taskPlaceholder")}
              className="h-9 w-full rounded-md border border-border bg-surface px-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              aria-label={t("taskTitle")}
            />
            <div className="flex gap-2">
              <Button size="sm" loading={submitting} onClick={() => void submit()}>
                {t("addTask")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAdding(false);
                  setTitle("");
                }}
              >
                {t("actions.cancel", { ns: "common" })}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-fg-muted"
            onClick={() => setAdding(true)}
          >
            <Plus className="h-4 w-4" />
            {t("addTask")}
          </Button>
        )}
      </div>
    </section>
  );
}
