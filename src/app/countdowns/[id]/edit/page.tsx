import Link from "next/link";
import { notFound } from "next/navigation";
import { CountdownEditor } from "@/components/CountdownEditor.client";
import { prisma } from "@/infra/prisma";
import { fromPrisma, toLocalInputValue } from "@/domain/countdown";
import {
  publishCountdown,
  unpublishCountdown,
  updateCountdown,
} from "@/actions/countdown";

// 一覧ページと同じく、常に最新を引きたいので force-dynamic
export const dynamic = "force-dynamic";

export default async function EditCountdownPage({
  params,
}: {
  // Next.js 15+ では params が Promise になっている
  params: Promise<{ id: string }>;
}) {
  // ① 動的セグメントの値を取り出す
  const { id } = await params;

  // ② DB から該当レコードを取得
  const row = await prisma.countdown.findUnique({ where: { id } });

  // ③ 見つからなかったら Next.js の 404 ページに飛ばす
  // [サイ本: なし] notFound() は throw されると Next.js が拾って 404 を返す
  if (!row) notFound();

  // ④ Prisma の生型 → ドメイン型 に narrow
  const c = fromPrisma(row);

  // ⑤ DB の値（Date 型）を <input type="datetime-local"> 用の文字列に変換しつつ、
  //    CountdownInput の形にまとめる
  const initial = {
    title: c.title,
    targetAt: toLocalInputValue(c.targetAt),
    finishedMessage: c.finishedMessage,
    theme: c.theme,
    accentColor: c.accentColor,
    showDays: c.showDays,
    showHours: c.showHours,
    showMinutes: c.showMinutes,
    showSeconds: c.showSeconds,
  };

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">編集</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← 一覧
        </Link>
      </div>

      {/*
        action 引数に updateCountdown.bind(null, id) を渡す。
        updateCountdown のシグネチャは (id: string, formData: FormData) なので、
        bind で id を先付けして (formData: FormData) のシグネチャに揃える。
        [サイ本: 8.7] Function.prototype.bind の部分適用
      */}
      <CountdownEditor
        action={updateCountdown.bind(null, id)}
        initial={initial}
      />

      {/* ステータスに応じて公開/非公開ボタンを出し分け */}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-6">
        <span className="text-sm text-gray-500">
          現在のステータス: <strong>{c.status}</strong>
        </span>

        {c.status === "published" ? (
          <>
            <Link
              href={`/countdowns/${id}/embed`}
              className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
            >
              埋め込みコードを見る
            </Link>
            <form action={unpublishCountdown.bind(null, id)}>
              <button
                type="submit"
                className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
              >
                非公開に戻す
              </button>
            </form>
          </>
        ) : (
          <form action={publishCountdown.bind(null, id)}>
            <button
              type="submit"
              className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
            >
              公開する
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
