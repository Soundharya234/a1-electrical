import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function KPICard({ title, value, unit, icon: IconComponent, trend, trendValue, color = '#3B82F6', subtitle }) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  
  return (
    <div className="kpi-card" style={{ 
      background: '#FFFFFF', 
      borderRadius: '12px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>{title}</span>
        {IconComponent && (
          <div style={{ 
            background: `${color}1A`, 
            color: color, 
            padding: '8px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IconComponent size={20} />
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#0F172A' }}>{value}</h3>
        {unit && <span style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>{unit}</span>}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2px', 
            color: isUp ? '#22C55E' : isDown ? '#EF4444' : '#64748B',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {isUp && <ArrowUpRight size={16} />}
            {isDown && <ArrowDownRight size={16} />}
            {trend === 'stable' && <Minus size={16} />}
            <span>{trendValue}</span>
          </div>
        )}
        {subtitle && (
          <span style={{ color: '#94A3B8', fontSize: '12px' }}>{subtitle}</span>
        )}
      </div>
    </div>
  );
}
