export function mergePreviewOverride(base, override) {
  if (override == null) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) return override;

  return Object.entries(override).reduce((result, [key, value]) => {
    result[key] = isPlainObject(value) && isPlainObject(base[key])
      ? mergePreviewOverride(base[key], value)
      : value;
    return result;
  }, { ...base });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
