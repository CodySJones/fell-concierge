import { appStyles } from "./styles.ts";

export const layout = (title: string, body: string, admin = false) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>${appStyles}</style>
  </head>
  <body class="${admin ? "admin" : ""}">
    <main class="shell ${admin ? "" : "public"}">
      ${body}
    </main>
  </body>
</html>`;

export const nav = (links: { href: string; label: string; cta?: boolean }[]) => `
  <div class="nav">
    <a href="/" class="brand">
      <img src="/assets/fell-co-brand.svg" alt="Fell & Co" class="brand-logo" />
      <span class="brand-block">
        <span class="brand-mark">Fell & Co</span>
        <span class="brand-sub">Fell Concierge</span>
      </span>
    </a>
    <div class="nav-links">
      ${links.map((link) => `<a href="${link.href}" class="${link.cta ? "nav-cta" : ""}">${link.label}</a>`).join("")}
    </div>
  </div>
`;

export const footer = () => `
  <footer class="footer">
    <span>Fell & Co builds a productized interior design path, not unlimited custom support.</span>
    <span>Bathroom-first MVP | Fixed-scope offers | Clear paid progression</span>
  </footer>
`;
