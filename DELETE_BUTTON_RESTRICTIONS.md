# Restricción de Eliminación de Equipos

## Descripción del Cambio

Se ha implementado una funcionalidad que **deshabilita automáticamente el botón de eliminar** en la gestión de equipos cuando un equipo tiene mantenimientos u órdenes de trabajo asociadas.

## Comportamiento

### Antes
- El botón de eliminar estaba disponible en todo momento, permitiendo eliminar equipos incluso si tenían registros asociados.

### Después
- El botón de eliminar se encuentra **habilitado solo cuando**:
  - El equipo fue recientemente agregado y aún no tiene mantenimientos ni órdenes de trabajo
- El botón se encuentra **deshabilitado cuando**:
  - El equipo tiene uno o más mantenimientos programados
  - El equipo tiene una o más órdenes de trabajo generadas
  - Se intenta la eliminación durante una acción (cargando)

## Cambios Técnicos Realizados

### 1. **lib/api/equipos.ts**
Se agregó nueva función:
```typescript
export async function checkEquipoAssociations(id: number)
```
- Verifica si un equipo tiene mantenimientos u órdenes de trabajo asociadas
- Llamada a endpoint: `GET /equipos/{id}/associations`
- Devuelve:
  - `hasMaintenances`: boolean
  - `hasWorkOrders`: boolean
  - `maintenanceCount`: número de mantenimientos
  - `workOrderCount`: número de órdenes

### 2. **app/page.tsx**

#### State agregado:
```typescript
const [equipmentAssociations, setEquipmentAssociations] = useState<
  Record<number, {
    hasMaintenances: boolean
    hasWorkOrders: boolean
    maintenanceCount: number
    workOrderCount: number
  }>
>({})
```

#### Función helper:
```typescript
const checkEquipmentCanBeDeleted = async (equipmentId: number)
```
- Verifica las asociaciones del equipo
- Almacena el resultado en estado
- Retorna `true` si se puede eliminar, `false` si no

#### useEffect agregados:
1. **Verificación al cargar equipos**: Cuando se entra a la sección de equipos, verifica todas las asociaciones
2. **Verificación al abrir detalles**: Cuando se abre el diálogo de detalles de un equipo, verifica sus asociaciones

#### Cambios en el UI:
- **Tabla de equipos (línea ~3100)**:
  - Botón deshabilitado si `equipmentAssociations[equipo.id].hasMaintenances` o `.hasWorkOrders`
  - Tooltip cambia a mensaje informativo cuando está deshabilitado

- **Diálogo de detalles (línea ~3366)**:
  - Botón deshabilitado con la misma lógica
  - Estilos visuales añadidos (opacidad, cursor not-allowed)
  - Atributo `title` muestra razón de deshabilitación

## Flujo de Funcionamiento

```
1. Usuario entra a "Gestión de Equipos"
   ↓
2. Se carga lista de equipos
   ↓
3. Se inicia verificación de asociaciones para cada equipo
   ↓
4. Por cada equipo:
   - Se llama checkEquipmentCanBeDeleted()
   - Se ejecuta checkEquipoAssociations()
   - Se almacena resultado en equipmentAssociations state
   ↓
5. UI se renderiza con botones habilitados/deshabilitados según resultado

6. Si usuario abre detalles de equipo:
   - Se verifica nuevamente si no está en cache
   - Se actualiza state
   - UI muestra estado correcto
```

## Importancia del Backend

Para que esto funcione correctamente, el backend debe tener un endpoint:

```
GET /api/equipos/{id}/associations
```

Que devuelva:
```json
{
  "data": {
    "mantenimientos_count": 2,
    "ordenes_trabajo_count": 1
  }
}
```

Si el endpoint no existe o falla, el sistema permite la eliminación como fallback.

## Casos de Uso

### Caso 1: Equipo nuevo sin registros
```
Usuario crea equipo → No hay mantenimientos/órdenes → Botón habilitado ✓
Usuario puede eliminar el equipo
```

### Caso 2: Equipo con mantenimiento programado
```
Usuario programa mantenimiento para equipo → checkEquipoAssociations retorna hasMaintenances: true
Botón se deshabilita → Mensaje: "No se puede eliminar..."
Usuario no puede eliminar el equipo ✗
```

### Caso 3: Equipo con órdenes de trabajo
```
Usuario genera orden de trabajo → checkEquipoAssociations retorna hasWorkOrders: true
Botón se deshabilita → Tooltip muestra restricción
Usuario no puede eliminar el equipo ✗
```

## Mensajes Mostrados al Usuario

- **Tabla**: Tooltip con mensaje de restricción
- **Diálogo**: Atributo title + estilo disabled visible
- **Mensaje completo**: "No se puede eliminar. Este equipo tiene mantenimientos u órdenes de trabajo asociadas."

## Archivos Modificados

1. `/lib/api/equipos.ts` - Función nueva de verificación
2. `/app/page.tsx` - State, funciones helper, useEffects y UI updates

## Ventajas

✓ Previene eliminación accidental de equipos con histórico  
✓ Mantiene integridad referencial de datos  
✓ UX clara con tooltips informativos  
✓ Verificación automática sin acción manual del usuario  
✓ Fallback graceful si API falla  
✓ Performance optimizada con caching de asociaciones
