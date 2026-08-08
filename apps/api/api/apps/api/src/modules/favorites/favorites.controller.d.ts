export declare class FavoritesController {
    getFavorites(authHeader?: string): Promise<{
        success: boolean;
        data: string[];
    }>;
    toggleFavorite(authHeader: string | undefined, body: {
        toolSlug?: string;
    }): Promise<{
        success: boolean;
        data: string[];
    }>;
}
