import React, { useState } from 'react';
import GLPK from 'glpk.js';
import { Calculator, Building, Clock, Users, Settings, Play, CheckCircle, PlusCircle, X } from 'lucide-react';
import './Modern.css';

// Tipos de datos
interface Aula {
  id: number;
  piso: number;
  capacidad: number;
  nombre: string;
}

interface Grupo {
  id: number;
  nombre: string;
  materia: string;
  estudiantes: number;
}

interface Horario {
  id: number;
  nombre: string;
  inicio: string;
  fin: string;
}

interface Asignacion {
  grupoId: number;
  aulaId: number;
  horarioId: number;
  utilizacion: number;
  penalizacion: number;
}

interface ResultadoOptimizacion {
  asignaciones: Asignacion[];
  objetivoTotal: number;
  estudiantesAsignados: number;
  penalizacionTotal: number;
  utilizacionPromedio: number;
}

const ClassroomOptimizationSystem: React.FC = () => {
  // Estado de los datos del problema
  const [aulas, setAulas] = useState<Aula[]>([ 
    // Primer piso
    { id: 1, piso: 1, capacidad: 45, nombre: "Aula 1-1" },
    { id: 2, piso: 1, capacidad: 45, nombre: "Aula 1-2" },
    { id: 3, piso: 1, capacidad: 45, nombre: "Aula 1-3" },
    { id: 4, piso: 1, capacidad: 45, nombre: "Aula 1-4" },
    { id: 5, piso: 1, capacidad: 60, nombre: "Aula 1-5" },
    { id: 6, piso: 1, capacidad: 60, nombre: "Aula 1-6" },
    { id: 7, piso: 1, capacidad: 30, nombre: "Aula 1-7" },
    { id: 8, piso: 1, capacidad: 30, nombre: "Aula 1-8" },
    // Segundo piso (misma distribución)
    { id: 9, piso: 2, capacidad: 45, nombre: "Aula 2-1" },
    { id: 10, piso: 2, capacidad: 45, nombre: "Aula 2-2" },
    { id: 11, piso: 2, capacidad: 45, nombre: "Aula 2-3" },
    { id: 12, piso: 2, capacidad: 45, nombre: "Aula 2-4" },
    { id: 13, piso: 2, capacidad: 60, nombre: "Aula 2-5" },
    { id: 14, piso: 2, capacidad: 60, nombre: "Aula 2-6" },
    { id: 15, piso: 2, capacidad: 30, nombre: "Aula 2-7" },
    { id: 16, piso: 2, capacidad: 30, nombre: "Aula 2-8" },
    // Tercer piso
    { id: 17, piso: 3, capacidad: 60, nombre: "Aula 3-1" },
    { id: 18, piso: 3, capacidad: 60, nombre: "Aula 3-2" },
    { id: 19, piso: 3, capacidad: 60, nombre: "Aula 3-3" },
    { id: 20, piso: 3, capacidad: 60, nombre: "Aula 3-4" },
    { id: 21, piso: 3, capacidad: 40, nombre: "Aula 3-5" },
    { id: 22, piso: 3, capacidad: 40, nombre: "Aula 3-6" },
    // Cuarto piso
    { id: 23, piso: 4, capacidad: 60, nombre: "Aula 4-1" },
    { id: 24, piso: 4, capacidad: 60, nombre: "Aula 4-2" },
    { id: 25, piso: 4, capacidad: 60, nombre: "Aula 4-3" },
    { id: 26, piso: 4, capacidad: 60, nombre: "Aula 4-4" },
    { id: 27, piso: 4, capacidad: 40, nombre: "Aula 4-5" },
    { id: 28, piso: 4, capacidad: 40, nombre: "Aula 4-6" },
    // Quinto piso
    { id: 29, piso: 5, capacidad: 120, nombre: "Aula 5-1" },
    { id: 30, piso: 5, capacidad: 120, nombre: "Aula 5-2" }
  ]);

  const [grupos, setGrupos] = useState<Grupo[]>([ 
    { id: 1, nombre: "Grupo 1", materia: "Cálculo I", estudiantes: 35 },
    { id: 2, nombre: "Grupo 2", materia: "Física I", estudiantes: 50 },
    { id: 3, nombre: "Grupo 3", materia: "Introducción a la Ingeniería", estudiantes: 120 },
    { id: 4, nombre: "Grupo 4", materia: "Redes I", estudiantes: 40 },
    { id: 5, nombre: "Grupo 5", materia: "Álgebra Lineal", estudiantes: 60 }
  ]);

  const [horarios, setHorarios] = useState<Horario[]>([ 
    { id: 1, nombre: "Bloque 1", inicio: "07:00", fin: "09:15" },
    { id: 2, nombre: "Bloque 2", inicio: "09:15", fin: "11:30" },
    { id: 3, nombre: "Bloque 3", inicio: "11:30", fin: "13:45" },
    { id: 4, nombre: "Bloque 4", inicio: "14:00", fin: "16:15" },
    { id: 5, nombre: "Bloque 5", inicio: "16:15", fin: "18:30" },
    { id: 6, nombre: "Bloque 6", inicio: "18:30", fin: "20:45" }
  ]);

  // Parámetros del modelo
  const [umbralDelta, setUmbralDelta] = useState<number>(20); // Porcentaje
  const [factorPenalizacion, setFactorPenalizacion] = useState<number>(10);
  
  // Estado de la optimización
  const [resultado, setResultado] = useState<ResultadoOptimizacion | null>(null);
  const [optimizando, setOptimizando] = useState<boolean>(false);

  // Estado para los diálogos
  const [dialogOpen, setDialogOpen] = useState<'aula' | 'grupo' | 'horario' | null>(null);
  const [newAula, setNewAula] = useState({ nombre: '', piso: 1, capacidad: 40 });
  const [newGrupo, setNewGrupo] = useState({ nombre: '', materia: '', estudiantes: 30 });
  const [newHorario, setNewHorario] = useState({ nombre: 'Bloque 7', inicio: '07:00', fin: '09:15' });

  const handleOpenDialog = (tipo: 'aula' | 'grupo' | 'horario') => {
    setDialogOpen(tipo);
  };

  const handleCloseDialog = () => {
    setDialogOpen(null);
    // Resetear formularios
    setNewAula({ nombre: '', piso: 1, capacidad: 40 });
    setNewGrupo({ nombre: '', materia: '', estudiantes: 30 });
    setNewHorario({ nombre: `Bloque ${horarios.length + 1}`, inicio: '07:00', fin: '09:15' });
  };

  const handleAddAula = () => {
    if (!newAula.nombre || !newAula.piso || !newAula.capacidad) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const aulaToAdd: Aula = {
      ...newAula,
      id: Date.now(), // ID único simple
    };
    setAulas(prev => [...prev, aulaToAdd]);
    handleCloseDialog();
  };
  
  const handleAddGrupo = () => {
    if (!newGrupo.nombre || !newGrupo.materia || !newGrupo.estudiantes) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const grupoToAdd: Grupo = {
      ...newGrupo,
      id: Date.now(),
    };
    setGrupos(prev => [...prev, grupoToAdd]);
    handleCloseDialog();
  };

  const handleAddHorario = () => {
    if (!newHorario.nombre || !newHorario.inicio || !newHorario.fin) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const horarioToAdd: Horario = {
      ...newHorario,
      id: Date.now(),
    };
    setHorarios(prev => [...prev, horarioToAdd]);
    handleCloseDialog();
  };

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
    // U_ijt - x_ijt * (C_j - S_i - δ) >= 0
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

            // Recalculate penalization based on the optimal assignment
            const espacioVacio = aula.capacidad - grupo.estudiantes;
            const umbralToleranciaValor = (umbralDelta / 100) * aula.capacidad;
            let penalizacion = 0;
            if (espacioVacio > umbralToleranciaValor) {
              penalizacion = (espacioVacio - umbralToleranciaValor) * factorPenalizacion;
            }
            
            solvedAssignments.push({
              grupoId: grupo.id,
              aulaId: aula.id,
              horarioId: horario.id,
              utilizacion: utilizacion,
              penalizacion: penalizacion
            });
            totalStudentsAssigned += grupo.estudiantes;
            totalPenalization += penalizacion;
            totalUtilization += utilizacion;
            assignedCount++;
          }
        }
      } else if (res && res.result) {
        console.error("GLPK Solver did not find an optimal or feasible solution. Status:", res.result.status);
        alert("Error de optimización: No se pudo encontrar una solución óptima o factible. Intente ajustar los parámetros o los datos.");
      } else {
        console.error("GLPK Solver returned an undefined or invalid result.");
        alert("Error de procesamiento: Ocurrió un error inesperado al procesar el resultado del solver. Intente ajustar los parámetros o los datos.");
      }
    } catch (error) {
      console.error("Error during GLPK solve:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      alert("Error de ejecución: Ocurrió un error al ejecutar el solver de optimización.");
    }

    setResultado({
      asignaciones: solvedAssignments,
      objetivoTotal: totalObjectiveValue,
      estudiantesAsignados: totalStudentsAssigned,
      penalizacionTotal: totalPenalization,
      utilizacionPromedio: assignedCount > 0 ? totalUtilization / assignedCount : 0
    });

    setOptimizando(false);
  };

  const getAulaNombre = (aulaId: number): string => {
    return aulas.find(a => a.id === aulaId)?.nombre || `Aula ${aulaId}`;
  };

  const getHorarioNombre = (horarioId: number): string => {
    const horario = horarios.find(h => h.id === horarioId);
    return horario ? `${horario.nombre} (${horario.inicio}-${horario.fin})` : `Horario ${horarioId}`;
  };

  const getGrupoInfo = (grupoId: number): Grupo | undefined => {
    return grupos.find(g => g.id === grupoId);
  };

  return (
    <div className="modern-container">
            <div>
        {/* Header */}
        <div className="modern-header">
          <Building className="icon" size={48} />
          <h1>Sistema de Optimización de Aulas</h1>
          <p>Universidad Autónoma Gabriel René Moreno (UAGRM) - Ingeniería Informática</p>
          <p className="subtitle">Modelo MILP para asignación eficiente de espacios académicos</p>
        </div>

        {/* Panel de configuración */}
        <div className="modern-card config-panel">
          <div className="modern-card-header">
            <Settings className="icon" />
            <h2>Parámetros del Modelo</h2>
          </div>
          
          <div className="modern-grid modern-grid-cols-2">
            <div>
              <label>
                Umbral de Tolerancia (δ) - Porcentaje
              </label>
              <input
                type="number"
                value={umbralDelta}
                onChange={(e) => setUmbralDelta(Number(e.target.value))}
                className="modern-input"
                min="0"
                max="50"
              />
              <p className="form-hint">
                Porcentaje de capacidad permitido sin penalización
              </p>
            </div>
            
            <div>
              <label>
                Factor de Penalización (λ)
              </label>
              <input
                type="number"
                value={factorPenalizacion}
                onChange={(e) => setFactorPenalizacion(Number(e.target.value))}
                className="modern-input"
                min="1"
                max="100"
              />
              <p className="form-hint">
                Multiplicador para penalizar subutilización
              </p>
            </div>
          </div>

          <button
            onClick={optimizarAsignaciones}
            disabled={optimizando}
            className="modern-button"
          >
            {optimizando ? (
              <>
                <div className="spinner"></div>
                Optimizando...
              </>
            ) : (
              <>
                <Play className="icon" />
                Ejecutar Optimización MILP
              </>
            )}
          </button>
        </div>

        {/* Datos del problema en grid */}
        <div className="modern-grid modern-grid-cols-3">
          {/* Aulas */}
          <div className="modern-card">
            <div className="modern-card-header">
              <Building className="icon icon-green" />
              <h3>Aulas Disponibles</h3>
            </div>
            <div className="scrollable">
              {Array.from({length: 5}, (_, piso) => piso + 1).map(pisoNum => (
                <div key={pisoNum} className="list-item-group">
                  <h4>Piso {pisoNum}</h4>
                  <div className="tag-container">
                    {aulas.filter(a => a.piso === pisoNum).map(aula => (
                      <span key={aula.id} className="tag tag-green">
                        {aula.nombre} ({aula.capacidad})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="modern-card-footer">
              <p>
                <strong>Total:</strong> {aulas.length} aulas
              </p>
              <button onClick={() => handleOpenDialog('aula')} className="modern-button secondary"><PlusCircle size={16} /> Añadir</button>
            </div>
          </div>

          {/* Grupos */}
          {/* Grupos */}
          <div className="modern-card">
            <div className="modern-card-header">
              <Users className="icon icon-purple" />
              <h3>Grupos y Materias</h3>
            </div>
            <div className="modern-grid-cols-1 scrollable">
              {grupos.map(grupo => (
                <div key={grupo.id} className="list-item-group">
                  <h3>{grupo.nombre}</h3>
                  <p>{grupo.materia}</p>
                  <p className="highlight-purple">{grupo.estudiantes} estudiantes</p>
                </div>
              ))}
            </div>
            <div className="modern-card-footer">
              <p>
                <strong>Total:</strong> {grupos.reduce((sum, g) => sum + g.estudiantes, 0)} estudiantes
              </p>
              <button onClick={() => handleOpenDialog('grupo')} className="modern-button secondary"><PlusCircle size={16} /> Añadir</button>
            </div>
          </div>

          {/* Horarios */}
          <div className="modern-card">
            <div className="modern-card-header">
              <Clock className="icon icon-orange" />
              <h3>Bloques Horarios</h3>
            </div>
            <div className="modern-grid-cols-1 scrollable">
              {horarios.map(horario => (
                <div key={horario.id} className="list-item-group">
                  <h3>{horario.nombre}</h3>
                  <p>{horario.inicio} - {horario.fin}</p>
                </div>
              ))}
            </div>
            <div className="modern-card-footer">
              <p>
                <strong>Total:</strong> {horarios.length} bloques diarios
              </p>
              <button onClick={() => handleOpenDialog('horario')} className="modern-button secondary"><PlusCircle size={16} /> Añadir</button>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        {dialogOpen && (
          <div className="modern-dialog-backdrop">
              <div className="modern-dialog">
                  <div className="modern-dialog-header">
                      <h2>Añadir {dialogOpen === 'aula' ? 'Aula' : dialogOpen === 'grupo' ? 'Grupo' : 'Horario'}</h2>
                      <button onClick={handleCloseDialog} className="modern-button secondary" style={{ padding: '0.5rem' }}><X size={16} /></button>
                  </div>
                  <div className="modern-dialog-content">
                      {dialogOpen === 'aula' && (
                          <div className="modern-grid">
                              <div>
                                  <label>Nombre del Aula</label>
                                  <input type="text" value={newAula.nombre} onChange={e => setNewAula({...newAula, nombre: e.target.value})} className="modern-input" placeholder="Ej: Aula 5-3" />
                              </div>
                              <div>
                                  <label>Piso</label>
                                  <input type="number" value={newAula.piso} onChange={e => setNewAula({...newAula, piso: Number(e.target.value)})} className="modern-input" />
                              </div>
                              <div>
                                  <label>Capacidad</label>
                                  <input type="number" value={newAula.capacidad} onChange={e => setNewAula({...newAula, capacidad: Number(e.target.value)})} className="modern-input" />
                              </div>
                          </div>
                      )}
                      {dialogOpen === 'grupo' && (
                          <div className="modern-grid">
                              <div>
                                  <label>Nombre del Grupo</label>
                                  <input type="text" value={newGrupo.nombre} onChange={e => setNewGrupo({...newGrupo, nombre: e.target.value})} className="modern-input" placeholder="Ej: Grupo 6" />
                              </div>
                              <div>
                                  <label>Materia</label>
                                  <input type="text" value={newGrupo.materia} onChange={e => setNewGrupo({...newGrupo, materia: e.target.value})} className="modern-input" placeholder="Ej: Investigación Operativa II" />
                              </div>
                              <div>
                                  <label>Nro. Estudiantes</label>
                                  <input type="number" value={newGrupo.estudiantes} onChange={e => setNewGrupo({...newGrupo, estudiantes: Number(e.target.value)})} className="modern-input" />
                              </div>
                          </div>
                      )}
                      {dialogOpen === 'horario' && (
                          <div className="modern-grid">
                              <div>
                                  <label>Nombre del Bloque</label>
                                  <input type="text" value={newHorario.nombre} onChange={e => setNewHorario({...newHorario, nombre: e.target.value})} className="modern-input" />
                              </div>
                              <div>
                                  <label>Hora de Inicio</label>
                                  <input type="time" value={newHorario.inicio} onChange={e => setNewHorario({...newHorario, inicio: e.target.value})} className="modern-input" />
                              </div>
                              <div>
                                  <label>Hora de Fin</label>
                                  <input type="time" value={newHorario.fin} onChange={e => setNewHorario({...newHorario, fin: e.target.value})} className="modern-input" />
                              </div>
                          </div>
                      )}
                  </div>
                  <div className="modern-dialog-footer">
                      <button onClick={handleCloseDialog} className="modern-button secondary">Cancelar</button>
                      <button onClick={dialogOpen === 'aula' ? handleAddAula : dialogOpen === 'grupo' ? handleAddGrupo : handleAddHorario} className="modern-button">Guardar</button>
                  </div>
              </div>
          </div>
        )}

        {/* Resultados */}
        {resultado && (
          <div className="modern-card">
            {/* Métricas generales */}
            <div className="modern-card">
              <div className="modern-card-header">
                <Calculator size={24} className="icon" />
                <h2>Resultados de la Optimización</h2>
              </div>

              <div className="metrics-grid">
                <div className="metric-card bg-blue">
                  <div className="metric-value">{resultado.objetivoTotal.toFixed(1)}</div>
                  <div className="metric-label">Función Objetivo</div>
                </div>
                <div className="metric-card bg-green">
                  <div className="metric-value">{resultado.estudiantesAsignados}</div>
                  <div className="metric-label">Estudiantes Asignados</div>
                </div>
                <div className="metric-card bg-red">
                  <div className="metric-value">{resultado.penalizacionTotal.toFixed(1)}</div>
                  <div className="metric-label">Penalización Total</div>
                </div>
                <div className="metric-card bg-purple">
                  <div className="metric-value">{resultado.utilizacionPromedio.toFixed(1)}%</div>
                  <div className="metric-label">Utilización Promedio</div>
                </div>
              </div>
            </div>

            {/* Tabla de asignaciones */}
            <div className="modern-card">
              <div className="modern-card-header">
                <Calculator size={24} className="icon" />
                <h2>Matriz de Asignaciones</h2>
              </div>
              
              <div className="scrollable">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Grupo</th>
                      <th>Materia</th>
                      <th>Estudiantes</th>
                      <th>Aula</th>
                      <th>Horario</th>
                      <th>Utilización</th>
                      <th>Penalización</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.asignaciones.map((asig, index) => {
                      const grupo = getGrupoInfo(asig.grupoId);
                      const aula = aulas.find(a => a.id === asig.aulaId);
                      
                      return (
                        <tr key={index}>
                          <td>{grupo?.nombre}</td>
                          <td>{grupo?.materia}</td>
                          <td className="text-center">{grupo?.estudiantes}</td>
                          <td>
                            {getAulaNombre(asig.aulaId)}
                            <span className="subtitle">
                              Cap: {aula?.capacidad}
                            </span>
                          </td>
                          <td>{getHorarioNombre(asig.horarioId)}</td>
                          <td className="text-center">
                            <span className={`tag ${asig.utilizacion >= 80 ? 'tag-green' : asig.utilizacion >= 60 ? 'tag-yellow' : 'tag-red'}`}>
                              {asig.utilizacion.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`tag ${asig.penalizacion === 0 ? 'tag-green' : 'tag-red'}`}>
                              {asig.penalizacion.toFixed(1)}
                            </span>
                          </td>
                          <td className="text-center">
                            <CheckCircle className="icon icon-green" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {resultado.asignaciones.length < grupos.length && (
                <div className="warning-box">
                  <p>
                    <strong>Advertencia:</strong> No todos los grupos pudieron ser asignados. 
                    Considera ajustar los parámetros o revisar la disponibilidad de aulas.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomOptimizationSystem;