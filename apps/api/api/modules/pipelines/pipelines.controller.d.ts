export declare class PipelinesController {
    getPipelines(authHeader?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            userId: string;
            initialInput: string;
            steps: unknown;
        }[];
    }>;
    savePipeline(authHeader: string | undefined, body: {
        id?: string;
        name: string;
        description?: string;
        initialInput?: string;
        steps: any[];
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
        };
    }>;
    deletePipeline(authHeader: string | undefined, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
