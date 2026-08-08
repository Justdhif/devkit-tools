export declare class ToolsController {
    getTools(q?: string): {
        success: boolean;
        data: import("@devkit/shared").ToolMetadata[];
    };
    getTool(slug: string): {
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("@devkit/shared").ToolMetadata;
        error?: undefined;
    };
}
