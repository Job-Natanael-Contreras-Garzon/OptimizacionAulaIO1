import React, { useState, memo } from 'react';
import { Building, PlusSquare, PlusCircle, Edit2, Trash2, Users, MapPin } from 'lucide-react';
import { Piso, Aula } from '../types';
import { FormModal, FormField } from './FormModal';
import DataCard from './DataCard';
import ConfirmDialog from './ConfirmDialog';

interface AulasPanelProps {
  pisos: Piso[];
  aulas: Aula[];
  getAulasByPiso: (pisoId: number) => Aula[];
  onAddPiso: (piso: Omit<Piso, 'id'>) => void;
  onEditPiso: (piso: Piso) => void;
  onDeletePiso: (id: number) => void;
  onAddAula: (aula: Omit<Aula, 'id'>) => void;
  onEditAula: (aula: Aula) => void;
  onDeleteAula: (id: number) => void;
}

const AulasPanel: React.FC<AulasPanelProps> = ({ 
  pisos, 
  aulas, 
  getAulasByPiso,
  onAddPiso,
  onEditPiso,
  onDeletePiso,
  onAddAula,
  onEditAula,
  onDeleteAula 
}) => {
  // State for modals
  const [showPisoModal, setShowPisoModal] = useState(false);
  const [showAulaModal, setShowAulaModal] = useState(false);
  const [showDeletePisoModal, setShowDeletePisoModal] = useState(false);
  const [showDeleteAulaModal, setShowDeleteAulaModal] = useState(false);
  
  // Current item states
  const [currentPiso, setCurrentPiso] = useState<Piso | null>(null);
  const [currentAula, setCurrentAula] = useState<Aula | null>(null);
  const [deletePisoId, setDeletePisoId] = useState<number | null>(null);
  const [deleteAulaId, setDeleteAulaId] = useState<number | null>(null);
  
  // Form data states
  const [pisoForm, setPisoForm] = useState<Omit<Piso, 'id'>>({ 
    nombre: '',
    numero: 0
  });
  
  const [aulaForm, setAulaForm] = useState<Omit<Aula, 'id'>>({
    nombre: '',
    pisoId: pisos[0]?.id || 0,
    capacidad: 0
  });

  // Handlers for Piso
  const handleAddPisoClick = () => {
    setPisoForm({ nombre: `Piso ${pisos.length + 1}`, numero: pisos.length + 1 });
    setShowPisoModal(true);
  };

  const handleEditPisoClick = (piso: Piso) => {
    setCurrentPiso(piso);
    setPisoForm({ nombre: piso.nombre, numero: piso.numero });
    setShowPisoModal(true);
  };

  const handleDeletePisoClick = (id: number) => {
    setDeletePisoId(id);
    setShowDeletePisoModal(true);
  };

  const handlePisoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPiso) {
      onEditPiso({ ...currentPiso, ...pisoForm });
    } else {
      onAddPiso(pisoForm);
    }
    setShowPisoModal(false);
  };

  const handleDeletePisoConfirm = () => {
    if (deletePisoId !== null) {
      onDeletePiso(deletePisoId);
      setShowDeletePisoModal(false);
      setDeletePisoId(null);
    }
  };

  // Handlers for Aula
  const handleAddAulaClick = () => {
    if (pisos.length === 0) {
      alert('Primero debes crear al menos un piso');
      return;
    }
    setAulaForm({ 
      nombre: `Aula ${aulas.length + 1}`, 
      pisoId: pisos[0].id, 
      capacidad: 30 
    });
    setShowAulaModal(true);
  };

  const handleEditAulaClick = (aula: Aula) => {
    setCurrentAula(aula);
    setAulaForm({
      nombre: aula.nombre,
      pisoId: aula.pisoId,
      capacidad: aula.capacidad
    });
    setShowAulaModal(true);
  };

  const handleDeleteAulaClick = (id: number) => {
    setDeleteAulaId(id);
    setShowDeleteAulaModal(true);
  };

  const handleAulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAula) {
      onEditAula({ ...currentAula, ...aulaForm });
    } else {
      onAddAula(aulaForm);
    }
    setShowAulaModal(false);
  };

  const handleDeleteAulaConfirm = () => {
    if (deleteAulaId !== null) {
      onDeleteAula(deleteAulaId);
      setShowDeleteAulaModal(false);
      setDeleteAulaId(null);
    }
  };

  // Input change handlers
  const handlePisoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPisoForm(prev => ({
      ...prev,
      [name]: name === 'numero' ? parseInt(value) || 0 : value
    }));
  };

  const handleAulaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAulaForm(prev => ({
      ...prev,
      [name]: name === 'capacidad' || name === 'pisoId' ? parseInt(value) || 0 : value
    }));
  };
  return (
    <div className="modern-card">
      <div className="modern-card-header">
        <Building className="icon icon-blue" />
        <h3>Aulas Disponibles</h3>
      </div>
      <div className="modern-card-actions">
        <button onClick={handleAddPisoClick} className="modern-button-primary">
          <PlusSquare size={18} />
          Piso
        </button>
        <button onClick={handleAddAulaClick} className="modern-button-primary">
          <PlusCircle size={18} />
          Aula
        </button>
      </div>
      <div className="modern-grid-cols-1 scrollable">
        {pisos.map((piso) => {
          const aulasEnPiso = getAulasByPiso(piso.id);
          return (
            <DataCard
              key={piso.id}
              title={piso.nombre}
              subtitle={`Piso ${piso.numero} • ${aulasEnPiso.length} aulas`}
              icon={Building}
              iconColor="blue"
              actions={
                <>
                  <button
                    onClick={() => handleEditPisoClick(piso)}
                    className="icon-button"
                    title={`Editar ${piso.nombre}`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeletePisoClick(piso.id)}
                    className="icon-button danger"
                    title={`Eliminar ${piso.nombre}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              }
            >
              <div className="aulas-grid">
                {aulasEnPiso.length > 0 ? (
                  aulasEnPiso.map(aula => (
                    <DataCard
                      key={aula.id}
                      title={aula.nombre}
                      subtitle={
                        <div className="flex items-center gap-2">
                          <span className="capacity-badge">
                            <Users size={12} />
                            {aula.capacidad} espacios
                          </span>
                        </div>
                      }
                      icon={MapPin}
                      iconColor="green"
                      actions={
                        <>
                          <button
                            onClick={() => handleEditAulaClick(aula)}
                            className="icon-button"
                            title="Editar aula"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAulaClick(aula.id)}
                            className="icon-button danger"
                            title="Eliminar aula"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      }
                      className="aula-card"
                    />
                  ))
                ) : (
                  <p className="text-muted">No hay aulas en este piso</p>
                )}
              </div>
            </DataCard>
          );
        })}
      </div>
      <div className="modern-card-footer">
        <p>
          <strong>Total:</strong> {aulas.length} aulas
        </p>
      </div>

      {/* Piso Form Modal */}
      <FormModal
        isOpen={showPisoModal}
        onClose={() => setShowPisoModal(false)}
        title={currentPiso ? 'Editar Piso' : 'Añadir Nuevo Piso'}
        subtitle={currentPiso ? 'Modifica la información del piso' : 'Crea un nuevo piso en el edificio'}
        onSubmit={handlePisoSubmit}
        isEditing={!!currentPiso}
      >
        <FormField 
          label="Nombre del Piso" 
          required 
          icon={<Building size={16} />}
          help="Nombre descriptivo del piso (ej: Planta Baja, Primer Piso)"
        >
          <input
            type="text"
            name="nombre"
            value={pisoForm.nombre}
            onChange={handlePisoInputChange}
            required
            placeholder="Ej: Planta Baja"
          />
        </FormField>
        
        <FormField 
          label="Número de Piso" 
          required
          help="Número que identifica el piso (0 para planta baja)"
        >
          <input
            type="number"
            name="numero"
            min="0"
            value={pisoForm.numero}
            onChange={handlePisoInputChange}
            required
            placeholder="0"
          />
        </FormField>
      </FormModal>

      {/* Aula Form Modal */}
      <FormModal
        isOpen={showAulaModal}
        onClose={() => setShowAulaModal(false)}
        title={currentAula ? 'Editar Aula' : 'Añadir Nueva Aula'}
        subtitle={currentAula ? 'Modifica la información del aula' : 'Crea una nueva aula en el piso seleccionado'}
        onSubmit={handleAulaSubmit}
        isEditing={!!currentAula}
      >
        <FormField 
          label="Nombre del Aula" 
          required 
          icon={<MapPin size={16} />}
          help="Nombre o código que identifica el aula"
        >
          <input
            type="text"
            name="nombre"
            value={aulaForm.nombre}
            onChange={handleAulaInputChange}
            required
            placeholder="Ej: Aula 101"
          />
        </FormField>
        
        <FormField 
          label="Piso" 
          required
          icon={<Building size={16} />}
          help="Selecciona el piso donde se encuentra el aula"
        >
          <select
            name="pisoId"
            value={aulaForm.pisoId}
            onChange={handleAulaInputChange}
            required
          >
            {pisos.map(piso => (
              <option key={piso.id} value={piso.id}>
                {piso.nombre}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField 
          label="Capacidad" 
          required
          icon={<Users size={16} />}
          help="Número máximo de estudiantes que puede albergar el aula"
        >
          <input
            type="number"
            name="capacidad"
            min="1"
            value={aulaForm.capacidad}
            onChange={handleAulaInputChange}
            required
            placeholder="30"
          />
        </FormField>
      </FormModal>

      {/* Delete Piso Confirmation */}
      <ConfirmDialog
        isOpen={showDeletePisoModal}
        onCancel={() => setShowDeletePisoModal(false)}
        onConfirm={handleDeletePisoConfirm}
        title="Confirmar Eliminación de Piso"
        message="¿Estás seguro de que deseas eliminar este piso? Esta acción también eliminará todas las aulas en este piso y no se puede deshacer."
      />

      {/* Delete Aula Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteAulaModal}
        onCancel={() => setShowDeleteAulaModal(false)}
        onConfirm={handleDeleteAulaConfirm}
        title="Confirmar Eliminación de Aula"
        message="¿Estás seguro de que deseas eliminar esta aula? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default memo(AulasPanel);
