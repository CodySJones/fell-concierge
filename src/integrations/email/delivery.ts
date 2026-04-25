import { randomUUID } from "node:crypto";
import type { AppState, ClientBundle, EmailDelivery, EmailTemplateType } from "../../types.ts";
import { renderEmailTemplate } from "./templates.ts";

const provider = process.env.EMAIL_PROVIDER ?? "log";
const fromEmail = process.env.EMAIL_FROM ?? "hello@fell-co.com";
const resendApiKey = process.env.RESEND_API_KEY ?? "";
const sendgridApiKey = process.env.SENDGRID_API_KEY ?? "";

const sendViaResend = async (to: string, subject: string, html: string, text: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const result = (await response.json()) as { id?: string };
  return result.id ?? null;
};

const sendViaSendGrid = async (to: string, subject: string, html: string, text: string) => {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.headers.get("x-message-id");
};

export const getEmailProviderLabel = () => {
  if (provider === "resend" && resendApiKey) {
    return "Resend";
  }
  if (provider === "sendgrid" && sendgridApiKey) {
    return "SendGrid";
  }
  return "Log-only";
};

export const sendTemplatedEmail = async (state: AppState, bundle: ClientBundle, templateType: EmailTemplateType): Promise<EmailDelivery> => {
  const email = renderEmailTemplate(bundle, templateType);
  const baseDelivery: EmailDelivery = {
    id: randomUUID(),
    client_id: bundle.client.id,
    template_type: templateType,
    subject: email.subject,
    to_email: bundle.client.email,
    status: "PENDING",
    provider: getEmailProviderLabel(),
    provider_message_id: null,
    error_message: null,
    sent_at: new Date().toISOString()
  };

  try {
    if (provider === "resend" && resendApiKey) {
      baseDelivery.provider_message_id = await sendViaResend(bundle.client.email, email.subject, email.html, email.text);
      baseDelivery.status = "SENT";
    } else if (provider === "sendgrid" && sendgridApiKey) {
      baseDelivery.provider_message_id = await sendViaSendGrid(bundle.client.email, email.subject, email.html, email.text);
      baseDelivery.status = "SENT";
    } else {
      baseDelivery.status = "SIMULATED";
    }
  } catch (error) {
    baseDelivery.status = "FAILED";
    baseDelivery.error_message = error instanceof Error ? error.message : "Unknown email error";
  }

  state.emailDeliveries.push(baseDelivery);
  return baseDelivery;
};

export const getEmailTemplatesForStage = (bundle: ClientBundle): EmailTemplateType[] => {
  if (!bundle.purchases.some((purchase) => purchase.product_type === "SAMPLE_BOX" && purchase.status === "PAID")) {
    return ["SAMPLE_BOX_REMINDER"];
  }
  return ["OFFER_FOLLOWUP"];
};
