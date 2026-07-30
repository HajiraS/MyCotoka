import { useEffect, useState } from 'react';
import {
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  Button, Title3, Dialog, DialogTrigger, DialogSurface, DialogTitle,
  DialogBody, DialogActions, Input, Field, Card
} from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import NavBar from './NavBar';

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
    api.get('/devices')
      .then((res) => setDevices(res.data))
      .catch(() => setError('Could not load devices. Are you logged in?'));
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const openAddDialog = () => {
    setEditingId(null);
    setSerialNumber('');
    setModel('');
    setOpen(true);
  };

  const openEditDialog = (device) => {
    setEditingId(device.id);
    setSerialNumber(device.serialNumber);
    setModel(device.model);
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/devices/${editingId}`, { serialNumber, model });
      } else {
        await api.post('/devices', { serialNumber, model });
      }
      setOpen(false);
      loadDevices();
    } catch (err) {
      const apiMessage = err.response?.data?.message
        || err.response?.data?.errors?.[Object.keys(err.response?.data?.errors || {})[0]]?.[0]
        || 'Could not save device. Check the fields and try again.';
      setError(apiMessage);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/devices/${id}`);
      loadDevices();
    } catch (err) {
      setError('Could not delete device.');
    }
  };

  const filteredDevices = devices.filter((d) =>
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
                <Button appearance="primary" onClick={openAddDialog}>Add Device</Button>
              </DialogTrigger>
              <DialogSurface>
                <form onSubmit={handleSubmit}>
                  <DialogBody>
                    <DialogTitle>{editingId ? 'Edit Device' : 'Add Device'}</DialogTitle>
                    <Field label="Serial Number" style={{ marginBottom: '12px' }}>
                      <Input value={serialNumber} onChange={(e, data) => setSerialNumber(data.value)} required />
                    </Field>
                    <Field label="Model">
                      <Input value={model} onChange={(e, data) => setModel(data.value)} required />
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
          contentBefore={<SearchRegular />}
          placeholder="Search by serial number or model..."
          value={search}
          onChange={(e, data) => setSearch(data.value)}
          style={{ marginBottom: '20px', width: '320px' }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
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
              {filteredDevices.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell>{d.serialNumber}</TableCell>
                  <TableCell>{d.model}</TableCell>
                  <TableCell>{d.status}</TableCell>
                  {isAdmin && (
                    <TableCell style={{ display: 'flex', gap: '8px' }}>
                      <Button size="small" onClick={() => openEditDialog(d)}>Edit</Button>
                      <Button size="small" onClick={() => handleDelete(d.id)}>Delete</Button>
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
