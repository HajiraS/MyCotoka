import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Field, Card, Title3 } from '@fluentui/react-components';
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
      navigate('/devices');
    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '80px' }}>
      <Card style={{ padding: '32px', width: '320px' }}>
        <Title3 style={{ marginBottom: '16px' }}>MyCotoka Login</Title3>
        <form onSubmit={handleSubmit}>
          <Field label="Username" style={{ marginBottom: '12px' }}>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </Field>
          <Field label="Password" style={{ marginBottom: '12px' }}>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <Button appearance="primary" type="submit" style={{ width: '100%' }}>
            Log In
          </Button>
        </form>
      </Card>
    </div>
  );
}
