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
        href: hero.secondaryCta.href,
        key: "cta",
        className:
          "inline-flex items-center justify-center rounded-[8px] border border-line bg-paper px-4 py-2 font-sansQuiet text-[11px] uppercase tracking-calm text-ink transition hover:bg-[#f7f0e7]"
      }, hero.secondaryCta.label)
    ])
  ]);

const Hero = ({ hero }) =>
  h(Container, { className: "flex min-h-[calc(100svh-92px)] items-center justify-center pt-12 pb-16 text-center sm:min-h-[calc(100svh-104px)] sm:pt-14 sm:pb-20" }, [
    h("div", { className: "mx-auto max-w-[900px]" }, [
      h("h1", { className: "font-serifDisplay text-[2.7rem] leading-[1] text-ink sm:text-[4rem] lg:text-[5rem]" }, hero.headline),
      h("p", { className: "mx-auto mt-6 max-w-[680px] font-sansQuiet text-[1rem] leading-8 text-smoke sm:text-[1.16rem]" }, hero.supporting),
      h("div", { className: "mt-9 flex justify-center" }, [
        h("a", {
          href: hero.primaryCta.href,
          className:
            "inline-flex min-w-[220px] items-center justify-center rounded-[8px] bg-ink px-7 py-3.5 font-sansQuiet text-[12px] uppercase tracking-calm text-bone transition hover:opacity-92"
        }, hero.primaryCta.label)
      ])
    ])
  ]);

const QuizPath = ({ process, closing }) =>
  h(Container, { className: "py-10 sm:py-14", wide: true }, [
    h("section", { className: "text-center", id: "about" }, [
      h("p", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, process.eyebrow),
      h("h2", { className: "mt-4 font-serifDisplay text-[2.25rem] leading-[1.04] text-ink sm:text-[3.6rem]" }, process.title)
    ]),
    h("div", {
      className:
        "mx-auto mt-10 grid max-w-[980px] gap-px overflow-hidden rounded-[8px] border border-line bg-line sm:grid-cols-3"
    }, process.steps.map((step, index) =>
      h("div", { className: "bg-paper px-7 py-8 text-left", key: step.title }, [
        h("p", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, String(index + 1).padStart(2, "0")),
        h("h3", { className: "mt-4 font-serifDisplay text-[1.7rem] leading-tight text-ink" }, step.title),
        h("p", { className: "mt-3 font-sansQuiet text-[0.98rem] leading-7 text-smoke" }, step.body)
      ])
    ))
  ]);

const ProfileRibbon = ({ profiles }) =>
  h(Container, { className: "py-8 sm:py-10" }, [
    h("section", {
      className:
        "border-y border-line px-2 py-8"
    }, [
      h("p", { className: "text-center font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, profiles.eyebrow),
      h("div", {
        className:
          "mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 font-serifDisplay text-[1.18rem] leading-tight text-ink sm:text-[1.45rem]"
      }, profiles.items.map((item) => h("span", { key: item }, item)))
    ])
  ]);

const FAQ = ({ faq }) =>
  h(Container, { className: "py-10 sm:py-16" }, [
    h("section", { id: "faq", className: "mx-auto max-w-[960px] border-t border-line pt-10 sm:pt-14" }, [
      h("div", { className: "text-center" }, [
        h("p", { className: "font-sansQuiet text-[11px] uppercase tracking-calm text-smoke" }, faq.eyebrow),
        h("h2", { className: "mt-4 font-serifDisplay text-[2.25rem] leading-[1.04] text-ink sm:text-[3.4rem]" }, faq.title)
      ]),
      h("div", { className: "mt-9 grid gap-px overflow-hidden rounded-[8px] border border-line bg-line" },
        faq.items.map((item) =>
          h("article", { className: "bg-paper px-6 py-6 text-left sm:px-8", key: item.question }, [
            h("h3", { className: "font-serifDisplay text-[1.45rem] leading-tight text-ink" }, item.question),
            h("p", { className: "mt-3 font-sansQuiet text-[0.98rem] leading-7 text-smoke" }, item.answer)
          ])
        )
      )
    ])
  ]);

const Closing = ({ closing }) => {
  const [portalHref, setPortalHref] = React.useState(closing.cta.href);

  const resolvePortalHref = () => {
    const clientId = window.localStorage.getItem("fellClientId");
    return clientId ? `/portal?id=${encodeURIComponent(clientId)}` : closing.cta.href;
  };

  React.useEffect(() => {
    setPortalHref(resolvePortalHref());
  }, []);

  return h(Container, { className: "py-12 text-center sm:py-20" }, [
    h("h2", { className: "font-serifDisplay text-[2.3rem] leading-[1.03] text-ink sm:text-[4rem]" }, closing.title),
    h("p", { className: "mx-auto mt-5 max-w-[640px] font-sansQuiet text-[1rem] leading-8 text-smoke sm:text-[1.08rem]" }, closing.body),
    h("div", { className: "mt-9 flex justify-center" }, [
      h("a", {
        href: portalHref,
        onClick: (event) => {
          const href = resolvePortalHref();
          if (href !== portalHref) {
            event.preventDefault();
            window.location.href = href;
          }
        },
        className:
          "inline-flex min-w-[220px] items-center justify-center rounded-[8px] bg-ink px-7 py-3.5 font-sansQuiet text-[12px] uppercase tracking-calm text-bone transition hover:opacity-92"
      }, closing.cta.label)
    ])
  ]);
};

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
      h(QuizPath, { process: content.process, closing: content.closing, key: "path" }),
      h(ProfileRibbon, { profiles: content.profiles, key: "profiles" }),
      h(FAQ, { faq: content.faq, key: "faq" }),
      h(Closing, { closing: content.closing, key: "closing" })
    ]),
    h(Footer, { brand: content.brand, key: "footer" })
  ]);
