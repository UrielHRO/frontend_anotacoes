import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { showSuccess, showError } from '../utils/toast';


export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'O email é obrigatório.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Digite um email válido.';
    }
    if (!password) {
      newErrors.password = 'A senha é obrigatória.';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      showSuccess('Login bem-sucedido!');
      navigate('/');
    } else {
      showError(result.message || 'Erro desconhecido.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <form onSubmit={handleSubmit} noValidate>
          <h2>Login</h2>
          <div className="form-group">
            <input
              id="email"
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
              required
            />
            <label htmlFor="email">Email</label>
            {/* Mensagem de erro abaixo do campo */}
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          <div className="form-group">
            <input
              id="password"
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'input-error' : ''}
              autoComplete="current-password"
              required
            />
            <label htmlFor="password">Senha</label>
            {/* Mensagem de erro abaixo do campo */}
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
          <div className="auth-link">
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </div>
        </form>
      </div>
    </div>
  );
};