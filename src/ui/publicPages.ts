import { designProfileMap } from "../data/designProfiles.ts";
import type { ClientBundle } from "../types.ts";
import { footer, layout, nav } from "./layout.ts";

const quizAsset = (name: string) => `/assets/quiz/${name}`;

const roomProfiles = [
  ["traditional", "Traditional"],
  ["contemporary", "Contemporary"],
  ["modern", "Modern"],
  ["transitional", "Transitional"],
  ["mid-century", "Mid-Century"],
  ["natural-minimal", "Natural Minimal"],
  ["coastal-calm", "Coastal Calm"],
  ["rustic", "Rustic"],
  ["industrial-modern", "Industrial Modern"],
  ["classic-craftsman", "Classic Craftsman"]
] as const;

const roomOptions = (group: "bathroom" | "kitchen" | "living" | "dining") =>
  roomProfiles.map(([slug, label]) => ({
    value: slug,
    label: `${label} ${group}`,
    img: quizAsset(`${group}-${slug}.${group === "living" && slug !== "transitional" && slug !== "classic-craftsman" ? "jpeg" : group === "dining" ? "jpg" : "png"}`)
  }));

const startQuizQuestions = [
  {
    id: "bathroom",
    prompt: "Which bathroom would you want to step into every morning?",
    layout: "room",
    options: roomOptions("bathroom")
  },
  {
    id: "kitchen",
    prompt: "Which kitchen would you most want to cook in?",
    layout: "room",
    options: roomOptions("kitchen")
  },
  {
    id: "living",
    prompt: "Which living room feels most natural to you?",
    layout: "room",
    options: roomOptions("living")
  },
  {
    id: "dining",
    prompt: "Which dining room would you want to host dinner in?",
    layout: "wide",
    options: roomOptions("dining")
  },
  {
    id: "materials",
    prompt: "Which material combination would you reach for first?",
    layout: "material",
    options: [
      { value: "woven-natural", label: "Natural woven rug or fabric texture", img: quizAsset("armadillorug.jpg") },
      { value: "pale-plank", label: "Pale natural plank flooring", img: quizAsset("dinesencoastnatur.png") },
      { value: "warm-herringbone", label: "Herringbone warm wood flooring", img: quizAsset("hakwoodcraftrust.png") },
      { value: "soapstone-rustic", label: "Soapstone with rustic wood", img: quizAsset("soapcraftrust.png") },
      { value: "quartzite-traditional", label: "Quartzite and traditional stone", img: quizAsset("quartzitetradcoast.png") },
      { value: "zellige", label: "Zellige tile", img: quizAsset("zellige.jpg") },
      { value: "travertine", label: "Travertine", img: quizAsset("travertine.png") },
      { value: "geometric-pale-tile", label: "Geometric pale tile", img: quizAsset("geocolortile.jpg") }
    ]
  },
  {
    id: "wall",
    prompt: "Which wall treatment feels most like you?",
    layout: "material",
    options: [
      { value: "gold-wabi-abstract", label: "Gold wabi abstract wall treatment", img: quizAsset("calicowabi.png") },
      { value: "animal-line", label: "Animal line drawing wallpaper", img: quizAsset("artemis.png") },
      { value: "blue-floral", label: "Blue floral wallpaper", img: quizAsset("bienfait.png") },
      { value: "morris-botanical", label: "Morris green botanical wallpaper", img: quizAsset("morris.jpg") }
    ]
  },
  {
    id: "pattern",
    prompt: "How much pattern do you want in the room?",
    layout: "text",
    options: [
      { value: "almost-none", label: "Almost none — calm texture over pattern" },
      { value: "a-little", label: "A little — subtle tile, fabric, or wallpaper" },
      { value: "some", label: "Some — one expressive feature" },
      { value: "a-lot", label: "A lot — pattern and color are part of the point" }
    ]
  },
  {
    id: "contact",
    prompt: "Save your design profile.",
    intro: "Create a profile so we can save your quiz result, connect it to your project details, and show you the best next step.",
    layout: "contact",
    contact: true
  }
];

const resultHeroImages: Record<string, string> = {
  Traditional: quizAsset("bathroom-traditional.png"),
  Contemporary: quizAsset("bathroom-contemporary.png"),
  Modern: quizAsset("bathroom-modern.png"),
  Transitional: quizAsset("bathroom-transitional.png"),
  "Mid-Century": quizAsset("bathroom-mid-century.png"),
  "Natural Minimal": quizAsset("bathroom-natural-minimal.png"),
  "Coastal Calm": quizAsset("bathroom-coastal-calm.png"),
  Rustic: quizAsset("bathroom-rustic.png"),
  "Industrial Modern": quizAsset("bathroom-industrial-modern.png"),
  "Classic Craftsman": quizAsset("bathroom-classic-craftsman.png")
};

