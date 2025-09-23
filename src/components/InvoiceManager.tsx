import React, { useEffect, useState } from 'react';
import { createInvoice, updateInvoice, deleteInvoice, getInvoices } from '../services/invoiceService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

const InvoiceManager: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    companyName: '',
    employeeName: '',
    employeeRole: '',
    product: '',
    quantity: 0,
    paymentMethod: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      const data = await getInvoices();
      setInvoices(data);
    };
    fetchInvoices();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async () => {
    const id = await createInvoice(formData);
    setInvoices([...invoices, { id, ...formData }]);
  };

  const handleUpdate = async (id: string) => {
    await updateInvoice(id, formData);
    setInvoices(invoices.map(inv => (inv.id === id ? { id, ...formData } : inv)));
  };

  const handleDelete = async (id: string) => {
    await deleteInvoice(id);
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  return (
    <div>
      <h1>Gerenciar Faturas</h1>
      <div>
        <input name="companyName" placeholder="Nome da Empresa" onChange={handleInputChange} />
        <input name="employeeName" placeholder="Nome do Funcionário" onChange={handleInputChange} />
        <input name="employeeRole" placeholder="Cargo" onChange={handleInputChange} />
        <input name="product" placeholder="Produto" onChange={handleInputChange} />
        <input name="quantity" type="number" placeholder="Quantidade" onChange={handleInputChange} />
        <select name="paymentMethod" onChange={handleInputChange}>
          <option value="">Forma de Pagamento</option>
          <option value="M-Pesa">M-Pesa</option>
          <option value="E-Mola">E-Mola</option>
          <option value="Banco">Banco</option>
        </select>
        <button onClick={handleCreate}>Criar Fatura</button>
      </div>
      <ul>
        {invoices.map(invoice => (
          <li key={invoice.id}>
            {invoice.companyName} - {invoice.product} - {invoice.quantity}
            <button onClick={() => handleUpdate(invoice.id)}>Editar</button>
            <button onClick={() => handleDelete(invoice.id)}>Excluir</button>
          </li>
        ))}
      </ul>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
};

export default InvoiceManager;