const express = require('express');
const sendgrid = require('@sendgrid/mail');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/send-email', async (req, res) => {
  const { email, code } = req.body;

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Código de Verificação - Txeka Aqui',
    text: `Seu código de verificação é: ${code}`,
  };

  try {
    await sendgrid.send(msg);
    res.status(200).send({ success: true, message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).send({ success: false, message: 'Erro ao enviar e-mail.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});