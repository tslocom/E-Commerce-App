import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthPanel from './AuthPanel.jsx';
import { loginUser, registerUser } from '../services/authService';

jest.mock('../services/authService', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

describe('AuthPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('switches to register mode and submits the filled form', async () => {
    const user = userEvent.setup();
    registerUser.mockResolvedValue({ uid: 'user-1' });

    render(<AuthPanel />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /register/i }));
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^full name$/i), 'Alex Morgan');
    await user.type(screen.getByLabelText(/^email$/i), 'alex@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'secret123');
    await user.type(screen.getByLabelText(/^address$/i), '123 Market Street');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(registerUser).toHaveBeenCalledWith('alex@example.com', 'secret123', {
      displayName: 'Alex Morgan',
      address: '123 Market Street',
    });
    expect(loginUser).not.toHaveBeenCalled();
  });
});