import { z } from 'zod';

export type ToolCategory =
  | 'JSON'
  | 'JWT / Security'
  | 'API'
  | 'Regex'
  | 'SQL'
  | 'Formatters'
  | 'Generators'
  | 'Utilities'
  | 'Date & Color'
  | 'AI';

export interface AiExplainErrorRequest {
  errorText: string;
  context?: string;
}

export interface AiExplainErrorResponse {
  cause: string;
  explanation: string;
  likelyFix: string;
  codeExample?: string;
}

export interface AiGenerateRegexRequest {
  prompt: string;
}

export interface AiGenerateRegexResponse {
  pattern: string;
  flags: string;
  explanation: string;
  testExamples: string[];
}

export interface AiGenerateSqlRequest {
  prompt: string;
  dialect?: 'postgres' | 'mysql' | 'sqlite' | 'sqlserver';
}

export interface AiGenerateSqlResponse {
  sql: string;
  explanation: string;
}

export interface AiConvertJsonRequest {
  jsonString: string;
  targetLanguage: 'typescript' | 'zod' | 'go' | 'python';
}

export interface AiConvertJsonResponse {
  code: string;
  explanation: string;
}

export interface AiExplainCodeRequest {
  code: string;
  language?: string;
}

export interface AiExplainCodeResponse {
  explanation: string;
  flow: string[];
  potentialIssues: string[];
}

export interface ToolMetadata {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  description: string;
  keywords: string[];
  iconName: string;
  isPopular?: boolean;
  isNew?: boolean;
}

export interface ToolHistoryItem {
  id: string;
  toolSlug: string;
  timestamp: number;
  inputSummary?: string;
  isSensitive?: boolean;
}

export interface UserWorkspace {
  id: string;
  name: string;
  description?: string;
  toolSlugs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SharedItemPayload {
  id: string;
  toolSlug: string;
  title: string;
  configuration: Record<string, unknown>;
  createdAt: string;
}

export const UserSettingsSchema = z.object({
  appearance: z.enum(['system', 'light', 'dark']).default('dark'),
  editor: z.object({
    fontSize: z.number().default(14),
    tabSize: z.number().default(2),
    wordWrap: z.boolean().default(true),
    minimap: z.boolean().default(false),
  }),
  behavior: z.object({
    autoFormat: z.boolean().default(true),
    autoSave: z.boolean().default(false),
    confirmBeforeClear: z.boolean().default(true),
  }),
  privacy: z.object({
    saveHistory: z.boolean().default(true),
    donotSaveSensitive: z.boolean().default(true),
  }),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;
