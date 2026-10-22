/** Optimal string alignment distance: insertions, deletions, substitutions, adjacent swaps. */
export function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  const at = (i: number, j: number): number => d[i]?.[j] ?? 0;
  for (let i = 0; i < rows; i++) (d[i] as number[])[0] = i;
  for (let j = 0; j < cols; j++) (d[0] as number[])[j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, at(i - 2, j - 2) + 1);
      }
      (d[i] as number[])[j] = v;
    }
  }
  return at(a.length, b.length);
}

/** Removes separators so "react_dom", "react.dom" and "reactdom" compare equal to "react-dom". */
function squash(name: string): string {
  return name.replace(/[-_.]/g, "");
}

function bareName(name: string): string {
  const slash = name.indexOf("/");
  return name.startsWith("@") && slash > 0 ? name.slice(slash + 1) : name;
}

/**
 * Returns the popular package that `name` most likely imitates, or undefined.
 * A popular name never imitates itself.
 */
export function findLookalike(name: string, popular: readonly string[]): string | undefined {
  const candidate = name.toLowerCase();
  if (popular.includes(candidate)) return undefined;

  let best: { target: string; distance: number } | undefined;
  for (const target of popular) {
    let distance: number;
    if (squash(candidate) === squash(target)) {
      distance = 0;
    } else if (
      candidate.startsWith("@") &&
      !target.startsWith("@") &&
      bareName(candidate) === target
    ) {
      // "@someone/express" posing as "express"
      distance = 0;
    } else {
      // Short names collide by chance too easily.
      if (target.length < 5) continue;
      distance = editDistance(candidate, target);
      if (distance > 1) continue;
    }
    if (!best || distance < best.distance) best = { target, distance };
  }
  return best?.target;
}
