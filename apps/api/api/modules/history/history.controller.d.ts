export declare class HistoryController {
    getHistory(authHeader?: string, limit?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            toolSlug: string;
            inputSummary: string;
            isSensitive: boolean;
        }[];
    }>;
    addHistory(authHeader: string | undefined, body: {
        toolSlug?: string;
        inputSummary?: string;
        isSensitive?: boolean;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
        };
    }>;
    clearHistory(authHeader?: string): Promise<{
        success: boolean;
    }>;
}
