import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', user_type: 'fresher'
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Try a different username/email.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 20, border: '1px solid #ddd', borderRadius: 10 }}>
      <h2>Create Account — LaunchPad AI</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} required
          style={{ width: '100%', padding: 10, marginBottom: 10 }} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required
          style={{ width: '100%', padding: 10, marginBottom: 10 }} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required
          style={{ width: '100%', padding: 10, marginBottom: 10 }} />
        <select name="user_type" onChange={handleChange}
          style={{ width: '100%', padding: 10, marginBottom: 10 }}>
          <option value="fresher">Fresher</option>
          <option value="experienced">Experienced</option>
          <option value="switcher">Non-IT to IT Switcher</option>
        </select>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5 }}>
          Register
        </button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}