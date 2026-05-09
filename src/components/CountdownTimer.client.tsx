"use client";

import { useEffect, useRef } from "react";

type Props = {
  targetAt: Date;
  createdAt: Date;
};

export function CountdownTimer({ targetAt, createdAt }: Props) {
  // querySelectorみたいなもん（useStateとか使えば良いけど...）
  const labelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const label = labelRef.current;
    const bar = barRef.current;
    const percent = percentRef.current;
    if (!label || !bar || !percent) return;

    const targetMs = targetAt.getTime();
    const totalMs = targetMs - createdAt.getTime();

    function tick() {
      const now = Date.now();
      const remaining = targetMs - now;
      const elapsed = now - createdAt.getTime();
      const progress =
        totalMs > 0 ? Math.max(0, Math.min(100, (elapsed / totalMs) * 100)) : 0;

      // 終了済み
      if (remaining <= 0) {
        label!.textContent = "終了済み";
        bar!.style.width = "100%";
        bar!.style.backgroundColor = "#9ca3af";
        percent!.textContent = "100%";
        return;
      }

      const days = Math.floor(remaining / 86_400_000); // 86_400_000 = 24時間 * 60分 * 60秒 * 1000ミリ秒
      const hours = Math.floor((remaining / 3_600_000) % 24); // 3_600_000 = 60分 * 60秒 * 1000ミリ秒
      const minutes = Math.floor((remaining / 60_000) % 60); // 60_000 = 60秒 * 1000ミリ秒
      const seconds = Math.floor((remaining / 1000) % 60);
      const pad = (n: number) => String(n).padStart(2, "0");

      label!.textContent = `あと ${days}日 ${pad(hours)}時間 ${pad(
        minutes
      )}分 ${pad(seconds)}秒`;
      bar!.style.width = `${progress}%`;
      percent!.textContent = `${Math.round(progress)}%`;
    }

    tick();
    const intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, [targetAt, createdAt]);

  return (
    <div className="space-y-1">
      <div ref={labelRef} className="font-mono text-base text-gray-900">
        --
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
        <div
          ref={barRef}
          className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
          style={{ width: "0%" }}
        />
      </div>
      <div ref={percentRef} className="text-xs text-gray-500">
        --
      </div>
    </div>
  );
}
