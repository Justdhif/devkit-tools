import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { db, users, eq } from '../../database';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devkit_super_secret_jwt_key_development_2026';

@Controller('auth')
export class AuthController {
  @Get('oauth/config')
  getOAuthConfig() {
    return {
      github: {
        enabled: Boolean(process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID),
        clientId: process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
      },
      google: {
        enabled: Boolean(process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID),
        clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      },
    };
  }

  @Post('register')
  async register(@Body() body: { email?: string; password?: string; name?: string }) {
    const { email, password, name } = body;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (existing && existing.length > 0) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const userName = name || email.split('@')[0];

    const newUser = {
      id: userId,
      email: email.toLowerCase().trim(),
      name: userName,
      passwordHash,
      provider: 'email',
      providerId: userId,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${userId}`,
    };

    await db.insert(users).values(newUser);

    const token = jwt.sign({ sub: userId, email: newUser.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return {
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        provider: newUser.provider,
        avatarUrl: newUser.avatarUrl,
      },
    };
  }

  @Post('login')
  async login(@Body() body: { email?: string; password?: string }) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const records = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (!records || records.length === 0) {
      throw new UnauthorizedException('Invalid email or password credentials.');
    }

    const user = records[0];
    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid authentication method.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password credentials.');
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  @Post('oauth')
  async oauthLogin(
    @Body()
    body: {
      provider: 'github' | 'google';
      email?: string;
      name?: string;
      avatarUrl?: string;
      providerId?: string;
    }
  ) {
    const { provider, email, name, avatarUrl, providerId } = body;
    if (!provider) {
      throw new BadRequestException('OAuth provider is required.');
    }

    const providerEmail =
      email?.toLowerCase().trim() ||
      `${provider}_user_${Math.random().toString(36).substring(2, 7)}@devkit.app`;
    const providerName =
      name || (provider === 'github' ? 'GitHub Developer' : 'Google Developer');
    const providerAvatar =
      avatarUrl ||
      (provider === 'github'
        ? 'https://avatars.githubusercontent.com/u/9919?v=4'
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser');
    const pId = providerId || `${provider}_${Math.random().toString(36).substring(2, 8)}`;

    let records = await db
      .select()
      .from(users)
      .where(eq(users.email, providerEmail))
      .limit(1);

    let user;
    if (records && records.length > 0) {
      user = records[0];
    } else {
      const userId = `usr_${provider}_${Math.random().toString(36).substring(2, 8)}`;
      const newUser = {
        id: userId,
        email: providerEmail,
        name: providerName,
        provider: provider,
        providerId: pId,
        avatarUrl: providerAvatar,
      };
      await db.insert(users).values(newUser);
      user = newUser;
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  @Post('oauth/callback')
  async oauthCallback(
    @Body()
    body: {
      provider: 'github' | 'google';
      code: string;
      redirectUri?: string;
    }
  ) {
    const { provider, code, redirectUri } = body;
    if (!provider || !code) {
      throw new BadRequestException('Provider and code are required.');
    }

    let profile: { email: string; name: string; avatarUrl: string; providerId: string };

    if (provider === 'github') {
      const clientId = process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (clientId && clientSecret) {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
          const errDetail = tokenData.error_description || tokenData.error || 'Failed to exchange GitHub authorization code.';
          throw new UnauthorizedException(errDetail);
        }

        const userRes = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'DevKit-App' },
        });
        const githubUser = await userRes.json();

        let email = githubUser.email;
        if (!email) {
          try {
            const emailsRes = await fetch('https://api.github.com/user/emails', {
              headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'DevKit-App' },
            });
            if (emailsRes.ok) {
              const emailsData: Array<{ email: string; primary: boolean; verified: boolean }> = await emailsRes.json();
              const primaryEmail = emailsData.find((e) => e.primary && e.verified) || emailsData.find((e) => e.verified) || emailsData[0];
              if (primaryEmail?.email) {
                email = primaryEmail.email;
              }
            }
          } catch (err) {}
        }

        profile = {
          email: email || `${githubUser.login}@users.noreply.github.com`,
          name: githubUser.name || githubUser.login,
          avatarUrl: githubUser.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${githubUser.login}`,
          providerId: String(githubUser.id),
        };
      } else {
        profile = {
          email: `github_user_${code.substring(0, 6)}@github.com`,
          name: `GitHub User (${code.substring(0, 6)})`,
          avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
          providerId: `gh_${code.substring(0, 8)}`,
        };
      }
    } else {
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (clientId && clientSecret) {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri || '',
            grant_type: 'authorization_code',
          }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
          const errDetail = tokenData.error_description || tokenData.error || 'Failed to exchange Google authorization code.';
          throw new UnauthorizedException(errDetail);
        }

        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const googleUser = await userRes.json();

        profile = {
          email: googleUser.email,
          name: googleUser.name || googleUser.given_name || 'Google User',
          avatarUrl: googleUser.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${googleUser.email}`,
          providerId: String(googleUser.id || googleUser.sub),
        };
      } else {
        profile = {
          email: `google_user_${code.substring(0, 6)}@gmail.com`,
          name: `Google User (${code.substring(0, 6)})`,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser',
          providerId: `goog_${code.substring(0, 8)}`,
        };
      }
    }

    return this.oauthLogin({
      provider,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      providerId: profile.providerId,
    });
  }

  @Get('me')
  async getMe(@Headers('authorization') authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header.');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
      const records = await db.select().from(users).where(eq(users.id, decoded.sub)).limit(1);
      if (!records || records.length === 0) {
        throw new UnauthorizedException('User no longer exists.');
      }

      const user = records[0];
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          provider: user.provider,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (err: any) {
      throw new UnauthorizedException('Invalid or expired session token.');
    }
  }
}