export const renderHomePage = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fell & Co.</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              bone: "#f2ebe1",
              plaster: "#efe6db",
              ink: "#1d1a17",
              smoke: "#676058",
              line: "#d9cfc3",
              moss: "#6e766b"
            },
            fontFamily: {
              serifDisplay: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Baskerville", "Georgia", "serif"],
              sansQuiet: ["Avenir Next", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"]
            },
            boxShadow: {
              quiet: "0 18px 40px rgba(36, 26, 18, 0.05)"
            },
            letterSpacing: {
              calm: "0"
            }
          }
        }
      };
    </script>
    <style>
      html { scroll-behavior: smooth; }
      body { background: #f2ebe1; color: #1d1a17; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/site/homepage.js"></script>
  </body>
</html>`;

export const renderStartPage = () =>
  layout(
    "Start Your Design Profile",
    `
      ${nav([
        { href: "/", label: "Home" },
        { href: "/start", label: "Start Here", cta: true }
      ])}
      <section class="hero start-hero">
        <div class="stack lg">
          <h1>Fell Concierge</h1>
          <p class="lede">Your personal design assistant, helping you define your style and guiding your selections.</p>
          <div class="start-hero-preview" aria-hidden="true">
            <img src="/assets/quiz/bathroom-traditional.png" alt="" loading="eager" />
            <img src="/assets/quiz/bathroom-coastal-calm.png" alt="" loading="eager" />
            <img src="/assets/quiz/bathroom-modern.png" alt="" loading="eager" />
          </div>
        </div>
      </section>
      <section class="section">
        <div class="card quiz-shell native-quiz-shell">
          <div class="sr-only" id="quiz-progress-label">Question 1 of 7</div>
          <div class="quiz-step-count" id="quiz-step-count">1 / 7</div>
          <div class="quiz-progress" aria-hidden="true"><span id="quiz-progress-bar"></span></div>
          <div id="native-quiz" class="native-quiz" aria-live="polite"></div>
          <div class="quiz-actions">
            <button type="button" class="ghost" id="quiz-back">Back</button>
            <button type="button" class="accent" id="quiz-next">Next</button>
          </div>
          <div id="quiz-status" class="note sync-status" aria-live="polite"></div>
        </div>
      </section>
      ${footer()}
      <script>
        const quizRoot = document.getElementById("native-quiz");
        const progressLabel = document.getElementById("quiz-progress-label");
        const progressCount = document.getElementById("quiz-step-count");
        const progressBar = document.getElementById("quiz-progress-bar");
        const statusEl = document.getElementById("quiz-status");
        const backButton = document.getElementById("quiz-back");
        const nextButton = document.getElementById("quiz-next");

        const questions = ${JSON.stringify(startQuizQuestions)};

        const answers = {};
        let step = 0;

        const renderOptions = (question) => {
          if (question.layout === "text") {
            return '<div class="text-option-list">' + question.options.map((option) => {
              const selected = answers[question.id] === option.value;
              return '<button type="button" class="text-option ' + (selected ? "selected" : "") + '" aria-pressed="' + selected + '" data-value="' + option.value + '">' +
                '<span>' + option.label + '</span>' +
                '<span class="option-check" aria-hidden="true">✓</span>' +
              '</button>';
            }).join("") + '</div>';
          }
          const gridClass = question.layout === "wide" ? "wide" : question.layout === "material" ? "material" : "room";
          return '<div class="image-option-grid ' + gridClass + '">' + question.options.map((option) => {
            const selected = answers[question.id] === option.value;
            return '<button type="button" class="image-option ' + (selected ? "selected" : "") + '" aria-pressed="' + selected + '" data-value="' + option.value + '">' +
              '<span class="image-option-media"><img src="' + option.img + '" alt="" loading="lazy" /></span>' +
              '<span class="option-check" aria-hidden="true">✓</span>' +
              '<span class="sr-only">' + option.label + '</span>' +
            '</button>';
          }).join("") + '</div>';
        };

        const renderContact = () => [
          '<form id="quiz-contact-form" class="quiz-contact-form">',
            '<div class="profile-form-section">',
              '<h3>Your profile</h3>',
              '<div class="grid two">',
                '<label class="field">Name<input name="name" autocomplete="name" required /></label>',
                '<label class="field">Email<input name="email" type="email" autocomplete="email" required /></label>',
                '<label class="field optional">Phone number<span class="field-note">Optional</span><input name="phone" autocomplete="tel" /></label>',
                '<label class="field magic-link-field"><span>Login setup</span><span class="magic-link-note">Send me a secure sign-in link after my profile is saved.</span><input type="hidden" name="loginSetup" value="secure-link" /></label>',
              '</div>',
            '</div>',
            '<div class="profile-form-section">',
              '<h3>Your project</h3>',
              '<div class="grid two">',
                '<label class="field">Project address<input name="projectAddress" autocomplete="street-address" required /></label>',
                '<label class="field">Renovation focus<select name="roomType"><option>Bathroom</option><option>Kitchen</option><option>Kitchen + first floor</option><option>Whole-home renovation</option><option>Not sure yet</option></select></label>',
                '<label class="field">Approximate budget<select name="budgetRange"><option>Under $50k</option><option>$50k-$100k</option><option>$100k-$200k</option><option>$200k-$400k</option><option>$400k+</option><option>Not sure yet</option></select></label>',
                '<label class="field">Approximate timeline<select name="timeline"><option>Exploring</option><option>0-3 months</option><option>3-6 months</option><option>6-12 months</option><option>12+ months</option></select></label>',
              '</div>',
              '<label class="field optional">What are you hoping to change?<span class="field-note">Optional</span><textarea name="scopeNotes" placeholder="A few words are enough."></textarea></label>',
            '</div>',
            '<a class="quiet-link skip-profile-link" href="/">Skip for now</a>',
          '</form>'
        ].join("");

        const render = () => {
          const question = questions[step];
          progressLabel.textContent = question.contact ? "Final step" : "Question " + (step + 1) + " of " + (questions.length - 1);
          progressCount.textContent = question.contact ? "Profile" : (step + 1) + " / " + (questions.length - 1);
          progressBar.style.width = Math.round(((step + 1) / questions.length) * 100) + "%";
          quizRoot.innerHTML =
            '<div class="quiz-question-head">' +
              '<h2>' + question.prompt + '</h2>' +
              (question.intro ? '<p class="note">' + question.intro + '</p>' : '') +
              (question.help ? '<p class="note">' + question.help + '</p>' : '') +
            '</div>' +
            (question.contact ? renderContact() : renderOptions(question));
          backButton.disabled = step === 0;
          nextButton.disabled = !question.contact && !answers[question.id];
          nextButton.textContent = question.contact ? "Save My Profile & View Results" : "Next";
          statusEl.textContent = "";

          quizRoot.querySelectorAll(".image-option, .text-option").forEach((button) => {
            button.addEventListener("click", () => {
              answers[question.id] = button.dataset.value;
              render();
            });
          });
        };

        const submitQuiz = async () => {
          const form = document.getElementById("quiz-contact-form");
          if (!form.reportValidity()) {
            return;
          }

          statusEl.textContent = "Preparing your design profile...";
          nextButton.disabled = true;

          try {
            const data = new FormData(form);
            const payload = {
              name: String(data.get("name") || ""),
              email: String(data.get("email") || ""),
              phone: String(data.get("phone") || ""),
              projectAddress: String(data.get("projectAddress") || ""),
              roomType: String(data.get("roomType") || ""),
              scopeNotes: String(data.get("scopeNotes") || ""),
              budgetRange: String(data.get("budgetRange") || ""),
              contractorStatus: "Profile saved",
              timeline: String(data.get("timeline") || ""),
              source: "Fell Concierge native quiz",
              answers: Object.entries(answers).map(([id, value]) => id + ":" + value)
            };

            const response = await fetch("/api/quiz", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok || !result.clientId) {
              throw new Error(result.error || "Quiz submission failed.");
            }
            window.localStorage.setItem("fellClientId", result.clientId);
            window.location.href = "/result?id=" + encodeURIComponent(result.clientId);
          } catch (error) {
            nextButton.disabled = false;
            statusEl.textContent = "Something did not submit cleanly. Please try again.";
          }
        };

        backButton.addEventListener("click", () => {
          if (step > 0) {
            step -= 1;
            render();
          }
        });

        nextButton.addEventListener("click", () => {
          const question = questions[step];
          if (question.contact) {
            submitQuiz();
            return;
          }
          if (!answers[question.id]) {
            statusEl.textContent = "Choose one image to continue.";
            return;
          }
          step += 1;
          render();
          window.scrollTo({ top: document.querySelector(".native-quiz-shell").offsetTop - 16, behavior: "smooth" });
        });

        render();
      </script>
    `
  );

export const renderPortalAccessPage = () =>
  layout(
    "Sign In to Fell & Co",
    `
      ${nav([
        { href: "/", label: "Home" },
        { href: "/start", label: "Start Here" }
      ])}
      <section class="result-hero portal-access-hero">
        <div class="result-copy">
          <p class="result-eyebrow">Fell Concierge</p>
          <h1>Return to your saved design profile.</h1>
          <p class="result-lede">Use the email or secure link connected to your Fell & Co design profile.</p>
        </div>
        <aside class="result-action soft-panel">
          <div class="result-action-copy">
            <h2>Looking for your result?</h2>
            <p>Your result is saved to the profile you created after completing the quiz. Use the same email address to return to it.</p>
            <a class="quiet-link" href="/start">Retake the quiz</a>
          </div>
        </aside>
      </section>
      ${footer()}
    `
  );

export const renderResultPage = (bundle: ClientBundle) => {
  const primary = bundle.profileResult?.primary_profile ? designProfileMap.get(bundle.profileResult.primary_profile) : undefined;
  const heroImage = bundle.profileResult?.primary_profile ? resultHeroImages[bundle.profileResult.primary_profile] : quizAsset("bathroom-transitional.png");
  const profileName = bundle.profileResult?.primary_profile ?? "Design Profile";
  const cues = (primary?.style_cues ?? []).slice(0, 4);
  const materialDirection = (primary?.palette_material_direction ?? []).slice(0, 4).join(", ");
  const secondaryText = bundle.profileResult?.secondary_profile ? `Secondary influence: ${bundle.profileResult.secondary_profile}` : "";
  return layout(
    "Your Fell & Co Design Profile",
    `
      ${nav([
        { href: "/", label: "Home" },
        { href: "/start", label: "Start Here" }
      ])}
      <section class="result-hero">
        <div class="result-copy">
          <p class="result-eyebrow">Your Design Profile</p>
          <h1>${profileName}</h1>
          <p class="result-lede">${primary?.description ?? ""}</p>
          <div class="result-meta">
            <span>Primary match: ${Math.round((bundle.profileResult?.primary_confidence ?? 0) * 100)}%</span>
            ${secondaryText ? `<span>${secondaryText}</span>` : ""}
          </div>
        </div>
        <aside class="result-action">
          <div class="result-hero-media">
            <img src="${heroImage}" alt="" />
          </div>
          <div class="result-action-copy">
            <h2>Start with real materials.</h2>
            <p>Your design profile is a starting point. A sample box turns that direction into finishes you can see, touch, and compare in your own home.</p>
            <button type="button" class="accent" id="purchase-sample-box-hero">Build My Sample Box</button>
            <a class="quiet-link" href="/portal?id=${bundle.client.id}">Save My Profile</a>
          </div>
        </aside>
      </section>
      <section class="result-detail-grid">
        <div class="result-detail">
          <h2>Your style direction</h2>
          <p>${profileName} works best when the room feels intentional, edited, and tactile. The palette should support the mood without becoming flat; layered materials, softened lighting, and a restrained mix keep the direction livable.</p>
          <div class="pill-row quiet">${cues.map((cue) => `<span class="pill">${cue}</span>`).join("")}</div>
          ${materialDirection ? `<p class="result-note">Materials to notice: ${materialDirection}.</p>` : ""}
        </div>
        <div class="result-detail soft-panel">
          <h2>Recommended next step</h2>
          <p>The sample box is the best first step because it turns the design profile into real materials you can hold, compare, and approve before committing to a larger design package.</p>
          <button type="button" class="accent" id="purchase-sample-box">Build My Sample Box</button>
          <div id="purchase-status" class="note"></div>
        </div>
      </section>
      <section class="profile-access">
        <a href="/portal?id=${bundle.client.id}"><button type="button" class="ghost">Sign In / Log In</button></a>
      </section>
      ${footer()}
      <script>
        window.localStorage.setItem("fellClientId", "${bundle.client.id}");
        const startSampleBoxCheckout = async () => {
          const response = await fetch("/api/checkout/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId: "${bundle.client.id}", productType: "SAMPLE_BOX", returnPath: "/portal?id=${bundle.client.id}" })
          });
          const result = await response.json();
          const status = document.getElementById("purchase-status");
          status.textContent = result.message || "Redirecting to checkout.";
          if (response.ok) {
            window.location.href = result.checkoutUrl;
          }
        };
        document.getElementById("purchase-sample-box")?.addEventListener("click", startSampleBoxCheckout);
        document.getElementById("purchase-sample-box-hero")?.addEventListener("click", startSampleBoxCheckout);
      </script>
    `
  );
};
