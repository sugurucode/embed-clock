// src/app/countdowns/[id]/embed/page.tsx
//
// 埋め込みコード表示ページ。Server Component。
//
// ここで生成する <script> タグを、ユーザーが自分の WordPress 等に貼ると
// widget.js が読み込まれて時計が動く（その仕組みの「入り口」）。

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/infra/prisma";
import { EmbedCodeBlock } from "@/components/EmbedCodeBlock.client";

export const dynamic = "force-dynamic";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 該当レコードの存在と公開状態だけ取得
  const row = await prisma.countdown.findUnique({
    where: { id },
    select: { id: true, title: true, status: true },
  });
  if (!row) notFound();

  // ─────────────────────────────────────────────────────────────
  // 埋め込みコードを組み立てる:
  //   <script src="<このアプリのオリジン>/widget.js"
  //           data-id="<UUID>" async></script>
  //
  //   - origin: 環境変数 NEXT_PUBLIC_APP_ORIGIN から取得
  //     （ローカルは http://localhost:3000、本番は Vercel URL 等）
  //   - data-id: widget.js が拾って /api/config?id=... を叩くためのキー
  //   - async:   ページの描画をブロックしないようにする属性
  // ─────────────────────────────────────────────────────────────
  const origin =
    process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000";
  const snippet = `<script src="${origin}/widget.js" data-id="${id}" async></script>`;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">埋め込みコード</h1>
        <Link
          href={`/countdowns/${id}/edit`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← 編集に戻る
        </Link>
      </div>

      <p className="mb-4 text-gray-600">
        以下の <code>{"<script>"}</code>{" "}
        タグをコピーして、WordPress などお使いのページに貼り付けてください。
      </p>

      <EmbedCodeBlock code={snippet} />

      {row.status !== "published" && (
        <p className="mt-4 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
          ⚠ このカウントダウンはまだ公開されていません。公開するまで埋め込み先では表示されません。
        </p>
      )}
    </main>
  );
}
