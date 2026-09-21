import React, { useState } from 'react';
import { AlertTriangle, XCircle, Info, CheckCircle, X } from 'lucide-react';

export default function AlertBanner({ alerts = [] }) {
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const handleDismiss = (id) => {
    setDismissedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const activeAlerts = alerts.filter(alert => !dismissedIds.has(alert.id));

  if (activeAlerts.length === 0) return null;

  const getAlertConfig = (type) => {
    switch(type) {
      case 'warning': return { icon: AlertTriangle, bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' };
      case 'danger': return { icon: XCircle, bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' };
      case 'success': return { icon: CheckCircle, bg: '#DCFCE7', color: '#16A34A', border: '#BBF7D0' };
      case 'info':
      default: return { icon: Info, bg: '#DBEAFE', color: '#2563EB', border: '#BFDBFE' };
    }
  };

  return (
    <div className="alert-banner" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
      {activeAlerts.map(alert => {
        const config = getAlertConfig(alert.type);
        const Icon = config.icon;
        
        return (
          <div key={alert.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: config.bg,
            border: `1px solid ${config.border}`,
            borderRadius: '8px',
            padding: '12px 16px',
            position: 'relative'
          }}>
            <Icon size={20} style={{ color: config.color, flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>{alert.message}</p>
              {alert.timestamp && (
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                  {alert.timestamp}
                </span>
              )}
            </div>
            <button 
              onClick={() => handleDismiss(alert.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
