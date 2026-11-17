// Logros. Cada uno se evalúa sobre el estado tras terminar una sesión.
import type { Catalog, State } from './store'
import { levelFor } from './xp'

export interface AchievementDef {
  id: string
  title: string
  desc: string
  /** Nombre de icono (ver ui/Icon). */
  icon: string
  gems: number
  group: 'Constancia' | 'Progreso' | 'Dominio' | 'Exploración' | 'Entrenamiento'
  test: (s: State, c: Catalog) => boolean
}

const TRACK_NAMES: Record<string, string> = {
  fund: 'Fundamentos', python: 'Python', java: 'Java', go: 'Go', rust: 'Rust', git: 'Git',
  redes: 'Redes', sistemas: 'Diseño de sistemas', ingles: 'Inglés',
}

const doneIn = (s: State, ids: string[] = []) => ids.filter((id) => (s.lessons[id]?.done ?? 0) > 0).length
const tracksTouched = (s: State, c: Catalog, only?: string[]) =>
  Object.entries(c.tracks).filter(([id, ids]) => (!only || only.includes(id)) && doneIn(s, ids) > 0).length

const streak = (n: number, title: string, gems: number): AchievementDef => ({
  id: `streak-${n}`, title, desc: `Mantén una racha de ${n} días`, icon: 'flame', gems, group: 'Constancia',
  test: (s) => s.streak.best >= n,
})
const count = (
  id: string, title: string, desc: string, icon: string, gems: number, group: AchievementDef['group'],
  test: (s: State, c: Catalog) => boolean,
): AchievementDef => ({ id, title, desc, icon, gems, group, test })

