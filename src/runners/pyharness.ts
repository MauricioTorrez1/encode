// Arnés de Python compartido por el worker de Pyodide y el verificador de contenido.
// Ejecuta el código del usuario, captura stdout y evalúa los tests [expresión, esperado].
export const PY_HARNESS = `
import sys, io, json, traceback

def __encode_run(code, tests):
    out = io.StringIO()
    res = {"stdout": "", "error": None, "tests": []}
    old = sys.stdout
    sys.stdout = out
    ns = {"__name__": "__main__"}
    try:
        exec(compile(code, "main.py", "exec"), ns)
        for expr, expected in tests:
            try:
                got = eval(expr, ns)
                exp = eval(expected, ns)
                res["tests"].append({"expr": expr, "ok": bool(got == exp), "got": repr(got), "exp": repr(exp)})
            except Exception as e:
                res["tests"].append({"expr": expr, "ok": False, "got": type(e).__name__ + ": " + str(e), "exp": expected})
    except BaseException as e:
        tb = traceback.extract_tb(e.__traceback__)
        line = next((f.lineno for f in reversed(tb) if f.filename == "main.py"), getattr(e, "lineno", None))
        res["error"] = (f"Línea {line}: " if line else "") + type(e).__name__ + ": " + str(e)
    finally:
        sys.stdout = old
    res["stdout"] = out.getvalue()
    return json.dumps(res)
`

export interface PyTest { expr: string; ok: boolean; got: string; exp: string }
export interface PyResult { stdout: string; error: string | null; tests: PyTest[] }
