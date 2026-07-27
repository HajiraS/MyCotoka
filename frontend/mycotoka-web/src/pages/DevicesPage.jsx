import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, Button, Title3 } from '@fluentui/react-components';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/devices')
      .then((res) => setDevices(res.data))
      .catch(() => setError('Could not load devices. Are you logged in?'));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title3>Devices</Title3>
        <Button onClick={handleLogout}>Log Out</Button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>ID</TableHeaderCell>
            <TableHeaderCell>Serial Number</TableHeaderCell>
            <TableHeaderCell>Model</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.id}</TableCell>
              <TableCell>{d.serialNumber}</TableCell>
              <TableCell>{d.model}</TableCell>
              <TableCell>{d.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
