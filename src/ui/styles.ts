export const appStyles = `
  :root {
    --bg: #f7f6f2;
    --paper: #ffffff;
    --paper-2: #f2f0eb;
    --ink: #1f1a16;
    --muted: #6d6359;
    --line: rgba(84, 63, 45, 0.16);
    --accent: #7a5b45;
    --accent-2: #315f56;
    --accent-3: #b8a178;
    --admin-bg: #f7f7f4;
    --badge: rgba(255, 250, 243, 0.72);
    --shadow: 0 22px 54px rgba(43, 29, 17, 0.09);
    --shadow-soft: 0 14px 30px rgba(43, 29, 17, 0.06);
    --serif-display: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Baskerville, Georgia, serif;
    --sans-quiet: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  body {
    margin: 0;
    color: var(--ink);
    font-family: Georgia, "Times New Roman", serif;
    background: var(--bg);
  }
  a { color: inherit; }
  button, input, textarea, select { font: inherit; }
  h1, h2, h3, h4, p { margin: 0; }
  h1 { font-size: clamp(3rem, 7vw, 6rem); line-height: 0.94; letter-spacing: 0; }
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
    background: var(--paper);
    box-shadow: var(--shadow);
    border-radius: 12px;
    display: grid;
    gap: 20px;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 26px;
    align-items: end;
  }
  .hero-panel {
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(255, 252, 247, 0.76);
    backdrop-filter: blur(6px);
    padding: 22px;
    box-shadow: var(--shadow-soft);
  }
  .result-hero-media {
    overflow: hidden;
    border-radius: 8px;
    background: #efe7dd;
    border: 1px solid var(--line);
  }
  .result-hero-media img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
  }
  .result-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 0.62fr);
    gap: clamp(28px, 5vw, 68px);
    align-items: center;
    padding: clamp(38px, 7vw, 86px) 0 clamp(26px, 5vw, 56px);
  }
  .result-copy {
    display: grid;
    gap: 16px;
    max-width: 720px;
  }
  .result-eyebrow {
    font-family: var(--sans-quiet);
    color: var(--muted);
    font-size: 12px;
    letter-spacing: 0;
    text-transform: uppercase;
  }
  .result-copy h1 {
    font-family: var(--serif-display);
    font-size: clamp(3.1rem, 7vw, 6rem);
    font-weight: 400;
    line-height: 0.96;
  }
  .result-lede {
    max-width: 620px;
    color: var(--muted);
    font-family: var(--sans-quiet);
    font-size: clamp(1.05rem, 1.7vw, 1.22rem);
    line-height: 1.75;
  }
  .result-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 16px;
    color: var(--muted);
    font-family: var(--sans-quiet);
    font-size: 14px;
  }
  .result-action {
    display: grid;
    gap: 18px;
  }
  .result-action-copy {
    display: grid;
    gap: 12px;
    padding: 2px 2px 0;
  }
  .result-action-copy h2,
  .result-detail h2 {
    margin: 0;
    font-family: var(--sans-quiet);
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
  }
  .result-action-copy p,
  .result-detail p {
    color: var(--muted);
    font-family: var(--sans-quiet);
    font-size: 16px;
    line-height: 1.75;
  }
  .quiet-link {
    width: fit-content;
    color: var(--muted);
    font-family: var(--sans-quiet);
    font-size: 14px;
    text-decoration: none;
    border-bottom: 1px solid rgba(109, 99, 89, 0.34);
  }
  .result-detail-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 0.78fr);
    gap: clamp(22px, 4vw, 46px);
    align-items: start;
    padding: clamp(28px, 5vw, 54px) 0;
    border-top: 1px solid var(--line);
  }
  .profile-access {
    display: flex;
    justify-content: center;
    padding: 4px 0 34px;
  }
  .profile-access a {
    text-decoration: none;
  }
  .profile-access button {
    width: auto;
    min-width: 170px;
    font-family: var(--sans-quiet);
  }
  .portal-access-hero {
    min-height: min(620px, calc(100svh - 170px));
  }
  .result-detail {
    display: grid;
    gap: 14px;
  }
  .soft-panel {
    padding: 24px;
    border-radius: 10px;
    background: rgba(255, 253, 249, 0.68);
    border: 1px solid rgba(84, 63, 45, 0.1);
  }
  .pill-row.quiet {
    margin-top: 2px;
  }
  .result-note {
    margin-top: 4px;
  }
  .eyebrow, .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 8px 12px;
    border-radius: 8px;
    background: var(--badge);
    border: 1px solid rgba(84, 63, 45, 0.08);
    color: var(--muted);
    font-size: 12px;
    letter-spacing: 0;
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
    border-radius: 8px;
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
    border-radius: 8px;
    padding: 18px;
  }
  .metric strong {
    display: block;
    font-size: 2rem;
    line-height: 1;
    margin-top: 10px;
  }
  .code-block {
    overflow: auto;
    max-height: 520px;
    padding: 14px;
    border: 1px solid rgba(39, 34, 28, 0.14);
    border-radius: 8px;
    background: #111;
    color: #f8f3ed;
    font-size: 13px;
    line-height: 1.5;
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
    border-radius: 8px;
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
    border-radius: 8px;
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
    border-radius: 8px;
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
    border-radius: 8px;
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
    border-radius: 8px;
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
    border-radius: 8px;
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
    border-radius: 0 8px 8px 0;
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
    border-radius: 8px;
    background: rgba(255, 252, 247, 0.82);
    border: 1px solid var(--line);
    box-shadow: var(--shadow-soft);
  }
  .start-hero {
    min-height: min(430px, calc(62svh - 64px));
    justify-content: center;
    justify-items: center;
    gap: 26px;
    padding: 34px 24px 22px;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    text-align: center;
  }
  .start-hero .stack {
    max-width: 980px;
    justify-items: center;
  }
  .start-hero h1 {
    max-width: 760px;
    font-family: var(--serif-display);
    font-size: clamp(2.45rem, 5vw, 4.35rem);
    line-height: 1;
    font-weight: 400;
    letter-spacing: 0;
  }
  .start-hero .lede {
    max-width: 600px;
    font-family: var(--sans-quiet);
    font-size: clamp(1rem, 1.5vw, 1.16rem);
    line-height: 1.75;
  }
  .start-hero-preview {
    width: min(560px, 100%);
    margin-top: 4px;
    display: grid;
    grid-template-columns: 0.92fr 1.08fr 0.92fr;
    gap: 14px;
    align-items: end;
  }
  .start-hero-preview img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 18px 42px rgba(43, 29, 17, 0.11);
    background: #efe7dd;
  }
  .start-hero-preview img:nth-child(2) {
    transform: translateY(-10px);
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
    padding: 18px 0 0;
    border-radius: 8px;
    background: transparent;
    border: none;
    box-shadow: none;
  }
  .quiz-shell-head {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 18px;
    padding: 8px 6px 18px;
  }
  .quiz-frame {
    border-radius: 8px;
    padding: 14px;
    background: rgba(255, 249, 242, 0.94);
    border: 1px solid rgba(84, 63, 45, 0.12);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  }
  .native-quiz-shell {
    overflow: hidden;
    border-top: 1px solid var(--line);
    border-radius: 0;
  }
  .quiz-progress-label {
    color: var(--muted);
    font-size: 13px;
  }
  .quiz-step-count {
    margin: 0 6px 8px;
    color: var(--muted);
    font-family: var(--sans-quiet);
    font-size: 12px;
    text-align: right;
  }
  .quiz-progress {
    height: 5px;
    border-radius: 999px;
    overflow: hidden;
    background: #ebe1d5;
    border: 1px solid rgba(84, 63, 45, 0.1);
    margin: 0 6px 22px;
  }
  .quiz-progress span {
    display: block;
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, var(--accent-2), var(--accent-3));
    transition: width 180ms ease;
  }
  .native-quiz {
    min-height: 500px;
    padding: 6px;
  }
  .quiz-question-head {
    display: grid;
    gap: 10px;
    max-width: 760px;
    margin-bottom: 20px;
  }
  .quiz-question-head h2 {
    font-family: var(--serif-display);
    font-size: clamp(2rem, 3.4vw, 3.2rem);
    font-weight: 400;
    line-height: 1.04;
    margin-bottom: 0;
  }
  .image-option-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
  }
  .image-option-grid.material {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .image-option {
    position: relative;
    display: grid;
    align-content: start;
    padding: 0;
    min-height: 100%;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: transparent;
    color: var(--ink);
    text-align: left;
    box-shadow: none;
    transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
  }
  .image-option:hover {
    transform: translateY(-2px) scale(1.005);
    box-shadow: var(--shadow-soft);
  }
  .image-option.selected {
    border-color: rgba(122, 91, 69, 0.8);
    box-shadow: 0 0 0 2px rgba(122, 91, 69, 0.18);
  }
  .image-option-media {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    border-radius: 9px;
    background: #efe7dd;
  }
  .image-option-media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .image-option-grid.wide .image-option-media {
    aspect-ratio: 16 / 10;
  }
  .image-option-grid.material .image-option-media {
    aspect-ratio: 1 / 1;
  }
  .option-check {
    position: absolute;
    top: 9px;
    right: 9px;
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: rgba(31, 26, 22, 0.72);
    color: #fff;
    font-family: var(--sans-quiet);
    font-size: 13px;
    opacity: 0;
    transform: scale(0.88);
    transition: opacity 140ms ease, transform 140ms ease;
  }
  .selected .option-check {
    opacity: 1;
    transform: scale(1);
  }
  .text-option-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    max-width: 860px;
  }
  .text-option {
    position: relative;
    min-height: 94px;
    padding: 18px 48px 18px 18px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: rgba(255, 253, 249, 0.72);
    color: var(--ink);
    text-align: left;
    box-shadow: none;
  }
  .text-option.selected {
    border-color: rgba(122, 91, 69, 0.8);
    box-shadow: 0 0 0 2px rgba(122, 91, 69, 0.18);
  }
  .quiz-actions {
    display: grid;
    grid-template-columns: 150px minmax(180px, 260px);
    justify-content: end;
    gap: 10px;
    padding: 16px 6px 0;
  }
  .quiz-actions button:disabled {
    cursor: default;
    opacity: 0.42;
    transform: none;
  }
  .quiz-contact-form {
    padding-top: 6px;
  }
  .profile-form-section {
    display: grid;
    gap: 14px;
    padding: 18px 0;
    border-top: 1px solid var(--line);
  }
  .profile-form-section:first-child {
    border-top: none;
    padding-top: 0;
  }
  .profile-form-section h3 {
    margin: 0;
    font-family: var(--sans-quiet);
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
  }
  .field.optional {
    position: relative;
  }
  .field-note {
    color: var(--muted);
    font-family: var(--sans-quiet);
    font-size: 12px;
  }
  .magic-link-field {
    min-height: 72px;
    align-content: center;
    padding: 12px 14px;
    border: 1px solid #cdbba8;
    border-radius: 8px;
    background: rgba(255, 253, 249, 0.72);
  }
  .magic-link-note {
    color: var(--muted);
    font-family: var(--sans-quiet);
    font-size: 14px;
    line-height: 1.45;
  }
  .skip-profile-link {
    margin-top: 2px;
  }
  .sync-status {
    min-height: 22px;
    padding: 14px 8px 2px;
  }
  @media (max-width: 900px) {
    .grid.two, .grid.three, .grid.four, .metrics, .split, .hero-grid, .result-hero, .result-detail-grid {
      grid-template-columns: 1fr;
    }
    .hero { padding: 30px; }
    .start-hero {
      min-height: auto;
      padding: 42px 8px 34px;
    }
    .start-hero h1 {
      font-size: clamp(2.45rem, 13vw, 3.7rem);
    }
    .start-hero-preview {
      width: min(560px, 100%);
      gap: 8px;
      margin-top: 6px;
    }
    .start-hero-preview img {
      border-radius: 6px;
    }
    .start-hero-preview img:nth-child(2) {
      transform: translateY(-10px);
    }
    .start-hero-grid { grid-template-columns: 1fr; }
    .quiz-shell-head {
      flex-direction: column;
      align-items: start;
      padding-inline: 2px;
    }
    .image-option-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .image-option-grid.material,
    .text-option-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .quiz-actions {
      grid-template-columns: 1fr;
    }
    .nav { align-items: start; flex-direction: column; }
    .brand-logo {
      width: 140px;
    }
  }
  @media (max-width: 540px) {
    .image-option-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .image-option-grid.material,
    .text-option-list {
      grid-template-columns: 1fr;
    }
    .native-quiz {
      min-height: 0;
      padding: 0;
    }
  }
`;
