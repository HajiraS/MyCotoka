import { Link } from 'react-router-dom';
import { Button } from '@fluentui/react-components';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/home">Home</Link>
        <Link to="/devices">Devices</Link>
        <Link to="/clients">Clients</Link>
        <Link to="/subscriptions">Subscriptions</Link>
        {isAdmin && <Link to="/users">Users</Link>}
      </div>
      <Button size="small" onClick={handleLogout}>Log Out</Button>
    </div>
  );
}
