import React from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-slate max-w-none">
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-4 text-emerald-400" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-6 mb-3 text-emerald-300 border-b border-white/10 pb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-4 mb-2 text-emerald-200" {...props} />,
          p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-300" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-300" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-slate-300" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
          code: ({node, className, children, ...props}) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className?.includes('language-');
            return isInline ? (
              <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-slate-900 p-4 rounded-xl overflow-x-auto border border-white/10 my-4">
                <code className="text-slate-300 text-sm font-mono" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-emerald-500/50 pl-4 py-1 my-4 bg-emerald-500/5 rounded-r-lg italic text-slate-400" {...props} />
          ),
          a: ({node, ...props}) => <a className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2" {...props} />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
