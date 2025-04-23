export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #3b82f6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: #ffffff; margin: 0;">Verify Your Email</h1>
    </div>
    <div style="background-color: #ffffff; padding: 24px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
      <p style="font-size: 16px; margin-bottom: 16px;">Hi there 👋,</p>
      <p style="font-size: 16px; margin-bottom: 16px;">
        Thanks for signing up to <strong>CodeIDE</strong>! Just click the button below to verify your email address:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Verify Email
        </a>
      </div>
      <p style="font-size: 14px; color: #475569;">This link is valid for 24 hours. If you didn't sign up, you can safely ignore this email.</p>
      <p style="margin-top: 24px; font-size: 14px;">— The CodeIDE Team</p>
    </div>
    <div style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px;">
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #3b82f6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: #ffffff; margin: 0;">Reset Your Password</h1>
    </div>
    <div style="background-color: #ffffff; padding: 24px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
      <p style="font-size: 16px; margin-bottom: 16px;">Hi there 👋,</p>
      <p style="font-size: 16px; margin-bottom: 16px;">
        We received a request to reset your password. If you didn’t make this request, you can safely ignore this email.
      </p>
      <p style="font-size: 16px; margin-bottom: 16px;">
        To reset your password, click the button below:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 14px; color: #475569;">This link is valid for 10 minutes. If you didn’t request a password reset, no further action is required.</p>
      <p style="margin-top: 24px; font-size: 14px;">— The CodeIDE Team</p>
    </div>
    <div style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px;">
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;
