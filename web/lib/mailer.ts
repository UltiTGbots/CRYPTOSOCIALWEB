import { env } from "./env";
import { Resend } from "resend";

export async function sendMail(to: string, subject: string, html: string) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) throw new Error("Email not configured");
  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({ from: env.MAIL_FROM, to, subject, html });
}
