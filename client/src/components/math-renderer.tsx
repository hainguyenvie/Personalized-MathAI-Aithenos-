interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  // Temporary simplified version - renders content as-is without LaTeX processing
  // TODO: Restore katex functionality once dependency issues are resolved
  const renderMath = (text: string) => {
    if (!text) return <span></span>;
    
    // For now, just display the content as-is, preserving LaTeX notation
    // This allows the app to run while we fix the katex dependency issue
    return <span dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }} />;
  };

  return (
    <div className={`math-content ${className}`}>
      {renderMath(content)}
    </div>
  );
};

export default MathRenderer;
