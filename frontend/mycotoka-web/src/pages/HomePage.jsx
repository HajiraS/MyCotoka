import { useEffect, useState } from 'react';
import { Card, Title1, Title3, Body1, Caption1 } from '@fluentui/react-components';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';
import NavBar from './NavBar';

const STATUS_COLORS = {
  InStock: '#0f6cbd',
  Assigned: '#107c10',
  Maintenance: '#c19c00',
  Retired: '#8a8886',
};

const DONUT_COLORS = ['#e07856', '#e8b84b', '#2b6cb0', '#5aa06c', '#8764b8', '#c15f8f'];

function monthLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('default', { month: 'short' });
}

export default function HomePage() {
  const [devices, setDevices] = useState([]);
  const [clients, setClients] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    api.get('/devices').then((res) => setDevices(res.data));
    api.get('/clients').then((res) => setClients(res.data));
    api.get('/subscriptions').then((res) => setSubscriptions(res.data));
  }, []);

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'Active');
  const mrr = activeSubscriptions.reduce((sum, s) => sum + Number(s.monthlyPrice || 0), 0);
  const avgPrice = subscriptions.length > 0
    ? subscriptions.reduce((sum, s) => sum + Number(s.monthlyPrice || 0), 0) / subscriptions.length
    : 0;
  const inactiveDevices = devices.filter((d) => d.status === 'InStock' || d.status === 'Retired').length;

  // Funnel: device status breakdown
  const statusOrder = ['InStock', 'Assigned', 'Maintenance', 'Retired'];
  const statusCounts = devices.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});
  const funnelSegments = statusOrder
    .map((status) => ({ status, count: statusCounts[status] || 0 }))
    .filter((s) => s.count > 0);
  const totalDevicesForFunnel = funnelSegments.reduce((sum, s) => sum + s.count, 0) || 1;

  // Donut: MRR by client
  const mrrByClient = {};
  activeSubscriptions.forEach((s) => {
    const name = s.client?.companyName || 'Unknown';
    mrrByClient[name] = (mrrByClient[name] || 0) + Number(s.monthlyPrice || 0);
  });
  const donutData = Object.entries(mrrByClient)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Line chart: subscriptions started vs cancelled per month
  const monthBuckets = {};
  subscriptions.forEach((s) => {
    if (s.startDate) {
      const m = monthLabel(s.startDate);
      monthBuckets[m] = monthBuckets[m] || { month: m, started: 0, cancelled: 0 };
      monthBuckets[m].started += 1;
    }
    if (s.endDate) {
      const m = monthLabel(s.endDate);
      monthBuckets[m] = monthBuckets[m] || { month: m, started: 0, cancelled: 0 };
      monthBuckets[m].cancelled += 1;
    }
  });
  const trendData = Object.values(monthBuckets);

  // Top plans by revenue
  const revenueByPlan = {};
  activeSubscriptions.forEach((s) => {
    revenueByPlan[s.planName] = (revenueByPlan[s.planName] || 0) + Number(s.monthlyPrice || 0);
  });
  const topPlans = Object.entries(revenueByPlan)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
  const totalPlanRevenue = topPlans.reduce((sum, p) => sum + p.value, 0) || 1;

  return (
    <>
      <NavBar />
      <div style={{ padding: '40px 48px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Title1 style={{ marginBottom: '4px', display: 'block' }}>Dashboard</Title1>
        <Body1 style={{ marginBottom: '28px', display: 'block', color: '#616161' }}>
          Fleet, clients, and revenue overview
        </Body1>

        {/* Top row: Funnel + Donut */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>

          {/* Device status funnel */}
          <Card style={{ padding: '28px', borderRadius: '14px', border: '1px solid #edebe9', boxShadow: 'none' }}>
            <Caption1 style={{ color: '#616161', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Fleet Status
            </Caption1>
            <div style={{ fontSize: '40px', fontWeight: 700, margin: '4px 0 4px' }}>
              {devices.length} <span style={{ fontSize: '16px', fontWeight: 400, color: '#616161' }}>total devices</span>
            </div>

            {devices.length > 0 && (
              <>
                <div style={{ display: 'flex', height: '10px', borderRadius: '6px', overflow: 'hidden', margin: '20px 0 20px' }}>
                  {funnelSegments.map((seg) => (
                    <div
                      key={seg.status}
                      style={{
                        width: `${(seg.count / totalDevicesForFunnel) * 100}%`,
                        backgroundColor: STATUS_COLORS[seg.status],
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {funnelSegments.map((seg) => (
                    <div key={seg.status} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: STATUS_COLORS[seg.status], flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{seg.status}</span>
                      <span style={{ fontWeight: 600 }}>{seg.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {devices.length === 0 && <Body1 style={{ color: '#8a8886' }}>No devices yet.</Body1>}
          </Card>

          {/* MRR by client donut */}
          <Card style={{ padding: '28px', borderRadius: '14px', border: '1px solid #edebe9', boxShadow: 'none' }}>
            <Caption1 style={{ color: '#616161', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Revenue by Client
            </Caption1>
            {donutData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <div style={{ width: '110px', height: '110px', flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} dataKey="value" innerRadius={32} outerRadius={52} paddingAngle={2}>
                        {donutData.map((entry, i) => (
                          <Cell key={entry.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {donutData.slice(0, 5).map((entry, i) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                      <span style={{ fontWeight: 600 }}>${entry.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Body1 style={{ color: '#8a8886', marginTop: '12px' }}>No active subscriptions yet.</Body1>
            )}
          </Card>
        </div>

        {/* Trend chart */}
        <Card style={{ padding: '28px', borderRadius: '14px', border: '1px solid #edebe9', boxShadow: 'none', marginBottom: '24px' }}>
          <Caption1 style={{ color: '#616161', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Subscription Activity
          </Caption1>
          <div style={{ display: 'flex', gap: '32px', margin: '4px 0 16px' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{subscriptions.length}</div>
              <Caption1 style={{ color: '#616161' }}>total started</Caption1>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{subscriptions.filter(s => s.status === 'Cancelled').length}</div>
              <Caption1 style={{ color: '#616161' }}>total cancelled</Caption1>
            </div>
          </div>
          {trendData.length > 0 ? (
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f2f1" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="started" stroke="#107c10" strokeWidth={2} name="Started" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="cancelled" stroke="#d13438" strokeWidth={2} name="Cancelled" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Body1 style={{ color: '#8a8886' }}>Not enough subscription history yet to show a trend.</Body1>
          )}
        </Card>

        {/* Bottom row: Top plans + Other data */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
          <Card style={{ padding: '28px', borderRadius: '14px', border: '1px solid #edebe9', boxShadow: 'none' }}>
            <Title3 style={{ marginBottom: '16px', display: 'block' }}>Top Plans by Revenue</Title3>
            {topPlans.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {topPlans.map((plan) => (
                  <div key={plan.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                      <span>{plan.name}</span>
                      <span style={{ fontWeight: 600 }}>${plan.value.toFixed(2)}/mo</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', backgroundColor: '#f3f2f1', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(plan.value / totalPlanRevenue) * 100}%`, backgroundColor: '#0f6cbd', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Body1 style={{ color: '#8a8886' }}>No active subscriptions yet.</Body1>
            )}
          </Card>

          <Card style={{ padding: '28px', borderRadius: '14px', border: '1px solid #edebe9', boxShadow: 'none' }}>
            <Title3 style={{ marginBottom: '16px', display: 'block' }}>Other Data</Title3>
            <div style={{ display: 'flex', gap: '32px' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{clients.length}</div>
                <Caption1 style={{ color: '#616161' }}>total clients</Caption1>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>${avgPrice.toFixed(0)}</div>
                <Caption1 style={{ color: '#616161' }}>avg. plan price</Caption1>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{inactiveDevices}</div>
                <Caption1 style={{ color: '#616161' }}>idle devices</Caption1>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
