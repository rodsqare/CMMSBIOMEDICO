# Diagrama de Flujo - Sistema de Restricción de Eliminación de Equipos

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  app/page.tsx                                                    │
│  ├─ state: equipmentAssociations                                │
│  ├─ function: checkEquipmentCanBeDeleted()                      │
│  ├─ useEffect: verifica al cargar equipos                       │
│  ├─ useEffect: verifica al abrir detalles                       │
│  └─ UI: Botones deshabilitados cuando hay asociaciones          │
│                                                                   │
│  lib/api/equipos.ts                                              │
│  └─ function: checkEquipoAssociations(id)                        │
│     └─ Llamada: GET /api/equipos/{id}/associations             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
           ↕ HTTP (REST API)
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Laravel PHP)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  routes/api.php                                                   │
│  └─ Route: GET /api/equipos/{equipo}/associations              │
│     └─ Controller: EquiposController@getAssociations            │
│                                                                   │
│  EquiposController.php                                           │
│  └─ Method: getAssociations(Equipo $equipo)                    │
│     ├─ Count: $equipo->mantenimientosPreventivos()             │
│     ├─ Count: $equipo->ordenesTrabajo()                        │
│     └─ Response: JSON con conteos                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
           ↓ Eloquent ORM
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (MySQL)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  equipos                  mantenimientos_preventivos             │
│  ├─ id_equipo ◄────┐     ├─ id                                  │
│  ├─ nombre_equipo  │     ├─ id_equipo (FK) ──┘                 │
│  ├─ ...            │     └─ ...                                  │
│                    │                                              │
│                    │     ordenes_trabajo                         │
│                    │     ├─ id                                   │
│                    └────►├─ id_equipo (FK)                      │
│                          └─ ...                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Flujo de Ejecución - Carga de Equipos

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario navega a "Gestión de Equipos"                        │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend: useEffect carga lista de equipos (loadEquipment)   │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Frontend: setEquipment(data) actualiza state                 │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. useEffect: activeSection === "equipos" → checkAll...()       │
│    Loop: for (const equipo of equipment)                        │
│           → checkEquipmentCanBeDeleted(equipo.id)               │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Frontend: await checkEquipoAssociations(id)                  │
│    → GET /api/equipos/{id}/associations                         │
└────────────────────────┬────────────────────────────────────────┘
                         ↓ HTTP Request
┌─────────────────────────────────────────────────────────────────┐
│ 6. Backend: EquiposController@getAssociations recibe request   │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Backend: Model Binding inyecta Equipo automáticamente        │
│    Si no existe → genera 404                                    │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Backend: Ejecuta queries                                      │
│    - COUNT mantenimientos_preventivos WHERE id_equipo = {id}   │
│    - COUNT ordenes_trabajo WHERE id_equipo = {id}              │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. Backend: Devuelve JSON                                        │
│    {                                                             │
│      "data": {                                                   │
│        "mantenimientos_count": 0,                               │
│        "ordenes_trabajo_count": 0,                              │
│        "can_delete": true                                        │
│      }                                                            │
│    }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         ↓ HTTP Response
┌─────────────────────────────────────────────────────────────────┐
│ 10. Frontend: Recibe respuesta                                   │
│     Almacena en state: equipmentAssociations[id] = {...}        │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. Frontend: Re-render tabla de equipos                         │
│     Para cada botón eliminar:                                    │
│     - Lee: equipmentAssociations[equipo.id]                     │
│     - Si hasMaintenances || hasWorkOrders                       │
│       → disabled={true}                                          │
│       → Tooltip: "No se puede eliminar..."                      │
│     - Si no:                                                     │
│       → disabled={false}                                         │
│       → Tooltip: "Eliminar"                                      │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Flujo de Ejecución - Abrir Detalles

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario hace click en equipo (Ver Detalles)                  │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend: setShowEquipmentDetails(true)                      │
│              setSelectedEquipment(equipo)                        │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. useEffect trigger: [showEquipmentDetails, selectedEquipment] │
│    if (!equipmentAssociations[selectedEquipment.id])            │
│       → checkEquipmentCanBeDeleted(id)                          │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
│ 4-10. (Mismo flujo que antes)
│       GET /api/equipos/{id}/associations
│       Backend valida y devuelve conteos
│       Frontend almacena en state
│
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. Frontend: Abre diálogo con datos del equipo                 │
│     Botón eliminar:                                              │
│     disabled={                                                   │
│       equipmentAssociations[selectedEquipment?.id]              │
│         ?.hasMaintenances ||                                     │
│       equipmentAssociations[selectedEquipment?.id]              │
│         ?.hasWorkOrders                                          │
│     }                                                             │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Estados del Botón Eliminar

