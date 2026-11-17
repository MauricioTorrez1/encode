import { ask, lesson, match, mc, num, order, tf, track, unit, fill } from '../dsl'

export default track('redes', undefined, [
  unit('rd1', 'Cimientos', 'basico', 'Modelos de capas, direccionamiento IP, DNS, TCP y UDP: cómo se identifican y se hablan las máquinas.', [
    lesson('rd-osi', 'Modelos OSI y TCP/IP', `
      Una red se diseña en **capas**: cada una resuelve un problema y habla solo con las vecinas.

      | # | OSI | TCP/IP | Ejemplos |
      |---|---|---|---|
      | 7 | Aplicación | Aplicación | HTTP, DNS, SSH, SMTP |
      | 6 | Presentación | Aplicación | TLS, codificación |
      | 5 | Sesión | Aplicación | Sesiones |
      | 4 | Transporte | Transporte | TCP, UDP (puertos) |
      | 3 | Red | Internet | IP, ICMP (direcciones, rutas) |
      | 2 | Enlace | Acceso a red | Ethernet, Wi-Fi (MAC) |
      | 1 | Física | Acceso a red | Cables, radio |

      **Encapsulación**: al enviar, cada capa añade su cabecera: *datos → segmento (TCP) → paquete (IP) → trama (Ethernet) → bits*. Al recibir, se desencapsula.

      > Cuando algo falla, diagnostica **de abajo arriba**: ¿hay cable/Wi-Fi? ¿IP? ¿ruta? ¿puerto abierto? ¿la aplicación responde?
    `, [
      mc('¿En qué capa del modelo OSI trabaja un router?', ['Capa 3 (Red)', 'Capa 2 (Enlace)', 'Capa 4 (Transporte)', 'Capa 7 (Aplicación)'], 'Los routers deciden el siguiente salto según la dirección IP. Los switches trabajan en la capa 2 con direcciones MAC.'),
      match('Empareja cada protocolo con su capa (TCP/IP)', [
        ['HTTP', 'Aplicación'],
        ['TCP', 'Transporte'],
        ['IP', 'Internet (Red)'],
        ['Ethernet', 'Acceso a red (Enlace)'],
      ]),
      order('Ordena la encapsulación al enviar un dato (de arriba abajo)', ['Datos de la aplicación', 'Segmento TCP (añade puertos)', 'Paquete IP (añade direcciones IP)', 'Trama Ethernet (añade direcciones MAC)']),
      mc('Un usuario no puede abrir una web. Haces ping a su IP y funciona. ¿Dónde buscas el problema?', ['En las capas superiores: DNS, puerto TCP o la aplicación', 'En el cable', 'En la tarjeta de red', 'En la dirección MAC'], 'El ping (ICMP, capa 3) demuestra que hay conectividad IP.'),
      ask('¿Cómo se llama la unidad de datos de la capa de transporte en TCP?', ['segmento', 'segment'], 'Datagrama en UDP, paquete en IP, trama en Ethernet.'),
      tf('La dirección MAC identifica una interfaz dentro de la red local; la IP permite direccionar entre redes.', true, 'La MAC cambia en cada salto; la IP origen y destino se mantienen de extremo a extremo (salvo NAT).'),
    ]),

    lesson('rd-ip', 'IP y subredes', `
      Una dirección **IPv4** son 32 bits escritos como 4 octetos: \`192.168.1.37\`. Se divide en **parte de red** y **parte de host** según la **máscara**.

      **Notación CIDR**: \`192.168.1.0/24\` → 24 bits de red, 8 de host.

      | CIDR | Máscara | Hosts útiles |
      |---|---|---|
      | /24 | 255.255.255.0 | 254 |
      | /25 | 255.255.255.128 | 126 |
      | /26 | 255.255.255.192 | 62 |
      | /30 | 255.255.255.252 | 2 |

      - Hosts útiles = 2^(32−prefijo) − 2 (se restan la dirección de **red** y la de **broadcast**).
      - **IPs privadas** (no enrutables en internet): \`10.0.0.0/8\`, \`172.16.0.0/12\`, \`192.168.0.0/16\`.
      - \`127.0.0.1\` es *localhost*. \`169.254.x.x\`, autoasignada cuando falla el DHCP.
      - **IPv6**: 128 bits (\`2001:db8::1\`), para el agotamiento de IPv4.
    `, [
      num('¿Cuántos hosts utilizables tiene una red /26?', 62, '2⁶ − 2 = 62.'),
      ask('¿Cuál es la máscara de subred de un /25?', ['255.255.255.128'], '25 bits a 1: 255.255.255 y el último octeto 1000 0000 = 128.'),
      ask('¿Cuál es la dirección de red de 192.168.10.77/26?', ['192.168.10.64'], 'Bloques de 64: 0, 64, 128, 192. El 77 cae en el bloque que empieza en 64.'),
      ask('¿Cuál es la dirección de broadcast de 192.168.10.77/26?', ['192.168.10.127'], 'El bloque 64–127: el broadcast es la última dirección.'),
      mc('¿Cuál de estas es una dirección IP privada?', ['172.20.5.9', '172.32.5.9', '8.8.8.8', '192.169.1.1'], '172.16.0.0/12 abarca de 172.16 a 172.31.'),
      mc('¿Para qué sirve un /30?', ['Un enlace punto a punto entre dos routers (2 hosts)', 'Una red de oficina con 500 equipos', 'Una red de IPv6', 'Para el broadcast'], '4 direcciones: red, 2 hosts y broadcast.'),
      num('¿Cuántas subredes /26 caben en un bloque /24?', 4, '2^(26−24) = 4.'),
    ]),

    lesson('rd-dns', 'DNS', `
      **DNS** traduce nombres (\`encode.dev\`) a direcciones IP: es la agenda de internet.

      Resolución: tu equipo pregunta a un **resolver recursivo**; si no tiene la respuesta en caché, consulta a los servidores **raíz → TLD (.dev) → autoritativo** del dominio.

      **Registros comunes**:

      - **A** / **AAAA**: nombre → IPv4 / IPv6.
      - **CNAME**: alias de otro nombre.
      - **MX**: servidores de correo.
      - **TXT**: texto libre (verificaciones, SPF, DKIM).
      - **NS**: servidores autoritativos del dominio.

      El **TTL** indica cuántos segundos se puede cachear una respuesta: un TTL alto abarata consultas, pero retrasa los cambios.

      \`\`\`bash
      dig encode.dev A           # consulta DNS
      nslookup encode.dev
      \`\`\`
    `, [
      match('Empareja cada registro DNS con su función', [
        ['A', 'Nombre → dirección IPv4'],
        ['CNAME', 'Alias de otro nombre'],
        ['MX', 'Servidor de correo del dominio'],
        ['TXT', 'Texto libre: SPF, verificaciones'],
      ]),
      mc('Vas a migrar un servicio a otra IP. ¿Qué haces con el TTL del registro A?', ['Bajarlo con antelación para que el cambio se propague rápido', 'Subirlo al máximo', 'No importa', 'Borrar el registro'], 'Con un TTL bajo, las cachés caducan antes y el cambio se ve enseguida.'),
      ask('¿Qué comando clásico consulta registros DNS desde la terminal? (herramienta de BIND)', ['dig'], '`nslookup` es la alternativa, y `host` la más sencilla.'),
      order('Ordena una resolución DNS recursiva sin caché', ['El equipo pregunta a su resolver recursivo', 'El resolver pregunta a un servidor raíz', 'El resolver pregunta al servidor del TLD (.dev)', 'El resolver pregunta al servidor autoritativo del dominio', 'La respuesta vuelve al equipo y se cachea']),
      mc('¿Qué registro usarías para que `www.encode.dev` apunte al mismo sitio que `encode.dev`?', ['CNAME (o A)', 'MX', 'NS', 'TXT'], 'Un CNAME no puede convivir con otros registros en el mismo nombre (por eso no se usa en el apex del dominio).'),
      tf('DNS usa solo UDP.', false, 'Usa UDP (puerto 53) para consultas normales y TCP cuando la respuesta es grande o en transferencias de zona; DNS sobre HTTPS/TLS también existe.'),
    ]),

    lesson('rd-tcp', 'TCP, UDP y puertos', `
      Una **IP** identifica una máquina; un **puerto** (0–65535) identifica una aplicación dentro de ella. Una conexión es el par *IP:puerto origen ↔ IP:puerto destino*.

      **TCP**: orientado a conexión, **fiable** y ordenado (confirmaciones, retransmisiones, control de flujo y congestión). Empieza con el **saludo en tres pasos**:

      \`\`\`
      Cliente → SYN →            Servidor
      Cliente ← SYN-ACK ←        Servidor
      Cliente → ACK →            Servidor      (conexión establecida)
      \`\`\`

      **UDP**: sin conexión, **sin garantías** pero con muy poca sobrecarga. Ideal para **DNS, VoIP, vídeo en directo, juegos**, donde importa más la latencia que no perder un paquete.

      **Puertos conocidos**: 22 SSH · 25 SMTP · 53 DNS · 80 HTTP · 443 HTTPS · 3306 MySQL · 5432 PostgreSQL · 6379 Redis.
    `, [
      order('Ordena el saludo de tres vías de TCP', ['El cliente envía SYN', 'El servidor responde SYN-ACK', 'El cliente envía ACK']),
      mc('Quieres transmitir una videollamada con la mínima latencia, tolerando algún paquete perdido. ¿Qué transporte?', ['UDP', 'TCP', 'ICMP', 'HTTP'], 'Retransmitir un paquete viejo con TCP solo añadiría retraso.'),
      num('¿Cuál es el puerto por defecto de HTTPS?', 443, 'HTTP usa el 80.'),
      match('Empareja cada servicio con su puerto', [
        ['SSH', '22'],
        ['PostgreSQL', '5432'],
        ['Redis', '6379'],
        ['DNS', '53'],
      ]),
      mc('¿Qué garantiza TCP que no garantiza UDP?', ['Entrega fiable y ordenada de los datos', 'Menor latencia', 'Cifrado', 'Que el mensaje llegue más rápido'], 'Lo paga con más sobrecarga y latencia.'),
      tf('Dos aplicaciones distintas de una misma máquina pueden escuchar en el mismo puerto TCP a la vez.', false, 'Un puerto TCP/UDP está asociado a un único proceso (salvo opciones especiales como SO_REUSEPORT).'),
    ]),
  ]),

  unit('rd2', 'La web por dentro', 'intermedio', 'HTTP en profundidad, TLS, routing, NAT y las herramientas para diagnosticar problemas.', [
    lesson('rd-http', 'HTTP/1.1, HTTP/2 y HTTP/3', `
      - **HTTP/1.1**: texto, una petición por conexión a la vez (*head-of-line blocking*); se abrían varias conexiones en paralelo. Conexiones persistentes (\`keep-alive\`).
      - **HTTP/2**: binario, **multiplexación** de muchas peticiones en una sola conexión TCP, compresión de cabeceras. Pero un paquete TCP perdido sigue frenando todos los flujos.
      - **HTTP/3**: sobre **QUIC** (UDP), con cifrado integrado, flujos independientes y arranque más rápido (0-RTT).

      **Caché**: cabeceras \`Cache-Control: max-age=3600\`, \`ETag\` y \`If-None-Match\` (respuesta **304 Not Modified** si no cambió). Una **CDN** sirve contenido estático desde servidores cercanos al usuario.

      **Cookies**, \`CORS\` (qué orígenes pueden llamar a tu API desde un navegador) y las cabeceras de seguridad (\`Strict-Transport-Security\`, \`Content-Security-Policy\`) completan el cuadro.
    `, [
      mc('¿Qué aporta la multiplexación de HTTP/2?', ['Varias peticiones concurrentes sobre una sola conexión', 'Cifrado obligatorio sin TLS', 'Usar UDP', 'Peticiones sin cabeceras'], 'Evita abrir muchas conexiones TCP.'),
      mc('¿Sobre qué transporte funciona HTTP/3?', ['QUIC, que se apoya en UDP', 'TCP', 'ICMP', 'SCTP'], 'QUIC reimplementa la fiabilidad y el cifrado sobre UDP, evitando el bloqueo entre flujos.'),
      mc('Un navegador envía `If-None-Match: "abc"` y el recurso no ha cambiado. ¿Qué responde el servidor?', ['304 Not Modified, sin cuerpo', '200 OK con el cuerpo completo', '404 Not Found', '301 Moved Permanently'], 'Ahorra ancho de banda: el cliente reutiliza su copia en caché.'),
      match('Empareja cada cabecera con su función', [
        ['`Cache-Control`', 'Define cuánto y cómo se puede cachear'],
        ['`Authorization`', 'Lleva credenciales o un token'],
        ['`Content-Type`', 'Indica el formato del cuerpo'],
        ['`Location`', 'Indica la URL del recurso creado o a la que redirigir'],
      ]),
      mc('¿Para qué sirve una CDN?', ['Servir contenido desde servidores próximos al usuario, reduciendo latencia y carga del origen', 'Cifrar bases de datos', 'Resolver nombres DNS', 'Compilar el código'], 'Cachea estáticos en el borde (*edge*).'),
      tf('CORS es un mecanismo de seguridad que aplica el navegador, no el servidor.', true, 'El servidor declara qué orígenes permite con cabeceras; el navegador las hace cumplir. `curl` no está sujeto a CORS.'),
    ]),

    lesson('rd-tls', 'TLS y HTTPS', `
      **TLS** da tres garantías: **confidencialidad** (cifrado), **integridad** (no se altera) y **autenticidad** (hablas con quien dices).

      Handshake simplificado (TLS 1.3):

      1. El cliente indica versiones y cifrados que soporta, y su parte del intercambio de claves.
      2. El servidor responde con su **certificado** y su parte de la clave.
      3. El cliente **valida el certificado**: firmado por una **CA** de confianza, no caducado, con el nombre correcto.
      4. Ambos derivan una **clave de sesión simétrica** (rápida) y cifran con ella.

      - **Criptografía asimétrica** (clave pública/privada): para autenticar e intercambiar claves.
      - **Criptografía simétrica** (AES): para cifrar los datos en masa.
      - **Let's Encrypt** emite certificados gratuitos y automáticos.
      - **mTLS**: también el cliente presenta certificado (comunicación entre servicios).
      - **HSTS** obliga al navegador a usar siempre HTTPS.
    `, [
      mc('¿Por qué TLS usa criptografía asimétrica y simétrica a la vez?', ['La asimétrica autentica e intercambia claves; la simétrica cifra los datos con rapidez', 'Por redundancia', 'Porque la simétrica no es segura', 'Por compatibilidad con HTTP'], 'La asimétrica es lenta: solo se usa en el handshake.'),
      mc('Un certificado de `ejemplo.com` se presenta al conectar con `otro.com`. ¿Qué ocurre?', ['El cliente rechaza la conexión: el nombre no coincide', 'Se acepta sin problemas', 'Se cifra con otra clave', 'El servidor se reinicia'], 'La validación del nombre evita ataques de suplantación.'),
      match('Empareja cada garantía de TLS con su significado', [
        ['Confidencialidad', 'Nadie puede leer el tráfico en tránsito'],
        ['Integridad', 'Nadie puede modificar los datos sin que se detecte'],
        ['Autenticidad', 'Estás hablando realmente con el servidor esperado'],
      ]),
      mc('¿Qué es una CA (autoridad certificadora)?', ['Una entidad de confianza que firma certificados', 'Un tipo de cifrado', 'Un servidor DNS', 'Un navegador'], 'Los navegadores incluyen una lista de CAs de confianza.'),
      tf('HTTPS oculta qué dominio visitas a quien observa la red.', false, 'La IP destino y, normalmente, el nombre (SNI) siguen siendo visibles; el contenido y la ruta, no.'),
      ask('¿Qué cabecera obliga al navegador a usar siempre HTTPS con un dominio? (sigla de 4 letras)', ['HSTS', 'Strict-Transport-Security'], '`Strict-Transport-Security: max-age=31536000`.'),
    ]),

    lesson('rd-route', 'Routing, NAT y switching', `
      - **Switch** (capa 2): conecta dispositivos de una **misma red local**, aprende en qué puerto está cada **MAC**.
      - **Router** (capa 3): conecta **redes distintas** con una **tabla de rutas**; elige el siguiente salto por **prefijo más específico** (*longest prefix match*). La **puerta de enlace** (*gateway*) es el router por el que sale el tráfico hacia fuera.
      - **ARP**: resuelve «¿qué MAC tiene esta IP en mi red?».
      - **DHCP**: asigna automáticamente IP, máscara, gateway y DNS a quien se conecta.
      - **NAT**: traduce las IPs privadas a una IP pública, así muchos equipos comparten una dirección (un router doméstico lo hace con **PAT**, usando puertos).
      - **Protocolos de enrutamiento**: **OSPF** dentro de una organización; **BGP** entre redes de internet (sistemas autónomos).
      - **TTL** de IP: cada router lo decrementa; al llegar a 0 descarta el paquete (evita bucles).
    `, [
      match('Empareja cada dispositivo o protocolo con su función', [
        ['Switch', 'Reenvía tramas dentro de la LAN según la MAC'],
        ['Router', 'Conecta redes distintas según la IP'],
        ['DHCP', 'Asigna IP y configuración automáticamente'],
        ['ARP', 'Resuelve una IP a su dirección MAC local'],
      ]),
      mc('Un router tiene las rutas `10.0.0.0/8 → A` y `10.1.0.0/16 → B`. Llega un paquete a `10.1.2.3`. ¿Por dónde sale?', ['Por B: el prefijo más específico', 'Por A: es la primera', 'Por ambas', 'Se descarta'], 'Se elige la ruta con el prefijo más largo que coincide.'),
      mc('¿Qué hace NAT en un router doméstico?', ['Traduce las IPs privadas de la LAN a la IP pública, usando puertos para distinguir conexiones', 'Cifra el tráfico', 'Asigna IPs a los dispositivos', 'Resuelve nombres'], 'Por eso no se puede acceder directamente a un equipo detrás de NAT sin redirección de puertos.'),
      mc('¿Qué protocolo intercambia rutas entre los grandes operadores de internet?', ['BGP', 'OSPF', 'DHCP', 'ARP'], 'BGP une los miles de sistemas autónomos.'),
      mc('¿Para qué sirve el campo TTL de un paquete IP?', ['Descartar paquetes atrapados en bucles de enrutamiento', 'Cifrar el paquete', 'Medir el ancho de banda', 'Identificar la aplicación'], 'Cada router lo decrementa; `traceroute` lo aprovecha.'),
      tf('Un switch normal (capa 2) toma decisiones basadas en direcciones IP.', false, 'Reenvía por dirección MAC. Los «switches de capa 3» sí enrutan.'),
    ]),

    lesson('rd-tools', 'Herramientas de diagnóstico', `
      \`\`\`bash
      ping 8.8.8.8              # ¿hay conectividad IP? latencia y pérdida (ICMP)
      traceroute encode.dev     # saltos hasta el destino (tracert en Windows)
      dig encode.dev            # resolución DNS
      curl -v https://encode.dev       # petición HTTP con detalle (cabeceras, TLS)
      curl -I https://encode.dev       # solo las cabeceras
      ss -tulpn                 # puertos en escucha y procesos (antes: netstat)
      ip addr / ip route        # interfaces y tabla de rutas
      nc -zv host 443           # ¿está abierto el puerto?
      tcpdump -i eth0 port 53   # captura de paquetes (Wireshark en gráfico)
      \`\`\`

      Método: **de abajo arriba**. ¿Tengo IP (\`ip addr\`)? ¿Llego a la puerta de enlace (\`ping\`)? ¿Resuelve el nombre (\`dig\`)? ¿Está abierto el puerto (\`nc\`)? ¿Qué responde la aplicación (\`curl -v\`)?
    `, [
      ask('¿Qué comando muestra los saltos que da un paquete hasta su destino? (Linux/macOS)', ['traceroute'], 'En Windows es `tracert`. Usa TTL crecientes.'),
      mc('Quieres ver solo las cabeceras HTTP de una URL. ¿Qué usas?', ['`curl -I url`', '`ping url`', '`dig url`', '`ss -tulpn`'], '`-I` hace una petición HEAD.'),
      mc('Una web no carga y `ping 8.8.8.8` funciona, pero `ping encode.dev` dice «host desconocido». ¿Qué falla?', ['La resolución DNS', 'El cable de red', 'La tarjeta de red', 'El puerto 443'], 'Hay conectividad IP, pero no se traduce el nombre.'),
      match('Empareja cada herramienta con su uso', [
        ['`dig`', 'Consultar registros DNS'],
        ['`ss -tulpn`', 'Ver puertos en escucha y qué proceso los usa'],
        ['`nc -zv host 443`', 'Comprobar si un puerto está accesible'],
        ['`tcpdump`', 'Capturar y analizar paquetes'],
      ]),
      order('Ordena el diagnóstico de «no puedo abrir la web» de abajo arriba', ['Comprobar que hay IP y puerta de enlace', 'Hacer ping a una IP pública', 'Comprobar la resolución DNS', 'Comprobar que el puerto 443 está abierto', 'Inspeccionar la respuesta de la aplicación con `curl -v`']),
      fill(`___ -v https://encode.dev`, ['curl'], '`curl -v` muestra el handshake TLS y las cabeceras de petición y respuesta.', undefined, 'Completa el comando que realiza una petición HTTP con detalle'),
    ]),
  ]),

  unit('rd3', 'Diseño de redes', 'avanzado', 'Segmentación, seguridad perimetral, redes en la nube y protocolos en tiempo real.', [
    lesson('rd-seg', 'VLAN, DMZ y firewalls', `
      Segmentar la red limita el daño de un ataque y organiza el tráfico.

      - **VLAN**: divide un switch físico en varias redes lógicas aisladas (invitados, oficina, servidores, cámaras).
      - **DMZ**: red intermedia donde se alojan los servicios expuestos a internet (web, correo), aislada de la red interna.
      - **Firewall**: filtra el tráfico por reglas (origen, destino, puerto, protocolo). **Stateful**: recuerda las conexiones establecidas. Principio: **denegar por defecto** y permitir solo lo necesario.
      - **Proxy inverso / balanceador**: recibe el tráfico y lo reparte entre servidores internos.
      - **VPN**: túnel cifrado para conectar redes o usuarios remotos de forma segura.
      - **Zero trust**: no confiar en nada por estar «dentro» de la red; verificar identidad y dispositivo en cada acceso.
      - **Principio de mínimo privilegio** y **defensa en profundidad** (varias capas de protección).
    `, [
      mc('¿Para qué sirve una DMZ?', ['Aislar los servicios expuestos a internet de la red interna', 'Acelerar la red', 'Asignar IPs', 'Cifrar el correo'], 'Si un servidor de la DMZ se compromete, el atacante sigue sin acceso directo a la red interna.'),
      mc('¿Qué política base debe tener un firewall bien configurado?', ['Denegar todo por defecto y permitir solo lo necesario', 'Permitir todo y bloquear lo malo', 'Bloquear solo el puerto 22', 'Ninguna'], 'Es más seguro enumerar lo permitido que intentar listar todo lo peligroso.'),
      match('Empareja cada elemento con su función', [
        ['VLAN', 'Separar redes lógicas sobre infraestructura compartida'],
        ['VPN', 'Túnel cifrado entre redes o usuarios remotos'],
        ['Proxy inverso', 'Recibir tráfico y repartirlo a servidores internos'],
        ['Firewall stateful', 'Filtra recordando el estado de las conexiones'],
      ]),
      mc('La base de datos de tu aplicación, ¿dónde debería estar?', ['En una red privada, sin acceso directo desde internet', 'En la DMZ con IP pública', 'En el mismo servidor web sin firewall', 'En cualquier sitio'], 'Solo la aplicación necesita llegar a ella.'),
      tf('«Zero trust» significa que un dispositivo dentro de la red corporativa es de confianza por defecto.', false, 'Es lo contrario: cada acceso se verifica, esté donde esté.'),
      mc('Quieres que una cámara IP vulnerable no pueda llegar a tus servidores. ¿Qué haces?', ['Ponerla en una VLAN aislada con reglas estrictas', 'Cambiar su color', 'Dejarla en la red principal', 'Apagar el firewall'], 'La segmentación limita el movimiento lateral.'),
    ]),

    lesson('rd-cloud', 'Redes en la nube', `
      Conceptos comunes en AWS, Azure y GCP:

      - **VPC / VNet**: tu red privada virtual en la nube, con un rango CIDR (p. ej. \`10.0.0.0/16\`).
      - **Subredes públicas** (con ruta a un *internet gateway*) y **privadas** (salen a internet a través de un **NAT gateway**).
      - **Security groups** (stateful, por instancia) y **NACLs** (sin estado, por subred).
      - **Balanceadores** L4 (TCP) y L7 (HTTP, enrutan por ruta o cabecera).
      - **Peering / Transit Gateway**: conectar VPCs. **VPN / Direct Connect**: conectar con el datacenter.
      - **DNS privado**, **CDN** y **WAF** (filtra ataques web).
      - **Multi-AZ**: desplegar en varias **zonas de disponibilidad** para tolerar fallos de un datacenter.
      - Las **IPs elásticas** y el **egress** tienen costes: los datos que salen de la nube se facturan.
    `, [
      mc('Una instancia en una subred privada necesita descargar actualizaciones de internet. ¿Cómo?', ['A través de un NAT gateway', 'Asignándole una IP pública directamente', 'Moviéndola a la DMZ', 'No puede'], 'El NAT gateway permite conexiones salientes sin exponer la instancia a conexiones entrantes.'),
      match('Empareja cada servicio con su función', [
        ['VPC', 'Red privada virtual aislada'],
        ['Security group', 'Firewall stateful asociado a instancias'],
        ['Internet gateway', 'Da salida y entrada a internet a una VPC'],
        ['WAF', 'Filtra ataques web como inyecciones y XSS'],
      ]),
      mc('¿Por qué se despliega una aplicación en varias zonas de disponibilidad?', ['Para seguir funcionando si falla un datacenter', 'Para pagar menos', 'Para que sea más lenta', 'Para evitar usar balanceadores'], 'Es la base de la alta disponibilidad.'),
      mc('¿Qué diferencia hay entre un balanceador L4 y uno L7?', ['L4 reparte conexiones TCP/UDP; L7 entiende HTTP y puede enrutar por ruta o cabecera', 'No hay diferencia', 'L7 solo reparte por IP', 'L4 entiende cookies'], 'L7 permite, por ejemplo, `/api` → un servicio y `/img` → otro.'),
      mc('¿Qué rango CIDR es adecuado para una VPC que debe poder crecer sin solaparse con la red de la oficina `192.168.0.0/16`?', ['10.0.0.0/16', '192.168.1.0/24', '192.168.0.0/16', '0.0.0.0/0'], 'Los rangos solapados impiden conectar redes entre sí con VPN o peering.'),
      tf('Los datos que entran a la nube y los que salen se facturan siempre igual.', false, 'Normalmente la entrada es gratuita y el tráfico de salida (*egress*) se cobra.'),
    ]),

    lesson('rd-rt', 'Protocolos en tiempo real', `
      - **WebSocket**: conexión bidireccional persistente sobre HTTP (chats, cotizaciones, juegos).
      - **Server-Sent Events (SSE)**: el servidor empuja eventos al cliente en una sola dirección (notificaciones, progreso).
      - **Long polling**: el cliente pregunta y el servidor responde cuando hay algo; simple pero costoso.
      - **WebRTC**: comunicación **entre navegadores** con audio, vídeo y datos, sobre UDP. Usa **STUN** (descubre tu IP pública), **TURN** (relé si no hay conexión directa) y un servidor de **señalización**.
      - **gRPC**: RPC binario sobre HTTP/2 con Protocol Buffers; ideal entre microservicios, con *streaming*.
      - **MQTT**: mensajería ligera publicador/suscriptor para IoT.
      - **Latencia vs. ancho de banda**: lo primero es el tiempo de ida y vuelta; lo segundo, cuánto cabe por segundo. Un vídeo en directo necesita mucho de lo segundo; un juego, poco retraso.
    `, [
      mc('Quieres un chat donde el servidor y el cliente envíen mensajes en cualquier momento. ¿Qué eliges?', ['WebSocket', 'Una petición GET periódica cada hora', 'FTP', 'SMTP'], 'Mantiene una conexión abierta y bidireccional.'),
      mc('Mostrar el progreso de una tarea larga del servidor al navegador, solo en un sentido. ¿Qué tecnología es la más sencilla?', ['Server-Sent Events', 'WebRTC', 'gRPC con certificados mTLS', 'Long polling cada milisegundo'], 'SSE usa HTTP normal y reconexión automática.'),
      match('Empareja cada tecnología con su caso de uso', [
        ['WebRTC', 'Videollamadas entre navegadores'],
        ['gRPC', 'Comunicación binaria eficiente entre microservicios'],
        ['MQTT', 'Mensajería ligera para dispositivos IoT'],
        ['WebSocket', 'Comunicación bidireccional persistente'],
      ]),
      mc('En WebRTC, ¿para qué sirve un servidor TURN?', ['Retransmitir el tráfico cuando no es posible la conexión directa entre pares', 'Descubrir tu IP pública', 'Cifrar el vídeo', 'Almacenar las grabaciones'], 'STUN descubre la IP pública; TURN es el plan B, más caro porque pasa todo el tráfico.'),
      mc('¿Qué métrica importa más en un videojuego en línea?', ['Latencia (ping)', 'Ancho de banda', 'Tamaño de disco', 'Número de núcleos'], 'Pocos datos, pero deben llegar rápido y con poca variación (*jitter*).'),
      tf('gRPC se apoya en HTTP/2 y Protocol Buffers.', true, 'Por eso es compacto, tipado y admite streaming bidireccional.'),
    ]),
  ]),
])
