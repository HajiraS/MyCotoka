import { useEffect, useState } from 'react';
import {
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  Button, Title3, Dialog, DialogTrigger, DialogSurface, DialogTitle,
  DialogBody, DialogActions, Input, Field
} from '@fluentui/react-components';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import NavBar from './NavBar';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const { isAdmin } = useAuth();

  const loadClients = () => {
    api.get('/clients')
      .then((res) => setClients(res.data))
      .catch(() => setError('Could not load clients.'));
  };

  useEffect(() => {
    loadClients();
  }, []);

  const openAddDialog = () => {
    setEditingId(null);
    setCompanyName('');
    setContactEmail('');
    setOpen(true);
  };

  const openEditDialog = (client) => {
    setEditingId(client.id);
    setCompanyName(client.companyName);
    setContactEmail(client.contactEmail);
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, { companyName, contactEmail });
      } else {
        await api.post('/clients', { companyName, contactEmail });
      }
      setOpen(false);
      loadClients();
    } catch (err) {
      setError('Could not save client. Check the fields and try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      loadClients();
    } catch (err) {
      setError('Could not delete client.');
    }
  };

  const filteredClients = clients.filter((c) =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <NavBar />
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title3>Clients</Title3>
          {isAdmin && (
            <Dialog open={open} onOpenChange={(e, data) => setOpen(data.open)}>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="primary" onClick={openAddDialog}>Add Client</Button>
              </DialogTrigger>
              <DialogSurface>
                <form onSubmit={handleSubmit}>
                  <DialogBody>
                    <DialogTitle>{editingId ? 'Edit Client' : 'Add Client'}</DialogTitle>
                    <Field label="Company Name" style={{ marginBottom: '12px' }}>
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                    </Field>
                    <Field label="Contact Email">
                      <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                    </Field>
                  </DialogBody>
                  <DialogActions>
                    <Button appearance="secondary" onClick={() => setOpen(false)} type="button">
                      Cancel
                    </Button>
                    <Button appearance="primary" type="submit">
                      Save
                    </Button>
                  </DialogActions>
                </form>
              </DialogSurface>
            </Dialog>
          )}
        </div>
        <Input
          placeholder="Search by company name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: '16px', width: '320px' }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>ID</TableHeaderCell>
              <TableHeaderCell>Company Name</TableHeaderCell>
              <TableHeaderCell>Contact Email</TableHeaderCell>
              {isAdmin && <TableHeaderCell>Actions</TableHeaderCell>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.companyName}</TableCell>
                <TableCell>{c.contactEmail}</TableCell>
                {isAdmin && (
                  <TableCell style={{ display: 'flex', gap: '8px' }}>
                    <Button size="small" onClick={() => openEditDialog(c)}>Edit</Button>
                    <Button size="small" onClick={() => handleDelete(c.id)}>Delete</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
