// Simulador de git en memoria. Modela commits, ramas, índice, directorio de trabajo, stash,
// un remoto `origin` y el reflog. La salida imita a git real (en inglés, como lo verás en el trabajo).
import { hashStr } from '../engine/rng'

export type Tree = Record<string, string>
export interface Commit { id: string; parents: string[]; msg: string; tree: Tree; lane: string; n: number }
export interface GraphNode { id: string; msg: string; parents: string[]; col: number; lane: number; labels: string[]; head: boolean }

const same = (a: Tree, b: Tree) => {
  const ka = Object.keys(a), kb = Object.keys(b)
  return ka.length === kb.length && ka.every((k) => a[k] === b[k])
}

/** Divide una línea de comandos respetando comillas. */
export function tokenize(line: string): string[] {
  const out: string[] = []
  const re = /"((?:\\.|[^"\\])*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) out.push(m[1] !== undefined ? m[1].replace(/\\(.)/g, '$1') : m[2] ?? m[3])
  return out
}

export class GitSim {
  inited = false
  commits = new Map<string, Commit>()
  branches: Record<string, string | null> = {}
  tags: Record<string, string> = {}
  /** HEAD apunta a una rama o, en detached HEAD, a un commit. */
  head: { branch?: string; id?: string } = { branch: 'main' }
  index: Tree = {}
  wd: Tree = {}
  stash: { index: Tree; wd: Tree; msg: string }[] = []
  /** Ramas del remoto `origin` (null si no hay remoto). */
  remote: Record<string, string> | null = null
  /** Ramas de seguimiento locales (`origin/x`). */
  tracking: Record<string, string> = {}
  upstream: Record<string, string> = {}
  merging: { other: string; name: string } | null = null
  conflicts: string[] = []
  reflog: { id: string; what: string }[] = []
  private counter = 0

  // ── Consultas (usadas por los retos y la interfaz) ───────────────────────

  headId(): string | null { return this.head.branch ? this.branches[this.head.branch] ?? null : this.head.id ?? null }
  currentBranch(): string | null { return this.head.branch ?? null }
  branchId(name: string): string | null { return this.branches[name] ?? null }
  headTree(): Tree { const id = this.headId(); return id ? this.commits.get(id)!.tree : {} }
  treeOf(ref: string): Tree { const id = this.resolve(ref); return id ? this.commits.get(id)!.tree : {} }
  file(path: string): string | undefined { return this.wd[path] }

  ancestors(id: string | null): Set<string> {
    const seen = new Set<string>()
    const stack = id ? [id] : []
    while (stack.length) {
      const c = stack.pop()!
      if (seen.has(c)) continue
      seen.add(c)
      stack.push(...this.commits.get(c)!.parents)
    }
    return seen
  }
  isAncestor(a: string | null, b: string | null): boolean { return !!a && !!b && this.ancestors(b).has(a) }
  /** Commits alcanzables desde `ref`, del más nuevo al más antiguo. */
  history(ref = 'HEAD'): Commit[] {
    return [...this.ancestors(this.resolve(ref))].map((id) => this.commits.get(id)!).sort((a, b) => b.n - a.n)
  }
  count(ref = 'HEAD'): number { return this.ancestors(this.resolve(ref)).size }
  msgs(ref = 'HEAD'): string[] { return this.history(ref).map((c) => c.msg) }
  staged(): string[] { return this.diffPaths(this.headTree(), this.index) }
  modified(): string[] { return this.diffPaths(this.index, this.wd).filter((p) => p in this.index) }
  untracked(): string[] { return Object.keys(this.wd).filter((p) => !(p in this.index)).sort() }
  clean(): boolean { return !this.staged().length && !this.modified().length && !this.untracked().length }

  private diffPaths(a: Tree, b: Tree): string[] {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((p) => a[p] !== b[p]).sort()
  }

  resolve(ref: string): string | null {
    const m = ref.match(/^(.*?)((?:~\d*|\^)*)$/)!
    let base = m[1], id: string | null
    const rl = base.match(/^HEAD@\{(\d+)\}$/)
    if (rl) id = this.reflog[this.reflog.length - 1 - Number(rl[1])]?.id ?? null
    else if (base === 'HEAD' || base === '@' || base === '') id = this.headId()
    else if (base in this.branches) id = this.branches[base]
    else if (base in this.tags) id = this.tags[base]
    else if (base.startsWith('origin/') && base.slice(7) in this.tracking) id = this.tracking[base.slice(7)]
    else id = base.length >= 4 ? [...this.commits.keys()].find((k) => k.startsWith(base)) ?? null : null
    for (const step of m[2].match(/~\d*|\^/g) ?? []) {
      const n = step === '^' || step === '~' ? 1 : Number(step.slice(1))
      for (let i = 0; i < n && id; i++) id = this.commits.get(id)!.parents[0] ?? null
    }
    return id
  }

