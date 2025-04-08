# API Docs
Importar la _collection_ de Postman con el archivo `Cocos Challenge.postman_collection.json` en este mismo directorio.

## Crear ordenes

```
POST /v1/orders
```

Respuestas:
- 200 OK: Orden creada
- 400 Bad Request: Input invalido

Para crear ordenes `LIMIT` (es obligatorio enviar el precio):

```json
{
    "userid": 1,
    "instrumentTicker": "DYCA",
    "side": "BUY",
    "type": "LIMIT",
    "price": 250,
    // "amount": 1250,
    "size": 5
}
```

Para crear ordenes `MARKET`:

```json
{
    "userid": 1,
    "instrumentTicker": "DYCA",
    "side": "BUY",
    "type": "MARKET",
    // "amount": 1250,
    "size": 5
}
```

Para ordenes `CASH_IN` y `CASH_OUT`:

```json
{
    "userid": 2,
    "instrumentTicker": "ARS",
    "side": "CASH_IN",
    "type": "MARKET",
    "price": 1,
    "size": 1000000
}
```

## Cancelar ordenes

```
POST /v1/orders/:idOrden/cancel
```

Respuesta:
- 200 OK: Orden cancelada con exito
- 400 Bad Request: La orden no puede ser cancelada o no existe

## Obtener portfolio

```
GET /v1/users/:idUsuario
```

Respuesta:
- `userid`: ID del usuario en cuestión
- `available`: Monto (en pesos) disponible para utilizar en futuras ordenes
- `assets`:
  - `instrumentid`: ID del activo
  - `size`: cantidad del activo en el portfolio del usuario
  - `total`: Monto total (en pesos) del valor de la cartera de ese activo
  - `performance`: rendimiento (%)
  - `pnl`: Monto (en pesos) de ganancia o perdida con respecto a la jornada anterior

## Buscar activos

```
GET /v1/market/instruments
```

Búsqueda paginada de activos. Parametros de búsqueda (_query params_):
- `name`: filtro por nombre (aplica expresión regular) (opcional)
- `ticker`: filtro por ticker (aplica expresión regular) (opcional)
- `page`: número de página a obtener (default 0) (opcional)
- `limit`: cantidad máxima de datos por página (default 10) (opcional)

Respuesta:
- `data`: activos que hacen _match_ con la búsqueda establecida
- `total`: total de activos en la base de datos