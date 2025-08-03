export type Row = { [k: string]: any };

export type Variant<R extends { [k: string]: object }> = {
  [K in keyof R]: { type: K } & R[K];
}[keyof R];

export function match<R extends { [k: string]: object }, B>(
  v: Variant<R>,
  f: {
    [K in keyof R]: (x: R[K]) => B;
  },
): B {
  const fx = f[v.type];
  return fx(v);
}

export function deepcopy<A>(x: A): A {
  return JSON.parse(JSON.stringify(x));
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function do_<A>(k: () => A): A {
  return k();
}

export function and(xs: boolean[]): boolean {
  return xs.reduce((a, b) => a && b, true);
}

export function or(xs: boolean[]): boolean {
  return xs.reduce((a, b) => a || b, false);
}