  /** Nodos del grafo visibles desde las referencias locales, con columna (tiempo) y carril (rama). */
  graph(): GraphNode[] {
    const roots = [...Object.values(this.branches), ...Object.values(this.tags), ...Object.values(this.tracking), this.headId()]
    const visible = new Set<string>()
    for (const r of roots) for (const id of this.ancestors(r)) visible.add(id)
    const list = [...visible].map((id) => this.commits.get(id)!).sort((a, b) => a.n - b.n)
    const lanes: string[] = []
    const headId = this.headId()
    return list.map((c, col) => {
      if (!lanes.includes(c.lane)) lanes.push(c.lane)
      const labels: string[] = []
      for (const [b, id] of Object.entries(this.branches)) if (id === c.id) labels.push(this.head.branch === b ? `HEAD → ${b}` : b)
      if (!this.head.branch && headId === c.id) labels.push('HEAD')
      for (const [t, id] of Object.entries(this.tags)) if (id === c.id) labels.push(`tag: ${t}`)
      for (const [b, id] of Object.entries(this.tracking)) if (id === c.id) labels.push(`origin/${b}`)
      return { id: c.id, msg: c.msg, parents: c.parents.filter((p) => visible.has(p)), col, lane: lanes.indexOf(c.lane), labels, head: headId === c.id }
    })
  }

  // ── Mutaciones internas ───────────────────────────────────────────────────

  private newCommit(msg: string, tree: Tree, parents: string[], lane?: string): string {
    const n = ++this.counter
    const id = hashStr(`c${n}:${msg}`).toString(16).padStart(8, '0').slice(0, 7)
    this.commits.set(id, { id, parents, msg, tree: { ...tree }, n, lane: lane ?? this.head.branch ?? 'detached' })
    return id
  }
  private moveHead(id: string, what: string) {
    if (this.head.branch) this.branches[this.head.branch] = id
    else this.head.id = id
    this.reflog.push({ id, what })
  }
  private checkoutTree(tree: Tree) {
    const untracked = Object.fromEntries(this.untracked().map((p) => [p, this.wd[p]]))
    this.index = { ...tree }
    this.wd = { ...untracked, ...tree }
  }
  private dirty(): boolean { return this.staged().length > 0 || this.modified().length > 0 }
  private mergeBase(a: string, b: string): string | null {
    const aa = this.ancestors(a)
    const common = [...this.ancestors(b)].filter((id) => aa.has(id)).map((id) => this.commits.get(id)!)
    return common.sort((x, y) => y.n - x.n)[0]?.id ?? null
  }
  /** Fusión a tres bandas por archivo. */
  private merge3(base: Tree, ours: Tree, theirs: Tree): { tree: Tree; conflicts: string[] } {
    const tree: Tree = {}
    const conflicts: string[] = []
    for (const p of new Set([...Object.keys(base), ...Object.keys(ours), ...Object.keys(theirs)])) {
      const b = base[p], o = ours[p], t = theirs[p]
      const pickv = o === t ? o : o === b ? t : t === b ? o : undefined
      if (o !== t && o !== b && t !== b) {
        conflicts.push(p)
        tree[p] = `<<<<<<< HEAD\n${o ?? ''}\n=======\n${t ?? ''}\n>>>>>>> theirs`
      } else if (pickv !== undefined) tree[p] = pickv
    }
    return { tree, conflicts: conflicts.sort() }
  }

  // ── Intérprete ────────────────────────────────────────────────────────────

  /** Ejecuta una línea y devuelve la salida. Nunca lanza: los errores se devuelven como texto. */
  run(line: string): string {
    const trimmed = line.trim()
    if (!trimmed) return ''
    try {
      const args = tokenize(trimmed)
      const cmd = args.shift()!
      if (cmd === 'git') return this.git(args)
      if (cmd.startsWith('@')) return this.special(cmd, args)
      return this.shell(cmd, args, trimmed)
    } catch (e) {
      return (e as Error).message
    }
  }

  runAll(lines: string[]): string[] { return lines.map((l) => this.run(l)) }

  private shell(cmd: string, args: string[], raw: string): string {
    switch (cmd) {
      case 'touch': for (const f of args) this.wd[f] ??= ''; return ''
      case 'echo': {
        const m = raw.match(/^echo\s+(.*?)\s*(>>?)\s*(\S+)\s*$/)
        if (!m) return tokenize(raw).slice(1).join(' ')
        const text = tokenize(m[1]).join(' ')
        this.wd[m[3]] = m[2] === '>>' && this.wd[m[3]] ? `${this.wd[m[3]]}\n${text}` : text
        return ''
      }
      case 'cat': return args.map((f) => this.wd[f] ?? `cat: ${f}: No such file or directory`).join('\n')
      case 'ls': return Object.keys(this.wd).sort().join('  ')
      case 'rm': for (const f of args.filter((a) => !a.startsWith('-'))) { if (!(f in this.wd)) return `rm: ${f}: No such file or directory`; delete this.wd[f] } return ''
      case 'pwd': return '/home/dev/proyecto'
      case 'mkdir': case 'cd': return ''
      case 'help': return HELP
      default: return `${cmd}: command not found — escribe "help" para ver los comandos disponibles`
    }
  }

  /** Comandos de escenario (no visibles para el usuario): simulan el trabajo de compañeros en el remoto. */
  private special(cmd: string, a: string[]): string {
    if (cmd === '@remote-commit') {
      const [branch, msg, file, content] = a
      this.remote ??= {}
      const parent = this.remote[branch] ?? null
      const tree = { ...(parent ? this.commits.get(parent)!.tree : {}), ...(file ? { [file]: content ?? '' } : {}) }
      this.remote[branch] = this.newCommit(msg, tree, parent ? [parent] : [], branch)
      return ''
    }
    throw new Error(`comando de escenario desconocido: ${cmd}`)
  }

