"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";

type Props = { content: string; onFileLink?: (file: string) => void; compact?: boolean };

function Text({content,onFileLink}: Props) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{
    a: ({href,children}) => {
      if (href && !/^(?:[a-z]+:|\/|#)/i.test(href) && /\.md(?:#|$)/i.test(href) && onFileLink) return <button type="button" className="text-link" onClick={() => onFileLink(href)}>{children}</button>;
      const external = href?.startsWith("https://") || href?.startsWith("http://");
      return <a href={href} target={external?"_blank":undefined} rel={external?"noopener noreferrer":undefined}>{children}{external && <ExternalLink size={11} aria-label="opens in a new tab" className="external-icon" />}</a>;
    },
    table: ({children}) => <div className="table-scroll"><table>{children}</table></div>,
  }}>{content}</ReactMarkdown>;
}

export default function Markdown({content,onFileLink,compact}: Props) {
  // Treat only the known details/summary wrapper as UI. All remaining HTML is skipped.
  const pattern = /<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  const sections: React.ReactNode[] = [];
  let cursor=0;
  let match: RegExpExecArray|null;
  while ((match=pattern.exec(content)) !== null) {
    if (match.index>cursor) sections.push(<Text key={`text-${cursor}`} content={content.slice(cursor,match.index)} onFileLink={onFileLink} />);
    sections.push(<details className="answer-reveal" key={`answer-${match.index}`}><summary>{match[1].replace(/<[^>]*>/g,"").trim()}</summary><div className="answer-content"><Text content={match[2].trim()} onFileLink={onFileLink}/></div></details>);
    cursor=pattern.lastIndex;
  }
  if (cursor<content.length) sections.push(<Text key={`text-${cursor}`} content={content.slice(cursor)} onFileLink={onFileLink}/>);
  return <div className={`markdown${compact?" markdown-compact":""}`}>{sections}</div>;
}
