# OptimizacionAulaIO1

Este proyecto implementa un sistema de optimización para la asignación de aulas y horarios universitarios utilizando un modelo de Programación Lineal Entera Mixta (MILP) resuelto con `glpk.js`. A continuación, se detalla el algoritmo y su implementación.

## Algoritmo de Optimización MILP

El corazón de este sistema es un modelo de optimización matemática que busca la asignación óptima de grupos a aulas y bloques horarios, minimizando el subaprovechamiento de recursos y respetando diversas restricciones. A diferencia de los algoritmos heurísticos, un solver MILP garantiza encontrar la solución óptima si existe.

### 1. Recepción y Preparación de Datos

El sistema recibe los siguientes datos de entrada a través de la interfaz de usuario:

*   **Aulas Disponibles**: Cada aula tiene una capacidad máxima de estudiantes. 
*   **Grupos y Materias**: Cada grupo tiene un número de estudiantes y una materia asociada.
*   **Bloques Horarios**: Definidos por una hora de inicio y fin.
*   **Parámetros de Optimización**: Incluyen un factor de penalización por subutilización y un umbral de tolerancia para el espacio vacío en las aulas.

Estos datos se transforman en el formato requerido por el solver `glpk.js`.

### 2. Modelo de Programación Lineal Entera Mixta (MILP)

El problema se formula como un modelo MILP con los siguientes componentes:

#### Variables de Decisión:

*   `x_ijt`: Variable binaria (0 o 1). Es 1 si el grupo `i` se asigna al aula `j` en el bloque horario `t`, y 0 en caso contrario.
*   `U_ijt`: Variable continua que representa la subutilización (espacio vacío) en el aula `j` si el grupo `i` se asigna en el bloque `t`.

#### Función Objetivo:

El objetivo es maximizar el número total de estudiantes asignados, mientras se penaliza el espacio vacío excesivo en las aulas. La función objetivo se define como:

`Maximizar: Σ (estudiantes_i * x_ijt) - Σ (penalización_factor * U_ijt)`

Donde `estudiantes_i` es el número de estudiantes del grupo `i`, y `penalización_factor` es un coeficiente que ajusta la importancia de minimizar el espacio vacío.

#### Restricciones:

1.  **Asignación Única por Grupo**: Cada grupo debe ser asignado a un máximo de un aula en un bloque horario.
    `Σ_j Σ_t (x_ijt) <= 1` para cada grupo `i`

2.  **Una Asignación por Aula-Horario**: Cada aula en un bloque horario solo puede ser asignada a un grupo.
    `Σ_i (x_ijt) <= 1` para cada aula `j` y bloque horario `t`

3.  **Restricción de Capacidad**: El número de estudiantes de un grupo no puede exceder la capacidad del aula asignada.
    `estudiantes_i * x_ijt <= capacidad_j` para cada grupo `i`, aula `j`, bloque horario `t`

4.  **Cálculo de Subutilización (Penalización)**: Define la variable `U_ijt` como el espacio vacío en el aula `j` si el grupo `i` se asigna en el bloque `t`, considerando un umbral de tolerancia.
    `U_ijt >= (capacidad_j - estudiantes_i) - umbral_tolerancia_j` si `x_ijt = 1`
    `U_ijt >= 0`

### 3. Integración y Resolución con `glpk.js`

1.  **Inicialización**: Se inicializa el solver `glpk.js` de forma asíncrona.
2.  **Construcción del Modelo**: Los datos de entrada se utilizan para construir el objeto del problema MILP en el formato JSON que `glpk.js` espera, definiendo variables, función objetivo y restricciones.
3.  **Resolución**: Se invoca el método `solve` de `glpk.js` para encontrar la solución óptima. Esta operación es asíncrona y se espera su resultado.

### 4. Procesamiento y Visualización de Resultados

Una vez que `glpk.js` ha resuelto el modelo, el sistema procesa el resultado:

*   **Estado de la Solución**: Se verifica si el solver encontró una solución óptima (`GLP_OPT`) o factible (`GLP_FEAS`).
*   **Extracción de Asignaciones**: Se identifican las variables `x_ijt` que tienen un valor de 1 (o muy cercano a 1) para determinar qué grupos fueron asignados a qué aulas y horarios.
*   **Cálculo de Métricas**: Se calculan métricas como el valor total de la función objetivo, el total de estudiantes asignados, la penalización total y la utilización promedio de las aulas.
*   **Actualización de la UI**: Los resultados se muestran en la interfaz de usuario en la sección "Resultados de la Optimización" y en la "Matriz de Asignaciones", proporcionando una visión clara de cómo se realizaron las asignaciones.

