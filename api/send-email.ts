import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.VITE_SENDGRID_API_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, code } = req.body as { email: string; code: string };

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email e código são obrigatórios' });
  }

  try {
    await sgMail.send({
      to: email,
      from: process.env.EMAIL_FROM!,
      subject: 'Código de Verificação - Txeka Aqui',
      text: `Seu código de verificação é: ${code}`,
    });

    return res.status(200).json({ success: true, message: 'E-mail enviado com sucesso!' });
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    return res.status(500).json({ success: false, message: 'Erro ao enviar e-mail.' });
  }
}