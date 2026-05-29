import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const productsCollection = collection(db, 'products');

const normalizeProduct = (productData) => ({
  title: productData.title?.trim() ?? '',
  description: productData.description?.trim() ?? '',
  category: productData.category?.trim() ?? '',
  image: productData.image?.trim() ?? '',
  price: Number(productData.price) || 0,
  stock: Number(productData.stock) || 0,
});

export const fetchProducts = async () => {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map((productDoc) => ({ id: productDoc.id, ...productDoc.data() }));
};

export const createProduct = async (productData) => {
  const payload = {
    ...normalizeProduct(productData),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const docRef = await addDoc(productsCollection, payload);
  return { id: docRef.id, ...payload };
};

export const updateProduct = async (productId, productData) => {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, {
    ...normalizeProduct(productData),
    updatedAt: new Date().toISOString(),
  });
};

export const deleteProduct = async (productId) => {
  const productRef = doc(db, 'products', productId);
  await deleteDoc(productRef);
};