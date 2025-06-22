# 📖 Guía de Usuario - Sistema de Optimización de Aulas MILP

## 🎯 **Introducción**

Esta guía te ayudará a utilizar el Sistema de Optimización de Asignación de Aulas basado en Programación Lineal Entera Mixta (MILP). El sistema está diseñado para resolver automáticamente el problema de asignación de 5 grupos universitarios a 16 aulas distribuidas en 5 pisos, considerando 6 bloques horarios diarios.

---

## 🏗️ **Arquitectura del Sistema**

```mermaid
graph TB
    subgraph "🎨 Interfaz de Usuario"
        A[Panel de Datos de Entrada]
        B[Panel de Configuración]
        C[Panel de Resultados]
        D[Panel de Métricas]
    end
    
    subgraph "🧠 Motor de Optimización"
        E[Validador de Datos]
        F[Constructor MILP]
        G[Solver GLPK]
        H[Analizador de Resultados]
    end
    
    subgraph "💾 Datos del Sistema"
        I[Grupos Universitarios]
        J[Aulas por Pisos]
        K[Horarios Diarios]
        L[Parámetros δ y λ]
    end
    
    A --> E
    B --> F
    E --> F
    F --> G
    G --> H
    H --> C
    H --> D
    
    I --> A
    J --> A
    K --> A
    L --> B
    
    style A fill:#e8f5e8
    style B fill:#fff3e0
    style C fill:#e3f2fd
    style D fill:#f3e5f5
    style G fill:#ffcdd2
```

---

## 🚀 **Inicio Rápido**

### Paso 1: Acceso al Sistema
1. Abre tu navegador web
2. Navega a la URL del sistema
3. La interfaz principal se carga automáticamente con los datos predefinidos

### Paso 2: Verificación de Datos
Los datos están precargados según las especificaciones universitarias:

```mermaid
flowchart LR
    subgraph "📚 Datos Precargados"
        A[5 Grupos<br/>G1: Cálculo I - 35<br/>G2: Física I - 50<br/>G3: Intro Ing - 120<br/>G4: Redes I - 40<br/>G5: Álgebra - 60]
        
        B[16 Aulas<br/>Pisos 1-2: 8 aulas<br/>Pisos 3-4: 6 aulas<br/>Piso 5: 2 aulas]
        
        C[6 Horarios<br/>07:00-09:15<br/>09:15-11:30<br/>11:30-13:45<br/>14:00-16:15<br/>16:15-18:30<br/>18:30-20:45]
    end
    
    A --> D[Sistema Listo]
    B --> D
    C --> D
    
    style A fill:#e8f5e8
    style B fill:#fff3e0
    style C fill:#e3f2fd
```

### Paso 3: Configurar Parámetros y Ejecutar
1. Ajusta los parámetros δ (umbral) y λ (penalización)
2. Haz clic en "Ejecutar Optimización"
3. Revisa los resultados en la matriz de asignación

---

## 🎛️ **Interfaz de Usuario Detallada**

### Panel de Gestión de Datos

```mermaid
graph LR
    subgraph "📊 Panel Principal"
        A[Grupos Académicos<br/>📋 Lista de 5 grupos<br/>✏️ Editable<br/>👁️ Visualización]
        
        B[Aulas Disponibles<br/>🏢 16 aulas por pisos<br/>📏 Capacidades<br/>🏷️ Identificadores]
        
        C[Horarios Diarios<br/>⏰ 6 bloques<br/>🕐 Horarios específicos<br/>⏱️ Duración 2h 15min]
    end
    
    subgraph "⚙️ Configuración"
        D[Parámetro δ<br/>🎯 Umbral tolerancia<br/>📊 Rango: 10%-50%<br/>💡 Recomendado: 20%]
        
        E[Parámetro λ<br/>⚠️ Factor penalización<br/>📈 Rango: 0.01-1.0<br/>💡 Recomendado: 0.10]
    end
    
    A --> F[🚀 Ejecutar Optimización]
    B --> F
    C --> F
    D --> F
    E --> F
    
    style A fill:#e8f5e8
    style B fill:#fff3e0
    style C fill:#e3f2fd
    style D fill:#ffecb3
    style E fill:#f3e5f5
    style F fill:#ffcdd2
```

---

## 📋 **Gestión de Grupos Académicos**

### Visualización de Grupos

