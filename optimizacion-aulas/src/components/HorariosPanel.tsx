import React, { useState } from 'react';
import { Clock, PlusCircle, Edit2, Trash2, X } from 'lucide-react';
import { Horario } from '../types';
import Modal from './Modal';

interface HorariosPanelProps {
  horarios: Horario[];
  onAddHorario: (horario: Omit<Horario, 'id'>) => void;
  onEditHorario: (horario: Horario) => void;
  onDeleteHorario: (id: number) => void;
}

const HorariosPanel: React.FC<HorariosPanelProps> = ({ horarios, onAddHorario, onEditHorario, onDeleteHorario }) => {
  // State for modals
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Current item states
  const [currentHorario, setCurrentHorario] = useState<Horario | null>(null);
  const [deleteHorarioId, setDeleteHorarioId] = useState<number | null>(null);
  
  // Form data state
  const [horarioForm, setHorarioForm] = useState<Omit<Horario, 'id'>>({
    nombre: '',
    inicio: '08:00',
    fin: '09:00'
  });

  // Handlers
  const handleAddHorarioClick = () => {
    setCurrentHorario(null);
    setHorarioForm({
      nombre: `Bloque ${horarios.length + 1}`,
      inicio: '08:00',
      fin: '09:00'
    });
    setShowHorarioModal(true);
  };

  const handleEditHorarioClick = (horario: Horario) => {
    setCurrentHorario(horario);
    setHorarioForm({
      nombre: horario.nombre,
      inicio: horario.inicio,
      fin: horario.fin
    });
    setShowHorarioModal(true);
  };

  const handleDeleteHorarioClick = (id: number) => {
    setDeleteHorarioId(id);
    setShowDeleteModal(true);
  };

  const handleHorarioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentHorario) {
      onEditHorario({ ...currentHorario, ...horarioForm });
    } else {
      onAddHorario(horarioForm);
    }
    setShowHorarioModal(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteHorarioId !== null) {
      onDeleteHorario(deleteHorarioId);
      setShowDeleteModal(false);
      setDeleteHorarioId(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHorarioForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  return (
    <div className="modern-card">
      <div className="modern-card-header">
        <Clock className="icon icon-orange" />
        <h3>Bloques Horarios</h3>
      </div>
      <div className="modern-card-actions">
        <button onClick={handleAddHorarioClick} className="modern-button-primary">
          <PlusCircle size={18} />
          Añadir Horario
        </button>
      </div>
      <div className="modern-grid-cols-1 scrollable">
        {horarios.map(horario => (
          <div key={horario.id} className="list-item-group">
            <div className="item-header">
              <h3>{horario.nombre}</h3>
              <div className="action-buttons">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditHorarioClick(horario); }} 
                  className="icon-button" 
                  title="Editar horario"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteHorarioClick(horario.id); }} 
                  className="icon-button danger" 
                  title="Eliminar horario"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p>{horario.inicio} - {horario.fin}</p>
          </div>
        ))}
      </div>
      <div className="modern-card-footer">
        <p><strong>Total:</strong> {horarios.length} bloques diarios</p>
      </div>

      {/* Horario Form Modal */}
      <Modal
        isOpen={showHorarioModal}
        onClose={() => setShowHorarioModal(false)}
        title={currentHorario ? 'Editar Bloque Horario' : 'Añadir Nuevo Bloque Horario'}
      >
        <form onSubmit={handleHorarioSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre del Bloque</label>
            <input
              type="text"
              name="nombre"
              value={horarioForm.nombre}
              onChange={handleInputChange}
              required
              placeholder="Ej: Mañana Temprano"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Hora de Inicio</label>
              <input
                type="time"
                name="inicio"
                value={horarioForm.inicio}
                onChange={handleInputChange}
                required
                className="time-input"
              />
            </div>
            <div className="form-group">
              <label>Hora de Fin</label>
              <input
                type="time"
                name="fin"
                value={horarioForm.fin}
                onChange={handleInputChange}
                required
                className="time-input"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button 
              type="button" 
              className="modern-button secondary" 
              onClick={() => setShowHorarioModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="modern-button primary">
              {currentHorario ? 'Guardar Cambios' : 'Añadir Horario'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
      >
        <div className="delete-confirmation">
          <p>¿Estás seguro de que deseas eliminar este bloque horario? Esta acción no se puede deshacer.</p>
          <div className="modal-actions">
            <button 
              type="button" 
              className="modern-button secondary" 
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="modern-button danger"
              onClick={handleDeleteConfirm}
            >
              Eliminar Bloque
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HorariosPanel;
