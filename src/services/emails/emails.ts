import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

import { transporter } from "./emailConfig.js";
import config from "../../config/default.js";

export const sendVerificationEmail = async (
  email: string,
  verificationUrl: string
) => {
  const recipient = email;
  try {
    const response = await transporter.sendMail({
      from: `"Sabbir Hosen" ${config.smtpSettings.user}`,
      to: recipient,
      subject: "Verify your email.",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationUrl}",
        verificationUrl
      ),
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error(`Error sending verification`, error);

    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
) => {
  const recipient = email;

  try {
    const response = await transporter.sendMail({
      from: `"Sabbir Hosen" ${config.smtpSettings.user}`,
      to: recipient,
      subject: "Password reset request email",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetUrl}", resetUrl),
    });

    console.log("Passoword reset link send to your email!", response);
  } catch (error) {
    console.log("Error sending password reset link email!");
    throw new Error(`Error sending password reset link email:${error}`);
  }
};