  private git(a: string[]): string {
    const sub = a.shift()
    if (!sub) return 'usage: git <command> [<args>]'
    if (sub === 'init') {
      if (this.inited) return 'Reinitialized existing Git repository in /home/dev/proyecto/.git/'
      this.inited = true
      const b = flagValue(a, '-b') ?? flagValue(a, '--initial-branch') ?? 'main'
      this.head = { branch: b }
      this.branches[b] = null
      return 'Initialized empty Git repository in /home/dev/proyecto/.git/'
    }
    if (sub === 'clone') return this.clone(a)
    if (sub === 'help' || sub === '--help') return HELP
    if (!this.inited) return 'fatal: not a git repository (or any of the parent directories): .git'
    switch (sub) {
      case 'status': return this.status()
      case 'add': return this.add(a)
      case 'commit': return this.commit(a)
      case 'log': return this.log(a)
      case 'branch': return this.branch(a)
      case 'checkout': return this.checkout(a)
      case 'switch': return this.switch(a)
      case 'merge': return this.merge(a)
      case 'rebase': return this.rebase(a)
      case 'reset': return this.reset(a)
      case 'restore': return this.restore(a)
      case 'revert': return this.revert(a)
      case 'cherry-pick': return this.cherryPick(a)
      case 'tag': return this.tag(a)
      case 'stash': return this.doStash(a)
      case 'diff': return this.diff(a)
      case 'show': return this.show(a)
      case 'rm': return this.rm(a)
      case 'remote': return this.remoteCmd(a)
      case 'push': return this.push(a)
      case 'fetch': return this.fetch()
      case 'pull': return this.pull(a)
      case 'reflog': return this.reflog.slice().reverse().map((r, i) => `${r.id} HEAD@{${i}}: ${r.what}`).join('\n')
      default: return `git: '${sub}' is not a git command. See 'git help'.`
    }
  }

  private status(): string {
    const out: string[] = [this.head.branch ? `On branch ${this.head.branch}` : `HEAD detached at ${this.head.id}`]
    const b = this.head.branch
    if (b && this.upstream[b] && this.tracking[this.upstream[b]] !== undefined) {
      const local = this.ancestors(this.branches[b]), rem = this.ancestors(this.tracking[this.upstream[b]])
      const ahead = [...local].filter((x) => !rem.has(x)).length, behind = [...rem].filter((x) => !local.has(x)).length
      if (ahead && behind) out.push(`Your branch and 'origin/${this.upstream[b]}' have diverged.`)
      else if (ahead) out.push(`Your branch is ahead of 'origin/${this.upstream[b]}' by ${ahead} commit${ahead > 1 ? 's' : ''}.`)
      else if (behind) out.push(`Your branch is behind 'origin/${this.upstream[b]}' by ${behind} commit${behind > 1 ? 's' : ''}.`)
      else out.push(`Your branch is up to date with 'origin/${this.upstream[b]}'.`)
    }
    if (!this.headId()) out.push('', 'No commits yet')
    if (this.merging) out.push('', this.conflicts.length ? 'You have unmerged paths.\n  (fix conflicts and run "git commit")' : 'All conflicts fixed but you are still merging.\n  (use "git commit" to conclude merge)')
    const head = this.headTree()
    const staged = this.staged().filter((p) => !this.conflicts.includes(p))
    const modified = this.modified().filter((p) => !this.conflicts.includes(p))
    const untracked = this.untracked()
    const kind = (from: Tree, to: Tree, p: string) => (!(p in from) ? 'new file:   ' : !(p in to) ? 'deleted:    ' : 'modified:   ')
    if (staged.length) out.push('', 'Changes to be committed:', ...staged.map((p) => `\t${kind(head, this.index, p)}${p}`))
    if (this.conflicts.length) out.push('', 'Unmerged paths:', ...this.conflicts.map((p) => `\tboth modified:   ${p}`))
    if (modified.length) out.push('', 'Changes not staged for commit:', ...modified.map((p) => `\t${kind(this.index, this.wd, p)}${p}`))
    if (untracked.length) out.push('', 'Untracked files:', ...untracked.map((p) => `\t${p}`))
    if (!staged.length && !modified.length && !untracked.length && !this.conflicts.length) out.push('', 'nothing to commit, working tree clean')
    return out.join('\n')
  }

  private add(a: string[]): string {
    const paths = a.filter((x) => !x.startsWith('-') || x === '-A')
    if (!paths.length && !a.includes('--all')) return 'Nothing specified, nothing added.'
    const all = paths.some((p) => p === '.' || p === '-A') || a.includes('--all')
    const targets = all ? [...new Set([...Object.keys(this.wd), ...Object.keys(this.index)])] : paths
    for (const p of targets) {
      if (p in this.wd) this.index[p] = this.wd[p]
      else if (p in this.index) delete this.index[p]
      else return `fatal: pathspec '${p}' did not match any files`
      this.conflicts = this.conflicts.filter((c) => c !== p)
    }
    return ''
  }

  private rm(a: string[]): string {
    const cached = a.includes('--cached')
    for (const p of a.filter((x) => !x.startsWith('-'))) {
      if (!(p in this.index)) return `fatal: pathspec '${p}' did not match any files`
      delete this.index[p]
      if (!cached) delete this.wd[p]
    }
    return ''
  }

