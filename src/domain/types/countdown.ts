// =============================================================================
// 列挙型（文字列 union）
// =============================================================================

export const COUNTDOWN_THEMES = ["light", "dark", "retro"] as const;
export type CountdownTheme = (typeof COUNTDOWN_THEMES)[number];

export const COUNTDOWN_STATUSES = ["draft", "published"] as const;
export type CountdownStatus = (typeof COUNTDOWN_STATUSES)[number];

/** value が CountdownTheme のいずれかかを実行時に判定する型ガード */
export function isCountdownTheme(v: unknown): v is CountdownTheme {
  // returnがtrueならば、vはCountdownThemeであるとコンパイラに伝える
  return (
    typeof v === "string" && (COUNTDOWN_THEMES as readonly string[]).includes(v)
  ); // COUNTDOWN_THEMESをstring[]として扱い、vがその中に含まれているかを判定
}

/** value が CountdownStatus のいずれかかを実行時に判定する型ガード */
export function isCountdownStatus(v: unknown): v is CountdownStatus {
  return (
    typeof v === "string" &&
    (COUNTDOWN_STATUSES as readonly string[]).includes(v)
  );
}

/**
 * カウントダウンの完全形（DB から読み出した状態に相当）。
 * 後から多態性を持たせるため、必要なプロパティを全て含む形で定義している。
 */
export type Countdown = {
  id: string;
  title: string;
  targetAt: Date;
  finishedMessage: string;
  theme: CountdownTheme;
  accentColor: string;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  status: CountdownStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * CountdownInput は、カウントダウンの新規作成や編集の際にユーザーが入力するデータの型。
 */
export type CountdownInput = {
  title: string;
  targetAt: string; // ISO 文字列
  finishedMessage: string;
  theme: CountdownTheme;
  accentColor: string;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
};

/** 新規作成画面で初期表示する空の入力 */
export const DEFAULT_INPUT: CountdownInput = {
  title: "",
  targetAt: "",
  finishedMessage: "Time is up!",
  theme: "light",
  accentColor: "#2563eb",
  showDays: true,
  showHours: true,
  showMinutes: true,
  showSeconds: true,
};
