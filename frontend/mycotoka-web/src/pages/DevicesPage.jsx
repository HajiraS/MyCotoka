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
import StatusBadge from '../components/StatusBadge';

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

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const { isAdmin } = useAuth();

  const loadDevices = () => {
    api.get('/devices').then((res) => setDevices(res.data)).catch(() => setError('Could not load devices.'));
  };

  useEffect(() => { loadDevices(); }, []);

  const openAddDialog = () => {
    setEditingId(null); setSerialNumber(''); setModel(''); setError(''); setOpen(true);
  };

  const openEditDialog = (d) => {
    setEditingId(d.id); setSerialNumber(d.serialNumber); setModel(d.model); setError(''); setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/devices/${editingId}`, { serialNumber, model });
      else await api.post('/devices', { serialNumber, model });
      setOpen(false);
      loadDevices();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save device.'));
    }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/devices/${id}`); loadDevices(); }
    catch (err) { setError(extractErrorMessage(err, 'Could not delete device.')); }
  };

  const filtered = devices.filter((d) =>
    d.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    d.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <NavBar />
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title3>Devices</Title3>
          {isAdmin && (
            <Dialog open={open} onOpenChange={(e, data) => setOpen(data.open)}>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="primary" icon={<AddRegular />} onClick={openAddDialog}>Add Device</Button>
              </DialogTrigger>
              <DialogSurface>
                <form onSubmit={handleSubmit}>
                  <DialogBody>
                    <DialogTitle>{editingId ? 'Edit Device' : 'Add Device'}</DialogTitle>
                    {error && <p style={{ color: '#d13438', fontSize: '13px' }}>{error}</p>}
                    <Field label="Serial Number" style={{ marginBottom: '12px' }}>
                      <Input value={serialNumber} onChange={(e, data) => setSerialNumber(data.value)} required />
                    </Field>
                    <Field label="Model">
                      <Input value={model} onChange={(e, data) => setModel(data.value)} required />
                    </Field>
                  </DialogBody>
                  <DialogActions>
                    <Button appearance="secondary" onClick={() => setOpen(false)} type="button">Cancel</Button>
                    <Button appearance="primary" type="submit">Add Device</Button>
                  </DialogActions>
                </form>
              </DialogSurface>
            </Dialog>
          )}
        </div>
        <Input
          contentBefore={<SearchRegular />}
          placeholder="Search by serial number or model..."
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
                <TableHeaderCell>Serial Number</TableHeaderCell>
                <TableHeaderCell>Model</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                {isAdmin && <TableHeaderCell>Actions</TableHeaderCell>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell>{d.serialNumber}</TableCell>
                  <TableCell>{d.model}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  {isAdmin && (
                    <TableCell style={{ display: 'flex', gap: '4px' }}>
                      <Button size="small" appearance="subtle" icon={<EditRegular />} onClick={() => openEditDialog(d)} />
                      <Button size="small" appearance="subtle" icon={<DeleteRegular />} onClick={() => handleDelete(d.id)} />
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