  private commit(a: string[]): string {
    const amend = a.includes('--amend')
    let msg = flagValue(a, '-m') ?? flagValue(a, '-am') ?? flagValue(a, '--message')
    if (a.includes('-am') || a.includes('-a')) for (const p of this.modified()) { if (p in this.wd) this.index[p] = this.wd[p]; else delete this.index[p] }
    if (this.conflicts.length) return `error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add <file>'`
    const headId = this.headId()
    if (amend) {
      if (!headId) return 'fatal: You have nothing to amend.'
      const old = this.commits.get(headId)!
      const id = this.newCommit(msg ?? old.msg, this.index, old.parents, old.lane)
      this.moveHead(id, `commit (amend): ${msg ?? old.msg}`)
      return `[${this.head.branch ?? 'detached HEAD'} ${id}] ${msg ?? old.msg}`
    }
    if (this.merging) {
      msg ??= `Merge branch '${this.merging.name}'`
      const id = this.newCommit(msg, this.index, [headId!, this.merging.other])
      this.merging = null
      this.moveHead(id, `commit (merge): ${msg}`)
      return `[${this.head.branch ?? 'detached HEAD'} ${id}] ${msg}`
    }
    if (same(this.index, this.headTree())) {
      return this.modified().length || this.untracked().length
        ? 'no changes added to commit (use "git add" and/or "git commit -a")'
        : 'nothing to commit, working tree clean'
    }
    if (msg === undefined) return 'error: en este simulador escribe el mensaje con -m "mensaje"'
    if (!msg.trim()) return 'Aborting commit due to empty commit message.'
    const changed = this.staged().length
    const id = this.newCommit(msg, this.index, headId ? [headId] : [])
    this.moveHead(id, `commit${headId ? '' : ' (initial)'}: ${msg}`)
    return `[${this.head.branch ?? 'detached HEAD'}${headId ? '' : ' (root-commit)'} ${id}] ${msg}\n ${changed} file${changed === 1 ? '' : 's'} changed`
  }

  private decorate(id: string): string {
    const labels: string[] = []
    if (this.headId() === id) labels.push(this.head.branch ? `HEAD -> ${this.head.branch}` : 'HEAD')
    for (const [b, bid] of Object.entries(this.branches)) if (bid === id && b !== this.head.branch) labels.push(b)
    for (const [t, tid] of Object.entries(this.tags)) if (tid === id) labels.push(`tag: ${t}`)
    for (const [b, bid] of Object.entries(this.tracking)) if (bid === id) labels.push(`origin/${b}`)
    return labels.length ? ` (${labels.join(', ')})` : ''
  }

  private log(a: string[]): string {
    const oneline = a.includes('--oneline')
    const nFlag = flagValue(a, '-n') ?? a.find((x) => /^-\d+$/.test(x))?.slice(1)
    const ref = a.find((x) => !x.startsWith('-') && x !== nFlag)
    let ids: Set<string>
    if (a.includes('--all')) {
      ids = new Set()
      for (const r of [...Object.values(this.branches), ...Object.values(this.tracking), ...Object.values(this.tags), this.headId()]) for (const id of this.ancestors(r)) ids.add(id)
    } else {
      const start = this.resolve(ref ?? 'HEAD')
      if (!start) return ref ? `fatal: ambiguous argument '${ref}': unknown revision` : `fatal: your current branch '${this.head.branch}' does not have any commits yet`
      ids = this.ancestors(start)
    }
    let list = [...ids].map((id) => this.commits.get(id)!).sort((x, y) => y.n - x.n)
    if (nFlag) list = list.slice(0, Number(nFlag))
    return list.map((c) => oneline
      ? `${c.id}${this.decorate(c.id)} ${c.msg}`
      : `commit ${c.id}${this.decorate(c.id)}${c.parents.length > 1 ? `\nMerge: ${c.parents.join(' ')}` : ''}\n\n    ${c.msg}\n`).join('\n')
  }

  private branch(a: string[]): string {
    const del = a.find((x) => x === '-d' || x === '-D' || x === '--delete')
    const names = a.filter((x) => !x.startsWith('-'))
    if (del) {
      const name = names[0]
      if (!(name in this.branches)) return `error: branch '${name}' not found.`
      if (name === this.head.branch) return `error: Cannot delete branch '${name}' checked out`
      const id = this.branches[name]
      if (del === '-d' && id && !this.isAncestor(id, this.headId())) return `error: The branch '${name}' is not fully merged.\nIf you are sure you want to delete it, run 'git branch -D ${name}'.`
      delete this.branches[name]
      return `Deleted branch ${name} (was ${id}).`
    }
    if (a.includes('-m') || a.includes('-M') || a.includes('--move')) {
      const [from, to] = names.length > 1 ? names : [this.head.branch!, names[0]]
      if (!to || !(from in this.branches)) return 'fatal: branch name required'
      this.branches[to] = this.branches[from]
      delete this.branches[from]
      if (this.head.branch === from) this.head.branch = to
      return ''
    }
    if (!names.length) {
      const local = Object.keys(this.branches).sort().map((b) => `${b === this.head.branch ? '* ' : '  '}${b}`)
      const rem = a.includes('-a') || a.includes('-r') ? Object.keys(this.tracking).sort().map((b) => `  remotes/origin/${b}`) : []
      return [...(this.head.branch ? [] : [`* (HEAD detached at ${this.head.id})`]), ...local, ...rem].join('\n')
    }
    const [name, start] = names
    if (name in this.branches) return `fatal: a branch named '${name}' already exists`
    const id = this.resolve(start ?? 'HEAD')
    if (!id) return `fatal: not a valid object name: '${start ?? this.head.branch}'`
    this.branches[name] = id
    return ''
  }

