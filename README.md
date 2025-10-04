# 📑 InvoiceUp

Um sistema simples e moderno para **emissão e gestão de faturas** em PDF.
Permite cadastro de usuários (empresas), registro de vendas, geração de faturas personalizadas, acompanhamento de status (pago/não pago) e exclusão de registros.

---

## 🚀 Tecnologias Utilizadas

* **TypeScript** – lógica tipada e mais segura
* **HTML & CSS** – estrutura e estilização base
* **TailwindCSS** – design responsivo e rápido
* **Framer Motion** – animações fluidas e modernas
* **Firebase** – autenticação e persistência de dados
* **CJS (CommonJS)** – suporte modular no backend

---

## ✨ Funcionalidades

✔️ Cadastro de usuário com nome da empresa e email

✔️ Registro de vendas (quantidade, nome, preço, atendente e cliente)

✔️ Emissão de fatura em **PDF**

✔️ Download direto da fatura

✔️ Visualização e exclusão de faturas

✔️ Marcar faturas como **pagas ou não pagas**

---

## 📂 Estrutura do Projeto

```
📦 invoiceup
 ┣ 📂 api              # API e Integracao com Firebase para envio de email e pagina admin
 ┣ 📂 backend          # API e integração com Firebase
   ┣ 📂 routes         # Rotas para o backend
   ┗ 📂 types          # Tipos auxiliares para typescript no backend
 ┣ 📂 constants        # Textos de componentes para facil manuntencao
 ┣ 📂 functions        # Funcoes auxiliares para envio
 ┣ 📂 public           # Arquivos de estilizacao
 ┃ ┗ 📂 social-media   # Arquivos de imagens de midia social
 ┣ 📂 src              # Estrutura e frontend global
 ┃ ┣ 📂 assets
 ┃ ┣ 📂 components     # Componentes reutilizáveis (React + TSX)
 ┃ ┣ 📂 sections       # Páginas principais do sistema
 ┃ ┗ 📂 services       # Funções auxiliares
 ┣ 📂 types            # configuracos para o typescript reconhecer dependencias 
 ┣ 📜 package.json
 ┣ 📜 sever.cjs 
 ┣ 📜 tsconfig.json
 ┗ 📜 README.md
```

---

## ⚡ Como Rodar o Projeto

1. **Clone o repositório**

   ```bash
   git clone https://github.com/seu-usuario/txeka-aqui.git
   cd txeka-aqui
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure o Firebase**

   * Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   * Adicione as credenciais no `.env.local`:

     ```env
     VITE_FIREBASE_API_KEY=xxxx
     VITE_FIREBASE_AUTH_DOMAIN=xxxx
     VITE_FIREBASE_PROJECT_ID=xxxx
     VITE_FIREBASE_STORAGE_BUCKET=xxxx
     VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
     VITE_FIREBASE_APP_ID=xxxx
     VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
     VITE_FIREBASE_CLIENT_EMAIL=xxxx
     VITE_FIREBASE_PRIVATE_KEY=xxxx
     VITE_FIREBASE_DATABASE_URL=xxxx
     VITE_FIREBASE_UID=xxxx
     VITE_PASS=xxxx

     VITE_SENDGRID_API_KEY=xxxx
     VITE_EMAIL_FROM=xxxx
     SENDGRID_API_KEY=xxxx
     EMAIL_FROM=xxxx
     ```

4. **Inicie o servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

---

## 🎨 Preview

A interface foi construída com **TailwindCSS** e animada com **Framer Motion**, garantindo uma experiência rápida, responsiva e moderna.

---

## 📌 Futuras Melhorias

O projeto está em constante evolução e receberá novas funcionalidades.

---

## 📜 Licença

Este projeto é distribuído sob a licença **MIT**.

---

Feito com 💚 por Fabiao Chirindza Mainato
