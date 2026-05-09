-- CreateTable
CREATE TABLE "countdowns" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "target_at" TIMESTAMP(3) NOT NULL,
    "finished_message" TEXT NOT NULL DEFAULT 'Time is up!',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "accent_color" TEXT NOT NULL DEFAULT '#2563eb',
    "show_days" BOOLEAN NOT NULL DEFAULT true,
    "show_hours" BOOLEAN NOT NULL DEFAULT true,
    "show_minutes" BOOLEAN NOT NULL DEFAULT true,
    "show_seconds" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countdowns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "countdowns_status_idx" ON "countdowns"("status");
