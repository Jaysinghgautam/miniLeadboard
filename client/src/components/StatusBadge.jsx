const STATUS_CLASS = {
  New: 'status-new',
  Contacted: 'status-contacted',
  Closed: 'status-closed',
};

export default function StatusBadge({ status, onChange, disabled }) {
  return (
    <select
      className={`status-select ${STATUS_CLASS[status] || ''}`}
      value={status}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Lead status"
    >
      <option value="New">New</option>
      <option value="Contacted">Contacted</option>
      <option value="Closed">Closed</option>
    </select>
  );
}
