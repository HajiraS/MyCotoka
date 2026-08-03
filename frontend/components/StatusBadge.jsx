const COLORS = {
  InStock: { bg: '#e8f1fc', text: '#0f6cbd' },
  Assigned: { bg: '#e6f4ea', text: '#107c10' },
  Maintenance: { bg: '#fdf3d8', text: '#a67c00' },
  Retired: { bg: '#f3f2f1', text: '#605e5c' },
  Active: { bg: '#e6f4ea', text: '#107c10' },
  Cancelled: { bg: '#f3f2f1', text: '#605e5c' },
};

export default function StatusBadge({ status }) {
  const c = COLORS[status] || { bg: '#f3f2f1', text: '#605e5c' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.text,
      }}
    >
      {status}
    </span>
  );
}
