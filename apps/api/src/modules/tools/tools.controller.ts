import { Controller, Get, Post, Body, Param, Query, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { CORE_TOOLS, getToolBySlug, searchTools } from '@devkit/tool-core';
import { ApiProxyRequest, ApiProxyResponse } from '@devkit/shared';

@Controller('tools')
export class ToolsController {
  @Get()
  getTools(@Query('q') q?: string) {
    if (q) {
      return { success: true, data: searchTools(q) };
    }
    return { success: true, data: CORE_TOOLS };
  }

  @Get(':slug')
  getTool(@Param('slug') slug: string) {
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
