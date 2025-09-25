import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import './AuthForm.css';

const firestore = getFirestore();

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSendVerificationCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    try {
      const response = await fetch('http://localhost:3001/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();
      if (result.success) {
        alert('E-mail de verificação enviado com sucesso! Verifique sua caixa de entrada.');
      } else {
        setError('Erro ao enviar e-mail de verificação. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail de verificação:', error);
      setError('Erro ao enviar e-mail de verificação. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          return;
        }
        if (verificationCode !== generatedCode) {
          setError('Código de verificação incorreto.');
          return;
        }
        if (!companyName) {
          setError('O nome da empresa é obrigatório.');
          return;
        }
        
        await createUserWithEmailAndPassword(auth, email, password);
        
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(firestore, 'users', user.uid);
          await setDoc(userRef, {
            companyName,
            email,
          });
        }
      } else {
        
        const isEmail = email.includes('@');
        if (isEmail) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('companyName', '==', email));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            setError('Nome da empresa não encontrado.');
            return;
          }

          const userDoc = querySnapshot.docs[0];
          const userEmail = userDoc.data().email;
          await signInWithEmailAndPassword(auth, userEmail, password);
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email ou senha incorretos.');
      } else if (err.code === 'auth/weak-password') {
        setError('A sua senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className='invoice-header'>{isRegistering ? 'Registrar' : 'Entrar'}</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder={isRegistering ? "Email" : "Email ou Nome da Empresa"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isRegistering && (
          <>
            <input
              type="text"
              placeholder="Nome da Empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Repetir Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button className='invoice-button' type="button" onClick={handleSendVerificationCode}>
              Enviar Código de Verificação
            </button>
            <input
              type="text"
              placeholder="Código de Verificação"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </>
        )}
        <button className='invoice-button' type="submit">{isRegistering ? 'Registrar' : 'Entrar'}</button>
        <p onClick={() => setIsRegistering(!isRegistering)} className="toggle-form">
          {isRegistering ? 'Já tem uma conta? Entre aqui.' : 'Não tem uma conta? Registre-se aqui.'}
        </p>
      </form>
    </div>
  );
};

export default AuthForm;