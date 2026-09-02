import { ApiError } from "@/shared/api/http-client";

const numericKeyPattern = /^(0|[1-9]\d*)$/;

function compareNumericKeys(left: string, right: string): number {
  if (left.length !== right.length) return left.length - right.length;
  return left.localeCompare(right);
}

/**
 * Accepts normal JSON arrays and the temporarily supported keyed-list shape.
 * Contract failures deliberately name only the field, never the response data.
 */
export function parseApiList<T>(value: unknown, field: string): T[] {
  if (Array.isArray(value)) return value as T[];

  if (typeof value !== "object" || value === null) {
    throw new ApiError(`El servidor devolvió una lista inválida para ${field}.`, 502);
  }

  const entries = Object.entries(value);
  if (entries.length === 0 || !entries.every(([key]) => numericKeyPattern.test(key))) {
    throw new ApiError(`El servidor devolvió una lista inválida para ${field}.`, 502);
  }

  return entries
    .sort(([left], [right]) => compareNumericKeys(left, right))
    .map(([, item]) => item as T);
}
