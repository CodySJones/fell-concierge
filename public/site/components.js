import React from "https://esm.sh/react@18.3.1";

const h = React.createElement;

const cx = (...values) => values.filter(Boolean).join(" ");

const Section = ({ id, eyebrow, title, body, children, subdued = false }) =>
  h(
    "section",
    {
      id,
      className: cx(
        "mx-auto max-w-6xl px-6 sm:px-8 lg:px-12",
        subdued ? "py-20 sm:py-28" : "py-24 sm:py-32"
      )
    },
    h("div", { className: "max-w-3xl" }, [
      eyebrow ? h("p", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke", key: "eyebrow" }, eyebrow) : null,
      title ? h("h2", { className: "mt-4 font-serifDisplay text-[2.2rem] leading-[1.02] text-ink sm:text-[3.5rem]", key: "title" }, title) : null,
      body ? h("p", { className: "mt-6 max-w-2xl font-sansQuiet text-base leading-8 text-smoke sm:text-[1.05rem]", key: "body" }, body) : null
    ]),
    children
  );

const QuietImage = ({ label, tone = "light" }) =>
  h("div", {
    className: cx(
      "w-full rounded-[22px] border border-line/70",
      tone === "light" ? "bg-plaster/70" : "bg-[#ddd4c8]",
      "min-h-[320px] sm:min-h-[420px] flex items-end p-6 shadow-quiet"
    )
  }, h("span", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke/80" }, label));

const StepList = ({ steps }) =>
  h(
    "div",
    { className: "mt-14 space-y-8" },
    steps.map((step, index) =>
      h("div", { className: "grid gap-3 border-t border-line/70 pt-6 sm:grid-cols-[90px_1fr]", key: step.title }, [
        h("span", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, `0${index + 1}`),
        h("div", { className: "max-w-xl" }, [
          h("h3", { className: "font-serifDisplay text-2xl leading-tight text-ink" }, step.title),
          h("p", { className: "mt-2 font-sansQuiet text-base leading-8 text-smoke" }, step.body)
        ])
      ])
    )
  );

const MinimalList = ({ items, columns = 3 }) =>
  h(
    "div",
    {
      className: cx(
        "mt-12 grid gap-y-8 gap-x-10 border-t border-line/70 pt-8",
        columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
      )
    },
    items.map((item) =>
      h("div", { key: item }, [
        h("p", { className: "font-serifDisplay text-[1.55rem] leading-tight text-ink" }, item)
      ])
    )
  );

const Header = ({ brand, hero }) =>
  h("header", { className: "mx-auto max-w-6xl px-6 pb-20 pt-6 sm:px-8 lg:px-12 sm:pt-8 sm:pb-28" }, [
    h("nav", { className: "flex items-center justify-between" }, [
      h("a", { href: "/", className: "flex items-center gap-4", key: "brand" }, [
        h("img", { src: "/assets/fell-co-brand.svg", alt: brand.name, className: "w-[128px] opacity-[0.94] mix-blend-multiply sm:w-[150px]" })
      ]),
      h("div", { className: "hidden items-center gap-8 font-sansQuiet text-[13px] uppercase tracking-[0.16em] text-smoke md:flex", key: "nav" }, [
        h("a", { href: "#process" }, "Process"),
        h("a", { href: "#profiles" }, "Design Profiles"),
        h("a", { href: "#services" }, "Services"),
        h("a", { href: "#about" }, "About"),
        h("a", { href: "/start", className: "text-ink" }, "Start Here")
      ])
    ]),
    h("div", { className: "mt-16 max-w-5xl" }, [
      h("h1", { className: "font-serifDisplay text-[3.1rem] leading-[0.96] text-ink sm:text-[4.9rem] lg:text-[6.4rem]" }, hero.headline),
      h("div", { className: "mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]" }, [
        h("div", { className: "max-w-2xl" }, [
          h("p", { className: "font-sansQuiet text-[1rem] leading-8 text-smoke sm:text-[1.08rem]" }, hero.supporting),
          h("div", { className: "mt-10 flex flex-wrap gap-4" }, [
            h("a", { href: hero.primaryCta.href, className: "inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 font-sansQuiet text-[12px] uppercase tracking-calm text-bone" }, hero.primaryCta.label),
            h("a", { href: hero.secondaryCta.href, className: "inline-flex items-center justify-center rounded-full border border-line bg-transparent px-6 py-3 font-sansQuiet text-[12px] uppercase tracking-calm text-smoke" }, hero.secondaryCta.label)
          ])
        ]),
        h("div", { className: "max-w-md lg:justify-self-end" }, [
          h("p", { className: "font-serifDisplay text-[1.55rem] leading-tight text-ink" }, "A design studio for people who want relief from the usual remodeling noise."),
          h("p", { className: "mt-4 font-sansQuiet text-base leading-8 text-smoke" }, "Quietly structured, remotely guided, and shaped around better decisions rather than more decisions.")
        ])
      ])
    ])
  ]);

const Footer = ({ brand }) =>
  h("footer", { className: "mx-auto max-w-6xl px-6 pb-16 pt-10 sm:px-8 lg:px-12" }, [
    h("div", { className: "border-t border-line/70 pt-8 font-sansQuiet text-[12px] uppercase tracking-calm text-smoke sm:flex sm:items-center sm:justify-between" }, [
      h("span", { key: "left" }, `${brand.name} ${brand.tagline}`),
      h("span", { className: "mt-3 block sm:mt-0", key: "right" }, "Remote-first kitchen and bath remodeling")
    ])
  ]);

export const HomePage = ({ content }) =>
  h("div", { className: "min-h-screen bg-bone text-ink" }, [
    h(Header, { brand: content.brand, hero: content.hero, key: "header" }),
    h("main", { key: "main" }, [
      h(Section, { id: "about", eyebrow: content.intro.eyebrow, title: content.intro.title, body: content.intro.body, key: "intro" }),
      h(Section, { id: "process", eyebrow: content.process.eyebrow, title: content.process.title, subdued: true, key: "process" }, [
        h(StepList, { steps: content.process.steps, key: "steps" })
      ]),
      h(Section, { id: "profiles", eyebrow: content.profiles.eyebrow, title: content.profiles.title, body: content.profiles.body, key: "profiles" }, [
        h(MinimalList, { items: content.profiles.items, columns: 3, key: "list" })
      ]),
      h("section", { className: "mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14", key: "sample" }, [
        h("div", { className: "max-w-xl" }, [
          h("p", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, content.sampleBox.eyebrow),
          h("h2", { className: "mt-4 font-serifDisplay text-[2.2rem] leading-[1.02] text-ink sm:text-[3.4rem]" }, content.sampleBox.title),
          h("p", { className: "mt-6 font-sansQuiet text-base leading-8 text-smoke sm:text-[1.05rem]" }, content.sampleBox.body)
        ]),
        h("div", { className: "mt-10 lg:mt-0" }, h(QuietImage, { label: "Material still life placeholder" }))
      ]),
      h("section", { className: "mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14", key: "render" }, [
        h("div", { className: "order-2 mt-10 lg:order-1 lg:mt-0" }, h(QuietImage, { label: "Architectural render placeholder", tone: "mid" })),
        h("div", { className: "order-1 max-w-xl lg:order-2" }, [
          h("p", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, content.render.eyebrow),
          h("h2", { className: "mt-4 font-serifDisplay text-[2.2rem] leading-[1.02] text-ink sm:text-[3.4rem]" }, content.render.title),
          h("p", { className: "mt-6 font-sansQuiet text-base leading-8 text-smoke sm:text-[1.05rem]" }, content.render.body)
        ])
      ]),
      h(Section, { id: "services", eyebrow: content.services.eyebrow, title: content.services.title, key: "services" }, [
        h(MinimalList, { items: content.services.items, columns: 2, key: "services-list" })
      ]),
      h(Section, { id: "armitage", eyebrow: content.armitage.eyebrow, title: content.armitage.title, body: content.armitage.body, subdued: true, key: "armitage" }),
      h("section", { className: "mx-auto max-w-4xl px-6 py-24 text-center sm:px-8 sm:py-32", key: "closing" }, [
        h("h2", { className: "font-serifDisplay text-[2.4rem] leading-[1.02] text-ink sm:text-[4rem]" }, content.closing.title),
        h("p", { className: "mx-auto mt-6 max-w-2xl font-sansQuiet text-base leading-8 text-smoke sm:text-[1.05rem]" }, content.closing.body),
        h("div", { className: "mt-10" }, h("a", { href: content.closing.cta.href, className: "inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 font-sansQuiet text-[12px] uppercase tracking-calm text-bone" }, content.closing.cta.label))
      ])
    ]),
    h(Footer, { brand: content.brand, key: "footer" })
  ]);
