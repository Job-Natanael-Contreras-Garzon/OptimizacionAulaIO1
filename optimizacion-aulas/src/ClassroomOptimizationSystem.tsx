import React, { useState } from 'react';
import GLPK from 'glpk.js';
import { Calculator, Building, Clock, Users, Settings, Play, CheckCircle, PlusCircle, PlusSquare, X, Edit2, Trash2 } from 'lucide-react';
import './Modern.css';
import { Piso, Aula, Grupo, Horario, Asignacion, ResultadoOptimizacion } from './types';
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

  // Funciones para manejar los diálogos
  const handleOpenDialog = (tipo: 'piso' | 'aula' | 'grupo' | 'horario', itemToEdit: any | null = null) => {
    if (itemToEdit) {
      if (tipo === 'piso') setNewPiso(itemToEdit);
      else if (tipo === 'aula') setNewAula(itemToEdit);
      else if (tipo === 'grupo') setNewGrupo(itemToEdit);
      else if (tipo === 'horario') setNewHorario(itemToEdit);
    } else {
      // Resetear para creación
      if (tipo === 'piso') {
        const nextNumero = getNextPisoNumero();
        setNewPiso({ id: null, numero: nextNumero, nombre: `Piso ${nextNumero}` });
      } else if (tipo === 'aula') {
        setNewAula({ id: null, nombre: '', pisoId: pisos[0]?.id || 0, capacidad: 40 });
      } else if (tipo === 'grupo') {
        setNewGrupo({ id: null, nombre: '', materia: '', estudiantes: 30 });
      } else if (tipo === 'horario') {
        setNewHorario({ id: null, nombre: `Bloque ${horarios.length + 1}`, inicio: '07:00', fin: '09:15' });
      }
    }
    setDialogOpen(tipo);
  };

  const handleCloseDialog = () => {
    setDialogOpen(null);
  };

  // Manejar pisos
  const handleAddPiso = () => {
    if (!newPiso.nombre || !newPiso.numero) {
      alert('Por favor, complete todos los campos del piso.');
      return;
    }
    
    if (newPiso.id) {
      setPisos(prev => prev.map(p => p.id === newPiso.id ? { ...newPiso, id: newPiso.id! } : p));
    } else {
      setPisos(prev => [...prev, { ...newPiso, id: Date.now() }]);
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
  const handleAddAula = () => {
    if (!newAula.nombre || !newAula.pisoId || !newAula.capacidad) {
      alert('Por favor, complete todos los campos del aula.');
      return;
    }
    
    if (newAula.id) {
      setAulas(prev => prev.map(a => a.id === newAula.id ? { ...newAula, id: newAula.id! } : a));
    } else {
      setAulas(prev => [...prev, { ...newAula, id: Date.now() }]);
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
  };

  // Manejar grupos
  const handleAddGrupo = () => {
    if (!newGrupo.nombre || !newGrupo.materia || !newGrupo.estudiantes) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    
    if (newGrupo.id) {
      setGrupos(prev => prev.map(g => g.id === newGrupo.id ? { ...newGrupo, id: newGrupo.id! } : g));
    } else {
      setGrupos(prev => [...prev, { ...newGrupo, id: Date.now() }]);
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
  };

  // Manejar horarios
  const handleAddHorario = () => {
    if (!newHorario.nombre || !newHorario.inicio || !newHorario.fin) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    
    if (newHorario.id) {
      setHorarios(prev => prev.map(h => h.id === newHorario.id ? { ...newHorario, id: newHorario.id! } : h));
    } else {
      setHorarios(prev => [...prev, { ...newHorario, id: Date.now() }]);
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

  // Cargar dataset
  const handleLoadDataset = () => {
    setPisos(initialData.pisos);
    setAulas(initialData.aulas);
    setGrupos(initialData.grupos);
    setHorarios(initialData.horarios);
  };

  // Título del diálogo
  const getDialogTitle = () => {
    switch (dialogOpen) {
      case 'piso': return newPiso.id ? 'Editar Piso' : 'Agregar Piso';
      case 'aula': return newAula.id ? 'Editar Aula' : 'Agregar Aula';
      case 'grupo': return newGrupo.id ? 'Editar Grupo' : 'Agregar Grupo';
      case 'horario': return newHorario.id ? 'Editar Horario' : 'Agregar Horario';
      default: return '';
    }
  };

  // Submit del diálogo
  const handleDialogSubmit = () => {
    switch (dialogOpen) {
      case 'piso': handleAddPiso(); break;
      case 'aula': handleAddAula(); break;
      case 'grupo': handleAddGrupo(); break;
      case 'horario': handleAddHorario(); break;
    }
  };

  const isEditing = 
    (dialogOpen === 'piso' && !!newPiso.id) ||
    (dialogOpen === 'aula' && !!newAula.id) ||
    (dialogOpen === 'grupo' && !!newGrupo.id) ||
    (dialogOpen === 'horario' && !!newHorario.id);

  // Algoritmo de optimización (usando glpk.js)
  const optimizarAsignaciones = async (): Promise<void> => {
    setOptimizando(true);

    const glpk = await GLPK();


    const lp: any = {
      name: 'ClassroomOptimization',
      objective: {
        direction: glpk.GLP_MAX,
        name: 'obj',
        vars: []
      },
      subjectTo: [],
      binaries: []
    };

    const x_vars: { [key: string]: { grupo: Grupo, aula: Aula, horario: Horario } } = {};

    // Create variables and add to objective
    for (const grupo of grupos) {
      for (const aula of aulas) {
        // Constraint C: Only create x_ijt if capacity is sufficient
        if (aula.capacidad < grupo.estudiantes) {
          continue;
        }

        for (const horario of horarios) {
          const x_var_name = `x_${grupo.id}_${aula.id}_${horario.id}`;
          lp.binaries.push(x_var_name);
          lp.objective.vars.push({ name: x_var_name, coef: grupo.estudiantes });
          x_vars[x_var_name] = { grupo, aula, horario };

          const u_var_name = `u_${grupo.id}_${aula.id}_${horario.id}`;
          // U_ijt are continuous by default, no need to add to binaries/generals
          lp.objective.vars.push({ name: u_var_name, coef: -factorPenalizacion });
        }
      }
    }

    // Constraint A: Unique assignment per group (ΣΣ x_ijt = 1 ∀i)
    for (const grupo of grupos) {
      const constraint_vars = [];
      for (const aula of aulas) {
        if (aula.capacidad < grupo.estudiantes) continue;
        for (const horario of horarios) {
          constraint_vars.push({ name: `x_${grupo.id}_${aula.id}_${horario.id}`, coef: 1.0 });
        }
      }
      if (constraint_vars.length > 0) { // Only add constraint if there are possible assignments
        lp.subjectTo.push({
          name: `cons_group_${grupo.id}`,
          vars: constraint_vars,
          bnds: { type: glpk.GLP_FX, lb: 1.0, ub: 1.0 } // Fixed to 1
        });
      }
    }

    // Constraint B: One assignment per classroom-timeslot (Σ x_ijt ≤ 1 ∀j,t)
    for (const aula of aulas) {
      for (const horario of horarios) {
        const constraint_vars = [];
        for (const grupo of grupos) {
          if (aula.capacidad < grupo.estudiantes) continue;
          constraint_vars.push({ name: `x_${grupo.id}_${aula.id}_${horario.id}`, coef: 1.0 });
        }
        if (constraint_vars.length > 0) { // Only add constraint if there are possible assignments
          lp.subjectTo.push({
            name: `cons_aula_horario_${aula.id}_${horario.id}`,
            vars: constraint_vars,
            bnds: { type: glpk.GLP_UP, ub: 1.0 } // Upper bound 1
          });
        }
      }
    }

    // Constraint D: Underutilization penalty (U_ijt ≥ x_ijt × (C_j - S_i - δ))
    // U_ijt - x_ijt * (C_j - S_i - δ) ≥ 0
    for (const grupo of grupos) {
      for (const aula of aulas) {
        if (aula.capacidad < grupo.estudiantes) continue;
        for (const horario of horarios) {
          const x_var_name = `x_${grupo.id}_${aula.id}_${horario.id}`;
          const u_var_name = `u_${grupo.id}_${aula.id}_${horario.id}`;
          const umbralToleranciaValor = (umbralDelta / 100) * aula.capacidad;
          const coef_x = -(aula.capacidad - grupo.estudiantes - umbralToleranciaValor);

          lp.subjectTo.push({
            name: `cons_underutil_${grupo.id}_${aula.id}_${horario.id}`,
            vars: [
              { name: u_var_name, coef: 1.0 },
              { name: x_var_name, coef: coef_x }
            ],
            bnds: { type: glpk.GLP_LO, lb: 0.0 } // Lower bound 0
          });
        }
      }
    }

    let solvedAssignments: Asignacion[] = [];
    let totalObjectiveValue = 0;
    let totalStudentsAssigned = 0;
    let totalPenalization = 0;
    let totalUtilization = 0;
    let assignedCount = 0;

    try {
      const res = await glpk.solve(lp, { msglev: glpk.GLP_MSG_OFF, presol: true });

      if (res && res.result && (res.result.status === glpk.GLP_OPT || res.result.status === glpk.GLP_FEAS)) {
        totalObjectiveValue = res.result.z;
        for (const varName in res.result.vars) {
          if (varName.startsWith('x_') && res.result.vars[varName] > 0.99) { // Check for binary variable close to 1
            const { grupo, aula, horario } = x_vars[varName];
            const utilizacion = (grupo.estudiantes / aula.capacidad) * 100;
            const penalizacionVarName = `u_${grupo.id}_${aula.id}_${horario.id}`;
            const penalizacion = res.result.vars[penalizacionVarName] || 0;

            solvedAssignments.push({ grupo, aula, horario, utilizacion, penalizacion });

            totalStudentsAssigned += grupo.estudiantes;
            totalPenalization += penalizacion;
            totalUtilization += utilizacion;
            assignedCount++;
          }
        }
      }
    } catch (error) {
      console.error('Error en la optimización:', error);
      alert('Ocurrió un error durante la optimización. Revisa la consola para más detalles.');
    }

    const utilizacionPromedio = assignedCount > 0 ? totalUtilization / assignedCount : 0;

    setResultado({
      asignaciones: solvedAssignments,
      valorObjetivo: totalObjectiveValue,
      estudiantesAsignados: totalStudentsAssigned,
      penalizacionTotal: totalPenalization,
      utilizacionPromedio: utilizacionPromedio
    });

    setOptimizando(false);
  };

  return (
    <div className="container">
      <header>
        <h1><Calculator /> Optimizador de Asignación de Aulas</h1>
        <p>Una herramienta para la planificación y optimización de recursos académicos.</p>
      </header>

      <div className="main-content">
        <div className="config-panels">
          <AulasPanel 
            pisos={pisos}
            aulas={aulas}
            getAulasByPiso={getAulasByPiso}
            onAddPiso={() => handleOpenDialog('piso')}
            onEditPiso={(p: Piso) => handleOpenDialog('piso', p)}
            onDeletePiso={handleDeletePiso}
            onAddAula={() => handleOpenDialog('aula')}
            onEditAula={(a: Aula) => handleOpenDialog('aula', a)}
            onDeleteAula={handleDeleteAula}
          />
          <div className="modern-grid modern-grid-cols-2">
            <GruposPanel 
              grupos={grupos}
              onAddGrupo={() => handleOpenDialog('grupo')}
              onEditGrupo={(g: Grupo) => handleOpenDialog('grupo', g)}
              onDeleteGrupo={handleDeleteGrupo}
            />
            <HorariosPanel 
              horarios={horarios}
              onAddHorario={() => handleOpenDialog('horario')}
              onEditHorario={(h: Horario) => handleOpenDialog('horario', h)}
              onDeleteHorario={handleDeleteHorario}
            />
          </div>
        </div>
      </div>

      <div className="optimization-section">
        <div className="settings-card">
          <div className="card-header">
            <Settings size={24} />
            <h2>Parámetros de Optimización</h2>
          </div>
          <div className="card-body">
            <div className="param-grid">
              <div className="param-group">
                <label htmlFor="umbralDelta">Umbral de Subutilización</label>
                <div className="param-input-wrapper">
                  <input
                    id="umbralDelta"
                    type="number"
                    className="param-input"
                    min="0"
                    max="100"
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
            </div>
            
            <div className="param-actions">
              <button 
                onClick={handleLoadDataset} 
                className="modern-button modern-button-secondary-alt"
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
            </div>
          </div>
        </div>
      </div>

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
            
            <div className="assignments-grid">
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
                  {resultado.asignaciones.map(({ grupo, aula, horario, utilizacion, penalizacion }, index) => (
                    <tr key={index}>
                      <td>
                        <div className="assignment-detail">
                          <Users size={18} />
                          <div>
                            <strong>{grupo.nombre}</strong>
                            <small>{grupo.estudiantes} estudiantes</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="assignment-detail">
                          <Building size={18} />
                          <div>
                            <strong>{aula.nombre}</strong>
                            <small>Capacidad: {aula.capacidad}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="assignment-detail">
                          <Clock size={18} />
                          <div>
                            <strong>{horario.nombre}</strong>
                            <small>{horario.inicio} - {horario.fin}</small>
                          </div>
                        </div>
                      </td>
                      <td className="utilization-cell">
                        <div className="utilization-value">
                          <span>{utilizacion.toFixed(1)}%</span>
                          <small>de {aula.capacidad} ({grupo.estudiantes})</small>
                        </div>
                        <div className="utilization-bar">
                          <div 
                            className={`utilization-fill ${
                              utilizacion >= 70 ? 'utilization-high' : 
                              utilizacion >= 40 ? 'utilization-medium' : 'utilization-low'
                            }`} 
                            style={{ width: `${Math.min(100, utilizacion)}%` }}
                          />
                        </div>
                      </td>
                      <td className="penalty-cell">
                        {penalizacion > 0 ? (
                          <span style={{ color: '#ef4444' }}>{penalizacion.toFixed(2)}</span>
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

      {dialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>{getDialogTitle()}</h3>
              <button onClick={handleCloseDialog} className="close-button"><X /></button>
            </div>
            <div className="dialog-body">
              {dialogOpen === 'piso' && (
                <>
                  <div className="form-group"><label>Número</label><input type="number" value={newPiso.numero} onChange={e => setNewPiso({...newPiso, numero: parseInt(e.target.value)})} /></div>
                  <div className="form-group"><label>Nombre</label><input type="text" value={newPiso.nombre} onChange={e => setNewPiso({...newPiso, nombre: e.target.value})} /></div>
                </>
              )}
              {dialogOpen === 'aula' && (
                <>
                  <div className="form-group"><label>Nombre</label><input type="text" value={newAula.nombre} onChange={e => setNewAula({...newAula, nombre: e.target.value})} /></div>
                  <div className="form-group">
                    <label>Piso</label>
                    <select value={newAula.pisoId} onChange={e => setNewAula({...newAula, pisoId: parseInt(e.target.value)})}>
                      {pisos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Capacidad</label><input type="number" value={newAula.capacidad} onChange={e => setNewAula({...newAula, capacidad: parseInt(e.target.value)})} /></div>
                </>
              )}
              {dialogOpen === 'grupo' && (
                <>
                  <div className="form-group"><label>Nombre</label><input type="text" value={newGrupo.nombre} onChange={e => setNewGrupo({...newGrupo, nombre: e.target.value})} /></div>
                  <div className="form-group"><label>Materia</label><input type="text" value={newGrupo.materia} onChange={e => setNewGrupo({...newGrupo, materia: e.target.value})} /></div>
                  <div className="form-group"><label>Estudiantes</label><input type="number" value={newGrupo.estudiantes} onChange={e => setNewGrupo({...newGrupo, estudiantes: parseInt(e.target.value)})} /></div>
                </>
              )}
              {dialogOpen === 'horario' && (
                <>
                  <div className="form-group"><label>Nombre</label><input type="text" value={newHorario.nombre} onChange={e => setNewHorario({...newHorario, nombre: e.target.value})} /></div>
                  <div className="form-group"><label>Hora Inicio</label><input type="time" value={newHorario.inicio} onChange={e => setNewHorario({...newHorario, inicio: e.target.value})} /></div>
                  <div className="form-group"><label>Hora Fin</label><input type="time" value={newHorario.fin} onChange={e => setNewHorario({...newHorario, fin: e.target.value})} /></div>
                </>
              )}
            </div>
            <div className="dialog-footer">
              <button onClick={handleCloseDialog} className="button secondary-button">Cancelar</button>
              <button onClick={handleDialogSubmit} className="button primary-button">{isEditing ? 'Actualizar' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm!}
        onCancel={() => setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null })}
      />
    </div>
  );
};

export default ClassroomOptimizationSystem; 