| Grupo | Materia | Estudiantes | Estado | Acciones |
|-------|---------|-------------|--------|----------|
| G1 | Cálculo I | 35 | ✅ Válido | 👁️ Ver / ✏️ Editar |
| G2 | Física I | 50 | ✅ Válido | 👁️ Ver / ✏️ Editar |
| G3 | Introducción a la Ingeniería | 120 | ⚠️ Crítico | 👁️ Ver / ✏️ Editar |
| G4 | Redes I | 40 | ✅ Válido | 👁️ Ver / ✏️ Editar |
| G5 | Álgebra Lineal | 60 | ✅ Válido | 👁️ Ver / ✏️ Editar |

### Flujo de Edición de Grupos

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant UI as 🖥️ Interfaz
    participant V as ✅ Validador
    participant S as 💾 Sistema
    
    U->>UI: Clic en "Editar Grupo"
    UI->>U: Mostrar formulario de edición
    
    U->>UI: Modificar datos (nombre, estudiantes)
    UI->>V: Validar nueva información
    
    alt ✅ Datos válidos
        V->>S: Actualizar grupo
        S->>UI: Confirmación exitosa
        UI->>U: "Grupo actualizado correctamente"
    else ❌ Datos inválidos
        V->>UI: Lista de errores
        UI->>U: "Error: [detalles específicos]"
    end
    
    Note over U,S: El grupo G3 requiere validación especial<br/>debido a su tamaño (120 estudiantes)
```

---

## 🏢 **Gestión de Aulas**

### Distribución por Pisos

```mermaid
graph TD
    subgraph "🏢 Edificio Universitario - 16 Aulas Total"
        
        subgraph "🔝 Piso 5 - Aulas Grandes"
            P5A[Aula 15<br/>120 estudiantes<br/>🎓 Auditorios]
            P5B[Aula 16<br/>120 estudiantes<br/>🎓 Auditorios]
        end
        
        subgraph "📚 Pisos 3-4 - Aulas Medianas"
            P34A[Aulas 9-12<br/>60 estudiantes c/u<br/>📖 Clases regulares]
            P34B[Aulas 13-14<br/>40 estudiantes c/u<br/>📝 Seminarios]
        end
        
        subgraph "🏛️ Pisos 1-2 - Aulas Mixtas"
            P12A[Aulas 1-4<br/>45 estudiantes c/u<br/>📚 Clases estándar]
            P12B[Aulas 5-6<br/>60 estudiantes c/u<br/>📊 Clases amplias]
            P12C[Aulas 7-8<br/>30 estudiantes c/u<br/>💬 Tutorías]
        end
    end
    
    style P5A fill:#ff9800
    style P5B fill:#ff9800
    style P34A fill:#2196f3
    style P34B fill:#2196f3
    style P12A fill:#4caf50
    style P12B fill:#4caf50
    style P12C fill:#4caf50
```

### Panel de Aulas Interactivo

**Características:**
- **Vista por pisos:** Organización visual clara
- **Códigos de color:** Estado de ocupación en tiempo real
- **Información detallada:** Capacidad, ubicación, características
- **Filtros:** Por capacidad, disponibilidad, piso

---

## ⏰ **Gestión de Horarios**

### Bloques Horarios Diarios

```mermaid
gantt
    title 📅 Bloques Horarios Universitarios
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Mañana
    Bloque 1 :active, b1, 07:00, 09:15
    Bloque 2 :active, b2, 09:15, 11:30
    Bloque 3 :active, b3, 11:30, 13:45
    
    section Tarde
    Bloque 4 :active, b4, 14:00, 16:15
    Bloque 5 :active, b5, 16:15, 18:30
    Bloque 6 :active, b6, 18:30, 20:45
```

### Configuración de Horarios

- ✅ **Duración fija:** 2 horas 15 minutos por bloque
- ✅ **Sin solapamiento:** Bloques discretos sin conflictos
- ✅ **Pausa almuerzo:** 15 minutos entre Bloque 3 y 4
- ✅ **Horario extendido:** Desde 07:00 hasta 20:45

---

## ⚙️ **Configuración de Parámetros**

### Panel de Parámetros MILP

```mermaid
graph LR
    subgraph "🎛️ Configuración Avanzada"
        A[Umbral δ<br/>Tolerancia de Subutilización]
        B[Factor λ<br/>Penalización por Desperdicio]
        C[Límite Tiempo<br/>Solver GLPK]
        D[Gap Optimalidad<br/>Precisión Requerida]
    end
    
    subgraph "📊 Valores Recomendados"
        E[δ = 0.20<br/>20% tolerancia<br/>Balance óptimo]
        F[λ = 0.10<br/>Penalización moderada<br/>Eficiencia vs flexibilidad]
        G[300 segundos<br/>Tiempo suficiente<br/>Para problemas complejos]
        H[1%<br/>Alta precisión<br/>Solución confiable]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    
    style A fill:#fff3e0
    style B fill:#fff3e0
    style E fill:#e8f5e8
    style F fill:#e8f5e8
