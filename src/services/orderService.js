import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const ordersCollection = collection(db, 'orders');

export const createOrder = async (user, cartItems, totalAmount) => {
  const orderData = {
    userId: user.uid,
    userEmail: user.email ?? '',
    userName: user.displayName ?? '',
    items: cartItems.map((item) => ({
      id: item.id,
      title: item.title,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image: item.image ?? '',
      category: item.category ?? '',
    })),
    totalAmount: Number(totalAmount) || 0,
    itemCount: cartItems.reduce((count, item) => count + (Number(item.quantity) || 1), 0),
    status: 'placed',
    createdAt: new Date().toISOString(),
  };
  const docRef = await addDoc(ordersCollection, orderData);
  return { id: docRef.id, ...orderData };
};

export const getUserOrders = async (userId) => {
  const userOrdersQuery = query(ordersCollection, where('userId', '==', userId));
  const snapshot = await getDocs(userOrdersQuery);
  return snapshot.docs
    .map((orderDoc) => ({ id: orderDoc.id, ...orderDoc.data() }))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
};