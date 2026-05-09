// src/actions/countdown.ts
//
// カウントダウンの CRUD を行う Server Actions。
// "use server" 指令により、このファイル内のすべての export 関数が
// 「クライアントから呼べるサーバ関数」になる。
//
// 内部の流れ:
//   1. parseInput(formData)    フォーム → 構造化データ
//   2. validateInput(input)    必須チェック等
//   3. prisma.countdown.*      DB 操作
//   4. revalidatePath(...)     一覧などのキャッシュを無効化（再生成）
//   5. redirect(...)           次の画面へ遷移

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/infra/prisma";
import { parseInput, validateInput } from "@/domain/countdown";

// =============================================================================
// 新規作成
// =============================================================================

export async function createCountdown(formData: FormData) {
  const input = parseInput(formData);
  const error = validateInput(input);
  if (error) throw new Error(error);

  const created = await prisma.countdown.create({
    data: {
      ...input,
      // input.targetAt は ISO 文字列。Prisma の DateTime カラムには Date を渡したいので変換。
      targetAt: new Date(input.targetAt),
    },
    select: { id: true }, // 戻り値は id だけで十分
  });

  revalidatePath("/");
  redirect(`/countdowns/${created.id}/edit`);
}

// =============================================================================
// 更新
// =============================================================================

export async function updateCountdown(id: string, formData: FormData) {
  const input = parseInput(formData);
  const error = validateInput(input);
  if (error) throw new Error(error);

  await prisma.countdown.update({
    where: { id },
    data: {
      ...input,
      targetAt: new Date(input.targetAt),
    },
  });

  revalidatePath("/");
  revalidatePath(`/countdowns/${id}/edit`);
}

// =============================================================================
// 削除
// =============================================================================

export async function deleteCountdown(id: string) {
  await prisma.countdown.delete({ where: { id } });
  revalidatePath("/");
}

// =============================================================================
// 公開 / 非公開
// =============================================================================

export async function publishCountdown(id: string) {
  await prisma.countdown.update({
    where: { id },
    data: {
      status: "published",
      publishedAt: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath(`/countdowns/${id}/edit`);
  redirect(`/countdowns/${id}/embed`);
}

export async function unpublishCountdown(id: string) {
  await prisma.countdown.update({
    where: { id },
    data: {
      status: "draft",
      publishedAt: null,
    },
  });

  revalidatePath("/");
  revalidatePath(`/countdowns/${id}/edit`);
}

// SECURITY: 認証なし & 所有者チェックなしのため、id を知っている誰でも
// update / delete / publish を呼べてしまう。短期デモ用なので意図的に放置。
// 本番運用なら、自分のレコードしか触れないように所有者チェックを入れる。
