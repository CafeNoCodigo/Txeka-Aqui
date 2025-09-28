import express from 'express';
import cors from 'cors';
import sgMail from '@sendgrid/mail';
import serverless from 'serverless-http';
import type { Request, Response } from 'express';

const app = express();

app.use(cors());
app.use(express.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

app.post('/send-email', async (req: Request, res: Response) => {
  const { email, code } = req.body as { email: string; code: string };

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM!,
    subject: 'Código de Verificação - Txeka Aqui',
    text: `Seu código de verificação é: ${code}`,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true, message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar e-mail.' });
  }
});

export default serverless(app);