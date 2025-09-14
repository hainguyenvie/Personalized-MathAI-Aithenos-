import 'katex/dist/katex.min.css';
// @ts-ignore - react-katex doesn't have TypeScript definitions
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderMath = (text: string): React.ReactElement => {
    if (!text) return <span></span>;
    
    // Clean and validate LaTeX expressions before processing
    let cleanedText = cleanLatex(text);
    
    // Handle complex LaTeX structures that KaTeX doesn't support
    if (cleanedText.includes('\\begin{tikzpicture}') || cleanedText.includes('\\tkz')) {
      // For tikzpicture and complex table structures, display a simplified version
      return renderFallbackMath(cleanedText);
    }
    
    // Split text into parts, handling both $...$ and $$...$$ math expressions
    const parts = [];
    let currentIndex = 0;
    
    // First handle display math ($$...$$)
    const displayMathRegex = /\$\$(.*?)\$\$/g;
    let match;
    
    // Replace display math with placeholders first
    const displayMathParts: string[] = [];
    let textWithPlaceholders = text.replace(displayMathRegex, (match, mathContent) => {
      const placeholder = `__DISPLAY_MATH_${displayMathParts.length}__`;
      displayMathParts.push(mathContent.trim());
      return placeholder;
    });
    
    // Then handle inline math ($...$)
    const inlineMathRegex = /\$(.*?)\$/g;
    const inlineMathParts: string[] = [];
    textWithPlaceholders = textWithPlaceholders.replace(inlineMathRegex, (match, mathContent) => {
      const placeholder = `__INLINE_MATH_${inlineMathParts.length}__`;
      inlineMathParts.push(validateAndCleanMath(mathContent.trim()));
      return placeholder;
    });
    
    // Now split by placeholders and render accordingly
    const segments = textWithPlaceholders.split(/(__(?:DISPLAY|INLINE)_MATH_\d+__)/);
    
    return (
      <span>
        {segments.map((segment, index) => {
          if (segment.startsWith('__DISPLAY_MATH_')) {
            const mathIndex = parseInt(segment.match(/\d+/)?.[0] || '0');
            const mathContent = displayMathParts[mathIndex];
            try {
              return <BlockMath key={index} math={mathContent} />;
            } catch (error) {
              console.warn('KaTeX display math error:', error);
              return <div key={index} className="text-gray-700 bg-gray-100 p-2 rounded border italic">Biểu thức toán học: {mathContent}</div>;
            }
          } else if (segment.startsWith('__INLINE_MATH_')) {
            const mathIndex = parseInt(segment.match(/\d+/)?.[0] || '0');
            const mathContent = inlineMathParts[mathIndex];
            try {
              return <InlineMath key={index} math={mathContent} />;
            } catch (error) {
              console.warn('KaTeX inline math error:', error);
              return <span key={index} className="text-gray-700 bg-gray-100 px-1 rounded italic">{mathContent}</span>;
            }
          } else {
            // Regular text - preserve line breaks
            return <span key={index} dangerouslySetInnerHTML={{ __html: segment.replace(/\n/g, '<br/>') }} />;
          }
        })}
      </span>
    );
  };
  
  const renderFallbackMath = (text: string): React.ReactElement => {
    // For complex LaTeX that KaTeX can't handle, try to extract and render simpler parts
    let processedText = text;
    
    // Extract table content and simplify
    if (text.includes('tkzTabInit')) {
      // Try to extract function information from tkzTabInit
      const funcMatch = text.match(/Cho hàm số \$(.*?)\$/);
      if (funcMatch) {
        const funcExpr = funcMatch[1];
        try {
          return (
            <div>
              <div className="mb-4">
                <span>Cho hàm số </span>
                <InlineMath math={funcExpr} />
                <span> có bảng biến thiên như sau:</span>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                <p className="text-sm text-gray-600 mb-2">Bảng biến thiên:</p>
                <div className="font-mono text-sm">
                  {text.includes('-efty') && <div>x: (-∞; -4) | (-4; +∞)</div>}
                  {text.includes('nghịch biến') && <div>Hàm số nghịch biến trên các khoảng tương ứng</div>}
                  {text.includes('đồng biến') && <div>Hàm số đồng biến trên các khoảng tương ứng</div>}
                </div>
              </div>
              <div className="mt-4">
                <span>Mệnh đề nào dưới đây </span>
                <InlineMath math="\\textbf{sai}" />
                <span>?</span>
              </div>
            </div>
          );
        } catch (error) {
          // Fall back to simplified display
        }
      }
    }
    
    // Clean up the text and try to render math expressions
    processedText = processedText
      .replace(/\\begin\{center\}/g, '')
      .replace(/\\end\{center\}/g, '')
      .replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, '[Bảng biến thiên]')
      .replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>')
      .replace(/\\efty/g, '∞');
    
    // Try to render any remaining math expressions
    return renderMath(processedText);
  };
  
  // Clean and validate LaTeX expressions
  const cleanLatex = (text: string): string => {
    let cleaned = text;
    
    // Fix common issues with LaTeX expressions
    // Handle incomplete fractions
    cleaned = cleaned.replace(/\\frac\{([^}]*)$/, '\\frac{$1}{}'); // Fix unclosed frac
    cleaned = cleaned.replace(/\\frac\{([^}]*)\s*$/, '\\frac{$1}{}'); // Fix unclosed frac with spaces
    
    // Handle infinity symbol
    cleaned = cleaned.replace(/∈fty/g, '\\infty');
    cleaned = cleaned.replace(/∞/g, '\\infty');
    
    return cleaned;
  };
  
  // Validate and clean individual math expressions
  const validateAndCleanMath = (mathContent: string): string => {
    let cleaned = mathContent;
    
    // Check for basic LaTeX structure issues
    const openBraces = (cleaned.match(/\{/g) || []).length;
    const closeBraces = (cleaned.match(/\}/g) || []).length;
    
    // If braces are unmatched, try to fix simple cases
    if (openBraces > closeBraces) {
      // Add missing closing braces
      cleaned += '}'.repeat(openBraces - closeBraces);
    }
    
    return cleaned;
  };

  return (
    <div className={`math-content ${className}`}>
      {renderMath(content)}
    </div>
  );
};

export default MathRenderer;
