import { useEffect, useState } from 'react';
import { Card, Title1, Body1, Caption1, Title3 } from '@fluentui/react-components';
import {
  DesktopFilled, PeopleFilled, CheckmarkCircleFilled, BoxFilled
} from '@fluentui/react-icons';
import api from '../services/api';
import NavBar from './NavBar';

const STATUS_COLORS = {
  InStock: '#0f6cbd',
  Assigned: '#107c10',
  Maintenance: '#c19c00',
  Retired: '#8a8886',
};

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

  const statusCounts = devices.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});
  const statusList = ['InStock', 'Assigned', 'Maintenance', 'Retired']
    .map((status) => ({ status, count: statusCounts[status] || 0 }))
    .filter((s) => s.count > 0 || devices.length === 0);
  const maxStatusCount = Math.max(1, ...statusList.map((s) => s.count));

  const recentDevices = [...devices].sort((a, b) => b.id - a.id).slice(0, 5);

  const quickStats = [
    { label: 'Devices', value: devices.length, icon: <DesktopFilled style={{ fontSize: 20 }} />, color: '#0f6cbd' },
    { label: 'Clients', value: clients.length, icon: <PeopleFilled style={{ fontSize: 20 }} />, color: '#8764b8' },
    { label: 'Active Subscriptions', value: activeSubscriptions.length, icon: <CheckmarkCircleFilled style={{ fontSize: 20 }} />, color: '#107c10' },
  ];

  return (
    <>
      <NavBar />
      <div style={{ padding: '40px 48px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Title1 style={{ marginBottom: '4px', display: 'block' }}>Dashboard</Title1>
        <Body1 style={{ marginBottom: '32px', display: 'block', color: '#616161' }}>
          Your fleet, clients, and revenue at a glance
        </Body1>

        {/* Quick stat strip */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            marginBottom: '28px',
            border: '1px solid #edebe9',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          {quickStats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '20px 24px',
                borderRight: i < quickStats.length - 1 ? '1px solid #edebe9' : 'none',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: `${stat.color}1A`,
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 600, lineHeight: 1.2 }}>{stat.value}</div>
                <Caption1 style={{ color: '#616161' }}>{stat.label}</Caption1>
              </div>
            </div>
          ))}
        </div>

        {/* Main two-column panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>

          {/* MRR panel — the signature element */}
          <Card style={{ padding: '28px', borderRadius: '14px', border: '1px solid #edebe9', boxShadow: 'none' }}>
            <Caption1 style={{ color: '#616161', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Monthly Recurring Revenue
            </Caption1>
            <div style={{ fontSize: '44px', fontWeight: 700, lineHeight: 1.15, margin: '6px 0 4px' }}>
              ${mrr.toFixed(2)}
            </div>
            <Body1 style={{ color: '#616161', display: 'block', marginBottom: '20px' }}>
              from {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
            </Body1>
            {activeSubscriptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeSubscriptions.slice(0, 4).map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#242424' }}>
                      {s.client?.companyName} <span style={{ color: '#8a8886' }}>· {s.planName}</span>
                    </span>
                    <span style={{ fontWeight: 600 }}>${Number(s.monthlyPrice).toFixed(2)}/mo</span>
                  </div>
                ))}
              </div>
            ) : (
              <Body1 style={{ color: '#8a8886' }}>No active subscriptions yet — add one to see revenue here.</Body1>
            )}
          </Card>

          {/* Device fleet status breakdown */}
          <Card style={{ padding: '28px', borderRadius: '14px', border: '1px solid #edebe9', boxShadow: 'none' }}>
            <Caption1 style={{ color: '#616161', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px', display: 'block' }}>
              Fleet Status
            </Caption1>
            {devices.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {statusList.map(({ status, count }) => (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                      <span>{status}</span>
                      <span style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', backgroundColor: '#f3f2f1', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(count / maxStatusCount) * 100}%`,
                          backgroundColor: STATUS_COLORS[status] || '#8a8886',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Body1 style={{ color: '#8a8886' }}>No devices yet — add one to see fleet status here.</Body1>
            )}
          </Card>
        </div>

        {/* Recently added devices */}
        <Card style={{ padding: '28px', borderRadius: '14px', border: '1px solid #edebe9', boxShadow: 'none' }}>
          <Title3 style={{ marginBottom: '16px', display: 'block' }}>Recently Added Devices</Title3>
          {recentDevices.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentDevices.map((d, i) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 0',
                    borderTop: i > 0 ? '1px solid #f3f2f1' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#f3f2f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BoxFilled style={{ fontSize: 18, color: '#616161' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{d.serialNumber}</div>
                    <Caption1 style={{ color: '#616161' }}>{d.model}</Caption1>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: `${STATUS_COLORS[d.status] || '#8a8886'}1A`,
                      color: STATUS_COLORS[d.status] || '#8a8886',
                    }}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Body1 style={{ color: '#8a8886' }}>No devices yet.</Body1>
          )}
        </Card>
      </div>
    </>
  );
}
