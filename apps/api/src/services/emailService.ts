import { logger } from "../utils/logger";

export class EmailService {
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    isHtml: boolean = false,
  ): Promise<boolean> {
    logger.info(`[Placeholder] Sending email to: ${to} - Subject: ${subject}`);

    // In a real app, integrate SendGrid, AWS SES, Nodemailer, etc.
    // Make it async to simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return true;
  }
}

export const emailService = new EmailService();
