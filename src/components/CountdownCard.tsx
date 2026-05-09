import { deleteCountdown } from "@/actions/countdown";
import Link from "next/link";
import { CountdownTimer } from "./CountdownTimer.client";
import type { Countdown } from "@/domain/types/countdown";

type Props = {
  countdown: Countdown;
};

export function CountdownCard({ countdown }: Props) {
  return (
    <li className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* タイトル + ステータスバッジ */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <Link
          href={`/countdowns/${countdown.id}/edit`}
          className="truncate text-lg font-semibold text-gray-900 hover:underline"
        >
          {countdown.title}
        </Link>
        <span
          className={
            countdown.status === "published"
              ? "shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"
              : "shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500"
          }
        >
          {countdown.status}
        </span>
      </div>

      {/* 目標日時 */}
      <p className="mb-3 text-sm text-gray-500">
        目標:{" "}
        <span className="text-gray-700">
          {countdown.targetAt.toLocaleString("ja-JP")}
        </span>
      </p>

      {/* リアルタイム残り時間 + 進捗バー */}
      <CountdownTimer
        targetAt={countdown.targetAt}
        createdAt={countdown.createdAt}
      />

      {/* リンク群 */}
      <div className="mt-4 flex gap-4 border-t pt-3 text-sm">
        <Link
          href={`/countdowns/${countdown.id}/edit`}
          className="text-blue-600 hover:underline"
        >
          編集
        </Link>
        {countdown.status === "published" && (
          <Link
            href={`/countdowns/${countdown.id}/embed`}
            className="text-blue-600 hover:underline"
          >
            埋め込みコード
          </Link>
        )}
        <form
          action={deleteCountdown.bind(null, countdown.id)}
          className="ml-auto"
        >
          <button type="submit" className="text-red-600 hover:underline">
            削除
          </button>
        </form>
      </div>
    </li>
  );
}
