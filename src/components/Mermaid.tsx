import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
      
      // We need to render manually to ensure it updates when chart changes
      const renderChart = async () => {
        try {
          // Sanitize chart: Mermaid often chokes on pipes inside brackets
          // This regex tries to find text inside [] or () and replace | with something else
          const sanitizedChart = chart.replace(/\[(.*?)\]|\((.*?)\)/g, (match) => {
            return match.replace(/\|/g, ' - ');
          });

          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, sanitizedChart);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering failed:', error);
          if (ref.current) {
            ref.current.innerHTML = '<div class="text-red-400 text-xs p-4 border border-red-500/20 rounded bg-red-500/5">Failed to render diagram. Check Mermaid syntax.</div>';
          }
        }
      };
      
      renderChart();
    }
  }, [chart]);

  return <div key={chart} ref={ref} className="mermaid flex justify-center overflow-x-auto py-4" />;
};
