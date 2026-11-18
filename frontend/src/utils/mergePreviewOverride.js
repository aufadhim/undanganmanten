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

/** Content drafts may contain an older theme snapshot. Typography has its own live/save lifecycle. */
export function composeInvitationPreview(saved, contentDraft, liveTypography) {
  const preview = mergePreviewOverride(saved, contentDraft);
  return {
    ...preview,
    themeSettings: {
      ...preview.themeSettings,
      typography: liveTypography ?? saved.themeSettings?.typography,
    },
  };
}
