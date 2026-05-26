export function normalizeAdvertImagePath(value: string) {
  const normalizedPath = value.trim().replaceAll("\\", "/");

  if (normalizedPath.length === 0) {
    return null;
  }

  if (normalizedPath.startsWith("/")) {
    return normalizedPath;
  }

  return `/${normalizedPath}`;
}

export function getAdvertImageSrc(value: string | null) {
  if (!value) {
    return null;
  }

  const normalizedPath = normalizeAdvertImagePath(value);

  if (!normalizedPath) {
    return null;
  }

  // Dekódujeme případné vícenásobné kódování (%2520 -> %20 -> mezera)
  let decoded = normalizedPath;
  try {
    while (decoded.includes("%")) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
  } catch {
    decoded = normalizedPath;
  }

  return encodeURI(decoded);
}

export function getAdvertImageSources(value: string | null): string[] {
  if (!value) {
    return [];
  }

  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    try {
      const paths = JSON.parse(trimmed) as string[];
      return paths.map((p) => getAdvertImageSrc(p)).filter((src): src is string => src !== null);
    } catch {
      return [];
    }
  }

  const src = getAdvertImageSrc(value);
  return src ? [src] : [];
}