  private goto(target: string, create: boolean): string {
    if (create) {
      if (target in this.branches) return `fatal: a branch named '${target}' already exists`
      this.branches[target] = this.headId()
      this.head = { branch: target }
      if (this.headId()) this.reflog.push({ id: this.headId()!, what: `checkout: moving to ${target}` })
      return `Switched to a new branch '${target}'`
    }
    let id: string | null, next: { branch?: string; id?: string }
    if (target in this.branches) { id = this.branches[target]; next = { branch: target } }
    else if (target in this.tracking && !(target in this.branches)) {
      this.branches[target] = this.tracking[target]; this.upstream[target] = target
      id = this.tracking[target]; next = { branch: target }
    } else {
      id = this.resolve(target)
      if (!id) return `error: pathspec '${target}' did not match any file(s) known to git`
      next = { id }
    }
    if (next.branch && next.branch === this.head.branch) return `Already on '${target}'`
    if (id !== this.headId()) {
      if (this.dirty()) return 'error: Your local changes to the following files would be overwritten by checkout:\n\t' + [...this.staged(), ...this.modified()].join('\n\t') + '\nPlease commit your changes or stash them before you switch branches.'
      this.checkoutTree(id ? this.commits.get(id)!.tree : {})
    }
    this.head = next
    if (id) this.reflog.push({ id, what: `checkout: moving to ${target}` })
    return next.branch ? `Switched to branch '${target}'` : `Note: switching to '${target}'.\n\nYou are in 'detached HEAD' state.\nHEAD is now at ${id}`
  }

  private checkout(a: string[]): string {
    if (a[0] === '--') return this.restore(a.slice(1))
    const b = flagValue(a, '-b') ?? flagValue(a, '-B')
    if (b) return this.goto(b, true)
    const target = a.find((x) => !x.startsWith('-'))
    if (!target) return 'fatal: se esperaba una rama o un commit'
    if (!(target in this.branches) && !this.resolve(target) && target in this.wd) return this.restore([target])
    return this.goto(target, false)
  }

  private switch(a: string[]): string {
    const c = flagValue(a, '-c') ?? flagValue(a, '-C') ?? flagValue(a, '--create')
    if (c) return this.goto(c, true)
    const target = a.find((x) => !x.startsWith('-'))
    if (!target) return 'fatal: missing branch or commit argument'
    if (target === '-') return 'error: "switch -" no está disponible en el simulador'
    if (!(target in this.branches) && !(target in this.tracking)) {
      return a.includes('--detach') ? this.goto(target, false) : `fatal: invalid reference: ${target}`
    }
    return this.goto(target, false)
  }

  private merge(a: string[]): string {
    if (a.includes('--abort')) {
      if (!this.merging) return 'fatal: There is no merge to abort (MERGE_HEAD missing).'
      this.merging = null; this.conflicts = []
      this.checkoutTree(this.headTree())
      return ''
    }
    const name = a.find((x) => !x.startsWith('-') && x !== flagValue(a, '-m'))
    if (!name) return 'fatal: No commit specified'
    const other = this.resolve(name), head = this.headId()
    if (!other) return `merge: ${name} - not something we can merge`
    if (this.merging) return 'error: Merging is not possible because you have unmerged files.'
    if (this.dirty()) return 'error: Your local changes would be overwritten by merge. Commit or stash them first.'
    if (!head) { this.moveHead(other, `merge ${name}: Fast-forward`); this.checkoutTree(this.commits.get(other)!.tree); return 'Fast-forward' }
    if (this.isAncestor(other, head)) return 'Already up to date.'
    if (this.isAncestor(head, other) && !a.includes('--no-ff')) {
      this.checkoutTree(this.commits.get(other)!.tree)
      this.moveHead(other, `merge ${name}: Fast-forward`)
      return `Updating ${head}..${other}\nFast-forward`
    }
    const base = this.mergeBase(head, other)
    const { tree, conflicts } = this.merge3(base ? this.commits.get(base)!.tree : {}, this.commits.get(head)!.tree, this.commits.get(other)!.tree)
    if (conflicts.length) {
      const untracked = Object.fromEntries(this.untracked().map((p) => [p, this.wd[p]]))
      this.wd = { ...untracked, ...tree }
      this.index = { ...tree }
      for (const p of conflicts) this.index[p] = this.commits.get(head)!.tree[p] ?? ''
      this.merging = { other, name }
      this.conflicts = conflicts
      return conflicts.map((p) => `CONFLICT (content): Merge conflict in ${p}`).join('\n') + '\nAutomatic merge failed; fix conflicts and then commit the result.'
    }
    const msg = flagValue(a, '-m') ?? `Merge branch '${name}'`
    const id = this.newCommit(msg, tree, [head, other])
    this.checkoutTree(tree)
    this.moveHead(id, `merge ${name}: Merge made by the 'ort' strategy.`)
    return `Merge made by the 'ort' strategy.`
  }

