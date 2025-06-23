/**
 * Sistema de Optimización de Asignación de Aulas Universitarias (MILP)
 *
 * Este componente principal implementa un sistema de optimización para asignar grupos universitarios
 * a aulas disponibles en diferentes horarios, siguiendo un modelo de Programación Lineal Entera Mixta.
 *
 * Características principales:
 * - Gestión de pisos, aulas, grupos y horarios universitarios
 * - Algoritmo de optimización que maximiza la asignación y penaliza subutilización
 * - Parámetros configurables: umbral de subutilización y factor de penalización
 * - Persistencia local de datos
 * - Interfaz de usuario intuitiva para gestionar entidades y visualizar resultados
 *
 * Estructura del componente:
 * 1. Estado y hooks - Se define el estado principal usando useState y usePersistentState
 * 2. Manejadores de eventos - Funciones para manejar CRUD de todas las entidades
 * 3. Algoritmo de optimización - Implementación del algoritmo MILP simplificado
 * 4. Interfaz de usuario - Renderizado de formularios, paneles y resultados
 *
 * Funcionamiento del algoritmo:
 * - Objetivo: Maximizar la asignación de estudiantes a aulas minimizando espacios vacíos
 * - Restricciones: No superar capacidad de aulas, no asignar más de un grupo por aula/horario
 * - Función objetivo: Estudiantes asignados - Penalizaciones por subutilización
 * - Método: Algoritmo voraz optimizado que prioriza asignaciones de mayor utilidad
 *
 * @author Universidad Politécnica
 * @version 2.0
 * @see types.ts - Interfaces de datos (Piso, Aula, Grupo, Horario)
 * @see components/ - Componentes auxiliares para la interfaz
 */

import React, { useState } from "react";
import {
  Building,
  Clock,
  Users,
  Settings,
  Play,
  CheckCircle,
  PlusSquare,
  Trash2,
} from "lucide-react";
import "./Modern.css";
import { Piso, Aula, Grupo, Horario, ResultadoOptimizacion } from "./types";
import AulasPanel from "./components/AulasPanel";
import GruposPanel from "./components/GruposPanel";
import HorariosPanel from "./components/HorariosPanel";
import usePersistentState from "./hooks/usePersistentState";
import ConfirmDialog from "./components/ConfirmDialog";

/**
 * Datos iniciales para cargar en el sistema
 * Esta estructura contiene los datos predefinidos que se cargarán cuando
 * el usuario presione el botón "Cargar Dataset"
 *
 * Contiene:
 * - Aulas: 16 aulas distribuidas en 5 pisos con diferentes capacidades
 * - Pisos: 5 pisos del edificio universitario
 * - Grupos: 5 grupos académicos con sus respectivas materias y cantidad de estudiantes
 * - Horarios: 6 bloques horarios distribuidos a lo largo del día
 */
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
    { id: 30, pisoId: 5, capacidad: 120, nombre: "Aula 5-2" },
  ],
  grupos: [
    { id: 1, nombre: "Grupo 1", materia: "Cálculo I", estudiantes: 35 },
    { id: 2, nombre: "Grupo 2", materia: "Física I", estudiantes: 50 },
    {
      id: 3,
      nombre: "Grupo 3",
      materia: "Introducción a la Ingeniería",
      estudiantes: 120,
    },
    { id: 4, nombre: "Grupo 4", materia: "Redes I", estudiantes: 40 },
    { id: 5, nombre: "Grupo 5", materia: "Álgebra Lineal", estudiantes: 60 },
  ],
  horarios: [
    { id: 1, nombre: "Bloque 1", inicio: "07:00", fin: "09:15" },
    { id: 2, nombre: "Bloque 2", inicio: "09:15", fin: "11:30" },
    { id: 3, nombre: "Bloque 3", inicio: "11:30", fin: "13:45" },
    { id: 4, nombre: "Bloque 4", inicio: "14:00", fin: "16:15" },
    { id: 5, nombre: "Bloque 5", inicio: "16:15", fin: "18:30" },
    { id: 6, nombre: "Bloque 6", inicio: "18:30", fin: "20:45" },
  ],
  pisos: [
    { id: 1, numero: 1, nombre: "Piso 1" },
    { id: 2, numero: 2, nombre: "Piso 2" },
    { id: 3, numero: 3, nombre: "Piso 3" },
    { id: 4, numero: 4, nombre: "Piso 4" },
    { id: 5, numero: 5, nombre: "Piso 5" },
  ],
};

/**
 * Componente principal del sistema de optimización de aulas
 *
 * Este componente gestiona todo el estado de la aplicación y la lógica de optimización.
 * Implementa el modelo MILP simplificado para asignación de grupos a aulas.
 *
 * Responsabilidades:
 * 1. Gestionar el estado de entidades (pisos, aulas, grupos, horarios)
 * 2. Manejar persistencia de datos en localStorage
 * 3. Implementar la lógica de optimización (algoritmo MILP simplificado)
 * 4. Proporcionar interfaz para la interacción del usuario
 * 5. Mostrar resultados y métricas de optimización
 *
 * La estructura del componente sigue un patrón de flujo de datos unidireccional,
 * donde las acciones del usuario actualizan el estado y este determina lo que se renderiza.
 */
