import "../../config/env";

import ApiError from "../../utils/ApiError";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface BrevoErrorBody {
  code?: string;
  message?: string;
}

class MailService {
  private readonly endpoint =
    "https://api.brevo.com/v3/smtp/email";

  private getRequiredEnvironmentVariable(
    name: string
  ): string {
    const value =
      process.env[name]?.trim();

    if (!value) {
      throw new ApiError(
        500,
        `${name} is not configured.`
      );
    }

    return value;
  }

  private getSender(): {
    email: string;
    name: string;
  } {
    return {
      email:
        this.getRequiredEnvironmentVariable(
          "EMAIL_FROM"
        ),

      name:
        process.env.EMAIL_FROM_NAME?.trim() ||
        "SyncSpace",
    };
  }

  private async sendEmail(
    options: SendEmailOptions
  ): Promise<void> {
    const apiKey =
      this.getRequiredEnvironmentVariable(
        "BREVO_API_KEY"
      );

    let response: Awaited<
      ReturnType<typeof fetch>
    >;

    try {
      response =
        await fetch(
          this.endpoint,
          {
            method: "POST",

            headers: {
              accept: "application/json",
              "content-type":
                "application/json",
              "api-key": apiKey,
            },

            body:
              JSON.stringify({
                sender:
                  this.getSender(),

                to: [
                  {
                    email:
                      options.to,
                  },
                ],

                subject:
                  options.subject,

                htmlContent:
                  options.html,
              }),

            signal:
              AbortSignal.timeout(
                12_000
              ),
          }
        );
    } catch (error) {
      console.error(
        "Brevo request failed:",
        error
      );

      throw new ApiError(
        503,
        "Email delivery is temporarily unavailable. Please try again."
      );
    }

    if (!response.ok) {
      let providerError:
        BrevoErrorBody = {};

      try {
        providerError =
          (await response.json()) as
            BrevoErrorBody;
      } catch {
        // Brevo did not return a JSON error body.
      }

      console.error(
        "Brevo rejected the email:",
        {
          status:
            response.status,

          code:
            providerError.code,

          message:
            providerError.message,
        }
      );

      throw new ApiError(
        503,
        "Email delivery is temporarily unavailable. Please try again."
      );
    }
  }

  private buildOtpTemplate(
    options: {
      title: string;
      introduction: string;
      otp: string;
      ignoreMessage: string;
    }
  ): string {
    return `
      <!doctype html>

      <html lang="en">
        <body
          style="
            margin: 0;
            padding: 24px;
            background: #f4f1ea;
            font-family: Arial, sans-serif;
            color: #151a1f;
          "
        >
          <div
            style="
              max-width: 560px;
              margin: 0 auto;
              padding: 32px;
              background: #ffffff;
              border: 1px solid #d9e0e4;
              border-radius: 12px;
            "
          >
            <div
              style="
                margin-bottom: 24px;
                font-size: 20px;
                font-weight: 700;
                color: #356c8c;
              "
            >
              SyncSpace
            </div>

            <h1
              style="
                margin: 0 0 16px;
                font-size: 24px;
                line-height: 1.3;
                color: #151a1f;
              "
            >
              ${options.title}
            </h1>

            <p
              style="
                margin: 0 0 20px;
                color: #59636a;
                line-height: 1.6;
              "
            >
              ${options.introduction}
            </p>

            <div
              style="
                margin: 24px 0;
                padding: 22px;
                background: #eef3f5;
                border: 1px solid #cbd7de;
                border-radius: 10px;
                text-align: center;
              "
            >
              <div
                style="
                  margin-bottom: 8px;
                  color: #68757c;
                  font-size: 13px;
                "
              >
                Your verification code
              </div>

              <div
                style="
                  color: #356c8c;
                  font-size: 36px;
                  font-weight: 700;
                  letter-spacing: 8px;
                "
              >
                ${options.otp}
              </div>
            </div>

            <p
              style="
                color: #59636a;
                line-height: 1.6;
              "
            >
              This code expires in
              <strong>10 minutes</strong>.
            </p>

            <p
              style="
                color: #59636a;
                line-height: 1.6;
              "
            >
              ${options.ignoreMessage}
            </p>

            <hr
              style="
                margin: 28px 0;
                border: 0;
                border-top: 1px solid #d9e0e4;
              "
            />

            <p
              style="
                margin: 0;
                color: #7b858b;
                font-size: 12px;
                line-height: 1.5;
              "
            >
              This is an automated email from
              SyncSpace. Please do not reply.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  async sendEmailVerificationOtp(
    email: string,
    otp: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,

      subject:
        "Verify your SyncSpace email",

      html:
        this.buildOtpTemplate({
          title:
            "Verify your email address",

          introduction:
            "Use the following code to complete your SyncSpace registration.",

          otp,

          ignoreMessage:
            "If you did not attempt to create a SyncSpace account, you can safely ignore this email.",
        }),
    });
  }

  async sendPasswordResetOtp(
    email: string,
    otp: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,

      subject:
        "SyncSpace password reset code",

      html:
        this.buildOtpTemplate({
          title:
            "Reset your password",

          introduction:
            "Use the following code to continue resetting your SyncSpace password.",

          otp,

          ignoreMessage:
            "If you did not request a password reset, you can safely ignore this email.",
        }),
    });
  }

  async verifyConnection():
    Promise<void> {
    this.getRequiredEnvironmentVariable(
      "BREVO_API_KEY"
    );

    this.getRequiredEnvironmentVariable(
      "EMAIL_FROM"
    );

    console.log(
      "Brevo email API configuration verified."
    );
  }
}

export default new MailService();