import { createI18n } from 'vue-i18n';

const messages = Object.fromEntries(
  Object.entries(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import.meta.glob<{ default: any }>('./locales/*.json', { eager: true })
  ).map(([key, value]) => [key.slice(10, -5), value.default])
);

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('lang') || 'en',
  fallbackLocale: 'en',
  messages,
});

// Guard all global `t()` calls so non-leaf keys (objects) won't crash rendering.
type SafeComposer = {
  t: (...args: unknown[]) => string;
  tm: (key: string) => unknown;
  rt: (...args: unknown[]) => string;
};
const composer = i18n.global as unknown as SafeComposer;
const rawT = composer.t.bind(composer);

composer.t = ((key: unknown, ...args: unknown[]) => {
  if (typeof key !== 'string' && typeof key !== 'number') return '';
  try {
    return rawT(key, ...args);
  } catch (error) {
    // Fallback path: resolve from locale message tree, then render resolved message.
    try {
      const resolved = composer.tm(String(key));
      if (typeof resolved === 'string') return resolved;
      // `rt` renders resolved message values (including compiled AST nodes).
      const rendered = composer.rt(resolved as never);
      if (typeof rendered === 'string' && rendered) return rendered;
    } catch {
      // Ignore and use final key fallback below.
    }

    if (import.meta.env.DEV) {
      console.warn(`[i18n] Failed to translate key: ${String(key)}`, error);
    }
    return String(key);
  }
}) as SafeComposer['t'];

export default i18n;