  /** Reaplica `commit` sobre `onto`; devuelve el nuevo árbol o lanza si hay conflicto. */
  private replay(commit: Commit, onto: Tree, reverse = false): Tree {
    const parent = commit.parents[0] ? this.commits.get(commit.parents[0])!.tree : {}
    const { tree, conflicts } = reverse ? this.merge3(commit.tree, onto, parent) : this.merge3(parent, onto, commit.tree)
    if (conflicts.length) throw new Error(`CONFLICT (content): Merge conflict in ${conflicts.join(', ')}\nerror: operación abortada — el simulador no resuelve conflictos aquí; usa "git merge" para practicar conflictos.`)
    return tree
  }

  private rebase(a: string[]): string {
    const name = a.find((x) => !x.startsWith('-'))
    if (!name) return 'fatal: se esperaba la rama base, p. ej. "git rebase main"'
    if (a.includes('-i') || a.includes('--interactive')) return 'error: el rebase interactivo no está disponible en el simulador'
    const onto = this.resolve(name), head = this.headId()
    if (!onto || !head) return `fatal: invalid upstream '${name}'`
    if (this.dirty()) return 'error: cannot rebase: You have unstaged changes.'
    if (this.isAncestor(onto, head)) return `Current branch ${this.head.branch ?? 'HEAD'} is up to date.`
    if (this.isAncestor(head, onto)) {
      this.checkoutTree(this.commits.get(onto)!.tree)
      this.moveHead(onto, `rebase (finish): fast-forward to ${name}`)
      return `Successfully rebased and updated refs/heads/${this.head.branch}.`
    }
    const base = this.ancestors(onto)
    const mine = [...this.ancestors(head)].filter((id) => !base.has(id)).map((id) => this.commits.get(id)!)
      .filter((c) => c.parents.length < 2).sort((x, y) => x.n - y.n)
    let tip = onto
    const created: string[] = []
    try {
      for (const c of mine) {
        const tree = this.replay(c, this.commits.get(tip)!.tree)
        tip = this.newCommit(c.msg, tree, [tip], c.lane)
        created.push(tip)
      }
    } catch (e) {
      for (const id of created) this.commits.delete(id)
      throw e
    }
    this.checkoutTree(this.commits.get(tip)!.tree)
    this.moveHead(tip, `rebase (finish): onto ${onto}`)
    return `Successfully rebased and updated refs/heads/${this.head.branch}.`
  }

  private reset(a: string[]): string {
    const mode = a.find((x) => ['--soft', '--mixed', '--hard'].includes(x)) ?? '--mixed'
    const rest = a.filter((x) => !x.startsWith('--'))
    // `git reset <archivo>` o `git reset HEAD <archivo>`: quitar del staging.
    const files = rest.filter((x) => x in this.index || x in this.headTree()).filter((x) => !this.resolve(x) || x in this.wd)
    if (files.length && mode === '--mixed') {
      const head = this.headTree()
      for (const f of files) { if (f in head) this.index[f] = head[f]; else delete this.index[f] }
      return files.some((f) => this.wd[f] !== this.index[f]) ? `Unstaged changes after reset:\n${files.map((f) => `M\t${f}`).join('\n')}` : ''
    }
    const ref = rest[0] ?? 'HEAD'
    const id = this.resolve(ref)
    if (!id) return `fatal: ambiguous argument '${ref}': unknown revision or path not in the working tree.`
    const tree = this.commits.get(id)!.tree
    if (mode === '--hard') { this.checkoutTree(tree); this.merging = null; this.conflicts = [] }
    else if (mode === '--mixed') this.index = { ...tree }
    this.moveHead(id, `reset: moving to ${ref}`)
    return mode === '--hard' ? `HEAD is now at ${id} ${this.commits.get(id)!.msg}` : ''
  }

  private restore(a: string[]): string {
    const staged = a.includes('--staged') || a.includes('-S')
    const files = a.filter((x) => !x.startsWith('-'))
    if (!files.length) return 'fatal: you must specify path(s) to restore'
    const all = files.includes('.')
    const src = staged ? this.headTree() : this.index
    const dst = staged ? this.index : this.wd
    for (const f of all ? [...new Set([...Object.keys(src), ...Object.keys(staged ? this.index : this.index)])] : files) {
      if (!(f in src) && !(f in dst)) return `error: pathspec '${f}' did not match any file(s) known to git`
      if (f in src) dst[f] = src[f]
      else delete dst[f]
    }
    return ''
  }

  private revert(a: string[]): string {
    const ref = a.find((x) => !x.startsWith('-')) ?? 'HEAD'
    const id = this.resolve(ref), head = this.headId()
    if (!id || !head) return `fatal: bad revision '${ref}'`
    if (this.dirty()) return 'error: your local changes would be overwritten by revert.'
    const c = this.commits.get(id)!
    const tree = this.replay(c, this.commits.get(head)!.tree, true)
    const msg = `Revert "${c.msg}"`
    const nid = this.newCommit(msg, tree, [head])
    this.checkoutTree(tree)
    this.moveHead(nid, `revert: ${msg}`)
    return `[${this.head.branch ?? 'detached HEAD'} ${nid}] ${msg}`
  }

