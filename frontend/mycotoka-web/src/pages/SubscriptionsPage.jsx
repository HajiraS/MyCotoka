import { useEffect, useState } from 'react';
import {
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  Button, Title3, Dialog, DialogTrigger, DialogSurface, DialogTitle,
  DialogBody, DialogActions, Input, Field, Dropdown, Option, Card
} from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import NavBar from './NavBar';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deviceId, setDeviceId] = useState('');
  const [clientId, setClientId] = useState('');
  const [planName, setPlanName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const { isAdmin } = useAuth();

  const loadAll = () => {
    api.get('/subscriptions').then((res) => setSubscriptions(res.data)).catch(() => setError('Could not load subscriptions.'));
    api.get('/devices').then((res) => setDevices(res.data));
    api.get('/clients').then((res) => setClients(res.data));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openAddDialog = () => {
    setEditingId(null);
    setDeviceId('');
    setClientId('');
    setPlanName('');
    setMonthlyPrice('');
    setOpen(true);
  };

  const openEditDialog = (sub) => {
    setEditingId(sub.id);
    setDeviceId(String(sub.deviceId));
    setClientId(String(sub.clientId));
    setPlanName(sub.planName);
    setMonthlyPrice(String(sub.monthlyPrice));
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        deviceId: Number(deviceId),
        clientId: Number(clientId),
        planName,
        monthlyPrice: Number(monthlyPrice),
      };
      if (editingId) {
        await api.put(`/subscriptions/${editingId}`, payload);
      } else {
        await api.post('/subscriptions', payload);
      }
      setOpen(false);
      loadAll();
    } catch (err) {
      setError('Could not save subscription. Check the fields and try again.');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/subscriptions/${id}/cancel`);
      loadAll();
    } catch (err) {
      setError('Could not cancel subscription.');
    }
  };

  const filteredSubscriptions = subscriptions.filter((s) =>
    (s.device?.serialNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.client?.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.planName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <NavBar />
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title3>Subscriptions</Title3>
          {isAdmin && (
            <Dialog open={open} onOpenChange={(e, data) => setOpen(data.open)}>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="primary" onClick={openAddDialog}>Add Subscription</Button>
              </DialogTrigger>
              <DialogSurface>
                <form onSubmit={handleSubmit}>
                  <DialogBody>
                    <DialogTitle>{editingId ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
                    <Field label="Device" style={{ marginBottom: '12px' }}>
                      <Dropdown
                        placeholder="Select a device"
                        disabled={!!editingId}
                        value={devices.find(d => d.id === Number(deviceId))?.serialNumber || ''}
                        onOptionSelect={(e, data) => setDeviceId(data.optionValue)}
                      >
                        {devices.map((d) => (
                          <Option key={d.id} value={String(d.id)}>
                            {d.serialNumber} ({d.model})
                          </Option>
                        ))}
                      </Dropdown>
                    </Field>
                    <Field label="Client" style={{ marginBottom: '12px' }}>
                      <Dropdown
                        placeholder="Select a client"
                        disabled={!!editingId}
                        value={clients.find(c => c.id === Number(clientId))?.companyName || ''}
                        onOptionSelect={(e, data) => setClientId(data.optionValue)}
                      >
                        {clients.map((c) => (
                          <Option key={c.id} value={String(c.id)}>
                            {c.companyName}
                          </Option>
                        ))}
                      </Dropdown>
                    </Field>
                    <Field label="Plan Name" style={{ marginBottom: '12px' }}>
                      <Input value={planName} onChange={(e, data) => setPlanName(data.value)} required />
                    </Field>
                    <Field label="Monthly Price">
                      <Input type="number" step="0.01" value={monthlyPrice} onChange={(e, data) => setMonthlyPrice(data.value)} required />
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
          placeholder="Search by device, client, or plan..."
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
                <TableHeaderCell>Device</TableHeaderCell>
                <TableHeaderCell>Client</TableHeaderCell>
                <TableHeaderCell>Plan</TableHeaderCell>
                <TableHeaderCell>Price</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                {isAdmin && <TableHeaderCell>Actions</TableHeaderCell>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.device?.serialNumber}</TableCell>
                  <TableCell>{s.client?.companyName}</TableCell>
                  <TableCell>{s.planName}</TableCell>
                  <TableCell>${s.monthlyPrice}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  {isAdmin && (
                    <TableCell style={{ display: 'flex', gap: '8px' }}>
                      <Button size="small" onClick={() => openEditDialog(s)}>Edit</Button>
                      {s.status === 'Active' && (
                        <Button size="small" onClick={() => handleCancel(s.id)}>Cancel</Button>
                      )}
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
