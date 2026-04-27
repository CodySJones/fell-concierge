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
    </a>
    <div class="nav-links">
      ${links.map((link) => `<a href="${link.href}" class="${link.cta ? "nav-cta" : ""}">${link.label}</a>`).join("")}
    </div>
  </div>
`;

export const footer = () => `
  <footer class="footer">
    <span>Fell & Co.</span>
    <span>Redesigning Remodeling.</span>
  </footer>
`;