  private cherryPick(a: string[]): string {
    const refs = a.filter((x) => !x.startsWith('-'))
    if (!refs.length) return 'fatal: se esperaba un commit'
    if (this.dirty()) return 'error: your local changes would be overwritten by cherry-pick.'
    const out: string[] = []
    for (const ref of refs) {
      const id = this.resolve(ref), head = this.headId()
      if (!id || !head) return `fatal: bad revision '${ref}'`
      const c = this.commits.get(id)!
      const tree = this.replay(c, this.commits.get(head)!.tree)
      const nid = this.newCommit(c.msg, tree, [head])
      this.checkoutTree(tree)
      this.moveHead(nid, `cherry-pick: ${c.msg}`)
      out.push(`[${this.head.branch ?? 'detached HEAD'} ${nid}] ${c.msg}`)
    }
    return out.join('\n')
  }

  private tag(a: string[]): string {
    if (a.includes('-d')) { const n = a.find((x) => !x.startsWith('-'))!; if (!(n in this.tags)) return `error: tag '${n}' not found.`; delete this.tags[n]; return `Deleted tag '${n}'` }
    const m = flagValue(a, '-m')
    const names = a.filter((x) => !x.startsWith('-') && x !== m)
    if (!names.length) return Object.keys(this.tags).sort().join('\n')
    if (names[0] in this.tags) return `fatal: tag '${names[0]}' already exists`
    const id = this.resolve(names[1] ?? 'HEAD')
    if (!id) return 'fatal: Failed to resolve as a valid ref.'
    this.tags[names[0]] = id
    return ''
  }

  private doStash(a: string[]): string {
    const sub = a[0] ?? 'push'
    if (sub === 'list') return this.stash.map((s, i) => `stash@{${i}}: ${s.msg}`).join('\n')
    if (sub === 'pop' || sub === 'apply') {
      const s = this.stash[0]
      if (!s) return 'No stash entries found.'
      if (this.dirty()) return 'error: Your local changes would be overwritten. Commit or stash them first.'
      const head = this.headTree()
      const r = this.merge3(s.index, head, s.wd)
      if (r.conflicts.length) return `CONFLICT: el stash choca con ${r.conflicts.join(', ')}`
      this.wd = { ...Object.fromEntries(this.untracked().map((p) => [p, this.wd[p]])), ...r.tree }
      if (sub === 'pop') this.stash.shift()
      return this.status()
    }
    if (sub === 'drop') { this.stash.shift(); return 'Dropped stash@{0}' }
    if (sub === 'clear') { this.stash = []; return '' }
    if (!this.dirty()) return 'No local changes to save'
    const tracked = Object.fromEntries(Object.entries(this.wd).filter(([p]) => p in this.index || p in this.headTree()))
    const msg = `WIP on ${this.head.branch ?? 'HEAD'}: ${this.headId() ?? ''} ${this.headId() ? this.commits.get(this.headId()!)!.msg : ''}`
    this.stash.unshift({ index: { ...this.headTree() }, wd: tracked, msg })
    this.checkoutTree(this.headTree())
    return `Saved working directory and index state ${msg}`
  }

  private fileDiff(a: Tree, b: Tree, paths: string[]): string {
    return paths.map((p) => {
      const x = (a[p] ?? '').split('\n'), y = (b[p] ?? '').split('\n')
      let s = 0
      while (s < x.length && s < y.length && x[s] === y[s]) s++
      let e = 0
      while (e < x.length - s && e < y.length - s && x[x.length - 1 - e] === y[y.length - 1 - e]) e++
      const minus = p in a ? x.slice(s, x.length - e).map((l) => `-${l}`) : []
      const plus = p in b ? y.slice(s, y.length - e).map((l) => `+${l}`) : []
      return [`diff --git a/${p} b/${p}`, `--- ${p in a ? `a/${p}` : '/dev/null'}`, `+++ ${p in b ? `b/${p}` : '/dev/null'}`, ...minus, ...plus].join('\n')
    }).join('\n')
  }

  private diff(a: string[]): string {
    const refs = a.filter((x) => !x.startsWith('-'))
    if (a.includes('--staged') || a.includes('--cached')) return this.fileDiff(this.headTree(), this.index, this.staged())
    if (refs.length === 2) { const x = this.treeOf(refs[0]), y = this.treeOf(refs[1]); return this.fileDiff(x, y, this.diffPaths(x, y)) }
    return this.fileDiff(this.index, this.wd, this.modified())
  }

  private show(a: string[]): string {
    const id = this.resolve(a.find((x) => !x.startsWith('-')) ?? 'HEAD')
    if (!id) return 'fatal: bad object'
    const c = this.commits.get(id)!
    const parent = c.parents[0] ? this.commits.get(c.parents[0])!.tree : {}
    return `commit ${c.id}${this.decorate(c.id)}\n\n    ${c.msg}\n\n${this.fileDiff(parent, c.tree, this.diffPaths(parent, c.tree))}`
  }

  private clone(a: string[]): string {
    const url = a.find((x) => !x.startsWith('-'))
    if (!url) return 'fatal: You must specify a repository to clone.'
    if (this.inited) return 'fatal: destination path already exists and is not an empty directory.'
    if (!this.remote) return `fatal: repository '${url}' not found`
    this.inited = true
    this.tracking = { ...this.remote }
    const b = 'main' in this.remote ? 'main' : Object.keys(this.remote)[0]
    this.branches = { [b]: this.remote[b] }
    this.upstream[b] = b
    this.head = { branch: b }
    this.checkoutTree(this.commits.get(this.remote[b])!.tree)
    this.reflog.push({ id: this.remote[b], what: `clone: from ${url}` })
    return `Cloning into 'proyecto'...\nremote: Enumerating objects, done.\nReceiving objects: 100%, done.`
  }

