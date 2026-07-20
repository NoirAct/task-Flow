import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { appApi } from "@/services/app";
import { cn } from "@/utils/cn";

type View = "month" | "week" | "agenda";

export function CalendarPage() {
  const { t } = useTranslation("calendar");
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date());

  const range = useMemo(() => {
    if (view === "week") {
      return { from: startOfWeek(cursor), to: endOfWeek(cursor) };
    }
    if (view === "agenda") {
      return { from: startOfMonth(cursor), to: endOfMonth(addDays(cursor, 60)) };
    }
    return { from: startOfMonth(cursor), to: endOfMonth(cursor) };
  }, [cursor, view]);

  const { data, isLoading } = useQuery({
    queryKey: ["calendar", range.from.toISOString(), range.to.toISOString()],
    queryFn: () => appApi.calendar(range.from.toISOString(), range.to.toISOString()),
  });

  const events = data?.events ?? [];

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    const days: Date[] = [];
    for (let day = start; day <= end; day = addDays(day, 1)) days.push(day);
    return days;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [cursor]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("title")}</h1>
          <p className="mt-1 text-sm text-fg-muted">{t("subtitle")}</p>
        </div>
        <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
          {(["month", "week", "agenda"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={cn(
                "rounded px-2.5 py-1.5 text-xs font-medium",
                view === item ? "bg-canvas text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              {t(item)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-border px-2 py-1 text-sm"
          onClick={() => setCursor(addDays(cursor, view === "week" ? -7 : -30))}
        >
          ←
        </button>
        <p className="text-sm font-medium text-fg">{format(cursor, "MMMM yyyy")}</p>
        <button
          type="button"
          className="rounded-md border border-border px-2 py-1 text-sm"
          onClick={() => setCursor(addDays(cursor, view === "week" ? 7 : 30))}
        >
          →
        </button>
        <button
          type="button"
          className="ml-2 rounded-md border border-border px-2 py-1 text-sm"
          onClick={() => setCursor(new Date())}
        >
          {t("today")}
        </button>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : view === "agenda" ? (
        events.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-fg">{event.title}</p>
                  <p className="text-xs text-fg-muted">
                    {event.project.key} · {format(new Date(event.dueDate), "PPP")}
                  </p>
                </div>
                <Link
                  to={`/app/projects/${event.project.id}/board`}
                  className="text-xs text-accent hover:underline"
                >
                  {event.project.name}
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
          {(view === "month" ? monthDays : weekDays).map((day) => {
            const dayEvents = events.filter((event) =>
              isSameDay(new Date(event.dueDate), day),
            );
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-24 bg-surface p-2",
                  view === "month" && !isSameMonth(day, cursor) && "opacity-40",
                )}
              >
                <p className="text-xs font-medium text-fg-muted">{format(day, "d")}</p>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <Link
                      key={event.id}
                      to={`/app/projects/${event.project.id}/board`}
                      className="block truncate rounded px-1 py-0.5 text-[10px] text-white"
                      style={{ backgroundColor: event.project.color }}
                      title={event.title}
                    >
                      {event.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
