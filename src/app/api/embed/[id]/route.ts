import { prisma } from "@/infra/prisma";
import { fromPrisma } from "@/domain/countdown"; // ← ★ 追加

export const dynamic = "force-dynamic";

// corsHeaders は GET と OPTIONS 両方で同じなので、共通の定数にしておく。
const corsHeaders = {
  "access-control-allow-origin": "*", // どこからのリクエストも受け入れる
  "access-control-allow-methods": "GET, OPTIONS", // 許可する HTTP メソッド
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { searchParams } = new URL(req.url);
  const preview = searchParams.get("preview") === "1";

  const row = await prisma.countdown.findUnique({ where: { id } });

  if (!row) {
    return new Response("not found", { status: 404, headers: corsHeaders });
  }

  const c = fromPrisma(row);

  if (!preview && c.status !== "published") {
    return new Response("not published", { status: 404, headers: corsHeaders });
  }

  const body = {
    id: c.id,
    title: c.title,
    targetAt: c.targetAt.toISOString(),
    finishedMessage: c.finishedMessage,
    theme: c.theme,
    accentColor: c.accentColor,
    showDays: c.showDays,
    showHours: c.showHours,
    showMinutes: c.showMinutes,
    showSeconds: c.showSeconds,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json",
      ...corsHeaders,
      "cache-control": preview ? "no-store" : "public, max-age=60", // プレビューは常に最新を返す。公開は60秒キャッシュしてもいい。
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
