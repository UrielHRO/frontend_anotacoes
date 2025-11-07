import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { showSuccess, showError } from '../utils/toast';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    if (!name) {
      newErrors.name = 'O nome é obrigatório.';
    } else if (name.length < 2) {
      newErrors.name = 'O nome deve ter pelo menos 2 caracteres.';
    }
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
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      showSuccess('Cadastro realizado! Faça o login.');
      navigate('/login');
    } else {
      showError(result.message || 'Erro desconhecido.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <form onSubmit={handleSubmit} noValidate>
          <h2>Cadastro</h2>
          <div className="form-group">
            <input
              id="name"
              type="text"
              placeholder=" "
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'input-error' : ''}
              autoComplete="name"
              required
            />
            <label htmlFor="name">Nome</label>
            {/* Mensagem de erro abaixo do campo */}
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
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
              autoComplete="new-password"
              required
            />
            <label htmlFor="password">Senha</label>
            {/* Mensagem de erro abaixo do campo */}
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Carregando...' : 'Cadastrar'}
          </button>
          <div className="auth-link">
            Já tem uma conta? <Link to="/login">Faça o login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};