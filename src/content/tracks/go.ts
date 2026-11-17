import { ask, bug, code, fill, lesson, match, mc, order, predict, tf, track, unit } from '../dsl'

export default track('go', 'go', [
  unit('go1', 'Sintaxis', 'basico', 'Paquetes, variables, control de flujo, funciones, slices y maps: Go en una tarde.', [
    lesson('go-basics', 'Paquetes y variables', `
      Todo programa Go empieza en el paquete \`main\`, función \`main\`:

      \`\`\`
      package main

      import "fmt"

      func main() {
          var edad int = 30        // declaración explícita
          nombre := "Ada"          // := declara e infiere (solo dentro de funciones)
          const pi = 3.14159       // constante
          fmt.Println(nombre, edad, pi)
      }
      \`\`\`

      - **Tipado estático** con inferencia. Tipos: \`int\`, \`float64\`, \`string\`, \`bool\`, \`byte\`, \`rune\`.
      - Toda variable tiene un **valor cero**: \`0\`, \`""\`, \`false\`, \`nil\`.
      - Una variable o import **sin usar** es un error de compilación.
      - \`gofmt\` formatea el código: en Go no se discute el estilo.
    `, [
      predict(`
        a := 7
        b := 2
        fmt.Println(a/b, a%b)`, '3 1', 'Con enteros, `/` es división entera.'),
      predict(`
        var n int
        var s string
        var ok bool
        fmt.Printf("%d %q %t\\n", n, s, ok)`, '0 "" false', 'Cada tipo tiene un valor cero: no existen variables sin inicializar.'),
      mc('¿Qué hace `:=`?', ['Declara una variable e infiere su tipo', 'Compara dos valores', 'Asigna a una variable ya existente sin cambiar el tipo', 'Declara una constante'], 'Solo puede usarse dentro de funciones. Fuera, usa `var`.'),
      bug(`
        x := 5
        y := 10
        fmt.Println(x)`, 2, 'Go no compila si hay una variable declarada y no usada: `y declared and not used`.'),
      fill(`
        nombre := "Go"
        n := len(nombre)
        fmt.Println(nombre, ___)`, ['n'], undefined, 'Go 2'),
      predict(`
        x := 10
        var f float64 = float64(x) / 4
        fmt.Println(f)`, '2.5', 'Go no hace conversiones implícitas: hay que convertir con `float64(x)`.'),
      ask('¿Qué herramienta formatea automáticamente el código Go?', ['gofmt', 'go fmt'], '`go fmt` ejecuta `gofmt` sobre el paquete. Es la norma en toda la comunidad.'),
    ]),

    lesson('go-ctrl', 'Control de flujo', `
      Go tiene un único bucle, \`for\`, con varias formas:

      \`\`\`
      for i := 0; i < 3; i++ { }        // clásico
      for n < 100 { n *= 2 }            // como while
      for { break }                     // infinito
      for i, v := range []string{"a", "b"} { }   // recorrer colecciones

      if x := calcular(); x > 0 { }     // sentencia previa, ámbito local
      switch dia {
      case "sab", "dom": fmt.Println("finde")
      default:           fmt.Println("laboral")
      }
      \`\`\`

      - No hay paréntesis en las condiciones, pero las llaves son obligatorias.
      - \`switch\` no hace *fallthrough* por defecto: no necesita \`break\`.
      - \`range\` sobre un entero (\`for i := range 3\`) existe desde Go 1.22.
    `, [
      predict(`
        total := 0
        for i := 1; i <= 4; i++ {
            total += i
        }
        fmt.Println(total)`, '10'),
      predict(`
        for i, lang := range []string{"go", "rust"} {
            fmt.Println(i, lang)
        }`, `
        0 go
        1 rust`),
      predict(`
        n := 1
        for n < 50 {
            n *= 3
        }
        fmt.Println(n)`, '81', '1 → 3 → 9 → 27 → 81.'),
      predict(`
        switch x := 5; {
        case x > 3:
            fmt.Println("grande")
        case x > 1:
            fmt.Println("mediano")
        default:
            fmt.Println("pequeno")
        }`, 'grande', 'Se ejecuta el primer caso verdadero y no se continúa con los siguientes.'),
      fill(`
        for i := ___ 3 {
            fmt.Print(i, " ")
        }`, ['range'], 'Desde Go 1.22 se puede hacer `range` sobre un entero.', '0 1 2'),
      mc('¿Cuántas palabras clave de bucle tiene Go?', ['Una: `for`', 'Dos: `for` y `while`', 'Tres: `for`, `while` y `do`', 'Una: `loop`'], 'Todas las formas de iterar se escriben con `for`.'),
      bug(`
        x := 3
        if (x > 2)
        {
            fmt.Println("ok")
        }`, 2, 'La llave de apertura debe ir en la misma línea que la condición.'),
    ]),

    lesson('go-func', 'Funciones', `
      \`\`\`
      func sumar(a, b int) int {
          return a + b
      }

      func dividir(a, b float64) (float64, error) {      // varios valores de retorno
          if b == 0 {
              return 0, errors.New("division por cero")
          }
          return a / b, nil
      }

      resultado, err := dividir(1, 2)
      if err != nil { ... }
      \`\`\`

      - El tipo se escribe **después** del nombre.
      - Devolver \`(valor, error)\` es el patrón central de Go.
      - \`_\` descarta un valor: \`_, err := f()\`.
      - Las funciones son valores: \`func(x int) int { return x * 2 }\`. Pueden ser *closures*.
      - \`defer\` pospone una llamada hasta que la función termine: ideal para cerrar recursos.
    `, [
      predict(`
        func cuadrado(n int) int {
            return n * n
        }

        func main() {
            fmt.Println(cuadrado(7))
        }`, '49'),
      predict(`
        func minmax(a, b int) (int, int) {
            if a < b {
                return a, b
            }
            return b, a
        }

        func main() {
            lo, hi := minmax(9, 4)
            fmt.Println(lo, hi)
        }`, '4 9'),
      predict(`
        func main() {
            for i := 1; i <= 3; i++ {
                defer fmt.Println("defer", i)
            }
            fmt.Println("fin")
        }`, `
        fin
        defer 3
        defer 2
        defer 1`, 'Los `defer` se ejecutan al salir de la función, en orden inverso (LIFO).'),
      predict(`
        func contador() func() int {
            n := 0
            return func() int {
                n++
                return n
            }
        }

        func main() {
            c := contador()
            c()
            fmt.Println(c(), c())
        }`, '2 3', 'La función devuelta es una closure que recuerda `n`.'),
      fill(`
        func dividir(a, b int) (int, ___) {
            if b == 0 {
                return 0, errors.New("division por cero")
            }
            return a / b, nil
        }

        func main() {
            _, err := dividir(1, 0)
            fmt.Println(err)
        }`, ['error'], 'La convención: el último valor de retorno es un `error`.', 'division por cero'),
      mc('¿Para qué sirve `defer file.Close()`?', ['Garantiza que el archivo se cierre al terminar la función, pase lo que pase', 'Cierra el archivo inmediatamente', 'Cierra el archivo en otra goroutine', 'Evita que el archivo se abra'], 'La llamada se pospone hasta el `return` de la función que la contiene.'),
    ]),

    lesson('go-slice', 'Slices', `
      Un **slice** es una vista dinámica sobre un array subyacente: puntero + longitud + capacidad.

      \`\`\`
      nums := []int{1, 2, 3}
      nums = append(nums, 4)         // devuelve el slice resultante: hay que reasignar
      sub := nums[1:3]               // [2 3] — comparte memoria con nums
      len(nums); cap(nums)
      copia := make([]int, len(nums))
      copy(copia, nums)
      \`\`\`

      - \`append\` puede reservar un array nuevo cuando se llena la capacidad.
      - Dos slices pueden compartir el mismo array: modificar uno puede afectar al otro.
      - Un slice \`nil\` es válido, tiene longitud 0 y se puede usar con \`append\`.
    `, [
      predict(`
        nums := []int{1, 2, 3}
        nums = append(nums, 4, 5)
        fmt.Println(nums, len(nums))`, '[1 2 3 4 5] 5'),
      predict(`
        a := []int{1, 2, 3, 4}
        b := a[1:3]
        b[0] = 99
        fmt.Println(a)`, '[1 99 3 4]', '`b` comparte el array subyacente con `a`: modificar uno cambia el otro.'),
      predict(`
        a := []int{1, 2, 3}
        b := make([]int, len(a))
        copy(b, a)
        b[0] = 100
        fmt.Println(a[0], b[0])`, '1 100', '`copy` duplica los datos: ahora son independientes.'),
      bug(`
        nums := []int{1, 2}
        append(nums, 3)
        fmt.Println(nums)`, 2, '`append` devuelve un slice nuevo; hay que usarlo: `nums = append(nums, 3)`.'),
      predict(`
        var s []int
        fmt.Println(s == nil, len(s))
        s = append(s, 1)
        fmt.Println(s)`, `
        true 0
        [1]`, 'Un slice nil es seguro de usar con `append` y `len`.'),
      fill(`
        letras := []string{"a", "b", "c", "d", "e"}
        fmt.Println(letras[___:4])`, ['1'], 'El slice `s[a:b]` incluye `a` y excluye `b`.', '[b c d]'),
      code('Completa el programa: elimina el elemento de índice 2 del slice y muestra el resultado.', `
        package main

        import "fmt"

        func main() {
            nums := []int{10, 20, 30, 40}
            // elimina el índice 2
            fmt.Println(nums)
        }`, `
        package main

        import "fmt"

        func main() {
            nums := []int{10, 20, 30, 40}
            nums = append(nums[:2], nums[3:]...)
            fmt.Println(nums)
        }`, '[10 20 40]'),
    ]),

    lesson('go-map', 'Maps', `
      \`\`\`
      edades := map[string]int{"ana": 30}
      edades["luis"] = 25
      delete(edades, "ana")

      edad, ok := edades["eva"]     // idiom «coma ok»
      if !ok { fmt.Println("no existe") }

      for clave, valor := range edades { }   // el orden NO está garantizado
      \`\`\`

      - Leer una clave inexistente devuelve el **valor cero** (no un error). Usa «coma ok» para distinguir.
      - Escribir en un map \`nil\` provoca *panic*: crea el map con \`make\` o con un literal.
      - Los maps **no son seguros** para acceso concurrente sin sincronización.
    `, [
      predict(`
        stock := map[string]int{"cafe": 2}
        stock["cafe"] += 3
        stock["te"]++
        fmt.Println(stock["cafe"], stock["te"], stock["leche"])`, '5 1 0', 'Una clave ausente devuelve el valor cero, y `++` la crea.'),
      predict(`
        m := map[string]int{"a": 1}
        v, ok := m["b"]
        fmt.Println(v, ok)
        _, ok = m["a"]
        fmt.Println(ok)`, `
        0 false
        true`),
      bug(`
        var m map[string]int
        m["a"] = 1
        fmt.Println(m)`, 2, 'Un map nil no admite escritura (panic). Se inicializa con `make(map[string]int)`.'),
      mc('¿Qué orden tiene la iteración con `for k, v := range miMap`?', ['Indeterminado: puede cambiar entre ejecuciones', 'El orden de inserción', 'Orden alfabético de las claves', 'Orden inverso'], 'Go aleatoriza deliberadamente el orden. Si lo necesitas, ordena las claves aparte.'),
      fill(`
        m := map[string]int{"a": 1, "b": 2}
        ___(m, "a")
        fmt.Println(len(m))`, ['delete'], 'La función incorporada `delete(mapa, clave)` elimina una entrada.', '1'),
      code('Completa el programa: cuenta cuántas veces aparece cada letra en "banana" e imprime las cuentas de a, b y n.', `
        package main

        import "fmt"

        func main() {
            cuentas := make(map[rune]int)
            for _, c := range "banana" {
                // cuenta cada letra
                _ = c
            }
            fmt.Println(cuentas['a'], cuentas['b'], cuentas['n'])
        }`, `
        package main

        import "fmt"

        func main() {
            cuentas := make(map[rune]int)
            for _, c := range "banana" {
                cuentas[c]++
            }
            fmt.Println(cuentas['a'], cuentas['b'], cuentas['n'])
        }`, '3 1 2'),
    ]),
  ]),

  unit('go2', 'Tipos propios', 'intermedio', 'Structs, punteros, interfaces y errores: el modelo de tipos de Go.', [
    lesson('go-struct', 'Structs y métodos', `
      Go no tiene clases: tiene **structs** y **métodos** asociados a un tipo.

      \`\`\`
      type Punto struct {
          X, Y int
      }

      func (p Punto) Suma() int {         // receptor por valor (copia)
          return p.X + p.Y
      }

      func (p *Punto) Mover(dx int) {     // receptor puntero (modifica el original)
          p.X += dx
      }

      p := Punto{X: 1, Y: 2}
      p.Mover(5)
      \`\`\`

      - Los campos y métodos con **mayúscula** son exportados (públicos); con minúscula, privados al paquete.
      - Usa receptor puntero cuando el método modifica el struct o el struct es grande.
      - La **composición** (embeber un struct dentro de otro) reemplaza a la herencia.
    `, [
      predict(`
        type Punto struct{ X, Y int }

        func (p Punto) Suma() int { return p.X + p.Y }

        func main() {
            p := Punto{3, 4}
            fmt.Println(p.Suma())
        }`, '7'),
      predict(`
        type Contador struct{ N int }

        func (c Contador) SumarValor()    { c.N++ }
        func (c *Contador) SumarPuntero() { c.N++ }

        func main() {
            c := Contador{}
            c.SumarValor()
            c.SumarPuntero()
            fmt.Println(c.N)
        }`, '1', 'El receptor por valor trabaja sobre una copia; solo el de puntero modifica el original.'),
      mc('¿Cómo se hace público (exportado) un campo en Go?', ['Empezando su nombre con mayúscula', 'Con la palabra clave `public`', 'Con la palabra clave `export`', 'Con una anotación `@Public`'], 'La visibilidad se decide por la primera letra del identificador.'),
      predict(`
        type Animal struct{ Nombre string }

        func (a Animal) Presentar() string { return "soy " + a.Nombre }

        type Perro struct {
            Animal
            Raza string
        }

        func main() {
            p := Perro{Animal{"Rex"}, "labrador"}
            fmt.Println(p.Presentar())
        }`, 'soy Rex', 'Al embeber `Animal`, sus métodos quedan promovidos a `Perro`: composición en lugar de herencia.'),
      fill(`
        type Usuario struct {
            Nombre string
            Edad   int
        }

        func main() {
            u := Usuario{___: "Ada", Edad: 36}
            fmt.Println(u)
        }`, ['Nombre'], undefined, '{Ada 36}'),
      predict(`
        type Punto struct{ X, Y int }

        func main() {
            a := Punto{1, 2}
            b := a
            b.X = 99
            fmt.Println(a.X, b.X, a == Punto{1, 2})
        }`, '1 99 true', 'Los structs se copian al asignarlos y son comparables si todos sus campos lo son.'),
    ]),

    lesson('go-ptr', 'Punteros', `
      Un **puntero** guarda la dirección de una variable. \`&\` toma la dirección; \`*\` la desreferencia.

      \`\`\`
      x := 10
      p := &x          // p es *int
      *p = 20          // modifica x
      fmt.Println(x)   // 20
      \`\`\`

      - Go pasa **todo por valor**: para que una función modifique algo, pasa un puntero.
      - No hay aritmética de punteros.
      - El valor cero de un puntero es \`nil\`; desreferenciar \`nil\` provoca *panic*.
      - \`new(T)\` y \`&T{}\` crean un puntero a un valor nuevo.
      - Maps y slices ya contienen una referencia interna: normalmente no necesitas punteros a ellos.
    `, [
      predict(`
        x := 10
        p := &x
        *p = 20
        fmt.Println(x)`, '20'),
      predict(`
        func duplicar(n int) { n *= 2 }
        func duplicarPtr(n *int) { *n *= 2 }

        func main() {
            a, b := 5, 5
            duplicar(a)
            duplicarPtr(&b)
            fmt.Println(a, b)
        }`, '5 10'),
      bug(`
        var p *int
        fmt.Println(*p)`, 2, 'Desreferenciar un puntero `nil` provoca *panic: nil pointer dereference*.'),
      mc('¿Qué imprime `fmt.Println(p == nil)` para `var p *int`?', ['true', 'false', '0', 'Un error de compilación'], 'El valor cero de cualquier puntero es `nil`.'),
      fill(`
        type Config struct{ Debug bool }

        func activar(c ___Config) {
            c.Debug = true
        }

        func main() {
            cfg := Config{}
            activar(&cfg)
            fmt.Println(cfg.Debug)
        }`, ['*'], undefined, 'true'),
      tf('En Go, pasar un struct grande a una función siempre copia el struct entero, salvo que pases un puntero.', true, 'Por eso los structs grandes suelen pasarse (y tener métodos) por puntero.'),
    ]),

    lesson('go-iface', 'Interfaces', `
      Una **interfaz** es un conjunto de métodos. Un tipo la cumple **implícitamente**: no hay \`implements\`.

      \`\`\`
      type Figura interface {
          Area() float64
      }

      type Cuadrado struct{ Lado float64 }
      func (c Cuadrado) Area() float64 { return c.Lado * c.Lado }

      func describir(f Figura) { fmt.Println(f.Area()) }
      describir(Cuadrado{3})        // funciona sin declarar nada
      \`\`\`

      - Las interfaces pequeñas son las mejores: \`io.Reader\` y \`error\` tienen un solo método.
      - **Acepta interfaces, devuelve structs.**
      - \`any\` (alias de \`interface{}\`) acepta cualquier valor. Para recuperar el tipo: \`v, ok := x.(string)\` o un \`switch x.(type)\`.
    `, [
      predict(`
        type Figura interface{ Area() int }

        type Cuadrado struct{ L int }
        func (c Cuadrado) Area() int { return c.L * c.L }

        type Rect struct{ A, B int }
        func (r Rect) Area() int { return r.A * r.B }

        func main() {
            figuras := []Figura{Cuadrado{3}, Rect{2, 5}}
            total := 0
            for _, f := range figuras {
                total += f.Area()
            }
            fmt.Println(total)
        }`, '19'),
      mc('¿Cómo declara un tipo que implementa una interfaz en Go?', ['No lo declara: basta con tener los métodos', 'Con `implements`', 'Con `extends`', 'Con una anotación `@Implements`'], 'Es tipado estructural: el compilador comprueba que los métodos existan.'),
      predict(`
        func tipo(x any) string {
            switch v := x.(type) {
            case int:
                return "int"
            case string:
                return "string:" + v
            default:
                return "otro"
            }
        }

        func main() {
            fmt.Println(tipo(1), tipo("go"), tipo(2.5))
        }`, 'int string:go otro'),
      predict(`
        var x any = "hola"
        s, ok := x.(string)
        n, ok2 := x.(int)
        fmt.Println(s, ok, n, ok2)`, 'hola true 0 false'),
      fill(`
        type Saludador ___ {
            Saludar() string
        }

        type Ingles struct{}
        func (Ingles) Saludar() string { return "hello" }

        func main() {
            var s Saludador = Ingles{}
            fmt.Println(s.Saludar())
        }`, ['interface'], undefined, 'hello'),
      mc('¿Qué significa «acepta interfaces, devuelve structs»?', ['Las funciones piden el comportamiento mínimo y devuelven tipos concretos', 'Las funciones nunca devuelven interfaces ni punteros', 'Los structs deben tener siempre una interfaz', 'Las interfaces son más rápidas que los structs'], 'Así quien llama puede pasar cualquier implementación, pero recibe un tipo concreto con todas sus capacidades.'),
    ]),

    lesson('go-err', 'Errores', `
      En Go los errores son **valores**, no excepciones: \`error\` es una interfaz con un método \`Error() string\`.

      \`\`\`
      var ErrNoEncontrado = errors.New("no encontrado")

      func buscar(id int) (*Usuario, error) {
          if id == 0 {
              return nil, fmt.Errorf("buscar %d: %w", id, ErrNoEncontrado)   // %w envuelve
          }
          ...
      }

      u, err := buscar(0)
      if errors.Is(err, ErrNoEncontrado) { ... }          // atraviesa la cadena
      var pe *PathError
      if errors.As(err, &pe) { ... }                      // extrae un tipo concreto
      \`\`\`

      - Comprueba \`if err != nil\` justo después de cada llamada que pueda fallar.
      - Añade contexto al propagar, con \`fmt.Errorf("...: %w", err)\`.
      - \`panic\` es para errores irrecuperables (bugs), no para el flujo normal.
    `, [
      predict(`
        err := errors.New("fallo")
        fmt.Println(err)
        fmt.Println(err == nil)`, `
        fallo
        false`),
      predict(`
        var ErrBase = errors.New("base")

        func main() {
            err := fmt.Errorf("capa 1: %w", ErrBase)
            err = fmt.Errorf("capa 2: %w", err)
            fmt.Println(err)
            fmt.Println(errors.Is(err, ErrBase))
        }`, `
        capa 2: capa 1: base
        true`, '`%w` envuelve el error; `errors.Is` recorre toda la cadena.'),
      mc('Una función puede fallar al abrir un archivo. ¿Cómo lo señala en Go idiomático?', ['Devuelve un `error` como último valor de retorno', 'Lanza una excepción con `throw`', 'Devuelve `-1`', 'Llama a `panic`'], 'Quien llama decide cómo tratar el error.'),
      bug(`
        n, err := strconv.Atoi("abc")
        fmt.Println(n)`, 1, 'El error se descarta sin mirarlo. Hay que comprobar `err != nil` antes de usar `n`.'),
      fill(`
        type ErrValidacion struct{ Campo string }

        func (e ErrValidacion) ___() string {
            return "campo invalido: " + e.Campo
        }

        func main() {
            var err error = ErrValidacion{"email"}
            fmt.Println(err)
        }`, ['Error'], 'Cualquier tipo con un método `Error() string` es un `error`.', 'campo invalido: email'),
      match('Empareja cada función con lo que hace', [
        ['`errors.New("x")`', 'Crea un error simple'],
        ['`fmt.Errorf("...%w", err)`', 'Crea un error que envuelve a otro'],
        ['`errors.Is(err, X)`', 'Comprueba si algún error de la cadena es X'],
        ['`errors.As(err, &t)`', 'Extrae el primer error de un tipo concreto'],
      ]),
    ]),
  ]),

  unit('go3', 'Concurrencia', 'avanzado', 'Goroutines, channels, select, sync y context: el superpoder de Go.', [
    lesson('go-gor', 'Goroutines', `
      Una **goroutine** es una función ejecutándose de forma concurrente, muy ligera (unos KB de pila): se pueden lanzar cientos de miles.

      \`\`\`
      go func() {
          fmt.Println("en otra goroutine")
      }()
      \`\`\`

      - \`go f()\` lanza \`f\` y **no espera** a que termine: si \`main\` acaba, el programa termina con ellas.
      - Para esperar se usa \`sync.WaitGroup\` o channels.
      - El *scheduler* de Go reparte las goroutines entre los hilos del sistema.
      - Concurrencia no es paralelismo: concurrencia es **estructura**; paralelismo, ejecución simultánea.

      > «No te comuniques compartiendo memoria; comparte memoria comunicándote.»
    `, [
      predict(`
        func main() {
            var wg sync.WaitGroup
            resultados := make([]int, 3)
            for i := 0; i < 3; i++ {
                wg.Add(1)
                go func() {
                    defer wg.Done()
                    resultados[i] = i * i
                }()
            }
            wg.Wait()
            fmt.Println(resultados)
        }`, '[0 1 4]', 'Cada goroutine escribe en su propia posición; `wg.Wait()` espera a todas.'),
      mc('¿Qué pasa si `main` termina mientras hay goroutines ejecutándose?', ['El programa termina y las goroutines se descartan', 'El programa espera a que todas terminen', 'Las goroutines pasan a segundo plano', 'Se lanza un panic'], 'Hay que sincronizar explícitamente con `WaitGroup` o channels.'),
      fill(`
        var wg sync.WaitGroup
        wg.Add(1)
        go func() {
            defer wg.___()
            fmt.Println("hecho")
        }()
        wg.Wait()`, ['Done'], '`Add` suma una tarea pendiente; `Done` la marca como completada; `Wait` bloquea hasta que llegan a cero.', 'hecho'),
      predict(`
        var wg sync.WaitGroup
        var mu sync.Mutex
        total := 0
        for i := 1; i <= 100; i++ {
            wg.Add(1)
            go func() {
                defer wg.Done()
                mu.Lock()
                total += i
                mu.Unlock()
            }()
        }
        wg.Wait()
        fmt.Println(total)`, '5050', 'El `Mutex` evita la condición de carrera sobre `total`.'),
      tf('Lanzar mil goroutines es costoso, como lanzar mil hilos del sistema operativo.', false, 'Cada goroutine empieza con una pila de pocos KB que crece según se necesita; es barato lanzar cientos de miles.'),
      mc('¿Qué herramienta detecta condiciones de carrera en Go?', ['`go run -race` / `go test -race`', '`go vet` únicamente', '`gofmt`', '`go mod tidy`'], 'El *race detector* instrumenta el programa y avisa de accesos concurrentes sin sincronizar.'),
    ]),

    lesson('go-chan', 'Channels', `
      Un **channel** es una tubería tipada para comunicar goroutines.

      \`\`\`
      ch := make(chan int)        // sin búfer: emisor y receptor se sincronizan
      go func() { ch <- 42 }()    // enviar
      v := <-ch                   // recibir (bloquea hasta que hay valor)

      buf := make(chan string, 2) // con búfer: no bloquea hasta llenarse
      close(buf)                  // el emisor cierra; el receptor ve que no hay más
      for msg := range buf { }    // recibe hasta que se cierra
      \`\`\`

      - Enviar o recibir en un channel sin búfer **bloquea** hasta que el otro lado está listo.
      - Solo el **emisor** debe cerrar un channel. Enviar a un channel cerrado provoca *panic*.
      - Un deadlock ocurre cuando todas las goroutines están bloqueadas: Go lo detecta y aborta.
    `, [
      predict(`
        func main() {
            ch := make(chan int)
            go func() { ch <- 6 * 7 }()
            fmt.Println(<-ch)
        }`, '42'),
      predict(`
        func main() {
            ch := make(chan int, 3)
            for i := 1; i <= 3; i++ {
                ch <- i * 10
            }
            close(ch)
            for v := range ch {
                fmt.Print(v, " ")
            }
        }`, '10 20 30', '`range` sobre un channel recibe hasta que se cierra.'),
      predict(`
        func generar(n int) <-chan int {
            out := make(chan int)
            go func() {
                defer close(out)
                for i := 1; i <= n; i++ {
                    out <- i
                }
            }()
            return out
        }

        func main() {
            suma := 0
            for v := range generar(4) {
                suma += v
            }
            fmt.Println(suma)
        }`, '10', 'Patrón generador: una goroutine produce y cierra el channel; el consumidor usa `range`.'),
      bug(`
        func main() {
            ch := make(chan int)
            ch <- 1
            fmt.Println(<-ch)
        }`, 3, 'Con un channel sin búfer, el envío bloquea esperando a un receptor que nunca llega: *deadlock*.'),
      mc('¿Quién debería cerrar un channel?', ['El emisor, cuando no enviará más', 'El receptor', 'Cualquiera, da igual', 'Nadie: se cierra solo'], 'Cerrar un channel dos veces, o enviar a uno cerrado, provoca *panic*.'),
      fill(`
        func main() {
            ch := make(chan string, 1)
            ch <- "hola"
            msg, ok := <-ch
            ___(ch)
            _, ok2 := <-ch
            fmt.Println(msg, ok, ok2)
        }`, ['close'], 'Recibir de un channel cerrado y vacío devuelve el valor cero y `ok == false`.', 'hola true false'),
    ]),

    lesson('go-select', 'select y sync', `
      \`select\` espera a **varios channels** a la vez y ejecuta el primero que esté listo:

      \`\`\`
      select {
      case v := <-datos:
          procesar(v)
      case <-time.After(time.Second):
          fmt.Println("timeout")
      case <-ctx.Done():
          return
      default:
          // si ningún caso está listo, no bloquea
      }
      \`\`\`

      El paquete \`sync\` ofrece primitivas de bajo nivel:

      - \`Mutex\` / \`RWMutex\`: exclusión mutua.
      - \`WaitGroup\`: esperar a un grupo de goroutines.
      - \`Once\`: ejecutar algo una sola vez (inicialización perezosa).
      - \`sync/atomic\`: contadores atómicos sin candado.
    `, [
      predict(`
        func main() {
            a := make(chan string, 1)
            b := make(chan string, 1)
            b <- "desde b"
            select {
            case m := <-a:
                fmt.Println(m)
            case m := <-b:
                fmt.Println(m)
            }
        }`, 'desde b', 'Solo `b` tiene un valor listo.'),
      predict(`
        func main() {
            ch := make(chan int)
            select {
            case v := <-ch:
                fmt.Println(v)
            default:
                fmt.Println("nada listo")
            }
        }`, 'nada listo', 'Con `default`, `select` no bloquea.'),
      predict(`
        func main() {
            ch := make(chan int)
            select {
            case <-ch:
            case <-time.After(10 * time.Millisecond):
                fmt.Println("timeout")
            }
        }`, 'timeout'),
      predict(`
        func main() {
            var once sync.Once
            for i := 0; i < 3; i++ {
                once.Do(func() { fmt.Println("init") })
            }
        }`, 'init', '`sync.Once` garantiza que la función se ejecute una única vez.'),
      predict(`
        func main() {
            var n atomic.Int64
            var wg sync.WaitGroup
            for i := 0; i < 50; i++ {
                wg.Add(1)
                go func() {
                    defer wg.Done()
                    n.Add(2)
                }()
            }
            wg.Wait()
            fmt.Println(n.Load())
        }`, '100'),
      match('Empareja cada primitiva con su uso', [
        ['`sync.Mutex`', 'Proteger una sección crítica'],
        ['`sync.WaitGroup`', 'Esperar a que terminen varias goroutines'],
        ['`sync.Once`', 'Inicialización que se ejecuta una sola vez'],
        ['`select`', 'Esperar al primer channel que esté listo'],
      ]),
    ]),

    lesson('go-ctx', 'context', `
      \`context.Context\` propaga **cancelaciones, plazos y valores** a través de las llamadas. Es el primer parámetro de toda función que haga E/S o pueda tardar:

      \`\`\`
      ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
      defer cancel()                      // libera recursos siempre

      func descargar(ctx context.Context, url string) error {
          req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
          ...
      }

      select {
      case <-ctx.Done():
          return ctx.Err()                // context.Canceled o context.DeadlineExceeded
      case r := <-resultado: ...
      }
      \`\`\`

      - Al cancelar un contexto, se cancelan también todos sus hijos.
      - \`WithCancel\`, \`WithTimeout\`, \`WithDeadline\`, \`WithValue\`.
      - No guardes un contexto en un struct: pásalo como primer argumento.
    `, [
      predict(`
        func main() {
            ctx, cancel := context.WithCancel(context.Background())
            cancel()
            <-ctx.Done()
            fmt.Println(ctx.Err())
        }`, 'context canceled'),
      predict(`
        func main() {
            ctx, cancel := context.WithTimeout(context.Background(), 10*time.Millisecond)
            defer cancel()
            select {
            case <-ctx.Done():
                fmt.Println(ctx.Err())
            case <-time.After(time.Second):
                fmt.Println("tarde")
            }
        }`, 'context deadline exceeded'),
      mc('¿Dónde debe ir `context.Context` en la firma de una función?', ['Como primer parámetro', 'Como último parámetro', 'Como campo de un struct', 'Como variable global'], 'Es la convención de toda la biblioteca estándar y del ecosistema.'),
      mc('¿Por qué hacer `defer cancel()` justo después de crear un contexto con timeout?', ['Libera los recursos asociados aunque no se llegue al plazo', 'Para que el timeout dure más', 'Para evitar que otras goroutines lo usen', 'Es solo una costumbre sin efecto'], 'Sin `cancel`, el temporizador y los hijos del contexto siguen vivos hasta que vence.'),
      fill(`
        func trabajar(ctx context.Context) string {
            select {
            case <-ctx.___():
                return "cancelado"
            case <-time.After(time.Second):
                return "terminado"
            }
        }

        func main() {
            ctx, cancel := context.WithCancel(context.Background())
            cancel()
            fmt.Println(trabajar(ctx))
        }`, ['Done'], undefined, 'cancelado'),
      tf('Cancelar un contexto padre cancela también a todos sus contextos hijos.', true, 'Así se detiene en cascada todo el trabajo asociado a una petición.'),
    ]),
  ]),

  unit('go4', 'Go profesional', 'experto', 'Genéricos, testing, HTTP/JSON y rendimiento: Go en producción.', [
    lesson('go-gen', 'Genéricos', `
      Desde Go 1.18 puedes escribir funciones y tipos parametrizados:

      \`\`\`
      func Mapear[T, U any](xs []T, f func(T) U) []U {
          out := make([]U, 0, len(xs))
          for _, x := range xs { out = append(out, f(x)) }
          return out
      }

      type Number interface { ~int | ~int64 | ~float64 }     // restricción: unión de tipos

      func Sumar[T Number](xs []T) T {
          var total T
          for _, x := range xs { total += x }
          return total
      }

      type Pila[T any] struct{ items []T }
      \`\`\`

      - \`any\` = sin restricción; \`comparable\` = permite \`==\`; \`cmp.Ordered\` = permite \`<\`.
      - La biblioteca estándar ya trae \`slices\`, \`maps\` y \`cmp\`: \`slices.Sort\`, \`slices.Contains\`, \`maps.Keys\`.
      - Úsalos cuando evites duplicar código; no por defecto.
    `, [
      predict(`
        func Sumar[T int | float64](xs []T) T {
            var total T
            for _, x := range xs {
                total += x
            }
            return total
        }

        func main() {
            fmt.Println(Sumar([]int{1, 2, 3}), Sumar([]float64{1.5, 2.5}))
        }`, '6 4'),
      predict(`
        func Mapear[T, U any](xs []T, f func(T) U) []U {
            out := make([]U, 0, len(xs))
            for _, x := range xs {
                out = append(out, f(x))
            }
            return out
        }

        func main() {
            fmt.Println(Mapear([]int{1, 2, 3}, func(n int) string { return strings.Repeat("*", n) }))
        }`, '[* ** ***]'),
      predict(`
        type Pila[T any] struct{ items []T }

        func (p *Pila[T]) Push(x T) { p.items = append(p.items, x) }

        func (p *Pila[T]) Pop() T {
            x := p.items[len(p.items)-1]
            p.items = p.items[:len(p.items)-1]
            return x
        }

        func main() {
            var p Pila[string]
            p.Push("a")
            p.Push("b")
            fmt.Println(p.Pop(), len(p.items))
        }`, 'b 1'),
      predict(`
        nums := []int{3, 1, 2}
        slices.Sort(nums)
        fmt.Println(nums, slices.Contains(nums, 2), slices.Index(nums, 3))`, '[1 2 3] true 2'),
      mc('¿Qué restricción necesita `T` para poder usar `==` entre dos valores?', ['`comparable`', '`any`', '`Number`', 'Ninguna'], '`any` admite cualquier tipo, incluidos los no comparables (slices, maps, funciones).'),
      fill(`
        func Maximo[T cmp.___](a, b T) T {
            if a > b {
                return a
            }
            return b
        }

        func main() {
            fmt.Println(Maximo(3, 9), Maximo("a", "b"))
        }`, ['Ordered'], '`cmp.Ordered` agrupa los tipos que admiten `<`, `>`.', '9 b'),
    ]),

    lesson('go-test', 'Testing y tooling', `
      El testing está en la biblioteca estándar. Archivos \`*_test.go\`, funciones \`TestXxx\`:

      \`\`\`
      func TestSumar(t *testing.T) {
          casos := []struct {
              nombre   string
              a, b     int
              esperado int
          }{
              {"positivos", 2, 3, 5},
              {"negativos", -1, -2, -3},
          }
          for _, c := range casos {                 // table-driven tests
              t.Run(c.nombre, func(t *testing.T) {
                  if got := Sumar(c.a, c.b); got != c.esperado {
                      t.Errorf("Sumar(%d,%d) = %d, quería %d", c.a, c.b, got, c.esperado)
                  }
              })
          }
      }
      \`\`\`

      \`\`\`bash
      go test ./...           # todos los paquetes
      go test -race -cover    # detector de carreras y cobertura
      go vet ./...            # análisis estático
      go mod init / tidy      # módulos y dependencias
      \`\`\`

      Los **benchmarks** (\`func BenchmarkXxx(b *testing.B)\`) y el **fuzzing** también vienen incluidos.
    `, [
      ask('¿Qué comando ejecuta los tests de todos los paquetes del proyecto?', ['go test ./...'], 'El patrón `./...` significa «este directorio y todos los de debajo».'),
      mc('¿Cómo debe llamarse el archivo de tests de `calculadora.go`?', ['`calculadora_test.go`', '`test_calculadora.go`', '`calculadora.test.go`', '`tests/calculadora.go`'], 'El sufijo `_test.go` es lo que reconoce `go test`.'),
      mc('¿Qué es un *table-driven test*?', ['Un test que recorre una tabla de casos (entrada y resultado esperado)', 'Un test de una base de datos', 'Un test que solo se ejecuta en Linux', 'Un test generado automáticamente'], 'Es el estilo idiomático en Go: añadir un caso es añadir una fila.'),
      match('Empareja cada herramienta con su función', [
        ['`go vet`', 'Detecta construcciones sospechosas'],
        ['`go test -race`', 'Detecta condiciones de carrera'],
        ['`go mod tidy`', 'Sincroniza las dependencias del go.mod'],
        ['`go build`', 'Compila el programa a un binario'],
      ]),
      fill(`
        func TestSuma(t *testing.___) {
            if 2+2 != 4 {
                t.Error("matematicas rotas")
            }
        }`, ['T'], 'Toda función de test recibe un `*testing.T`.'),
      tf('Go necesita un framework externo para ejecutar tests y benchmarks.', false, 'El paquete `testing` y el comando `go test` ya los incluyen.'),
    ]),

    lesson('go-http', 'HTTP y JSON', `
      Con solo la biblioteca estándar puedes montar una API:

      \`\`\`
      type Tarea struct {
          ID     int    \`json:"id"\`
          Titulo string \`json:"titulo"\`
          Hecha  bool   \`json:"hecha,omitempty"\`
      }

      mux := http.NewServeMux()
      mux.HandleFunc("GET /tareas/{id}", func(w http.ResponseWriter, r *http.Request) {
          id := r.PathValue("id")
          w.Header().Set("Content-Type", "application/json")
          json.NewEncoder(w).Encode(Tarea{ID: 1, Titulo: "aprender Go"})
      })
      http.ListenAndServe(":8080", mux)
      \`\`\`

      - Las **struct tags** controlan cómo se serializa cada campo.
      - \`json.Marshal(v)\` → \`[]byte\`; \`json.Unmarshal(data, &v)\` → rellena \`v\`.
      - Configura **timeouts** en el servidor y en el cliente; los valores por defecto no tienen.
      - \`httptest\` permite probar *handlers* sin red.
    `, [
      predict(`
        type Tarea struct {
            ID     int    \`json:"id"\`
            Titulo string \`json:"titulo"\`
        }

        func main() {
            b, _ := json.Marshal(Tarea{1, "estudiar"})
            fmt.Println(string(b))
        }`, '{"id":1,"titulo":"estudiar"}'),
      predict(`
        type Usuario struct {
            Nombre string \`json:"nombre"\`
            Edad   int    \`json:"edad"\`
        }

        func main() {
            var u Usuario
            err := json.Unmarshal([]byte(\`{"nombre":"Ada","edad":36}\`), &u)
            fmt.Println(u.Nombre, u.Edad, err)
        }`, 'Ada 36 <nil>'),
      predict(`
        type Resp struct {
            OK    bool   \`json:"ok"\`
            Error string \`json:"error,omitempty"\`
        }

        func main() {
            b, _ := json.Marshal(Resp{OK: true})
            fmt.Println(string(b))
        }`, '{"ok":true}', '`omitempty` omite el campo si tiene su valor cero.'),
      mc('¿Por qué `json.Unmarshal(data, &v)` recibe un puntero?', ['Para poder rellenar la variable original', 'Para que sea más rápido', 'Porque `v` es siempre un map', 'Es opcional'], 'Go pasa por valor: sin puntero, la función solo modificaría una copia.'),
      mc('¿Qué código HTTP debería devolver un handler cuando el recurso pedido no existe?', ['404', '200', '500', '301'], 'Usa `http.Error(w, "no encontrado", http.StatusNotFound)`.'),
      mc('¿Qué riesgo tiene `http.ListenAndServe` con un `http.Server` sin timeouts configurados?', ['Un cliente lento puede mantener conexiones abiertas indefinidamente', 'No arranca el servidor', 'Solo acepta una conexión', 'No puede devolver JSON'], 'En producción se configuran `ReadTimeout`, `WriteTimeout` e `IdleTimeout`.'),
    ]),

    lesson('go-perf', 'Rendimiento', `
      **Mide antes de optimizar.** Go trae las herramientas:

      \`\`\`bash
      go test -bench=. -benchmem          # tiempo y asignaciones por operación
      go test -cpuprofile cpu.out
      go tool pprof cpu.out               # dónde se va la CPU
      go build -gcflags=-m                # análisis de escape: ¿stack o heap?
      \`\`\`

      Reglas prácticas:

      - Reduce **asignaciones** en el camino caliente: preasigna con \`make([]T, 0, n)\`.
      - Usa \`strings.Builder\` para concatenar en bucles.
      - \`sync.Pool\` reutiliza objetos temporales.
      - Evita copiar structs grandes en bucles (usa índices o punteros).
      - El **recolector de basura** de Go es concurrente y de baja latencia; ajústalo con \`GOGC\` y \`GOMEMLIMIT\`.
    `, [
      predict(`
        var sb strings.Builder
        for i := 0; i < 3; i++ {
            fmt.Fprintf(&sb, "%d,", i)
        }
        fmt.Println(sb.String())`, '0,1,2,'),
      mc('Sabes que vas a añadir 10 000 elementos a un slice. ¿Qué haces?', ['`make([]T, 0, 10000)` para reservar capacidad', 'Nada: `append` es siempre gratis', 'Usar un array de tamaño 10 000 en cada iteración', 'Convertirlo en map'], 'Reservar capacidad evita reasignaciones y copias sucesivas.'),
      mc('¿Qué herramienta muestra qué funciones consumen más CPU?', ['`pprof`', '`gofmt`', '`go vet`', '`go doc`'], '`go tool pprof` analiza perfiles de CPU y memoria.'),
      order('Ordena el proceso correcto de optimización', ['Escribir un benchmark que reproduzca el problema', 'Perfilar para localizar el cuello de botella', 'Optimizar solo ese punto', 'Volver a ejecutar el benchmark para comprobar la mejora']),
      tf('Una variable local siempre vive en el stack en Go.', false, 'Si «escapa» (p. ej. se devuelve su puntero), el compilador la coloca en el heap. `-gcflags=-m` lo muestra.'),
      mc('¿Para qué sirve `sync.Pool`?', ['Reutilizar objetos temporales para reducir la presión sobre el GC', 'Limitar el número de goroutines', 'Compartir datos entre procesos', 'Hacer un pool de conexiones a la base de datos'], 'Es ideal para búferes que se crean y descartan constantemente.'),
    ]),
  ]),
])
