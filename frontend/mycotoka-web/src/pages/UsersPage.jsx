import { useEffect, useState } from 'react';
import {
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  Button, Title3, Card, Dropdown, Option
} from '@fluentui/react-components';
import api from '../services/api';
import NavBar from './NavBar';

const ROLES = ['Admin', 'ClientAdmin', 'Technician'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const loadUsers = () => {
    api.get('/users')
      .then((res) => setUsers(res.data))
      .catch(() => setError('Could not load users. Admin access required.'));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      loadUsers();
    } catch (err) {
      setError('Could not update role.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err) {
      setError('Could not delete user.');
    }
  };

  return (
    <>
      <NavBar />
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Title3 style={{ marginBottom: '20px', display: 'block' }}>Users</Title3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Card style={{ padding: 0, overflow: 'hidden', borderRadius: '10px', border: '1px solid #edebe9' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Username</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Dropdown
                      value={u.role}
                      style={{ minWidth: '140px' }}
                      onOptionSelect={(e, data) => handleRoleChange(u.id, data.optionValue)}
                    >
                      {ROLES.map((r) => (
                        <Option key={r} value={r}>{r}</Option>
                      ))}
                    </Dropdown>
                  </TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleDelete(u.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
