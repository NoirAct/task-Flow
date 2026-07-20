import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { boardApi } from "@/services/board";
import type { TaskPriority, UserSummary } from "@/types/board";
import { cn } from "@/utils/cn";

const PRIORITIES: TaskPriority[] = ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"];

const LABEL_COLORS = ["#1f6feb", "#1a7f37", "#bf8700", "#cf222e", "#8250df", "#8b95a5"];

type TaskDetailDialogProps = {
  taskId: string | null;
  projectId: string;
  assignees: UserSummary[];
  open: boolean;
  onClose: () => void;
};

function toDateInput(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function TaskDetailDialog({
  taskId,
  projectId,
  assignees,
  open,
  onClose,
}: TaskDetailDialogProps) {
  const { t } = useTranslation(["board", "common"]);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => boardApi.getTask(taskId!),
    enabled: open && Boolean(taskId),
  });

  const { data: labelsData } = useQuery({
    queryKey: ["labels", projectId],
    queryFn: () => boardApi.listLabels(projectId),
    enabled: open && Boolean(projectId),
  });

  const task = data?.task;
  const labels = labelsData?.labels ?? [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("NONE");
  const [dueDate, setDueDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [spentMinutes, setSpentMinutes] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [checklistTitle, setChecklistTitle] = useState("");

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setDueDate(toDateInput(task.dueDate));
    setEstimatedMinutes(task.estimatedMinutes?.toString() ?? "");
    setSpentMinutes(task.spentMinutes.toString());
    setAssigneeId(task.assigneeId ?? "");
    setSelectedLabelIds(task.labels.map((label) => label.id));
  }, [task]);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["task", taskId] }),
      queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["labels", projectId] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      boardApi.updateTask(taskId!, {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        priority,
        dueDate: dueDate ? new Date(`${dueDate}T12:00:00.000Z`).toISOString() : null,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
        spentMinutes: spentMinutes ? Number(spentMinutes) : 0,
        assigneeId: assigneeId || null,
        labelIds: selectedLabelIds,
      }),
    onSuccess: invalidate,
  });

  const createLabelMutation = useMutation({
    mutationFn: () =>
      boardApi.createLabel(projectId, {
        name: newLabelName.trim(),
        color: LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)],
      }),
    onSuccess: async (result) => {
      setSelectedLabelIds((current) => [...current, result.label.id]);
      setNewLabelName("");
      await invalidate();
    },
  });

  const addChecklistMutation = useMutation({
    mutationFn: () => boardApi.addChecklistItem(taskId!, checklistTitle.trim()),
    onSuccess: async () => {
      setChecklistTitle("");
      await invalidate();
    },
  });

  const toggleChecklistMutation = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      boardApi.updateChecklistItem(id, { done }),
    onSuccess: invalidate,
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: (id: string) => boardApi.deleteChecklistItem(id),
    onSuccess: invalidate,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("board:details")}
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      {isLoading || !task ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="space-y-5">
          <Input
            label={t("board:taskTitle")}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg-muted">{t("board:description")}</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("board:descriptionPlaceholder")}
              className="min-h-28 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-fg-muted">{t("board:priority")}</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
                className="h-10 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-accent"
              >
                {PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {t(`board:priorities.${value}`)}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label={t("board:dueDate")}
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-fg-muted">{t("board:assignee")}</span>
              <select
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
                className="h-10 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-accent"
              >
                <option value="">{t("board:unassigned")}</option>
                {assignees.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t("board:estimated")}
                type="number"
                min={0}
                value={estimatedMinutes}
                onChange={(event) => setEstimatedMinutes(event.target.value)}
              />
              <Input
                label={t("board:spent")}
                type="number"
                min={0}
                value={spentMinutes}
                onChange={(event) => setSpentMinutes(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-fg-muted">{t("board:labels")}</span>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => {
                const selected = selectedLabelIds.includes(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() =>
                      setSelectedLabelIds((current) =>
                        selected
                          ? current.filter((id) => id !== label.id)
                          : [...current, label.id],
                      )
                    }
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs font-medium transition-opacity",
                      selected ? "opacity-100" : "opacity-50",
                    )}
                    style={{
                      backgroundColor: `${label.color}22`,
                      borderColor: label.color,
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={newLabelName}
                onChange={(event) => setNewLabelName(event.target.value)}
                placeholder={t("board:newLabel")}
                className="h-9 flex-1 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-accent"
              />
              <Button
                size="sm"
                variant="secondary"
                disabled={!newLabelName.trim()}
                loading={createLabelMutation.isPending}
                onClick={() => createLabelMutation.mutate()}
              >
                {t("board:addLabel")}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-fg-muted">{t("board:checklist")}</span>
              <Badge>
                {task.checklist.filter((item) => item.done).length}/{task.checklist.length}
              </Badge>
            </div>
            <ul className="space-y-1.5">
              {task.checklist.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(event) =>
                      toggleChecklistMutation.mutate({
                        id: item.id,
                        done: event.target.checked,
                      })
                    }
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      item.done && "text-fg-muted line-through",
                    )}
                  >
                    {item.title}
                  </span>
                  <button
                    type="button"
                    className="rounded p-1 text-fg-subtle hover:text-danger"
                    onClick={() => deleteChecklistMutation.mutate(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                value={checklistTitle}
                onChange={(event) => setChecklistTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && checklistTitle.trim()) {
                    addChecklistMutation.mutate();
                  }
                }}
                placeholder={t("board:checklistPlaceholder")}
                className="h-9 flex-1 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-accent"
              />
              <Button
                size="sm"
                disabled={!checklistTitle.trim()}
                loading={addChecklistMutation.isPending}
                onClick={() => addChecklistMutation.mutate()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="secondary" onClick={onClose}>
              {t("common:actions.cancel")}
            </Button>
            <Button
              loading={saveMutation.isPending}
              disabled={!title.trim()}
              onClick={() => saveMutation.mutate()}
            >
              {t("board:save")}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
