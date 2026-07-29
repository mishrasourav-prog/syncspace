import "../../config/env";

import nodemailer from "nodemailer";

export class MailService {
  private readonly transporter =
    nodemailer.createTransport({
      service: "gmail",
      auth: {
        user:
          process.env
            .EMAIL_USER,
        pass:
          process.env
            .EMAIL_PASSWORD,
      },
    });

  private buildOtpTemplate(options: {
    title: string;
    intro: string;
    otp: string;
    ignoreMessage: string;
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #111827;">
        <h2 style="color: #7c3aed; margin-bottom: 8px;">
          ${options.title}
        </h2>

        <p>Hello,</p>

        <p>${options.intro}</p>

        <div style="background: #f5f3ff; padding: 18px; border-radius: 10px; text-align: center; margin: 24px 0; border: 1px solid #ddd6fe;">
          <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
            Your verification code
          </div>

          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #7c3aed;">
            ${options.otp}
          </div>
        </div>

        <p><strong>This code expires in 10 minutes.</strong></p>

        <p>${options.ignoreMessage}</p>

        <hr style="margin: 24px 0; border: 0; border-top: 1px solid #e5e7eb;" />

        <p style="color: #6b7280; font-size: 13px;">
          This is an automated email from <strong>SyncSpace</strong>. Please do not reply.
        </p>
      </div>
    `;
  }

  async sendPasswordResetOtp(
    email: string,
    otp: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from:
        `"SyncSpace" <${process.env.EMAIL_USER}>`,
      to: email,
      subject:
        "SyncSpace • Password Reset Code",
      html:
        this.buildOtpTemplate({
          title:
            "Reset your SyncSpace password",
          intro:
            "Use the following six-digit code to continue resetting your password.",
          otp,
          ignoreMessage:
            "If you did not request a password reset, you can safely ignore this email.",
        }),
    });
  }

  async sendEmailVerificationOtp(
    email: string,
    otp: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from:
        `"SyncSpace" <${process.env.EMAIL_USER}>`,
      to: email,
      subject:
        "Verify your SyncSpace email",
      html:
        this.buildOtpTemplate({
          title:
            "Verify your SyncSpace email",
          intro:
            "Use the following six-digit code to complete your SyncSpace registration.",
          otp,
          ignoreMessage:
            "If you did not attempt to create a SyncSpace account, you can safely ignore this email.",
        }),
    });
  }

  async verifyConnection(): Promise<void> {
    await this.transporter.verify();
    console.log(
      "Mail service connected"
    );
  }
}

export default new MailService();
