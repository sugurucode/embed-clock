// src/components/EmbedCodeBlock.client.tsx
//
// 埋め込みコード（<script> タグの文字列）を表示してコピーボタンを付けるだけの小物。
// useRef + Clipboard API でサイ本 15 章スタイル寄りに書く。

"use client";

import { useRef, useState } from "react";

export function EmbedCodeBlock({ code }: { code: string }) {
  // ボタンの「コピーしました」表示の切替だけ React state にする（小さい状態）
  const [copied, setCopied] = useState(false);
  // setTimeout の id を覚えておくための ref（再クリック時に前のタイマーを破棄するため）
  const timerRef = useRef<number | null>(null);

  // コピーボタン押下時の async ハンドラ
  // [サイ本: 13章 async/await]
  const handleCopy = async () => {
    try {
      // [サイ本: 15章周辺] Clipboard API でテキストを書き込む（Promise を返す）
      await navigator.clipboard.writeText(code);
      setCopied(true);

      // 1.5 秒後に元に戻す。前のタイマーが残っていたらキャンセル。
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // 権限拒否 / 古いブラウザ等の救済
      console.error(e);
      alert("コピーに失敗しました。手動で選択してコピーしてください。");
    }
  };

  return (
    <div>
      <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-2 rounded border px-3 py-1 text-sm hover:bg-gray-50"
      >
        {copied ? "コピーしました" : "コードをコピー"}
      </button>
    </div>
  );
}