```

### ¿Cómo elegir los parámetros correctos?

**Umbral δ (Delta):**
- **δ = 0.15 (15%):** Más estricto, menos desperdicio, puede reducir asignaciones
- **δ = 0.20 (20%):** ✅ **Recomendado** - Balance óptimo
- **δ = 0.25 (25%):** Más tolerante, más asignaciones, mayor desperdicio

**Factor λ (Lambda):**
- **λ = 0.05:** Penalización suave, prioriza asignaciones
- **λ = 0.10:** ✅ **Recomendado** - Balance entre eficiencia y asignación
- **λ = 0.15:** Penalización fuerte, prioriza eficiencia

---

## 🚀 **Proceso de Optimización**

### Flujo de Ejecución

```mermaid
flowchart TD
    A[🎯 Iniciar Optimización] --> B{📋 Validar Datos}
    
    B -->|✅ Válidos| C[🔧 Construir Modelo MILP]
    B -->|❌ Errores| B1[⚠️ Mostrar Errores<br/>Corregir Datos]
    B1 --> B
    
    C --> D[⚙️ Configurar Solver GLPK]
    D --> E[🧮 Ejecutar Branch-and-Bound]
    
    E --> F{🎯 ¿Solución Encontrada?}
    
    F -->|✅ OPTIMAL| G[📊 Generar Matriz Asignación]
    F -->|⚠️ FEASIBLE| H[📈 Mejor Solución Parcial]
    F -->|❌ INFEASIBLE| I[🚫 No Hay Solución Válida]
    
    G --> J[📋 Calcular Métricas]
    H --> J
    I --> K[💡 Sugerencias de Ajuste]
    
    J --> L[🎉 Mostrar Resultados]
    K --> M[🔄 Ajustar Parámetros]
    M --> A
    
    style A fill:#4caf50
    style G fill:#2196f3
    style J fill:#ff9800
    style L fill:#9c27b0
    style I fill:#f44336
```

### Estados del Solver

**🎯 OPTIMAL:** 
- Solución matemáticamente óptima encontrada
- Todos los grupos asignados con máxima eficiencia
- Gap de optimalidad = 0%

**⚠️ FEASIBLE:**
- Solución válida pero no necesariamente óptima
- Todos los grupos asignados
- Gap de optimalidad > 0% pero aceptable

**❌ INFEASIBLE:**
- No existe solución que satisfaga todas las restricciones
- Generalmente por Grupo 3 (120 estudiantes) sin aulas disponibles
- Requiere ajuste de datos o parámetros

---

## 📊 **Interpretación de Resultados**

### Matriz de Asignación

```mermaid
graph TB
    subgraph "📋 Resultados de Optimización"
        A[Grupo 1: Cálculo I<br/>35 estudiantes<br/>➡️ Aula 5 - Horario 1<br/>💺 60 cap → 58.3% uso]
        
        B[Grupo 2: Física I<br/>50 estudiantes<br/>➡️ Aula 9 - Horario 2<br/>💺 60 cap → 83.3% uso]
        
        C[Grupo 3: Intro Ingeniería<br/>120 estudiantes<br/>➡️ Aula 15 - Horario 3<br/>💺 120 cap → 100% uso]
        
        D[Grupo 4: Redes I<br/>40 estudiantes<br/>➡️ Aula 13 - Horario 4<br/>💺 40 cap → 100% uso]
        
        E[Grupo 5: Álgebra Lineal<br/>60 estudiantes<br/>➡️ Aula 10 - Horario 5<br/>💺 60 cap → 100% uso]
    end
    
    style A fill:#e8f5e8
    style B fill:#fff3e0
    style C fill:#ffcdd2
    style D fill:#e3f2fd
    style E fill:#f3e5f5
```

### Métricas de Eficiencia

**Indicadores Principales:**

```mermaid
pie title 📊 Distribución de Estudiantes Asignados
    "Grupo 1 - Cálculo I" : 35
    "Grupo 2 - Física I" : 50
    "Grupo 3 - Intro Ing" : 120
    "Grupo 4 - Redes I" : 40
    "Grupo 5 - Álgebra" : 60
