import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { LOCALE_STORAGE_KEY } from "@/i18n";
import { appApi } from "@/services/app";

export function ProfilePage() {
  const { t, i18n } = useTranslation(["profile", "common"]);
  const { user, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [skills, setSkills] = useState((user?.skills ?? []).join(", "));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setBio(user.bio ?? "");
    setSkills((user.skills ?? []).join(", "));
  }, [user]);

  const projectsQuery = useQuery({
    queryKey: ["profile-projects"],
    queryFn: appApi.profileProjects,
  });

  const mutation = useMutation({
    mutationFn: () =>
      appApi.updateProfile({
        name: name.trim(),
        bio: bio.trim() || null,
        skills: skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        preferredLocale: i18n.language === "en" ? "en" : "pt-BR",
        preferredTheme: theme,
      }),
    onSuccess: (result) => {
      setUser(result.user);
      setSaved(true);
      void queryClient.invalidateQueries({ queryKey: ["profile-projects"] });
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (!user) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("profile:title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("profile:subtitle")}</p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <Input label={t("profile:name")} value={name} onChange={(e) => setName(e.target.value)} />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-fg-muted">{t("profile:bio")}</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-24 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <Input
          label={t("profile:skills")}
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder={t("profile:skillsHint")}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg-muted">{t("profile:locale")}</span>
            <select
              value={i18n.language === "en" ? "en" : "pt-BR"}
              onChange={(e) => {
                const locale = e.target.value;
                localStorage.setItem(LOCALE_STORAGE_KEY, locale);
                void i18n.changeLanguage(locale);
              }}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="pt-BR">Português</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg-muted">{t("profile:theme")}</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="system">{t("common:theme.system")}</option>
              <option value="light">{t("common:theme.light")}</option>
              <option value="dark">{t("common:theme.dark")}</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
            {t("profile:save")}
          </Button>
          {saved ? <span className="text-sm text-success">{t("profile:saved")}</span> : null}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold">{t("profile:projects")}</h2>
        <ul className="space-y-2">
          {(projectsQuery.data?.projects ?? []).map((project) => (
            <li key={project.id}>
              <Link
                to={`/app/projects/${project.id}/board`}
                className="flex items-center gap-2 text-sm text-accent hover:underline"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
