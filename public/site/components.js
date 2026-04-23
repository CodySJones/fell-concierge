import React from "https://esm.sh/react@18.3.1";

const h = React.createElement;

const cx = (...values) => values.filter(Boolean).join(" ");

const Shell = ({ children }) =>
  h("div", { className: "min-h-screen bg-bone text-ink" }, children);

const Container = ({ children, wide = false, className = "" }) =>
  h(
    "div",
    {
      className: cx(
        wide ? "mx-auto max-w-[1220px] px-6 sm:px-8 lg:px-12" : "mx-auto max-w-[1100px] px-6 sm:px-8 lg:px-12",
        className
      )
    },
    children
  );

const Header = ({ brand, hero }) =>
  h(Container, { wide: true, className: "pt-5 sm:pt-7" }, [
    h("header", { className: "flex items-center justify-between" }, [
      h("a", { href: "/", className: "flex items-center", key: "brand", "aria-label": brand.name }, [
        h("img", {
          src: "/assets/fell-co-brand.svg",
          alt: brand.name,
          className: "w-[126px] opacity-[0.96] mix-blend-multiply sm:w-[146px]"
        })
      ]),
      h("a", {
        href: hero.primaryCta.href,
        key: "cta",
        className:
          "inline-flex items-center justify-center rounded-full border border-line bg-paper px-4 py-2 font-sansQuiet text-[11px] uppercase tracking-calm text-ink transition hover:bg-[#f7f0e7]"
      }, hero.primaryCta.label)
    ])
  ]);

const Hero = ({ hero }) =>
  h(Container, { className: "pt-16 pb-12 text-center sm:pt-24 sm:pb-16" }, [
    h("div", { className: "mx-auto max-w-[980px]" }, [
      h("h1", { className: "font-serifDisplay text-[2.5rem] leading-[1] tracking-[-0.035em] text-ink sm:text-[3.8rem] lg:text-[4.8rem]" }, hero.headline),
      h("p", { className: "mx-auto mt-6 max-w-[720px] font-sansQuiet text-[1rem] leading-8 text-smoke sm:text-[1.18rem]" }, hero.supporting),
      h("div", { className: "mt-10 flex justify-center" }, [
        h("a", {
          href: hero.primaryCta.href,
          className:
            "inline-flex min-w-[220px] items-center justify-center rounded-full bg-ink px-7 py-3.5 font-sansQuiet text-[12px] uppercase tracking-calm text-bone transition hover:opacity-92"
        }, hero.primaryCta.label)
      ])
    ])
  ]);

