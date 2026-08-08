'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import { getToolBySlug } from '@devkit/tool-core';
import { ToolHeader } from '../../../components/ToolHeader';
import { JsonFormatterTool } from '../../../components/tools/JsonFormatterTool';
import { JsonToTypescriptTool } from '../../../components/tools/JsonToTypescriptTool';
import { JwtDecoderTool } from '../../../components/tools/JwtDecoderTool';
import { UuidGeneratorTool } from '../../../components/tools/UuidGeneratorTool';
import { Base64Tool } from '../../../components/tools/Base64Tool';
import { UrlEncoderTool } from '../../../components/tools/UrlEncoderTool';
import { TimestampConverterTool } from '../../../components/tools/TimestampConverterTool';
import { HashGeneratorTool } from '../../../components/tools/HashGeneratorTool';
import { RegexTesterTool } from '../../../components/tools/RegexTesterTool';
import { SqlFormatterTool } from '../../../components/tools/SqlFormatterTool';
import { AiAssistantTool } from '../../../components/tools/AiAssistantTool';

interface ToolPageProps {
  params: {
    slug: string;
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    return (
      <div className="p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-devText-primary">Tool Not Found</h1>
        <p className="text-sm text-devText-secondary">
          The requested tool &quot;{params.slug}&quot; could not be found.
        </p>
      </div>
    );
  }

  const renderToolComponent = () => {
    switch (tool.slug) {
      case 'json-formatter':
        return <JsonFormatterTool />;
      case 'json-to-typescript':
        return <JsonToTypescriptTool />;
      case 'jwt-decoder':
        return <JwtDecoderTool />;
      case 'uuid-generator':
        return <UuidGeneratorTool />;
      case 'base64-encoder':
        return <Base64Tool />;
      case 'url-encoder':
        return <UrlEncoderTool />;
      case 'timestamp-converter':
        return <TimestampConverterTool />;
      case 'hash-generator':
        return <HashGeneratorTool />;
      case 'regex-tester':
        return <RegexTesterTool />;
      case 'sql-formatter':
        return <SqlFormatterTool />;
      case 'ai-assistant':
        return <AiAssistantTool initialTab="regex" />;
      case 'ai-regex-generator':
        return <AiAssistantTool initialTab="regex" />;
      case 'ai-sql-generator':
        return <AiAssistantTool initialTab="sql" />;
      case 'ai-error-explainer':
        return <AiAssistantTool initialTab="error" />;
      case 'ai-code-explainer':
        return <AiAssistantTool initialTab="code" />;
      default:
        return <JsonFormatterTool />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ToolHeader tool={tool} />
      <div className="flex-1 overflow-y-auto">{renderToolComponent()}</div>
    </div>
  );
}
