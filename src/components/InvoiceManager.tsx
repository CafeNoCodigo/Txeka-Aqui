import React, { useEffect, useState } from 'react';
import { createInvoice, updateInvoice, deleteInvoice, getInvoices } from '../services/invoiceService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const InvoiceManager: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    companyName: '',
    employeeName: '',
    employeeRole: '',
    paymentMethod: '',
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [products, setProducts] = useState<{ name: string; quantity: number; price: number }[]>([]);
  const [taxRate, setTaxRate] = useState(0.17); // 17% tax rate
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

  useEffect(() => {
    const fetchCompanyName = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const companyName = userDoc.data().companyName;
          setFormData((prevData) => ({ ...prevData, companyName }));
        }
      }
    };

    fetchCompanyName();
  }, []);

  // logs para depuração
  //useEffect(() => {
  //  console.log('Estado inicial de products:', products);
  //}, [products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handlePreview = () => {
    setPreviewData({
      ...formData,
      logo: logo ? URL.createObjectURL(logo) : null,
    });
  };

  const handleAddProduct = () => {
    setProducts([...products, { name: '', quantity: 0, price: 0 }]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: string, value: string | number) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  };

  const calculateSubtotal = () => {
    return products.reduce((sum, product) => sum + product.price * product.quantity, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * taxRate;
  };

  const calculateTotal = (subtotal: number, tax: number) => {
    return subtotal + tax;
  };

  const handleCreate = async () => {
    if (products.length === 0) {
      alert('Adicione pelo menos um produto antes de criar a fatura.');
      return;
    }

    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const total = calculateTotal(subtotal, tax);

    const invoiceData = {
      ...formData,
      products,
      subtotal,
      tax,
      total,
    };

    const id = await createInvoice(invoiceData);
    setInvoices([...invoices, { id, ...invoiceData }]);
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
        <input name="employeeName" placeholder="Nome do Funcionário" onChange={handleInputChange} />
        <input name="employeeRole" placeholder="Cargo" onChange={handleInputChange} />
        <select name="paymentMethod" onChange={handleInputChange}>
          <option value="">Forma de Pagamento</option>
          <option value="M-Pesa">M-Pesa</option>
          <option value="E-Mola">E-Mola</option>
          <option value="Banco">Banco</option>
        </select>
        <button onClick={handleCreate}>Criar Fatura</button>
        <button
          onClick={() => {
            setFormData({
              companyName: '',
              employeeName: '',
              employeeRole: '',
              paymentMethod: '',
            });
            setPreviewData(null);
            setProducts([]);
            // Limpar os campos do formulário visualmente
            const inputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
              'input[name="companyName"], input[name="employeeName"], input[name="employeeRole"], select[name="paymentMethod"], input[type="file"]'
            );
            inputs.forEach(input => {
              if (input.type === 'file') {
          input.value = '';
              } else if (input.tagName === 'SELECT') {
          (input as HTMLSelectElement).selectedIndex = 0;
              } else {
          input.value = '';
              }
            });
          }}
        >
          Limpar Campos
        </button>
      </div>
      <div>
        <h3>Produtos</h3>
        {Array.isArray(products) ? (
          products.length > 0 ? (
            products.map((product, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder="Nome do Produto"
                  value={product.name || ''}
                  onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Quantidade"
                  value={product.quantity || 0}
                  onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 0)}
                />
                <input
                  type="number"
                  placeholder="Preço"
                  value={product.price || 0}
                  onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value) || 0)}
                />
                <button onClick={() => handleRemoveProduct(index)}>Remover</button>
              </div>
            ))
          ) : (
            <p>Nenhum produto adicionado ainda.</p>
          )
        ) : (
          <p>Erro: `products` não é um array válido.</p>
        )}
        <button onClick={handleAddProduct}>Adicionar Produto</button>
      </div>
      <div>
        <h3>Resumo</h3>
        <p>Subtotal: {calculateSubtotal()} MZN</p>
        <p>Impostos (17%): {calculateTax(calculateSubtotal())} MZN</p>
        <p>Total: {calculateTotal(calculateSubtotal(), calculateTax(calculateSubtotal()))} MZN</p>
      </div>
      <ul>
        {invoices.map(invoice => (
          <li key={invoice.id}>
            {invoice.companyName} - {invoice.products.map((p: any) => p.name).join(', ')} - {invoice.subtotal} - {invoice.tax} - {invoice.total} - {invoice.price + 'MZN'}
            <button onClick={() => handleUpdate(invoice.id)}>Editar</button>
            <button onClick={() => handleDelete(invoice.id)}>Excluir</button>
            <button onClick={() => setPreviewData(invoice)}>Pré-visualizar</button>
          </li>
        ))}
      </ul>
      {previewData && (
        <div className="invoice-preview">
          {previewData.logo && <img src={previewData.logo} alt="Logotipo da Empresa" style={{ maxWidth: '100px' }} />}
          <h2>{previewData.companyName}</h2>
          <p>Nome do Funcionário: {previewData.employeeName}</p>
          <p>Cargo: {previewData.employeeRole}</p>
          <p>Produtos:</p>
          <ul>
            {previewData.products.map((product: any, index: number) => (
              <li key={index}>
                {product.name} - {product.quantity} - {product.price}
              </li>
            ))}
          </ul>
          <p>Subtotal: {previewData.subtotal}</p>
          <p>Imposto: {previewData.tax}</p>
          <p>Total: {previewData.total}</p>
          <p>Forma de Pagamento: {previewData.paymentMethod}</p>
        </div>
      )}
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
};

export default InvoiceManager;