import React, { useState } from 'react';
import { Users, PlusCircle, Edit2, Trash2, X } from 'lucide-react';
import { Grupo } from '../types';
import Modal from './Modal';

interface GruposPanelProps {
  grupos: Grupo[];
  onAddGrupo: (grupo: Omit<Grupo, 'id'>) => void;
  onEditGrupo: (grupo: Grupo) => void;
  onDeleteGrupo: (id: number) => void;
}

const GruposPanel: React.FC<GruposPanelProps> = ({ grupos, onAddGrupo, onEditGrupo, onDeleteGrupo }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentGrupo, setCurrentGrupo] = useState<Grupo | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Omit<Grupo, 'id'>>({ 
    nombre: '', 
    materia: '', 
    estudiantes: 0 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estudiantes' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddClick = () => {
    setFormData({ nombre: '', materia: '', estudiantes: 0 });
    setShowAddModal(true);
  };

  const handleEditClick = (grupo: Grupo) => {
    setCurrentGrupo(grupo);
    setFormData({
      nombre: grupo.nombre,
      materia: grupo.materia,
      estudiantes: grupo.estudiantes
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGrupo(formData);
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentGrupo) {
      onEditGrupo({ ...currentGrupo, ...formData });
      setShowEditModal(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteId !== null) {
      onDeleteGrupo(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };
  return (
    <div className="modern-card">
      <div className="modern-card-header">
        <Users className="icon icon-purple" />
        <h3>Grupos y Materias</h3>
      </div>
      <div className="modern-card-actions">
        <button onClick={handleAddClick} className="modern-button-primary">
          <PlusCircle size={18} />
          Añadir Grupo
        </button>
      </div>
      <div className="modern-grid-cols-1 scrollable">
        {grupos.map(grupo => (
          <div key={grupo.id} className="list-item-group">
            <div className="item-header">
              <h3>{grupo.nombre}</h3>
              <div className="action-buttons">
                <button onClick={(e) => { e.stopPropagation(); handleEditClick(grupo); }} className="icon-button" title="Editar grupo">
                  <Edit2 size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(grupo.id); }} className="icon-button danger" title="Eliminar grupo">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p>{grupo.materia}</p>
            <p className="highlight-purple">{grupo.estudiantes} estudiantes</p>
          </div>
        ))}
      </div>

      {/* Add Grupo Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Añadir Nuevo Grupo"
      >
        <form onSubmit={handleSubmitAdd} className="modal-form">
          <div className="form-group">
            <label>Nombre del Grupo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              placeholder="Ej: Grupo 1"
            />
          </div>
          <div className="form-group">
            <label>Materia</label>
            <input
              type="text"
              name="materia"
              value={formData.materia}
              onChange={handleInputChange}
              required
              placeholder="Ej: Cálculo I"
            />
          </div>
          <div className="form-group">
            <label>Número de Estudiantes</label>
            <input
              type="number"
              name="estudiantes"
              min="1"
              value={formData.estudiantes}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="modern-button secondary" onClick={() => setShowAddModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="modern-button primary">
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Grupo Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Editar Grupo"
      >
        <form onSubmit={handleSubmitEdit} className="modal-form">
          <div className="form-group">
            <label>Nombre del Grupo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Materia</label>
            <input
              type="text"
              name="materia"
              value={formData.materia}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Número de Estudiantes</label>
            <input
              type="number"
              name="estudiantes"
              min="1"
              value={formData.estudiantes}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="modern-button secondary" onClick={() => setShowEditModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="modern-button primary">
              Guardar Cambios
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
          <p>¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer.</p>
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
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
      <div className="modern-card-footer">
        <p><strong>Total:</strong> {grupos.reduce((sum, g) => sum + g.estudiantes, 0)} estudiantes</p>
      </div>
    </div>
  );
};

export default GruposPanel;
