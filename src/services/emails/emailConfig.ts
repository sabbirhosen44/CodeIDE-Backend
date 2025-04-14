import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import config from "../../config/default.js";

const transporterOptions: SMTPTransport.Options = {
  host: config.smtpSettings.host,
  port: config.smtpSettings.port,
  secure: false,
  auth: {
    user: config.smtpSettings.user,
    pass: config.smtpSettings.pass,
  },
};

export const transporter = nodemailer.createTransport(transporterOptions);
