import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BoardColumnView } from "@/features/board/board-column";
import { TaskDetailDialog } from "@/features/board/task-detail-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { boardApi } from "@/services/board";
import type { Board, BoardColumn, BoardTask } from "@/types/board";
import { cn } from "@/utils/cn";

function findColumnByTaskId(columns: BoardColumn[], taskId: string) {
  return columns.find((column) => column.tasks.some((task) => task.id === taskId));
}

function cloneBoard(board: Board): Board {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.map((task) => ({ ...task })),
    })),
  };
}

export function BoardPage() {
  const { projectId = "" } = useParams();
  const { t } = useTranslation(["board", "common"]);
  const queryClient = useQueryClient();
  const [localBoard, setLocalBoard] = useState<Board | null>(null);
  const boardRef = useRef<Board | null>(null);
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => boardApi.getByProject(projectId),
    enabled: Boolean(projectId),
  });

  useEffect(() => {
    if (data?.board) {
      const cloned = cloneBoard(data.board);
      setLocalBoard(cloned);
      boardRef.current = cloned;
    }
  }, [data]);

  useEffect(() => {
    boardRef.current = localBoard;
  }, [localBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const createMutation = useMutation({
    mutationFn: boardApi.createTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: boardApi.deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
  });

  const moveMutation = useMutation({
    mutationFn: ({
      taskId,
      columnId,
      position,
    }: {
      taskId: string;
      columnId: string;
      position: number;
    }) => boardApi.moveTask(taskId, { columnId, position }),
    onError: () => queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
  });

  const columns = localBoard?.columns ?? [];

  function onDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as BoardTask | undefined;
    setActiveTask(task ?? null);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const board = boardRef.current;
    if (!over || !board) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const sourceColumn = findColumnByTaskId(board.columns, activeId);
    const overColumn =
      board.columns.find((column) => column.id === overId) ??
      findColumnByTaskId(board.columns, overId);

    if (!sourceColumn || !overColumn) return;
    if (sourceColumn.id === overColumn.id) return;

    setLocalBoard((prev) => {
      if (!prev) return prev;
      const next = cloneBoard(prev);
      const from = next.columns.find((column) => column.id === sourceColumn.id)!;
      const to = next.columns.find((column) => column.id === overColumn.id)!;
      const taskIndex = from.tasks.findIndex((task) => task.id === activeId);
      if (taskIndex < 0) return prev;
      const [task] = from.tasks.splice(taskIndex, 1);

      const overTaskIndex = to.tasks.findIndex((item) => item.id === overId);
      const insertIndex = overTaskIndex >= 0 ? overTaskIndex : to.tasks.length;
      task.columnId = to.id;
      to.tasks.splice(insertIndex, 0, task);
      boardRef.current = next;
      return next;
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    const board = boardRef.current;
    if (!over || !board) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    let working = board;
    const column =
      working.columns.find((item) => item.id === overId) ??
      findColumnByTaskId(working.columns, overId) ??
      findColumnByTaskId(working.columns, activeId);

    if (!column) return;

    let position = column.tasks.findIndex((task) => task.id === activeId);

    if (column.tasks.some((task) => task.id === overId) && activeId !== overId) {
      const oldIndex = column.tasks.findIndex((task) => task.id === activeId);
      const newIndex = column.tasks.findIndex((task) => task.id === overId);
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        const next = cloneBoard(working);
        const target = next.columns.find((item) => item.id === column.id)!;
        target.tasks = arrayMove(target.tasks, oldIndex, newIndex).map((task, index) => ({
          ...task,
          position: index,
          columnId: target.id,
        }));
        working = next;
        setLocalBoard(next);
        boardRef.current = next;
        position = newIndex;
      }
    }

    if (position < 0) {
      const current = findColumnByTaskId(working.columns, activeId);
      position = current?.tasks.findIndex((task) => task.id === activeId) ?? 0;
    }

    const finalColumn = findColumnByTaskId(working.columns, activeId);
    if (!finalColumn) return;

    moveMutation.mutate({
      taskId: activeId,
      columnId: finalColumn.id,
      position: Math.max(position, 0),
    });
  }

  if (isLoading || !localBoard) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-96 w-72 shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-danger-soft px-4 py-3 text-sm text-danger">
        {t("common:errors.generic")}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/app/projects"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-fg-muted hover:bg-canvas hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("board:back")}
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white"
            style={{ backgroundColor: localBoard.project.color }}
          >
            {localBoard.project.key.slice(0, 3)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-fg">
              {localBoard.project.name}
            </h1>
            <p className="text-xs text-fg-muted">{t("board:title")}</p>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
          {columns.map((column) => (
            <BoardColumnView
              key={column.id}
              column={column}
              onAddTask={async (columnId, title) => {
                await createMutation.mutateAsync({ columnId, title });
              }}
              onOpenTask={setSelectedTaskId}
              onDeleteTask={(taskId) => deleteMutation.mutate(taskId)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className={cn("w-72 rounded-md border border-border bg-surface-raised p-3 shadow-lg")}>
              <p className="text-sm font-medium text-fg">{activeTask.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailDialog
        open={Boolean(selectedTaskId)}
        taskId={selectedTaskId}
        projectId={projectId}
        assignees={localBoard.project.owner ? [localBoard.project.owner] : []}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
