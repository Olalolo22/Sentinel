/**
 * Deterministic JSON serialisation — produces the same byte sequence
 * regardless of property insertion order.
 *
 * Bundled inline so @sentinel/sdk has zero runtime dependencies.
 * Algorithm is identical to the `fast-json-stable-stringify` package used
 * by the API's signing module so that local verification produces the exact
 * same payload hash.
 */
export default function stableStringify(obj: unknown): string {
  return serialize(obj);
}

function serialize(node: unknown): string {
  if (node === null || typeof node !== "object") {
    return JSON.stringify(node);
  }

  if (Array.isArray(node)) {
    return "[" + node.map(serialize).join(",") + "]";
  }

  const keys = Object.keys(node as object).sort();
  const pairs = keys.map(
    (k) => JSON.stringify(k) + ":" + serialize((node as Record<string, unknown>)[k])
  );
  return "{" + pairs.join(",") + "}";
}
