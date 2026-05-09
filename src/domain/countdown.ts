import type { Countdown as PrismaCountdown } from "@prisma/client";
import type { Countdown, CountdownInput } from "@/domain/types/countdown";
import { isCountdownStatus, isCountdownTheme } from "@/domain/types/countdown";

// =============================================================================
// Prisma → Domain 変換（境界）
// =============================================================================

/**
 * PrismaのCountdown型は、DBの行をそのまま表す型で、themeやstatusはstring型になっている。
 * Prisma は theme/status を string にしか型付けできないので、ここで実行時に検証して narrow する。
 * 万一 DB に未知の値が入っていれば、ここで早期に例外を投げて気付ける。
 */
export function fromPrisma(row: PrismaCountdown): Countdown {
  if (!isCountdownTheme(row.theme)) {
    throw new Error(`Invalid theme value in DB: ${row.theme}`);
  }
  if (!isCountdownStatus(row.status)) {
    throw new Error(`Invalid status value in DB: ${row.status}`);
  }
  // ↑ ここを抜けた時点で、row.theme は CountdownTheme、row.status は CountdownStatus
  return {
    ...row,
    theme: row.theme,
    status: row.status,
  };
}

// =============================================================================
// FormData ↔ ドメイン型 変換
// =============================================================================

export function parseInput(formData: FormData): CountdownInput {
  // フォームから来る日時をISO文字に変換するために、Dateに渡す必要がある。
  //　Dateに渡すにはformDataから取り出した値はstringである必要があるので、String()でラップしている。
  const rawTarget = String(formData.get("targetAt") ?? "");
  // ISOStringとは、国際標準化機構（ISO）が定めた日付と時刻の表記方法で、YYYY-MM-DDTHH:mm:ss.sssZの形式を持つ。
  const targetAt = rawTarget ? new Date(rawTarget).toISOString() : "";

  const rawTheme = formData.get("theme");
  // フォームから来る theme は信用できないので、未知の値ならデフォルトに倒す
  const theme = isCountdownTheme(rawTheme) ? rawTheme : "light";

  return {
    title: String(formData.get("title") ?? "").trim(), // trim() して空白だけの入力を空文字にする
    targetAt,
    finishedMessage:
      String(formData.get("finishedMessage") ?? "").trim() || "Time is up!",
    theme,
    accentColor: String(formData.get("accentColor") ?? "#2563eb"),
    showDays: formData.get("showDays") === "on", //
    showHours: formData.get("showHours") === "on",
    showMinutes: formData.get("showMinutes") === "on",
    showSeconds: formData.get("showSeconds") === "on",
  };
}

/**
 * Date or ISO 文字列 → "YYYY-MM-DDTHH:MM"（<input type="datetime-local"> 用）。
 * ローカルタイムゾーンでフォーマット。
 */
export function toLocalInputValue(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  // padが必要な理由は、月や日、時間、分が1桁の場合にゼロ埋めして2桁にするため。例えば、月が6月の場合、pad(6)は"06"を返す。
  const pad = (n: number) => String(n).padStart(2, "0");
  // 例: 2024-06-30T14:30
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// =============================================================================
// バリデーション
// =============================================================================

/**
 * SECURITY: 必須チェック程度しかしていない。XSS / HTML タグ混入対策はしていない。
 * Web Components 側で textContent で描画する想定なので XSS は入りにくいが、
 * 設計が変わるなら要見直し。
 */
export function validateInput(input: CountdownInput): string | null {
  if (!input.title) return "タイトルは必須です";
  if (!input.targetAt) return "目標日時は必須です";
  if (!/^#[0-9a-fA-F]{6}$/.test(input.accentColor)) {
    return "アクセントカラーは #RRGGBB 形式で指定してください";
  }
  if (
    !input.showDays &&
    !input.showHours &&
    !input.showMinutes &&
    !input.showSeconds
  ) {
    return "少なくとも 1 つの単位を表示する必要があります";
  }
  return null;
}
