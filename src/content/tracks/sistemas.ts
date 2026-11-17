import { as, ask, code, lesson, match, mc, num, order, predict, tf, track, unit } from '../dsl'

type D = Parameters<typeof as>[1]
const py = <T extends D>(e: T): T => as('python', e)

export default track('sistemas', undefined, [
  unit('sd1', 'Bloques de construcción', 'intermedio', 'Requisitos, estimaciones, escalado, caché y bases de datos: el vocabulario del diseño de sistemas.', [
    lesson('sd-req', 'Requisitos y estimaciones', `
      Todo diseño empieza **aclarando el problema**:

      - **Requisitos funcionales**: qué hace el sistema («acortar una URL», «enviar mensajes»).
      - **Requisitos no funcionales**: disponibilidad, latencia, escala, consistencia, coste, seguridad.
      - **Restricciones y alcance**: qué NO se hará.

      Después, **estimaciones de orden de magnitud**:

      | Dato | Valor útil |
      |---|---|
      | Segundos en un día | ≈ 86 400 (~10⁵) |
      | 1 M de peticiones/día | ≈ 12 por segundo |
      | 100 M/día | ≈ 1 200 por segundo |
      | Pico | ≈ 2–5× la media |
      | Escrituras de 1 KB × 1 M/día | ≈ 1 GB/día ≈ 365 GB/año |

      **Latencias de referencia**: memoria ≈ 100 ns · SSD ≈ 100 µs · mismo datacenter ≈ 0,5 ms · entre continentes ≈ 150 ms.

      **SLA/SLO de disponibilidad**: 99 % ≈ 3,65 días de caída al año · 99,9 % ≈ 8,8 h · 99,99 % ≈ 52 min.
    `, [
      mc('¿Cuál es un requisito NO funcional?', ['«El 99 % de las peticiones debe responder en menos de 200 ms»', '«El usuario puede subir una foto»', '«El usuario puede iniciar sesión»', '«El sistema envía un email al registrarse»'], 'Los no funcionales describen cualidades: latencia, disponibilidad, escala…'),
      num('Si un servicio recibe 100 millones de peticiones al día, ¿cuántas por segundo son aproximadamente, en media? (redondea a la centena)', 1200, '10⁸ / 86 400 ≈ 1 157 ≈ 1 200.', 0.15),
      num('¿Cuántos GB se escriben al día si recibes 10 millones de registros de 1 KB?', 10, '10⁷ × 1 KB = 10 GB.'),
      match('Empareja cada disponibilidad con la caída máxima anual aproximada', [
        ['99 %', '≈ 3,65 días'],
        ['99,9 %', '≈ 8,8 horas'],
        ['99,99 %', '≈ 52 minutos'],
        ['99,999 %', '≈ 5 minutos'],
      ]),
      mc('Estás en una entrevista y te piden «diseña un servicio de chat». ¿Qué haces primero?', ['Aclarar requisitos, alcance y escala con preguntas', 'Dibujar directamente los microservicios', 'Elegir la base de datos', 'Hablar de Kubernetes'], 'Sin requisitos claros es imposible justificar decisiones.'),
      tf('Para estimar la carga de pico conviene multiplicar la media por un factor (p. ej. 2–5×).', true, 'El tráfico no es uniforme: dimensiona para los picos, no para la media.'),
      ask('¿Cuántas horas de caída al año tolera aproximadamente un 99,9 % de disponibilidad? (número entero más cercano)', ['9', '8', '8.8', '8,8'], '0,1 % de 8 760 h = 8,76 h.'),
    ]),

    lesson('sd-scale', 'Escalado y balanceo', `
      - **Escalado vertical**: una máquina más potente. Simple, pero con límite y punto único de fallo.
      - **Escalado horizontal**: más máquinas. Casi sin límite, pero exige que el servicio sea **sin estado** (*stateless*).

      Un **balanceador de carga** reparte las peticiones entre instancias: *round-robin*, menos conexiones, *hash* de IP o de usuario (afinidad). Hace **health checks** y retira las instancias caídas.

      **Sin estado**: el estado (sesiones, datos) vive fuera de la instancia: en una base de datos o en Redis. Así cualquier instancia puede atender cualquier petición y se puede **autoescalar**.

      **Otras palancas**: CDN para estáticos, caché, colas para trabajos pesados, réplicas de lectura, particionado de datos.

      > Antes de escalar, **mide**: a menudo el cuello de botella es una consulta sin índice, no la falta de servidores.
    `, [
      mc('¿Qué requisito debe cumplir una aplicación para escalar horizontalmente con facilidad?', ['Ser sin estado: el estado vive fuera de las instancias', 'Estar escrita en C', 'Usar un único servidor', 'No tener base de datos'], 'Si cada instancia guarda sesiones en memoria, las peticiones del mismo usuario deben ir siempre a la misma.'),
      match('Empareja cada algoritmo de balanceo con su descripción', [
        ['Round-robin', 'Reparte por turnos'],
        ['Menos conexiones', 'Elige la instancia con menos conexiones activas'],
        ['Hash de IP', 'Mismo cliente → misma instancia'],
        ['Ponderado', 'Más tráfico a los servidores más potentes'],
      ]),
      mc('Tu API es lenta por una consulta SQL sin índice. ¿Qué es lo más adecuado?', ['Crear el índice antes de añadir servidores', 'Duplicar los servidores', 'Cambiar de lenguaje', 'Aumentar el timeout'], 'Escalar sin diagnosticar es caro y a veces inútil.'),
      mc('¿Para qué sirven los *health checks* de un balanceador?', ['Detectar instancias caídas y dejar de enviarles tráfico', 'Cifrar las peticiones', 'Contar visitas', 'Elegir el idioma'], 'Permiten tolerar fallos sin intervención humana.'),
      tf('El escalado vertical elimina el punto único de fallo.', false, 'Una sola máquina, por potente que sea, sigue siendo un punto único de fallo.'),
      mc('Un usuario inicia sesión en una instancia y la siguiente petición va a otra. ¿Cómo evitas que pierda la sesión?', ['Guardar las sesiones en un almacén compartido (p. ej. Redis) o usar tokens', 'Pedirle que inicie sesión de nuevo', 'Usar un solo servidor para siempre', 'Desactivar el balanceador'], 'Es la clave de una arquitectura sin estado.'),
    ]),

    lesson('sd-cache', 'Caché', `
      Una **caché** guarda resultados caros de calcular o recuperar para servirlos más rápido.

      **Dónde**: navegador → CDN → caché de aplicación (Redis, Memcached) → caché de la base de datos.

      **Estrategias de escritura**:

      - **Cache-aside** (la más común): la app lee de la caché; si falla (*miss*), lee de la BD y la rellena.
      - **Write-through**: escribe en caché y BD a la vez.
      - **Write-back**: escribe en caché y vuelca a la BD más tarde (rápido, pero riesgo de pérdida).

      **Expulsión**: LRU (menos usado recientemente), LFU, TTL.

      **Problemas clásicos**: **invalidación** («solo hay dos cosas difíciles…»), **datos obsoletos**, **cache stampede** (muchos *misses* simultáneos sobre una clave caliente → bloqueos o *single-flight*), **penetración** (consultas de claves que no existen).

      \`\`\`
      tasa de aciertos (hit ratio) = hits / (hits + misses)
      \`\`\`
    `, [
      py(predict(`from collections import OrderedDict

class LRU:
    def __init__(self, capacidad):
        self.cap, self.d = capacidad, OrderedDict()

    def get(self, k):
        if k not in self.d:
            return None
        self.d.move_to_end(k)
        return self.d[k]

    def put(self, k, v):
        self.d[k] = v
        self.d.move_to_end(k)
        if len(self.d) > self.cap:
            self.d.popitem(last=False)

c = LRU(2)
c.put("a", 1); c.put("b", 2)
c.get("a")
c.put("c", 3)
print(c.get("a"), c.get("b"), c.get("c"))`, '1 None 3', 'Al insertar `c`, se expulsa la clave menos usada recientemente: `b`.')),
      mc('En *cache-aside*, ¿qué hace la aplicación ante un *miss*?', ['Lee de la base de datos y rellena la caché', 'Devuelve un error', 'Borra la caché', 'Escribe solo en la caché'], 'La aplicación controla la caché; la BD sigue siendo la fuente de verdad.'),
      match('Empareja cada estrategia con su descripción', [
        ['Write-through', 'Se escribe a la vez en la caché y en la BD'],
        ['Write-back', 'Se escribe en caché y se vuelca a la BD después'],
        ['Cache-aside', 'La aplicación consulta y rellena la caché'],
        ['TTL', 'Los datos caducan tras un tiempo'],
      ]),
      mc('Un recurso muy popular caduca en la caché y miles de peticiones llegan a la vez a la BD. ¿Cómo se llama el problema?', ['Cache stampede', 'Cache hit', 'Write-through', 'Sharding'], 'Se mitiga con *single-flight*, TTL con *jitter* o refresco anticipado.'),
      num('Una caché tiene 900 aciertos y 100 fallos. ¿Qué porcentaje de aciertos (hit ratio) tiene?', 90, '900 / 1000 = 90 %.'),
      tf('Cachear siempre mejora un sistema sin ningún riesgo.', false, 'Introduce datos obsoletos y complejidad de invalidación: úsala donde la lectura sea cara y el dato tolere cierta antigüedad.'),
    ]),

    lesson('sd-db', 'Bases de datos a escala', `
      **SQL vs. NoSQL**

      - **Relacional** (PostgreSQL, MySQL): esquema, JOINs, **transacciones ACID**. Opción por defecto.
      - **Clave-valor** (Redis, DynamoDB): acceso por clave, muy rápido y escalable.
      - **Documentos** (MongoDB): JSON flexible.
      - **Columnar / series temporales / grafos / buscadores** (Cassandra, InfluxDB, Neo4j, Elasticsearch): casos especializados.

      **Escalar una base de datos**:

      1. **Índices y consultas** bien hechas.
      2. **Réplicas de lectura**: un líder escribe; los seguidores sirven lecturas (con *replication lag*).
      3. **Particionado (*sharding*)**: repartir los datos por una **clave de partición** entre varios nodos. Una mala clave genera **puntos calientes**.
      4. **Hashing consistente**: reduce el reparto de datos al añadir o quitar nodos.

      > Elige la clave de partición según tus consultas más frecuentes y una distribución uniforme.
    `, [
      mc('Tu aplicación tiene muchas más lecturas que escrituras. ¿Qué técnica usas primero para escalar la base de datos?', ['Réplicas de lectura', 'Sharding inmediato', 'Cambiar a NoSQL', 'Eliminar los índices'], 'Es más sencillo que el particionado, aunque hay retraso de replicación.'),
      mc('¿Qué riesgo tiene particionar una tabla de usuarios por la primera letra del apellido?', ['Reparto desigual: algunos nodos reciben mucha más carga (puntos calientes)', 'No se puede consultar', 'Pierde las transacciones siempre', 'Ninguno'], 'Una buena clave reparte uniformemente (p. ej. un hash del ID).'),
      match('Empareja cada tipo de base de datos con su caso típico', [
        ['PostgreSQL', 'Datos relacionales con transacciones'],
        ['Redis', 'Caché y estructuras clave-valor en memoria'],
        ['Elasticsearch', 'Búsqueda de texto completo'],
        ['InfluxDB', 'Series temporales y métricas'],
      ]),
      mc('Escribes un dato en el líder y lo lees inmediatamente de una réplica, pero no aparece. ¿Por qué?', ['Retraso de replicación (*replication lag*)', 'La réplica está rota siempre', 'Los datos se cifraron', 'La BD no admite lecturas'], 'La replicación asíncrona ofrece consistencia eventual en las réplicas.'),
      mc('¿Qué problema reduce el hashing consistente?', ['Mover muchos datos al añadir o quitar nodos', 'La falta de índices', 'Los ataques de inyección', 'La latencia de DNS'], 'Solo se reubica una fracción de claves, no casi todas.'),
      tf('Un sistema relacional no puede escalar nunca más allá de un servidor.', false, 'Con réplicas, particionado y bases distribuidas (CockroachDB, Spanner, Vitess) puede escalar enormemente.'),
    ]),
  ]),

  unit('sd2', 'Sistemas distribuidos', 'avanzado', 'Consistencia, mensajería, APIs y arquitectura: las decisiones que definen un sistema grande.', [
    lesson('sd-cap', 'CAP y consistencia', `
      En un sistema distribuido, las **particiones de red** ocurren. El **teorema CAP** dice que, ante una partición, debes elegir entre:

      - **Consistencia (C)**: todos ven el mismo dato más reciente.
      - **Disponibilidad (A)**: toda petición recibe respuesta (aunque pueda ser antigua).

      Sistemas **CP** (p. ej. ZooKeeper, etcd): prefieren rechazar peticiones antes que dar datos incorrectos. Sistemas **AP** (Cassandra, DynamoDB por defecto): siguen respondiendo y reconcilian después.

      **Modelos de consistencia**:

      - **Fuerte / linealizable**: se comporta como un único nodo.
      - **Eventual**: si no hay más escrituras, las réplicas convergen.
      - **Read-your-writes**, **monótona**: garantías intermedias.

      **Consenso**: **Raft** y **Paxos** logran que un grupo de nodos se ponga de acuerdo con una mayoría (**quórum**: más de la mitad). Con *N = 2f+1* nodos se toleran *f* fallos.
    `, [
      mc('Hay una partición de red entre dos centros de datos. Si el sistema decide seguir respondiendo en ambos lados aceptando divergencias, ¿qué ha elegido?', ['Disponibilidad (AP)', 'Consistencia (CP)', 'Particiones', 'Ninguna'], 'Después tendrá que reconciliar los datos.'),
      match('Empareja cada sistema con su tendencia CAP típica', [
        ['etcd / ZooKeeper', 'CP: consistencia ante todo'],
        ['Cassandra', 'AP: disponibilidad, consistencia eventual'],
        ['Una BD relacional en un solo nodo', 'No es un sistema distribuido: no aplica la partición'],
      ]),
      num('Un clúster Raft tiene 5 nodos. ¿Cuántos fallos puede tolerar manteniendo el quórum?', 2, 'El quórum es 3 de 5 (más de la mitad): se toleran 2 caídas.'),
      mc('¿Qué significa consistencia eventual?', ['Si dejan de llegar escrituras, todas las réplicas acaban teniendo el mismo valor', 'Los datos nunca coinciden', 'Todas las lecturas ven el último valor', 'Las escrituras se pierden'], 'Es el modelo de muchos sistemas de alta disponibilidad.'),
      mc('Un saldo bancario necesita que nunca se vea un valor incorrecto. ¿Qué modelo prefieres?', ['Consistencia fuerte', 'Consistencia eventual', 'Ninguna consistencia', 'Caché de 1 hora'], 'Para dinero y reservas de stock se acepta menor disponibilidad a cambio de corrección.'),
      tf('CAP dice que un sistema siempre debe sacrificar una de las tres propiedades en todo momento.', false, 'Solo debes elegir entre C y A *durante una partición*; sin ella puedes tener ambas.'),
    ]),

    lesson('sd-queue', 'Colas y eventos', `
      Las **colas de mensajes** (RabbitMQ, SQS) y los **logs de eventos** (Kafka) desacoplan servicios en el tiempo:

      - El productor encola y sigue; los **consumidores** procesan a su ritmo.
      - **Absorben picos** de carga y permiten reintentos.
      - **Entrega al menos una vez** (*at-least-once*): puede haber duplicados → los consumidores deben ser **idempotentes**. «Exactamente una vez» es muy difícil en la práctica.
      - **Dead-letter queue (DLQ)**: mensajes que fallan repetidamente se apartan para analizarlos.
      - **Pub/Sub**: varios suscriptores reciben el mismo evento.
      - **Kafka**: log particionado y persistente; cada consumidor lleva su **offset**; el orden solo está garantizado **dentro de una partición**.
      - **Patrones**: *event sourcing* (el estado es la suma de eventos), **CQRS**, **outbox** (publicar eventos de forma atómica con la transacción de BD) y **saga** (transacciones distribuidas con compensaciones).
    `, [
      mc('Un consumidor puede recibir el mismo mensaje dos veces. ¿Qué propiedad debe tener?', ['Idempotencia', 'Alta latencia', 'Ser síncrono', 'Usar HTTP'], 'Procesarlo dos veces debe dar el mismo resultado que una.'),
      mc('¿Para qué sirve una dead-letter queue?', ['Apartar los mensajes que fallan repetidamente para analizarlos', 'Acelerar la cola', 'Cifrar mensajes', 'Borrar la cola'], 'Evita que un mensaje «venenoso» bloquee el procesamiento.'),
      match('Empareja cada patrón con su finalidad', [
        ['Saga', 'Coordinar una transacción distribuida con pasos compensatorios'],
        ['Outbox', 'Publicar eventos de forma atómica con el cambio en la BD'],
        ['Event sourcing', 'Guardar los eventos como fuente de verdad del estado'],
        ['CQRS', 'Separar el modelo de escritura del de lectura'],
      ]),
      mc('Tu web envía un email de bienvenida al registrarse y el proveedor tarda 2 s. ¿Qué haces?', ['Encolar el trabajo y responder al usuario enseguida', 'Esperar a que acabe el email antes de responder', 'Enviarlo en el navegador', 'Quitar el email'], 'El trabajo pesado o no crítico va a una cola.'),
      mc('En Kafka, ¿dónde se garantiza el orden de los mensajes?', ['Dentro de una misma partición', 'En todo el topic', 'Nunca', 'Entre consumidores distintos'], 'Por eso se usa la clave (p. ej. el ID de usuario) para enviar eventos relacionados a la misma partición.'),
      tf('Con las colas, productor y consumidor deben estar disponibles al mismo tiempo.', false, 'Es justo lo contrario: la cola desacopla en el tiempo.'),
    ]),

    lesson('sd-api', 'Diseño de APIs', `
      Una API es un **contrato**: cambiarla rompe a sus clientes.

      - **REST**: recursos y verbos HTTP; sencillo y universal.
      - **GraphQL**: el cliente pide exactamente los campos que necesita (evita sobre/infra-carga) a costa de complejidad en el servidor.
      - **gRPC**: binario y tipado, muy eficiente entre servicios.

      **Buenas prácticas**:

      - **Versionado** (\`/v1\`) y compatibilidad hacia atrás: añadir campos sí, eliminarlos no.
      - **Paginación**: por **cursor** (estable y eficiente) mejor que por *offset* en tablas grandes.
      - **Idempotencia** con \`Idempotency-Key\` en los POST sensibles.
      - **Errores** consistentes y útiles (código, mensaje, detalle).
      - **Rate limiting** (token bucket, 429 + \`Retry-After\`).
      - **Autenticación** y autorización por *scopes*; **OpenAPI** para documentar y generar clientes.
      - **Timeouts, reintentos y circuit breaker** en los clientes.
    `, [
      mc('Una tabla tiene 100 millones de filas y los usuarios paginan sin parar. ¿Qué paginación es mejor?', ['Por cursor (`WHERE id > último_id LIMIT 20`)', 'Por offset (`OFFSET 50000000`)', 'Devolver todo', 'Paginar en el cliente'], 'El offset obliga a la BD a recorrer y descartar filas; el cursor usa el índice.'),
      mc('¿Qué cambio es **compatible hacia atrás** en una API?', ['Añadir un campo opcional a la respuesta', 'Renombrar un campo', 'Eliminar un campo', 'Cambiar un tipo de dato'], 'Los clientes antiguos ignoran los campos nuevos.'),
      match('Empareja cada estilo de API con su ventaja principal', [
        ['REST', 'Simplicidad y amplio soporte'],
        ['GraphQL', 'El cliente elige exactamente los campos que necesita'],
        ['gRPC', 'Eficiencia y tipado entre servicios'],
      ]),
      mc('¿Qué hace un *circuit breaker*?', ['Deja de llamar a un servicio que falla para no sobrecargarlo y falla rápido', 'Cifra las llamadas', 'Reintenta sin límite', 'Balancea la carga'], 'Se «abre» tras varios fallos y prueba de nuevo pasado un tiempo.'),
      ask('¿Qué código HTTP devuelve una API que supera el límite de peticiones permitido?', ['429'], 'Idealmente con la cabecera `Retry-After`.'),
      tf('Es seguro eliminar un campo de una respuesta si «casi nadie» lo usa.', false, 'Cualquier cliente que dependa de él se romperá: depreca primero y anuncia la retirada con una nueva versión.'),
    ]),

    lesson('sd-mono', 'Monolito vs. microservicios', `
      **Monolito**: una sola aplicación desplegable. Simple de desarrollar, probar y desplegar al principio; el código crece y se enreda. Un **monolito modular** bien estructurado es una excelente opción inicial.

      **Microservicios**: servicios pequeños, independientes y desplegables por separado, cada uno con su base de datos.

      | | Monolito | Microservicios |
      |---|---|---|
      | Despliegue | Uno | Muchos, independientes |
      | Escalado | Todo junto | Por servicio |
      | Complejidad operativa | Baja | Alta |
      | Consistencia | Transacciones locales | Eventual, sagas |
      | Equipos | Pocos | Muchos, autónomos |

      Los microservicios añaden **latencia de red**, **fallos parciales**, observabilidad compleja y despliegue complejo. Se justifican por la **escala de la organización**, no por moda.

      > Regla práctica: empieza con un monolito modular; extrae servicios cuando un dominio tenga necesidades de escala o equipo claramente distintas.
    `, [
      mc('Una startup de 4 personas construye su primer producto. ¿Qué arquitectura es más razonable?', ['Un monolito modular', 'Veinte microservicios con Kubernetes', 'Funciones sin servidor para todo, sin diseño', 'Una arquitectura distinta por cada módulo'], 'La complejidad operativa de los microservicios se paga en tiempo de un equipo pequeño.'),
      match('Empareja cada ventaja con la arquitectura donde es más clara', [
        ['Transacciones locales y depuración sencilla', 'Monolito: una sola base de datos'],
        ['Escalar cada parte por separado', 'Microservicios: escalado por servicio'],
        ['Equipos autónomos con tecnologías propias', 'Microservicios: despliegue por equipo'],
        ['Menor complejidad operativa', 'Monolito: un único despliegue'],
      ]),
      mc('Un servicio de pedidos llama a inventario y a pagos. Si pagos tarda 30 s, ¿qué debes tener?', ['Timeouts, reintentos controlados y un circuit breaker', 'Nada: funciona siempre', 'Un único servidor', 'Transacciones distribuidas inmediatas sin más'], 'En sistemas distribuidos hay que diseñar para el fallo parcial.'),
      mc('¿Qué es un monolito distribuido?', ['Microservicios tan acoplados que deben desplegarse juntos: lo peor de ambos mundos', 'Un monolito en varias zonas', 'Un monolito con réplicas', 'Un servicio sin estado'], 'Señal de que los límites entre servicios están mal trazados.'),
      mc('Quieres dividir un monolito. ¿Por dónde cortas?', ['Por dominios de negocio (contextos delimitados)', 'Por capas técnicas (todos los controladores, todos los repositorios)', 'Al azar', 'Por tamaño de archivo'], 'Los servicios deben alinearse con capacidades de negocio para minimizar dependencias entre ellos.'),
      tf('Los microservicios siempre mejoran el rendimiento respecto a un monolito.', false, 'Añaden llamadas de red y coste operativo; su beneficio es organizativo y de escalado selectivo.'),
    ]),
  ]),

  unit('sd3', 'Producción', 'experto', 'Fiabilidad, observabilidad y dos casos completos de diseño.', [
    lesson('sd-rel', 'Fiabilidad', `
      Todo falla: hay que diseñar **para el fallo**.

      - **Redundancia** y **ausencia de puntos únicos de fallo** (SPOF).
      - **Degradación elegante**: si falla una pieza no crítica (recomendaciones), el resto sigue.
      - **Timeouts** en todo, **reintentos con backoff y jitter**, **circuit breakers**, **bulkheads** (aislar recursos para que un fallo no se propague) y **limitación de carga** (*load shedding*).
      - **Despliegues seguros**: canary, *feature flags*, *rollback* rápido, migraciones compatibles.
      - **Backups** y **recuperación ante desastres**: **RPO** (cuántos datos puedes perder) y **RTO** (cuánto tardas en recuperar). **Un backup no probado no es un backup.**
      - **Chaos engineering**: provocar fallos para descubrir debilidades.
      - **Postmortems sin culpa**: aprender de los incidentes, no buscar culpables.
    `, [
      match('Empareja cada término con su significado', [
        ['RPO', 'Cantidad máxima de datos que se puede perder (en tiempo)'],
        ['RTO', 'Tiempo máximo aceptable para recuperar el servicio'],
        ['SPOF', 'Componente cuyo fallo detiene todo el sistema'],
        ['Bulkhead', 'Aislar recursos para contener fallos'],
      ]),
      mc('El servicio de recomendaciones falla. ¿Qué haría una degradación elegante?', ['Mostrar la página sin recomendaciones o con unas genéricas', 'Mostrar un error 500 en toda la web', 'Reiniciar la base de datos', 'Cerrar el sitio'], 'Lo crítico (comprar) debe seguir funcionando.'),
      mc('Tus backups se hacen cada noche, y se restauran a la primera vez que hace falta. ¿Cuál es el problema?', ['Nunca se ha probado la restauración', 'Se hacen de noche', 'Son demasiados', 'Ocupan poco'], 'Hay que ensayar periódicamente la recuperación.'),
      mc('Con backups diarios a las 02:00, un fallo a las 17:00 provoca una pérdida de datos de hasta…', ['15 horas (el RPO real)', '0 horas', '1 minuto', '1 semana'], 'El RPO real depende de la frecuencia de los backups o de la replicación.'),
      order('Ordena la respuesta ante un incidente', ['Detectar y declarar el incidente', 'Mitigar para restaurar el servicio (rollback, failover)', 'Comunicar el estado a los afectados', 'Analizar la causa raíz', 'Redactar un postmortem sin culpa y acciones de mejora']),
      tf('Un postmortem sin culpa busca identificar al responsable del error para sancionarlo.', false, 'Busca causas sistémicas y mejoras, asumiendo que las personas actuaron con la mejor información disponible.'),
    ]),

    lesson('sd-obs', 'Observabilidad', `
      Observabilidad: poder entender el estado interno del sistema por lo que emite.

      **Los tres pilares**:

      - **Logs**: eventos discretos. Estructurados (JSON), con nivel, *request id* y sin datos sensibles.
      - **Métricas**: series numéricas agregadas (Prometheus + Grafana). Las **señales de oro**: **latencia, tráfico, errores y saturación**.
      - **Trazas distribuidas** (OpenTelemetry, Jaeger): el recorrido de una petición por varios servicios, con la duración de cada tramo.

      **Percentiles**: la media engaña. Mira **p50, p95, p99**: p99 = el 1 % de peticiones más lentas.

      **SLI / SLO / SLA**: indicador medido (p. ej. % de peticiones < 300 ms), objetivo interno (99,9 %) y compromiso contractual. El **presupuesto de error** (*error budget*) equilibra la velocidad de entrega y la fiabilidad.

      **Alertas**: sobre síntomas que afectan al usuario, no sobre cada métrica interna; cada alerta debe ser accionable.
    `, [
      match('Empareja cada pilar de observabilidad con su pregunta', [
        ['Logs', '¿Qué ocurrió exactamente en este evento?'],
        ['Métricas', '¿Cómo evoluciona el sistema en el tiempo?'],
        ['Trazas', '¿Por dónde pasó esta petición y dónde tardó?'],
      ]),
      mc('La latencia media es 100 ms, pero el p99 es de 4 s. ¿Qué significa?', ['El 1 % de las peticiones es muy lento y afecta a usuarios reales', 'Todo va perfecto', 'La media está mal calculada', 'Hay un error de red general'], 'Las colas largas de latencia importan, sobre todo con muchas llamadas por página.'),
      mc('¿Cuáles son las cuatro «señales de oro»?', ['Latencia, tráfico, errores y saturación', 'CPU, RAM, disco y red', 'Logs, métricas, trazas y alertas', 'Disponibilidad, coste, seguridad y rendimiento'], 'Son las que más informan del estado de un servicio de cara al usuario.'),
      mc('Quieres seguir una petición que atraviesa 6 microservicios. ¿Qué necesitas?', ['Trazas distribuidas con un identificador de correlación', 'Solo más CPU', 'Un único log', 'Reiniciar los servicios'], 'El ID de traza se propaga en cabeceras entre servicios.'),
      mc('¿Cuál es una buena alerta?', ['«La tasa de errores del checkout supera el 2 % durante 5 min»', '«La CPU del nodo 3 llegó al 71 %»', '«Se escribió un log»', '«Hoy es martes»'], 'Alerta sobre síntomas con impacto en el usuario y que requieran acción.'),
      tf('Un SLO del 100 % es una buena meta.', false, 'Es inalcanzable y caro; un SLO realista deja un presupuesto de error para innovar.'),
    ]),

    lesson('sd-url', 'Caso: acortador de URLs', `
      **Requisitos**: dada una URL larga, generar un enlace corto y redirigir. Escala: 100 M de URLs nuevas al mes, **100:1** lecturas/escrituras.

      **Estimaciones**: 100 M/mes ≈ 40 escrituras/s; lecturas ≈ 4 000/s (picos 3×). Con 500 B por registro y 5 años: 6 000 M × 500 B ≈ 3 TB.

      **API**: \`POST /v1/urls {url}\` → \`{short}\`; \`GET /{short}\` → **301/302** a la URL original.

      **Generar el código**: base62 (0-9, a-z, A-Z). Con 7 caracteres: 62⁷ ≈ 3,5 billones de combinaciones. Opciones: contador único convertido a base62 (sin colisiones; requiere un generador de IDs distribuido), o hash de la URL + comprobar colisiones.

      **Diseño**: balanceador → servidores sin estado → **caché** (Redis, claves calientes) → BD clave-valor o relacional particionada por \`short\`. Redirección 302 si quieres contar clics; 301 se cachea en el navegador.

      **Extras**: caducidad (TTL), analítica asíncrona con una cola, limitación de tasa, detección de URLs maliciosas.
    `, [
      num('Con 7 caracteres base62 (62 símbolos), ¿cuántos miles de millones de códigos posibles hay aproximadamente? (redondea al entero)', 3522, '62⁷ ≈ 3 521 614 606 208 ≈ 3,5 billones = 3 522 miles de millones.', 0.02),
      py(predict(`ALFABETO = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def a_base62(n):
    if n == 0:
        return "0"
    s = ""
    while n:
        n, r = divmod(n, 62)
        s = ALFABETO[r] + s
    return s

print(a_base62(125), a_base62(3844))`, '21 100', '125 = 2×62 + 1 → "21". 3844 = 62² → "100".')),
      mc('El servicio recibe 100 lecturas por cada escritura. ¿Qué optimización es la más rentable?', ['Una caché delante de la base de datos', 'Más servidores de escritura', 'Cifrar las URLs', 'Particionar por fecha'], 'Los códigos populares se piden una y otra vez: alto hit ratio.'),
      mc('Quieres contar los clics de cada enlace. ¿Qué redirección usas?', ['302 (temporal): el navegador vuelve a preguntar cada vez', '301 (permanente): el navegador la cachea', '200 con JavaScript', '404'], 'Con 301 muchas visitas no llegarían a tu servidor.'),
      mc('¿Cómo generarías códigos únicos sin colisiones entre varios servidores?', ['Un generador de IDs distribuido (p. ej. rangos asignados a cada servidor) convertido a base62', 'Números aleatorios sin comprobar nada', 'Usando la hora en segundos', 'El primer carácter de la URL'], 'Los rangos pre-asignados evitan coordinar en cada petición.'),
      tf('Es necesario usar una base de datos relacional con JOINs para este sistema.', false, 'El acceso es por clave (`short → url`): una BD clave-valor encaja muy bien y escala fácilmente.'),
    ]),

    lesson('sd-chat', 'Caso: chat y feed', `
      **Chat 1:1 y en grupo** (WhatsApp, Slack):

      - **Conexión**: WebSocket persistente entre cliente y un servidor de *gateway*. Un servicio de **presencia** mantiene quién está en línea.
      - **Entrega**: el mensaje se guarda en una **cola/log por conversación** y se envía a los destinatarios conectados; a los desconectados, por *push* y al volver (sincronización por offset).
      - **Orden**: IDs ordenables por conversación (p. ej. tipo Snowflake: tiempo + nodo + secuencia).
      - **Almacenamiento**: base de datos escalable con clave de partición \`conversation_id\` y orden por \`message_id\` (Cassandra/HBase) para lecturas del historial.
      - **Confirmaciones**: enviado → entregado → leído (ACKs idempotentes).

      **Feed de noticias** (estilo redes sociales): dos enfoques

      - **Fan-out on write** (push): al publicar, se escribe el post en el feed precalculado de cada seguidor. Lecturas rapidísimas; escrituras caras para cuentas con millones de seguidores.
      - **Fan-out on read** (pull): se compone el feed al leer. Escrituras baratas; lecturas más lentas.
      - **Híbrido**: *push* para usuarios normales y *pull* para celebridades.
    `, [
      mc('Una celebridad con 50 millones de seguidores publica. ¿Qué estrategia de feed evita escribir 50 millones de entradas?', ['*Fan-out on read* (o un híbrido) para las cuentas muy grandes', '*Fan-out on write* siempre', 'Enviar un email a cada seguidor', 'Borrar el feed'], 'Los seguidores leen los posts de las celebridades al cargar el feed.'),
      mc('¿Qué transporte usarías para entregar mensajes de chat en tiempo real al cliente?', ['WebSocket', 'FTP', 'Polling cada hora', 'SMTP'], 'Conexión bidireccional persistente y baja latencia.'),
      order('Ordena el camino de un mensaje de chat', ['El emisor lo envía por su WebSocket', 'El servidor lo guarda de forma duradera en el log de la conversación', 'Se publica a los destinatarios conectados (o se envía una notificación push)', 'Los destinatarios confirman la entrega y la lectura']),
      mc('¿Qué clave de partición elegirías para guardar mensajes de chat?', ['El ID de la conversación', 'La fecha del mensaje', 'El primer carácter del texto', 'El tamaño del mensaje'], 'Todos los mensajes de una conversación quedan juntos, y las conversaciones se reparten entre nodos.'),
      match('Empareja cada componente con su función', [
        ['Servicio de presencia', 'Saber qué usuarios están conectados'],
        ['Cola de entrega', 'Guardar mensajes para destinatarios desconectados'],
        ['Notificación push', 'Avisar a un dispositivo sin conexión abierta'],
        ['ID tipo Snowflake', 'Generar identificadores únicos y ordenables por tiempo'],
      ]),
      code('Escribe `merge_feeds(a, b)`: fusiona dos listas ya ordenadas de (timestamp, texto) por timestamp ascendente (como el feed de dos fuentes).', `
        def merge_feeds(a, b):
            pass`, `
        def merge_feeds(a, b):
            res, i, j = [], 0, 0
            while i < len(a) and j < len(b):
                if a[i][0] <= b[j][0]:
                    res.append(a[i]); i += 1
                else:
                    res.append(b[j]); j += 1
            return res + a[i:] + b[j:]`, [['merge_feeds([(1, "a"), (4, "d")], [(2, "b"), (3, "c")])', '[(1, "a"), (2, "b"), (3, "c"), (4, "d")]'], ['merge_feeds([], [(1, "x")])', '[(1, "x")]'], ['merge_feeds([(5, "e")], [])', '[(5, "e")]']]),
    ]),
  ]),
])
