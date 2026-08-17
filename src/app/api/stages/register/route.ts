import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import { Setting } from "@/models";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const required = ["childLastName", "childFirstName", "birthDate", "address", "phone", "email"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Send email notification
    const smtpSetting = await Setting.findOne({ key: "smtp_settings" });
    if (!smtpSetting || !smtpSetting.value) {
      return NextResponse.json(
        { error: "Configuration email non disponible" },
        { status: 500 }
      );
    }

    const smtp = typeof smtpSetting.value === "string" ? JSON.parse(smtpSetting.value) : smtpSetting.value;

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: parseInt(smtp.port) || 587,
      secure: smtp.secure === true || smtp.port === "465",
      auth: { user: smtp.user, pass: smtp.password },
    });

    const esc = (s: string) => (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    await transporter.sendMail({
      from: `${smtp.fromName || "Tota Compania"} <${smtp.fromEmail || smtp.user}>`,
      to: smtp.fromEmail || "contact@totacompania.fr",
      replyTo: body.email,
      subject: `[Inscription Stage] ${body.stageTitle || "Stage"} - ${body.childFirstName} ${body.childLastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #5b21b6, #844cfc); color: white; padding: 25px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0 0 5px 0;">Nouvelle inscription - Stage</h2>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">${esc(body.stageTitle || "")}</p>
          </div>
          <div style="padding: 25px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; background: #faf8ff;">
            <h3 style="color: #5b21b6; margin-top: 0; border-bottom: 2px solid #e9dfff; padding-bottom: 8px;">Enfant</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #6b7280; width: 160px;">Nom</td><td style="padding: 6px 0; font-weight: bold;">${esc(body.childLastName)}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Prenom</td><td style="padding: 6px 0; font-weight: bold;">${esc(body.childFirstName)}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Date de naissance</td><td style="padding: 6px 0;">${esc(body.birthDate)}</td></tr>
            </table>

            <h3 style="color: #5b21b6; margin-top: 20px; border-bottom: 2px solid #e9dfff; padding-bottom: 8px;">Responsable</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #6b7280; width: 160px;">Adresse</td><td style="padding: 6px 0;">${esc(body.address)}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Telephone</td><td style="padding: 6px 0;">${esc(body.phone)}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0;"><a href="mailto:${esc(body.email)}">${esc(body.email)}</a></td></tr>
            </table>

            ${body.allergies ? `
            <h3 style="color: #5b21b6; margin-top: 20px; border-bottom: 2px solid #e9dfff; padding-bottom: 8px;">Allergies / Regimes specifiques</h3>
            <p style="white-space: pre-wrap;">${esc(body.allergies)}</p>
            ` : ""}

            ${body.notes ? `
            <h3 style="color: #5b21b6; margin-top: 20px; border-bottom: 2px solid #e9dfff; padding-bottom: 8px;">Informations diverses</h3>
            <p style="white-space: pre-wrap;">${esc(body.notes)}</p>
            ` : ""}

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Inscription envoyee depuis totacompania.fr le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Stage registration error:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
