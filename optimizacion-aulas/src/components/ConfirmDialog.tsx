import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modern-dialog-overlay">
      <div className="modern-dialog">
        <div className="modern-dialog-header">
          <h3>{title}</h3>
          <button onClick={onCancel} className="modern-button-icon"><X size={20} /></button>
        </div>
        <div className="modern-dialog-content" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertTriangle className="icon icon-orange" size={48} />
          <p>{message}</p>
        </div>
        <div className="modern-dialog-footer">
          <button onClick={onConfirm} className="modern-button-primary danger">
            <Check size={16} /> Confirmar
          </button>
          <button onClick={onCancel} className="modern-button-secondary-alt">
            <X size={16} /> Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
