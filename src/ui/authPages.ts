import { layout, nav } from "./layout.ts";

export const renderAdminLoginPage = (error = "") =>
  layout(
    "Admin Login",
    `
      ${nav([{ href: "/", label: "Public Quiz" }])}
      <section class="hero">
        <div class="eyebrow">Internal Access</div>
        <h1>Admin sign-in for Fell Concierge.</h1>
        <p class="lede">Public quiz intake stays open, while internal ops tools now sit behind a simple admin login for this MVP.</p>
      </section>
      <section class="grid two">
        <div class="card">
          <h2>Sign In</h2>
          ${error ? `<div class="alert" style="margin-bottom:16px;">${error}</div>` : ""}
          <form method="POST" action="/admin/login">
            <label class="field"><span>Email</span><input type="email" name="email" required /></label>
            <label class="field"><span>Password</span><input type="password" name="password" required /></label>
            <button type="submit">Sign In</button>
          </form>
        </div>
        <div class="card">
          <h2>MVP Auth Scope</h2>
          <ul class="list">
            <li>Admin credentials come from environment variables.</li>
            <li>Passwords are stored hashed in SQLite.</li>
            <li>Internal dashboard and generation endpoints require a signed session cookie.</li>
          </ul>
        </div>
      </section>
    `
  );
