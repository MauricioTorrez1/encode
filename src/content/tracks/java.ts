import { ask, bug, code, fill, lesson, match, mc, order, parsons, predict, tf, track, unit } from '../dsl'

export default track('java', 'java', [
  unit('jv1', 'Sintaxis', 'basico', 'Tipos estáticos, control de flujo, strings y arrays: la base de todo programa Java.', [
    lesson('j-hello', 'Estructura y tipos', `
      Todo el código Java vive dentro de una **clase**, y el programa empieza en \`main\`:

      \`\`\`
      public class Main {
          public static void main(String[] args) {
              int edad = 30;            // entero de 32 bits
              double precio = 9.99;     // decimal de 64 bits
              boolean activo = true;
              char inicial = 'A';       // un carácter: comillas simples
              String nombre = "Ada";    // objeto: comillas dobles
              var total = edad * 2;     // var infiere el tipo (int)
              System.out.println(nombre + " " + total);
          }
      }
      \`\`\`

      - Java es de **tipado estático**: el tipo se fija al compilar.
      - Tipos primitivos: \`int\`, \`long\`, \`double\`, \`boolean\`, \`char\`… No son objetos.
      - Dividir dos \`int\` da un \`int\`: \`7 / 2\` es \`3\`.
    `, [
      predict(`
        int a = 7;
        int b = 2;
        System.out.println(a / b);
        System.out.println(a / 2.0);`, `
        3
        3.5`, 'Entre enteros la división trunca; si un operando es `double`, el resultado es `double`.'),
      mc('¿Qué tipo usarías para guardar `3_000_000_000` (tres mil millones)?', ['`long`', '`int`', '`short`', '`char`'], '`int` llega hasta ~2 147 millones. `long` tiene 64 bits.'),
      predict(`
        String lang = "Java";
        int version = 21;
        System.out.println(lang + " " + version);
        System.out.println(1 + 2 + "3");`, `
        Java 21
        33`, 'El `+` se evalúa de izquierda a derecha: `1 + 2` es 3 y luego se concatena con "3".'),
      bug(`
        int edad = 30;
        String nombre = 'Ada';
        boolean activo = true;
        System.out.println(nombre + " " + edad);`, 2, 'Las comillas simples son para un `char`. Un `String` va entre comillas dobles: `"Ada"`.'),
      fill(`
        ___ precio = 19.99;
        ___ unidades = 3;
        System.out.println(precio * unidades > 50);`, ['double', 'int'], undefined, 'true'),
      predict(`
        char c = 'a';
        System.out.println(c + 1);
        System.out.println((char) (c + 1));`, `
        98
        b`, 'Un `char` es un número: sumarle un `int` da un `int`. El cast `(char)` lo convierte de vuelta.'),
      ask('¿Cómo se llama el método donde empieza a ejecutarse un programa Java?', ['main', 'main()'], 'La JVM busca `public static void main(String[] args)`.'),
    ]),

    lesson('j-ctrl', 'Control de flujo', `
      \`\`\`
      if (nota >= 5) { ... } else if (nota >= 3) { ... } else { ... }

      for (int i = 0; i < 3; i++) { ... }
      for (String s : lista) { ... }        // for-each
      while (n > 0) { n--; }

      String tipo = switch (dia) {           // switch como expresión
          case "SAB", "DOM" -> "finde";
          default -> "laboral";
      };
      \`\`\`

      - La condición debe ser un \`boolean\` (no vale un \`int\` como en C).
      - \`&&\` y \`||\` cortocircuitan; \`!\` niega.
      - El \`switch\` con flechas no necesita \`break\` y devuelve un valor.
      - Operador ternario: \`cond ? a : b\`.
    `, [
      predict(`
        int total = 0;
        for (int i = 1; i <= 4; i++) {
            total += i;
        }
        System.out.println(total);`, '10'),
      predict(`
        int dia = 6;
        String tipo = switch (dia) {
            case 6, 7 -> "finde";
            default -> "laboral";
        };
        System.out.println(tipo);`, 'finde'),
      fill(`
        int n = 7;
        String tipo = n % 2 == 0 ___ "par" ___ "impar";
        System.out.println(tipo);`, ['?', ':'], 'El operador ternario: `condicion ? siVerdadero : siFalso`.', 'impar'),
      predict(`
        for (int i = 0; i < 6; i++) {
            if (i == 1) continue;
            if (i == 4) break;
            System.out.print(i + " ");
        }`, '0 2 3'),
      bug(`
        int x = 5;
        if (x = 5) {
            System.out.println("cinco");
        }`, 2, '`=` asigna y produce un `int`, pero `if` exige un `boolean`. Hay que comparar con `==`.'),
      parsons('Ordena para imprimir la cuenta atrás 3, 2, 1', `
        int n = 3;
        while (n > 0) {
            System.out.println(n);
            n--;
        }`, undefined, `
        3
        2
        1`),
      mc('¿Qué imprime `System.out.println(5 > 3 && 2 > 4);`?', ['false', 'true', '1', 'No compila'], '`&&` exige que ambas condiciones sean verdaderas.'),
    ]),

    lesson('j-str', 'Strings', `
      \`String\` es un **objeto inmutable**: cada operación devuelve uno nuevo.

      \`\`\`
      String s = "Hola Mundo";
      s.length();            // 10
      s.charAt(0);           // 'H'
      s.substring(0, 4);     // "Hola"
      s.toUpperCase();       // "HOLA MUNDO"
      s.contains("Mun");     // true
      s.split(" ");          // ["Hola", "Mundo"]
      String.format("%s tiene %d", "Ada", 36);
      \`\`\`

      > Compara contenido con \`.equals()\`. El operador \`==\` compara **referencias**: si son el mismo objeto.

      Para concatenar en un bucle usa \`StringBuilder\`: evita crear miles de strings intermedios.
    `, [
      predict(`
        String a = "java";
        String b = new String("java");
        System.out.println(a == b);
        System.out.println(a.equals(b));`, `
        false
        true`, '`==` compara referencias (son objetos distintos); `.equals()` compara el contenido.'),
      predict(`
        String s = "encode";
        System.out.println(s.substring(1, 4) + " " + s.length());`, 'nco 6', '`substring(inicio, fin)` incluye el inicio y excluye el fin.'),
      fill(`
        String entrada = "  admin ";
        if (entrada.trim().___("admin")) {
            System.out.println("ok");
        }`, ['equals'], 'Nunca compares strings con `==`.', 'ok'),
      predict(`
        String s = "hola";
        s.toUpperCase();
        System.out.println(s);`, 'hola', 'Los strings son inmutables: `toUpperCase()` devuelve uno nuevo y aquí se descarta.'),
      predict(`
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 3; i++) {
            sb.append(i).append("-");
        }
        System.out.println(sb);`, '1-2-3-'),
      mc('¿Por qué usar `StringBuilder` al concatenar dentro de un bucle largo?', ['Evita crear un String nuevo en cada iteración', 'Porque `+` no funciona con strings', 'Porque es seguro entre hilos', 'Porque ordena el texto'], 'Cada `+` copia todo lo acumulado: O(n²) en total. `StringBuilder` modifica un único búfer.'),
      code('Completa el programa para que imprima la palabra al revés usando `StringBuilder`.', `
        public class Main {
            public static void main(String[] args) {
                String palabra = "encode";
                // imprime la palabra invertida
            }
        }`, `
        public class Main {
            public static void main(String[] args) {
                String palabra = "encode";
                System.out.println(new StringBuilder(palabra).reverse());
            }
        }`, 'edocne'),
    ]),

    lesson('j-arr', 'Arrays y métodos', `
      Un **array** tiene tamaño fijo y elementos del mismo tipo:

      \`\`\`
      int[] nums = {3, 1, 2};
      int[] ceros = new int[5];          // [0, 0, 0, 0, 0]
      nums.length;                       // 3 (sin paréntesis)
      Arrays.sort(nums);
      Arrays.toString(nums);             // "[1, 2, 3]"
      \`\`\`

      Un **método** declara tipo de retorno y tipos de parámetros:

      \`\`\`
      static int sumar(int a, int b) {
          return a + b;
      }
      \`\`\`

      - Java pasa todo **por valor**; con objetos y arrays, el valor es la referencia.
      - **Sobrecarga**: varios métodos con el mismo nombre y distintos parámetros.
      - Acceder fuera de rango lanza \`ArrayIndexOutOfBoundsException\`.
    `, [
      predict(`
        int[] nums = {5, 3, 8};
        Arrays.sort(nums);
        System.out.println(Arrays.toString(nums) + " " + nums.length);`, '[3, 5, 8] 3'),
      predict(`
        int[] a = new int[3];
        a[1] = 7;
        System.out.println(a[0] + a[1] + a[2]);`, '7', 'Un array de `int` recién creado está lleno de ceros.'),
      predict(`
        class Main {
            static void cambiar(int[] arr, int n) {
                arr[0] = 99;
                n = 99;
            }

            public static void main(String[] args) {
                int[] datos = {1, 2};
                int x = 1;
                cambiar(datos, x);
                System.out.println(datos[0] + " " + x);
            }
        }`, '99 1', 'Se copia la referencia al array (apunta al mismo objeto), pero el `int` se copia por valor.'),
      bug(`
        int[] nums = {10, 20, 30};
        for (int i = 0; i <= nums.length; i++) {
            System.out.println(nums[i]);
        }`, 2, 'Con `<=` se accede a `nums[3]`, que no existe. Debe ser `i < nums.length`.'),
      fill(`
        class Main {
            static ___ doble(int n) {
                ___ n * 2;
            }

            public static void main(String[] args) {
                System.out.println(doble(21));
            }
        }`, ['int', 'return'], undefined, '42'),
      mc('¿Qué es la sobrecarga de métodos (*overloading*)?', ['Varios métodos con el mismo nombre y distinta lista de parámetros', 'Redefinir un método heredado', 'Llamar a un método demasiadas veces', 'Un método que se llama a sí mismo'], 'Redefinir un método heredado es *overriding*; llamarse a sí mismo es recursión.'),
      code('Completa `maximo` para que devuelva el mayor valor del array.', `
        public class Main {
            static int maximo(int[] nums) {
                // tu código
                return 0;
            }

            public static void main(String[] args) {
                System.out.println(maximo(new int[]{4, 9, 2}));
                System.out.println(maximo(new int[]{-5, -1, -3}));
            }
        }`, `
        public class Main {
            static int maximo(int[] nums) {
                int max = nums[0];
                for (int n : nums) {
                    if (n > max) max = n;
                }
                return max;
            }

            public static void main(String[] args) {
                System.out.println(maximo(new int[]{4, 9, 2}));
                System.out.println(maximo(new int[]{-5, -1, -3}));
            }
        }`, `
        9
        -1`),
    ]),
  ]),

  unit('jv2', 'Orientación a objetos', 'basico', 'Clases, herencia, interfaces, records y enums: cómo se modela un dominio en Java.', [
    lesson('j-class', 'Clases y objetos', `
      Una clase agrupa **estado** (campos) y **comportamiento** (métodos):

      \`\`\`
      public class Cuenta {
          private double saldo;              // encapsulado
          private final String titular;      // no cambia tras construir

          public Cuenta(String titular) {    // constructor
              this.titular = titular;
          }

          public void depositar(double cantidad) {
              if (cantidad <= 0) throw new IllegalArgumentException();
              saldo += cantidad;
          }

          public double getSaldo() { return saldo; }
      }
      \`\`\`

      - \`private\` oculta los detalles; el acceso pasa por métodos que protegen las invariantes.
      - \`static\` pertenece a la clase, no a cada objeto.
      - \`final\` en un campo: se asigna una vez.
    `, [
      predict(`
        class Contador {
            private int n;
            void sumar() { n++; }
            int valor() { return n; }
        }
        Contador c = new Contador();
        c.sumar();
        c.sumar();
        System.out.println(c.valor());`, '2'),
      predict(`
        class Punto {
            int x;
            Punto(int x) { this.x = x; }
        }
        Punto a = new Punto(1);
        Punto b = a;
        b.x = 5;
        System.out.println(a.x);`, '5', '`a` y `b` son dos referencias al mismo objeto.'),
      mc('¿Para qué sirve declarar un campo como `private`?', ['Para que solo la propia clase pueda leerlo o modificarlo', 'Para que no ocupe memoria', 'Para que sea constante', 'Para compartirlo entre todas las instancias'], 'Es la base de la encapsulación: la clase controla sus propias invariantes.'),
      predict(`
        class Usuario {
            static int total = 0;
            Usuario() { total++; }
        }
        new Usuario();
        new Usuario();
        System.out.println(Usuario.total);`, '2', 'Un campo `static` es uno solo, compartido por todas las instancias.'),
      fill(`
        class Producto {
            private final String nombre;

            Producto(String nombre) {
                ___.nombre = nombre;
            }

            String nombre() { return nombre; }
        }
        System.out.println(new Producto("cafe").nombre());`, ['this'], '`this.nombre` es el campo; `nombre` a secas es el parámetro.', 'cafe'),
      bug(`
        class Circulo {
            private final double radio;
            Circulo(double radio) { this.radio = radio; }
            void crecer() { radio = radio * 2; }
        }`, 4, 'Un campo `final` no se puede reasignar después del constructor.'),
    ]),

    lesson('j-inh', 'Herencia y polimorfismo', `
      \`extends\` crea una subclase que hereda campos y métodos, y puede **sobrescribirlos**:

      \`\`\`
      class Animal {
          String sonido() { return "..."; }
      }

      class Perro extends Animal {
          @Override
          String sonido() { return "Guau"; }
      }

      Animal a = new Perro();    // tipo declarado: Animal; objeto real: Perro
      a.sonido();                // "Guau" — se decide en tiempo de ejecución
      \`\`\`

      - \`super(...)\` llama al constructor de la clase madre; \`super.metodo()\`, a su versión.
      - \`@Override\` pide al compilador que verifique que realmente sobrescribes algo.
      - Java solo permite heredar de **una** clase.

      > Prefiere la composición a la herencia: hereda solo cuando hay una relación «es un» genuina.
    `, [
      predict(`
        class Animal {
            String sonido() { return "..."; }
        }
        class Gato extends Animal {
            @Override
            String sonido() { return "Miau"; }
        }
        Animal a = new Gato();
        System.out.println(a.sonido());`, 'Miau', 'Despacho dinámico: se ejecuta el método del objeto real, no el del tipo declarado.'),
      predict(`
        class Base {
            Base() { System.out.println("base"); }
        }
        class Hija extends Base {
            Hija() { System.out.println("hija"); }
        }
        new Hija();`, `
        base
        hija`, 'El constructor de la superclase siempre se ejecuta primero.'),
      mc('¿Qué hace la anotación `@Override`?', ['Pide al compilador que verifique que el método sobrescribe uno heredado', 'Hace el método más rápido', 'Impide que se herede el método', 'Convierte el método en estático'], 'Si te equivocas en el nombre o la firma, el compilador te avisa.'),
      fill(`
        class Empleado {
            String nombre;
            Empleado(String nombre) { this.nombre = nombre; }
        }
        class Jefe extends Empleado {
            Jefe(String nombre) {
                ___(nombre);
            }
        }
        System.out.println(new Jefe("Ana").nombre);`, ['super'], '`super(...)` invoca al constructor de la clase madre.', 'Ana'),
      tf('En Java, una clase puede heredar (`extends`) de varias clases a la vez.', false, 'Solo herencia simple de clases. Sí puede implementar varias interfaces.'),
      predict(`
        class Figura {
            double area() { return 0; }
            String info() { return "area=" + area(); }
        }
        class Cuadrado extends Figura {
            double area() { return 4; }
        }
        System.out.println(new Cuadrado().info());`, 'area=4.0', '`info()` está en `Figura`, pero `area()` se resuelve en el objeto real.'),
    ]),

    lesson('j-iface', 'Interfaces y clases abstractas', `
      Una **interfaz** define un contrato: qué métodos existen, no cómo se implementan.

      \`\`\`
      interface Notificador {
          void enviar(String mensaje);
          default void saludar() { enviar("hola"); }   // implementación por defecto
      }

      class Email implements Notificador {
          public void enviar(String mensaje) { ... }
      }
      \`\`\`

      Una **clase abstracta** puede tener estado y métodos implementados, pero no se puede instanciar:

      \`\`\`
      abstract class Figura {
          abstract double area();
          String describir() { return "Area: " + area(); }
      }
      \`\`\`

      > Programa contra interfaces: \`List<String> xs = new ArrayList<>()\`. Podrás cambiar la implementación sin tocar el resto.
    `, [
      predict(`
        interface Saludo {
            String texto();
            default String gritar() { return texto().toUpperCase(); }
        }
        class Hola implements Saludo {
            public String texto() { return "hola"; }
        }
        System.out.println(new Hola().gritar());`, 'HOLA'),
      mc('¿Cuál es una diferencia real entre interfaz y clase abstracta?', ['Una clase puede implementar varias interfaces, pero heredar de una sola clase', 'Las interfaces pueden tener constructores', 'Las clases abstractas no pueden tener métodos implementados', 'Las interfaces se pueden instanciar con `new`'], 'Además, solo la clase abstracta puede tener campos de instancia.'),
      bug(`
        abstract class Figura {
            abstract double area();
        }
        Figura f = new Figura();
        System.out.println(f.area());`, 4, 'Una clase abstracta no se puede instanciar: hay que crear una subclase concreta.'),
      fill(`
        interface Volador {
            String volar();
        }
        class Dron ___ Volador {
            public String volar() { return "zum"; }
        }
        Volador v = new Dron();
        System.out.println(v.volar());`, ['implements'], undefined, 'zum'),
      mc('¿Por qué declarar `List<String> nombres = new ArrayList<>()` y no `ArrayList<String> nombres`?', ['El código depende del contrato y se puede cambiar la implementación', 'Porque `ArrayList` está obsoleta', 'Porque `List` es más rápida', 'Porque `ArrayList` no admite genéricos'], 'Es el principio de programar contra interfaces.'),
      predict(`
        interface Operacion {
            int aplicar(int a, int b);
        }
        Operacion suma = (a, b) -> a + b;
        Operacion producto = (a, b) -> a * b;
        System.out.println(suma.aplicar(3, 4) + " " + producto.aplicar(3, 4));`, '7 12', 'Una interfaz con un único método abstracto se puede implementar con una lambda.'),
    ]),

    lesson('j-rec', 'Records y enums', `
      Un **record** es una clase de datos inmutable: genera constructor, accesores, \`equals\`, \`hashCode\` y \`toString\`.

      \`\`\`
      record Punto(int x, int y) {
          double distancia() { return Math.sqrt(x * x + y * y); }
      }
      var p = new Punto(3, 4);
      p.x();                    // accesor (sin «get»)
      \`\`\`

      Un **enum** es un conjunto cerrado de constantes con tipo, que puede tener campos y métodos:

      \`\`\`
      enum Estado { PENDIENTE, PAGADO, ENVIADO }

      enum Plan {
          FREE(0), PRO(10);
          final int precio;
          Plan(int precio) { this.precio = precio; }
      }
      \`\`\`

      Usa enums en lugar de strings o enteros «mágicos»: el compilador detecta los errores.
    `, [
      predict(`
        record Punto(int x, int y) {}
        Punto a = new Punto(1, 2);
        Punto b = new Punto(1, 2);
        System.out.println(a.equals(b));
        System.out.println(a);`, `
        true
        Punto[x=1, y=2]`, 'Los records comparan por valor y traen un `toString` legible.'),
      predict(`
        enum Nivel { BAJO, MEDIO, ALTO }
        Nivel n = Nivel.MEDIO;
        System.out.println(n + " " + n.ordinal() + " " + Nivel.values().length);`, 'MEDIO 1 3'),
      mc('¿Qué NO genera automáticamente un record?', ['Métodos setter', 'Constructor', '`equals` y `hashCode`', '`toString`'], 'Los records son inmutables: no hay setters.'),
      predict(`
        enum Plan {
            FREE(0), PRO(10);
            final int precio;
            Plan(int precio) { this.precio = precio; }
        }
        System.out.println(Plan.PRO.precio * 12);`, '120'),
      fill(`
        ___ Usuario(String nombre, int edad) {}
        Usuario u = new Usuario("Ada", 36);
        System.out.println(u.nombre() + " " + u.edad());`, ['record'], undefined, 'Ada 36'),
      predict(`
        enum Semaforo { ROJO, VERDE }
        Semaforo s = Semaforo.valueOf("VERDE");
        String accion = switch (s) {
            case ROJO -> "parar";
            case VERDE -> "avanzar";
        };
        System.out.println(accion);`, 'avanzar', 'Con un enum, el `switch` es exhaustivo: no hace falta `default`.'),
    ]),
  ]),

  unit('jv3', 'Biblioteca estándar', 'intermedio', 'Colecciones, genéricos, excepciones y Optional: las herramientas de cada día.', [
    lesson('j-coll', 'Colecciones', `
      Las tres interfaces que usarás a diario:

      \`\`\`
      List<String> lista = new ArrayList<>();     // ordenada, admite duplicados
      lista.add("a"); lista.get(0); lista.size();

      Set<String> unicos = new HashSet<>();        // sin duplicados, búsqueda O(1)
      unicos.add("a"); unicos.contains("a");

      Map<String, Integer> edades = new HashMap<>();   // clave → valor
      edades.put("ana", 30);
      edades.getOrDefault("luis", 0);
      for (var e : edades.entrySet()) { e.getKey(); e.getValue(); }
      \`\`\`

      - \`List.of(...)\`, \`Set.of(...)\`, \`Map.of(...)\` crean colecciones **inmutables**.
      - \`HashMap\` no garantiza orden; \`LinkedHashMap\` conserva el de inserción; \`TreeMap\` ordena por clave.
      - \`ArrayDeque\` sirve como pila y como cola.
    `, [
      predict(`
        List<String> langs = new ArrayList<>();
        langs.add("go");
        langs.add("rust");
        langs.add(0, "java");
        System.out.println(langs + " " + langs.size());`, '[java, go, rust] 3'),
      predict(`
        Set<Integer> vistos = new HashSet<>();
        for (int n : new int[]{1, 2, 2, 3, 1}) {
            vistos.add(n);
        }
        System.out.println(vistos.size());`, '3', 'Un `Set` ignora los duplicados.'),
      predict(`
        Map<String, Integer> stock = new HashMap<>();
        stock.put("cafe", 2);
        stock.put("cafe", stock.get("cafe") + 3);
        System.out.println(stock.get("cafe") + " " + stock.getOrDefault("te", 0));`, '5 0'),
      bug(`
        List<String> nombres = List.of("ana", "luis");
        nombres.add("eva");
        System.out.println(nombres);`, 2, '`List.of` crea una lista inmutable: `add` lanza `UnsupportedOperationException`. Usa `new ArrayList<>(List.of(...))`.'),
      fill(`
        Map<String, Integer> cuentas = new HashMap<>();
        for (String p : List.of("a", "b", "a")) {
            cuentas.___(p, 1, Integer::sum);
        }
        System.out.println(cuentas.get("a"));`, ['merge'], '`merge(clave, 1, Integer::sum)` inserta 1 o suma al valor existente: el idiom para contar.', '2'),
      match('Empareja cada necesidad con su colección', [
        ['Lista con acceso por índice', '`ArrayList`'],
        ['Comprobar pertenencia sin duplicados', '`HashSet`'],
        ['Diccionario ordenado por clave', '`TreeMap`'],
        ['Pila o cola eficiente', '`ArrayDeque`'],
      ]),
      predict(`
        Deque<Integer> pila = new ArrayDeque<>();
        pila.push(1);
        pila.push(2);
        pila.push(3);
        System.out.println(pila.pop() + " " + pila.peek());`, '3 2', '`push`/`pop` trabajan por la cabeza: último en entrar, primero en salir.'),
    ]),

    lesson('j-gen', 'Genéricos', `
      Los genéricos parametrizan clases y métodos por tipo, con seguridad en compilación:

      \`\`\`
      class Caja<T> {
          private final T valor;
          Caja(T valor) { this.valor = valor; }
          T get() { return valor; }
      }

      static <T extends Comparable<T>> T maximo(T a, T b) {
          return a.compareTo(b) >= 0 ? a : b;
      }
      \`\`\`

      - \`<T extends X>\` restringe T a subtipos de X.
      - Los tipos primitivos no valen como parámetro: se usa \`Integer\`, \`Double\`… (*autoboxing*).
      - Comodines: \`List<? extends Number>\` para **leer**, \`List<? super Integer>\` para **escribir** (regla PECS).
      - **Borrado de tipos**: en ejecución, \`List<String>\` y \`List<Integer>\` son la misma clase.
    `, [
      predict(`
        class Caja<T> {
            private final T valor;
            Caja(T valor) { this.valor = valor; }
            T get() { return valor; }
        }
        Caja<String> c = new Caja<>("hola");
        System.out.println(c.get().length());`, '4'),
      mc('¿Qué ventaja dan los genéricos frente a usar `Object`?', ['Los errores de tipo se detectan al compilar y no hacen falta casts', 'El programa ocupa menos memoria', 'Permiten usar tipos primitivos directamente', 'Hacen el código más rápido en ejecución'], 'Sin genéricos, un cast incorrecto falla en producción con `ClassCastException`.'),
      bug(`
        List<int> numeros = new ArrayList<>();
        numeros.add(5);
        System.out.println(numeros);`, 1, 'Los genéricos no admiten primitivos: debe ser `List<Integer>`.'),
      predict(`
        Integer a = 127, b = 127;
        Integer c = 1000, d = 1000;
        System.out.println(a == b);
        System.out.println(c == d);
        System.out.println(c.equals(d));`, `
        true
        false
        true`, 'Java cachea los `Integer` de −128 a 127. Fuera de ese rango, `==` compara objetos distintos: usa siempre `.equals()`.'),
      fill(`
        class Main {
            static <T ___ Comparable<T>> T mayor(T a, T b) {
                return a.compareTo(b) >= 0 ? a : b;
            }

            public static void main(String[] args) {
                System.out.println(mayor("go", "rust") + " " + mayor(3, 9));
            }
        }`, ['extends'], 'El límite `extends Comparable<T>` garantiza que existe `compareTo`.', 'rust 9'),
      tf('En tiempo de ejecución, la JVM distingue entre `List<String>` y `List<Integer>`.', false, 'Por el borrado de tipos (*type erasure*), ambos son simplemente `List`.'),
    ]),

    lesson('j-exc', 'Excepciones', `
      \`\`\`
      try {
          procesar(archivo);
      } catch (FileNotFoundException e) {
          log.warn("no existe", e);
      } catch (IOException | TimeoutException e) {
          throw new ServicioException("fallo al procesar", e);   // conserva la causa
      } finally {
          limpiar();        // siempre se ejecuta
      }

      try (var lector = new BufferedReader(new FileReader(ruta))) {
          return lector.readLine();
      }                     // try-with-resources: cierra solo
      \`\`\`

      - **Checked** (\`IOException\`): el compilador obliga a capturarlas o declararlas con \`throws\`.
      - **Unchecked** (\`RuntimeException\`): errores de programación como \`NullPointerException\`.
      - No captures \`Exception\` a ciegas ni te tragues el error con un \`catch\` vacío.
    `, [
      predict(`
        try {
            int[] a = new int[2];
            a[5] = 1;
            System.out.println("ok");
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("fuera");
        } finally {
            System.out.println("fin");
        }`, `
        fuera
        fin`),
      mc('¿Cuál de estas es una excepción *checked*?', ['`IOException`', '`NullPointerException`', '`IllegalArgumentException`', '`ArithmeticException`'], 'Las demás heredan de `RuntimeException`: el compilador no obliga a tratarlas.'),
      predict(`
        class Main {
            static int dividir(int a, int b) {
                if (b == 0) throw new IllegalArgumentException("b no puede ser 0");
                return a / b;
            }

            public static void main(String[] args) {
                try {
                    System.out.println(dividir(6, 0));
                } catch (IllegalArgumentException e) {
                    System.out.println("error: " + e.getMessage());
                }
            }
        }`, 'error: b no puede ser 0'),
      fill(`
        class Main {
            static String leer(String ruta) ___ java.io.IOException {
                throw new java.io.IOException("no existe " + ruta);
            }

            public static void main(String[] args) {
                try {
                    leer("a.txt");
                } catch (java.io.IOException e) {
                    System.out.println(e.getMessage());
                }
            }
        }`, ['throws'], 'Una excepción checked que no se captura debe declararse en la firma con `throws`.', 'no existe a.txt'),
      mc('¿Qué garantiza `try (var r = abrir()) { ... }`?', ['Que `r.close()` se llama al salir del bloque, haya error o no', 'Que no se lanzará ninguna excepción', 'Que el bloque se ejecuta en otro hilo', 'Que `r` no puede ser null'], 'Es *try-with-resources*: funciona con cualquier `AutoCloseable`.'),
      predict(`
        class Main {
            static int probar() {
                try {
                    return 1;
                } finally {
                    System.out.println("limpieza");
                }
            }

            public static void main(String[] args) {
                System.out.println(probar());
            }
        }`, `
        limpieza
        1`, '`finally` se ejecuta incluso cuando el `try` hace `return`.'),
    ]),

    lesson('j-opt', 'Optional y null', `
      \`null\` es la causa del error más famoso de Java: \`NullPointerException\`. \`Optional<T>\` hace **explícita** la ausencia de valor:

      \`\`\`
      Optional<Usuario> buscar(String id) { ... }

      String nombre = buscar("42")
          .map(Usuario::nombre)
          .orElse("anónimo");

      buscar("42").ifPresent(u -> enviarEmail(u));
      Usuario u = buscar("42").orElseThrow(() -> new NoEncontrado("42"));
      \`\`\`

      - Úsalo como **tipo de retorno**, no en campos ni parámetros.
      - Evita \`.get()\` sin comprobar: es volver a tener un NPE con otro nombre.
      - \`Objects.requireNonNull(x)\` valida argumentos al principio de un método.
    `, [
      predict(`
        Optional<String> nombre = Optional.empty();
        System.out.println(nombre.orElse("anonimo"));
        System.out.println(nombre.isPresent());`, `
        anonimo
        false`),
      predict(`
        Optional<String> lang = Optional.of("java");
        System.out.println(lang.map(String::toUpperCase).orElse("?"));`, 'JAVA'),
      bug(`
        String ciudad = null;
        int largo = ciudad.length();
        System.out.println(largo);`, 2, 'Llamar a un método sobre `null` lanza `NullPointerException`.'),
      fill(`
        Map<String, String> emails = Map.of("ana", "ana@x.dev");
        String email = Optional.___(emails.get("luis")).orElse("sin email");
        System.out.println(email);`, ['ofNullable'], '`Optional.of(null)` lanza NPE; `ofNullable` acepta null y devuelve un Optional vacío.', 'sin email'),
      mc('¿Dónde se recomienda usar `Optional`?', ['Como tipo de retorno de métodos que pueden no encontrar un resultado', 'En todos los campos de las clases', 'Como parámetro de todos los métodos', 'Para envolver colecciones'], 'Para colecciones, devuelve una colección vacía en lugar de `Optional` o `null`.'),
      predict(`
        Optional<Integer> n = Optional.of(5);
        int r = n.filter(x -> x > 10).map(x -> x * 2).orElse(-1);
        System.out.println(r);`, '-1', '`filter` deja el Optional vacío porque 5 no es mayor que 10.'),
    ]),
  ]),

  unit('jv4', 'Java funcional y concurrente', 'avanzado', 'Lambdas, streams, hilos y cómo gestiona la memoria la JVM.', [
    lesson('j-lambda', 'Lambdas e interfaces funcionales', `
      Una **lambda** es una función anónima. Implementa una *interfaz funcional* (un solo método abstracto):

      \`\`\`
      Function<Integer, Integer> doble = x -> x * 2;        // T -> R
      Predicate<String> vacio = s -> s.isEmpty();           // T -> boolean
      Supplier<List<String>> crear = ArrayList::new;        // () -> T
      Consumer<String> imprimir = System.out::println;      // T -> void
      BiFunction<Integer, Integer, Integer> suma = (a, b) -> a + b;
      Comparator<String> porLongitud = Comparator.comparing(String::length);
      \`\`\`

      - \`Clase::metodo\` es una **referencia a método**: una lambda más corta.
      - Una lambda solo captura variables locales *efectivamente finales*.
    `, [
      predict(`
        Function<Integer, Integer> doble = x -> x * 2;
        Function<Integer, Integer> masUno = x -> x + 1;
        System.out.println(doble.andThen(masUno).apply(5));`, '11', '`andThen` compone: primero `doble` (10) y después `masUno` (11).'),
      match('Empareja cada interfaz funcional con su forma', [
        ['`Function<T, R>`', 'Recibe T, devuelve R'],
        ['`Predicate<T>`', 'Recibe T, devuelve boolean'],
        ['`Supplier<T>`', 'No recibe nada, devuelve T'],
        ['`Consumer<T>`', 'Recibe T, no devuelve nada'],
      ]),
      predict(`
        List<String> langs = new ArrayList<>(List.of("python", "go", "rust"));
        langs.sort(Comparator.comparing(String::length));
        System.out.println(langs);`, '[go, rust, python]'),
      fill(`
        Predicate<Integer> esPar = n -> n % 2 == 0;
        System.out.println(esPar.___(8) + " " + esPar.negate().___(8));`, ['test', 'test'], 'El método de `Predicate` es `test`.', 'true false'),
      bug(`
        int contador = 0;
        Runnable r = () -> contador++;
        r.run();
        System.out.println(contador);`, 2, 'Una lambda no puede modificar una variable local: debe ser efectivamente final. Usa un `AtomicInteger` o un campo.'),
      predict(`
        List<String> nombres = List.of("ana", "luis");
        nombres.forEach(n -> System.out.print(n.toUpperCase() + " "));`, 'ANA LUIS'),
    ]),

    lesson('j-stream', 'Streams', `
      Un **stream** procesa colecciones de forma declarativa: *fuente → operaciones intermedias → operación terminal*.

      \`\`\`
      List<String> nombres = usuarios.stream()
          .filter(u -> u.edad() >= 18)                 // intermedia (perezosa)
          .sorted(Comparator.comparing(Usuario::nombre))
          .map(Usuario::nombre)
          .toList();                                   // terminal

      Map<String, List<Usuario>> porCiudad =
          usuarios.stream().collect(Collectors.groupingBy(Usuario::ciudad));
      \`\`\`

      - Las operaciones intermedias no hacen nada hasta que llega la terminal.
      - Terminales: \`toList()\`, \`collect\`, \`count\`, \`sum\`, \`reduce\`, \`findFirst\`, \`anyMatch\`, \`forEach\`.
      - Un stream se consume una sola vez.
      - \`IntStream.range(0, n)\` sustituye a muchos bucles con índice.
    `, [
      predict(`
        List<Integer> nums = List.of(1, 2, 3, 4, 5, 6);
        System.out.println(nums.stream().filter(n -> n % 2 == 0).map(n -> n * n).toList());`, '[4, 16, 36]'),
      predict(`
        int total = IntStream.rangeClosed(1, 5).sum();
        long pares = IntStream.rangeClosed(1, 5).filter(n -> n % 2 == 0).count();
        System.out.println(total + " " + pares);`, '15 2'),
      predict(`
        List<String> langs = List.of("go", "rust", "java", "c");
        Map<Integer, List<String>> porLongitud = langs.stream().collect(Collectors.groupingBy(String::length));
        System.out.println(porLongitud.get(4));`, '[rust, java]'),
      fill(`
        List<String> nombres = List.of("ana", "luis", "eva");
        String resultado = nombres.stream()
            .___(n -> n.length() == 3)
            .___(String::toUpperCase)
            .collect(Collectors.joining(","));
        System.out.println(resultado);`, ['filter', 'map'], undefined, 'ANA,EVA'),
      mc('¿Cuándo se ejecuta el `filter` de un stream?', ['Cuando se invoca la operación terminal', 'En cuanto se llama a `filter`', 'Al crear la lista original', 'Nunca: es solo una declaración'], 'Los streams son perezosos: sin operación terminal no se procesa ningún elemento.'),
      predict(`
        List<Integer> nums = List.of(3, 8, 1, 9);
        System.out.println(nums.stream().reduce(0, Integer::sum));
        System.out.println(nums.stream().max(Integer::compare).get());
        System.out.println(nums.stream().anyMatch(n -> n > 8));`, `
        21
        9
        true`),
      code('Completa el programa: imprime, separados por comas, los nombres de más de 3 letras en mayúsculas y ordenados alfabéticamente.', `
        import java.util.*;
        import java.util.stream.*;

        public class Main {
            public static void main(String[] args) {
                List<String> nombres = List.of("luis", "ana", "marta", "eva", "bruno");
                String resultado = ""; // usa un stream
                System.out.println(resultado);
            }
        }`, `
        import java.util.*;
        import java.util.stream.*;

        public class Main {
            public static void main(String[] args) {
                List<String> nombres = List.of("luis", "ana", "marta", "eva", "bruno");
                String resultado = nombres.stream()
                    .filter(n -> n.length() > 3)
                    .map(String::toUpperCase)
                    .sorted()
                    .collect(Collectors.joining(","));
                System.out.println(resultado);
            }
        }`, 'BRUNO,LUIS,MARTA'),
    ]),

    lesson('j-conc', 'Concurrencia', `
      \`\`\`
      ExecutorService pool = Executors.newFixedThreadPool(4);
      Future<Integer> futuro = pool.submit(() -> calcular());
      int r = futuro.get();          // bloquea hasta tener el resultado
      pool.shutdown();

      CompletableFuture.supplyAsync(() -> descargar(url))
          .thenApply(this::parsear)
          .thenAccept(this::guardar);
      \`\`\`

      - **Condición de carrera**: dos hilos modifican el mismo dato sin coordinarse. \`contador++\` no es atómico.
      - Soluciones: \`synchronized\`, \`AtomicInteger\`, \`ConcurrentHashMap\`, o no compartir estado mutable.
      - **Deadlock**: dos hilos esperan cada uno el candado del otro.
      - **Hilos virtuales** (Java 21): hilos ligeros gestionados por la JVM; se pueden crear millones para tareas de E/S.

      \`\`\`
      try (var exec = Executors.newVirtualThreadPerTaskExecutor()) { exec.submit(tarea); }
      \`\`\`
    `, [
      predict(`
        ExecutorService pool = Executors.newFixedThreadPool(2);
        Future<Integer> f = pool.submit(() -> 6 * 7);
        System.out.println(f.get());
        pool.shutdown();`, '42'),
      mc('Dos hilos ejecutan `contador++` un millón de veces cada uno sin sincronizar. ¿Resultado?', ['Un valor impredecible, normalmente menor que 2 000 000', 'Siempre 2 000 000', 'Siempre 1 000 000', 'Un error de compilación'], '`contador++` son tres pasos (leer, sumar, escribir): los hilos se pisan. Es una condición de carrera.'),
      predict(`
        AtomicInteger contador = new AtomicInteger();
        Thread a = new Thread(() -> { for (int i = 0; i < 1000; i++) contador.incrementAndGet(); });
        Thread b = new Thread(() -> { for (int i = 0; i < 1000; i++) contador.incrementAndGet(); });
        a.start(); b.start();
        a.join(); b.join();
        System.out.println(contador.get());`, '2000', '`AtomicInteger` hace el incremento de forma atómica; `join` espera a que acaben los hilos.'),
      mc('¿Qué es un *deadlock*?', ['Dos o más hilos bloqueados para siempre, esperando cada uno un recurso que tiene el otro', 'Un hilo que consume el 100 % de CPU', 'Un hilo que termina antes de tiempo', 'Una excepción no capturada en un hilo'], 'Se evita adquiriendo los candados siempre en el mismo orden.'),
      predict(`
        CompletableFuture<String> f = CompletableFuture
            .supplyAsync(() -> "hola")
            .thenApply(String::toUpperCase)
            .thenApply(s -> s + "!");
        System.out.println(f.get());`, 'HOLA!'),
      mc('¿Para qué están pensados los hilos virtuales de Java 21?', ['Para manejar muchísimas tareas concurrentes de E/S con poco coste', 'Para acelerar cálculos intensivos de CPU', 'Para sustituir al recolector de basura', 'Para ejecutar código en la GPU'], 'Mientras un hilo virtual espera E/S, libera el hilo real del sistema operativo.'),
      fill(`
        class Contador {
            private int n = 0;
            ___ void sumar() { n++; }
            int valor() { return n; }
        }
        Contador c = new Contador();
        Thread a = new Thread(() -> { for (int i = 0; i < 500; i++) c.sumar(); });
        Thread b = new Thread(() -> { for (int i = 0; i < 500; i++) c.sumar(); });
        a.start(); b.start(); a.join(); b.join();
        System.out.println(c.valor());`, ['synchronized'], 'Solo un hilo a la vez puede ejecutar un método `synchronized` del mismo objeto.', '1000'),
    ]),

    lesson('j-mem', 'JVM y memoria', `
      El código Java se compila a **bytecode**, que la JVM interpreta y optimiza en caliente (compilador **JIT**).

      - **Stack**: uno por hilo. Guarda las llamadas, variables locales primitivas y referencias.
      - **Heap**: compartido. Ahí viven todos los objetos.
      - **Garbage Collector**: libera los objetos a los que ya no llega ninguna referencia.

      Errores típicos:

      - \`StackOverflowError\`: recursión demasiado profunda (o infinita).
      - \`OutOfMemoryError\`: heap lleno; a menudo por una **fuga**: una colección estática o caché que crece sin límite.

      Herramientas: \`-Xmx2g\` (tamaño máximo de heap), \`jcmd\`, \`jstack\` (volcado de hilos), VisualVM y Java Flight Recorder.

      > El GC evita liberar memoria a mano, pero no evita las fugas: si mantienes la referencia, el objeto sigue vivo.
    `, [
      mc('¿Dónde se almacenan los objetos creados con `new`?', ['En el heap', 'En el stack', 'En el bytecode', 'En el registro de la CPU'], 'En el stack solo queda la referencia (y los primitivos locales).'),
      mc('¿Qué error produce una recursión sin caso base?', ['`StackOverflowError`', '`OutOfMemoryError`', '`NullPointerException`', '`ClassNotFoundException`'], 'Cada llamada añade un marco a la pila hasta agotarla.'),
      match('Empareja cada pieza con su función', [
        ['`javac`', 'Compila el código fuente a bytecode'],
        ['JVM', 'Ejecuta el bytecode'],
        ['JIT', 'Compila a código máquina las partes más ejecutadas'],
        ['GC', 'Libera los objetos inalcanzables'],
      ]),
      tf('Con recolector de basura es imposible tener fugas de memoria en Java.', false, 'Si una colección de larga vida (p. ej. un `static Map`) conserva referencias, esos objetos nunca se liberan.'),
      mc('¿Qué opción de la JVM fija el tamaño máximo del heap?', ['`-Xmx`', '`-Xss`', '`-cp`', '`-D`'], '`-Xmx2g` permite hasta 2 GB de heap. `-Xss` ajusta el tamaño de la pila por hilo.'),
      predict(`
        String a = "hola";
        String b = "hola";
        String c = new String("hola");
        System.out.println((a == b) + " " + (a == c));`, 'true false', 'Los literales iguales comparten un único objeto en el *string pool*; `new String` crea otro en el heap.'),
    ]),
  ]),

  unit('jv5', 'Java profesional', 'experto', 'El Java moderno y el ecosistema de build y testing que usan los equipos.', [
    lesson('j-modern', 'Java moderno', `
      Desde Java 17–21, el lenguaje modela datos de forma mucho más expresiva:

      \`\`\`
      sealed interface Figura permits Circulo, Rectangulo {}
      record Circulo(double radio) implements Figura {}
      record Rectangulo(double ancho, double alto) implements Figura {}

      static double area(Figura f) {
          return switch (f) {                        // exhaustivo: sin default
              case Circulo c -> Math.PI * c.radio() * c.radio();
              case Rectangulo(double w, double h) -> w * h;   // desestructura el record
          };
      }

      if (obj instanceof String s && !s.isEmpty()) { ... }    // pattern matching

      String json = """
          {"lang": "java"}
          """;                                        // bloque de texto
      \`\`\`

      \`sealed\` cierra la jerarquía: el compilador sabe todos los casos y avisa si olvidas uno.
    `, [
      predict(`
        Object o = "encode";
        if (o instanceof String s && s.length() > 3) {
            System.out.println(s.toUpperCase());
        }`, 'ENCODE', 'El *pattern matching* comprueba el tipo y declara la variable `s` ya convertida.'),
      predict(`
        class Main {
            public static void main(String[] args) {
                Figura f = new Cuadrado(3);
                int r = switch (f) {
                    case Cuadrado c -> c.lado() * c.lado();
                    case Circulo c -> 3 * c.radio() * c.radio();
                };
                System.out.println(r);
            }
        }

        sealed interface Figura permits Cuadrado, Circulo {}
        record Cuadrado(int lado) implements Figura {}
        record Circulo(int radio) implements Figura {}`, '9'),
      mc('¿Qué aporta `sealed` a una interfaz?', ['Limita qué clases pueden implementarla, y así el `switch` puede ser exhaustivo', 'La hace inmutable', 'Impide que tenga métodos', 'La convierte en una clase final'], 'Si añades un caso nuevo, el compilador señala todos los `switch` que hay que actualizar.'),
      predict(`
        record Punto(int x, int y) {}
        Object o = new Punto(2, 5);
        if (o instanceof Punto(int x, int y)) {
            System.out.println(x + y);
        }`, '7', 'Los *record patterns* desestructuran los componentes directamente.'),
      fill(`
        Object valor = 42;
        String texto = switch (valor) {
            ___ Integer i when i > 10 -> "grande";
            ___ Integer i -> "pequeno";
            default -> "otro";
        };
        System.out.println(texto);`, ['case', 'case'], '`when` añade una condición (guarda) al patrón.', 'grande'),
      predict(`
        var texto = """
            SELECT *
            FROM users""";
        System.out.println(texto.lines().count());`, '2', 'Los bloques de texto conservan los saltos de línea y eliminan la sangría común.'),
    ]),

    lesson('j-build', 'Build y testing', `
      Nadie compila a mano en un proyecto real: **Maven** (\`pom.xml\`) o **Gradle** (\`build.gradle.kts\`) gestionan dependencias, compilación, tests y empaquetado.

      \`\`\`bash
      mvn test          # compila y ejecuta los tests
      mvn package       # genera el .jar
      ./gradlew build   # equivalente en Gradle
      \`\`\`

      Tests con **JUnit 5**:

      \`\`\`
      class CalculadoraTest {
          @Test
          void suma_dos_numeros() {
              assertEquals(5, new Calculadora().sumar(2, 3));
          }

          @Test
          void division_por_cero_lanza() {
              assertThrows(ArithmeticException.class, () -> calc.dividir(1, 0));
          }
      }
      \`\`\`

      - **Mockito** simula dependencias: \`when(repo.buscar(1)).thenReturn(usuario)\`.
      - Estructura estándar: \`src/main/java\` y \`src/test/java\`.
      - **Spring Boot** es el framework dominante para servicios backend.
    `, [
      mc('¿Qué archivo define las dependencias de un proyecto Maven?', ['`pom.xml`', '`package.json`', '`build.gradle`', '`Cargo.toml`'], 'Gradle usa `build.gradle(.kts)`; `package.json` es de Node y `Cargo.toml` de Rust.'),
      ask('¿Qué anotación marca un método como test en JUnit 5?', ['@Test', 'Test'], 'JUnit descubre y ejecuta los métodos anotados con `@Test`.'),
      mc('¿Qué comprueba `assertEquals(5, calc.sumar(2, 3))`?', ['Que el resultado real sea igual al esperado, 5', 'Que el método no devuelva null', 'Que el método tarde menos de 5 ms', 'Que se lance una excepción'], 'El primer argumento es el valor esperado; el segundo, el real.'),
      match('Empareja cada herramienta con su papel', [
        ['Maven / Gradle', 'Build y gestión de dependencias'],
        ['JUnit', 'Framework de tests'],
        ['Mockito', 'Dobles de prueba (mocks)'],
        ['Spring Boot', 'Framework para servicios y APIs'],
      ]),
      order('Ordena las fases de un build típico', ['Resolver y descargar dependencias', 'Compilar el código fuente', 'Ejecutar los tests', 'Empaquetar el artefacto (.jar)']),
      mc('¿En qué carpeta van los tests en la estructura estándar?', ['`src/test/java`', '`src/main/java`', '`test/`', '`target/`'], '`target/` (Maven) o `build/` (Gradle) contienen la salida generada y no se suben a git.'),
    ]),
  ]),
])
