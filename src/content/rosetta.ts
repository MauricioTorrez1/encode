// Rosetta: el mismo concepto en los cuatro lenguajes. Todos los snippets de una entrada imprimen
// exactamente la misma salida (lo comprueba el verificador de contenido).
import { dedent } from './dsl'

export type CodeLang = 'python' | 'java' | 'go' | 'rust'
export const CODE_LANGS: CodeLang[] = ['python', 'java', 'go', 'rust']
export const LANG_NAME: Record<CodeLang, string> = { python: 'Python', java: 'Java', go: 'Go', rust: 'Rust' }

export interface Rosetta { id: string; title: string; note: string; out: string; code: Record<CodeLang, string> }

const r = (id: string, title: string, note: string, out: string, python: string, java: string, go: string, rust: string): Rosetta => ({
  id, title, note, out: dedent(out),
  code: { python: dedent(python), java: dedent(java), go: dedent(go), rust: dedent(rust) },
})

export const ROSETTA: Rosetta[] = [
  r('vars', 'Variables e impresión',
    'Python y Go infieren el tipo; Java lo declara (o usa `var`); en Rust las variables son inmutables salvo que escribas `mut`.',
    'Ada tiene 36',
    `
    nombre = "Ada"
    edad = 36
    print(f"{nombre} tiene {edad}")`,
    `
    String nombre = "Ada";
    int edad = 36;
    System.out.println(nombre + " tiene " + edad);`,
    `
    nombre := "Ada"
    edad := 36
    fmt.Printf("%s tiene %d\\n", nombre, edad)`,
    `
    let nombre = "Ada";
    let edad = 36;
    println!("{nombre} tiene {edad}");`),

  r('cond', 'Condicional',
    'Go y Rust no llevan paréntesis en la condición. En Rust `if` es una expresión: devuelve un valor.',
    'impar',
    `
    n = 7
    if n % 2 == 0:
        print("par")
    else:
        print("impar")`,
    `
    int n = 7;
    if (n % 2 == 0) {
        System.out.println("par");
    } else {
        System.out.println("impar");
    }`,
    `
    n := 7
    if n%2 == 0 {
        fmt.Println("par")
    } else {
        fmt.Println("impar")
    }`,
    `
    let n = 7;
    let tipo = if n % 2 == 0 { "par" } else { "impar" };
    println!("{tipo}");`),

  r('loop', 'Bucle con rango',
    'Go solo tiene `for`. Los rangos de Python y Rust excluyen el final (`range(1, 6)`, `1..6`); `1..=5` lo incluye.',
    '15',
    `
    total = 0
    for i in range(1, 6):
        total += i
    print(total)`,
    `
    int total = 0;
    for (int i = 1; i <= 5; i++) {
        total += i;
    }
    System.out.println(total);`,
    `
    total := 0
    for i := 1; i <= 5; i++ {
        total += i
    }
    fmt.Println(total)`,
    `
    let mut total = 0;
    for i in 1..=5 {
        total += i;
    }
    println!("{total}");`),

  r('func', 'Funciones',
    'En Rust la última expresión sin `;` es el valor de retorno. Go escribe el tipo después del nombre.',
    '16',
    `
    def cuadrado(n):
        return n * n

    print(cuadrado(4))`,
    `
    class Main {
        static int cuadrado(int n) {
            return n * n;
        }

        public static void main(String[] args) {
            System.out.println(cuadrado(4));
        }
    }`,
    `
    func cuadrado(n int) int {
        return n * n
    }

    func main() {
        fmt.Println(cuadrado(4))
    }`,
    `
    fn cuadrado(n: i32) -> i32 {
        n * n
    }

    fn main() {
        println!("{}", cuadrado(4));
    }`),

  r('list', 'Listas dinámicas',
    '`list` en Python, `ArrayList` en Java, slice en Go y `Vec` en Rust. En Go, `append` devuelve el slice nuevo.',
    '3 3',
    `
    nums = [1, 2]
    nums.append(3)
    print(len(nums), nums[-1])`,
    `
    List<Integer> nums = new ArrayList<>(List.of(1, 2));
    nums.add(3);
    System.out.println(nums.size() + " " + nums.get(nums.size() - 1));`,
    `
    nums := []int{1, 2}
    nums = append(nums, 3)
    fmt.Println(len(nums), nums[len(nums)-1])`,
    `
    let mut nums = vec![1, 2];
    nums.push(3);
    println!("{} {}", nums.len(), nums[nums.len() - 1]);`),

  r('map', 'Diccionarios / mapas',
    'Clave → valor con búsqueda O(1) de media: `dict`, `HashMap`, `map` y `HashMap`.',
    '25 2',
    `
    edades = {"ana": 30}
    edades["luis"] = 25
    print(edades["luis"], len(edades))`,
    `
    Map<String, Integer> edades = new HashMap<>();
    edades.put("ana", 30);
    edades.put("luis", 25);
    System.out.println(edades.get("luis") + " " + edades.size());`,
    `
    edades := map[string]int{"ana": 30}
    edades["luis"] = 25
    fmt.Println(edades["luis"], len(edades))`,
    `
    use std::collections::HashMap;
    let mut edades = HashMap::from([("ana", 30)]);
    edades.insert("luis", 25);
    println!("{} {}", edades["luis"], edades.len());`),

  r('each', 'Recorrer con índice',
    '`enumerate` en Python y Rust; `range` en Go devuelve índice y valor.',
    `
    0 go
    1 rust`,
    `
    for i, lang in enumerate(["go", "rust"]):
        print(i, lang)`,
    `
    List<String> langs = List.of("go", "rust");
    for (int i = 0; i < langs.size(); i++) {
        System.out.println(i + " " + langs.get(i));
    }`,
    `
    for i, lang := range []string{"go", "rust"} {
        fmt.Println(i, lang)
    }`,
    `
    for (i, lang) in ["go", "rust"].iter().enumerate() {
        println!("{i} {lang}");
    }`),

  r('str', 'Strings',
    'Los strings son inmutables en Python, Java y Go. En Rust, `&str` es una vista y `String` es propiedad en el heap.',
    'HOLA 4',
    `
    s = "hola"
    print(s.upper(), len(s))`,
    `
    String s = "hola";
    System.out.println(s.toUpperCase() + " " + s.length());`,
    `
    s := "hola"
    fmt.Println(strings.ToUpper(s), len(s))`,
    `
    let s = "hola";
    println!("{} {}", s.to_uppercase(), s.len());`),

  r('struct', 'Tipos propios con métodos',
    'Clase en Python, `record` en Java, `struct` + métodos en Go y `struct` + `impl` en Rust.',
    '7',
    `
    class Punto:
        def __init__(self, x, y):
            self.x = x
            self.y = y

        def suma(self):
            return self.x + self.y

    p = Punto(3, 4)
    print(p.suma())`,
    `
    record Punto(int x, int y) {
        int suma() {
            return x + y;
        }
    }
    Punto p = new Punto(3, 4);
    System.out.println(p.suma());`,
    `
    type Punto struct {
        X, Y int
    }

    func (p Punto) Suma() int {
        return p.X + p.Y
    }

    func main() {
        p := Punto{3, 4}
        fmt.Println(p.Suma())
    }`,
    `
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
    }`),

  r('err', 'Manejo de errores',
    'Python y Java lanzan excepciones. Go devuelve el error como valor; Rust lo codifica en el tipo `Result`.',
    'error: division por cero',
    `
    def dividir(a, b):
        if b == 0:
            raise ValueError("division por cero")
        return a // b

    try:
        print(dividir(1, 0))
    except ValueError as e:
        print("error:", e)`,
    `
    class Main {
        static int dividir(int a, int b) {
            if (b == 0) {
                throw new IllegalArgumentException("division por cero");
            }
            return a / b;
        }

        public static void main(String[] args) {
            try {
                System.out.println(dividir(1, 0));
            } catch (IllegalArgumentException e) {
                System.out.println("error: " + e.getMessage());
            }
        }
    }`,
    `
    func dividir(a, b int) (int, error) {
        if b == 0 {
            return 0, errors.New("division por cero")
        }
        return a / b, nil
    }

    func main() {
        r, err := dividir(1, 0)
        if err != nil {
            fmt.Println("error:", err)
            return
        }
        fmt.Println(r)
    }`,
    `
    fn dividir(a: i32, b: i32) -> Result<i32, String> {
        if b == 0 {
            return Err(String::from("division por cero"));
        }
        Ok(a / b)
    }

    fn main() {
        match dividir(1, 0) {
            Ok(r) => println!("{r}"),
            Err(e) => println!("error: {e}"),
        }
    }`),

  r('opt', 'Ausencia de valor',
    '`None` en Python, `Optional` en Java, el idiom «coma ok» en Go y `Option` en Rust.',
    'no encontrado',
    `
    usuarios = {1: "ana"}
    nombre = usuarios.get(7)
    print(nombre if nombre is not None else "no encontrado")`,
    `
    Map<Integer, String> usuarios = Map.of(1, "ana");
    String nombre = Optional.ofNullable(usuarios.get(7)).orElse("no encontrado");
    System.out.println(nombre);`,
    `
    usuarios := map[int]string{1: "ana"}
    nombre, ok := usuarios[7]
    if !ok {
        nombre = "no encontrado"
    }
    fmt.Println(nombre)`,
    `
    use std::collections::HashMap;
    let usuarios = HashMap::from([(1, "ana")]);
    let nombre = usuarios.get(&7).copied().unwrap_or("no encontrado");
    println!("{nombre}");`),

  r('fmap', 'Filtrar y transformar',
    'Expresión generadora en Python, streams en Java, bucle explícito en Go e iteradores perezosos en Rust.',
    '56',
    `
    total = sum(n * n for n in range(1, 7) if n % 2 == 0)
    print(total)`,
    `
    int total = IntStream.rangeClosed(1, 6)
        .filter(n -> n % 2 == 0)
        .map(n -> n * n)
        .sum();
    System.out.println(total);`,
    `
    total := 0
    for n := 1; n <= 6; n++ {
        if n%2 == 0 {
            total += n * n
        }
    }
    fmt.Println(total)`,
    `
    let total: i32 = (1..=6)
        .filter(|n| n % 2 == 0)
        .map(|n| n * n)
        .sum();
    println!("{total}");`),

  r('iface', 'Interfaces y polimorfismo',
    'En Go las interfaces se cumplen implícitamente. En Rust, `dyn Trait` da despacho dinámico.',
    '9',
    `
    from abc import ABC, abstractmethod

    class Figura(ABC):
        @abstractmethod
        def area(self): ...

    class Cuadrado(Figura):
        def __init__(self, lado):
            self.lado = lado

        def area(self):
            return self.lado ** 2

    figura: Figura = Cuadrado(3)
    print(figura.area())`,
    `
    interface Figura {
        int area();
    }
    record Cuadrado(int lado) implements Figura {
        public int area() {
            return lado * lado;
        }
    }
    Figura figura = new Cuadrado(3);
    System.out.println(figura.area());`,
    `
    type Figura interface {
        Area() int
    }

    type Cuadrado struct {
        Lado int
    }

    func (c Cuadrado) Area() int {
        return c.Lado * c.Lado
    }

    func main() {
        var figura Figura = Cuadrado{3}
        fmt.Println(figura.Area())
    }`,
    `
    trait Figura {
        fn area(&self) -> i32;
    }

    struct Cuadrado {
        lado: i32,
    }

    impl Figura for Cuadrado {
        fn area(&self) -> i32 {
            self.lado * self.lado
        }
    }

    fn main() {
        let figura: Box<dyn Figura> = Box::new(Cuadrado { lado: 3 });
        println!("{}", figura.area());
    }`),

  r('conc', 'Tarea concurrente',
    'Pool de hilos en Python, `CompletableFuture` en Java, goroutine + channel en Go y `thread::spawn` en Rust.',
    'resultado: 42',
    `
    from concurrent.futures import ThreadPoolExecutor

    def calcular():
        return 6 * 7

    with ThreadPoolExecutor() as pool:
        futuro = pool.submit(calcular)
        print("resultado:", futuro.result())`,
    `
    CompletableFuture<Integer> futuro = CompletableFuture.supplyAsync(() -> 6 * 7);
    System.out.println("resultado: " + futuro.get());`,
    `
    canal := make(chan int)
    go func() {
        canal <- 6 * 7
    }()
    fmt.Println("resultado:", <-canal)`,
    `
    use std::thread;
    let hilo = thread::spawn(|| 6 * 7);
    println!("resultado: {}", hilo.join().unwrap());`),

  r('sort', 'Ordenar',
    'Todos ordenan in situ aquí. Python también ofrece `sorted()`, que devuelve una lista nueva.',
    '1 2 3',
    `
    nums = [3, 1, 2]
    nums.sort()
    print(*nums)`,
    `
    List<Integer> nums = new ArrayList<>(List.of(3, 1, 2));
    Collections.sort(nums);
    System.out.println(nums.get(0) + " " + nums.get(1) + " " + nums.get(2));`,
    `
    nums := []int{3, 1, 2}
    sort.Ints(nums)
    fmt.Println(nums[0], nums[1], nums[2])`,
    `
    let mut nums = vec![3, 1, 2];
    nums.sort();
    println!("{} {} {}", nums[0], nums[1], nums[2]);`),
]
