import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { PageReference } from './PageReference';

interface MessageContentProps {
  content: string;
  onPageClick: (pdfId: string, page: number) => void;
}

export const MessageContent = ({ content, onPageClick }: MessageContentProps) => {
  const processedContent = useMemo(() => {
    // First, normalize line endings
    const normalizedContent = content.replace(/\r\n/g, '\n');
    
    // Split content and preserve PDF references while removing extra newlines around them
    const parts = normalizedContent.split(/(\[PDF: [a-f0-9-]+, Page: \d+\])/g);
    
    return parts.map((part, index) => {
      const match = part.match(/\[PDF: ([a-f0-9-]+), Page: (\d+)\]/);
      if (match) {
        const [_, pdfId, page] = match;
        return (
          <PageReference
            key={index}
            pdfId={pdfId}
            page={parseInt(page, 10)}
            onPageClick={onPageClick}
          />
        );
      }
      // Remove extra newlines before and after PDF references
      const trimmedPart = part.replace(/\n*(\[PDF:.*?\])\n*/g, '$1');
      return <ReactMarkdown key={index}>{trimmedPart}</ReactMarkdown>;
    });
  }, [content, onPageClick]);

  return <>{processedContent}</>;
}; 