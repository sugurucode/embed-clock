import Link from "next/link";
import { CountdownEditor } from "@/components/CountdownEditor.client";
import { createCountdown } from "@/actions/countdown";
import { DEFAULT_INPUT } from "@/domain/types/countdown";

export default function NewCountdownPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">新規カウントダウン</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← 一覧
        </Link>
      </div>

      <CountdownEditor action={createCountdown} initial={DEFAULT_INPUT} />
    </main>
  );
}
