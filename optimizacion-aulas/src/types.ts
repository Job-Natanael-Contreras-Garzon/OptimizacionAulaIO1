export interface Piso {
  id: number;
  numero: number;
  nombre: string;
}

export interface Aula {
  id: number;
  nombre: string;
  pisoId: number;
  capacidad: number;
}

export interface Grupo {
  id: number;
  nombre: string;
  materia: string;
  estudiantes: number;
}

export interface Horario {
  id: number;
  nombre: string;
  inicio: string;
  fin: string;
}

export interface Asignacion {
  grupo: Grupo;
  aula: Aula;
  horario: Horario;
  utilizacion: number;
  penalizacion: number;
  // Additional properties for display
  grupoNombre: string;
  aulaNombre: string;
  pisoNombre: string;
  horarioNombre: string;
  capacidadAula: number;
  porcentajeOcupacion: number;
}

export interface ResultadoOptimizacion {
  asignaciones: Asignacion[];
  valorObjetivo: number;
  estudiantesAsignados: number;
  penalizacionTotal: number;
  utilizacionPromedio: number;
}
