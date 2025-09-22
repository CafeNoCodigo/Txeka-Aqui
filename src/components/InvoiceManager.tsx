import React, { useEffect, useState } from 'react';
import { createInvoice, updateInvoice, deleteInvoice, getInvoices } from '../services/invoiceService';

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

  useEffect(() => {
    const fetchInvoices = async () => {
      const data = await getInvoices();
      setInvoices(data);
    };
    fetchInvoices();
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
          <option value="Cartão">Cartão</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Pix">Pix</option>
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
    </div>
  );
};

export default InvoiceManager;