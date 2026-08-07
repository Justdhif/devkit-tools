export declare class AuthController {
    getOAuthConfig(): {
        github: {
            enabled: boolean;
            clientId: string;
        };
        google: {
            enabled: boolean;
            clientId: string;
        };
    };
    register(body: {
        email?: string;
        password?: string;
        name?: string;
    }): Promise<{
        success: boolean;
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            provider: string;
            avatarUrl: string;
        };
    }>;
    login(body: {
        email?: string;
        password?: string;
    }): Promise<{
        success: boolean;
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            provider: string;
            avatarUrl: string;
        };
    }>;
    oauthLogin(body: {
        provider: 'github' | 'google';
        email?: string;
        name?: string;
        avatarUrl?: string;
        providerId?: string;
    }): Promise<{
        success: boolean;
        token: string;
        user: {
            id: any;
            email: any;
            name: any;
            provider: any;
            avatarUrl: any;
        };
    }>;
    oauthCallback(body: {
        provider: 'github' | 'google';
        code: string;
        redirectUri?: string;
    }): Promise<{
        success: boolean;
        token: string;
        user: {
            id: any;
            email: any;
            name: any;
            provider: any;
            avatarUrl: any;
        };
    }>;
    getMe(authHeader?: string): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            name: string;
            provider: string;
            avatarUrl: string;
        };
    }>;
}