const ClassroomOptimizationSystem: React.FC = () => {
  /**
   * GESTIÓN DEL ESTADO: ENTIDADES PRINCIPALES
   *
   * Estas entidades representan los datos fundamentales del problema:
   * - Pisos: Las plantas del edificio universitario
   * - Aulas: Espacios físicos con una capacidad determinada
   * - Grupos: Conjuntos de estudiantes que necesitan un espacio
   * - Horarios: Bloques de tiempo disponibles
   *
   * Utilizamos usePersistentState para persistir estos datos en localStorage
   * y mantenerlos entre sesiones de usuario.
   */

  // Estado de los datos del problema - Utilizamos el hook personalizado usePersistentState
  // para guardar los datos en localStorage y mantenerlos entre recargas de página
  const [pisos, setPisos] = usePersistentState<Piso[]>("pisos", []); // Lista de pisos
  const [aulas, setAulas] = usePersistentState<Aula[]>("aulas", []); // Lista de aulas
  const [grupos, setGrupos] = usePersistentState<Grupo[]>("grupos", []); // Lista de grupos académicos
  const [horarios, setHorarios] = usePersistentState<Horario[]>("horarios", []); // Lista de bloques horarios

  /**
   * PARÁMETROS DEL MODELO DE OPTIMIZACIÓN
   *
   * Estos parámetros controlan el algoritmo de optimización y pueden ser
   * ajustados por el usuario para personalizar los resultados:
   *
   * - umbralDelta: Define qué porcentaje de espacios vacíos es aceptable antes de empezar a penalizar.
   *   Por ejemplo, un 20% significa que si un aula queda con menos del 80% de ocupación,
   *   comenzará a recibir penalización por subutilización.
   *
   * - factorPenalizacion: Controla la severidad de la penalización por subutilización.
   *   Un valor más alto genera penalizaciones más severas, priorizando aulas más llenas.
   */
  // Parámetros del modelo de optimización que el usuario puede ajustar
  const [umbralDelta, setUmbralDelta] = useState<number>(20); // Umbral de subutilización (porcentaje)
  const [factorPenalizacion, setFactorPenalizacion] = useState<number>(10); // Factor que multiplica la penalización

  /**
   * ESTADO DE LA INTERFAZ DE USUARIO
   *
   * Estos estados controlan el comportamiento y apariencia de la interfaz:
   * - Estado del resultado de la optimización
   * - Indicadores de carga/progreso
   * - Estado de diálogos y formularios
   */
  // Estado de la optimización - Resultados y estado de proceso
  const [resultado, setResultado] = useState<ResultadoOptimizacion | null>(
    null
  );
  const [optimizando, setOptimizando] = useState<boolean>(false);

  // Estado para los diálogos de confirmación
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  }>({ isOpen: false, title: "", message: "", onConfirm: null });

  // Estado específico para el diálogo de confirmación de reinicio de datos
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  /**
   * FUNCIÓN DE REINICIO DEL SISTEMA
   *
   * Esta función limpia por completo todos los datos almacenados en el sistema:
   * 1. Reinicia las listas de entidades (pisos, aulas, grupos, horarios)
   * 2. Elimina los resultados de optimización previos
   * 3. Limpia los datos persistentes en localStorage
   * 4. Cierra el diálogo de confirmación
   *
   * Se utiliza cuando el usuario desea comenzar con un sistema limpio,
   * y requiere confirmación previa por seguridad.
   */
  const reiniciarDatos = () => {
    setPisos([]);
    setAulas([]);
    setGrupos([]);
    setHorarios([]);
    setResultado(null);
    // Limpiar localStorage para evitar que los datos persistan entre sesiones
    localStorage.removeItem("pisos");
    localStorage.removeItem("aulas");
    localStorage.removeItem("grupos");
    localStorage.removeItem("horarios");
    setShowResetConfirm(false);
  };

  /**
   * ESTADOS PARA DIÁLOGOS Y FORMULARIOS
   *
   * Estos estados controlan los diálogos modales para la creación y edición
   * de las diferentes entidades del sistema (pisos, aulas, grupos, horarios).
   */
  // Estado que determina qué diálogo está actualmente abierto, si lo hay
  const [dialogOpen, setDialogOpen] = useState<
    "piso" | "aula" | "grupo" | "horario" | null
  >(null);

  // Estados para los formularios de cada tipo de entidad
  // Cada uno mantiene los datos actuales del formulario, ya sea para creación o edición
  const [newPiso, setNewPiso] = useState<
    Omit<Piso, "id"> & { id: number | null }
  >({ id: null, numero: 1, nombre: "" });
  const [newAula, setNewAula] = useState<
    Omit<Aula, "id"> & { id: number | null }
  >({ id: null, nombre: "", pisoId: 1, capacidad: 40 });
  const [newGrupo, setNewGrupo] = useState<
    Omit<Grupo, "id"> & { id: number | null }
  >({ id: null, nombre: "", materia: "", estudiantes: 30 });
  const [newHorario, setNewHorario] = useState<
    Omit<Horario, "id"> & { id: number | null }
  >({
    id: null,
    nombre: "",
    inicio: "07:00",
    fin: "09:15",
  });

  // Obtener el número de piso más alto para sugerir el siguiente
  const getNextPisoNumero = (): number => {
    if (pisos.length === 0) return 1;
    return Math.max(...pisos.map((p) => p.numero)) + 1;
  };
  // Obtener aulas filtradas por piso
  const getAulasByPiso = (pisoId: number): Aula[] => {
    return aulas.filter((aula) => aula.pisoId === pisoId);
  };

  // Función para obtener el título del diálogo según el tipo y si está editando
  const getDialogTitle = (type: string, isEditing: boolean): string => {
    const titles: Record<string, string> = {
      piso: isEditing ? "Editar Piso" : "Nuevo Piso",
      aula: isEditing ? "Editar Aula" : "Nueva Aula",
      grupo: isEditing ? "Editar Grupo" : "Nuevo Grupo",
      horario: isEditing ? "Editar Horario" : "Nuevo Horario",
    };
    return titles[type] || "";
  };

  // Manejador para enviar el formulario del diálogo
  const handleDialogSubmit = (type: string) => {
    switch (type) {
      case "piso":
        handleAddPiso();
        break;
      case "aula":
        handleAddAula();
        break;
      case "grupo":
        handleAddGrupo();
        break;
      case "horario":
        handleAddHorario();
        break;
    }
    handleCloseDialog();
  };

  // Función para manejar la apertura de diálogos
  const handleOpenDialog = (
    type: "piso" | "aula" | "grupo" | "horario",
    item: any = null
  ) => {
    if (item) {
      if (type === "piso") setNewPiso(item);
      else if (type === "aula") setNewAula(item);
      else if (type === "grupo") setNewGrupo(item);
      else if (type === "horario") setNewHorario(item);
    } else {
      // Resetear para creación
      if (type === "piso") {
        const nextNumero = getNextPisoNumero();
        setNewPiso({
          id: null,
          numero: nextNumero,
          nombre: `Piso ${nextNumero}`,
        });
      } else if (type === "aula") {
        setNewAula({
          id: null,
          nombre: "",
          pisoId: pisos[0]?.id || 0,
          capacidad: 40,
        });
      } else if (type === "grupo") {
        setNewGrupo({ id: null, nombre: "", materia: "", estudiantes: 30 });
      } else if (type === "horario") {
        setNewHorario({
          id: null,
          nombre: `Bloque ${horarios.length + 1}`,
          inicio: "07:00",
          fin: "09:15",
        });
      }
    }
    setDialogOpen(type);
  };

  const handleCloseDialog = () => {
    setDialogOpen(null);
  };

  // Manejar pisos
  const handleAddPiso = (pisoData?: Omit<Piso, "id">) => {
    const pisoToAdd = pisoData || {
      nombre: newPiso.nombre,
      numero: newPiso.numero,
    };

    if (!pisoToAdd.nombre || !pisoToAdd.numero) {
      alert("Por favor, complete todos los campos del piso.");
      return;
    }

    if (newPiso.id) {
      setPisos((prev) =>
        prev.map((p) =>
          p.id === newPiso.id ? { ...pisoToAdd, id: newPiso.id! } : p
        )
      );
    } else {
      setPisos((prev) => [...prev, { ...pisoToAdd, id: Date.now() }]);
    }
    handleCloseDialog();
  };

  const handleDeletePiso = (pisoId: number) => {
    setConfirmState({
      isOpen: true,
      title: "Confirmar Eliminación de Piso",
      message:
        "¿Estás seguro? Todas las aulas asociadas también serán eliminadas permanentemente.",
      onConfirm: () => {
        const aulasAEliminar = aulas
          .filter((a) => a.pisoId === pisoId)
          .map((a) => a.id);
        setAulas((prevAulas) =>
          prevAulas.filter((a) => !aulasAEliminar.includes(a.id))
        );
        setPisos((prevPisos) => prevPisos.filter((p) => p.id !== pisoId));
        setConfirmState({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
    });
  };

  // Manejar aulas
  const handleAddAula = (aulaData?: Omit<Aula, "id">) => {
    const aulaToAdd = aulaData || {
      nombre: newAula.nombre,
      pisoId: newAula.pisoId,
      capacidad: newAula.capacidad,
    };

    if (!aulaToAdd.nombre || !aulaToAdd.pisoId || !aulaToAdd.capacidad) {
      alert("Por favor, complete todos los campos del aula.");
      return;
    }

    if (newAula.id) {
      setAulas((prev) =>
        prev.map((a) =>
          a.id === newAula.id ? { ...aulaToAdd, id: newAula.id! } : a
        )
      );
    } else {
      setAulas((prev) => [...prev, { ...aulaToAdd, id: Date.now() }]);
    }
    handleCloseDialog();
  };

  const handleDeleteAula = (aulaId: number) => {
    setConfirmState({
      isOpen: true,
      title: "Confirmar Eliminación de Aula",
      message:
        "¿Estás seguro de que quieres eliminar esta aula? Esta acción no se puede deshacer.",
      onConfirm: () => {
        setAulas((prevAulas) => prevAulas.filter((a) => a.id !== aulaId));
        setConfirmState({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
    });
  }; // Manejar grupos
  const handleAddGrupo = (grupoData?: Omit<Grupo, "id">) => {
    const grupoToAdd = grupoData || {
      nombre: newGrupo.nombre,
      materia: newGrupo.materia,
      estudiantes: newGrupo.estudiantes,
    };

    if (!grupoToAdd.nombre || !grupoToAdd.materia || !grupoToAdd.estudiantes) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    if (newGrupo.id) {
      setGrupos((prev) =>
        prev.map((g) =>
          g.id === newGrupo.id ? { ...grupoToAdd, id: newGrupo.id! } : g
        )
      );
    } else {
      setGrupos((prev) => [...prev, { ...grupoToAdd, id: Date.now() }]);
    }
    handleCloseDialog();
  };

  const handleDeleteGrupo = (grupoId: number) => {
    setConfirmState({
      isOpen: true,
      title: "Confirmar Eliminación de Grupo",
      message:
        "¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.",
      onConfirm: () => {
        setGrupos((prevGrupos) => prevGrupos.filter((g) => g.id !== grupoId));
        setConfirmState({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
    });
  }; // Manejar horarios
  const handleAddHorario = (horarioData?: Omit<Horario, "id">) => {
    const horarioToAdd = horarioData || {
      nombre: newHorario.nombre,
      inicio: newHorario.inicio,
      fin: newHorario.fin,
    };

    if (!horarioToAdd.nombre || !horarioToAdd.inicio || !horarioToAdd.fin) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    if (newHorario.id) {
      setHorarios((prev) =>
        prev.map((h) =>
          h.id === newHorario.id ? { ...horarioToAdd, id: newHorario.id! } : h
        )
      );
    } else {
      setHorarios((prev) => [...prev, { ...horarioToAdd, id: Date.now() }]);
    }
    handleCloseDialog();
  };

  const handleDeleteHorario = (horarioId: number) => {
    setConfirmState({
      isOpen: true,
      title: "Confirmar Eliminación de Horario",
      message:
        "¿Estás seguro de que quieres eliminar este bloque horario? Esta acción no se puede deshacer.",
      onConfirm: () => {
        setHorarios((prevHorarios) =>
          prevHorarios.filter((h) => h.id !== horarioId)
        );
        setConfirmState({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
    });
  };

  /**
   * Función para cargar el dataset predefinido de la universidad
   *
   * Esta función carga los datos iniciales que incluyen:
   * - 16 aulas distribuidas en 5 pisos con diferentes capacidades
   * - 5 grupos académicos con sus materias y cantidad de estudiantes
   * - 6 bloques horarios a lo largo del día
   *
   * También reinicia cualquier resultado previo de optimización.
   * Es útil para demostrar rápidamente las capacidades del sistema.
   */
  const handleLoadDataset = () => {
    setPisos(initialData.pisos);
    setAulas(initialData.aulas);
    setGrupos(initialData.grupos);
    setHorarios(initialData.horarios);
    setResultado(null); // Limpia resultados previos al cargar nuevos datos
  };

  /**
   * ALGORITMO DE OPTIMIZACIÓN PRINCIPAL
   *
   * Implementación de un algoritmo de asignación basado en MILP
   * (Programación Lineal Entera Mixta)
   * para distribuir grupos en aulas y horarios disponibles
   * maximizando la utilización y aplicando
   * penalizaciones por subutilización.
   *
   * El algoritmo sigue estos pasos:
   * 1. Validación de datos de entrada
   * 2. Pre-filtrado de aulas válidas para cada grupo (optimización)
   * 3. Generación de combinaciones válidas con cálculo de utilidad
   * 4. Ordenamiento por utilidad y procesamiento en chunks para
   * evitar bloqueos
   * 5. Selección de asignaciones respetando restricciones
   * 6. Cálculo de métricas finales
   */
  const optimizarAsignaciones = async () => {
    setOptimizando(true);
    try {
      /**
       * PASO 1: Validacion de Datos de Entrada
       *
       * Para optimizar el rendimiento, primero validamos que los datos de entrada
       * sean suficientes y estén en el formato correcto.
       */
      // Validar que tengamos datos suficientes
      if (grupos.length === 0 || aulas.length === 0 || horarios.length === 0) {
        alert(
          "Necesitas tener al menos un grupo, un aula y un horario para optimizar."
        );
        setOptimizando(false);
        return;
      }

      // Agregar pequeño delay para permitir que la UI se actualice antes de comenzar el proceso intensivo
      // Esto mejora la experiencia del usuario mostrando el indicador de carga
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Arrays para almacenar resultados y seguimiento de estado
      const asignaciones: any[] = []; // Almacena las asignaciones finales
      const aulasOcupadas: { [key: string]: boolean } = {}; // Registro de aulas ya ocupadas por horario
      const gruposAsignados: { [key: number]: boolean } = {}; // Registro de grupos ya asignados

      /**
       * PASO 2: FILTRADO PREVIO DE COMBINACIONES VÁLIDAS
       *
       * Para optimizar el rendimiento, primero filtramos para cada grupo
       * sólo aquellas aulas que tienen capacidad suficiente para albergar
       * a todos sus estudiantes. Esto reduce significativamente el espacio
       * de búsqueda.
       */
      // Pre-filtrar aulas válidas para cada grupo (optimización)
      // Esta optimización reduce la complejidad al filtrar solo aulas que pueden alojar al grupo
      const gruposConAulasValidas = grupos
        .map((grupo) => ({
          grupo,
          aulasValidas: aulas.filter(
            (aula) => grupo.estudiantes <= aula.capacidad
          ),
        }))
        .filter((item) => item.aulasValidas.length > 0);

      // Crear combinaciones válidas de forma más eficiente
      // Esta estructura almacenará todas las posibles combinaciones de grupo-aula-horario
      // junto con sus métricas calculadas (utilidad, utilización, etc.)
      const combinacionesValidas: Array<{
        grupo: Grupo;
        aula: Aula;
        horario: Horario;
        piso: Piso;
        utilidad: number; // Valor objetivo que representa el beneficio de esta asignación
        utilizacion: number; // Porcentaje de ocupación del aula
        penalizacion: number; // Penalización por subutilización del aula
      }> = [];

      // Procesamos cada grupo con sus aulas válidas (que cumplen con la capacidad)
      for (const { grupo, aulasValidas } of gruposConAulasValidas) {
        for (const aula of aulasValidas) {
          // Obtenemos el piso al que pertenece el aula
          const piso = pisos.find((p) => p.id === aula.pisoId)!;

          // Calculamos métricas clave para la asignación:

          // 1. Porcentaje de utilización del aula (estudiantes / capacidad)
          const utilizacion = (grupo.estudiantes / aula.capacidad) * 100;

          // 2. Espacios vacíos en el aula después de asignar el grupo
          const espaciosVacios = aula.capacidad - grupo.estudiantes;

          // 3. Espacios que superan el umbral de tolerancia y deben ser penalizados
          // El umbralDelta determina qué porcentaje de vacío es "aceptable"
          const espaciosPenalizados = Math.max(
            0,
            espaciosVacios - (umbralDelta / 100) * aula.capacidad
          );

          // 4. Penalización calculada según el factor configurado por el usuario
          const penalizacion = (factorPenalizacion / 10) * espaciosPenalizados;

          // 5. Utilidad final de esta asignación (estudiantes beneficiados menos penalización)
          const utilidad = grupo.estudiantes - penalizacion;

          // Para cada horario disponible, creamos una combinación posible
          for (const horario of horarios) {
            combinacionesValidas.push({
              grupo,
              aula,
              horario,
              piso,
              utilidad,
              utilizacion,
              penalizacion,
            });
          }
        }
      }

      /**
       * PASO 3: ORDENAMIENTO POR UTILIDAD
       *
       * Ordenamos todas las combinaciones por utilidad descendente
       * para procesar primero las de mayor valor.
       * Esto asegura una optimización greedy que prioriza la máxima utilidad.
       */
      combinacionesValidas.sort((a, b) => b.utilidad - a.utilidad);

      /**
       * PASO 4: PROCESAMIENTO EN CHUNKS Y ASIGNACIÓN FINAL
       *
       * Para evitar bloquear la interfaz de usuario durante el procesamiento,
       * dividimos las combinaciones en grupos más pequeños (chunks) y
       * permitimos que la UI se actualice entre procesamiento de chunks.
       *
       * Esta es una técnica de procesamiento asíncrono que mantiene la
       * aplicación web responsiva incluso con grandes volúmenes de datos.
       */
      const chunkSize = Math.min(100, combinacionesValidas.length);
      for (let i = 0; i < combinacionesValidas.length; i += chunkSize) {
        const chunk = combinacionesValidas.slice(i, i + chunkSize);

        // Procesamos cada combinación dentro del chunk actual
        for (const combinacion of chunk) {
          // Creamos una clave única para cada par aula-horario para rastrear ocupación
          const aulaHorarioKey = `${combinacion.aula.id}_${combinacion.horario.id}`;

          // Verificamos dos restricciones duras del modelo:
          // 1. El grupo no debe haber sido asignado previamente
          // 2. El aula no debe estar ocupada en ese horario
          if (
            !gruposAsignados[combinacion.grupo.id] &&
            !aulasOcupadas[aulaHorarioKey]
          ) {
            // Si se cumplen las restricciones, creamos la asignación
            // con todos los datos necesarios para mostrar en la interfaz
            asignaciones.push({
              grupo: combinacion.grupo,
              aula: combinacion.aula,
              horario: combinacion.horario,
              utilizacion: combinacion.utilizacion,
              penalizacion: combinacion.penalizacion,
              // Datos pre-calculados para la visualización en la UI
              grupoNombre: combinacion.grupo.nombre,
              aulaNombre: combinacion.aula.nombre,
              pisoNombre: combinacion.piso.nombre,
              horarioNombre: combinacion.horario.nombre,
              capacidadAula: combinacion.aula.capacidad,
              porcentajeOcupacion: combinacion.utilizacion,
            });

            // Marcamos el grupo como asignado para evitar duplicados
            gruposAsignados[combinacion.grupo.id] = true;
            // Marcamos el par aula-horario como ocupado
            aulasOcupadas[aulaHorarioKey] = true;
          }
        }

        // Pequeña pausa entre chunks para permitir que la UI se actualice
        // Esto es crucial para mantener la interfaz responsiva durante
        // procesamiento pesado en el hilo principal de JavaScript
        if (i + chunkSize < combinacionesValidas.length) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      /**
       * PASO 5: CÁLCULO DE MÉTRICAS FINALES
       *
       * Calculamos las estadísticas globales del resultado de la optimización:
       * - Total de estudiantes asignados (beneficiados)
       * - Penalización total por subutilización
       * - Utilización promedio de las aulas
       * - Valor objetivo (función objetivo del MILP): estudiantes - penalización
       */
      const estudiantesAsignados = asignaciones.reduce(
        (sum, asig) => sum + asig.grupo.estudiantes,
        0
      );
      const penalizacionTotal = asignaciones.reduce(
        (sum, asig) => sum + asig.penalizacion,
        0
      );
      const utilizacionPromedio =
        asignaciones.length > 0
          ? asignaciones.reduce((sum, asig) => sum + asig.utilizacion, 0) /
            asignaciones.length
          : 0;
      const valorObjetivo = estudiantesAsignados - penalizacionTotal;

      // Estructura final del resultado con todas las métricas y asignaciones
      const resultado: ResultadoOptimizacion = {
        valorObjetivo,
        estudiantesAsignados,
        penalizacionTotal,
        utilizacionPromedio,
        asignaciones,
      };

      // Actualizamos el estado con el resultado de la optimización
      setResultado(resultado);

      // Notificación sobre grupos no asignados (si los hubiera)
      // Esto puede ocurrir si hay más grupos que combinaciones aula-horario disponibles
      // o si algunos grupos no tienen aulas adecuadas para su tamaño
      const gruposNoAsignados = grupos.length - asignaciones.length;
      if (gruposNoAsignados > 0) {
        alert(`Optimización completada. ${gruposNoAsignados} grupo(s) no pudieron ser asignados debido 
          a restricciones de capacidad o disponibilidad.`);
      }
    } catch (error) {
      console.error("Error durante la optimización:", error);
      alert("Error durante la optimización: " + (error as Error).message);
    } finally {
      setOptimizando(false);
    }
  };

  /**
   * COMPONENTE DE INTERFAZ PRINCIPAL
   *
   * La interfaz de usuario del sistema se compone de las siguientes secciones principales:
   * 1. Panel de parámetros de optimización
   * 2. Panel de resultados (cuando hay una optimización completada)
   * 3. Grid de paneles de datos (Aulas/Pisos, Grupos, Horarios)
   * 4. Diálogos modales para creación y edición de entidades
   */
  return (
    <div className="container">
      {/* SECCIÓN 1: PARÁMETROS DE OPTIMIZACIÓN
          Panel que permite ajustar los parámetros que controlan el algoritmo de optimización:
          - Umbral de subutilización: Determina qué porcentaje de capacidad vacía es aceptable
          - Factor de penalización: Controla la severidad de la penalización por subutilización
          
          También incluye los botones de control del sistema:
          - Cargar datos: Inicializa el sistema con un conjunto de datos predefinido
          - Reiniciar: Borra todos los datos actuales
          - Optimizar: Ejecuta el algoritmo con los parámetros configurados */}
      <div className="parameters-card">
        <div className="card-header">
          <Settings size={24} />
          <h2>Parámetros de Optimización</h2>
        </div>
        <div className="card-body">
          {/* Control de Umbral de Subutilización */}
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
            <small className="text-muted">
              Considera un aula subutilizada cuando su ocupación está por debajo
              de este porcentaje.
            </small>
          </div>

          {/* Control de Factor de Penalización */}
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
            <small className="text-muted">
              Peso que se le da a la penalización por subutilización en el
              cálculo.
            </small>
          </div>

          {/* Botones de Control */}
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
              disabled={
                optimizando ||
                aulas.length === 0 ||
                grupos.length === 0 ||
                horarios.length === 0
              }
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

      {/* SECCIÓN DE INDICADOR DE CARGA */}
      {optimizando && <div className="spinner"></div>}

      {/* SECCIÓN 2: RESULTADOS DE OPTIMIZACIÓN
          Esta sección solo se muestra cuando se ha completado una optimización.
          Incluye métricas resumen del resultado y una tabla detallada con todas las asignaciones. */}
      {resultado && (
        <div className="results-card">
          <div className="card-header">
            <CheckCircle size={24} />
            <h2>Resultados de la Optimización</h2>
          </div>
          <div className="card-body">
            {/* Panel de métricas resumen */}
            <div className="summary-metrics">
              {/* Valor objetivo (función objetivo del MILP) */}
              <div className="metric-item">
                <strong>Valor Objetivo</strong>
                <div>
                  <span style={{ color: "#2563eb" }}>
                    {resultado.valorObjetivo.toFixed(2)}
                  </span>
                </div>
              </div>
              {/* Total de estudiantes que recibieron asignación */}
              <div className="metric-item">
                <strong>Estudiantes Asignados</strong>
                <div>
                  <span style={{ color: "#10b981" }}>
                    {resultado.estudiantesAsignados}
                  </span>
                </div>
              </div>
              {/* Penalización total por subutilización */}
              <div className="metric-item">
                <strong>Penalización Total</strong>
                <div>
                  <span
                    style={{
                      color:
                        resultado.penalizacionTotal > 0 ? "#ef4444" : "#10b981",
                    }}
                  >
                    {resultado.penalizacionTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              {/* Porcentaje promedio de utilización de aulas */}
              <div className="metric-item">
                <strong>Utilización Promedio</strong>
                <div>
                  <span
                    style={{
                      color:
                        resultado.utilizacionPromedio >= 70
                          ? "#10b981"
                          : resultado.utilizacionPromedio >= 40
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {resultado.utilizacionPromedio.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Tabla de Asignaciones */}
            {/* Tabla de asignaciones detalladas
                Muestra todas las asignaciones grupo-aula-horario resultantes de la optimización,
                con métricas específicas para cada asignación como el porcentaje de utilización
                y la penalización por subutilización si corresponde. */}
            <div className="assignments-grid">
              <h3>Asignaciones Detalladas</h3>
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Aula</th>
                    <th>Horario</th>
                    <th style={{ width: "200px" }}>Utilización</th>
                    <th>Penalización</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.asignaciones?.map((asignacion, index) => (
                    <tr key={index}>
                      {/* Celda de información del grupo */}
                      <td>
                        <div className="assignment-detail">
                          <Users size={18} />
                          <div>
                            <strong>{asignacion.grupoNombre}</strong>
                            <small>
                              {asignacion.grupo.estudiantes} estudiantes
                            </small>
                          </div>
                        </div>
                      </td>
                      {/* Celda de información del aula */}
                      <td>
                        <div className="assignment-detail">
                          <Building size={18} />
                          <div>
                            <strong>{asignacion.aulaNombre}</strong>
                            <small>Capacidad: {asignacion.capacidadAula}</small>
                          </div>
                        </div>
                      </td>
                      {/* Celda de información del horario */}
                      <td>
                        <div className="assignment-detail">
                          <Clock size={18} />
                          <div>
                            <strong>{asignacion.horarioNombre}</strong>
                            <small>
                              {asignacion.horario.inicio} -{" "}
                              {asignacion.horario.fin}
                            </small>
                          </div>
                        </div>
                      </td>
                      {/* Celda con barra visual de porcentaje de utilización */}
                      <td className="utilization-cell">
                        <div className="utilization-value">
                          <span>
                            {asignacion.porcentajeOcupacion.toFixed(1)}%
                          </span>
                          <small>
                            de {asignacion.capacidadAula} (
                            {asignacion.grupo.estudiantes})
                          </small>
                        </div>
                        <div className="utilization-bar">
                          <div
                            className={`utilization-fill ${
                              asignacion.porcentajeOcupacion >= 70
                                ? "utilization-high"
                                : asignacion.porcentajeOcupacion >= 40
                                ? "utilization-medium"
                                : "utilization-low"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                asignacion.porcentajeOcupacion
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                      {/* Celda de penalización (muestra marca de verificación si no hay penalización) */}
                      <td className="penalty-cell">
                        {asignacion.penalizacion > 0 ? (
                          <span style={{ color: "#ef4444" }}>
                            {asignacion.penalizacion.toFixed(2)}
                          </span>
                        ) : (
                          <span style={{ color: "#10b981" }}>✓</span>
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

      {/* SECCIÓN 3: GRID DE PANELES DE DATOS
          Estos paneles permiten la visualización y gestión (creación, edición, eliminación)
          de todas las entidades clave del sistema: Aulas/Pisos, Grupos y Horarios.
          Cada panel se implementa como un componente separado para mejor organización. */}
      <div className="grid-container">
        {/* Panel para gestionar Aulas y Pisos */}
        <div className="grid-col">
          <AulasPanel
            pisos={pisos}
            aulas={aulas}
            onAddPiso={handleAddPiso}
            onAddAula={handleAddAula}
            onEditPiso={(piso) => handleOpenDialog("piso", piso)}
            onEditAula={(aula) => handleOpenDialog("aula", aula)}
            onDeletePiso={handleDeletePiso}
            onDeleteAula={handleDeleteAula}
            getAulasByPiso={getAulasByPiso}
          />
        </div>
        {/* Panel para gestionar Grupos académicos */}
        <div className="grid-col">
          <GruposPanel
            grupos={grupos}
            onAddGrupo={handleAddGrupo}
            onEditGrupo={(grupo) => handleOpenDialog("grupo", grupo)}
            onDeleteGrupo={handleDeleteGrupo}
          />
        </div>
        {/* Panel para gestionar Bloques Horarios */}
        <div className="grid-col">
          <HorariosPanel
            horarios={horarios}
            onAddHorario={handleAddHorario}
            onEditHorario={(horario) => handleOpenDialog("horario", horario)}
            onDeleteHorario={handleDeleteHorario}
          />
        </div>
      </div>

      {/* SECCIÓN 4: DIÁLOGOS MODALES
          Esta sección contiene todos los diálogos modales utilizados para crear o editar entidades.
          Cada diálogo incluye un formulario con validación y botones para confirmar o cancelar.
          Los diálogos se muestran condicionalmente según el estado dialogOpen. */}

      {/* Diálogo para crear/editar pisos */}
      {dialogOpen === "piso" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{getDialogTitle("piso", newPiso.id !== null)}</h3>
            <div className="form-group">
              <label>Número de Piso</label>
              <input
                type="number"
                value={newPiso.numero}
                onChange={(e) =>
                  setNewPiso({
                    ...newPiso,
                    numero: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newPiso.nombre}
                onChange={(e) =>
                  setNewPiso({ ...newPiso, nombre: e.target.value })
                }
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={handleCloseDialog}
                className="modern-button secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDialogSubmit("piso")}
                className="modern-button primary"
              >
                {newPiso.id ? "Actualizar" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo para crear/editar aulas */}
      {dialogOpen === "aula" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{getDialogTitle("aula", newAula.id !== null)}</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newAula.nombre}
                onChange={(e) =>
                  setNewAula({ ...newAula, nombre: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Piso</label>
              <select
                value={newAula.pisoId}
                onChange={(e) =>
                  setNewAula({ ...newAula, pisoId: parseInt(e.target.value) })
                }
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
                onChange={(e) =>
                  setNewAula({
                    ...newAula,
                    capacidad: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={handleCloseDialog}
                className="modern-button secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDialogSubmit("aula")}
                className="modern-button primary"
              >
                {newAula.id ? "Actualizar" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo para crear/editar grupos */}
      {dialogOpen === "grupo" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{getDialogTitle("grupo", newGrupo.id !== null)}</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newGrupo.nombre}
                onChange={(e) =>
                  setNewGrupo({ ...newGrupo, nombre: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Materia</label>
              <input
                type="text"
                value={newGrupo.materia}
                onChange={(e) =>
                  setNewGrupo({ ...newGrupo, materia: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Número de Estudiantes</label>
              <input
                type="number"
                value={newGrupo.estudiantes}
                onChange={(e) =>
                  setNewGrupo({
                    ...newGrupo,
                    estudiantes: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={handleCloseDialog}
                className="modern-button secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDialogSubmit("grupo")}
                className="modern-button primary"
              >
                {newGrupo.id ? "Actualizar" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo para crear/editar horarios */}
      {dialogOpen === "horario" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{getDialogTitle("horario", newHorario.id !== null)}</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newHorario.nombre}
                onChange={(e) =>
                  setNewHorario({ ...newHorario, nombre: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Hora de Inicio</label>
              <input
                type="time"
                value={newHorario.inicio}
                onChange={(e) =>
                  setNewHorario({ ...newHorario, inicio: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Hora de Fin</label>
              <input
                type="time"
                value={newHorario.fin}
                onChange={(e) =>
                  setNewHorario({ ...newHorario, fin: e.target.value })
                }
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={handleCloseDialog}
                className="modern-button secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDialogSubmit("horario")}
                className="modern-button primary"
              >
                {newHorario.id ? "Actualizar" : "Agregar"}
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
          setConfirmState({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
          });
        }}
        onCancel={() =>
          setConfirmState({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
          })
        }
      />
    </div>
  );
};

export default ClassroomOptimizationSystem;
