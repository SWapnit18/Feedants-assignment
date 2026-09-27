'use strict';

const SUPPORTED_LANGS = /** @type {const} */ (['en', 'hi']);

/**
 * Resolve a localized `{ en, hi }` value to a plain string (falls back to en).
 * @param {{en?: string, hi?: string} | string | null | undefined} value
 * @param {'en'|'hi'} lang
 */
function t(value, lang) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  return value[lang] || value.en || null;
}

module.exports = { t, SUPPORTED_LANGS };
