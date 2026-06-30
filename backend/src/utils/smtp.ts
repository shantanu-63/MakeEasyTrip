// src/utils/smtp.ts
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.mailtrap.io";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "2525");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@makeeasytrip.com";

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    if (!SMTP_USER) {
      console.log(`[SMTP MOCK] Sending email to ${to}:`);
      console.log(`Subject: ${subject}`);
      console.log(`Body Snippet: ${html.substring(0, 150)}...`);
      return { messageId: "mock-message-id" };
    }

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (err: any) {
    console.error("Failed to send email via SMTP, falling back to mock logger:", err.message);
    console.log(`[SMTP FALLBACK] Sending email to ${to}:`);
    console.log(`Subject: ${subject}`);
    return { messageId: "fallback-mock-message-id" };
  }
}

export function getBookingEmailHtml(bookingDetails: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0A225C;">MakeEasyTrip Booking Confirmation</h2>
      <p>Hello ${bookingDetails.userName},</p>
      <p>Your booking for <strong>${bookingDetails.propertyName}</strong> has been successfully confirmed!</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #FF5E14;">Reservation Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Booking ID:</td>
            <td style="padding: 4px 0; font-weight: bold;">${bookingDetails.bookingId}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Check In:</td>
            <td style="padding: 4px 0; font-weight: bold;">${bookingDetails.checkIn}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Check Out:</td>
            <td style="padding: 4px 0; font-weight: bold;">${bookingDetails.checkOut}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Amount Paid:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #0A225C;">₹${bookingDetails.amount.toLocaleString()}</td>
          </tr>
        </table>
      </div>
      
      <p>Need support? Log in to your Traveler Dashboard to view/cancel your bookings or chat with our 24/7 AI agent.</p>
      <p>Thank you for choosing MakeEasyTrip!</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 11px; color: #64748b; text-align: center;">MakeEasyTrip Travel Tech Pvt Ltd • Travel Made Easy</p>
    </div>
  `;
}
