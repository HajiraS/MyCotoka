import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Field, Card } from '@fluentui/react-components';
import { BoxFilled } from '@fluentui/react-icons';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/home');
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#faf9f8',
      }}
    >
      <Card style={{ padding: '40px', width: '360px', borderRadius: '14px', border: '1px solid #edebe9', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              backgroundColor: '#0f6cbd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BoxFilled style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>MyCotoka</span>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>Log in to MyCotoka</div>
        </div>
        <form onSubmit={handleSubmit}>
          <Field label="Username" style={{ marginBottom: '14px' }}>
            <Input value={username} onChange={(e, data) => setUsername(data.value)} />
          </Field>
          <Field label="Password" style={{ marginBottom: error ? '10px' : '20px' }}>
            <Input type="password" value={password} onChange={(e, data) => setPassword(data.value)} />
          </Field>
          {error && (
            <p style={{ color: '#d13438', fontSize: '13px', marginBottom: '14px' }}>{error}</p>
          )}
          <Button appearance="primary" type="submit" style={{ width: '100%', backgroundColor: '#0f6cbd' }}>
            Log In
          </Button>
        </form>
      </Card>
    </div>
  );
}
