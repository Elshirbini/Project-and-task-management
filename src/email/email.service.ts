import { Resend } from "resend";
import { EmailTemplate } from "./templates/email-template.interface";
import { OtpConfirmationTemplate } from "./templates/otp-confirmation.template";
import { ResetPasswordTemplate } from "./templates/reset-password.template";
import { WelcomeTemplate } from "./templates/welcome.template";
import { logger } from "../config/logger";

export class EmailService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  private async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      const data = await this.resend.emails.send({
        from: "Apollo Perfumes<info@apolloperfumes.com>",
        to: [to],
        subject,
        html: htmlContent,
      });

      logger.info(`✅ Email sent: ${JSON.stringify(data)}`);
    } catch (error) {
      logger.error("❌ Error sending email", error);
    }
  }

  private async sendTemplate(template: EmailTemplate) {
    return this.sendEmail(template.to, template.subject(), template.html());
  }

  async sendOTPConfirmationEmail(to: string, otp: string) {
    const template = new OtpConfirmationTemplate(to, otp);
    await this.sendTemplate(template);
  }

  async sendResetPasswordEmail(to: string, code: string) {
    const template = new ResetPasswordTemplate(to, code);
    await this.sendTemplate(template);
  }

  async sendWelcomeEmail(to: string) {
    const template = new WelcomeTemplate(to);
    await this.sendTemplate(template);
  }
}

export const emailService = new EmailService();
