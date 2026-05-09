import Link from "next/link";
import { prisma } from "@/infra/prisma";
import { fromPrisma } from "@/domain/countdown";
import { CountdownCard } from "@/components/CountdownCard";

// Next.js の「ページキャッシュ」を無効化。常に最新の DB を引く。
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = await prisma.countdown.findMany({
    orderBy: { createdAt: "desc" },
  });
  const countdowns = rows.map(fromPrisma);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-8 sm:py-14">
      <header className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            embed-clock
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            埋め込み型カウントダウン時計の管理ダッシュボード
          </p>
        </div>
        <Link
          href="/countdowns/new"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          + 新規作成
        </Link>
      </header>

      {countdowns.length > 0 && (
        <div className="mb-4 text-sm text-gray-500">
          全 <strong className="text-gray-900">{countdowns.length}</strong> 件
        </div>
      )}

      {countdowns.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <p className="text-base text-gray-700">
            まだカウントダウンはありません
          </p>
          <p className="mt-2 text-sm text-gray-500">
            右上の「+ 新規作成」から最初の 1 つを作ってみましょう
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {countdowns.map((c) => (
            <CountdownCard key={c.id} countdown={c} />
          ))}
        </ul>
      )}
    </main>
  );
}
