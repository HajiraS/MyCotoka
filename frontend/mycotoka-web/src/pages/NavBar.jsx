import { Link, useLocation } from 'react-router-dom';
import { Button, Avatar } from '@fluentui/react-components';
import { SignOutRegular, BoxFilled } from '@fluentui/react-icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/devices', label: 'Devices' },
  { to: '/clients', label: 'Clients' },
  { to: '/subscriptions', label: 'Subscriptions' },
];

export default function NavBar() {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = isAdmin ? [...LINKS, { to: '/users', label: 'Users' }] : LINKS;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 32px',
        borderBottom: '1px solid #edebe9',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: '#0f6cbd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BoxFilled style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>MyCotoka</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#0f6cbd' : '#424242',
                  backgroundColor: isActive ? '#e8f1fc' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Avatar name={isAdmin ? 'Admin' : 'User'} size={28} />
        <Button
          size="small"
          appearance="subtle"
          icon={<SignOutRegular />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
