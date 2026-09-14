import {
  tokenConfigurationError,
  tokenKey,
  prepareTokens,
  type Token,
  type TokenRules,
  type TokenResult,
} from "../tags/model";
export interface TokenSuggestion extends Token {
  description?: string;
  keywords?: readonly string[];
}
export interface EditableToken extends Token {
  editable?: boolean;
}
export type TokenEditRules = Pick<
  TokenRules,
  "maxTokens" | "maxTokenLength" | "caseSensitive" | "validateToken"
>;
export function suggestionConfigurationError(
  options: readonly TokenSuggestion[],
  rules: TokenEditRules = {},
): string | null {
  if (options.length > 500) return "Use at most 500 suggestions.";
  const limit = rules.maxTokenLength ?? 80,
    ids = new Set<string>(),
    labels = new Set<string>();
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000)
    return "Use maxTokenLength 1–1000.";
  for (const option of options) {
    const label = tokenKey(option.label, rules.caseSensitive);
    if (!option.id.trim() || ids.has(option.id) || !label || labels.has(label))
      return "Suggestion IDs and labels must be unique and non-empty.";
    if (
      Array.from(option.label).length > limit ||
      (option.description?.length ?? 0) > 1000
    )
      return "Suggestion text exceeds the supported length.";
    if (
      (option.keywords?.length ?? 0) > 20 ||
      option.keywords?.some((k) => k.length > 100)
    )
      return "Use at most 20 keywords of 100 code units.";
    ids.add(option.id);
    labels.add(label);
  }
  return null;
}
/** 候选来自应用当前数据窗口；只做本地匹配，不发起远程请求。 */
export function filterTokenSuggestions(
  options: readonly TokenSuggestion[],
  query: string,
  value: readonly Token[] = [],
  caseSensitive = false,
) {
  const text = tokenKey(query, caseSensitive),
    ids = new Set(value.map((t) => t.id)),
    labels = new Set(value.map((t) => tokenKey(t.label, caseSensitive)));
  return options.filter(
    (t) =>
      !ids.has(t.id) &&
      !labels.has(tokenKey(t.label, caseSensitive)) &&
      (!text ||
        [t.label, t.description ?? "", ...(t.keywords ?? [])].some((s) =>
          tokenKey(s, caseSensitive).includes(text),
        )),
  );
}
export function addTokenSuggestion(
  value: readonly Token[],
  suggestion: TokenSuggestion,
  rules: TokenRules = {},
): TokenResult {
  if (suggestion.disabled)
    return {
      ok: false,
      code: "validation",
      message: "This suggestion is unavailable.",
    };
  const invalid = suggestionConfigurationError([suggestion], rules);
  if (invalid) return { ok: false, code: "configuration", message: invalid };
  // 选择建议保留其 ID 和保护标记，应用工厂仅用于自由创建。
  return prepareTokens(value, suggestion.label, {
    ...rules,
    separators: [],
    createToken: () => ({ ...suggestion }),
  });
}
export function renameToken(
  value: readonly EditableToken[],
  id: string,
  draft: string,
  rules: TokenEditRules = {},
): TokenResult {
  const error = tokenConfigurationError(value, rules);
  if (error) return { ok: false, code: "configuration", message: error };
  const token = value.find((t) => t.id === id);
  if (!token || token.disabled || token.editable === false)
    return {
      ok: false,
      code: "validation",
      message: "This token cannot be edited.",
    };
  const label = draft.trim().normalize("NFC");
  if (!label) return { ok: false, code: "empty", message: "Enter a label." };
  if (Array.from(label).length > (rules.maxTokenLength ?? 80))
    return {
      ok: false,
      code: "length",
      message: "The label exceeds the length limit.",
    };
  if (
    value.some(
      (t) =>
        t.id !== id &&
        tokenKey(t.label, rules.caseSensitive) ===
          tokenKey(label, rules.caseSensitive),
    )
  )
    return {
      ok: false,
      code: "duplicate",
      message: "This label already exists.",
    };
  try {
    const invalid = rules.validateToken?.(label);
    if (invalid) return { ok: false, code: "validation", message: invalid };
  } catch {
    return {
      ok: false,
      code: "validation",
      message: "Unable to validate this label.",
    };
  }
  return {
    ok: true,
    value: value.map((t) => (t.id === id ? { ...t, label } : t)),
    added: [],
  };
}
export function clearRemovableTokens<T extends Token>(
  value: readonly T[],
): T[] {
  return value.filter((t) => t.disabled || t.removable === false);
}
export function tokenPage(page: number, pageSize: number, total: number) {
  const size = Number.isFinite(pageSize)
    ? Math.max(1, Math.min(8, Math.floor(pageSize)))
    : 5;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Number.isFinite(page)
    ? Math.max(0, Math.min(pages - 1, Math.floor(page)))
    : 0;
  return {
    page: current,
    pages,
    size,
    start: current * size,
    end: Math.min(total, (current + 1) * size),
  };
}

/** 自由创建不能覆盖候选目录里的身份；精确匹配应走建议选择。 */
export function createSuggestedToken(
  value: readonly Token[],
  draft: string,
  options: readonly TokenSuggestion[],
  rules: TokenRules = {},
): TokenResult {
  const error = suggestionConfigurationError(options, rules);
  if (error) return { ok: false, code: "configuration", message: error };
  const result = prepareTokens(value, draft, { ...rules, separators: [] });
  if (!result.ok) return result;
  if (
    result.added.some((token) =>
      options.some(
        (option) =>
          option.id === token.id ||
          tokenKey(option.label, rules.caseSensitive) ===
            tokenKey(token.label, rules.caseSensitive),
      ),
    )
  )
    return {
      ok: false,
      code: "duplicate",
      message: "Choose the existing suggestion instead.",
    };
  return result;
}
