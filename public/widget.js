// public/widget.js
//
// 埋め込み型カウントダウン時計の Vanilla JS ウィジェット。
//
// 使い方（外部サイト側）:
//   <script src="<このオリジン>/widget.js" data-id="<UUID>" async></script>
//
// このファイルは Next.js の public/ 配下にあるので、ビルド無しでそのまま配信される。

(() => {
  const me = document.currentScript;
  if (!me) return;
  // datasetは data- で始まる属性をオブジェクト形式でアクセスできるようにするブラウザの機能
  const id = me.dataset.id;
  if (!id) {
    console.warn("[embed-clock] data-id が指定されていません");
    return;
  }
  const preview = me.dataset.preview === "1";

  const ORIGIN = new URL(me.src).origin;

  // テーマごとの色設定（CSS 変数として Shadow DOM の :host に流し込む）
  const THEME_COLORS = {
    light: {
      bg: "#ffffff",
      fg: "#111827",
      muted: "#6b7280",
      border: "#e5e7eb",
    },
    dark: { bg: "#0f172a", fg: "#f9fafb", muted: "#9ca3af", border: "#1f2937" },
    retro: {
      bg: "#1a1a1a",
      fg: "#ff6b35",
      muted: "#f7c873",
      border: "#3d2817",
    },
  };

  // shadow DOM とカスタム要素を使って、外部サイトの CSS や JavaScript から完全に独立したウィジェットを作る
  class EmbedClock extends HTMLElement {
    #shadow; // #はprivate。
    #timer = null;
    #config = null;

    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: "open" });
    }

    async connectedCallback() {
      const id = this.dataset.id;
      const preview = this.dataset.preview === "1";

      try {
        this.#config = await this.#loadConfig(id, preview);
        this.#render();
        this.#startTicking();
      } catch (e) {
        this.#renderError(e?.message ?? "unknown error");
      }
    }

    disconnectedCallback() {
      if (this.#timer !== null) {
        clearInterval(this.#timer);
        this.#timer = null;
      }
    }

    async #loadConfig(id, preview) {
      const cacheKey = `embed-clock:${id}`;

      if (!preview) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const { value, expires } = JSON.parse(cached);
            if (expires > Date.now()) return value;
          } catch {}
        }
      }

      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), 5000);
      try {
        const url = `${ORIGIN}/api/embed/${encodeURIComponent(id)}${
          preview ? "?preview=1" : ""
        }`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const value = await res.json();

        if (!preview) {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ value, expires: Date.now() + 60_000 })
          );
        }
        return value;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    #render() {
      const c = this.#config;
      if (!c) return;

      const target = new Date(c.targetAt).getTime();
      const remaining = target - Date.now();
      const colors = THEME_COLORS[c.theme] ?? THEME_COLORS.light;

      if (remaining <= 0) {
        this.#shadow.innerHTML = `
            <style>
              :host { display: inline-block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
              .box { background: ${colors.bg}; color: ${colors.fg}; padding: 1.5rem 2rem; border-radius: 0.75rem; border: 1px solid ${colors.border}; text-align: center; }
              .title { font-size: 0.875rem; color: ${colors.muted}; margin-bottom: 0.5rem; }
              .message { font-size: 1.5rem; font-weight: 700; color: ${c.accentColor}; }
            </style>
            <div class="box">
              <div class="title"></div>
              <div class="message"></div>
            </div>
          `;
        this.#shadow.querySelector(".title").textContent = c.title;
        this.#shadow.querySelector(".message").textContent = c.finishedMessage;
        return;
      }

      const days = Math.floor(remaining / 86_400_000);
      const hours = Math.floor((remaining / 3_600_000) % 24);
      const minutes = Math.floor((remaining / 60_000) % 60);
      const seconds = Math.floor((remaining / 1000) % 60);
      const pad = (n) => String(n).padStart(2, "0");

      const parts = [];
      if (c.showDays)
        parts.push(
          `<div class="part"><span class="num">${days}</span><span class="label">日</span></div>`
        );
      if (c.showHours)
        parts.push(
          `<div class="part"><span class="num">${pad(
            hours
          )}</span><span class="label">時間</span></div>`
        );
      if (c.showMinutes)
        parts.push(
          `<div class="part"><span class="num">${pad(
            minutes
          )}</span><span class="label">分</span></div>`
        );
      if (c.showSeconds)
        parts.push(
          `<div class="part"><span class="num">${pad(
            seconds
          )}</span><span class="label">秒</span></div>`
        );

      this.#shadow.innerHTML = `
          <style>
            :host { display: inline-block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
            .box { background: ${colors.bg}; color: ${
        colors.fg
      }; padding: 1.5rem 2rem; border-radius: 0.75rem; border: 1px solid ${
        colors.border
      }; }
            .title { font-size: 0.875rem; color: ${
              colors.muted
            }; margin-bottom: 0.75rem; text-align: center; }
            .digits { display: flex; gap: 1rem; justify-content: center; }
            .part { display: flex; flex-direction: column; align-items: center; min-width: 3rem; }
            .num { font-size: 2.25rem; font-weight: 700; color: ${
              c.accentColor
            }; font-variant-numeric: tabular-nums; line-height: 1; }
            .label { font-size: 0.75rem; color: ${
              colors.muted
            }; margin-top: 0.25rem; }
          </style>
          <div class="box">
            <div class="title"></div>
            <div class="digits">${parts.join("")}</div>
          </div>
        `;
      this.#shadow.querySelector(".title").textContent = c.title;
    }

    #startTicking() {
      this.#timer = setInterval(() => this.#render(), 1000);
    }

    #renderError(msg) {
      this.#shadow.innerHTML = `
          <style>
            :host { display: inline-block; font-family: sans-serif; font-size: 0.75rem; }
            .err { padding: 0.5rem 0.75rem; background: #fee2e2; color: #7f1d1d; border-radius: 0.25rem; }
          </style>
          <div class="err">embed-clock: <span class="msg"></span></div>
        `;
      this.#shadow.querySelector(".msg").textContent = msg;
    }
  }

  if (!customElements.get("embed-clock")) {
    customElements.define("embed-clock", EmbedClock);
  }

  const el = document.createElement("embed-clock");
  el.setAttribute("data-id", id);
  if (preview) el.setAttribute("data-preview", "1");
  me.parentNode?.insertBefore(el, me.nextSibling);
})();
