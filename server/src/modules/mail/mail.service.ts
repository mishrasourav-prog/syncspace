import "../../config/env";


import nodemailer from "nodemailer";




export class MailService {

    
private otpTemplate(otp: string): string {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
            <h2 style="color: #2563eb;">SyncSpace Password Reset</h2>

            <p>Hello,</p>

            <p>You requested to reset your password. Use the following One-Time Password (OTP):</p>

            <div
                style="
                    background: #f3f4f6;
                    padding: 16px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 24px 0;
                "
            >
                <h1
                    style="
                        margin: 0;
                        letter-spacing: 6px;
                        color: #2563eb;
                        font-size: 36px;
                    "
                >
                    ${otp}
                </h1>
            </div>

            <p><strong>This OTP expires in 10 minutes.</strong></p>

            <p>If you didn't request a password reset, you can safely ignore this email.</p>

            <hr style="margin: 24px 0;" />

            <p style="color: #6b7280; font-size: 14px;">
                This is an automated email from <strong>SyncSpace</strong>. Please do not reply.
            </p>
        </div>
    `;
}
    private readonly transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

    async sendOtpEmail(
    email: string,
    otp: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"SyncSpace" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SyncSpace • Password Reset OTP",
      html: this.otpTemplate(otp),
    });
  }

  async verifyConnection(): Promise<void> {
    await this.transporter.verify();
    console.log("Mail service connected");
  }

}           

export default new MailService();