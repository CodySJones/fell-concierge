export const appStyles = `
  :root {
    --bg: #f3eee6;
    --paper: #fffaf3;
    --paper-2: #f6efe5;
    --ink: #1f1a16;
    --muted: #6d6359;
    --line: rgba(84, 63, 45, 0.16);
    --accent: #a5653f;
    --accent-2: #2f574d;
    --accent-3: #d8b28a;
    --admin-bg: #f7f7f4;
    --badge: rgba(255, 250, 243, 0.72);
    --shadow: 0 22px 54px rgba(43, 29, 17, 0.09);
    --shadow-soft: 0 14px 30px rgba(43, 29, 17, 0.06);
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    color: var(--ink);
    font-family: Georgia, "Times New Roman", serif;
    background:
      radial-gradient(circle at top left, rgba(165,101,63,0.20), transparent 24%),
      radial-gradient(circle at right 20%, rgba(47,87,77,0.08), transparent 20%),
      linear-gradient(180deg, #f8f2ea 0%, #f2ebe2 100%);
  }
  a { color: inherit; }
  button, input, textarea, select { font: inherit; }
  h1, h2, h3, h4, p { margin: 0; }
  h1 { font-size: clamp(3rem, 7vw, 6rem); line-height: 0.92; letter-spacing: -0.04em; }
  h2 { font-size: clamp(2rem, 3.8vw, 3.1rem); line-height: 1; margin-bottom: 16px; }
  h3 { font-size: 1.12rem; margin-bottom: 10px; }
  p, li, label { font-size: 16px; line-height: 1.6; }
  .shell {
    width: min(1180px, calc(100vw - 32px));
    margin: 0 auto;
    padding: 28px 0 70px;
  }
  .shell.public { padding-top: 20px; }
  .hero {
    position: relative;
    overflow: hidden;
    padding: 54px;
    border: 1px solid rgba(80, 60, 40, 0.12);
    background:
      linear-gradient(135deg, rgba(255,251,245,0.96), rgba(244,232,218,0.9)),
      radial-gradient(circle at top right, rgba(165,101,63,0.12), transparent 30%);
    box-shadow: var(--shadow);
    border-radius: 34px;
    display: grid;
    gap: 20px;
  }
  .hero::after {
    content: "";
    position: absolute;
    right: -40px;
    bottom: -60px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(216,178,138,0.26), transparent 64%);
    pointer-events: none;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 26px;
    align-items: end;
  }
  .hero-panel {
    border: 1px solid var(--line);
    border-radius: 24px;
    background: rgba(255, 252, 247, 0.76);
    backdrop-filter: blur(6px);
    padding: 22px;
    box-shadow: var(--shadow-soft);
  }
  .eyebrow, .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 8px 12px;
    border-radius: 999px;
    background: var(--badge);
    border: 1px solid rgba(84, 63, 45, 0.08);
    color: var(--muted);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .lede {
    max-width: 760px;
    color: var(--muted);
    font-size: 18px;
  }
  .section {
    margin-top: 22px;
  }
  .section-head {
    display: grid;
    gap: 8px;
    margin-bottom: 18px;
  }
  .grid {
    display: grid;
    gap: 18px;
    margin-top: 22px;
  }
  .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .grid.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .card {
    border-radius: 24px;
    background: var(--paper);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    padding: 24px;
  }
  .card.soft {
    background: rgba(255, 249, 242, 0.74);
    box-shadow: var(--shadow-soft);
  }
  .card.flat { box-shadow: none; }
  .card.dark {
    background: linear-gradient(180deg, #2a241f 0%, #1d1916 100%);
    color: #f8f3ed;
    border-color: rgba(255,255,255,0.08);
  }
  .card.dark .note, .card.dark p { color: rgba(248,243,237,0.82); }
  .admin body, body.admin {
    background: var(--admin-bg);
  }
  .stack { display: grid; gap: 12px; }
  .stack.sm { gap: 8px; }
  .stack.lg { gap: 18px; }
  .metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }
  .metric {
    background: white;
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 18px;
  }
  .metric strong {
    display: block;
    font-size: 2rem;
    line-height: 1;
    margin-top: 10px;
  }
  .statline {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .stat {
    min-width: 140px;
    padding-top: 10px;
    border-top: 1px solid var(--line);
  }
  .stat strong {
    display: block;
    font-size: 1.5rem;
    margin-bottom: 4px;
  }
  form {
    display: grid;
    gap: 16px;
  }
  .field {
    display: grid;
    gap: 6px;
  }
  input, select, textarea, button {
    width: 100%;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid #cdbba8;
    background: white;
    color: var(--ink);
  }
  textarea { min-height: 112px; resize: vertical; }
  button {
    background: var(--ink);
    color: white;
    border: none;
    cursor: pointer;
    transition: transform 140ms ease, opacity 140ms ease;
  }
  button.secondary {
    background: var(--accent-2);
  }
  button.ghost {
    background: #ece5dc;
    color: var(--ink);
  }
  button.accent {
    background: var(--accent);
  }
  button:hover { transform: translateY(-1px); }
  .option-list {
    display: grid;
    gap: 10px;
  }
  .option {
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 14px;
    display: grid;
    gap: 8px;
    background: #fff;
  }
  .pill-row, .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pill, .chip {
    padding: 7px 10px;
    border-radius: 999px;
    background: #f3ebe3;
    color: #5c5147;
    font-size: 14px;
  }
  .table {
    width: 100%;
    border-collapse: collapse;
  }
  .table th, .table td {
    text-align: left;
    padding: 12px;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }
  .stage {
    display: inline-flex;
    padding: 6px 10px;
    border-radius: 999px;
    background: #efe5d9;
    color: #634d39;
    font-size: 13px;
  }
  .note {
    color: var(--muted);
    font-size: 14px;
  }
  .text-link {
    color: var(--ink);
    text-decoration: none;
    border-bottom: 1px solid rgba(31, 26, 22, 0.22);
    width: fit-content;
  }
  .list {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 6px;
  }
  .calm-list li::marker {
    color: rgba(165,101,63,0.8);
  }
  .split {
    display: grid;
    gap: 24px;
    grid-template-columns: 1.1fr 0.9fr;
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .alert {
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid #dcc4b3;
    background: #fff5ee;
  }
  .success {
    border-color: #b8d3c7;
    background: #edf7f1;
  }
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    gap: 16px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
    text-decoration: none;
  }
  .brand-logo {
    width: 168px;
    max-width: 38vw;
    height: auto;
    display: block;
  }
  .brand-logo.lockup {
    width: min(420px, 100%);
    max-width: 100%;
  }
  .brand-block {
    display: grid;
    gap: 2px;
  }
  .brand-mark {
    font-size: 15px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .brand-sub {
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .nav a {
    text-decoration: none;
    color: var(--muted);
  }
  .nav-links {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
  }
  .nav-cta {
    padding: 10px 14px;
    border-radius: 999px;
    background: var(--ink);
    color: #fff !important;
  }
  .timeline {
    display: grid;
    gap: 12px;
  }
  .timeline-step {
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 14px;
    align-items: start;
  }
  .timeline-step strong.num {
    width: 44px;
    height: 44px;
    display: inline-grid;
    place-items: center;
    border-radius: 50%;
    background: #efe3d8;
    color: var(--accent);
    font-size: 15px;
  }
  .pricing-item {
    display: grid;
    gap: 8px;
    padding: 16px 0;
    border-top: 1px solid var(--line);
  }
  .pricing-item:first-child {
    border-top: none;
    padding-top: 0;
  }
  .pricing-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: baseline;
  }
  .quote {
    padding: 18px;
    border-left: 3px solid var(--accent);
    background: rgba(165,101,63,0.06);
    border-radius: 0 18px 18px 0;
  }
  .footer {
    margin-top: 22px;
    padding: 22px 4px 0;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    color: var(--muted);
    font-size: 14px;
  }
  .hero-brand {
    display: grid;
    gap: 18px;
    align-content: start;
  }
  .hero-brand-frame {
    padding: 18px;
    border-radius: 28px;
    background: rgba(255, 252, 247, 0.82);
    border: 1px solid var(--line);
    box-shadow: var(--shadow-soft);
  }
  .start-hero {
    gap: 28px;
    padding: 46px 48px;
  }
  .start-hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
    gap: 28px;
    align-items: end;
  }
  .start-note {
    align-self: stretch;
    background: rgba(255, 252, 247, 0.88);
  }
  .start-prep {
    align-items: stretch;
  }
  .quiz-shell {
    padding: 20px;
    border-radius: 30px;
    background:
      linear-gradient(180deg, rgba(255,251,246,0.98), rgba(246,238,228,0.94)),
      radial-gradient(circle at top right, rgba(165,101,63,0.08), transparent 28%);
  }
  .quiz-shell-head {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 18px;
    padding: 8px 6px 18px;
  }
  .quiz-frame {
    border-radius: 30px;
    padding: 14px;
    background: rgba(255, 249, 242, 0.94);
    border: 1px solid rgba(84, 63, 45, 0.12);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  }
  .sync-status {
    min-height: 22px;
    padding: 14px 8px 2px;
  }
  @media (max-width: 900px) {
    .grid.two, .grid.three, .grid.four, .metrics, .split, .hero-grid {
      grid-template-columns: 1fr;
    }
    .hero { padding: 30px; }
    .start-hero { padding: 32px 26px; }
    .start-hero-grid { grid-template-columns: 1fr; }
    .quiz-shell-head {
      flex-direction: column;
      align-items: start;
      padding-inline: 2px;
    }
    .nav { align-items: start; flex-direction: column; }
    .brand-logo {
      width: 140px;
    }
  }
`;
