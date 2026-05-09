// src/infra/prisma.ts
import { PrismaClient } from "@prisma/client";

// hot reload でも 1 つのインスタンスを使い回すための定石パターン
// prismaClientインスタンスは作られる度にDB接続を確率するため、開発中にコードを変更するたびに新しいインスタンスが作られると、
// 接続がリークしてしまう。これを防ぐために、globalThisオブジェクトにprismaプロパティを追加して、既存のインスタンスがあればそれを再利用し、なければ新しいインスタンスを作成するようにしている。
// globalThisは、ブラウザではwindow、Node.jsではglobalオブジェクトを指すため、どちらの環境でも同じコードで動作する。
const g = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = g.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  g.prisma = prisma;
}

// SECURITY: DATABASE_URL は service-role 相当の権限で接続している。
// 認証なしの今の構成では「URL を知っている人 = DB に何でもできる」状態。
// 本番運用するなら ① Supabase Auth + RLS、② Server Actions 内での所有者チェック、のどちらかが必要。
