import React, { useState } from 'react';
import { Building, Clock, Users, Settings, Play, CheckCircle, PlusSquare, Trash2 } from 'lucide-react';
import './Modern.css';
import { Piso, Aula, Grupo, Horario, ResultadoOptimizacion } from './types';
import AulasPanel from './components/AulasPanel';
import GruposPanel from './components/GruposPanel';
import HorariosPanel from './components/HorariosPanel';
import usePersistentState from './hooks/usePersistentState';
import ConfirmDialog from './components/ConfirmDialog';

const initialData = {
  aulas: [
    { id: 1, pisoId: 1, capacidad: 45, nombre: "Aula 1-1" },
    { id: 2, pisoId: 1, capacidad: 45, nombre: "Aula 1-2" },
    { id: 3, pisoId: 1, capacidad: 45, nombre: "Aula 1-3" },
    { id: 4, pisoId: 1, capacidad: 45, nombre: "Aula 1-4" },
    { id: 5, pisoId: 1, capacidad: 60, nombre: "Aula 1-5" },
    { id: 6, pisoId: 1, capacidad: 60, nombre: "Aula 1-6" },
    { id: 7, pisoId: 1, capacidad: 30, nombre: "Aula 1-7" },
    { id: 8, pisoId: 1, capacidad: 30, nombre: "Aula 1-8" },
    { id: 9, pisoId: 2, capacidad: 45, nombre: "Aula 2-1" },
    { id: 10, pisoId: 2, capacidad: 45, nombre: "Aula 2-2" },
    { id: 11, pisoId: 2, capacidad: 45, nombre: "Aula 2-3" },
    { id: 12, pisoId: 2, capacidad: 45, nombre: "Aula 2-4" },
    { id: 13, pisoId: 2, capacidad: 60, nombre: "Aula 2-5" },
    { id: 14, pisoId: 2, capacidad: 60, nombre: "Aula 2-6" },
    { id: 15, pisoId: 2, capacidad: 30, nombre: "Aula 2-7" },
    { id: 16, pisoId: 2, capacidad: 30, nombre: "Aula 2-8" },
    { id: 17, pisoId: 3, capacidad: 60, nombre: "Aula 3-1" },
    { id: 18, pisoId: 3, capacidad: 60, nombre: "Aula 3-2" },
    { id: 19, pisoId: 3, capacidad: 60, nombre: "Aula 3-3" },
    { id: 20, pisoId: 3, capacidad: 60, nombre: "Aula 3-4" },
    { id: 21, pisoId: 3, capacidad: 40, nombre: "Aula 3-5" },
    { id: 22, pisoId: 3, capacidad: 40, nombre: "Aula 3-6" },
    { id: 23, pisoId: 4, capacidad: 60, nombre: "Aula 4-1" },
    { id: 24, pisoId: 4, capacidad: 60, nombre: "Aula 4-2" },
    { id: 25, pisoId: 4, capacidad: 60, nombre: "Aula 4-3" },
    { id: 26, pisoId: 4, capacidad: 60, nombre: "Aula 4-4" },
    { id: 27, pisoId: 4, capacidad: 40, nombre: "Aula 4-5" },
    { id: 28, pisoId: 4, capacidad: 40, nombre: "Aula 4-6" },
    { id: 29, pisoId: 5, capacidad: 120, nombre: "Aula 5-1" },
    { id: 30, pisoId: 5, capacidad: 120, nombre: "Aula 5-2" }
  ],
  grupos: [
    { id: 1, nombre: "Grupo 1", materia: "Cálculo I", estudiantes: 35 },
    { id: 2, nombre: "Grupo 2", materia: "Física I", estudiantes: 50 },
    { id: 3, nombre: "Grupo 3", materia: "Introducción a la Ingeniería", estudiantes: 120 },
    { id: 4, nombre: "Grupo 4", materia: "Redes I", estudiantes: 40 },
    { id: 5, nombre: "Grupo 5", materia: "Álgebra Lineal", estudiantes: 60 }
  ],
  horarios: [
    { id: 1, nombre: "Bloque 1", inicio: "07:00", fin: "09:15" },
    { id: 2, nombre: "Bloque 2", inicio: "09:15", fin: "11:30" },
    { id: 3, nombre: "Bloque 3", inicio: "11:30", fin: "13:45" },
    { id: 4, nombre: "Bloque 4", inicio: "14:00", fin: "16:15" },
    { id: 5, nombre: "Bloque 5", inicio: "16:15", fin: "18:30" },
    { id: 6, nombre: "Bloque 6", inicio: "18:30", fin: "20:45" }
  ],
  pisos: [
    { id: 1, numero: 1, nombre: 'Piso 1' },
    { id: 2, numero: 2, nombre: 'Piso 2' },
    { id: 3, numero: 3, nombre: 'Piso 3' },
    { id: 4, numero: 4, nombre: 'Piso 4' },
    { id: 5, numero: 5, nombre: 'Piso 5' },
  ]
};



