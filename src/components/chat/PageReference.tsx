import React from 'react';
import { useCallback } from 'react';

interface PageReferenceProps {
  pdfId: string;
  page: number;
  onPageClick: (pdfId: string, page: number) => void;
}

export const PageReference = ({ pdfId, page, onPageClick }: PageReferenceProps) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onPageClick(pdfId, page);
  }, [pdfId, page, onPageClick]);

  return (
    <a 
      href="#" 
      onClick={handleClick}
      className="text-blue-600 hover:text-blue-800 hover:underline"
    >
      [{page}]
    </a>
  );
}; 