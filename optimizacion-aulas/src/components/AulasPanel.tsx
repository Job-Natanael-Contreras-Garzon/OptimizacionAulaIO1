import React, { useState } from 'react';
import { Building, PlusSquare, PlusCircle, Edit2, Trash2, X } from 'lucide-react';
import { Piso, Aula } from '../types';
import Modal from './Modal';

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
            <div key={piso.id} className="list-item-group">
              <div className="flex justify-between items-center">
                <h4>{piso.nombre}</h4>
                <div className="action-buttons">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditPisoClick(piso); }}
                    className="icon-button"
                    title={`Editar ${piso.nombre}`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeletePisoClick(piso.id); }}
                    className="icon-button danger"
                    title={`Eliminar ${piso.nombre}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="tag-container">
                {aulasEnPiso.length > 0 ? (
                  aulasEnPiso.map(aula => (
                    <div key={aula.id} className="item-with-actions">
                      <span className="tag tag-green">
                        {aula.nombre} ({aula.capacidad})
                      </span>
                      <div className="action-buttons">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditAulaClick(aula); }}
                          className="icon-button"
                          title="Editar aula"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteAulaClick(aula.id); }}
                          className="icon-button danger"
                          title="Eliminar aula"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No hay aulas en este piso</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="modern-card-footer">
        <p>
          <strong>Total:</strong> {aulas.length} aulas
        </p>
      </div>

      {/* Piso Form Modal */}
      <Modal
        isOpen={showPisoModal}
        onClose={() => setShowPisoModal(false)}
        title={currentPiso ? 'Editar Piso' : 'Añadir Nuevo Piso'}
      >
        <form onSubmit={handlePisoSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre del Piso</label>
            <input
              type="text"
              name="nombre"
              value={pisoForm.nombre}
              onChange={handlePisoInputChange}
              required
              placeholder="Ej: Planta Baja"
            />
          </div>
          <div className="form-group">
            <label>Número de Piso</label>
            <input
              type="number"
              name="numero"
              min="0"
              value={pisoForm.numero}
              onChange={handlePisoInputChange}
              required
            />
          </div>
          <div className="modal-actions">
            <button 
              type="button" 
              className="modern-button secondary" 
              onClick={() => setShowPisoModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="modern-button primary">
              {currentPiso ? 'Guardar Cambios' : 'Añadir Piso'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Aula Form Modal */}
      <Modal
        isOpen={showAulaModal}
        onClose={() => setShowAulaModal(false)}
        title={currentAula ? 'Editar Aula' : 'Añadir Nueva Aula'}
      >
        <form onSubmit={handleAulaSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre del Aula</label>
            <input
              type="text"
              name="nombre"
              value={aulaForm.nombre}
              onChange={handleAulaInputChange}
              required
              placeholder="Ej: Aula 101"
            />
          </div>
          <div className="form-group">
            <label>Piso</label>
            <select
              name="pisoId"
              value={aulaForm.pisoId}
              onChange={handleAulaInputChange}
              className="modern-select"
              required
            >
              {pisos.map(piso => (
                <option key={piso.id} value={piso.id}>
                  {piso.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Capacidad</label>
            <input
              type="number"
              name="capacidad"
              min="1"
              value={aulaForm.capacidad}
              onChange={handleAulaInputChange}
              required
            />
          </div>
          <div className="modal-actions">
            <button 
              type="button" 
              className="modern-button secondary" 
              onClick={() => setShowAulaModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="modern-button primary">
              {currentAula ? 'Guardar Cambios' : 'Añadir Aula'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Piso Confirmation Modal */}
      <Modal
        isOpen={showDeletePisoModal}
        onClose={() => setShowDeletePisoModal(false)}
        title="Confirmar Eliminación"
      >
        <div className="delete-confirmation">
          <p>¿Estás seguro de que deseas eliminar este piso? Esta acción también eliminará todas las aulas en este piso y no se puede deshacer.</p>
          <div className="modal-actions">
            <button 
              type="button" 
              className="modern-button secondary" 
              onClick={() => setShowDeletePisoModal(false)}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="modern-button danger"
              onClick={handleDeletePisoConfirm}
            >
              Eliminar Piso
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Aula Confirmation Modal */}
      <Modal
        isOpen={showDeleteAulaModal}
        onClose={() => setShowDeleteAulaModal(false)}
        title="Confirmar Eliminación"
      >
        <div className="delete-confirmation">
          <p>¿Estás seguro de que deseas eliminar esta aula? Esta acción no se puede deshacer.</p>
          <div className="modal-actions">
            <button 
              type="button" 
              className="modern-button secondary" 
              onClick={() => setShowDeleteAulaModal(false)}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="modern-button danger"
              onClick={handleDeleteAulaConfirm}
            >
              Eliminar Aula
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AulasPanel;
