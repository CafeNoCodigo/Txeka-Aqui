import { db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

const invoiceCollection = collection(db, 'invoices');

export const createInvoice = async (invoiceData: any) => {
  try {
    const docRef = await addDoc(invoiceCollection, invoiceData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

export const updateInvoice = async (id: string, updatedData: any) => {
  try {
    const docRef = doc(db, 'invoices', id);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

export const deleteInvoice = async (id: string) => {
  try {
    const docRef = doc(db, 'invoices', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
};

export const getInvoices = async () => {
  try {
    const querySnapshot = await getDocs(invoiceCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};