```

**Análisis de Ocupación:**

| Métrica | Valor | Interpretación |
|---------|-------|----------------|
| 📈 **Grupos Asignados** | 5/5 (100%) | ✅ Factibilidad completa |
| 💺 **Ocupación Promedio** | 88.3% | ✅ Muy eficiente |
| ⚠️ **Penalización Total** | 4.2 puntos | ✅ Desperdicio mínimo |
| ⏱️ **Tiempo Resolución** | 2.8 segundos | ✅ Muy rápido |
| 🎯 **Gap Optimalidad** | 0% | ✅ Solución óptima |

---

## 🎨 **Visualización de Resultados**

### Dashboard Principal

```mermaid
graph TB
    subgraph "📊 Dashboard de Resultados"
        A[🎯 Resumen Ejecutivo<br/>• 5/5 grupos asignados<br/>• 88.3% ocupación promedio<br/>• Solución OPTIMAL]
        
        B[📋 Tabla de Asignaciones<br/>• Grupo → Aula → Horario<br/>• Ocupación por aula<br/>• Estado de cada asignación]
        
        C[📈 Gráficos de Eficiencia<br/>• Distribución por pisos<br/>• Ocupación por horarios<br/>• Análisis de desperdicio]
        
        D[⚠️ Alertas y Sugerencias<br/>• Aulas subutilizadas<br/>• Recomendaciones de mejora<br/>• Análisis de sensibilidad]
    end
    
    style A fill:#4caf50
    style B fill:#2196f3
    style C fill:#ff9800
    style D fill:#9c27b0
```

### Análisis por Pisos

```mermaid
graph LR
    subgraph "🏢 Ocupación por Pisos"
        A[Piso 5<br/>🎓 Aula 15: 100%<br/>🎓 Aula 16: 0%<br/>📊 Promedio: 50%]
        
        B[Pisos 3-4<br/>📚 Aula 9: 83.3%<br/>📚 Aula 10: 100%<br/>📝 Aula 13: 100%<br/>📊 Promedio: 94.4%]
        
        C[Pisos 1-2<br/>📖 Aula 5: 58.3%<br/>📖 Otras: 0%<br/>📊 Promedio: 7.3%]
    end
    
    style A fill:#ff9800
    style B fill:#4caf50
    style C fill:#ffeb3b
```

---

## 🛠️ **Resolución de Problemas**

### Problemas Comunes y Soluciones

```mermaid
flowchart TD
    A[❌ Problema Detectado] --> B{🔍 Tipo de Error}
    
    B -->|Datos| C[📋 Error de Datos]
    B -->|Optimización| D[⚙️ Error de Solver]
    B -->|Resultados| E[📊 Error de Visualización]
    
    C --> C1[✅ Verificar grupos válidos<br/>✅ Confirmar capacidades aulas<br/>✅ Validar horarios]
    
    D --> D1[⚠️ Ajustar parámetros δ y λ<br/>⚠️ Incrementar tiempo límite<br/>⚠️ Revisar factibilidad]
    
    E --> E1[🔄 Refrescar navegador<br/>🔄 Limpiar caché<br/>🔄 Verificar conexión]
    
    C1 --> F[🔄 Intentar Nuevamente]
    D1 --> F
    E1 --> F
    
    style A fill:#f44336
    style C1 fill:#ff9800
    style D1 fill:#ff9800
    style E1 fill:#ff9800
    style F fill:#4caf50
