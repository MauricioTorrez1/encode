import { ask, bug, code, fill, lesson, match, mc, order, predict, tf, track, unit } from '../dsl'

export default track('rust', 'rust', [
  unit('rs1', 'Sintaxis y ownership', 'basico', 'Variables, control, funciones y, sobre todo, el modelo de propiedad que hace único a Rust.', [
    lesson('rs-vars', 'Variables y tipos', `
      En Rust las variables son **inmutables por defecto**:

      \`\`\`
      let x = 5;            // inmutable
      let mut y = 5;        // mutable
      y += 1;
      const MAX: u32 = 100; // constante: tipo obligatorio
      let x = x * 2;        // *shadowing*: nueva variable con el mismo nombre
      \`\`\`

      - Enteros: \`i8..i128\`, \`u8..u128\`, \`isize\`, \`usize\`. Por defecto, \`i32\`. Decimales: \`f32\`, \`f64\`.
      - \`bool\`, \`char\` (4 bytes, Unicode), tuplas \`(i32, f64)\` y arrays \`[i32; 3]\`.
      - **No hay conversiones implícitas**: \`x as f64\`.
      - En modo *debug*, un desbordamiento de entero provoca *panic*.
      - \`println!\` es una **macro** (lleva \`!\`).
    `, [
      predict(`
        let x = 5;
        let x = x * 2;
        {
            let x = x + 1;
            println!("{x}");
        }
        println!("{x}");`, `
        11
        10`, 'El *shadowing* crea variables nuevas; la del bloque interno desaparece al salir.'),
      bug(`
        let contador = 0;
        contador += 1;
        println!("{contador}");`, 2, 'La variable es inmutable. Declárala con `let mut contador = 0;`.'),
      predict(`
        let a = 7;
        let b = 2;
        println!("{} {}", a / b, a as f64 / b as f64);`, '3 3.5'),
      mc('¿Qué tipo tiene por defecto el literal `42`?', ['`i32`', '`u64`', '`isize`', '`f64`'], 'Si no hay otra información, los enteros son `i32` y los decimales `f64`.'),
      fill(`
        let ___ total = 0;
        for i in 1..=3 {
            total += i;
        }
        println!("{total}");`, ['mut'], undefined, '6'),
      predict(`
        let t = (1, "dos", 3.5);
        let (a, b, c) = t;
        println!("{a} {b} {c} {}", t.0);`, '1 dos 3.5 1'),
      mc('¿Qué distingue a una macro como `println!` de una función?', ['Termina en `!` y se expande en tiempo de compilación', 'Es más lenta', 'Solo se puede usar en `main`', 'No admite argumentos'], 'Las macros generan código; `println!` admite un número variable de argumentos con formato.'),
    ]),

    lesson('rs-ctrl', 'Control y expresiones', `
      En Rust casi todo es una **expresión**: devuelve un valor.

      \`\`\`
      let tipo = if n % 2 == 0 { "par" } else { "impar" };   // if es expresión

      let r = loop {                  // loop infinito que devuelve con break
          if listo() { break 42; }
      };

      for i in 0..3 { }               // 0, 1, 2
      for i in (0..=3).rev() { }      // 3, 2, 1, 0
      while n > 0 { n -= 1; }

      match dia {                     // exhaustivo: hay que cubrir todos los casos
          1 | 7 => println!("finde"),
          2..=6 => println!("laboral"),
          _ => println!("invalido"),
      }
      \`\`\`

      - La condición del \`if\` debe ser \`bool\` y no lleva paréntesis.
      - El \`;\` convierte una expresión en una sentencia (descarta el valor).
    `, [
      predict(`
        let n = 7;
        let tipo = if n % 2 == 0 { "par" } else { "impar" };
        println!("{tipo}");`, 'impar'),
      predict(`
        let mut i = 0;
        let r = loop {
            i += 3;
            if i > 10 {
                break i * 2;
            }
        };
        println!("{r}");`, '24', '`loop` puede devolver un valor con `break`: i llega a 12 y devuelve 24.'),
      predict(`
        let n = 4;
        match n {
            1 | 2 => println!("pocos"),
            3..=5 => println!("algunos"),
            _ => println!("muchos"),
        }`, 'algunos'),
      predict(`
        for i in (1..=3).rev() {
            print!("{i} ");
        }`, '3 2 1'),
      bug(`
        let n = 3;
        let texto = match n {
            1 => "uno",
            2 => "dos",
        };
        println!("{texto}");`, 2, '`match` debe ser exhaustivo: falta un caso por defecto (`_ => ...`).'),
      fill(`
        let nota = 7;
        let resultado = ___ nota >= 5 { "aprobado" } else { "suspenso" };
        println!("{resultado}");`, ['if'], 'En Rust `if` es una expresión y se puede asignar.', 'aprobado'),
    ]),

    lesson('rs-fn', 'Funciones', `
      \`\`\`
      fn suma(a: i32, b: i32) -> i32 {
          a + b                       // sin ; → es el valor de retorno
      }

      fn saludar(nombre: &str) {      // sin -> devuelve ()
          println!("hola {nombre}");
      }
      \`\`\`

      - Los parámetros **siempre** llevan tipo; el retorno se declara con \`->\`.
      - La **última expresión sin \`;\`** es el valor devuelto. \`return\` sirve para salir antes.
      - Puedes devolver varios valores con una tupla.
      - Las **closures** son funciones anónimas: \`let doble = |x| x * 2;\`. Capturan su entorno.
    `, [
      predict(`
        fn cuadrado(n: i32) -> i32 {
            n * n
        }

        fn main() {
            println!("{}", cuadrado(6));
        }`, '36'),
      bug(`
        fn doble(n: i32) -> i32 {
            n * 2;
        }`, 2, 'Con `;` la expresión pasa a ser una sentencia y la función devuelve `()` en vez de `i32`. Quita el punto y coma.'),
      predict(`
        fn dividir(a: i32, b: i32) -> (i32, i32) {
            (a / b, a % b)
        }

        fn main() {
            let (c, r) = dividir(17, 5);
            println!("{c} {r}");
        }`, '3 2'),
      predict(`
        let base = 10;
        let sumar = |x| x + base;
        println!("{}", sumar(5));`, '15', 'La closure captura `base` de su entorno.'),
      fill(`
        fn media(a: f64, b: f64) ___ f64 {
            (a + b) / 2.0
        }

        fn main() {
            println!("{}", media(4.0, 6.0));
        }`, ['->'], undefined, '5'),
      mc('¿Qué devuelve una función sin tipo de retorno declarado?', ['`()` (la tupla vacía, «unit»)', '`null`', '`void`', '`0`'], 'El tipo unit `()` es el equivalente a `void`, pero es un valor real.'),
    ]),

    lesson('rs-own', 'Ownership', `
      La idea central de Rust: **cada valor tiene un único dueño**, y cuando el dueño sale de ámbito, el valor se libera. Así no hay recolector de basura ni liberaciones manuales.

      \`\`\`
      let a = String::from("hola");
      let b = a;                // la propiedad se MUEVE a b
      // println!("{a}");       // error: a ya no es válido

      let c = b.clone();        // copia profunda explícita
      \`\`\`

      Reglas:

      1. Cada valor tiene un dueño.
      2. Solo puede haber un dueño a la vez.
      3. Cuando el dueño sale de ámbito, el valor se descarta (\`drop\`).

      - Los tipos simples (\`i32\`, \`bool\`, \`char\`, tuplas de Copy) implementan \`Copy\`: se copian en lugar de moverse.
      - Pasar un valor a una función también lo **mueve**.
    `, [
      bug(`
        let a = String::from("hola");
        let b = a;
        println!("{a} {b}");`, 3, '`a` se movió a `b`: ya no se puede usar. Usa `a.clone()` o una referencia.'),
      predict(`
        let a = 5;
        let b = a;
        println!("{a} {b}");`, '5 5', '`i32` es `Copy`: asignarlo copia el valor y `a` sigue siendo válido.'),
      predict(`
        let a = String::from("rust");
        let b = a.clone();
        println!("{a} {b}");`, 'rust rust'),
      mc('¿Cuándo se libera la memoria de un `String`?', ['Cuando su dueño sale de ámbito', 'Cuando lo decide el recolector de basura', 'Al terminar el programa', 'Cuando se llama a `free()`'], 'Rust inserta la llamada a `drop` automáticamente al final del ámbito del dueño.'),
      bug(`
        fn consumir(s: String) {
            println!("{s}");
        }

        fn main() {
            let texto = String::from("hola");
            consumir(texto);
            consumir(texto);
        }`, 8, 'Al pasar `texto` por valor la propiedad se mueve a la función; la segunda llamada usa un valor ya movido.'),
      match('Empareja cada tipo con su comportamiento al asignar', [
        ['`i32`', 'Se copia (Copy)'],
        ['`String`', 'Se mueve'],
        ['`Vec<i32>`', 'Se mueve'],
        ['`bool`', 'Se copia (Copy)'],
      ]),
      predict(`
        fn tomar_y_devolver(s: String) -> String {
            s
        }

        fn main() {
            let a = String::from("x");
            let a = tomar_y_devolver(a);
            println!("{a}");
        }`, 'x', 'Devolver el valor devuelve también la propiedad.'),
    ]),

    lesson('rs-borrow', 'Borrowing y referencias', `
      Para usar un valor sin tomar su propiedad, se **presta** con una referencia:

      \`\`\`
      fn longitud(s: &String) -> usize {   // &T: referencia compartida (solo lectura)
          s.len()
      }

      fn añadir(s: &mut String) {          // &mut T: referencia exclusiva (lectura y escritura)
          s.push_str("!");
      }

      let mut texto = String::from("hola");
      let n = longitud(&texto);
      añadir(&mut texto);
      \`\`\`

      **Regla de oro** (en cualquier momento):

      - o bien **muchas** referencias \`&T\` (lectores),
      - o bien **una sola** \`&mut T\` (escritor), nunca ambas a la vez.

      Así el compilador elimina las carreras de datos *en compilación*. Las referencias nunca pueden vivir más que el dato al que apuntan.
    `, [
      predict(`
        fn longitud(s: &String) -> usize {
            s.len()
        }

        fn main() {
            let t = String::from("encode");
            let n = longitud(&t);
            println!("{t} {n}");
        }`, 'encode 6', 'Con `&t` solo se presta: `t` sigue siendo válido después.'),
      predict(`
        fn añadir(s: &mut String) {
            s.push_str("!!");
        }

        fn main() {
            let mut t = String::from("hola");
            añadir(&mut t);
            println!("{t}");
        }`, 'hola!!'),
      bug(`
        let mut v = vec![1, 2, 3];
        let primero = &v[0];
        v.push(4);
        println!("{primero}");`, 3, 'Hay una referencia compartida viva (`primero`) mientras se intenta mutar `v`. Además `push` podría realojar el vector.'),
      bug(`
        let mut s = String::from("a");
        let r1 = &mut s;
        let r2 = &mut s;
        r1.push('b');
        r2.push('c');`, 3, 'No puede haber dos referencias mutables a la vez al mismo dato.'),
      mc('¿Cuántas referencias mutables (`&mut`) a un mismo dato pueden estar vivas simultáneamente?', ['Una', 'Dos', 'Todas las que quieras', 'Ninguna'], 'Y mientras exista, no puede haber referencias compartidas.'),
      fill(`
        fn mayor(a: ___i32, b: ___i32) -> i32 {
            if *a > *b { *a } else { *b }
        }

        fn main() {
            println!("{}", mayor(&3, &9));
        }`, ['&', '&'], undefined, '9'),
      mc('¿Por qué `fn peor() -> &String` (sin parámetros) no compila?', ['Devolvería una referencia a algo que se destruye al terminar la función', 'Porque `&String` no es un tipo válido', 'Porque las funciones no pueden devolver referencias', 'Porque falta `mut`'], 'El compilador exige que las referencias no sobrevivan al dato: es el problema de las referencias colgantes. Se estudia en lifetimes.'),
    ]),
  ]),

  unit('rs2', 'Modelar datos', 'intermedio', 'Structs, enums, Option, Result y colecciones: el modelado de datos de Rust.', [
    lesson('rs-struct', 'Structs', `
      \`\`\`
      struct Usuario {
          nombre: String,
          edad: u32,
      }

      impl Usuario {
          fn nuevo(nombre: &str, edad: u32) -> Self {      // «constructor» asociado
              Usuario { nombre: nombre.to_string(), edad }
          }

          fn saludar(&self) -> String {                    // lee
              format!("hola, {}", self.nombre)
          }

          fn cumplir(&mut self) {                          // modifica
              self.edad += 1;
          }
      }
      \`\`\`

      - \`&self\`, \`&mut self\` o \`self\`: según el método lea, modifique o consuma el valor.
      - \`#[derive(Debug, Clone, PartialEq)]\` genera implementaciones automáticamente; \`{:?}\` imprime con \`Debug\`.
      - **Tuple structs** (\`struct Metros(f64);\`) y **unit structs** (\`struct Marca;\`).
    `, [
      predict(`
        struct Punto {
            x: i32,
            y: i32,
        }

        impl Punto {
            fn suma(&self) -> i32 {
                self.x + self.y
            }
        }

        fn main() {
            let p = Punto { x: 3, y: 4 };
            println!("{}", p.suma());
        }`, '7'),
      predict(`
        #[derive(Debug, Clone, PartialEq)]
        struct Id(u32);

        fn main() {
            let a = Id(7);
            let b = a.clone();
            println!("{:?} {}", a, a == b);
        }`, 'Id(7) true'),
      predict(`
        struct Contador {
            n: u32,
        }

        impl Contador {
            fn nuevo() -> Self {
                Contador { n: 0 }
            }

            fn sumar(&mut self) {
                self.n += 1;
            }
        }

        fn main() {
            let mut c = Contador::nuevo();
            c.sumar();
            c.sumar();
            println!("{}", c.n);
        }`, '2'),
      mc('¿Qué receptor usarías para un método que consume el struct (lo mueve)?', ['`self`', '`&self`', '`&mut self`', '`Self`'], 'Tras llamarlo, el valor original ya no se puede usar.'),
      fill(`
        #[derive(___)]
        struct Producto {
            nombre: String,
        }

        fn main() {
            let p = Producto { nombre: String::from("cafe") };
            println!("{:?}", p);
        }`, ['Debug'], 'Sin `Debug`, `{:?}` no compila.', 'Producto { nombre: "cafe" }'),
      predict(`
        struct Usuario {
            nombre: String,
            activo: bool,
        }

        fn main() {
            let u1 = Usuario { nombre: String::from("ana"), activo: true };
            let u2 = Usuario { nombre: String::from("luis"), ..u1 };
            println!("{} {}", u2.nombre, u2.activo);
        }`, 'luis true', 'La sintaxis `..u1` rellena los campos restantes con los de `u1`.'),
    ]),

    lesson('rs-enum', 'Enums y match', `
      Los enums de Rust son **tipos suma**: cada variante puede llevar datos distintos.

      \`\`\`
      enum Mensaje {
          Salir,
          Mover { x: i32, y: i32 },
          Texto(String),
      }

      fn procesar(m: Mensaje) {
          match m {
              Mensaje::Salir => println!("adios"),
              Mensaje::Mover { x, y } => println!("mover a {x},{y}"),
              Mensaje::Texto(t) => println!("{t}"),
          }
      }

      if let Mensaje::Texto(t) = m { ... }     // cuando solo importa un caso
      \`\`\`

      - \`match\` es **exhaustivo**: si añades una variante, el compilador señala todos los sitios a actualizar.
      - Permite *hacer ilegales los estados imposibles*: modelas solo lo que puede ocurrir.
      - Guardas: \`n if n > 10 => ...\`; enlaces: \`n @ 1..=5\`.
    `, [
      predict(`
        enum Figura {
            Cuadrado(i32),
            Rect(i32, i32),
        }

        fn area(f: Figura) -> i32 {
            match f {
                Figura::Cuadrado(l) => l * l,
                Figura::Rect(a, b) => a * b,
            }
        }

        fn main() {
            println!("{} {}", area(Figura::Cuadrado(3)), area(Figura::Rect(2, 5)));
        }`, '9 10'),
      predict(`
        enum Estado {
            Pendiente,
            Hecho,
        }

        fn main() {
            let e = Estado::Hecho;
            let txt = match e {
                Estado::Pendiente => "por hacer",
                Estado::Hecho => "listo",
            };
            println!("{txt}");
        }`, 'listo'),
      predict(`
        let n = 15;
        let tipo = match n {
            x if x % 15 == 0 => "fizzbuzz",
            x if x % 3 == 0 => "fizz",
            _ => "otro",
        };
        println!("{tipo}");`, 'fizzbuzz', 'Las guardas (`if`) añaden una condición a cada brazo.'),
      mc('¿Qué ventaja tiene que `match` sea exhaustivo?', ['Si añades una variante nueva, el compilador marca todos los `match` que no la tratan', 'Es más rápido que `if`', 'Permite menos código', 'Evita usar enums'], 'Es una red de seguridad contra casos olvidados.'),
      fill(`
        enum Resp {
            Ok(u16),
            Fallo,
        }

        fn main() {
            let r = Resp::Ok(200);
            if ___ Resp::Ok(codigo) = r {
                println!("codigo {codigo}");
            }
        }`, ['let'], '`if let` es la forma corta de `match` cuando solo interesa un caso.', 'codigo 200'),
      predict(`
        enum Comando {
            Sumar(i32, i32),
            Neg(i32),
        }

        fn ejecutar(c: Comando) -> i32 {
            match c {
                Comando::Sumar(a, b) => a + b,
                Comando::Neg(a) => -a,
            }
        }

        fn main() {
            println!("{} {}", ejecutar(Comando::Sumar(2, 3)), ejecutar(Comando::Neg(7)));
        }`, '5 -7'),
    ]),

    lesson('rs-opt', 'Option y Result', `
      Rust **no tiene \`null\` ni excepciones**. Los modela con tipos:

      \`\`\`
      enum Option<T> { Some(T), None }          // puede que no haya valor
      enum Result<T, E> { Ok(T), Err(E) }       // puede que falle
      \`\`\`

      \`\`\`
      let v = vec![1, 2, 3];
      v.get(10);                    // None, en lugar de un panic
      "42".parse::<i32>();          // Ok(42)
      "abc".parse::<i32>();         // Err(ParseIntError)

      opt.unwrap_or(0);             // valor por defecto
      opt.map(|x| x * 2);           // transforma si hay valor
      res?;                         // propaga el error al llamador
      \`\`\`

      - \`unwrap()\` hace *panic* si es \`None\`/\`Err\`: úsalo solo en tests o prototipos.
      - El operador \`?\` devuelve el error de la función inmediatamente si lo hay.
    `, [
      predict(`
        let v = vec![10, 20, 30];
        println!("{:?} {:?}", v.get(1), v.get(9));`, 'Some(20) None'),
      predict(`
        let a: Result<i32, _> = "42".parse::<i32>();
        let b: Result<i32, _> = "abc".parse::<i32>();
        println!("{} {}", a.is_ok(), b.is_err());`, 'true true'),
      predict(`
        let nombre: Option<&str> = None;
        println!("{}", nombre.unwrap_or("anonimo"));
        let n = Some(4).map(|x| x * 10);
        println!("{:?}", n);`, `
        anonimo
        Some(40)`),
      predict(`
        fn doble(texto: &str) -> Result<i32, std::num::ParseIntError> {
            let n: i32 = texto.parse()?;
            Ok(n * 2)
        }

        fn main() {
            println!("{:?}", doble("21"));
            println!("{}", doble("x").is_err());
        }`, `
        Ok(42)
        true`, 'Con `?`, si `parse` devuelve `Err`, la función termina devolviendo ese error.'),
      mc('¿Cómo representa Rust la ausencia de un valor?', ['Con `Option<T>`: `Some(valor)` o `None`', 'Con `null`', 'Con `undefined`', 'Con excepciones'], 'No existe `null`: el compilador te obliga a tratar el caso `None`.'),
      fill(`
        fn dividir(a: i32, b: i32) -> ___<i32, String> {
            if b == 0 {
                return Err(String::from("division por cero"));
            }
            Ok(a / b)
        }

        fn main() {
            println!("{:?}", dividir(8, 2));
        }`, ['Result'], undefined, 'Ok(4)'),
      mc('¿Cuándo es aceptable usar `.unwrap()`?', ['En tests, prototipos o cuando es lógicamente imposible que falle (con un `expect` explicativo)', 'Siempre', 'Nunca existe tal caso', 'Solo en bucles'], '`expect("mensaje")` es mejor: documenta por qué no debería fallar.'),
    ]),

    lesson('rs-coll', 'Colecciones', `
      \`\`\`
      let mut v: Vec<i32> = Vec::new();        // lista dinámica
      v.push(1); v.push(2);
      let v2 = vec![1, 2, 3];
      for x in &v2 { }                         // recorrer prestando

      let mut m: HashMap<String, i32> = HashMap::new();
      m.insert("ana".to_string(), 30);
      *m.entry("ana".to_string()).or_insert(0) += 1;   // contar con entry
      m.get("ana");                                    // Option<&i32>

      let s: HashSet<i32> = [1, 2, 2].into_iter().collect();
      \`\`\`

      - \`Vec<T>\`, \`HashMap<K, V>\`, \`HashSet<T>\`, \`BTreeMap\` (ordenado), \`VecDeque\`.
      - \`String\` es un \`Vec<u8>\` UTF-8 garantizado; \`&str\` es una vista (*slice*) de texto.
      - Los slices \`&v[1..3]\` son vistas sin copiar.
    `, [
      predict(`
        let mut v = Vec::new();
        v.push(3);
        v.push(1);
        v.push(2);
        v.sort();
        println!("{:?} {}", v, v.len());`, '[1, 2, 3] 3'),
      predict(`
        use std::collections::HashMap;

        let mut cuentas: HashMap<char, i32> = HashMap::new();
        for c in "banana".chars() {
            *cuentas.entry(c).or_insert(0) += 1;
        }
        println!("{} {} {}", cuentas[&'a'], cuentas[&'b'], cuentas[&'n']);`, '3 1 2'),
      predict(`
        let v = vec![1, 2, 3, 4, 5];
        let trozo = &v[1..4];
        println!("{:?} {}", trozo, trozo.len());`, '[2, 3, 4] 3'),
      predict(`
        use std::collections::HashSet;

        let s: HashSet<i32> = [1, 2, 2, 3, 3, 3].into_iter().collect();
        println!("{}", s.len());`, '3'),
      bug(`
        let v = vec![1, 2, 3];
        let x = v[10];
        println!("{x}");`, 2, 'El índice está fuera de rango y provoca *panic* en ejecución. Usa `v.get(10)` para obtener un `Option`.'),
      predict(`
        let texto = "hola mundo cruel";
        let palabras: Vec<&str> = texto.split(' ').collect();
        println!("{} {}", palabras.len(), palabras[1]);`, '3 mundo'),
      match('Empareja cada necesidad con su colección', [
        ['Lista dinámica', '`Vec<T>`'],
        ['Clave → valor', '`HashMap<K, V>`'],
        ['Elementos únicos', '`HashSet<T>`'],
        ['Clave → valor ordenado por clave', '`BTreeMap<K, V>`'],
      ]),
    ]),
  ]),

  unit('rs3', 'Abstracciones', 'avanzado', 'Errores propios, traits, genéricos, lifetimes e iteradores: el corazón expresivo de Rust.', [
    lesson('rs-err', 'Manejo de errores', `
      Un buen error en Rust describe **qué falló** y permite decidir qué hacer:

      \`\`\`
      use std::fmt;

      #[derive(Debug)]
      enum ErrorApp {
          Parseo(std::num::ParseIntError),
          Negativo(i32),
      }

      impl fmt::Display for ErrorApp {
          fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
              match self {
                  ErrorApp::Parseo(e) => write!(f, "no es un numero: {e}"),
                  ErrorApp::Negativo(n) => write!(f, "{n} es negativo"),
              }
          }
      }

      impl From<std::num::ParseIntError> for ErrorApp {    // permite usar ? con conversión automática
          fn from(e: std::num::ParseIntError) -> Self { ErrorApp::Parseo(e) }
      }
      \`\`\`

      - En **bibliotecas**: enum propio (con la crate \`thiserror\`). En **aplicaciones**: \`anyhow::Result\` con contexto.
      - \`Box<dyn Error>\` acepta cualquier error cuando no necesitas distinguirlos.
    `, [
      predict(`
        use std::fmt;

        #[derive(Debug)]
        enum ErrorApp {
            Negativo(i32),
        }

        impl fmt::Display for ErrorApp {
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                match self {
                    ErrorApp::Negativo(n) => write!(f, "{n} es negativo"),
                }
            }
        }

        fn validar(n: i32) -> Result<i32, ErrorApp> {
            if n < 0 { Err(ErrorApp::Negativo(n)) } else { Ok(n) }
        }

        fn main() {
            match validar(-4) {
                Ok(n) => println!("ok {n}"),
                Err(e) => println!("error: {e}"),
            }
        }`, 'error: -4 es negativo'),
      predict(`
        #[derive(Debug)]
        enum E {
            Parseo(std::num::ParseIntError),
        }

        impl From<std::num::ParseIntError> for E {
            fn from(e: std::num::ParseIntError) -> Self {
                E::Parseo(e)
            }
        }

        fn leer(s: &str) -> Result<i32, E> {
            let n: i32 = s.parse()?;
            Ok(n + 1)
        }

        fn main() {
            println!("{:?}", leer("9"));
            println!("{}", leer("x").is_err());
        }`, `
        Ok(10)
        true`, 'El `?` usa `From` para convertir el error de `parse` en el error de la función.'),
      mc('¿Qué trait permite mostrar un error al usuario con `{}`?', ['`Display`', '`Debug`', '`Clone`', '`Default`'], '`Debug` (`{:?}`) es para desarrolladores; `Display` (`{}`) para usuarios.'),
      mc('Para una aplicación (no una biblioteca) con muchos tipos de error distintos, ¿qué es práctico?', ['`anyhow::Result` o `Box<dyn Error>`', 'Un `enum` con cientos de variantes', 'Hacer `panic!` siempre', 'Devolver siempre `String`'], 'Ahorra boilerplate cuando no necesitas que quien llama distinga cada error.'),
      fill(`
        fn dividir(a: i32, b: i32) -> Result<i32, String> {
            if b == 0 {
                Err("division por cero".to_string())
            } else {
                Ok(a / b)
            }
        }

        fn media(a: i32, b: i32, c: i32) -> Result<i32, String> {
            let x = dividir(a, c)___;
            let y = dividir(b, c)?;
            Ok(x + y)
        }

        fn main() {
            println!("{:?}", media(10, 20, 5));
        }`, ['?'], undefined, 'Ok(6)'),
      tf('Una función que devuelve `Result` puede usar `?` aunque su tipo de error no tenga relación con el error que propaga.', false, 'Hace falta que exista una conversión `From` entre ambos tipos de error.'),
    ]),

    lesson('rs-trait', 'Traits', `
      Un **trait** define comportamiento compartido: es como una interfaz.

      \`\`\`
      trait Figura {
          fn area(&self) -> f64;
          fn describir(&self) -> String {               // implementación por defecto
              format!("area = {:.1}", self.area())
          }
      }

      struct Cuadrado(f64);
      impl Figura for Cuadrado {
          fn area(&self) -> f64 { self.0 * self.0 }
      }

      fn imprimir(f: &impl Figura) { println!("{}", f.describir()); }     // genérico (estático)
      fn lista(fs: &[Box<dyn Figura>]) { }                                 // dinámico (dyn)
      \`\`\`

      - **\`impl Trait\` / genéricos**: se resuelven en compilación (*monomorfización*): coste cero.
      - **\`dyn Trait\`**: despacho dinámico mediante vtable: permite colecciones heterogéneas.
      - Traits clave: \`Clone\`, \`Debug\`, \`Display\`, \`Default\`, \`PartialEq\`, \`Iterator\`, \`From\`.
    `, [
      predict(`
        trait Saludo {
            fn nombre(&self) -> String;
            fn saludar(&self) -> String {
                format!("hola, {}", self.nombre())
            }
        }

        struct Ana;

        impl Saludo for Ana {
            fn nombre(&self) -> String {
                "Ana".to_string()
            }
        }

        fn main() {
            println!("{}", Ana.saludar());
        }`, 'hola, Ana'),
      predict(`
        trait Figura {
            fn area(&self) -> f64;
        }

        struct Cuadrado(f64);
        struct Rect(f64, f64);

        impl Figura for Cuadrado {
            fn area(&self) -> f64 { self.0 * self.0 }
        }

        impl Figura for Rect {
            fn area(&self) -> f64 { self.0 * self.1 }
        }

        fn main() {
            let figuras: Vec<Box<dyn Figura>> = vec![Box::new(Cuadrado(2.0)), Box::new(Rect(2.0, 3.0))];
            let total: f64 = figuras.iter().map(|f| f.area()).sum();
            println!("{total}");
        }`, '10'),
      mc('¿Cuál es la diferencia entre `fn f(x: &impl Trait)` y `fn f(x: &dyn Trait)`?', ['El primero se resuelve en compilación; el segundo usa despacho dinámico', 'Son idénticos', 'El primero solo funciona con structs', 'El segundo es siempre más rápido'], '`impl Trait` genera una copia por tipo concreto; `dyn` usa una tabla virtual.'),
      fill(`
        #[derive(___, Debug)]
        struct Config {
            puerto: u16,
            debug: bool,
        }

        fn main() {
            println!("{:?}", Config::default());
        }`, ['Default'], '`Default` genera el valor cero de cada campo.', 'Config { puerto: 0, debug: false }'),
      predict(`
        use std::fmt;

        struct Punto(i32, i32);

        impl fmt::Display for Punto {
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                write!(f, "({}, {})", self.0, self.1)
            }
        }

        fn main() {
            println!("{}", Punto(3, -1));
        }`, '(3, -1)'),
      mc('¿Qué es la «regla del huérfano» de los traits?', ['Solo puedes implementar un trait para un tipo si el trait o el tipo son de tu crate', 'Un trait solo puede tener un método', 'Los traits no pueden tener implementaciones por defecto', 'No se pueden implementar traits para structs'], 'Evita que dos crates implementen el mismo trait para el mismo tipo y entren en conflicto.'),
    ]),

    lesson('rs-gen', 'Genéricos', `
      Los genéricos eliminan duplicación sin perder rendimiento ni tipado:

      \`\`\`
      fn mayor<T: PartialOrd>(a: T, b: T) -> T {
          if a > b { a } else { b }
      }

      struct Caja<T> { valor: T }

      impl<T: std::fmt::Display> Caja<T> {
          fn mostrar(&self) { println!("{}", self.valor); }
      }

      fn procesar<T>(x: T) -> String
      where
          T: Clone + std::fmt::Debug,
      {
          format!("{:?}", x.clone())
      }
      \`\`\`

      - Los **límites de trait** (\`T: Trait\`) indican qué puede hacerse con \`T\`.
      - **Monomorfización**: el compilador genera una versión por cada tipo concreto usado: sin coste en ejecución.
      - Con genéricos, \`Vec<i32>\` y \`Vec<String>\` son tipos distintos y completamente seguros.
    `, [
      predict(`
        fn mayor<T: PartialOrd>(a: T, b: T) -> T {
            if a > b { a } else { b }
        }

        fn main() {
            println!("{} {} {}", mayor(3, 9), mayor(2.5, 1.5), mayor("a", "b"));
        }`, '9 2.5 b'),
      predict(`
        struct Caja<T> {
            valor: T,
        }

        impl<T: std::fmt::Display> Caja<T> {
            fn mostrar(&self) -> String {
                format!("[{}]", self.valor)
            }
        }

        fn main() {
            println!("{} {}", Caja { valor: 5 }.mostrar(), Caja { valor: "hola" }.mostrar());
        }`, '[5] [hola]'),
      bug(`
        fn mayor<T>(a: T, b: T) -> T {
            if a > b { a } else { b }
        }`, 2, '`T` puede ser cualquier tipo; para usar `>` hace falta el límite `T: PartialOrd`.'),
      mc('¿Qué significa «monomorfización»?', ['Generar una versión especializada del código por cada tipo concreto usado', 'Convertir un tipo en `String`', 'Heredar de un solo tipo', 'Compilar un solo hilo'], 'Es lo que hace que los genéricos de Rust no tengan coste en ejecución.'),
      fill(`
        fn imprimir_todo<T>(items: &[T])
        ___
            T: std::fmt::Debug,
        {
            for i in items {
                print!("{:?} ", i);
            }
        }

        fn main() {
            imprimir_todo(&[1, 2, 3]);
        }`, ['where'], '`where` mueve los límites a una cláusula aparte para mayor legibilidad.', '1 2 3'),
      predict(`
        fn primero<T: Clone>(v: &[T]) -> Option<T> {
            v.first().cloned()
        }

        fn main() {
            println!("{:?} {:?}", primero(&["a", "b"]), primero::<i32>(&[]));
        }`, 'Some("a") None'),
    ]),

    lesson('rs-life', 'Lifetimes', `
      Un **lifetime** (\`'a\`) describe cuánto tiempo es válida una referencia. El compilador los **infiere** casi siempre; solo debes anotarlos cuando hay ambigüedad:

      \`\`\`
      fn mas_larga<'a>(a: &'a str, b: &'a str) -> &'a str {
          if a.len() >= b.len() { a } else { b }
      }
      \`\`\`

      Se lee: «el resultado vive **como mucho tanto como el más corto de los dos argumentos**».

      \`\`\`
      struct Extracto<'a> {
          texto: &'a str,        // el struct no puede sobrevivir al texto que presta
      }
      \`\`\`

      - Los lifetimes **no cambian cuánto vive** un valor: solo describen relaciones para que el compilador las verifique.
      - \`'static\`: vive todo el programa (p. ej. los literales de texto).
      - Si no quieres pelearte con lifetimes, devuelve valores propios (\`String\`) en lugar de referencias.
    `, [
      predict(`
        fn mas_larga<'a>(a: &'a str, b: &'a str) -> &'a str {
            if a.len() >= b.len() { a } else { b }
        }

        fn main() {
            println!("{}", mas_larga("rust", "go"));
        }`, 'rust'),
      mc('¿Qué problema evitan los lifetimes?', ['Referencias colgantes: apuntar a datos que ya se liberaron', 'Desbordamientos de entero', 'Condiciones de carrera con hilos', 'Fugas de memoria'], 'El compilador comprueba que ninguna referencia sobreviva al dato al que apunta.'),
      predict(`
        struct Extracto<'a> {
            texto: &'a str,
        }

        fn main() {
            let novela = String::from("Llamadme Ismael. Hace unos años...");
            let primera = novela.split('.').next().unwrap();
            let e = Extracto { texto: primera };
            println!("{}", e.texto);
        }`, 'Llamadme Ismael'),
      bug(`
        let r;
        {
            let x = 5;
            r = &x;
        }
        println!("{r}");`, 4, '`x` se destruye al cerrar el bloque, pero `r` seguiría apuntando a ella: referencia colgante.'),
      tf('Anotar un lifetime con `\'a` hace que un valor viva más tiempo.', false, 'Las anotaciones solo describen relaciones entre referencias; no alteran la duración real de los valores.'),
      fill(`
        fn primera_palabra<'a>(s: &'a str) -> &'a str {
            s.split(' ').next().unwrap_or("")
        }

        fn main() {
            let texto = "hola mundo";
            let p: &'___ str = "estatico";
            println!("{} {}", primera_palabra(texto), p);
        }`, ['static'], 'Los literales de texto viven durante todo el programa: `\'static`.', 'hola estatico'),
    ]),

    lesson('rs-iter', 'Iteradores y closures', `
      Los iteradores son **perezosos** y componibles, y se compilan a bucles tan rápidos como los escritos a mano:

      \`\`\`
      let total: i32 = (1..=10)
          .filter(|n| n % 2 == 0)       // adaptadores (perezosos)
          .map(|n| n * n)
          .sum();                       // consumidor: ejecuta la cadena

      let nombres: Vec<String> = usuarios.iter().map(|u| u.nombre.clone()).collect();
      \`\`\`

      - \`.iter()\` presta (\`&T\`), \`.iter_mut()\` presta mutable, \`.into_iter()\` consume.
      - Adaptadores: \`map\`, \`filter\`, \`enumerate\`, \`zip\`, \`take\`, \`skip\`, \`rev\`, \`flat_map\`, \`windows\`.
      - Consumidores: \`collect\`, \`sum\`, \`count\`, \`fold\`, \`any\`, \`all\`, \`find\`, \`max\`, \`min\`.
      - Sin un consumidor, un adaptador **no hace nada**.
    `, [
      predict(`
        let total: i32 = (1..=10).filter(|n| n % 2 == 0).map(|n| n * n).sum();
        println!("{total}");`, '220', '4 + 16 + 36 + 64 + 100 = 220.'),
      predict(`
        let v = vec!["go", "rust", "java"];
        let largos: Vec<usize> = v.iter().map(|s| s.len()).collect();
        println!("{:?}", largos);`, '[2, 4, 4]'),
      predict(`
        let nums = [3, 8, 1, 9];
        println!("{} {} {:?}", nums.iter().any(|&n| n > 8), nums.iter().all(|&n| n > 1), nums.iter().max());`, 'true false Some(9)'),
      predict(`
        let v = vec![10, 20, 30];
        for (i, x) in v.iter().enumerate() {
            print!("{i}:{x} ");
        }`, '0:10 1:20 2:30'),
      predict(`
        let suma = (1..=4).fold(0, |acc, n| acc + n * n);
        println!("{suma}");`, '30'),
      mc('¿Qué ocurre con `v.iter().map(|x| x * 2);` sin consumidor?', ['Nada: los iteradores son perezosos', 'Multiplica todos los elementos', 'Error de compilación obligatorio', 'Modifica `v`'], 'Un adaptador solo describe la transformación; hace falta `collect`, `sum`, `for`… para ejecutarla.'),
      code('Completa el programa para que imprima la suma de los cuadrados de los números impares de la lista.', `
        fn main() {
            let nums = vec![1, 2, 3, 4, 5];
            let total: i32 = 0; // usa un iterador
            println!("{total}");
        }`, `
        fn main() {
            let nums = vec![1, 2, 3, 4, 5];
            let total: i32 = nums.iter().filter(|&&n| n % 2 == 1).map(|n| n * n).sum();
            println!("{total}");
        }`, '35'),
    ]),
  ]),

  unit('rs4', 'Rust profesional', 'experto', 'Smart pointers, concurrencia sin miedo, async y el ecosistema cargo.', [
    lesson('rs-smart', 'Smart pointers', `
      Los **smart pointers** son structs que se comportan como punteros y gestionan recursos:

      - \`Box<T>\`: un valor en el **heap** con un único dueño. Útil para tipos recursivos y \`dyn Trait\`.
      - \`Rc<T>\`: contador de referencias: **varios dueños** en un solo hilo. \`Rc::clone\` incrementa el contador.
      - \`Arc<T>\`: como \`Rc\`, pero **seguro entre hilos** (contador atómico).
      - \`RefCell<T>\`: **mutabilidad interior**: las reglas de préstamo se comprueban en ejecución (panic si se violan).
      - \`Mutex<T>\`: exclusión mutua entre hilos.

      \`\`\`
      let compartido = Rc::new(RefCell::new(vec![1]));
      let otro = Rc::clone(&compartido);
      otro.borrow_mut().push(2);
      println!("{:?} {}", compartido.borrow(), Rc::strong_count(&compartido));
      \`\`\`

      Combinaciones típicas: \`Rc<RefCell<T>>\` (un hilo), \`Arc<Mutex<T>>\` (varios hilos).
    `, [
      predict(`
        use std::rc::Rc;

        let a = Rc::new(String::from("datos"));
        let b = Rc::clone(&a);
        println!("{} {}", Rc::strong_count(&a), b);`, '2 datos'),
      predict(`
        use std::cell::RefCell;
        use std::rc::Rc;

        let v = Rc::new(RefCell::new(vec![1]));
        let w = Rc::clone(&v);
        w.borrow_mut().push(2);
        println!("{:?}", v.borrow());`, '[1, 2]'),
      predict(`
        enum Lista {
            Cons(i32, Box<Lista>),
            Nil,
        }

        use Lista::{Cons, Nil};

        fn suma(l: &Lista) -> i32 {
            match l {
                Cons(x, resto) => x + suma(resto),
                Nil => 0,
            }
        }

        fn main() {
            let l = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
            println!("{}", suma(&l));
        }`, '6', 'Un tipo recursivo necesita `Box` para tener tamaño conocido en compilación.'),
      match('Empareja cada puntero con su uso', [
        ['`Box<T>`', 'Un valor en el heap con un único dueño'],
        ['`Rc<T>`', 'Varios dueños en un solo hilo'],
        ['`Arc<T>`', 'Varios dueños entre hilos'],
        ['`RefCell<T>`', 'Mutabilidad interior comprobada en ejecución'],
      ]),
      mc('¿Cuándo comprueba `RefCell` las reglas de préstamo?', ['En ejecución: si se violan, hace *panic*', 'En compilación', 'Nunca', 'Solo en modo release'], 'Es la contrapartida de la mutabilidad interior.'),
      tf('`Rc<T>` se puede compartir con seguridad entre hilos.', false, 'Su contador no es atómico. Para hilos se usa `Arc<T>`; el compilador impide mover un `Rc` a otro hilo.'),
    ]),

    lesson('rs-conc', 'Concurrencia', `
      El compilador de Rust impide las **carreras de datos**: «concurrencia sin miedo».

      \`\`\`
      use std::sync::{Arc, Mutex, mpsc};
      use std::thread;

      let contador = Arc::new(Mutex::new(0));
      let mut hilos = vec![];
      for _ in 0..4 {
          let c = Arc::clone(&contador);
          hilos.push(thread::spawn(move || {          // move: la closure toma propiedad
              *c.lock().unwrap() += 1;
          }));
      }
      for h in hilos { h.join().unwrap(); }

      let (tx, rx) = mpsc::channel();                 // canal multi-productor
      thread::spawn(move || tx.send(42).unwrap());
      rx.recv().unwrap();
      \`\`\`

      - Los traits marcadores \`Send\` (se puede mover a otro hilo) y \`Sync\` (se puede compartir) lo hacen posible.
      - \`thread::scope\` permite hilos que prestan datos locales sin \`Arc\`.
      - Para paralelismo de datos: la crate \`rayon\` (\`.par_iter()\`).
    `, [
      predict(`
        use std::sync::{Arc, Mutex};
        use std::thread;

        let contador = Arc::new(Mutex::new(0));
        let mut hilos = vec![];
        for _ in 0..4 {
            let c = Arc::clone(&contador);
            hilos.push(thread::spawn(move || {
                for _ in 0..100 {
                    *c.lock().unwrap() += 1;
                }
            }));
        }
        for h in hilos {
            h.join().unwrap();
        }
        println!("{}", *contador.lock().unwrap());`, '400'),
      predict(`
        use std::sync::mpsc;
        use std::thread;

        let (tx, rx) = mpsc::channel();
        for i in 1..=3 {
            let tx = tx.clone();
            thread::spawn(move || tx.send(i * 10).unwrap());
        }
        drop(tx);
        let mut recibidos: Vec<i32> = rx.iter().collect();
        recibidos.sort();
        println!("{:?}", recibidos);`, '[10, 20, 30]', 'Se descartan todos los emisores (`drop(tx)`), así `rx.iter()` termina.'),
      predict(`
        use std::thread;

        let mut datos = vec![1, 2, 3];
        thread::scope(|s| {
            s.spawn(|| {
                datos.push(4);
            });
        });
        println!("{:?}", datos);`, '[1, 2, 3, 4]', '`thread::scope` garantiza que los hilos terminan antes de salir, por eso pueden prestar datos locales.'),
      mc('¿Para qué sirve `move` en `thread::spawn(move || ...)`?', ['Para que la closure tome la propiedad de las variables que usa', 'Para mover el hilo a otro núcleo', 'Para evitar usar `join`', 'Para clonar los datos'], 'El hilo puede vivir más que la función que lo lanza, así que no puede tomar prestado.'),
      match('Empareja cada trait marcador con su significado', [
        ['`Send`', 'El valor puede moverse a otro hilo'],
        ['`Sync`', '`&T` puede compartirse entre hilos'],
      ]),
      fill(`
        use std::sync::Arc;
        use std::thread;

        let datos = Arc::new(vec![1, 2, 3]);
        let d = Arc::clone(&datos);
        let h = thread::spawn(___ || d.iter().sum::<i32>());
        println!("{}", h.join().unwrap());`, ['move'], undefined, '6'),
    ]),

    lesson('rs-async', 'async y await', `
      Rust ofrece **async/await** a nivel de lenguaje; el *runtime* lo aporta una crate (**tokio** es el estándar).

      \`\`\`
      use tokio::time::{sleep, Duration};

      async fn descargar(id: u32) -> u32 {
          sleep(Duration::from_millis(100)).await;     // cede el hilo mientras espera
          id * 2
      }

      #[tokio::main]
      async fn main() {
          let (a, b) = tokio::join!(descargar(1), descargar(2));   // concurrentes: ~100 ms
          let h = tokio::spawn(async { descargar(3).await });      // tarea independiente
      }
      \`\`\`

      - Una \`async fn\` devuelve un **Future**: no hace nada hasta que se le hace \`.await\` o se programa.
      - Es **cooperativo**: una operación bloqueante dentro de una tarea congela el hilo (usa \`spawn_blocking\`).
      - Es ideal para mucha E/S concurrente (servidores, clientes de red); para CPU, usa hilos o \`rayon\`.
    `, [
      mc('¿Qué devuelve llamar a una `async fn`?', ['Un `Future` que no se ejecuta hasta que se espera', 'El resultado inmediatamente', 'Un hilo nuevo', 'Un `Result`'], 'Los futuros de Rust son perezosos.'),
      mc('¿Qué crate proporciona normalmente el runtime asíncrono?', ['`tokio`', '`serde`', '`clap`', '`rayon`'], 'Rust no incluye un runtime en la biblioteca estándar: se elige uno.'),
      mc('Dentro de una tarea async llamas a `std::thread::sleep(5s)`. ¿Qué pasa?', ['Bloquea el hilo del runtime y puede frenar otras tareas', 'Solo pausa esa tarea', 'Se convierte en `tokio::time::sleep`', 'Falla al compilar'], 'Hay que usar la versión asíncrona (`tokio::time::sleep(...).await`) o `spawn_blocking`.'),
      tf('`async` en Rust es una buena opción para acelerar cálculos de CPU intensivos.', false, 'Async resuelve la espera de E/S. Para CPU intensivo se necesitan hilos o paralelismo de datos (`rayon`).'),
      order('Ordena el ciclo de vida de una petición con async', ['Se crea el Future (`async fn`)', 'Se programa con `.await` o `tokio::spawn`', 'El runtime lo avanza hasta el primer punto de espera', 'Al estar listo el recurso (E/S), se reanuda y completa']),
      fill(`
        async fn saludar() -> &'static str {
            "hola"
        }

        #[tokio::main]
        async fn main() {
            let texto = saludar().___;
            println!("{texto}");
        }`, ['await'], 'Sin `.await` solo tendrías el `Future`, no el resultado.'),
    ]),

    lesson('rs-cargo', 'Cargo, módulos y tests', `
      **Cargo** es el gestor de paquetes, compilador y ejecutor de tests:

      \`\`\`bash
      cargo new app          # crea el proyecto
      cargo run              # compila y ejecuta
      cargo build --release  # optimizado
      cargo test             # tests
      cargo clippy           # linter: sugerencias idiomáticas
      cargo fmt              # formatea
      cargo add serde        # añade una dependencia
      \`\`\`

      \`Cargo.toml\` declara el nombre, la versión, las dependencias y las *features*.

      \`\`\`
      pub mod red {
          pub fn conectar() {}       // pub = visible fuera del módulo
          fn privada() {}
      }
      use red::conectar;

      #[cfg(test)]
      mod tests {
          use super::*;

          #[test]
          fn suma_funciona() { assert_eq!(2 + 2, 4); }

          #[test]
          #[should_panic]
          fn falla() { panic!("boom"); }
      }
      \`\`\`

      Un **workspace** agrupa varios crates; \`crates.io\` es el registro público.
    `, [
      ask('¿Qué comando de cargo ejecuta los tests?', ['cargo test'], 'Busca funciones con `#[test]` en el código y en la carpeta `tests/`.'),
      mc('¿Qué archivo declara las dependencias de un proyecto Rust?', ['`Cargo.toml`', '`package.json`', '`pom.xml`', '`go.mod`'], '`Cargo.lock` fija las versiones exactas resueltas.'),
      mc('¿Qué hace `cargo clippy`?', ['Analiza el código y propone mejoras idiomáticas', 'Formatea el código', 'Publica el crate', 'Compila en modo release'], '`cargo fmt` es el formateador.'),
      predict(`
        mod geometria {
            pub fn area(l: u32) -> u32 {
                l * l
            }
        }

        fn main() {
            println!("{}", geometria::area(4));
        }`, '16'),
      bug(`
        mod secretos {
            fn clave() -> u32 { 42 }
        }

        fn main() {
            println!("{}", secretos::clave());
        }`, 6, 'Las funciones son privadas por defecto: falta `pub fn clave()`.'),
      mc('¿Qué comprueba `assert_eq!(a, b)` dentro de un test?', ['Que `a` y `b` sean iguales; si no, el test falla mostrando ambos valores', 'Que `a` y `b` sean el mismo objeto en memoria', 'Que `a` sea mayor que `b`', 'Que no haya `panic`'], 'Usa `PartialEq` y `Debug`, y muestra una diferencia clara al fallar.'),
    ]),
  ]),
])
