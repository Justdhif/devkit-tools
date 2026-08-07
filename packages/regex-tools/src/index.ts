export interface RegexMatchResult {
  match: string;
  index: number;
  groups?: Record<string, string>;
}

export interface RegexTestOutput {
  success: boolean;
  matches: RegexMatchResult[];
  count: number;
  error?: string;
}

export function testRegex(pattern: string, flags: string = 'g', testString: string = ''): RegexTestOutput {
  if (!pattern) {
    return { success: true, matches: [], count: 0 };
  }

  try {
    const safeFlags = flags.includes('g') ? flags : flags + 'g';
    const regex = new RegExp(pattern, safeFlags);
    const matches: RegexMatchResult[] = [];

    let match: RegExpExecArray | null;
    let guard = 0;
    while ((match = regex.exec(testString)) !== null) {
      matches.push({
        match: match[0],
        index: match.index,
        groups: match.groups ? { ...match.groups } : undefined,
      });

      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      guard++;
      if (guard > 2000) break; // Prevent infinite loop
    }

    return {
      success: true,
      matches,
      count: matches.length,
    };
  } catch (err: any) {
    return {
      success: false,
      matches: [],
      count: 0,
      error: err?.message || 'Invalid Regular Expression pattern.',
    };
  }
}
