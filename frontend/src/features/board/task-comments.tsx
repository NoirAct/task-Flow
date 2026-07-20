import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Paperclip, Smile, Trash2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { boardApi } from "@/services/board";
import type { TaskAttachment, TaskComment } from "@/types/board";

const EMOJIS = ["👍", "🎉", "✅", "🔥", "👀", "💡", "🚀", "❤️"];

type TaskCommentsProps = {
  taskId: string;
  comments: TaskComment[];
  attachments: TaskAttachment[];
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskComments({ taskId, comments, attachments }: TaskCommentsProps) {
  const { t } = useTranslation(["board", "common"]);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["task", taskId] });

  const createMutation = useMutation({
    mutationFn: () => boardApi.createComment(taskId, body.trim()),
    onSuccess: async () => {
      setBody("");
      await invalidate();
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: boardApi.deleteComment,
    onSuccess: invalidate,
  });

  const uploadTaskMutation = useMutation({
    mutationFn: (file: File) => boardApi.uploadTaskAttachment(taskId, file),
    onSuccess: invalidate,
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: boardApi.deleteAttachment,
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-fg">{t("board:attachments")}</h3>
        {attachments.length === 0 ? (
          <p className="text-xs text-fg-subtle">{t("board:noAttachments")}</p>
        ) : (
          <ul className="space-y-1.5">
            {attachments.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm"
              >
                <Paperclip className="h-3.5 w-3.5 text-fg-subtle" />
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left text-accent hover:underline"
                  onClick={() => void boardApi.downloadAttachment(file)}
                >
                  {file.originalName}
                </button>
                <span className="text-xs text-fg-subtle">{formatBytes(file.size)}</span>
                {user?.id === file.uploadedBy?.id ? (
                  <button
                    type="button"
                    className="rounded p-1 text-fg-subtle hover:text-danger"
                    onClick={() => deleteAttachmentMutation.mutate(file.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-accent hover:underline">
          <Paperclip className="h-4 w-4" />
          {t("board:uploadFile")}
          <input
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadTaskMutation.mutate(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-fg">{t("board:comments")}</h3>

        {comments.length === 0 ? (
          <p className="text-xs text-fg-subtle">{t("board:noComments")}</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-md border border-border p-3">
                <div className="mb-2 flex items-center gap-2">
                  {comment.author ? (
                    <Avatar name={comment.author.name} src={comment.author.avatarUrl} size="sm" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">
                      {comment.author?.name ?? "—"}
                    </p>
                    <p className="text-[11px] text-fg-subtle">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {user?.id === comment.author?.id ? (
                    <button
                      type="button"
                      className="rounded p-1 text-fg-subtle hover:text-danger"
                      onClick={() => {
                        if (window.confirm(t("board:confirmDeleteComment"))) {
                          deleteCommentMutation.mutate(comment.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-fg [&_a]:text-accent [&_code]:rounded [&_code]:bg-canvas [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-canvas [&_pre]:p-3">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.body}</ReactMarkdown>
                </div>

                {comment.attachments.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {comment.attachments.map((file) => (
                      <li key={file.id}>
                        <button
                          type="button"
                          className="text-xs text-accent hover:underline"
                          onClick={() => void boardApi.downloadAttachment(file)}
                        >
                          {file.originalName}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2 rounded-md border border-border p-3">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={t("board:commentPlaceholder")}
            className="min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowEmoji((current) => !current)}
              >
                <Smile className="h-4 w-4" />
              </Button>
              {showEmoji ? (
                <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-md border border-border bg-surface p-1 shadow-lg">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="rounded px-1.5 py-1 text-base hover:bg-canvas"
                      onClick={() => {
                        setBody((current) => `${current}${emoji}`);
                        setShowEmoji(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : null}
              <span className="text-[11px] text-fg-subtle">{t("board:markdownHint")}</span>
            </div>
            <Button
              size="sm"
              disabled={!body.trim()}
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {t("board:postComment")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