export const ACHIEVEMENTS: AchievementDef[] = [
  streak(3, 'Calentando motores', 5),
  streak(7, 'Semana completa', 10),
  streak(14, 'Dos semanas', 15),
  streak(30, 'Hábito de acero', 30),
  streak(60, 'Imparable', 40),
  streak(100, 'Centurión', 60),
  streak(365, 'Un año de commits', 150),
  count('goal-1', 'Meta cumplida', 'Alcanza tu meta diaria', 'target', 5, 'Constancia', (s) => s.totals.goals >= 1),
  count('goal-7', 'Siete de siete', 'Alcanza tu meta diaria 7 veces', 'target', 15, 'Constancia', (s) => s.totals.goals >= 7),
  count('goal-30', 'Disciplina', 'Alcanza tu meta diaria 30 veces', 'target', 40, 'Constancia', (s) => s.totals.goals >= 30),
  count('early', 'Madrugador', 'Termina una sesión antes de las 8:00', 'sunrise', 5, 'Constancia', (s) => s.totals.early >= 1),
  count('night', 'Búho nocturno', 'Termina una sesión de madrugada', 'moon', 5, 'Constancia', (s) => s.totals.night >= 1),

  count('lesson-1', 'Primer commit', 'Completa tu primera lección', 'rocket', 5, 'Progreso', (s) => s.totals.lessons >= 1),
  count('lesson-10', 'Tomando ritmo', 'Completa 10 lecciones', 'book', 10, 'Progreso', (s) => s.totals.lessons >= 10),
  count('lesson-50', 'Medio centenar', 'Completa 50 lecciones', 'book', 30, 'Progreso', (s) => s.totals.lessons >= 50),
  count('lesson-150', 'Devorador de roadmaps', 'Completa 150 lecciones', 'book', 80, 'Progreso', (s) => s.totals.lessons >= 150),
  count('xp-100', 'Hello, World', 'Gana 100 XP', 'zap', 5, 'Progreso', (s) => s.xp >= 100),
  count('xp-1000', 'Kilobyte', 'Gana 1 000 XP', 'zap', 15, 'Progreso', (s) => s.xp >= 1000),
  count('xp-5000', 'Cinco mil', 'Gana 5 000 XP', 'zap', 40, 'Progreso', (s) => s.xp >= 5000),
  count('xp-20000', 'Megabyte', 'Gana 20 000 XP', 'zap', 100, 'Progreso', (s) => s.xp >= 20000),
  count('level-10', 'Developer', 'Alcanza el nivel 10', 'award', 20, 'Progreso', (s) => levelFor(s.xp).level >= 10),
  count('level-20', 'Staff', 'Alcanza el nivel 20', 'award', 50, 'Progreso', (s) => levelFor(s.xp).level >= 20),

  count('perfect-1', 'Sin errores', 'Completa una lección perfecta', 'star', 5, 'Dominio', (s) => s.totals.perfect >= 1),
  count('perfect-10', 'Precisión quirúrgica', 'Completa 10 lecciones perfectas', 'star', 20, 'Dominio', (s) => s.totals.perfect >= 10),
  count('perfect-40', 'Compilador humano', 'Completa 40 lecciones perfectas', 'star', 60, 'Dominio', (s) => s.totals.perfect >= 40),
  count('boss-1', 'Matajefes', 'Derrota a tu primer jefe de unidad', 'swords', 10, 'Dominio', (s) => s.totals.bosses >= 1),
  count('boss-5', 'Cazador de jefes', 'Derrota a 5 jefes', 'swords', 25, 'Dominio', (s) => s.totals.bosses >= 5),
  count('boss-15', 'Leyenda del roadmap', 'Derrota a 15 jefes', 'swords', 60, 'Dominio', (s) => s.totals.bosses >= 15),
  count('combo-10', 'En racha', 'Consigue un combo de 10', 'flame', 10, 'Dominio', (s) => s.totals.maxCombo >= 10),
  count('combo-20', 'Imparable ×20', 'Consigue un combo de 20', 'flame', 25, 'Dominio', (s) => s.totals.maxCombo >= 20),
  ...Object.entries(TRACK_NAMES).map(([id, name]) =>
    count(`track-${id}`, `Ruta completa: ${name}`, `Completa todas las lecciones de ${name}`, 'trophy', 60, 'Dominio',
      (s, c) => (c.tracks[id]?.length ?? 0) > 0 && doneIn(s, c.tracks[id]) === c.tracks[id].length)),

  count('polyglot', 'Políglota', 'Completa una lección en Python, Java, Go y Rust', 'languages', 25, 'Exploración',
    (s, c) => c.codeTracks.length > 0 && tracksTouched(s, c, c.codeTracks) === c.codeTracks.length),
  count('explorer', 'Mente full-stack', 'Completa una lección en cada ruta', 'compass', 40, 'Exploración',
    (s, c) => Object.keys(c.tracks).length > 0 && tracksTouched(s, c) === Object.keys(c.tracks).length),
  count('git-5', 'Domador de ramas', 'Resuelve 5 retos en el simulador de git', 'git', 15, 'Exploración', (s) => s.totals.git >= 5),
  count('git-15', 'Git sensei', 'Resuelve 15 retos en el simulador de git', 'git', 40, 'Exploración', (s) => s.totals.git >= 15),

  count('review-25', 'Memoria fresca', 'Repasa 25 ejercicios', 'brain', 10, 'Entrenamiento', (s) => s.totals.reviews >= 25),
  count('review-250', 'Memoria de elefante', 'Repasa 250 ejercicios', 'brain', 40, 'Entrenamiento', (s) => s.totals.reviews >= 250),
  count('review-1000', 'Nada se olvida', 'Repasa 1 000 ejercicios', 'brain', 100, 'Entrenamiento', (s) => s.totals.reviews >= 1000),
  count('daily-1', 'Reto aceptado', 'Completa un reto diario', 'calendar', 5, 'Entrenamiento', (s) => s.totals.dailies >= 1),
  count('daily-7', 'Retador', 'Completa 7 retos diarios', 'calendar', 20, 'Entrenamiento', (s) => s.totals.dailies >= 7),
  count('daily-30', 'Un mes de retos', 'Completa 30 retos diarios', 'calendar', 60, 'Entrenamiento', (s) => s.totals.dailies >= 30),
  count('gym-10', 'Rata de gimnasio', 'Completa 10 rondas de gimnasio', 'dumbbell', 10, 'Entrenamiento', (s) => s.totals.drills >= 10),
  count('gym-perfect', 'Ronda limpia', 'Completa una ronda de gimnasio sin fallos', 'dumbbell', 10, 'Entrenamiento', (s) => s.totals.perfectDrills >= 1),
  count('kata-1', 'Cinturón blanco', 'Resuelve tu primera kata', 'code', 10, 'Entrenamiento', (s) => s.totals.katas >= 1),
  count('kata-10', 'Cinturón negro', 'Resuelve 10 katas', 'code', 40, 'Entrenamiento', (s) => s.totals.katas >= 10),
  count('wpm-40', 'Dedos ágiles', 'Alcanza 40 PPM escribiendo código', 'keyboard', 10, 'Entrenamiento', (s) => s.totals.wpm >= 40),
  count('wpm-60', 'Teclado en llamas', 'Alcanza 60 PPM escribiendo código', 'keyboard', 30, 'Entrenamiento', (s) => s.totals.wpm >= 60),
]
