export interface Token {
  id: string;
  label: string;
  disabled?: boolean;
  removable?: boolean;
}
export interface TokenRules {
  maxTokens?: number;
  maxTokenLength?: number;
  caseSensitive?: boolean;
  separators?: readonly string[];
  validateToken?: (label: string) => string | null;
  createToken?: (label: string) => Token;
}
export type TokenResult =
  | { ok: true; value: Token[]; added: Token[] }
  | {
      ok: false;
      code:
        | "configuration"
        | "empty"
        | "duplicate"
        | "length"
        | "count"
        | "validation"
        | "creation";
      message: string;
    };
export const tokenKey = (label: string, caseSensitive = false) => {
  const text = label.trim().normalize("NFC");
  return caseSensitive ? text : text.toLowerCase();
};
export function tokenConfigurationError(
  value: readonly Token[],
  {
    maxTokens = 20,
    maxTokenLength = 80,
    caseSensitive = false,
    separators = [",", ";", "\n"],
  }: TokenRules = {},
) {
  if (
    !Number.isInteger(maxTokens) ||
    maxTokens < 1 ||
    maxTokens > 100 ||
    !Number.isInteger(maxTokenLength) ||
    maxTokenLength < 1 ||
    maxTokenLength > 1000
  )
    return "Use maxTokens 1–100 and maxTokenLength 1–1000.";
  if (separators.length > 10 || separators.some((s) => !s || s.length > 4))
    return "Use at most 10 non-empty separators of at most 4 code units.";
  if (value.length > maxTokens) return `Use at most ${maxTokens} tokens.`;
  if (
    new Set(value.map((t) => t.id)).size !== value.length ||
    value.some((t) => !t.id)
  )
    return "Token IDs must be unique and non-empty.";
  if (
    value.some(
      (t) => !t.label.trim() || Array.from(t.label).length > maxTokenLength,
    )
  )
    return "Existing token labels must be non-empty and within the length limit.";
  if (
    new Set(value.map((t) => tokenKey(t.label, caseSensitive))).size !==
    value.length
  )
    return "Existing token labels must be unique.";
  return null;
}
/** 显式提交时拆分草稿；整批通过才返回下一份数据，不在输入/组合期间增删标签。 */
export function prepareTokens(
  value: readonly Token[],
  draft: string,
  rules: TokenRules = {},
): TokenResult {
  const error = tokenConfigurationError(value, rules);
  if (error) return { ok: false, code: "configuration", message: error };
  const {
    maxTokens = 20,
    maxTokenLength = 80,
    caseSensitive = false,
    separators = [",", ";", "\n"],
    validateToken,
    createToken,
  } = rules;
  if (draft.length > 10000)
    return {
      ok: false,
      code: "length",
      message: "Draft must contain at most 10000 code units.",
    };
  let parts = [draft];
  for (const separator of separators)
    parts = parts.flatMap((part) => part.split(separator));
  const labels = parts.map((s) => s.trim().normalize("NFC")).filter(Boolean);
  if (!labels.length)
    return {
      ok: false,
      code: "empty",
      message: "Enter a token before adding.",
    };
  if (value.length + labels.length > maxTokens)
    return {
      ok: false,
      code: "count",
      message: `Use at most ${maxTokens} tokens.`,
    };
  const seen = new Set(value.map((t) => tokenKey(t.label, caseSensitive))),
    ids = new Set(value.map((t) => t.id)),
    added: Token[] = [];
  for (const label of labels) {
    if (Array.from(label).length > maxTokenLength)
      return {
        ok: false,
        code: "length",
        message: `Each token may contain at most ${maxTokenLength} Unicode characters.`,
      };
    let token: Token;
    try {
      const invalid = validateToken?.(label);
      if (invalid) return { ok: false, code: "validation", message: invalid };
      token = createToken
        ? createToken(label)
        : { id: tokenKey(label, caseSensitive), label };
    } catch {
      return {
        ok: false,
        code: "creation",
        message: "Unable to create this token.",
      };
    }
    if (
      !token ||
      typeof token.id !== "string" ||
      !token.id ||
      typeof token.label !== "string" ||
      !token.label.trim() ||
      Array.from(token.label).length > maxTokenLength
    )
      return {
        ok: false,
        code: "creation",
        message: "Token factory returned an invalid token.",
      };
    const key = tokenKey(token.label, caseSensitive);
    if (seen.has(key) || ids.has(token.id))
      return {
        ok: false,
        code: "duplicate",
        message: "This batch contains a duplicate token.",
      };
    seen.add(key);
    ids.add(token.id);
    added.push(token);
  }
  return { ok: true, value: [...value, ...added], added };
}
