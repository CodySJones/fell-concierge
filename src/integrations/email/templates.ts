import type { ClientBundle, EmailTemplateType } from "../../types.ts";
import { PRODUCT_LABELS } from "../../core/fallon/serviceCatalog.ts";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const recommendationLabel = (bundle: ClientBundle) => {
  const recommendation = bundle.recommendation?.recommended_offer;
  return recommendation && recommendation in PRODUCT_LABELS
    ? PRODUCT_LABELS[recommendation as keyof typeof PRODUCT_LABELS]
    : recommendation ?? "Sample Box";
};

const publicBaseUrl = () => (process.env.BASE_URL ?? "http://localhost:3001").replace(/\/$/, "");

const portalUrl = (bundle: ClientBundle) => `${publicBaseUrl()}/portal?id=${encodeURIComponent(bundle.client.id)}`;

const baseHtml = (title: string, intro: string, sections: string[]) => `
  <div style="font-family: Georgia, 'Times New Roman', serif; background:#f6efe6; padding:32px;">
    <div style="max-width:680px; margin:0 auto; background:#fffaf3; border:1px solid #e1d4c6; border-radius:18px; padding:32px;">
      <p style="margin:0 0 12px; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:#7a6d60;">Fell & Co</p>
      <h1 style="margin:0 0 16px; font-size:42px; line-height:1; color:#1f1a16;">${title}</h1>
      <p style="margin:0 0 18px; color:#5f544a; font-size:17px; line-height:1.6;">${intro}</p>
      ${sections.join("")}
      <p style="margin:26px 0 0; color:#7a6d60; font-size:13px; line-height:1.6;">Fell & Co. Redesigning Remodeling.</p>
    </div>
  </div>
`;

export const renderEmailTemplate = (bundle: ClientBundle, templateType: EmailTemplateType): RenderedEmail => {
  const profile = bundle.profileResult?.primary_profile ?? "your design direction";
  const recommendation = recommendationLabel(bundle);

  if (templateType === "PROFILE_RESULT") {
    const profileLink = portalUrl(bundle);
    return {
      subject: `Your Fell & Co design profile is ready`,
      text: [
        `Hi ${bundle.client.name},`,
        ``,
        `Your Fell & Co design profile is ready: ${profile}.`,
        bundle.profileResult?.secondary_profile ? `Secondary influence: ${bundle.profileResult.secondary_profile}.` : ``,
        ``,
        `Next step: build your Sample Box.`,
        `Your design profile is a starting point. A sample box turns that direction into finishes you can see, touch, and compare in your own home.`,
        ``,
        `Log in or return to your profile here: ${profileLink}`,
        ``,
        `Fell & Co`
      ].filter(Boolean).join("\n"),
      html: baseHtml(
        `Your profile is ready`,
        `Your Fell & Co design profile is <strong>${profile}</strong>.`,
        [
          bundle.profileResult?.secondary_profile
            ? `<p style="margin:0 0 16px; color:#5f544a; font-size:15px; line-height:1.6;">Secondary influence: ${bundle.profileResult.secondary_profile}</p>`
            : "",
          `<div style="padding:18px; border-radius:14px; background:#f4ebe1; margin-bottom:16px;"><strong>Start with real materials.</strong><br /><span style="color:#5f544a;">Your design profile is a starting point. A sample box turns that direction into finishes you can see, touch, and compare in your own home.</span></div>`,
          `<p style="margin:0 0 18px; color:#5f544a; font-size:16px; line-height:1.6;">Your profile and login link are below. Use this link anytime to return to your result.</p>`,
          `<a href="${profileLink}" style="display:inline-block; border-radius:8px; background:#1f1a16; color:#fffaf3; padding:13px 18px; text-decoration:none; font-size:14px;">View My Design Profile</a>`,
          `<p style="margin:18px 0 0; color:#7a6d60; font-size:13px; line-height:1.6;">Recommended next step: ${recommendation}.</p>`
        ]
      )
    };
  }

  if (templateType === "SAMPLE_BOX_REMINDER") {
    return {
      subject: `Your next Fell & Co step: sample box`,
      text: [
        `Hi ${bundle.client.name},`,
        ``,
        `Your Design Profile is complete, and the strongest next paid step is the Sample Box.`,
        `It helps turn your direction into something tangible before consultation or later-stage deliverables.`,
        ``,
        `Current recommendation: ${recommendation}.`,
        ``,
        `Fell & Co`
      ].join("\n"),
      html: baseHtml(
        `A quick next-step reminder`,
        `Your profile is complete, and the strongest next paid step is the <strong>Sample Box</strong>.`,
        [
          `<p style="margin:0 0 16px; color:#5f544a; font-size:16px; line-height:1.6;">That first paid step helps us move from style direction into material direction without pretending the project is fully locked.</p>`,
          `<div style="padding:18px; border-radius:18px; background:#f4ebe1;"><strong>Current recommendation:</strong> ${recommendation}</div>`
        ]
      )
    };
  }

  return {
    subject: `A recommended next step for your Fell & Co project`,
    text: [
      `Hi ${bundle.client.name},`,
      ``,
      `Based on your current project stage, the recommended next step is ${recommendation}.`,
      `We only unlock later-stage work when the right prerequisites are complete.`,
      ``,
      `Current project state: ${bundle.client.current_state}.`,
      ``,
      `Fell & Co`
    ].join("\n"),
    html: baseHtml(
      `Your project follow-up`,
      `Based on your current project stage, the recommended next step is <strong>${recommendation}</strong>.`,
      [
        `<p style="margin:0 0 16px; color:#5f544a; font-size:16px; line-height:1.6;">We surface later offers only when the project is ready for them, and we keep uncertainty explicit when scans or measurements are still missing.</p>`,
        `<div style="padding:18px; border-radius:18px; background:#f4ebe1;"><strong>Current project state:</strong> ${bundle.client.current_state}</div>`
      ]
    )
  };
};
