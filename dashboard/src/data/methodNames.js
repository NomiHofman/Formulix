/**
 * מיפוי שמות שיטות - בשימוש בכל הדשבורד
 * משמות טכניים לשמות ידידותיים להצגה
 */

export const METHOD_LABELS = {
  SQLDynamic: 'SQL Dynamic',
  Roslyn: 'Roslyn',
  PythonSymPy: 'Python',
  AITranslated: 'AI',
};

export function friendlyName(method) {
  return METHOD_LABELS[method] ?? method;
}
