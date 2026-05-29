import { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

const initialFormState = {
  email: '',
  password: '',
  displayName: '',
  address: '',
};

const formatAuthError = (error) => {
  if (!error?.code) {
    return error?.message ?? 'Unable to authenticate right now.';
  }

  if (error.code === 'auth/configuration-not-found') {
    return 'Firebase Authentication is not enabled for this project or the sign-in provider is disabled. Turn on Email/Password in the Firebase console and try again.';
  }

  if (error.code === 'auth/invalid-api-key') {
    return 'The Firebase config is not valid for this project. Check the API key and project settings in src/services/firebase.js.';
  }

  if (error.code === 'auth/operation-not-allowed') {
    return 'Email/password sign-in is disabled in Firebase Authentication. Enable it in the Firebase console.';
  }

  return error.message ?? 'Unable to authenticate right now.';
};

function AuthPanel() {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'register') {
        await registerUser(formData.email, formData.password, {
          displayName: formData.displayName,
          address: formData.address,
        });
      } else {
        await loginUser(formData.email, formData.password);
      }
      resetForm();
    } catch (error) {
      setErrorMessage(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel auth-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Firebase Authentication</p>
          <h2>{mode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
        </div>
        <div className="segmented-control" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === 'login' ? 'segment active' : 'segment'}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'segment active' : 'segment'}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <label className="field">
            <span>Full name</span>
            <input
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Alex Morgan"
            />
          </label>
        )}

        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="alex@example.com"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter a secure password"
            minLength={6}
            required
          />
        </label>

        {mode === 'register' && (
          <label className="field">
            <span>Address</span>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Shipping address"
              rows="3"
            />
          </label>
        )}

        {errorMessage && <div className="notice error">{errorMessage}</div>}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </section>
  );
}

export default AuthPanel;
