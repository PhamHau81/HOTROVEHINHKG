import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  content: string;
  className?: string;
  block?: boolean;
}

export const MathText: React.FC<MathTextProps> = ({ content, className = '', block = false }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // If it's a pure formula without $ delimiters
    if (block && !content.includes('$')) {
      try {
        return katex.renderToString(content, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return content;
      }
    }

    // Split text by $...$ and $$...$$
    // Regex matches $$...$$ or $...$
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

    return parts
      .map((part) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          try {
            return katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
            });
          } catch {
            return part;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          try {
            return katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
            });
          } catch {
            return part;
          }
        } else {
          // Normal text, preserve line breaks
          return part
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>');
        }
      })
      .join('');
  }, [content, block]);

  return (
    <div
      className={`prose-math leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
