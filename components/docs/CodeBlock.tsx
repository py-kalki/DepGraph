import { codeToHtml } from 'shiki';
import CopyButton from './CopyButton';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export default async function CodeBlock({ code, lang = 'bash' }: CodeBlockProps) {
  const trimmed = code.trim();
  const html = await codeToHtml(trimmed, {
    lang,
    theme: 'github-dark-dimmed',
  });

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        border: '1px solid rgba(255,255,255,0.15)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1rem',
          background: '#0D0D0D',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {lang}
        </span>
        <CopyButton code={trimmed} />
      </div>
      {/* Highlighted code */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
