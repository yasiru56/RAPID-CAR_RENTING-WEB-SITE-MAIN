const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e.g. 
    pass: process.env.EMAIL_PASS, // App password (not your Gmail password)
  },
});

const sendBookingApprovalEmail = async (to, renterName, vehicleName) => {
  await transporter.sendMail({
    from: `"Rapid Rent" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Booking is Approved!",
    html: `
      <div style="max-width:600px;margin:0 auto;background-color:#fff;border:1px solid #ddd;border-radius:8px;padding:30px;font-family:Arial,sans-serif;color:#333;">
        
        <h2 style="color:#71b571;">Hi ${renterName},</h2>
        <p style="font-size:16px;">We're excited to inform you that your booking for <strong>${vehicleName}</strong> has been 
          <span style="color:#71b571;font-weight:bold;">approved</span> by the owner!</p>
        <p style="font-size:16px;">You can now log into your account to proceed with the next steps and finalize your rental experience.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="https://yourdomain.com/login" style="background-color:#71b571;color:#fff;padding:12px 24px;border-radius:5px;text-decoration:none;font-weight:bold;">Login to Your Account</a>
        </div>
        <p style="font-size:14px;color:#888;">Thank you for choosing <strong>Rapid Rent</strong>. We hope you enjoy the ride!</p>
        <hr style="margin-top:30px;border:none;border-top:1px solid #eee;" />
        <p style="font-size:12px;color:#aaa;text-align:center;">&copy; ${new Date().getFullYear()} Rapid Rent. All rights reserved.</p>
      </div>
    `,
  });
};

const sendOwnerConfirmationEmail = async (to, renterName, vehicleName) => {
  const mailOptions = {
    from: `"Rapid Rent" <${process.env.EMAIL_USER}>`,
    to,
    subject: "A renter has confirmed a booking!",
    html: `
        <h2>Booking Confirmed</h2>
        <p><strong>${renterName}</strong> has confirmed a booking for your vehicle: <strong>${vehicleName}</strong>.</p>
        <p>You can prepare for handover and communicate with the renter if needed.</p>
      `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendBookingApprovalEmail, sendOwnerConfirmationEmail };
