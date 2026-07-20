import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { BoardTask } from "@/types/board";
import { cn } from "@/utils/cn";

type TaskCardProps = {
  task: BoardTask;
  onDelete: (taskId: string) => void;
};

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const { t } = useTranslation("board");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-md border border-border bg-surface-raised p-3 shadow-sm",
        isDragging && "z-20 opacity-80 ring-2 ring-accent/30",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none text-fg-subtle hover:text-fg active:cursor-grabbing"
          aria-label="Drag"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-fg">{task.title}</p>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-fg-muted">{task.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={t("deleteTask")}
          onClick={() => {
            if (window.confirm(t("confirmDelete"))) onDelete(task.id);
          }}
          className="rounded p-1 text-fg-subtle opacity-0 transition-opacity hover:bg-canvas hover:text-danger group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
