import { useEffect, useState } from 'react';
import { Card, Title1, Title3, Body1, Caption1 } from '@fluentui/react-components';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DesktopFilled, PeopleFilled, CheckmarkCircleFilled } from '@fluentui/react-icons';
import api from '../services/api';
import NavBar from './NavBar';

const RUPEE = "\u20B9";

const STATUS_COLORS = {
  InStock: '#0f6cbd',
  Assigned: '#107c10',
  Maintenance: '#c19c00',
  Retired: '#8a8886',
};

const DONUT_COLORS = ['#e07856', '#e8b84b', '#2b6cb0', '#5aa06c', '#8764b8', '#c15f8f'];

function monthLabel(dateStr) {
  return new Date(dateStr).toLocaleString('default', { month: 'short' });
}

function StatIcon({ children }) {
  return (
    <div style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #edebe9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#424242', flexShrink: 0 }}>
      {children}
    </div>
  );
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
  const cancelledSubscriptions = subscriptions.filter((s) => s.status === 'Cancelled');
  const avgPrice = subscriptions.length > 0
    ? subscriptions.reduce((sum, s) => sum + Number(s.monthlyPrice || 0), 0) / subscriptions.length
    : 0;
  const idleDevices = devices.filter((d) => d.status === 'InStock' || d.status === 'Retired').length;

  const statusOrder = ['InStock', 'Assigned', 'Maintenance', 'Retired'];
  const statusCounts = devices.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});
  const totalDevices = devices.length || 1;
  const funnelSegments = statusOrder.map((status) => ({
    status,
    count: statusCounts[status] || 0,
    pct: (((statusCounts[status] || 0) / totalDevices) * 100),
  }));

  const mrrByClient = {};
  activeSubscriptions.forEach((s) => {
    const name = s.client?.companyName || 'Unknown';
    mrrByClient[name] = (mrrByClient[name] || 0) + Number(s.monthlyPrice || 0);
  });
  const donutData = Object.entries(mrrByClient).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

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

  const revenueByPlan = {};
  activeSubscriptions.forEach((s) => {
    revenueByPlan[s.planName] = (revenueByPlan[s.planName] || 0) + Number(s.monthlyPrice || 0);
  });
  const topPlans = Object.entries(revenueByPlan).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);

  const quickStats = [
    { label: 'Total Devices', value: devices.length, icon: <DesktopFilled style={{ fontSize: 18 }} /> },
    { label: 'Total Clients', value: clients.length, icon: <PeopleFilled style={{ fontSize: 18 }} /> },
    { label: 'Active Subscriptions', value: activeSubscriptions.length, icon: <CheckmarkCircleFilled style={{ fontSize: 18 }} /> },
  ];

  const panelStyle = { padding: '24px', borderRadius: '12px', border: '1px solid #edebe9', boxShadow: 'none' };
  const labelStyle = { color: '#616161', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '12px', fontWeight: 600 };

  return (
    <>
      <NavBar />
      <div style={{ padding: '32px 48px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Title1 style={{ marginBottom: '2px', display: 'block' }}>Dashboard</Title1>
        <Body1 style={{ marginBottom: '24px', display: 'block', color: '#616161' }}>Welcome back, Admin</Body1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {quickStats.map((stat) => (
            <Card key={stat.label} style={panelStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <StatIcon>{stat.icon}</StatIcon>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.2 }}>{stat.value.toLocaleString()}</div>
                  <Caption1 style={{ color: '#616161' }}>{stat.label}</Caption1>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <Card style={panelStyle}>
            <div style={labelStyle}>Fleet Status Panel</div>
            {devices.length > 0 ? (
              <>
                <div style={{ display: 'flex', height: '10px', borderRadius: '6px', overflow: 'hidden', margin: '16px 0 18px' }}>
                  {funnelSegments.filter(s => s.count > 0).map((seg) => (
                    <div key={seg.status} style={{ width: `${seg.pct}%`, backgroundColor: STATUS_COLORS[seg.status] }} />
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  {funnelSegments.map((seg) => (
                    <div key={seg.status} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: STATUS_COLORS[seg.status] }} />
                      {seg.status}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {funnelSegments.map((seg) => (
                    <div key={seg.status} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px', fontSize: '14px', alignItems: 'center' }}>
                      <span>{seg.status}</span>
                      <span style={{ fontWeight: 600 }}>{seg.count.toLocaleString()}</span>
                      <span style={{ color: '#616161', textAlign: 'right' }}>{seg.pct.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <Body1 style={{ color: '#8a8886', marginTop: '12px' }}>No devices yet.</Body1>}
          </Card>

          <Card style={panelStyle}>
            <div style={labelStyle}>Revenue by Client Panel</div>
            {donutData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
                <div style={{ width: '130px', height: '130px', position: 'relative', flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} dataKey="value" innerRadius={38} outerRadius={62} paddingAngle={2}>
                        {donutData.map((entry, i) => <Cell key={entry.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px' }}>
                    MRR
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', flex: 1, minWidth: 0 }}>
                  {donutData.slice(0, 6).map((entry, i) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                      <span style={{ fontWeight: 600 }}>{RUPEE}{entry.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <Body1 style={{ color: '#8a8886', marginTop: '12px' }}>No active subscriptions yet.</Body1>}
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <Card style={panelStyle}>
            <div style={labelStyle}>Subscription Activity</div>
            <div style={{ display: 'flex', gap: '12px', margin: '14px 0 18px' }}>
              <div style={{ flex: 1, backgroundColor: '#faf9f8', borderRadius: '8px', padding: '14px 18px' }}>
                <div style={{ fontSize: '26px', fontWeight: 700 }}>{subscriptions.length}</div>
                <Caption1 style={{ color: '#616161' }}>Total Started</Caption1>
              </div>
              <div style={{ flex: 1, backgroundColor: '#faf9f8', borderRadius: '8px', padding: '14px 18px' }}>
                <div style={{ fontSize: '26px', fontWeight: 700 }}>{cancelledSubscriptions.length}</div>
                <Caption1 style={{ color: '#616161' }}>Total Cancelled</Caption1>
              </div>
            </div>
            {trendData.length > 0 ? (
              <div style={{ height: '190px' }}>
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
            ) : <Body1 style={{ color: '#8a8886' }}>Not enough history yet to show a trend.</Body1>}
          </Card>

          <Card style={panelStyle}>
            <div style={labelStyle}>Top Plan by Revenue</div>
            <Caption1 style={{ color: '#8a8886', display: 'block', margin: '2px 0 14px' }}>Monthly Recurring Revenue (MRR)</Caption1>
            {topPlans.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {topPlans.map((plan, i) => (
                  <div key={plan.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderTop: i > 0 ? '1px solid #f3f2f1' : 'none' }}>
                    <span style={{ fontWeight: 700, color: '#8a8886', width: '16px' }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{plan.name}</div>
                      <Caption1 style={{ color: '#8a8886' }}>Top Subscription generated MRR</Caption1>
                    </div>
                    <span style={{ fontWeight: 700 }}>{RUPEE}{plan.value.toFixed(0)} MRR</span>
                  </div>
                ))}
              </div>
            ) : <Body1 style={{ color: '#8a8886' }}>No active subscriptions yet.</Body1>}
          </Card>
        </div>

        <Card style={panelStyle}>
          <Title3 style={{ marginBottom: '18px', display: 'block' }}>Other Data</Title3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 700 }}>{subscriptions.length}</div>
              <Caption1 style={{ color: '#616161' }}>Total Subscriptions</Caption1>
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 700 }}>{RUPEE}{avgPrice.toFixed(0)}</div>
              <Caption1 style={{ color: '#616161' }}>Avg. Plan Price</Caption1>
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 700 }}>{idleDevices}</div>
              <Caption1 style={{ color: '#616161' }}>Idle Device Count</Caption1>
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 700 }}>
                {subscriptions.length > 0 ? `${((cancelledSubscriptions.length / subscriptions.length) * 100).toFixed(0)}%` : '0%'}
              </div>
              <Caption1 style={{ color: '#616161' }}>Churn Rate</Caption1>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
