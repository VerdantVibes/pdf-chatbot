import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MessageContentProps {
  content: string;
  onPageClick: (pdfId: string, page: number) => void;
}

export const MessageContent = ({ content, onPageClick }: MessageContentProps) => {
  const processedContent = useMemo(() => {
    return content
      // First escape numbers at the start of lines to prevent list conversion
      .replace(/^\\(\d+\.)/gm, '$1')
      // Then replace PDF references with sup tags
      .replace(
        /\[PDF: ([a-f0-9-]+), Page: (\d+)\]/g,
        (_, pdfId, page) => 
          `<sup data-pdf-id="${pdfId}" data-page="${page}" style="color: #228be6; cursor: pointer; margin: 0 2px;">[${page}]</sup>`
      );
  }, [content]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'SUP') {
      const pdfId = target.getAttribute('data-pdf-id');
      const page = target.getAttribute('data-page');
      if (pdfId && page) {
        onPageClick(pdfId, parseInt(page, 10));
      }
    }
  };

  return (
    <div onClick={handleClick}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children }) => <p className="mb-4">{children}</p>,
          strong: ({ children }) => <strong>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc ml-4 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-4 mb-4">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};