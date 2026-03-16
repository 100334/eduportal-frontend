import React from 'react';

export default function StatCard({ icon, value, label, color = 'teal' }) {
  const colorClasses = {
    teal: 'text-teal',
    gold: 'text-gold',
    green: 'text-green',
    red: 'text-red',
    ink: 'text-ink',
  };

  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClasses[color]}`}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}