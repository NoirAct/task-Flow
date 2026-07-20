import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, CheckSquare, GripVertical, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { BoardTask } from "@/types/board";
import { cn } from "@/utils/cn";

type TaskCardProps = {
  task: BoardTask;
  onOpen: (taskId: string) => void;
  onDelete: (taskId: string) => void;
};

const priorityTone: Record<string, "neutral" | "accent" | "success" | "danger"> = {
  NONE: "neutral",
  LOW: "success",
  MEDIUM: "accent",
  HIGH: "danger",
  URGENT: "danger",
};

export function TaskCard({ task, onOpen, onDelete }: TaskCardProps) {
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

        <button
          type="button"
          className="min-w-0 flex-1 cursor-pointer text-left"
          onClick={() => onOpen(task.id)}
        >
          <p className="text-sm font-medium text-fg">{task.title}</p>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-fg-muted">{task.description}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {task.priority !== "NONE" ? (
              <Badge tone={priorityTone[task.priority]}>
                {t(`priorities.${task.priority}`)}
              </Badge>
            ) : null}
            {task.labels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${label.color}22`, color: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-2 text-[11px] text-fg-subtle">
            {task.dueDate ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {task.dueDate.slice(0, 10)}
              </span>
            ) : null}
            {task.checklistTotal > 0 ? (
              <span className="inline-flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                {task.checklistDone}/{task.checklistTotal}
              </span>
            ) : null}
            {task.assignee ? <Avatar name={task.assignee.name} size="sm" className="h-5 w-5 text-[9px]" /> : null}
          </div>
        </button>

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
