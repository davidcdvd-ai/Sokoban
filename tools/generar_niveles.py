"""Genera niveles de Sokoban resolubles y ordenados por dificultad.

Cada nivel se crea "al revés": se colocan las cajas sobre las metas y el
jugador las va *tirando* al azar. Después un solucionador BFS calcula la
solución óptima (mínimo de movimientos), que se usa para las estrellas.

Uso: python3 tools/generar_niveles.py > levels.js
"""
import json
import random
import sys
from collections import deque

DIRS = {"u": (-1, 0), "d": (1, 0), "l": (0, -1), "r": (0, 1)}


def solve(walls, boxes, goals, player, h, w, limit=150000):
    """BFS sobre (jugador, cajas). Devuelve (movimientos, empujes, camino) o None."""
    goals = frozenset(goals)
    dead = dead_squares(walls, goals, h, w)
    start = (player, frozenset(boxes))
    prev = {start: None}
    q = deque([start])
    while q:
        state = q.popleft()
        p, bx = state
        if bx == goals:
            path = []
            while prev[state] is not None:
                state, m = prev[state]
                path.append(m)
            path.reverse()
            s = "".join(path)
            return len(s), sum(c.isupper() for c in s), s
        for k, (dr, dc) in DIRS.items():
            np_ = (p[0] + dr, p[1] + dc)
            if np_ in walls:
                continue
            if np_ in bx:
                nb = (np_[0] + dr, np_[1] + dc)
                if nb in walls or nb in bx or nb in dead:
                    continue
                nbx = (bx - {np_}) | {nb}
                ns = (np_, frozenset(nbx))
                mv = k.upper()
            else:
                ns = (np_, bx)
                mv = k
            if ns not in prev:
                prev[ns] = (state, mv)
                if len(prev) > limit:
                    return None
                q.append(ns)
    return None


def dead_squares(walls, goals, h, w):
    """Casillas en esquina que no son meta: una caja ahí queda atascada."""
    dead = set()
    for r in range(h):
        for c in range(w):
            if (r, c) in walls or (r, c) in goals:
                continue
            up = (r - 1, c) in walls
            dn = (r + 1, c) in walls
            lf = (r, c - 1) in walls
            rt = (r, c + 1) in walls
            if (up or dn) and (lf or rt):
                dead.add((r, c))
    return dead


def reachable(walls, start, blocked=frozenset()):
    seen = {start}
    q = deque([start])
    while q:
        r, c = q.popleft()
        for dr, dc in DIRS.values():
            n = (r + dr, c + dc)
            if n not in walls and n not in blocked and n not in seen:
                seen.add(n)
                q.append(n)
    return seen


def make_room(h, w, wall_bits, rng):
    walls = set()
    for r in range(h):
        for c in range(w):
            if r in (0, h - 1) or c in (0, w - 1):
                walls.add((r, c))
    inner = [(r, c) for r in range(1, h - 1) for c in range(1, w - 1)]
    for _ in range(wall_bits):
        r, c = rng.choice(inner)
        shape = rng.choice([[(0, 0)], [(0, 0), (0, 1)], [(0, 0), (1, 0)], [(0, 0), (0, 1), (1, 0)]])
        for dr, dc in shape:
            walls.add((r + dr, c + dc))
    floor = [p for p in inner if p not in walls]
    if not floor:
        return None
    region = reachable(walls, floor[0])
    if len(region) != len(floor) or len(floor) < 8:
        return None
    return walls, floor


def reverse_scramble(walls, floor, goals, rng, steps):
    boxes = set(goals)
    free = [p for p in floor if p not in boxes]
    player = rng.choice(free)
    for _ in range(steps):
        k = rng.choice("udlr")
        dr, dc = DIRS[k]
        n = (player[0] + dr, player[1] + dc)
        if n in walls or n in boxes:
            continue
        behind = (player[0] - dr, player[1] - dc)
        if behind in boxes and rng.random() < 0.7:
            boxes.remove(behind)
            boxes.add(player)
        player = n
    return boxes, player


