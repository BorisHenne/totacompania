import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import { Message, Setting } from "@/models";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "Nom, email et message sont requis" },
        { status: 400 }
      );
    }

    const message = new Message({
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject || "Contact depuis le site",
      message: body.message,
      read: false,
      archived: false,
    });

    await message.save();

    // Send email notification to contact@totacompania.fr
    try {
      const smtpSetting = await Setting.findOne({ key: "smtp_settings" });
      if (smtpSetting && smtpSetting.value) {
        const smtp = typeof smtpSetting.value === "string" ? JSON.parse(smtpSetting.value) : smtpSetting.value;

        const transporter = nodemailer.createTransport({
          host: smtp.host,
          port: parseInt(smtp.port) || 587,
          secure: smtp.secure === true || smtp.port === "465",
          auth: { user: smtp.user, pass: smtp.password },
        });

        const escapedName = body.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const escapedEmail = body.email.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const escapedMessage = body.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const escapedPhone = body.phone ? body.phone.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
        const escapedSubject = body.subject ? body.subject.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

        await transporter.sendMail({
          from: `${smtp.fromName || "Tota Compania"} <${smtp.fromEmail || smtp.user}>`,
          to: smtp.fromEmail || "contact@totacompania.fr",
          replyTo: body.email,
          subject: `[Site Web] ${body.subject || "Nouveau message de " + body.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #5b21b6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">Nouveau message depuis le site</h2>
              </div>
              <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #6b7280; width: 100px;">Nom</td><td style="padding: 8px 0; font-weight: bold;">${escapedName}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapedEmail}">${escapedEmail}</a></td></tr>
                  ${escapedPhone ? `<tr><td style="padding: 8px 0; color: #6b7280;">Tel</td><td style="padding: 8px 0;">${escapedPhone}</td></tr>` : ""}
                  ${escapedSubject ? `<tr><td style="padding: 8px 0; color: #6b7280;">Sujet</td><td style="padding: 8px 0;">${escapedSubject}</td></tr>` : ""}
                </table>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
                <div style="white-space: pre-wrap; line-height: 1.6;">${escapedMessage}</div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
                <p style="color: #9ca3af; font-size: 12px;">Ce message a ete envoye depuis le formulaire de contact de totacompania.fr</p>
              </div>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    return NextResponse.json({ success: true, id: message._id }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
