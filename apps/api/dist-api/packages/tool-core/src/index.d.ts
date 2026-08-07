import { ToolMetadata } from '@devkit/shared';
export declare const CORE_TOOLS: ToolMetadata[];
export declare function getToolBySlug(slug: string): ToolMetadata | undefined;
export declare function searchTools(query: string): ToolMetadata[];
