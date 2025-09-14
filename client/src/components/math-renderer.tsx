import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  // Function to render LaTeX math expressions
  const renderMath = (text: string) => {
    if (!text) return <span></span>;
    
    // Split text by LaTeX delimiters
    const parts = text.split(/(\$[^$]+\$|\$\$[^$]+\$\$)/g);
    
    return parts.map((part, index) => {
      // Check if it's inline math (single $)
      if (part.match(/^\$[^$]+\$$/)) {
        const mathContent = part.slice(1, -1); // Remove $ delimiters
        try {
          return (
            <InlineMath key={index} math={mathContent} />
          );
        } catch (error) {
          console.warn('KaTeX inline math error:', error, 'Content:', mathContent);
          return <span key={index} className="text-red-500">[Math Error: {mathContent}]</span>;
        }
      }
      // Check if it's block math (double $$)
      else if (part.match(/^\$\$[^$]+\$\$$/)) {
        const mathContent = part.slice(2, -2); // Remove $$ delimiters
        try {
          return (
            <BlockMath key={index} math={mathContent} />
          );
        } catch (error) {
          console.warn('KaTeX block math error:', error, 'Content:', mathContent);
          return <div key={index} className="text-red-500">[Math Error: {mathContent}]</div>;
        }
      }
      // Regular text
      else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  return (
    <div className={`math-content ${className}`}>
      {renderMath(content)}
    </div>
  );
};

export default MathRenderer;
