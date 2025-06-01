const nodemailer = require('nodemailer');

// Crear el transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función para enviar email de verificación
const sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: `"GiConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Código de verificación - GiConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">GiConnect</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Este es el código de verificación para cambiar su contraseña:
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #333;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">
            Este código expirará en 1 hora.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail
}; 