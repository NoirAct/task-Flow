import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TaskCard } from "@/features/board/task-card";
import { Button } from "@/components/ui/button";
import type { BoardColumn } from "@/types/board";
import { cn } from "@/utils/cn";

type BoardColumnProps = {
  column: BoardColumn;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onAddTask: (columnId: string, title: string) => Promise<void>;
  onOpenTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onRenameColumn: (columnId: string, name: string) => Promise<void>;
  onDeleteColumn: (columnId: string) => void;
  onMoveColumn: (columnId: string, direction: -1 | 1) => void;
};

export function BoardColumnView({
  column,
  canMoveLeft,
  canMoveRight,
  onAddTask,
  onOpenTask,
  onDeleteTask,
  onRenameColumn,
  onDeleteColumn,
  onMoveColumn,
}: BoardColumnProps) {
  const { t } = useTranslation(["board", "common"]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(column.name);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  const columnLabel = t(`columns.${column.key}`, { defaultValue: column.name });

  async function submitRename() {
    const value = renameValue.trim();
    setRenaming(false);
    if (!value || value === column.name) return;
    await onRenameColumn(column.id, value);
  }

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
        <div className="min-w-0 flex-1">
          {renaming ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onBlur={() => void submitRename()}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submitRename();
                if (event.key === "Escape") {
                  setRenaming(false);
                  setRenameValue(column.name);
                }
              }}
              className="h-7 w-full rounded-md border border-border bg-surface px-2 text-sm font-semibold outline-none focus:border-accent"
            />
          ) : (
            <>
              <h2 className="truncate text-sm font-semibold text-fg">{columnLabel}</h2>
              <p className="text-xs text-fg-muted">{column.tasks.length}</p>
            </>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label={t("board:columnMenu")}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-md p-1 text-fg-subtle hover:bg-canvas hover:text-fg"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-border bg-surface py-1 shadow-lg">
                <ColumnMenuItem
                  icon={<Pencil className="h-3.5 w-3.5" />}
                  label={t("board:renameColumn")}
                  onClick={() => {
                    setRenameValue(column.name);
                    setRenaming(true);
                    setMenuOpen(false);
                  }}
                />
                {canMoveLeft ? (
                  <ColumnMenuItem
                    icon={<ChevronLeft className="h-3.5 w-3.5" />}
                    label={t("board:moveColumnLeft")}
                    onClick={() => {
                      onMoveColumn(column.id, -1);
                      setMenuOpen(false);
                    }}
                  />
                ) : null}
                {canMoveRight ? (
                  <ColumnMenuItem
                    icon={<ChevronRight className="h-3.5 w-3.5" />}
                    label={t("board:moveColumnRight")}
                    onClick={() => {
                      onMoveColumn(column.id, 1);
                      setMenuOpen(false);
                    }}
                  />
                ) : null}
                <ColumnMenuItem
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  label={t("board:deleteColumn")}
                  danger
                  onClick={() => {
                    onDeleteColumn(column.id);
                    setMenuOpen(false);
                  }}
                />
              </div>
            </>
          ) : null}
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

function ColumnMenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
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