def to_text(walls, boxes, goals, player, h, w):
    region = reachable(walls, player)
    rows = []
    for r in range(h):
        row = ""
        for c in range(w):
            p = (r, c)
            if p in walls:
                # Solo dibujamos muros que tocan suelo: el resto es vacío.
                near = any((r + dr, c + dc) in region for dr in (-1, 0, 1) for dc in (-1, 0, 1))
                row += "#" if near else " "
            elif p == player:
                row += "+" if p in goals else "@"
            elif p in boxes:
                row += "*" if p in goals else "$"
            elif p in goals:
                row += "."
            else:
                row += " " if p in region else " "
        rows.append(row.rstrip())
    return rows


def generate(rng, h, w, nboxes, wall_bits, min_pushes, max_pushes, tries=300):
    best = None
    for _ in range(tries):
        room = make_room(h, w, wall_bits, rng)
        if not room:
            continue
        walls, floor = room
        if len(floor) < nboxes * 3 + 4:
            continue
        goals = rng.sample(floor, nboxes)
        boxes, player = reverse_scramble(walls, floor, goals, rng, rng.randint(80, 400))
        if boxes & set(goals):
            continue  # queremos que todas las cajas empiecen fuera de su meta
        res = solve(walls, boxes, goals, player, h, w)
        if not res:
            continue
        moves, pushes, sol = res
        if min_pushes <= pushes <= max_pushes:
            score = pushes * 3 + moves
            if best is None or score > best[0]:
                best = (score, walls, boxes, goals, player, moves, pushes, sol)
                if pushes >= (min_pushes + max_pushes) // 2:
                    break
    if not best:
        return None
    _, walls, boxes, goals, player, moves, pushes, sol = best
    return {
        "map": to_text(walls, boxes, goals, player, h, w),
        "best": moves,
        "pushes": pushes,
        "sol": sol,
    }


# (mundo, nº niveles, alto, ancho, cajas, trozos de muro, empujes mín, máx)
PLAN = [
    ("granja", 8, [(5, 6, 1, 1, 2, 4), (6, 6, 1, 2, 3, 6), (6, 7, 2, 2, 4, 8)]),
    ("selva", 8, [(7, 7, 2, 3, 6, 10), (7, 8, 2, 4, 8, 14), (8, 8, 3, 4, 8, 14)]),
    ("hielo", 8, [(8, 8, 3, 5, 10, 18), (8, 9, 3, 6, 12, 20), (9, 9, 3, 7, 14, 24)]),
    ("dulces", 8, [(9, 9, 4, 6, 14, 24), (9, 10, 4, 8, 16, 28), (10, 10, 4, 9, 18, 30)]),
    ("espacio", 8, [(10, 10, 4, 10, 20, 34), (10, 11, 5, 10, 20, 36), (11, 11, 5, 12, 24, 40)]),
]


def build_level(job):
    name, i, tier = job
    rng = random.Random(f"{name}-{i}-2026")
    h, w, nb, wb, mn, mx = tier
    lvl = None
    while lvl is None:
        lvl = generate(rng, h, w, nb, wb, mn, mx)
        mn = max(1, mn - 1)  # si cuesta encontrarlo, aceptamos uno un poco más corto
    print(f"{name} {i + 1}: {lvl['pushes']} empujes, {lvl['best']} pasos", file=sys.stderr, flush=True)
    return name, lvl


def main():
    from multiprocessing import Pool
    jobs = []
    for name, count, tiers in PLAN:
        for i in range(count):
            jobs.append((name, i, tiers[min(len(tiers) - 1, i * len(tiers) // count)]))
    with Pool() as pool:
        results = pool.map(build_level, jobs, chunksize=1)
    worlds = []
    for name, _, _ in PLAN:
        levels = sorted((l for n, l in results if n == name), key=lambda l: (l["pushes"], l["best"]))
        worlds.append({"id": name, "levels": levels})
    print("// Generado por tools/generar_niveles.py — no editar a mano.")
    print("window.WORLDS_DATA = " + json.dumps(worlds, ensure_ascii=False, indent=1) + ";")


if __name__ == "__main__":
    main()
