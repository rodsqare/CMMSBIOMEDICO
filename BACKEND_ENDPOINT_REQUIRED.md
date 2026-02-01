# Endpoint Requerido para Restricción de Eliminación de Equipos

## Descripción

Para que la funcionalidad de restricción de eliminación de equipos funcione correctamente, el backend Laravel debe exponer un endpoint que verifique si un equipo tiene mantenimientos u órdenes de trabajo asociadas.

## Endpoint Requerido

```
GET /api/equipos/{id}/associations
```

## Parámetros

| Parámetro | Tipo   | Ubicación | Descripción                      |
|-----------|--------|-----------|----------------------------------|
| id        | integer| URL       | ID del equipo a verificar        |

## Respuesta Exitosa (200 OK)

```json
{
  "data": {
    "mantenimientos_count": 2,
    "ordenes_trabajo_count": 1
  }
}
```

Alternativamente:

```json
{
  "mantenimientos_count": 2,
  "ordenes_trabajo_count": 1
}
```

Ambos formatos son soportados.

## Ejemplos de Respuesta

### Equipo sin asociaciones
```json
{
  "data": {
    "mantenimientos_count": 0,
    "ordenes_trabajo_count": 0
  }
}
```

### Equipo con mantenimientos
```json
{
  "data": {
    "mantenimientos_count": 5,
    "ordenes_trabajo_count": 0
  }
}
```

### Equipo con órdenes de trabajo
```json
{
  "data": {
    "mantenimientos_count": 0,
    "ordenes_trabajo_count": 3
  }
}
```

### Equipo con ambas asociaciones
```json
{
  "data": {
    "mantenimientos_count": 2,
    "ordenes_trabajo_count": 4
  }
}
```

## Código del Controlador (Laravel)

### En el controlador de equipos (EquipoController.php):

```php
/**
 * Get equipment associations count
 * 
 * @param int $id
 * @return \Illuminate\Http\JsonResponse
 */
public function getAssociations($id)
{
    $equipo = Equipo::findOrFail($id);
    
    $mantenimientosCount = $equipo->mantenimientos()->count();
    $ordenesCount = $equipo->ordenesTrabajo()->count();
    
    return response()->json([
        'data' => [
            'mantenimientos_count' => $mantenimientosCount,
            'ordenes_trabajo_count' => $ordenesCount
        ]
    ]);
}
```

### En las rutas (routes/api.php):

```php
Route::get('equipos/{id}/associations', [EquipoController::class, 'getAssociations']);
```

O con el grupo existente de equipos:

```php
Route::resource('equipos', EquipoController::class);
Route::get('equipos/{id}/associations', [EquipoController::class, 'getAssociations'])->name('equipos.associations');
```

### Asegúrate de que existan las relaciones en el modelo Equipo:

```php
// En Equipo.php model

public function mantenimientos()
{
    return $this->hasMany(Mantenimiento::class, 'id_equipo');
}

public function ordenesTrabajo()
{
    return $this->hasMany(OrdenTrabajo::class, 'id_equipo');
}
```

## Manejo de Errores

### Si el equipo no existe (404)
```json
{
  "message": "No se encontró el equipo"
}
```

### Si ocurre un error interno (500)
```json
{
  "message": "Error al obtener las asociaciones del equipo"
}
```

## Notas Importantes

1. **Autenticación**: El endpoint debe estar protegido con autenticación (middleware auth)
2. **CORS**: Asegurar que CORS esté configurado correctamente si el frontend está en un dominio diferente
3. **Validación**: Validar que el ID sea un número entero válido
4. **Performance**: Se recomienda usar `count()` o `withCount()` en lugar de cargar todas las relaciones

## Prueba Manual

```bash
# Con cURL
curl -X GET "http://localhost:8000/api/equipos/1/associations" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

## Fallback

Si este endpoint no existe o falla, el frontend automáticamente:
- Permitirá la eliminación del equipo
- Mostrará logs en consola indicando el error
- No interrumpirá la experiencia del usuario

## Timeline

1. Implementar este endpoint en el backend
2. Testear con cURL o Postman
3. El frontend automáticamente se beneficiará de la restricción
4. Los botones se deshabilitarán correctamente cuando el equipo tenga asociaciones

## Integración Sin Cambios en Frontend

El frontend ya está listo. Solo necesita que el endpoint esté disponible. No se requieren cambios adicionales en el código React/Next.js.