const ClassroomOptimizationSystem: React.FC = () => {
  // Estado de los datos del problema
  const [pisos, setPisos] = usePersistentState<Piso[]>('pisos', []);
  const [aulas, setAulas] = usePersistentState<Aula[]>('aulas', []);
  const [grupos, setGrupos] = usePersistentState<Grupo[]>('grupos', []);
  const [horarios, setHorarios] = usePersistentState<Horario[]>('horarios', []);

  // Parámetros del modelo
  const [umbralDelta, setUmbralDelta] = useState<number>(20); // Porcentaje
  const [factorPenalizacion, setFactorPenalizacion] = useState<number>(10);
  
  // Estado de la optimización
  const [resultado, setResultado] = useState<ResultadoOptimizacion | null>(null);
  const [optimizando, setOptimizando] = useState<boolean>(false);

  // Estado para el diálogo de confirmación
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: (() => void) | null }>({ isOpen: false, title: '', message: '', onConfirm: null });
  
  // Estado para el diálogo de confirmación de reinicio
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Función para reiniciar todos los datos
  const reiniciarDatos = () => {
    setPisos([]);
    setAulas([]);
    setGrupos([]);
    setHorarios([]);
    setResultado(null);
    // Limpiar localStorage
    localStorage.removeItem('pisos');
    localStorage.removeItem('aulas');
    localStorage.removeItem('grupos');
    localStorage.removeItem('horarios');
    setShowResetConfirm(false);
  };

  // Estado para los diálogos
  const [dialogOpen, setDialogOpen] = useState<'piso' | 'aula' | 'grupo' | 'horario' | null>(null);
  
  // Estado para los formularios
  const [newPiso, setNewPiso] = useState<Omit<Piso, 'id'> & { id: number | null }>({ id: null, numero: 1, nombre: '' });
  const [newAula, setNewAula] = useState<Omit<Aula, 'id'> & { id: number | null }>({ id: null, nombre: '', pisoId: 1, capacidad: 40 });
  const [newGrupo, setNewGrupo] = useState<Omit<Grupo, 'id'> & { id: number | null }>({ id: null, nombre: '', materia: '', estudiantes: 30 });
  const [newHorario, setNewHorario] = useState<Omit<Horario, 'id'> & { id: number | null }>({
    id: null, 
    nombre: '', 
    inicio: '07:00', 
    fin: '09:15' 
  });

  // Obtener el número de piso más alto para sugerir el siguiente
  const getNextPisoNumero = (): number => {
    if (pisos.length === 0) return 1;
    return Math.max(...pisos.map(p => p.numero)) + 1;
  };
  // Obtener aulas filtradas por piso
  const getAulasByPiso = (pisoId: number): Aula[] => {
    return aulas.filter(aula => aula.pisoId === pisoId);
  };

  // Función para obtener el título del diálogo según el tipo y si está editando
  const getDialogTitle = (type: string, isEditing: boolean): string => {
    const titles: Record<string, string> = {
      piso: isEditing ? 'Editar Piso' : 'Nuevo Piso',
      aula: isEditing ? 'Editar Aula' : 'Nueva Aula',
      grupo: isEditing ? 'Editar Grupo' : 'Nuevo Grupo',
      horario: isEditing ? 'Editar Horario' : 'Nuevo Horario',
    };
    return titles[type] || '';
  };

  // Manejador para enviar el formulario del diálogo
  const handleDialogSubmit = (type: string) => {
    switch (type) {
      case 'piso':
        handleAddPiso();
        break;
      case 'aula':
        handleAddAula();
        break;
      case 'grupo':
        handleAddGrupo();
        break;
      case 'horario':
        handleAddHorario();
        break;
    }
    handleCloseDialog();
  };

  // Función para manejar la apertura de diálogos
  const handleOpenDialog = (type: 'piso' | 'aula' | 'grupo' | 'horario', item: any = null) => {
    if (item) {
      if (type === 'piso') setNewPiso(item);
      else if (type === 'aula') setNewAula(item);
      else if (type === 'grupo') setNewGrupo(item);
      else if (type === 'horario') setNewHorario(item);
    } else {
      // Resetear para creación
      if (type === 'piso') {
        const nextNumero = getNextPisoNumero();
        setNewPiso({ id: null, numero: nextNumero, nombre: `Piso ${nextNumero}` });
      } else if (type === 'aula') {
        setNewAula({ id: null, nombre: '', pisoId: pisos[0]?.id || 0, capacidad: 40 });
      } else if (type === 'grupo') {
        setNewGrupo({ id: null, nombre: '', materia: '', estudiantes: 30 });
      } else if (type === 'horario') {
        setNewHorario({ id: null, nombre: `Bloque ${horarios.length + 1}`, inicio: '07:00', fin: '09:15' });
      }
    }
    setDialogOpen(type);
  };

  const handleCloseDialog = () => {
    setDialogOpen(null);
  };

  // Manejar pisos
  const handleAddPiso = (pisoData?: Omit<Piso, 'id'>) => {
    const pisoToAdd = pisoData || {
      nombre: newPiso.nombre,
      numero: newPiso.numero
    };
    
    if (!pisoToAdd.nombre || !pisoToAdd.numero) {
      alert('Por favor, complete todos los campos del piso.');
      return;
    }
    
    if (newPiso.id) {
      setPisos(prev => prev.map(p => p.id === newPiso.id ? { ...pisoToAdd, id: newPiso.id! } : p));
    } else {
      setPisos(prev => [...prev, { ...pisoToAdd, id: Date.now() }]);
    }
    handleCloseDialog();
  };
  
  const handleDeletePiso = (pisoId: number) => {
    setConfirmState({
      isOpen: true,
      title: 'Confirmar Eliminación de Piso',
      message: '¿Estás seguro? Todas las aulas asociadas también serán eliminadas permanentemente.',
      onConfirm: () => {
        const aulasAEliminar = aulas.filter(a => a.pisoId === pisoId).map(a => a.id);
        setAulas(prevAulas => prevAulas.filter(a => !aulasAEliminar.includes(a.id)));
        setPisos(prevPisos => prevPisos.filter(p => p.id !== pisoId));
        setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // Manejar aulas
  const handleAddAula = (aulaData?: Omit<Aula, 'id'>) => {
    const aulaToAdd = aulaData || {
      nombre: newAula.nombre,
      pisoId: newAula.pisoId,
      capacidad: newAula.capacidad
    };
    
    if (!aulaToAdd.nombre || !aulaToAdd.pisoId || !aulaToAdd.capacidad) {
      alert('Por favor, complete todos los campos del aula.');
      return;
    }
    
    if (newAula.id) {
      setAulas(prev => prev.map(a => a.id === newAula.id ? { ...aulaToAdd, id: newAula.id! } : a));
    } else {
      setAulas(prev => [...prev, { ...aulaToAdd, id: Date.now() }]);
    }
    handleCloseDialog();
  };

  const handleDeleteAula = (aulaId: number) => {
    setConfirmState({
      isOpen: true,
      title: 'Confirmar Eliminación de Aula',
      message: '¿Estás seguro de que quieres eliminar esta aula? Esta acción no se puede deshacer.',
      onConfirm: () => {
        setAulas(prevAulas => prevAulas.filter(a => a.id !== aulaId));
        setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };  // Manejar grupos
  const handleAddGrupo = (grupoData?: Omit<Grupo, 'id'>) => {
    const grupoToAdd = grupoData || {
      nombre: newGrupo.nombre,
      materia: newGrupo.materia,
      estudiantes: newGrupo.estudiantes
    };
    
    if (!grupoToAdd.nombre || !grupoToAdd.materia || !grupoToAdd.estudiantes) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    if (newGrupo.id) {
      setGrupos(prev => prev.map(g => g.id === newGrupo.id ? { ...grupoToAdd, id: newGrupo.id! } : g));
    } else {
      setGrupos(prev => [...prev, { ...grupoToAdd, id: Date.now() }]);
    }
    handleCloseDialog();
  };
  
  const handleDeleteGrupo = (grupoId: number) => {
    setConfirmState({
      isOpen: true,
      title: 'Confirmar Eliminación de Grupo',
      message: '¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.',
      onConfirm: () => {
        setGrupos(prevGrupos => prevGrupos.filter(g => g.id !== grupoId));
        setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };  // Manejar horarios
  const handleAddHorario = (horarioData?: Omit<Horario, 'id'>) => {
    const horarioToAdd = horarioData || {
      nombre: newHorario.nombre,
      inicio: newHorario.inicio,
      fin: newHorario.fin
    };
    
    if (!horarioToAdd.nombre || !horarioToAdd.inicio || !horarioToAdd.fin) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    if (newHorario.id) {
      setHorarios(prev => prev.map(h => h.id === newHorario.id ? { ...horarioToAdd, id: newHorario.id! } : h));
    } else {
      setHorarios(prev => [...prev, { ...horarioToAdd, id: Date.now() }]);
    }
    handleCloseDialog();
  };
  
  const handleDeleteHorario = (horarioId: number) => {
    setConfirmState({
      isOpen: true,
      title: 'Confirmar Eliminación de Horario',
      message: '¿Estás seguro de que quieres eliminar este bloque horario? Esta acción no se puede deshacer.',
      onConfirm: () => {
        setHorarios(prevHorarios => prevHorarios.filter(h => h.id !== horarioId));
        setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // Función para cargar el dataset inicial
  const handleLoadDataset = () => {
    setPisos(initialData.pisos);
    setAulas(initialData.aulas);
    setGrupos(initialData.grupos);
    setHorarios(initialData.horarios);
    setResultado(null);
  };

  // Función para optimizar las asignaciones (algoritmo greedy mejorado con optimización de rendimiento)
  const optimizarAsignaciones = async () => {
    setOptimizando(true);
    try {
      // Validar que tengamos datos suficientes
      if (grupos.length === 0 || aulas.length === 0 || horarios.length === 0) {
        alert('Necesitas tener al menos un grupo, un aula y un horario para optimizar.');
        setOptimizando(false);
        return;
      }

      // Agregar pequeño delay para permitir que la UI se actualice
      await new Promise(resolve => setTimeout(resolve, 50));

      const asignaciones: any[] = [];
      const aulasOcupadas: { [key: string]: boolean } = {};
      const gruposAsignados: { [key: number]: boolean } = {};
      
      // Pre-filtrar aulas válidas para cada grupo (optimización)
      const gruposConAulasValidas = grupos.map(grupo => ({
        grupo,
        aulasValidas: aulas.filter(aula => grupo.estudiantes <= aula.capacidad)
      })).filter(item => item.aulasValidas.length > 0);

      // Crear combinaciones válidas de forma más eficiente
      const combinacionesValidas: Array<{
        grupo: Grupo,
        aula: Aula,
        horario: Horario,
        piso: Piso,
        utilidad: number,
        utilizacion: number,
        penalizacion: number
      }> = [];

      for (const { grupo, aulasValidas } of gruposConAulasValidas) {
        for (const aula of aulasValidas) {
          const piso = pisos.find(p => p.id === aula.pisoId)!;
          const utilizacion = (grupo.estudiantes / aula.capacidad) * 100;
          const espaciosVacios = aula.capacidad - grupo.estudiantes;
          const espaciosPenalizados = Math.max(0, espaciosVacios - (umbralDelta / 100) * aula.capacidad);
          const penalizacion = (factorPenalizacion / 10) * espaciosPenalizados;
          const utilidad = grupo.estudiantes - penalizacion;

          for (const horario of horarios) {
            combinacionesValidas.push({
              grupo,
              aula,
              horario,
              piso,
              utilidad,
              utilizacion,
              penalizacion
            });
          }
        }
      }

      // Ordenar combinaciones por utilidad descendente
      combinacionesValidas.sort((a, b) => b.utilidad - a.utilidad);

      // Procesar asignaciones en chunks para no bloquear la UI
      const chunkSize = Math.min(100, combinacionesValidas.length);
      for (let i = 0; i < combinacionesValidas.length; i += chunkSize) {
        const chunk = combinacionesValidas.slice(i, i + chunkSize);
        
        for (const combinacion of chunk) {
          const aulaHorarioKey = `${combinacion.aula.id}_${combinacion.horario.id}`;
          
          if (!gruposAsignados[combinacion.grupo.id] && !aulasOcupadas[aulaHorarioKey]) {
            asignaciones.push({
              grupo: combinacion.grupo,
              aula: combinacion.aula,
              horario: combinacion.horario,
              utilizacion: combinacion.utilizacion,
              penalizacion: combinacion.penalizacion,
              grupoNombre: combinacion.grupo.nombre,
              aulaNombre: combinacion.aula.nombre,
              pisoNombre: combinacion.piso.nombre,
              horarioNombre: combinacion.horario.nombre,
              capacidadAula: combinacion.aula.capacidad,
              porcentajeOcupacion: combinacion.utilizacion
            });

            gruposAsignados[combinacion.grupo.id] = true;
            aulasOcupadas[aulaHorarioKey] = true;
          }
        }

        // Pequeño break entre chunks para permitir que otras tareas se ejecuten
        if (i + chunkSize < combinacionesValidas.length) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      // Calcular métricas
      const estudiantesAsignados = asignaciones.reduce((sum, asig) => sum + asig.grupo.estudiantes, 0);
      const penalizacionTotal = asignaciones.reduce((sum, asig) => sum + asig.penalizacion, 0);
      const utilizacionPromedio = asignaciones.length > 0 
        ? asignaciones.reduce((sum, asig) => sum + asig.utilizacion, 0) / asignaciones.length 
        : 0;
      const valorObjetivo = estudiantesAsignados - penalizacionTotal;

      const resultado: ResultadoOptimizacion = {
        valorObjetivo,
        estudiantesAsignados,
        penalizacionTotal,
        utilizacionPromedio,
        asignaciones
      };

      setResultado(resultado);

      // Mostrar mensaje si no todos los grupos fueron asignados
      const gruposNoAsignados = grupos.length - asignaciones.length;
      if (gruposNoAsignados > 0) {
        alert(`Optimización completada. ${gruposNoAsignados} grupo(s) no pudieron ser asignados debido a restricciones de capacidad o disponibilidad.`);
      }

    } catch (error) {
      console.error('Error durante la optimización:', error);
      alert('Error durante la optimización: ' + (error as Error).message);
    } finally {
      setOptimizando(false);
    }
  };

  return (
    <div className="container">
      <div className="parameters-card">
        <div className="card-header">
          <Settings size={24} />
          <h2>Parámetros de Optimización</h2>
        </div>
        <div className="card-body">
          <div className="param-group">
            <label htmlFor="umbralDelta">Umbral de Subutilización</label>
            <div className="param-input-wrapper">
              <input
                id="umbralDelta"
                type="number"
                className="param-input"
                min="0"
                max="100"
                step="1"
                value={umbralDelta}
                onChange={(e) => setUmbralDelta(Number(e.target.value))}
              />
              <span className="param-suffix">%</span>
            </div>
            <small className="text-muted">Considera un aula subutilizada cuando su ocupación está por debajo de este porcentaje.</small>
          </div>
          
          <div className="param-group">
            <label htmlFor="factorPenalizacion">Factor de Penalización</label>
            <div className="param-input-wrapper">
              <input
                id="factorPenalizacion"
                type="number"
                className="param-input"
                min="0"
                step="0.1"
                value={factorPenalizacion}
                onChange={(e) => setFactorPenalizacion(Number(e.target.value))}
              />
            </div>
            <small className="text-muted">Peso que se le da a la penalización por subutilización en el cálculo.</small>
          </div>
          
          <div className="param-actions">
            <button 
              onClick={handleLoadDataset} 
              className="modern-button modern-button-secondary-alt"
              disabled={optimizando}
            >
              <PlusSquare size={18} />
              Cargar Dataset
            </button>
            <button 
              onClick={optimizarAsignaciones} 
              className="modern-button modern-button-primary" 
              disabled={optimizando || aulas.length === 0 || grupos.length === 0 || horarios.length === 0}
            >
              {optimizando ? (
                <>
                  <span className="spinner small"></span>
                  Optimizando...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Ejecutar Optimización
                </>
              )}
            </button>
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="modern-button modern-button-danger"
              disabled={optimizando}
            >
              <Trash2 size={18} />
              Reiniciar Datos
            </button>
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación para reiniciar datos */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reiniciar todos los datos"
        message="¿Estás seguro de que deseas reiniciar todos los datos? Esta acción eliminará todas las aulas, grupos, horarios y resultados de optimización. Esta acción no se puede deshacer."
        onConfirm={reiniciarDatos}
        onCancel={() => setShowResetConfirm(false)}
      />

      {optimizando && <div className="spinner"></div>}

      {resultado && (
        <div className="results-card">
          <div className="card-header">
            <CheckCircle size={24} />
            <h2>Resultados de la Optimización</h2>
          </div>
          <div className="card-body">
            <div className="summary-metrics">
              <div className="metric-item">
                <strong>Valor Objetivo</strong>
                <div>
                  <span style={{ color: '#2563eb' }}>{resultado.valorObjetivo.toFixed(2)}</span>
                </div>
              </div>
              <div className="metric-item">
                <strong>Estudiantes Asignados</strong>
                <div>
                  <span style={{ color: '#10b981' }}>{resultado.estudiantesAsignados}</span>
                </div>
              </div>
              <div className="metric-item">
                <strong>Penalización Total</strong>
                <div>
                  <span style={{ color: resultado.penalizacionTotal > 0 ? '#ef4444' : '#10b981' }}>
                    {resultado.penalizacionTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="metric-item">
                <strong>Utilización Promedio</strong>
                <div>
                  <span style={{ 
                    color: resultado.utilizacionPromedio >= 70 ? '#10b981' : 
                           resultado.utilizacionPromedio >= 40 ? '#f59e0b' : '#ef4444' 
                  }}>
                    {resultado.utilizacionPromedio.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Tabla de Asignaciones */}
            <div className="assignments-grid">
              <h3>Asignaciones Detalladas</h3>
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Aula</th>
                    <th>Horario</th>
                    <th style={{ width: '200px' }}>Utilización</th>
                    <th>Penalización</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.asignaciones?.map((asignacion, index) => (
                    <tr key={index}>
                      <td>
                        <div className="assignment-detail">
                          <Users size={18} />
                          <div>
                            <strong>{asignacion.grupoNombre}</strong>
                            <small>{asignacion.grupo.estudiantes} estudiantes</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="assignment-detail">
                          <Building size={18} />
                          <div>
                            <strong>{asignacion.aulaNombre}</strong>
                            <small>Capacidad: {asignacion.capacidadAula}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="assignment-detail">
                          <Clock size={18} />
                          <div>
                            <strong>{asignacion.horarioNombre}</strong>
                            <small>{asignacion.horario.inicio} - {asignacion.horario.fin}</small>
                          </div>
                        </div>
                      </td>
                      <td className="utilization-cell">
                        <div className="utilization-value">
                          <span>{asignacion.porcentajeOcupacion.toFixed(1)}%</span>
                          <small>de {asignacion.capacidadAula} ({asignacion.grupo.estudiantes})</small>
                        </div>
                        <div className="utilization-bar">
                          <div 
                            className={`utilization-fill ${
                              asignacion.porcentajeOcupacion >= 70 ? 'utilization-high' : 
                              asignacion.porcentajeOcupacion >= 40 ? 'utilization-medium' : 'utilization-low'
                            }`} 
                            style={{ width: `${Math.min(100, asignacion.porcentajeOcupacion)}%` }}
                          />
                        </div>
                      </td>
                      <td className="penalty-cell">
                        {asignacion.penalizacion > 0 ? (
                          <span style={{ color: '#ef4444' }}>{asignacion.penalizacion.toFixed(2)}</span>
                        ) : (
                          <span style={{ color: '#10b981' }}>✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="grid-container">
        <div className="grid-col">
          <AulasPanel
            pisos={pisos}
            aulas={aulas}
            onAddPiso={handleAddPiso}
            onAddAula={handleAddAula}
            onEditPiso={(piso) => handleOpenDialog('piso', piso)}
            onEditAula={(aula) => handleOpenDialog('aula', aula)}
            onDeletePiso={handleDeletePiso}
            onDeleteAula={handleDeleteAula}
            getAulasByPiso={getAulasByPiso}
          />
        </div>
        <div className="grid-col">
          <GruposPanel
            grupos={grupos}
            onAddGrupo={handleAddGrupo}
            onEditGrupo={(grupo) => handleOpenDialog('grupo', grupo)}
            onDeleteGrupo={handleDeleteGrupo}
          />
        </div>
        <div className="grid-col">
          <HorariosPanel
            horarios={horarios}
            onAddHorario={handleAddHorario}
            onEditHorario={(horario) => handleOpenDialog('horario', horario)}
            onDeleteHorario={handleDeleteHorario}
          />
        </div>
      </div>

      {/* Diálogos */}
      {dialogOpen === 'piso' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{getDialogTitle('piso', newPiso.id !== null)}</h3>
            <div className="form-group">
              <label>Número de Piso</label>
              <input
                type="number"
                value={newPiso.numero}
                onChange={(e) => setNewPiso({...newPiso, numero: parseInt(e.target.value) || 1})}
              />
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newPiso.nombre}
                onChange={(e) => setNewPiso({...newPiso, nombre: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCloseDialog} className="modern-button secondary">
                Cancelar
              </button>
              <button 
                onClick={() => handleDialogSubmit('piso')} 
                className="modern-button primary"
              >
                {newPiso.id ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogOpen === 'aula' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{getDialogTitle('aula', newAula.id !== null)}</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newAula.nombre}
                onChange={(e) => setNewAula({...newAula, nombre: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Piso</label>
              <select
                value={newAula.pisoId}
                onChange={(e) => setNewAula({...newAula, pisoId: parseInt(e.target.value)})}
              >
                {pisos.map((piso) => (
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
                value={newAula.capacidad}
                onChange={(e) => setNewAula({...newAula, capacidad: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCloseDialog} className="modern-button secondary">
                Cancelar
              </button>
              <button 
                onClick={() => handleDialogSubmit('aula')} 
                className="modern-button primary"
              >
                {newAula.id ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogOpen === 'grupo' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{getDialogTitle('grupo', newGrupo.id !== null)}</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newGrupo.nombre}
                onChange={(e) => setNewGrupo({...newGrupo, nombre: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Materia</label>
              <input
                type="text"
                value={newGrupo.materia}
                onChange={(e) => setNewGrupo({...newGrupo, materia: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Número de Estudiantes</label>
              <input
                type="number"
                value={newGrupo.estudiantes}
                onChange={(e) => setNewGrupo({...newGrupo, estudiantes: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCloseDialog} className="modern-button secondary">
                Cancelar
              </button>
              <button 
                onClick={() => handleDialogSubmit('grupo')} 
                className="modern-button primary"
              >
                {newGrupo.id ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogOpen === 'horario' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{getDialogTitle('horario', newHorario.id !== null)}</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newHorario.nombre}
                onChange={(e) => setNewHorario({...newHorario, nombre: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Hora de Inicio</label>
              <input
                type="time"
                value={newHorario.inicio}
                onChange={(e) => setNewHorario({...newHorario, inicio: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Hora de Fin</label>
              <input
                type="time"
                value={newHorario.fin}
                onChange={(e) => setNewHorario({...newHorario, fin: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCloseDialog} className="modern-button secondary">
                Cancelar
              </button>
              <button 
                onClick={() => handleDialogSubmit('horario')} 
                className="modern-button primary"
              >
                {newHorario.id ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de reinicio */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Confirmar Reinicio de Datos"
        message="¿Estás seguro de que deseas reiniciar todos los datos? Esta acción eliminará toda la información de pisos, aulas, grupos y horarios, y no se puede deshacer."
        onConfirm={reiniciarDatos}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={() => {
          if (confirmState.onConfirm) confirmState.onConfirm();
          setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null });
        }}
        onCancel={() => setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null })}
      />
    </div>
  );
};

export default ClassroomOptimizationSystem; 