import { Copy, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import styles from './ResultsSection.module.css';
import { RepurposedContent } from '@/types';

interface ResultsSectionProps {
    content: RepurposedContent;
}

// Helper component for each collapsible section
function CollapsibleSection({ title, contentKey, content, copied, handleCopy }: {
    title: string;
    contentKey: keyof RepurposedContent;
    content: string | string[];
    copied: string | null;
    handleCopy: (text: string, id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen(!open);
    const displayContent = Array.isArray(content) ? content.join('\n\n') : content;
    return (
        <div className={styles.accordionItem}>
            <button className={styles.accordionHeader} onClick={toggle}>
                <span>{title}</span>
                <ChevronDown className={open ? styles.rotate : ''} size={16} />
            </button>
            {open && (
                <div className={styles.accordionBody}>
                    <div className={styles.content}>{displayContent}</div>
                    <div className={styles.actions}>
                        <button
                            className={styles.actionButton}
                            onClick={() => handleCopy(displayContent, contentKey)}
                        >
                            {copied === contentKey ? <Check size={16} /> : <Copy size={16} />}
                            {copied === contentKey ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ResultsSection({ content }: ResultsSectionProps) {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className={styles.container}>
            <CollapsibleSection
                title="LinkedIn Post"
                contentKey="linkedin"
                content={content.linkedin}
                copied={copied}
                handleCopy={handleCopy}
            />
            <CollapsibleSection
                title="Twitter Thread"
                contentKey="twitter"
                content={content.twitter}
                copied={copied}
                handleCopy={handleCopy}
            />
            <CollapsibleSection
                title="Short Blog"
                contentKey="blog"
                content={content.blog}
                copied={copied}
                handleCopy={handleCopy}
            />
            <CollapsibleSection
                title="YouTube Description"
                contentKey="youtube"
                content={content.youtube}
                copied={copied}
                handleCopy={handleCopy}
            />
            <CollapsibleSection
                title="Email Draft"
                contentKey="email"
                content={content.email}
                copied={copied}
                handleCopy={handleCopy}
            />
            <CollapsibleSection
                title="Instagram Caption"
                contentKey="instagram"
                content={content.instagram}
                copied={copied}
                handleCopy={handleCopy}
            />
        </div>
    );
}
