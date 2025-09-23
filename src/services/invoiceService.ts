import { db, auth } from '../firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

const invoiceCollection = collection(db, 'invoices');

export const createInvoice = async (invoiceData: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');

  const invoiceWithUser = { ...invoiceData, userId: user.uid };
  try {
    const docRef = await addDoc(invoiceCollection, invoiceWithUser);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar a factura:', error);
    throw error;
  }
};

export const updateInvoice = async (id: string, updatedData: any) => {
  try {
    const docRef = doc(db, 'invoices', id);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error('Erro ao atualizar a factura:', error);
    throw error;
  }
};

export const deleteInvoice = async (id: string) => {
  try {
    const docRef = doc(db, 'invoices', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao apagar a Factura:', error);
    throw error;
  }
};

export const getInvoices = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');

  try {
    const querySnapshot = await getDocs(
      query(invoiceCollection, where('userId', '==', user.uid))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erro ao buscar a factura:', error);
    throw error;
  }
};