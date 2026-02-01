# Implementación del Endpoint - Verificación de Asociaciones de Equipos

## Resumen
Se ha implementado exitosamente el endpoint que verifica si un equipo tiene mantenimientos u órdenes de trabajo asociadas. Esto permite deshabilitar el botón de eliminar en la interfaz cuando un equipo está siendo utilizado.

## Cambios Realizados

### 1. Controlador - `/backend/app/Http/Controllers/EquiposController.php`

Se agregó el método `getAssociations()` que:
- Recibe un equipo como parámetro (inyección de dependencias de Laravel)
- Cuenta los mantenimientos preventivos asociados
- Cuenta las órdenes de trabajo asociadas
- Devuelve un JSON con los conteos y un flag `can_delete`

```php
/**
 * Obtener asociaciones del equipo (mantenimientos y órdenes de trabajo)
 * Esta endpoint se usa para validar si se puede eliminar un equipo
 */
public function getAssociations(Equipo $equipo): JsonResponse
{
    try {
        // Contar mantenimientos asociados
        $mantenimientosCount = $equipo->mantenimientosPreventivos()->count();
        
        // Contar órdenes de trabajo asociadas
        $ordenesTrabajoCount = $equipo->ordenesTrabajo()->count();
        
        return response()->json([
            'data' => [
                'mantenimientos_count' => $mantenimientosCount,
                'ordenes_trabajo_count' => $ordenesTrabajoCount,
                'can_delete' => $mantenimientosCount === 0 && $ordenesTrabajoCount === 0
            ]
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Error checking equipment associations',
            'message' => $e->getMessage()
        ], 500);
    }
}
```

### 2. Rutas - `/backend/routes/api.php`

Se agregó la ruta:
```php
Route::get('equipos/{equipo}/associations', [EquiposController::class, 'getAssociations']);
```

Esta ruta se coloca ANTES del apiResource para asegurar que Laravel matchee correctamente el path antes de intentar interpretar `associations` como un ID de equipo.

## Endpoint API

### Solicitud
```http
GET /api/equipos/{id}/associations
```

### Respuesta Exitosa (200)
```json
{
  "data": {
    "mantenimientos_count": 2,
    "ordenes_trabajo_count": 1,
    "can_delete": false
  }
}
```

### Respuesta Error (500)
```json
{
  "error": "Error checking equipment associations",
  "message": "Database connection error..."
}
```

## Flujo de Uso

1. **Frontend** (Next.js) carga la lista de equipos
2. Al hacer clic en "Ver detalles" o abrir el diálogo de eliminar
3. **Frontend** llama a `GET /api/equipos/{id}/associations`
4. **Backend** consulta las tablas:
   - `mantenimientos_preventivos` (relación: `mantenimientosPreventivos()`)
   - `ordenes_trabajo` (relación: `ordenesTrabajo()`)
5. **Backend** devuelve los conteos
6. **Frontend** deshabilita el botón si hay asociaciones

## Características de Seguridad

- ✅ Utiliza model binding de Laravel (inyección automática)
- ✅ Respetas las relaciones definidas en el modelo Equipo
- ✅ Manejo de excepciones con try-catch
- ✅ Respuestas JSON consistentes
- ✅ Los conteos son precisos (directos desde la BD)

## Testing Manual

Desde el CLI de Laravel:

```bash
# Obtener asociaciones de un equipo existente
curl -X GET "http://localhost:8000/api/equipos/1/associations"

# Respuesta esperada si el equipo existe
{
  "data": {
    "mantenimientos_count": 0,
    "ordenes_trabajo_count": 0,
    "can_delete": true
  }
}

# Si no existe el equipo (404):
{
  "message": "No query results found for model [App\\Models\\Equipo] with identity [999]."
}
```

## Integración con Frontend

El frontend ya tiene todo configurado en `/lib/api/equipos.ts`:

```typescript
export async function checkEquipoAssociations(id: number) {
  const client = isServer ? serverApiClient : apiClient
  const response = await client.get<{
    data: {
      mantenimientos_count: number
      ordenes_trabajo_count: number
    }
  }>(`/equipos/${id}/associations`)
  
  return {
    hasMaintenances: (data.mantenimientos_count || 0) > 0,
    hasWorkOrders: (data.ordenes_trabajo_count || 0) > 0,
    maintenanceCount: data.mantenimientos_count || 0,
    workOrderCount: data.ordenes_trabajo_count || 0,
  }
}
```

## Próximos Pasos

1. Hacer push de los cambios al repositorio
2. Desplegar en Railway
3. Probar el flujo completo:
   - Crear un equipo sin asociaciones → Botón de eliminar habilitado
   - Crear un mantenimiento para ese equipo → Botón de eliminar deshabilitado
   - Crear una orden de trabajo → Botón sigue deshabilitado
   - Eliminar el mantenimiento y la orden → Botón habilitado nuevamente

## Solución de Problemas

### El botón no se deshabilita
- Verificar que la ruta esté registrada correctamente
- Revisar los logs del backend en Laravel
- Confirmar que las relaciones `mantenimientosPreventivos()` y `ordenesTrabajo()` existan en el modelo Equipo

### Error 404 al llamar el endpoint
- Confirmar que el ID del equipo existe en la BD
- Verificar que el middleware API esté correctamente configurado
- Revisar que no hay conflictos de rutas

### Error 500 en el endpoint
- Revisar los logs de Laravel: `storage/logs/laravel.log`
- Verificar la conexión a la base de datos
- Confirmar que las tablas `mantenimientos_preventivos` y `ordenes_trabajo` existen
