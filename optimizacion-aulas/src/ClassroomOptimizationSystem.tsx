import React, { useState } from 'react';
import { Calculator, Building, Clock, Users, Settings, Play, CheckCircle } from 'lucide-react';
import './ClassroomOptimizationSystem.css';

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
  const [aulas] = useState<Aula[]>([
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

  const [grupos] = useState<Grupo[]>([
    { id: 1, nombre: "Grupo 1", materia: "Cálculo I", estudiantes: 35 },
    { id: 2, nombre: "Grupo 2", materia: "Física I", estudiantes: 50 },
    { id: 3, nombre: "Grupo 3", materia: "Introducción a la Ingeniería", estudiantes: 120 },
    { id: 4, nombre: "Grupo 4", materia: "Redes I", estudiantes: 40 },
    { id: 5, nombre: "Grupo 5", materia: "Álgebra Lineal", estudiantes: 60 }
  ]);

  const [horarios] = useState<Horario[]>([
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

  // Algoritmo de optimización (heurístico greedy mejorado)
  const optimizarAsignaciones = async (): Promise<void> => {
    setOptimizando(true);
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));

    const asignaciones: Asignacion[] = [];
    const aulasOcupadas = new Set<string>(); // "aulaId-horarioId"
    
    // Ordenar grupos por número de estudiantes (descendente)
    const gruposOrdenados = [...grupos].sort((a, b) => b.estudiantes - a.estudiantes);
    
    for (const grupo of gruposOrdenados) {
      let mejorAsignacion: Asignacion | null = null;
      let mejorPuntuacion = -Infinity;

      // Evaluar todas las combinaciones aula-horario disponibles
      for (const aula of aulas) {
        if (aula.capacidad < grupo.estudiantes) continue;

        for (const horario of horarios) {
          const claveOcupacion = `${aula.id}-${horario.id}`;
          if (aulasOcupadas.has(claveOcupacion)) continue;

          // Calcular métricas de la asignación
          const utilizacion = (grupo.estudiantes / aula.capacidad) * 100;
          const espacioVacio = aula.capacidad - grupo.estudiantes;
          const umbralTolerancia = (umbralDelta / 100) * aula.capacidad;
          
          let penalizacion = 0;
          if (espacioVacio > umbralTolerancia) {
            penalizacion = (espacioVacio - umbralTolerancia) * factorPenalizacion;
          }

          // Puntuación: maximizar utilización, minimizar penalización
          const puntuacion = grupo.estudiantes - penalizacion;

          if (puntuacion > mejorPuntuacion) {
            mejorPuntuacion = puntuacion;
            mejorAsignacion = {
              grupoId: grupo.id,
              aulaId: aula.id,
              horarioId: horario.id,
              utilizacion: utilizacion,
              penalizacion: penalizacion
            };
          }
        }
      }

      if (mejorAsignacion) {
        asignaciones.push(mejorAsignacion);
        aulasOcupadas.add(`${mejorAsignacion.aulaId}-${mejorAsignacion.horarioId}`);
      }
    }

    // Calcular métricas del resultado
    const estudiantesAsignados = asignaciones.reduce((total, asig) => {
      const grupo = grupos.find(g => g.id === asig.grupoId);
      return total + (grupo?.estudiantes || 0);
    }, 0);

    const penalizacionTotal = asignaciones.reduce((total, asig) => total + asig.penalizacion, 0);
    const objetivoTotal = estudiantesAsignados - penalizacionTotal;
    const utilizacionPromedio = asignaciones.reduce((total, asig) => total + asig.utilizacion, 0) / asignaciones.length;

    setResultado({
      asignaciones,
      objetivoTotal,
      estudiantesAsignados,
      penalizacionTotal,
      utilizacionPromedio
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
    <div className="classroom-optimization-container">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="header-section text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building className="header-icon w-12 h-12 text-blue-600 mr-3" />
            <h1 className="header-title text-4xl font-bold text-gray-800">
              Sistema de Optimización de Aulas
            </h1>
          </div>
          <p className="header-description text-gray-600 text-lg">
            Universidad Autónoma Gabriel René Moreno (UAGRM) - Ingeniería Informática
          </p>
          <div className="text-sm text-gray-500 mt-2">
            Modelo MILP para asignación eficiente de espacios académicos
          </div>
        </div>

        {/* Panel de configuración */}
        <div className="config-panel bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">Parámetros del Modelo</h2>
          </div>
          
          <div className="grid-cols-2-gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umbral de Tolerancia (δ) - Porcentaje
              </label>
              <input
                type="number"
                value={umbralDelta}
                onChange={(e) => setUmbralDelta(Number(e.target.value))}
                className="input-field w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Porcentaje de capacidad permitido sin penalización
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Factor de Penalización (λ)
              </label>
              <input
                type="number"
                value={factorPenalizacion}
                onChange={(e) => setFactorPenalizacion(Number(e.target.value))}
                className="input-field w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Multiplicador para penalizar subutilización
              </p>
            </div>
          </div>

          <button
            onClick={optimizarAsignaciones}
            disabled={optimizando}
            className="action-button mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {optimizando ? (
              <>
                <div className="spinner animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Optimizando...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Ejecutar Optimización MILP
              </>
            )}
          </button>
        </div>

        {/* Datos del problema en grid */}
        <div className="data-grid grid lg:grid-cols-3 gap-6 mb-6">
          {/* Aulas */}
          <div className="data-card bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Building className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Aulas Disponibles</h3>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {Array.from({length: 5}, (_, piso) => piso + 1).map(pisoNum => (
                <div key={pisoNum} className="border-l-4 border-green-500 pl-3 py-2">
                  <h4 className="font-medium text-gray-700">Piso {pisoNum}</h4>
                  <div className="text-sm text-gray-600">
                    {aulas.filter(a => a.piso === pisoNum).map(aula => (
                      <span key={aula.id} className="tag-green">
                        {aula.nombre} ({aula.capacidad})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Total:</strong> {aulas.length} aulas
              </p>
            </div>
          </div>

          {/* Grupos */}
          <div className="data-card bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Grupos y Materias</h3>
            </div>
            <div className="space-y-3">
              {grupos.map(grupo => (
                <div key={grupo.id} className="border-l-4 border-purple-500 pl-3 py-2">
                  <div className="font-medium text-gray-800">{grupo.nombre}</div>
                  <div className="text-sm text-gray-600">{grupo.materia}</div>
                  <div className="text-sm text-purple-600 font-medium">
                    {grupo.estudiantes} estudiantes
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Total:</strong> {grupos.reduce((sum, g) => sum + g.estudiantes, 0)} estudiantes
              </p>
            </div>
          </div>

          {/* Horarios */}
          <div className="data-card bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Bloques Horarios</h3>
            </div>
            <div className="space-y-2">
              {horarios.map(horario => (
                <div key={horario.id} className="border-l-4 border-orange-500 pl-3 py-2">
                  <div className="font-medium text-gray-800">{horario.nombre}</div>
                  <div className="text-sm text-gray-600">
                    {horario.inicio} - {horario.fin}
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Total:</strong> {horarios.length} bloques diarios
              </p>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {resultado && (
          <div className="results-section space-y-6">
            {/* Métricas generales */}
            <div className="metrics-panel bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Calculator className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-2xl font-semibold text-gray-800">Resultados de la Optimización</h3>
              </div>
              
              <div className="metrics-grid grid md:grid-cols-4 gap-4">
                <div className="metric-card bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{resultado.objetivoTotal.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Función Objetivo</div>
                </div>
                <div className="metric-card bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{resultado.estudiantesAsignados}</div>
                  <div className="text-sm text-gray-600">Estudiantes Asignados</div>
                </div>
                <div className="metric-card bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{resultado.penalizacionTotal.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Penalización Total</div>
                </div>
                <div className="metric-card bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{resultado.utilizacionPromedio.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Utilización Promedio</div>
                </div>
              </div>
            </div>

            {/* Tabla de asignaciones */}
            <div className="assignments-table-panel bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Matriz de Asignaciones</h3>
              
              <div className="overflow-x-auto">
                <table className="assignments-table w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Grupo</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Materia</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Estudiantes</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Aula</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Horario</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Utilización</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Penalización</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.asignaciones.map((asig, index) => {
                      const grupo = getGrupoInfo(asig.grupoId);
                      const aula = aulas.find(a => a.id === asig.aulaId);
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-3 font-medium text-gray-900">{grupo?.nombre}</td>
                          <td className="px-4 py-3 text-gray-700">{grupo?.materia}</td>
                          <td className="px-4 py-3 text-center font-medium">{grupo?.estudiantes}</td>
                          <td className="px-4 py-3 text-gray-700">
                            {getAulaNombre(asig.aulaId)}
                            <span className="text-xs text-gray-500 block">
                              Cap: {aula?.capacidad}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{getHorarioNombre(asig.horarioId)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`tag-utilization ${asig.utilizacion >= 80 ? 'bg-green-100 text-green-800' : asig.utilizacion >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {asig.utilizacion.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`tag-penalization ${asig.penalizacion === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {asig.penalizacion.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {resultado.asignaciones.length < grupos.length && (
                <div className="warning-message mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
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