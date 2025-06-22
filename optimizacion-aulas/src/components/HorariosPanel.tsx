import React, { useState, memo } from 'react';
import { Clock, PlusCircle, Edit2, Trash2, CalendarClock } from 'lucide-react';
import { Horario } from '../types';
import { FormModal, FormField } from './FormModal';
import DataCard from './DataCard';
import ConfirmDialog from './ConfirmDialog';

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
          <DataCard
            key={horario.id}
            title={horario.nombre}
            subtitle={
              <div className="flex items-center gap-2">
                <span className="time-badge">
                  <CalendarClock size={12} />
                  {horario.inicio} - {horario.fin}
                </span>
              </div>
            }
            icon={Clock}
            iconColor="orange"
            actions={
              <>
                <button 
                  onClick={() => handleEditHorarioClick(horario)} 
                  className="icon-button" 
                  title="Editar horario"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteHorarioClick(horario.id)} 
                  className="icon-button danger" 
                  title="Eliminar horario"
                >
                  <Trash2 size={14} />
                </button>
              </>
            }
          />
        ))}
      </div>
      <div className="modern-card-footer">
        <p><strong>Total:</strong> {horarios.length} bloques diarios</p>
      </div>

      {/* Horario Form Modal */}
      <FormModal
        isOpen={showHorarioModal}
        onClose={() => setShowHorarioModal(false)}
        title={currentHorario ? 'Editar Bloque Horario' : 'Añadir Nuevo Bloque Horario'}
        subtitle={currentHorario ? 'Modifica la información del bloque horario' : 'Crea un nuevo bloque de tiempo para organizar clases'}
        onSubmit={handleHorarioSubmit}
        isEditing={!!currentHorario}
      >
        <FormField 
          label="Nombre del Bloque" 
          required 
          icon={<CalendarClock size={16} />}
          help="Nombre descriptivo del bloque horario (ej: Mañana Temprano, Tarde)"
        >
          <input
            type="text"
            name="nombre"
            value={horarioForm.nombre}
            onChange={handleInputChange}
            required
            placeholder="Ej: Mañana Temprano"
          />
        </FormField>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField 
            label="Hora de Inicio" 
            required
            icon={<Clock size={16} />}
            help="Hora de inicio del bloque"
          >
            <input
              type="time"
              name="inicio"
              value={horarioForm.inicio}
              onChange={handleInputChange}
              required
            />
          </FormField>
          
          <FormField 
            label="Hora de Fin" 
            required
            icon={<Clock size={16} />}
            help="Hora de finalización del bloque"
          >
            <input
              type="time"
              name="fin"
              value={horarioForm.fin}
              onChange={handleInputChange}
              required
            />
          </FormField>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Eliminación de Bloque Horario"
        message="¿Estás seguro de que deseas eliminar este bloque horario? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default memo(HorariosPanel);
