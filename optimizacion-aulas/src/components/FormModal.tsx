import React from 'react';
import { X, Save, Plus, AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  help?: string;
  icon?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, children, required, error, help, icon }) => (
  <div className="enhanced-form-field">
    <label className="enhanced-form-label">
      {label}
      {required && <span className="required-indicator">*</span>}
    </label>
    <div className={`enhanced-form-input-wrapper ${icon ? 'form-field-with-icon' : ''}`}>
      {icon && <div className="form-field-icon">{icon}</div>}
      {children}
    </div>
    {help && <p className="form-help-text">{help}</p>}
    {error && (
      <p className="form-error-text">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitText?: string;
  isEditing?: boolean;
  isLoading?: boolean;
  className?: string;
}

const FormModal: React.FC<FormModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  onSubmit, 
  children, 
  submitText,
  isEditing = false,
  isLoading = false,
  className = '' 
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="enhanced-modal-overlay" onClick={onClose}>
      <div className={`enhanced-modal-content ${className}`} onClick={e => e.stopPropagation()}>
        <div className="enhanced-modal-header">
          <div className="modal-title-section">
            <div className="modal-icon">
              {isEditing ? <Save size={24} /> : <Plus size={24} />}
            </div>
            <div>
              <h2 className="modal-title">{title}</h2>
              {subtitle && <p className="modal-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="enhanced-close-button" 
            aria-label="Cerrar"
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="enhanced-modal-body">
          <form onSubmit={handleSubmit} className="enhanced-form">
            <div className="form-fields">
              {children}
            </div>
            
            <div className="enhanced-modal-actions">
              <button 
                type="button" 
                onClick={onClose} 
                className="enhanced-button secondary"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="enhanced-button primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    {isEditing ? <Save size={18} /> : <Plus size={18} />}
                    {submitText || (isEditing ? 'Actualizar' : 'Crear')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export { FormModal, FormField };
export default FormModal;
