'use client';

import React, { useEffect, useState } from 'react';
import { getToolBySlug } from '@devkit/tool-core';
import { useDevKitStore } from '../../../store/useDevKitStore';
import { ToolHeader } from '../../../components/ToolHeader';
import { ToolHelpDrawer } from '../../../components/ToolHelpDrawer';
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
import { ApiTesterTool } from '../../../components/tools/ApiTesterTool';
import { CronBuilderTool } from '../../../components/tools/CronBuilderTool';
import { QrGeneratorTool } from '../../../components/tools/QrGeneratorTool';
import { ColorConverterTool } from '../../../components/tools/ColorConverterTool';
import { PipelineBuilderTool } from '../../../components/tools/PipelineBuilderTool';

interface ToolPageProps {
  params: {
    slug: string;
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);
  const { addHistoryItem } = useDevKitStore();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Catat kunjungan ke tool ini saat halaman pertama kali dibuka
  useEffect(() => {
    if (tool) {
      addHistoryItem(tool.slug, `Visited ${tool.name}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

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
      case 'api-tester':
        return <ApiTesterTool />;
      case 'cron-builder':
        return <CronBuilderTool />;
      case 'qr-generator':
        return <QrGeneratorTool />;
      case 'color-converter':
        return <ColorConverterTool />;
      case 'pipeline-builder':
        return <PipelineBuilderTool />;
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
    <div className="flex flex-col min-h-full">
      <ToolHeader tool={tool} onOpenHelp={() => setIsHelpOpen(true)} />
      <div className="flex-1 p-4 sm:p-6 space-y-6">
        {renderToolComponent()}
      </div>

      {/* Slide-over Drawer Documentation */}
      <ToolHelpDrawer
        toolSlug={tool.slug}
        toolName={tool.name}
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
