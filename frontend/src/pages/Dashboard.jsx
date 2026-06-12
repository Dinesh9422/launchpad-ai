import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: 20 }}>
      <h2>Welcome, {user?.username}! 👋</h2>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>User Type:</strong> {user?.user_type}</p>
      <p><strong>Joined:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
      <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#cc3b3b', color: '#fff', border: 'none', borderRadius: 5 }}>
        Logout
      </button>
    </div>
  );
}