export type LinearTransform = {
  a: number;
  b: number;
  c: number;
  d: number;
};

export type CssCornerRadii = {
  topLeft: string;
  topRight: string;
  bottomRight: string;
  bottomLeft: string;
};

const IDENTITY: LinearTransform = { a: 1, b: 0, c: 0, d: 1 };

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function cleanZero(value: number) {
  return Math.abs(value) < 1e-12 ? 0 : value;
}

function parseMatrixValues(value: string) {
  const start = value.indexOf("(");
  const end = value.lastIndexOf(")");
  if (start < 0 || end <= start) return [];
  return value
    .slice(start + 1, end)
    .split(",")
    .map((part) => Number(part.trim()));
}

export function parseCssTransform(value: string): LinearTransform {
  if (!value || value === "none") return { ...IDENTITY };

  const values = parseMatrixValues(value);
  if (value.startsWith("matrix3d(") && values.length === 16) {
    return {
      a: finiteOr(values[0], 1),
      b: finiteOr(values[1], 0),
      c: finiteOr(values[4], 0),
      d: finiteOr(values[5], 1),
    };
  }

  if (value.startsWith("matrix(") && values.length === 6) {
    return {
      a: finiteOr(values[0], 1),
      b: finiteOr(values[1], 0),
      c: finiteOr(values[2], 0),
      d: finiteOr(values[3], 1),
    };
  }

  return { ...IDENTITY };
}

export function invertLinearTransform(
  transform: LinearTransform,
): [number, number, number, number] {
  const determinant = transform.a * transform.d - transform.b * transform.c;
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-8) {
    return [1, 0, 0, 1];
  }

  return [
    cleanZero(transform.d / determinant),
    cleanZero(-transform.b / determinant),
    cleanZero(-transform.c / determinant),
    cleanZero(transform.a / determinant),
  ];
}

export function transformScreenOffsetToLocal(
  inverse: [number, number, number, number],
  x: number,
  y: number,
) {
  return {
    x: inverse[0] * x + inverse[2] * y,
    y: inverse[1] * x + inverse[3] * y,
  };
}

function parseCssRadiusToken(token: string, axisLength: number) {
  const trimmed = token.trim();
  if (trimmed.endsWith("%")) {
    return Math.max(0, (Number(trimmed.slice(0, -1)) / 100) * axisLength);
  }
  return Math.max(0, Number(trimmed.replace("px", "")) || 0);
}

function resolveCorner(value: string, width: number, height: number) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const horizontal = parts[0] ?? "0";
  const vertical = parts[1] ?? horizontal;
  return {
    x: parseCssRadiusToken(horizontal, width),
    y: parseCssRadiusToken(vertical, height),
  };
}

function ratioFor(limit: number, sum: number) {
  return sum > 0 ? limit / sum : 1;
}

function rounded(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function positiveNumber(value: string, fallback: number) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function resolveSpecularTuning(thickness: string, strength: string) {
  return {
    thickness: positiveNumber(thickness, 1),
    strength: positiveNumber(strength, 1),
  };
}

export function resolveBorderRadii(
  corners: CssCornerRadii,
  width: number,
  height: number,
) {
  const topLeft = resolveCorner(corners.topLeft, width, height);
  const topRight = resolveCorner(corners.topRight, width, height);
  const bottomRight = resolveCorner(corners.bottomRight, width, height);
  const bottomLeft = resolveCorner(corners.bottomLeft, width, height);

  const scale = Math.min(
    1,
    ratioFor(width, topLeft.x + topRight.x),
    ratioFor(width, bottomLeft.x + bottomRight.x),
    ratioFor(height, topLeft.y + bottomLeft.y),
    ratioFor(height, topRight.y + bottomRight.y),
  );

  return {
    x: [topLeft.x, topRight.x, bottomRight.x, bottomLeft.x].map((value) =>
      rounded(value * scale),
    ),
    y: [topLeft.y, topRight.y, bottomRight.y, bottomLeft.y].map((value) =>
      rounded(value * scale),
    ),
  };
}
