import type { ClientBundle, EmailTemplateType } from "../types.ts";
import { PRODUCT_LABELS } from "./pricing.ts";

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

const baseHtml = (title: string, intro: string, sections: string[]) => `
  <div style="font-family: Georgia, 'Times New Roman', serif; background:#f6efe6; padding:32px;">
    <div style="max-width:680px; margin:0 auto; background:#fffaf3; border:1px solid #e1d4c6; border-radius:24px; padding:32px;">
      <p style="margin:0 0 12px; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:#7a6d60;">Fell & Co</p>
      <h1 style="margin:0 0 16px; font-size:42px; line-height:1; color:#1f1a16;">${title}</h1>
      <p style="margin:0 0 18px; color:#5f544a; font-size:17px; line-height:1.6;">${intro}</p>
      ${sections.join("")}
      <p style="margin:24px 0 0; color:#5f544a; font-size:15px; line-height:1.6;">Fell & Co is a productized design funnel, not unlimited free design support.</p>
    </div>
  </div>
`;

export const renderEmailTemplate = (bundle: ClientBundle, templateType: EmailTemplateType): RenderedEmail => {
  const profile = bundle.profileResult?.primary_profile ?? "your design direction";
  const recommendation = recommendationLabel(bundle);

  if (templateType === "PROFILE_RESULT") {
    return {
      subject: `Your Fell & Co design profile is ready`,
      text: [
        `Hi ${bundle.client.name},`,
        ``,
        `Your free Design Profile suggests ${profile} as the strongest fit for your project.`,
        `This is directional guidance only until more project information is collected.`,
        ``,
        `Recommended next step: ${recommendation}.`,
        `The sample box is usually the first paid move after the quiz.`,
        ``,
        `Fell & Co`
      ].join("\n"),
      html: baseHtml(
        `Your profile is ready`,
        `Your free Design Profile suggests <strong>${profile}</strong> as the strongest fit for your project.`,
        [
          `<div style="padding:18px; border-radius:18px; background:#f4ebe1; margin-bottom:16px;"><strong>Recommended next step:</strong> ${recommendation}</div>`,
          `<p style="margin:0; color:#5f544a; font-size:16px; line-height:1.6;">This result is directional. We do not treat it as contractor-ready detail, exact dimensions, or unlimited free support.</p>`
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
