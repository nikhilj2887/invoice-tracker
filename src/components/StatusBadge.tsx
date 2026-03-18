import React from 'react';

interface StatusBadgeProps {
  status: 'Paid' | 'Pending' | 'Overdue';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    Paid: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}
