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

  return encodeURI(normalizedPath);
}