```

### Casos Específicos

**🚫 "Grupo 3 no se puede asignar"**
- **Causa:** Solo existen 2 aulas de 120 estudiantes en piso 5
- **Solución:** Verificar que las aulas 15 y 16 estén disponibles
- **Alternativa:** Considerar dividir el grupo en subgrupos

**⚠️ "Ocupación muy baja"**
- **Causa:** Factor λ muy bajo, prioriza asignaciones sobre eficiencia
- **Solución:** Incrementar λ de 0.10 a 0.15-0.20
- **Resultado:** Mayor eficiencia en el uso del espacio

**⏱️ "Tiempo de resolución excesivo"**
- **Causa:** Parámetros muy restrictivos o problema complejo
- **Solución:** Incrementar tolerancia δ o reducir precisión del gap
- **Alternativa:** Usar configuración rápida predefinida

---

## 📱 **Consejos de Uso**

### Mejores Prácticas

**🎯 Configuración Inicial:**
1. Usar valores predeterminados (δ=0.20, λ=0.10)
2. Ejecutar optimización con datos base
3. Analizar resultados antes de ajustar

**⚙️ Ajuste de Parámetros:**
1. Modificar solo un parámetro a la vez
2. Observar impacto en métricas antes del siguiente cambio
3. Documentar configuraciones exitosas

**📊 Análisis de Resultados:**
1. Revisar siempre la tabla de asignaciones completa
2. Prestar atención especial al Grupo 3 (crítico)
3. Validar que todos los horarios sean factibles

### Configuraciones Recomendadas por Escenario

```mermaid
graph LR
    subgraph "📋 Escenarios Típicos"
        A[🎯 Máxima Eficiencia<br/>δ = 0.15, λ = 0.20<br/>Prioriza aprovechamiento]
        
        B[⚖️ Balance Estándar<br/>δ = 0.20, λ = 0.10<br/>Uso general recomendado]
        
        C[🤝 Máxima Flexibilidad<br/>δ = 0.25, λ = 0.05<br/>Prioriza asignaciones]
        
        D[🚀 Resolución Rápida<br/>Gap = 5%, Tiempo = 60s<br/>Para pruebas rápidas]
    end
    
    style A fill:#ff5722
    style B fill:#4caf50
    style C fill:#2196f3
    style D fill:#ff9800
```

---

## 🔧 **Configuración Avanzada**

### Parámetros del Solver GLPK

**Configuración Estándar:**
```
- Método: Branch-and-Bound
- Gap de optimalidad: 1%
- Tiempo límite: 300 segundos
- Preprocesamiento: Activado
- Cortes: Activados
```

**Configuración Rápida:**
```
- Gap de optimalidad: 5%
- Tiempo límite: 60 segundos
- Heurísticas: Activadas
```

**Configuración Precisa:**
```
- Gap de optimalidad: 0.1%
- Tiempo límite: 600 segundos
- Exploración exhaustiva: Activada
```

### Exportación de Resultados

**Formatos Disponibles:**
- 📄 **PDF:** Reporte ejecutivo con gráficos
- 📊 **Excel:** Datos detallados y análisis
- 📋 **CSV:** Matriz de asignación simple
- 📈 **JSON:** Datos para integración con otros sistemas

---

## 💡 **Casos de Uso Prácticos**

### Planificación Semestral

**Escenario:** Inicio de semestre universitario
1. Cargar grupos y materias del nuevo período
2. Verificar disponibilidad de aulas después de mantenimiento
3. Ejecutar optimización con parámetros estándar
4. Generar horarios oficiales para publicación

### Ajustes de Medio Semestre

**Escenario:** Cambios en inscripciones de estudiantes
1. Actualizar número de estudiantes por grupo
2. Re-ejecutar optimización conservando asignaciones exitosas
3. Identificar cambios mínimos necesarios
4. Comunicar ajustes a estudiantes y profesores

### Análisis de Capacidad

**Escenario:** Planificación de nuevas aulas
1. Simular diferentes configuraciones de capacidades
2. Analizar impacto en eficiencia general
3. Identificar cuellos de botella (como Grupo 3)
4. Recomendar inversiones en infraestructura

---

## 📞 **Soporte y Contacto**

### Recursos de Ayuda

**🔗 Enlaces Útiles:**
- 📘 Documentación técnica completa
- 🎓 Tutorial interactivo paso a paso
- 📊 Ejemplos de casos reales
- 🛠️ Guía de resolución de problemas

**💬 Canales de Soporte:**
- 📧 Email técnico: soporte@universidad.edu
- 💬 Chat en vivo: Disponible 8:00-18:00
- 📞 Teléfono: +1-234-567-8900
- 🎫 Sistema de tickets: portal.universidad.edu

---

## 📝 **Glosario de Términos**

| Término | Definición |
|---------|-------------|
| **MILP** | Programación Lineal Entera Mixta - Método de optimización |
| **δ (Delta)** | Umbral de tolerancia para subutilización de aulas |
| **λ (Lambda)** | Factor de penalización por espacios no utilizados |
| **Gap** | Diferencia porcentual entre solución actual y óptimo teórico |
| **Branch-and-Bound** | Algoritmo para resolver problemas de optimización entera |
| **GLPK** | GNU Linear Programming Kit - Solver de optimización |
| **Factibilidad** | Capacidad de encontrar una solución válida |

---

*🎓 Sistema de Optimización de Aulas MILP - Universidad*  
*📅 Guía de Usuario v1.0 - Junio 2025*  
*🔧 Para soporte técnico contactar: soporte@universidad.edu*
