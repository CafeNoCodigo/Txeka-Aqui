import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import Footer from './sections/Footer.tsx';
import Hero from './sections/Hero.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Hero />
      <App />
      <Footer />
    </BrowserRouter>
  </StrictMode>,
)