```
┌─────────────────────────────────────────────────────────────────┐
│ ESTADO 1: Equipo sin asociaciones (can_delete = true)          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐                                                │
│  │    Eliminar  │  ← Botón normal (rojo, clickeable)            │
│  └──────────────┘                                                │
│                                                                   │
│  Tooltip: "Eliminar"                                             │
│  Cursor: pointer                                                 │
│  Click: Abre diálogo de confirmación                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ESTADO 2: Equipo con asociaciones (can_delete = false)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐                                                │
│  │    Eliminar  │  ← Botón opaco 50%, no clickeable            │
│  └──────────────┘                                                │
│   (opacidad 0.5)                                                 │
│                                                                   │
│  Tooltip: "No se puede eliminar. Este equipo tiene              │
│           mantenimientos u órdenes de trabajo asociadas."       │
│  Cursor: not-allowed                                            │
│  Click: Sin efecto (disabled)                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Decisión - ¿Se puede eliminar?

```
                    ┌─────────────┐
                    │ GET /api/   │
                    │ equipos/{id}│
                    │ associations│
                    └──────┬──────┘
                           ↓
        ┌──────────────────────────────────────┐
        │   ¿mantenimientos_count > 0?         │
        └──────┬─────────────────────┬─────────┘
             SÍ │                     │ NO
               ↓                      ↓
          ┌─────────┐         ┌─────────────────┐
          │ NO (❌) │         │ ¿ordenes_       │
          │ ELIMINAR│         │ trabajo_count>0?│
          └─────────┘         └────┬────────┬───┘
                                 SÍ │        │ NO
                                   ↓        ↓
                              ┌────────┐ ┌──────────┐
                              │NO (❌) │ │ SÍ (✅)  │
                              │ELIMINAR│ │ ELIMINAR │
                              └────────┘ └──────────┘
```

## 6. Diagrama de Relaciones

```
                    ┌──────────────┐
                    │   Equipos    │
                    │              │
                    │ • id_equipo  │
                    │ • nombre     │
                    │ • estado     │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ↓               ↓               ↓
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │Mantenimientos│ │ Órdenes de   │ │ Documentos  │
    │             │ │  Trabajo     │ │             │
    │ • id         │ │ • id         │ │ • id        │
    │ • id_equipo❌ │ │ • id_equipo❌ │ │ • equipo_id❌│
    │ • fecha      │ │ • estado     │ │ • nombre    │
    │ • descripción│ │ • técnico    │ │ • archivo   │
    └──────────────┘ └──────────────┘ └──────────────┘

    ❌ = Clave foránea (Foreign Key)
```

## 7. Cache del Frontend

```
State: equipmentAssociations

Estructura:
{
  1: {
    hasMaintenances: false,
    hasWorkOrders: true,
    maintenanceCount: 0,
    workOrderCount: 2
  },
  2: {
    hasMaintenances: true,
    hasWorkOrders: false,
    maintenanceCount: 3,
    workOrderCount: 0
  },
  3: {
    hasMaintenances: true,
    hasWorkOrders: true,
    maintenanceCount: 1,
    workOrderCount: 1
  }
}

Lookup: equipmentAssociations[equipoId]?.hasMaintenances
        → true/false (rápido, sin API call)
```

## 8. Secuencia de Acciones

```
Paso 1                Paso 2                Paso 3
Crear Equipo    Crear Mantenimiento    Intentar Eliminar
    │                    │                      │
    ↓                    ↓                      ↓
Backend: INSERT   Backend: INSERT        Botón: DESHABILITADO
Equipo_1          Mantenimiento           (rojo, opaco)
    │                    │                      │
    ↓                    ↓                      ↓
Equipo_1          Equipo_1                Tooltip:
count_maint = 0   count_maint = 1         "No se puede
count_work = 0    count_work = 0          eliminar"
    │                    │                      │
    ↓                    ↓                      ↓
can_delete: YES    can_delete: NO          can_delete: NO
Botón: ENABLED     Botón: DISABLED         Botón: DISABLED
```

## 9. Validación de Integridad

```
Escenario                              Resultado
─────────────────────────────────────────────────────────────
Equipo sin datos                       ✅ Puede eliminarse
Equipo con 1 mantenimiento             ❌ NO puede eliminarse
Equipo con 1 orden de trabajo          ❌ NO puede eliminarse
Equipo con ambos                       ❌ NO puede eliminarse
Equipo con datos pero sin maint/orden  ✅ Puede eliminarse
```

---

**Generado:** 2026-01-31
**Sistema:** Deshabilitación de Botón de Eliminación de Equipos
