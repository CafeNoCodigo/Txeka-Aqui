import React, { useEffect, useState } from 'react';
import { createInvoice, updateInvoice, deleteInvoice, getInvoices } from '../services/invoiceService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';

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
  const [qrCodeData, setQrCode] = useState<any | null>(null);

  const isPaid = true;

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

  const clearForm = () => {
    setFormData({
      companyName: '',
      employeeName: '',
      employeeRole: '',
      paymentMethod: '',
    });
    setPreviewData(null);
    setProducts([]);

    // Limpar os campos do formulário visualmente
    const inputs = document.querySelectorAll<
      HTMLInputElement | HTMLSelectElement
    >(
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
    <div className="invoice-container">
      <h1 className="invoice-header">Gerenciar Faturas</h1>
      <div className="invoice-section">
        <input className="invoice-input mb-4" name="employeeName" placeholder="Nome do Cliente" onChange={handleInputChange} />
        <input className="invoice-input md:ml-4" name="employeeRole" placeholder="Nome do atendente" onChange={handleInputChange} />
        <select className='border border-gray-300 md:ml-4 mt-4 p-2 rounded-lg' name="paymentMethod" onChange={handleInputChange}>
          <option value="">Forma de Pagamento</option>
          <option value="M-Pesa">M-Pesa</option>
          <option value="E-Mola">E-Mola</option>
          <option value="Banco">Banco</option>
          <option value="Banco">Numerário</option>
        </select>
        <button
          className='invoice-button mt-4 md:ml-4'
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
      <div className="invoice-section">
        <h3 className="invoice-section-title">Adicionar Produtos</h3>
        {products.map((product, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center space-x-4 mb-4 sm:flex-wrap">
            <input
              type="text"
              placeholder="Nome do Produto"
              value={product.name || ''}
              onChange={(e) => handleProductChange(index, 'name', e.target.value)}
              className="invoice-input flex-1 mb-4"
            />
            <input
              type="number"
              placeholder="Quantidade"
              value={product.quantity || 0}
              onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 0)}
              className="invoice-input w-24 mb-4"
            />
            <input
              type="number"
              placeholder="Preço"
              value={product.price || 0}
              onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value) || 0)}
              className="invoice-input w-24 mb-4"
            />
            <button
              onClick={() => handleRemoveProduct(index)}
              className="invoice-button-remove"
            >
              Remover
            </button>
          </div>
        ))}
        <button
          onClick={handleAddProduct}
          className="invoice-button"
        >
          Adicionar Produto
        </button>
      </div>

      <div className="invoice-section">
        <h3 className="invoice-section-title">Resumo</h3>
        <p className="invoice-summary">Subtotal: <span className="invoice-summary-bold">{calculateSubtotal()} MZN</span></p>
        <p className="invoice-summary">Impostos (17%): <span className="invoice-summary-bold">{calculateTax(calculateSubtotal())} MZN</span></p>
        <p className="invoice-summary">Total: <span className="invoice-summary-bold">{calculateTotal(calculateSubtotal(), calculateTax(calculateSubtotal()))} MZN</span></p>
      </div>

      <div className="invoice-section">
        <h3 className="invoice-section-title">Ações</h3>
        <button
          onClick={() => {
            handleCreate();
            clearForm();
          }}
          className="invoice-button mr-4"
        >
          Criar Fatura
        </button>
        <button
          onClick={handleLogout}
          className=" text-white px-4 py-2 rounded-lg cursor-pointer md:hover:scale-105 transition-transform bg-red-500 hover:bg-red-600"
        >
          Sair
        </button>
      </div>

      <ul>
        {invoices.map(invoice => (
          <li className="invoice-summary mb-4" key={invoice.id}>
            {isPaid ? "✔ " : "❌ " + invoice.companyName} - {invoice.products.map((p: any) => p.name).join(', ')} - {invoice.total + "MZN"}
            <button className="invoice-button ml-2 lg:mr-2" onClick={() => handleDelete(invoice.id)}>Excluir</button>
            <button className="invoice-button hidden lg:inline-block" onClick={() => { setPreviewData(invoice); setQrCode(invoice)}}>Ver</button>
            <button className="invoice-button ml-2" onClick={() => setPreviewData(invoice)}>Pago</button>
          </li>
        ))}
      </ul>
      {previewData && (
        <div className="invoice-preview">
          {qrCodeData && (
            <div>
              <h3>#{qrCodeData.id}</h3>
              <QRCodeCanvas
                value={JSON.stringify({
                  id: qrCodeData.id,
                  cliente: qrCodeData.employeeName,
                  total: qrCodeData.total,
                })}
                size={180}
              />
            </div>
          )}
          <h2>{previewData.companyName}</h2>
          <p>Nome do Cliente: {previewData.employeeName}</p>
          <p>Nome do Atendente: {previewData.employeeRole}</p>
          <p>Produtos:</p>
          <ul>
            {previewData.products.map((product: any, index: number) => (
              <li key={index}>
                <p>{"🧷 " + product.name}</p> 
                <p>Quantidade: {product.quantity}</p> 
              </li>
            ))}
          </ul>
          <p>Subtotal: {previewData.subtotal + "MZN"}</p>
          <p>Imposto: {previewData.tax + "MZN"}</p>
          <p>Total: {previewData.total + "MZN"}</p>
          <p>Forma de Pagamento: {previewData.paymentMethod}</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceManager;