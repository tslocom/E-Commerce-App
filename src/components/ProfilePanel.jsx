import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAction } from '../services/store';
import {
  deleteUserAccount,
  ensureUserProfile,
  getUserProfile,
  updateUserProfile,
} from '../services/userService';

const defaultProfile = {
  displayName: '',
  address: '',
  phone: '',
};

function ProfilePanel() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(defaultProfile);

  const profileQuery = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: async () => {
      const profile = await getUserProfile(user.uid);
      return profile;
    },
    enabled: Boolean(user?.uid),
  });

  useEffect(() => {
    if (profileQuery.data) {
      setFormData({
        displayName: profileQuery.data.displayName ?? '',
        address: profileQuery.data.address ?? '',
        phone: profileQuery.data.phone ?? '',
      });
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    ensureUserProfile(user.uid, {
      email: user.email,
      displayName: user.displayName ?? '',
      address: '',
      phone: '',
    }).catch(() => undefined);
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (payload) => updateUserProfile(user.uid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user.uid] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUserAccount(user.uid),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['userProfile', user.uid] });
      dispatch(logoutAction());
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await updateMutation.mutateAsync(formData);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your account and profile data from Firestore?')) {
      return;
    }

    await deleteMutation.mutateAsync();
  };

  if (!user) {
    return null;
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">User management</p>
          <h2>Profile</h2>
        </div>
        <p className="panel-meta">Signed in as {user.email}</p>
      </div>

      {profileQuery.isLoading ? (
        <p className="muted-copy">Loading profile data...</p>
      ) : profileQuery.isError ? (
        <p className="notice error">Unable to load the Firestore profile.</p>
      ) : null}

      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input name="displayName" type="text" value={formData.displayName} onChange={handleChange} />
        </label>

        <label className="field">
          <span>Address</span>
          <textarea name="address" rows="3" value={formData.address} onChange={handleChange} />
        </label>

        <label className="field">
          <span>Phone</span>
          <input name="phone" type="tel" value={formData.phone} onChange={handleChange} />
        </label>

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Update profile'}
          </button>
          <button type="button" className="danger-button" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete account'}
          </button>
        </div>

        {(updateMutation.isError || deleteMutation.isError) && (
          <div className="notice error">
            {updateMutation.error?.message ?? deleteMutation.error?.message ?? 'Profile action failed.'}
          </div>
        )}
      </form>
    </section>
  );
}

export default ProfilePanel;
