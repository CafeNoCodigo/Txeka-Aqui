const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.PASS,
  },
});

exports.sendVerificationEmail = functions.https.onCall(async (data, context) => {
  const { email, code } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Código de Verificação - Txeka Aqui',
    text: `Seu código de verificação é: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao enviar e-mail');
  }
});