import { auth, db } from './firebase';
import { deleteUser } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

export const ensureUserProfile = async (uid, profile = {}) => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }

  const payload = {
    uid,
    email: profile.email ?? '',
    displayName: profile.displayName ?? '',
    address: profile.address ?? '',
    phone: profile.phone ?? '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload);
  return payload;
};

export const getUserProfile = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  throw new Error('User document not found');
};

export const updateUserProfile = async (uid, data) => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteUserAccount = async (uid) => {
  const ordersQuery = query(collection(db, 'orders'), where('userId', '==', uid));
  const ordersSnapshot = await getDocs(ordersQuery);

  await Promise.all(ordersSnapshot.docs.map((orderDoc) => deleteDoc(orderDoc.ref)));
  await deleteDoc(doc(db, 'users', uid));

  if (auth.currentUser && auth.currentUser.uid === uid) {
    await deleteUser(auth.currentUser);
  }
};