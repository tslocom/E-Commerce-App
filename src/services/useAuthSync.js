import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { setUser, logoutAction } from '../services/store';
import { ensureUserProfile } from './userService';

export const useAuthSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isActive) {
        return;
      }

      if (user) {
        const profile = await ensureUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName ?? '',
        }).catch(() => null);

        if (!isActive) {
          return;
        }

        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: profile?.displayName ?? user.displayName ?? '',
        }));
      } else {
        dispatch(logoutAction());
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [dispatch]);
};