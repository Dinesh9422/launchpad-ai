import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 20, border: '1px solid #ddd', borderRadius: 10 }}>
      <h2>Login — LaunchPad AI</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} required
          style={{ width: '100%', padding: 10, marginBottom: 10 }} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required
          style={{ width: '100%', padding: 10, marginBottom: 10 }} />
        <button type="submit" style={{ width: '100%', padding: 10, background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5 }}>
          Login
        </button>
      </form>
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}