  private remoteCmd(a: string[]): string {
    if (a[0] === 'add') {
      if (this.remote) return 'error: remote origin already exists.'
      if (a[1] !== 'origin') return 'error: el simulador solo admite un remoto llamado "origin"'
      if (!a[2]) return 'usage: git remote add <name> <url>'
      this.remote = {}
      return ''
    }
    if (!this.remote) return ''
    return a.includes('-v') ? 'origin\thttps://github.com/encode/proyecto.git (fetch)\norigin\thttps://github.com/encode/proyecto.git (push)' : 'origin'
  }

  private push(a: string[]): string {
    if (!this.remote) return "fatal: 'origin' does not appear to be a git repository"
    const force = a.includes('--force') || a.includes('-f') || a.includes('--force-with-lease')
    const names = a.filter((x) => !x.startsWith('-') && x !== 'origin')
    const b = names[0] ?? this.head.branch
    if (!b || !(b in this.branches)) return `error: src refspec ${b} does not match any`
    const local = this.branches[b]
    if (!local) return `error: src refspec ${b} does not match any`
    const setUp = a.includes('-u') || a.includes('--set-upstream')
    if (!names.length && !this.upstream[b] && !setUp) return `fatal: The current branch ${b} has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin ${b}`
    const rem = this.remote[b]
    if (rem === local) { if (setUp) this.upstream[b] = b; this.tracking[b] = local; return 'Everything up-to-date' }
    if (rem && !this.isAncestor(rem, local) && !force) {
      return `To https://github.com/encode/proyecto.git\n ! [rejected]        ${b} -> ${b} (${this.tracking[b] === rem ? 'non-fast-forward' : 'fetch first'})\nerror: failed to push some refs\nhint: Updates were rejected because the remote contains work that you do not have locally.\nhint: Integrate the remote changes (e.g. 'git pull') before pushing again.`
    }
    this.remote[b] = local
    this.tracking[b] = local
    if (setUp || !this.upstream[b]) this.upstream[b] = b
    return `To https://github.com/encode/proyecto.git\n${rem ? ` ${force && !this.isAncestor(rem, local) ? '+' : ' '} ${rem}..${local}  ${b} -> ${b}` : ` * [new branch]      ${b} -> ${b}`}${setUp ? `\nbranch '${b}' set up to track 'origin/${b}'.` : ''}`
  }

  private fetch(): string {
    if (!this.remote) return "fatal: 'origin' does not appear to be a git repository"
    const lines: string[] = []
    for (const [b, id] of Object.entries(this.remote)) {
      if (this.tracking[b] !== id) lines.push(this.tracking[b] ? `   ${this.tracking[b]}..${id}  ${b} -> origin/${b}` : ` * [new branch]      ${b} -> origin/${b}`)
      this.tracking[b] = id
    }
    return lines.length ? `From https://github.com/encode/proyecto\n${lines.join('\n')}` : ''
  }

  private pull(a: string[]): string {
    const f = this.fetch()
    if (f.startsWith('fatal')) return f
    const b = a.filter((x) => !x.startsWith('-') && x !== 'origin')[0] ?? this.upstream[this.head.branch ?? ''] ?? this.head.branch
    if (!b || !(b in this.tracking)) return `There is no tracking information for the current branch.\nPlease specify which branch you want to merge with:\n\n    git pull origin <branch>`
    const res = a.includes('--rebase') || a.includes('-r') ? this.rebase([`origin/${b}`]) : this.merge([`origin/${b}`])
    return [f, res].filter(Boolean).join('\n')
  }
}

function flagValue(a: string[], flag: string): string | undefined {
  const i = a.indexOf(flag)
  return i >= 0 && i + 1 < a.length ? a[i + 1] : undefined
}

export const HELP = `Comandos disponibles en el simulador:

  Archivos   touch <f> · echo "texto" > <f> · echo "texto" >> <f> · cat <f> · ls · rm <f>
  Básico     git init · status · add <f>|. · commit -m "msg" [--amend] · log [--oneline] [--all] · diff [--staged] · show
  Deshacer   git restore [--staged] <f> · reset [--soft|--mixed|--hard] <ref> · revert <ref> · reflog
  Ramas      git branch [nombre] [-d] · switch [-c] <rama> · checkout [-b] <rama> · merge <rama> · rebase <rama>
  Extra      git cherry-pick <ref> · tag <nombre> · stash [pop|list]
  Remotos    git clone <url> · remote -v · fetch · pull [--rebase] · push [-u origin <rama>]

  Referencias: HEAD, HEAD~1, HEAD^, nombres de rama, tags, origin/<rama>, prefijos de commit, HEAD@{n}`

/** Crea un simulador y ejecuta los comandos de preparación de un escenario. */
export function scenario(setup: string[]): GitSim {
  const g = new GitSim()
  for (const line of setup) {
    const out = g.run(line)
    if (/^(fatal|error|usage)|command not found|comando de escenario/.test(out)) throw new Error(`Escenario inválido en "${line}": ${out}`)
  }
  return g
}
