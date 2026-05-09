"use client";

import { useState } from "react";
import {
  COUNTDOWN_THEMES,
  type CountdownInput,
  type CountdownTheme,
} from "@/domain/types/countdown";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  initial: CountdownInput;
};

export function CountdownEditor({ action, initial }: Props) {
  const [form, setForm] = useState<CountdownInput>(initial);

  const update = <K extends keyof CountdownInput>(
    key: K,
    value: CountdownInput[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form action={action} className="space-y-4">
      <Field label="タイトル">
        <input
          name="title"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </Field>

      <Field label="目標日時">
        <input
          type="datetime-local"
          name="targetAt"
          required
          value={form.targetAt}
          onChange={(e) => update("targetAt", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </Field>

      <Field label="終了時のメッセージ">
        <input
          name="finishedMessage"
          value={form.finishedMessage}
          onChange={(e) => update("finishedMessage", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="テーマ">
          <select
            name="theme"
            value={form.theme}
            onChange={(e) => update("theme", e.target.value as CountdownTheme)}
            className="w-full rounded border bg-white px-3 py-2"
          >
            {COUNTDOWN_THEMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="アクセントカラー">
          <input
            type="color"
            name="accentColor"
            value={form.accentColor}
            onChange={(e) => update("accentColor", e.target.value)}
            className="h-10 w-full rounded border"
          />
        </Field>
      </div>

      <Field label="表示する単位">
        <div className="flex flex-wrap gap-4">
          {(
            [
              ["showDays", "日"],
              ["showHours", "時間"],
              ["showMinutes", "分"],
              ["showSeconds", "秒"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                name={key}
                checked={form[key]}
                onChange={(e) => update(key, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
      </Field>

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        保存
      </button>
    </form>
  );
}

// レイアウト用の小さなヘルパー（ラベル + 入力 1 ペア）
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
