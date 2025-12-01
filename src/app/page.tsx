'use client';

import { useState } from 'react';
import InputSection from '@/components/InputSection';
import ResultsSection from '@/components/ResultsSection';
import ChatAssistant from '@/components/ChatAssistant';
import { RepurposedContent } from '@/types';
import styles from './page.module.css';

export default function Home() {
  const [content, setContent] = useState<RepurposedContent | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContentParsed = async (text: string) => {
    setExtractedText(text);
    setIsProcessing(true);
    try {
      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setContent(data);
    } catch (error) {
      console.error('Transformation failed:', error);
      alert('Failed to transform content. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className="container">
        <InputSection onContentParsed={handleContentParsed} isProcessing={isProcessing} />
        {content && <ResultsSection content={content} />}
      </div>
      <ChatAssistant context={extractedText} />
    </main>
  );
}
