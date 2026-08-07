export declare class SharingController {
    createShare(body: {
        toolSlug: string;
        title: string;
        configuration: Record<string, any>;
    }): Promise<{
        success: boolean;
        shareId: string;
        shareUrl: string;
    }>;
    getShare(id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            toolSlug: string;
            title: string;
            configuration: unknown;
        };
    }>;
}
