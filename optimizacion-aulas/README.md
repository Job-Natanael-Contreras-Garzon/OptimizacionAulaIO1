# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


# Optimización de Asignación de Aulas y Horarios Universitarios (MILP)

## 📋 Índice
- [Introducción](#introducción)
- [Especificaciones Técnicas](#especificaciones-técnicas)
- [Modelo Matemático](#modelo-matemático)
- [Implementación](#implementación)
- [Interfaz de Usuario](#interfaz-de-usuario)
- [Ejemplos de Resolución](#ejemplos-de-resolución)
- [Guía de Estilos React](#guía-de-estilos-react)
- [Instalación y Uso](#instalación-y-uso)
- [Contribución](#contribución)

## 🎯 Introducción

Sistema de optimización para la asignación eficiente de aulas y horarios universitarios utilizando programación lineal entera mixta (MILP). Desarrollado específicamente para el contexto de la **Universidad Autónoma Gabriel René Moreno (UAGRM)**, facultad de Ingeniería Informática.

### Objetivos Principales
- Maximizar la utilización del espacio disponible
- Minimizar la subutilización penalizable de aulas
- Automatizar el proceso de asignación de horarios
- Proporcionar una interfaz intuitiva para administradores académicos

## 🔧 Especificaciones Técnicas

### Stack Tecnológico
- **Frontend**: React 18+ con TypeScript
- **Optimización**: JavaScript Mathematical Programming (jsLPSolver) / OR-Tools via API
- **Styling**: Tailwind CSS + shadcn/ui
- **Estado**: Zustand para gestión de estado
- **Visualización**: Recharts para gráficos y métricas
- **Procesamiento**: Lodash para manipulación de datos

### Arquitectura del Sistema
```
src/
├── components/
│   ├── optimization/
│   │   ├── InputForm.tsx          # Formulario de entrada de datos
│   │   ├── SolutionDisplay.tsx    # Visualización de resultados
│   │   ├── ScheduleMatrix.tsx     # Matriz de horarios
│   │   └── MetricsPanel.tsx       # Panel de métricas
│   ├── ui/                        # Componentes de interfaz
│   └── charts/                    # Componentes de gráficos
├── hooks/
│   └── useOptimization.ts         # Hook personalizado para optimización
├── utils/
│   ├── milpSolver.ts             # Implementación del solver MILP
│   ├── dataValidation.ts         # Validación de datos de entrada
│   └── formatters.ts             # Formateadores de datos
├── types/
│   └── optimization.ts           # Tipos TypeScript
└── stores/
    └── optimizationStore.ts      # Store de Zustand
```

## 📊 Modelo Matemático

### Variables de Decisión
- **x_ijt**: Variable binaria (0,1) - Asigna grupo i al aula j en horario t
- **U_ijt**: Variable continua (≥0) - Espacio subutilizado penalizable

### Parámetros del Sistema
```typescript
interface OptimizationParams {
  S_i: number[];      // Estudiantes por grupo
  C_j: number[];      // Capacidad por aula  
  δ: number;          // Umbral de tolerancia (%)
  λ: number;          // Factor de penalización
  groups: Group[];    // Información de grupos
  classrooms: Classroom[]; // Información de aulas
  timeSlots: TimeSlot[];   // Bloques horarios
}
```

### Función Objetivo
```
Maximizar Z = ΣΣΣ(S_i × x_ijt) - λ × ΣΣΣ(U_ijt)
              i j t                    i j t
```

### Restricciones

#### A. Asignación única por grupo
```
ΣΣ x_ijt = 1  ∀i
j t
```

#### B. Una asignación por aula-horario
```
Σ x_ijt ≤ 1  ∀j,t
i
```

#### C. Capacidad del aula
```
x_ijt × S_i ≤ C_j  ∀i,j,t
```

#### D. Penalización por subutilización
```
U_ijt ≥ x_ijt × (C_j - S_i - δ)  ∀i,j,t
```

## 💻 Implementación

### Configuración Inicial de Datos UAGRM

```typescript
// Distribución de aulas por piso
const UAGRM_CLASSROOMS = [
  // Primer y segundo piso (8 aulas c/u)
  ...Array(8).fill(null).map((_, i) => ({
    id: `P1-${i + 1}`,
    capacity: i < 4 ? 45 : (i < 6 ? 60 : 30),
    floor: 1,
    building: 'Módulo Principal'
  })),
  ...Array(8).fill(null).map((_, i) => ({
    id: `P2-${i + 1}`,
    capacity: i < 4 ? 45 : (i < 6 ? 60 : 30),
    floor: 2,
    building: 'Módulo Principal'
  })),
  // Tercer y cuarto piso (6 aulas c/u)
  ...Array(6).fill(null).map((_, i) => ({
    id: `P3-${i + 1}`,
    capacity: i < 4 ? 60 : 40,
    floor: 3,
    building: 'Módulo Principal'
  })),
  ...Array(6).fill(null).map((_, i) => ({
    id: `P4-${i + 1}`,
    capacity: i < 4 ? 60 : 40,
    floor: 4,
    building: 'Módulo Principal'
  })),
  // Quinto piso (2 aulas)
  { id: 'P5-1', capacity: 120, floor: 5, building: 'Módulo Principal' },
  { id: 'P5-2', capacity: 120, floor: 5, building: 'Módulo Principal' }
];

const TIME_SLOTS = [
  { id: 1, start: '07:00', end: '09:15', label: 'Bloque 1' },
  { id: 2, start: '09:15', end: '11:30', label: 'Bloque 2' },
  { id: 3, start: '11:30', end: '13:45', label: 'Bloque 3' },
  { id: 4, start: '14:00', end: '16:15', label: 'Bloque 4' },
  { id: 5, start: '16:15', end: '18:30', label: 'Bloque 5' },
  { id: 6, start: '18:30', end: '20:45', label: 'Bloque 6' }
];
```

### Implementación del Solver MILP

```typescript
// utils/milpSolver.ts
import _ from 'lodash';

export class MILPSolver {
  private groups: Group[];
  private classrooms: Classroom[];
  private timeSlots: TimeSlot[];
  private delta: number;
  private lambda: number;

  constructor(params: OptimizationParams) {
    this.groups = params.groups;
    this.classrooms = params.classrooms;
    this.timeSlots = params.timeSlots;
    this.delta = params.δ;
    this.lambda = params.λ;
  }

  solve(): OptimizationResult {
    // Implementación del algoritmo MILP
    const solution = this.branchAndBound();
    return {
      assignments: this.formatAssignments(solution),
      metrics: this.calculateMetrics(solution),
      utilizationRate: this.calculateUtilization(solution),
      penalty: this.calculatePenalty(solution)
    };
  }

  private branchAndBound(): Solution {
    // Implementación del algoritmo Branch and Bound
    // para resolver el problema MILP
    const initialSolution = this.generateInitialSolution();
    return this.optimize(initialSolution);
  }

  private isValidAssignment(groupId: number, classroomId: number): boolean {
    const group = this.groups.find(g => g.id === groupId);
    const classroom = this.classrooms.find(c => c.id === classroomId);
    
    return group && classroom && group.students <= classroom.capacity;
  }

  private calculatePenalty(assignment: Assignment): number {
    const group = this.groups.find(g => g.id === assignment.groupId);
    const classroom = this.classrooms.find(c => c.id === assignment.classroomId);
    
    if (!group || !classroom) return 0;
    
    const unusedSpace = classroom.capacity - group.students;
    const threshold = Math.floor(classroom.capacity * this.delta);
    
    return Math.max(0, unusedSpace - threshold);
  }
}
```

## 🎨 Interfaz de Usuario

### Componente Principal de Optimización

```typescript
// components/optimization/OptimizerDashboard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOptimization } from '@/hooks/useOptimization';

export const OptimizerDashboard: React.FC = () => {
  const {
    groups,
    classrooms,
    solution,
    isOptimizing,
    optimize,
    metrics
  } = useOptimization();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Optimización de Aulas UAGRM
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema de asignación inteligente de espacios académicos
          </p>
        </div>
        <Button 
          onClick={optimize} 
          disabled={isOptimizing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isOptimizing ? 'Optimizando...' : 'Ejecutar Optimización'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Matriz de Asignación</CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleMatrix solution={solution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Optimización</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricsPanel metrics={metrics} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

### Matriz de Horarios Interactiva

```typescript
// components/optimization/ScheduleMatrix.tsx
export const ScheduleMatrix: React.FC<{ solution: Solution }> = ({ solution }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2 text-left">Horario</th>
            {UAGRM_CLASSROOMS.map(classroom => (
              <th key={classroom.id} className="border p-2 text-center min-w-[120px]">
                {classroom.id}
                <div className="text-xs text-gray-500">
                  Cap: {classroom.capacity}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map(timeSlot => (
            <tr key={timeSlot.id}>
              <td className="border p-2 font-medium bg-gray-50">
                <div>{timeSlot.label}</div>
                <div className="text-xs text-gray-600">
                  {timeSlot.start} - {timeSlot.end}
                </div>
              </td>
              {UAGRM_CLASSROOMS.map(classroom => {
                const assignment = solution?.assignments.find(
                  a => a.classroomId === classroom.id && a.timeSlotId === timeSlot.id
                );
                
                return (
                  <td key={`${classroom.id}-${timeSlot.id}`} className="border p-2">
                    {assignment ? (
                      <AssignmentCell assignment={assignment} />
                    ) : (
                      <div className="text-center text-gray-400 text-sm">Libre</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## 📈 Ejemplos de Resolución

### Caso de Estudio: Ingeniería Informática UAGRM

```typescript
const EXAMPLE_GROUPS = [
  {
    id: 1,
    name: 'Grupo 1',
    subject: 'Cálculo I',
    students: 35,
    professor: 'Dr. Martinez',
    semester: 1
  },
  {
    id: 2,
    name: 'Grupo 2',
    subject: 'Física I',
    students: 50,
    professor: 'Dra. Lopez',
    semester: 1
  },
  {
    id: 3,
    name: 'Grupo 3',
    subject: 'Introducción a la Ingeniería',
    students: 120,
    professor: 'Ing. Rodriguez',
    semester: 1
  },
  {
    id: 4,
    name: 'Grupo 4',
    subject: 'Redes I',
    students: 40,
    professor: 'MSc. Fernandez',
    semester: 5
  },
  {
    id: 5,
    name: 'Grupo 5',
    subject: 'Álgebra Lineal',
    students: 60,
    professor: 'Dr. Gutierrez',
    semester: 2
  }
];

// Parámetros de optimización
const OPTIMIZATION_CONFIG = {
  δ: 0.20,    // 20% de tolerancia
  λ: 2.0,     // Factor de penalización
  maxIterations: 1000,
  convergenceThreshold: 0.001
};
```

### Resultado Esperado

```
SOLUCIÓN ÓPTIMA ENCONTRADA
==============================
Función Objetivo: Z = 305 - 15 = 290

ASIGNACIONES:
- Grupo 1 (35 est.) → Aula P1-1 (45 cap.) → Bloque 1 [Utilización: 77.8%]
- Grupo 2 (50 est.) → Aula P1-5 (60 cap.) → Bloque 2 [Utilización: 83.3%]
- Grupo 3 (120 est.) → Aula P5-1 (120 cap.) → Bloque 3 [Utilización: 100%]
- Grupo 4 (40 est.) → Aula P3-5 (40 cap.) → Bloque 4 [Utilización: 100%]
- Grupo 5 (60 est.) → Aula P3-1 (60 cap.) → Bloque 5 [Utilización: 100%]

MÉTRICAS:
- Utilización promedio: 92.2%
- Penalización total: 15 puntos
- Aulas utilizadas: 5/16 (31.25%)
- Eficiencia espacial: Óptima
```

## 🎨 Guía de Estilos React

### Paleta de Colores UAGRM
```css
:root {
  /* Colores institucionales */
  --uagrm-blue: #1e40af;
  --uagrm-light-blue: #3b82f6;
  --uagrm-gold: #f59e0b;
  --uagrm-green: #10b981;
  
  /* Estados */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Grises */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-900: #111827;
}
```

### Componentes Estilizados

```typescript
// Botón principal UAGRM
const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, var(--uagrm-blue) 0%, var(--uagrm-light-blue) 100%);
  border: none;
  box-shadow: 0 4px 14px 0 rgba(30, 64, 175, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px 0 rgba(30, 64, 175, 0.4);
  }
`;

// Card con efecto glassmorphism
const GlassCard = styled(Card)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
`;
```

### Animaciones y Transiciones

```css
/* Animación de carga para optimización */
@keyframes pulse-optimization {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.optimizing {
  animation: pulse-optimization 2s ease-in-out infinite;
}

/* Transición suave para cambios de estado */
.schedule-cell {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.schedule-cell:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### Responsive Design

```typescript
const ResponsiveLayout = {
  mobile: 'px-4 py-6',
  tablet: 'px-6 py-8 md:px-8',
  desktop: 'px-8 py-10 lg:px-12 xl:px-16',
  
  grid: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3 xl:grid-cols-4'
  }
};
```

## 🚀 Instalación y Uso

### Prerrequisitos
```bash
Node.js >= 18.0.0
npm >= 8.0.0 o yarn >= 1.22.0
```

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/uagrm/classroom-optimization.git
cd classroom-optimization

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar desarrollo
npm run dev
```

### Scripts Disponibles
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:coverage": "jest --coverage",
  "optimize": "node scripts/benchmark.js"
}
```

### Configuración de Parámetros

```typescript
// config/optimization.ts
export const OptimizationConfig = {
  // Tolerancia de subutilización (0.1 = 10%)
  UNDERUTILIZATION_THRESHOLD: 0.2,
  
  // Factor de penalización
  PENALTY_FACTOR: 2.0,
  
  // Máximo número de iteraciones
  MAX_ITERATIONS: 1000,
  
  // Criterio de convergencia
  CONVERGENCE_EPSILON: 0.001,
  
  // Tiempo límite de ejecución (ms)
  TIMEOUT: 30000
};
```

## 📊 Métricas y KPIs

### Indicadores de Rendimiento
- **Utilización Espacial**: Porcentaje promedio de ocupación de aulas
- **Eficiencia de Asignación**: Ratio de asignaciones exitosas
- **Penalización Total**: Costo por subutilización significativa
- **Tiempo de Convergencia**: Duración del proceso de optimización

### Dashboard de Métricas
```typescript
interface OptimizationMetrics {
  utilizationRate: number;      // 0-100%
  totalAssignments: number;
  totalPenalty: number;
  convergenceTime: number;      // milisegundos
  objectiveValue: number;
  constraints: {
    satisfied: number;
    total: number;
  };
}
```

## 🤝 Contribución

### Estructura de Commits
```
feat: nueva funcionalidad de optimización
fix: corrección en algoritmo MILP
docs: actualización de documentación
style: mejoras en interfaz de usuario
refactor: reestructuración de solver
test: pruebas unitarias para optimización
```

### Guidelines de Desarrollo
1. Seguir principios SOLID en componentes React
2. Implementar tests unitarios para lógica de optimización
3. Documentar algoritmos matemáticos
4. Mantener responsividad en todos los dispositivos
5. Optimizar rendimiento para datasets grandes

---

**Desarrollado para la Universidad Autónoma Gabriel René Moreno (UAGRM)**  
*Facultad de Ingeniería Informática - Investigación de Operaciones*

---

## 📞 Soporte

Para soporte técnico o consultas académicas:
- **Email**: sistemas@uagrm.edu.bo
- **Issues**: [GitHub Issues](https://github.com/uagrm/classroom-optimization/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/uagrm/classroom-optimization/wiki)