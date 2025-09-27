import React, { useEffect, useState, Suspense, lazy } from "react";
import { createInvoice, updateInvoice, deleteInvoice, getInvoices } from "../services/invoiceService";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, storage } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const Loader = lazy(() => import("../components/Loader"));

const InvoiceManager: React.FC = () => {
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    companyName: "",
    employeeName: "",
    employeeRole: "",
    paymentMethod: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [products, setProducts] = useState<{ name: string; quantity: number; price: number }[]>([]);
  const [qrCodeData, setQrCode] = useState<any | null>(null);
  const [paidInvoices, setPaidInvoices] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const generateInvoicePDF = (invoice: any) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Código da Factura: ${invoice.id}`, 20, 20);

    doc.setFontSize(12);
    doc.text(`Cliente: ${invoice.employeeName}`, 20, 40);
    doc.text(`Atendente: ${invoice.employeeRole}`, 20, 50);
    doc.text(`Forma de Pagamento: ${invoice.paymentMethod}`, 20, 60);

    let y = 80;
    invoice.products.forEach((p: any, i: number) => {
      doc.text(`${i + 1}. ${p.name} - Qtd: ${p.quantity} - Preço: ${p.price} MZN`, 20, y);
      y += 10;
    });

    doc.text(`Subtotal: ${invoice.subtotal} MZN`, 20, y + 10);
    doc.text(`Impostos: ${invoice.tax} MZN`, 20, y + 20);
    doc.text(`Total: ${invoice.total} MZN`, 20, y + 30);

    // Baixa o PDF localmente
    doc.save(`Fatura-${invoice.employeeName}.pdf`);
  };

  const generateQRCode = (invoice: any) => {
    const qrData = JSON.stringify({
      id: invoice.id,
      cliente: invoice.employeeName,
      total: invoice.total,
      pagamento: invoice.paymentMethod,
    });
    setQrCode(qrData); // só mostra no preview
  };

  const uploadInvoicePDF = async (invoice: any, pdfBlob: Blob) => {
    const pdfRef = ref(storage, `faturas/${invoice.id}.pdf`);
    await uploadBytes(pdfRef, pdfBlob);
    const url = await getDownloadURL(pdfRef);
    return url; // retorna link público do PDF
  };

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

  const calculateTotal = (subtotal: number) => {
    return subtotal;
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
    const total = calculateTotal(subtotal);

    const invoiceData = {
      ...formData,
      products,
      subtotal,
      total,
      isPaid: false,
    };

    const id = await createInvoice(invoiceData);
    setInvoices([...invoices, { id, ...invoiceData }]);

    clearForm();
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

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true); 
        const data = await getInvoices();
        setInvoices(data);

        const paidState: { [key: string]: boolean } = {};
        data.forEach((inv: any) => {
          paidState[inv.id] = inv.isPaid || false;
        });
        setPaidInvoices(paidState);
      } catch (err) {
        console.error("Erro ao buscar faturas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchCompanyName = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const companyName = userDoc.data().companyName;
          setFormData((prevData) => ({ ...prevData, companyName }));
        }
      }
    };
    fetchCompanyName();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <Suspense fallback={<div></div>}>
          <Loader text="Carregando suas faturas..." size={80} />
        </Suspense>
      </div>
    );
  }

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
          <option value="Numerário">Numerário</option>
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
        <h3 className="invoice-section-title">Total</h3>
        <p className="invoice-summary"><span className="invoice-summary-bold">{calculateTotal(calculateSubtotal())} MZN</span></p>
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
            {paidInvoices[invoice.id] ? "✔ " : "❌ " + invoice.companyName} - {invoice.products.map((p: any) => p.name).join(', ')} - {invoice.total + "MZN"}
            <button className="invoice-button ml-2 lg:mr-2" onClick={() => handleDelete(invoice.id)}>Excluir</button>
            <button className="invoice-button" onClick={() => { setPreviewData(invoice)}}>Ver</button>
            <button className="invoice-button ml-2" onClick={async () =>{
              const newPaidStatus = !paidInvoices[invoice.id];
              setPaidInvoices(prev => ({
                ...prev,
                [invoice.id]: newPaidStatus
              }));

              await updateInvoice(invoice.id, { isPaid: newPaidStatus });
            }}>
              {!paidInvoices[invoice.id] ? "Pago" :"Não Pago"}</button>
            <button className="invoice-button ml-2" onClick={() => generateInvoicePDF(invoice)}>PDF</button>
          </li>
        ))}
      </ul>
      {previewData && (
        <div className="invoice-preview">
          {qrCodeData && (
            <div>
              <h3>#{qrCodeData.id}</h3>
              <QRCodeCanvas
                value={qrCodeData}
                size={180}
              />
              <p className="mt-2">Escaneie para baixar a fatura</p>
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