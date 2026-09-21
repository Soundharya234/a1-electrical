import React from 'react';

export default function StatusBadge({ status, size = 'md', showDot = false }) {
  const getStatusConfig = (s) => {
    const statusKey = (s || '').toLowerCase().replace(' ', '_');
    
    if (['available', 'operational', 'fresh', 'delivered', 'success'].includes(statusKey)) {
      return { bg: '#DCFCE7', color: '#16A34A', dot: '#22C55E' };
    }
    if (['claimed', 'good'].includes(statusKey)) {
      return { bg: '#DBEAFE', color: '#2563EB', dot: '#3B82F6' };
    }
    if (['in_transit', 'fair', 'warning'].includes(statusKey)) {
      return { bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B' };
    }
    if (['expired', 'spoiled', 'danger', 'failed'].includes(statusKey)) {
      return { bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444' };
    }
    return { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' }; // pending/idle
  };

  const config = getStatusConfig(status);
  
  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '11px' },
    md: { padding: '4px 12px', fontSize: '12px' },
    lg: { padding: '6px 16px', fontSize: '14px' }
  };

  const formattedStatus = (status || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span 
      className={`status-badge status-${(status || '').toLowerCase().replace(' ', '-')}`}
      style={{
        ...sizeStyles[size],
        background: config.bg,
        color: config.color,
        borderRadius: '9999px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap'
      }}
    >
      {showDot && (
        <span style={{
          width: size === 'sm' ? '6px' : '8px',
          height: size === 'sm' ? '6px' : '8px',
          borderRadius: '50%',
          backgroundColor: config.dot,
          animation: 'pulse 2s infinite'
        }} />
      )}
      {formattedStatus}
      
      {showDot && (
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 ${config.dot}80; }
            70% { transform: scale(1); box-shadow: 0 0 0 4px #00000000; }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 #00000000; }
          }
        `}} />
      )}
    </span>
  );
}