const FeaturePanel = ({ title, body, aside }) =>
  h(Container, { wide: true, className: "pb-8 sm:pb-12" }, [
    h("section", {
      className:
        "overflow-hidden rounded-[34px] border border-[#ded2c5] bg-paper shadow-[0_18px_48px_rgba(36,26,18,0.05)]"
    }, [
      h("div", { className: "grid lg:grid-cols-[1.08fr_0.92fr]" }, [
        h("div", { className: "px-8 py-12 sm:px-14 sm:py-16 lg:px-16 lg:py-20" }, [
          h("p", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, "Start Here"),
          h("h2", { className: "mt-4 max-w-[560px] font-serifDisplay text-[2.5rem] leading-[1.02] tracking-[-0.03em] text-ink sm:text-[4rem]" }, title),
          h("p", { className: "mt-5 max-w-[560px] font-sansQuiet text-[1rem] leading-8 text-smoke sm:text-[1.08rem]" }, body),
          h("div", { className: "mt-9 flex flex-wrap gap-3" }, [
            h("span", { className: "rounded-full bg-[#f4ece2] px-4 py-2 font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, "About 3 minutes"),
            h("span", { className: "rounded-full bg-[#f4ece2] px-4 py-2 font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, "10 design profiles"),
            h("span", { className: "rounded-full bg-[#f4ece2] px-4 py-2 font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, "Clear next step")
          ])
        ]),
        h("div", {
          className:
            "flex min-h-[280px] items-end border-t border-[#ded2c5] bg-[linear-gradient(180deg,#f6efe6_0%,#ece2d6_100%)] px-8 py-10 lg:min-h-full lg:border-l lg:border-t-0 lg:px-12 lg:py-14"
        }, [
          h("div", { className: "max-w-[420px]" }, [
            h("p", { className: "font-serifDisplay text-[1.55rem] leading-[1.15] text-ink sm:text-[2rem]" }, aside),
            h("p", { className: "mt-4 font-sansQuiet text-[0.98rem] leading-7 text-smoke" }, "The landing page does one job: move the right person into the quiz with as little friction as possible.")
          ])
        ])
      ])
    ])
  ]);

const QuizPath = ({ process, closing }) =>
  h(Container, { className: "py-12 sm:py-16" }, [
    h("section", { className: "text-center" }, [
      h("p", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, process.eyebrow),
      h("h2", { className: "mt-4 font-serifDisplay text-[2.25rem] leading-[1.04] tracking-[-0.03em] text-ink sm:text-[3.8rem]" }, "One clear next move."),
      h("p", { className: "mx-auto mt-5 max-w-[660px] font-sansQuiet text-[1rem] leading-8 text-smoke sm:text-[1.08rem]" }, "Take the design profile, receive a tailored direction, and continue only if the next step makes sense for your remodel.")
    ]),
    h("div", {
      className:
        "mx-auto mt-12 grid max-w-[940px] gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-3"
    }, [
      h("div", { className: "bg-paper px-7 py-8 text-left" }, [
        h("p", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, "01"),
        h("h3", { className: "mt-4 font-serifDisplay text-[1.7rem] leading-tight text-ink" }, process.steps[0].title),
        h("p", { className: "mt-3 font-sansQuiet text-[0.98rem] leading-7 text-smoke" }, process.steps[0].body)
      ]),
      h("div", { className: "bg-paper px-7 py-8 text-left" }, [
        h("p", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, "02"),
        h("h3", { className: "mt-4 font-serifDisplay text-[1.7rem] leading-tight text-ink" }, process.steps[1].title),
        h("p", { className: "mt-3 font-sansQuiet text-[0.98rem] leading-7 text-smoke" }, process.steps[1].body)
      ]),
      h("div", { className: "bg-paper px-7 py-8 text-left" }, [
        h("p", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, "03"),
        h("h3", { className: "mt-4 font-serifDisplay text-[1.7rem] leading-tight text-ink" }, closing.cta.label),
        h("p", { className: "mt-3 font-sansQuiet text-[0.98rem] leading-7 text-smoke" }, closing.body)
      ])
    ])
  ]);

const ProfileRibbon = ({ profiles }) =>
  h(Container, { className: "py-12 sm:py-16" }, [
    h("section", {
      className:
        "rounded-[28px] border border-line bg-[#f5ede4] px-6 py-8 sm:px-10 sm:py-10"
    }, [
      h("p", { className: "text-center font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, profiles.eyebrow),
      h("div", {
        className:
          "mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 font-serifDisplay text-[1.3rem] leading-tight text-ink sm:text-[1.6rem]"
      }, profiles.items.map((item) => h("span", { key: item }, item)))
    ])
  ]);

const Closing = ({ closing }) =>
  h(Container, { className: "py-16 text-center sm:py-24" }, [
    h("h2", { className: "font-serifDisplay text-[2.3rem] leading-[1.03] tracking-[-0.03em] text-ink sm:text-[4rem]" }, closing.title),
    h("p", { className: "mx-auto mt-5 max-w-[680px] font-sansQuiet text-[1rem] leading-8 text-smoke sm:text-[1.08rem]" }, "The quiz is the first step. Everything after that is structured, deliberate, and only introduced when it is useful."),
    h("div", { className: "mt-9 flex justify-center" }, [
      h("a", {
        href: closing.cta.href,
        className:
          "inline-flex min-w-[220px] items-center justify-center rounded-full bg-ink px-7 py-3.5 font-sansQuiet text-[12px] uppercase tracking-calm text-bone transition hover:opacity-92"
      }, "Begin the Quiz")
    ])
  ]);

const Footer = ({ brand }) =>
  h(Container, { wide: true, className: "pb-12 pt-4 sm:pb-16" }, [
    h("footer", { className: "border-t border-line/70 pt-6 text-center font-sansQuiet text-[11px] uppercase tracking-calm text-smoke sm:flex sm:items-center sm:justify-between sm:text-left" }, [
      h("span", { key: "brand" }, `${brand.name} ${brand.tagline}`),
      h("span", { className: "mt-3 block sm:mt-0", key: "note" }, "Quiz-first remodeling intake")
    ])
  ]);

export const HomePage = ({ content }) =>
  h(Shell, null, [
    h(Header, { brand: content.brand, hero: content.hero, key: "header" }),
    h("main", { key: "main" }, [
      h(Hero, { hero: content.hero, key: "hero" }),
      h(FeaturePanel, {
        title: "A design-led first step for kitchen and bath remodels.",
        body: "The design profile helps Fell & Co. understand where your project stands, how your style reads, and what the clearest next step should be.",
        aside: "Calm, high-trust, and intentionally narrow in scope.",
        key: "panel"
      }),
      h(ProfileRibbon, { profiles: content.profiles, key: "profiles" }),
      h(QuizPath, { process: content.process, closing: content.closing, key: "path" }),
      h(Closing, { closing: content.closing, key: "closing" })
    ]),
    h(Footer, { brand: content.brand, key: "footer" })
  ]);
