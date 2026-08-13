import { Controller, Get, Post, Body, Param, Query, BadRequestException, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common';
import { CORE_TOOLS, getToolBySlug, searchTools } from '@devkit/tool-core';
import { ApiProxyRequest, ApiProxyResponse } from '@devkit/shared';
import { db, tools, eq } from '../../database';

@Controller('tools')
export class ToolsController implements OnModuleInit {
  async onModuleInit() {
    await this.seedToolsIfEmpty();
  }

  private async seedToolsIfEmpty() {
    try {
      const existing = await db.select().from(tools).limit(1);
      if (!existing || existing.length === 0) {
        const rows = CORE_TOOLS.map((t) => ({
          id: t.id,
          slug: t.slug,
          name: t.name,
          category: t.category,
          description: t.description,
          iconName: t.iconName || null,
          isPopular: Boolean(t.isPopular),
          isNew: Boolean(t.isNew),
          keywords: t.keywords ? JSON.stringify(t.keywords) : null,
        }));
        await db.insert(tools).values(rows).onConflictDoNothing();
      }
    } catch (err) {
      // Fallback silently if DB is unreachable
    }
  }

  @Get()
  async getTools(@Query('q') q?: string) {
    await this.seedToolsIfEmpty();
    try {
      const rows = await db.select().from(tools);
      if (rows && rows.length > 0) {
        let results = rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          name: r.name,
          category: r.category,
          description: r.description,
          iconName: r.iconName,
          isPopular: r.isPopular,
          isNew: r.isNew,
          keywords: r.keywords ? JSON.parse(r.keywords) : [],
        }));

        if (q) {
          const queryStr = q.toLowerCase().trim();
          results = results.filter(
            (t) =>
              t.name.toLowerCase().includes(queryStr) ||
              t.description.toLowerCase().includes(queryStr) ||
              t.category.toLowerCase().includes(queryStr) ||
              (t.keywords && t.keywords.some((k: string) => k.toLowerCase().includes(queryStr)))
          );
        }
        return { success: true, data: results };
      }
    } catch (err) {
      // Fallback to static package
    }

    if (q) {
      return { success: true, data: searchTools(q) };
    }
    return { success: true, data: CORE_TOOLS };
  }

  @Get(':slug')
  async getTool(@Param('slug') slug: string) {
    await this.seedToolsIfEmpty();
    try {
      const rows = await db.select().from(tools).where(eq(tools.slug, slug)).limit(1);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          success: true,
          data: {
            id: r.id,
            slug: r.slug,
            name: r.name,
            category: r.category,
            description: r.description,
            iconName: r.iconName,
            isPopular: r.isPopular,
            isNew: r.isNew,
            keywords: r.keywords ? JSON.parse(r.keywords) : [],
          },
        };
      }
    } catch (err) {
      // Fallback
    }

    const tool = getToolBySlug(slug);
    if (!tool) {
      return { success: false, error: 'Tool not found' };
    }
    return { success: true, data: tool };
  }


  @Post('proxy-request')
  async proxyRequest(@Body() body: ApiProxyRequest): Promise<{ success: boolean; data: ApiProxyResponse }> {
    if (!body.url) {
      throw new BadRequestException('URL parameter is required');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(body.url);
    } catch {
      throw new BadRequestException('Invalid URL format');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new BadRequestException('Only HTTP and HTTPS protocols are allowed');
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    
    const isPrivateIp = (host: string): boolean => {
      if (['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'].includes(host)) return true;
      if (host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('169.254.')) return true;
      if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return true;
      return false;
    };

    if (isPrivateIp(hostname)) {
      throw new HttpException(
        'SSRF Protection: Access to localhost or internal network IP addresses is restricted',
        HttpStatus.FORBIDDEN
      );
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const fetchOptions: RequestInit = {
        method: body.method || 'GET',
        headers: body.headers || {},
        signal: controller.signal,
      };

      if (body.body && ['POST', 'PUT', 'PATCH'].includes(body.method)) {
        fetchOptions.body = body.body;
      }

      const response = await fetch(body.url, fetchOptions);
      clearTimeout(timeout);

      const responseTimeMs = Date.now() - startTime;
      const contentType = response.headers.get('content-type') || '';
      
      let data: any;
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = await response.text();
        }
      } else {
        data = await response.text();
      }

      const headersObj: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        headersObj[key] = val;
      });

      const sizeBytes = typeof data === 'string' ? Buffer.byteLength(data) : JSON.stringify(data).length;

      return {
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: headersObj,
          data,
          responseTimeMs,
          sizeBytes,
        },
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new HttpException('Proxy Request Timed Out (10s limit)', HttpStatus.GATEWAY_TIMEOUT);
      }
      throw new HttpException(`Proxy Error: ${err.message}`, HttpStatus.BAD_GATEWAY);
    }
  }
}
