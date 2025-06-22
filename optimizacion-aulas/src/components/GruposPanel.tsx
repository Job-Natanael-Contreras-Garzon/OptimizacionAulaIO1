import React, { useState, memo } from 'react';
import { Users, PlusCircle, Edit2, Trash2, BookOpen, GraduationCap } from 'lucide-react';
import { Grupo } from '../types';
import { FormModal, FormField } from './FormModal';
import DataCard from './DataCard';
import ConfirmDialog from './ConfirmDialog';

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
          <DataCard
            key={grupo.id}
            title={grupo.nombre}
            subtitle={
              <div className="flex items-center gap-2">
                <span className="student-badge">
                  <GraduationCap size={12} />
                  {grupo.estudiantes} estudiantes
                </span>
              </div>
            }
            icon={BookOpen}
            iconColor="purple"
            actions={
              <>
                <button 
                  onClick={() => handleEditClick(grupo)} 
                  className="icon-button" 
                  title="Editar grupo"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteClick(grupo.id)} 
                  className="icon-button danger" 
                  title="Eliminar grupo"
                >
                  <Trash2 size={14} />
                </button>
              </>
            }
          >
            <div className="materia-info">
              <strong>Materia:</strong> {grupo.materia}
            </div>
          </DataCard>
        ))}
      </div>

      {/* Add Grupo Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Añadir Nuevo Grupo"
        subtitle="Crea un nuevo grupo académico con su materia y capacidad"
        onSubmit={handleSubmitAdd}
        isEditing={false}
      >
        <FormField 
          label="Nombre del Grupo" 
          required 
          icon={<Users size={16} />}
          help="Nombre identificativo del grupo (ej: Grupo A, Sección 1)"
        >
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
            placeholder="Ej: Grupo 1"
          />
        </FormField>
        
        <FormField 
          label="Materia" 
          required
          icon={<BookOpen size={16} />}
          help="Nombre de la asignatura o materia que imparte este grupo"
        >
          <input
            type="text"
            name="materia"
            value={formData.materia}
            onChange={handleInputChange}
            required
            placeholder="Ej: Cálculo I"
          />
        </FormField>
        
        <FormField 
          label="Número de Estudiantes" 
          required
          icon={<GraduationCap size={16} />}
          help="Cantidad de estudiantes que conforman el grupo"
        >
          <input
            type="number"
            name="estudiantes"
            min="1"
            value={formData.estudiantes}
            onChange={handleInputChange}
            required
            placeholder="25"
          />
        </FormField>
      </FormModal>

      {/* Edit Grupo Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Grupo"
        subtitle="Modifica la información del grupo académico"
        onSubmit={handleSubmitEdit}
        isEditing={true}
      >
        <FormField 
          label="Nombre del Grupo" 
          required 
          icon={<Users size={16} />}
          help="Nombre identificativo del grupo"
        >
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
          />
        </FormField>
        
        <FormField 
          label="Materia" 
          required
          icon={<BookOpen size={16} />}
          help="Nombre de la asignatura o materia"
        >
          <input
            type="text"
            name="materia"
            value={formData.materia}
            onChange={handleInputChange}
            required
          />
        </FormField>
        
        <FormField 
          label="Número de Estudiantes" 
          required
          icon={<GraduationCap size={16} />}
          help="Cantidad de estudiantes en el grupo"
        >
          <input
            type="number"
            name="estudiantes"
            min="1"
            value={formData.estudiantes}
            onChange={handleInputChange}
            required
          />
        </FormField>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Eliminación de Grupo"
        message="¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer."
      />
      <div className="modern-card-footer">
        <p><strong>Total:</strong> {grupos.reduce((sum, g) => sum + g.estudiantes, 0)} estudiantes</p>
      </div>
    </div>
  );
};

export default memo(GruposPanel);
