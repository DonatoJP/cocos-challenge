## Consideraciones - Notas
A continuacion, algunas consideraciones que tomé en mi solucion:

- Los montos y cantidades (tanto de valores en pesos como en cantidad de acciones) pueden ser representados con números que no corren riesgo de tener problemas con representación numerica. No sera necesario utilizar representaciones en String ni BigNumber para precios, cantidades y valores. Tampoco utilizo librerias de manejo de números con precisión (por simplicidad de la solución).
- Como entrada para crear las ordenes se utilizara el ticker de los instrumentos para identificarlos. El `userId` saldrá de algun proceso de autenticación previo (no cubierto en esta solucion).
- Al no cubrir el proceso de autenticacion de usuarios, cualquier orden puede ser cancelada sin autenticacion ni validacion de _ownership_ de la misma
- No existen las ordenes `LIMIT` que sean `CASH_IN` o `CASH_OUT`
- Al momento de crear ordenes: 
  - No pueden configurarse `amount` y `size` al mismo tiempo (mutuamente excluyentes)
  - Al enviar `amount` (monto en pesos) se determinara `size` siempre como `floor(amount / price)`. Es decir, para la "compra" se compraran menos acciones de las que alcanzarian (no se pueden comprar fracciones de acciones), y para la "venta" se venderá lo máximo que se pueda antes de superar `amount` (no se pueden vender fracciones de acciones).
  - Si al enviar `amount` al determinar el `size` el mismo da cero, la orden se creará con estado `REJECTED` (no se pueden comprar ni vender 0 acciones)
- Al momento de calcular el portfolio:
  - Si el usuario no existe en la base de datos (i.e no existe el ID que se usa de entrada) el portfolio a devolver estará en cero (tanto disponible como en los activos)
  - Las ordenes `CASH_IN` y `CASH_OUT` solo afectan al balance en pesos disponible a utilizar
  - Las ordenes de tipo `LIMIT` en estado `NEW` **solo afectan al balance en pesos disponible a utilizar**. Al no estar ejecutadas y el usuario no disponer de esas acciones aún en su cartera, no afectará al cálculo del valor monetario de la posición ni del rendimiento total
  - Las ordenes de tipo `MARKET` en estado `FILLED` **afectarán al valor monetario de la posición y al rendimiento total de la cartera del usuario**
  - A la hora de calcular el rendimiento/PnL, se utilizará los valores del `marketdata` más recientes. No se comparará las fechas de creación de `marketdata` y `order` para buscar el `marketdata` que corresponda a la fecha de alta de la orden. Como resultado, el portfolio siempre mostrará el rendimiento comparado con el cierre del día anterior, aún si esa accion en particular no se hubiera comprado el día anterior
  - **Disclaimer!**: en la base de datos provista como ejemplo, el usuario 1 tiene una orden `LIMIT BUY NEW` de 60 `BMA` (aun pendiente), una `LIMIT BUY FILLED` de 20 `BMA` y otra `MARKET SELL FILLED` de 30 `BMA`. Dado este contexto y las consideraciones mencionadas, el balance final de este activo es de -10 `BMA` para el usuario 1, balance teoricamente ilógico en un contexto real.

### Propuestas de mejora

De disponer más tiempo, algunas propuestas de mejora de mi parte a esta solución podrian ser:

1. **Implementar un _message broker_ con RabbitMQ o BullMQ**, reemplazando el actual que funciona por medio de eventos
2. **Implementar un cache manager montado en una solucion mas robusta como Redis**, para reemplazar el _in-memory_ cache actual
3. **Agregar más llamadas a logs** (e.g: para auditoria, en llamadas a métodos de servicios puntuales)
4. **Agregar trazabilidad, metricas y observabilidad de errores** (e.g: Sentry)
5. **Agregar mas tests automatizados**, en los modulos de `market` y `users` que quedaron pendientes
6. **Implementar o integrar una solución de autenticacion de usuarios**, para limitar el acceso a endpoints y reconocer acciones de los usuarios
7. **Implementar o integrar una solucion de orderbook y motor de búsqueda**, para simular el mercado