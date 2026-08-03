import { useEffect, useState } from 'react';
import {
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  Button, Title3, Dialog, DialogTrigger, DialogSurface, DialogTitle,
  DialogBody, DialogActions, Input, Field, Card
} from '@fluentui/react-components';
import { SearchRegular, EditRegular, DeleteRegular, AddRegular } from '@fluentui/react-icons';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import NavBar from './NavBar';

function extractErrorMessage(err, fallback) {
  const data = err.response?.data;
  if (!data) return fallback;
  if (data.message) return data.message;
  if (data.errors) {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey && data.errors[firstKey]?.[0]) return data.errors[firstKey][0];
  }
  return fallback;
}

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
    api.get('/clients').then((res) => setClients(res.data)).catch(() => setError('Could not load clients.'));
  };

  useEffect(() => { loadClients(); }, []);

  const openAddDialog = () => {
    setEditingId(null); setCompanyName(''); setContactEmail(''); setError(''); setOpen(true);
  };

  const openEditDialog = (c) => {
    setEditingId(c.id); setCompanyName(c.companyName); setContactEmail(c.contactEmail); setError(''); setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/clients/${editingId}`, { companyName, contactEmail });
      else await api.post('/clients', { companyName, contactEmail });
      setOpen(false);
      loadClients();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save client.'));
    }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/clients/${id}`); loadClients(); }
    catch (err) { setError(extractErrorMessage(err, 'Could not delete client.')); }
  };

  const filtered = clients.filter((c) =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <NavBar />
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title3>Clients</Title3>
          {isAdmin && (
            <Dialog open={open} onOpenChange={(e, data) => setOpen(data.open)}>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="primary" icon={<AddRegular />} onClick={openAddDialog}>Add Client</Button>
              </DialogTrigger>
              <DialogSurface>
                <form onSubmit={handleSubmit}>
                  <DialogBody>
                    <DialogTitle>{editingId ? 'Edit Client' : 'Add Client'}</DialogTitle>
                    {error && <p style={{ color: '#d13438', fontSize: '13px' }}>{error}</p>}
                    <Field label="Company Name" style={{ marginBottom: '12px' }}>
                      <Input value={companyName} onChange={(e, data) => setCompanyName(data.value)} required />
                    </Field>
                    <Field label="Contact Email">
                      <Input value={contactEmail} onChange={(e, data) => setContactEmail(data.value)} required />
                    </Field>
                  </DialogBody>
                  <DialogActions>
                    <Button appearance="secondary" onClick={() => setOpen(false)} type="button">Cancel</Button>
                    <Button appearance="primary" type="submit">{editingId ? 'Save' : 'Add Client'}</Button>
                  </DialogActions>
                </form>
              </DialogSurface>
            </Dialog>
          )}
        </div>
        <Input
          contentBefore={<SearchRegular />}
          placeholder="Search by company name or email..."
          value={search}
          onChange={(e, data) => setSearch(data.value)}
          style={{ marginBottom: '20px', width: '320px' }}
        />
        {error && !open && <p style={{ color: 'red' }}>{error}</p>}
        <Card style={{ padding: 0, overflow: 'hidden', borderRadius: '10px', border: '1px solid #edebe9' }}>
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
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.companyName}</TableCell>
                  <TableCell>{c.contactEmail}</TableCell>
                  {isAdmin && (
                    <TableCell style={{ display: 'flex', gap: '4px' }}>
                      <Button size="small" appearance="subtle" icon={<EditRegular />} onClick={() => openEditDialog(c)} />
                      <Button size="small" appearance="subtle" icon={<DeleteRegular />} onClick={() => handleDelete(c.id)} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
