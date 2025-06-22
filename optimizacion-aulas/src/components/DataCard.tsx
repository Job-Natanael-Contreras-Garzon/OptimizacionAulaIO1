import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DataCardProps {
  title: string;
  subtitle?: string | React.ReactNode;
  icon: LucideIcon;
  iconColor?: 'blue' | 'purple' | 'orange' | 'green' | 'red';
  actions?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'blue',
  actions,
  children,
  onClick,
  className = ''
}) => {
  const iconClass = `data-card-icon icon-${iconColor}`;

  return (
    <div 
      className={`data-card ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="data-card-header">
        <div className="data-card-info">
          <Icon className={iconClass} size={20} />
          <div className="data-card-text">
            <h4 className="data-card-title">{title}</h4>
            {subtitle && <div className="data-card-subtitle">{subtitle}</div>}
          </div>
        </div>
        {actions && (
          <div className="data-card-actions" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
      {children && <div className="data-card-content">{children}</div>}
    </div>
  );
};

export default DataCard;
