'use client';

import { useState, useRef } from 'react';
import { FileText, Link, Upload, Sparkles, AlertCircle } from 'lucide-react';
import styles from './InputSection.module.css';
import { ContentType } from '@/types';

interface InputSectionProps {
    onContentParsed: (text: string) => void;
    isProcessing: boolean;
}

export default function InputSection({ onContentParsed, isProcessing }: InputSectionProps) {
    const [activeTab, setActiveTab] = useState<ContentType>('text');
    const [textInput, setTextInput] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        setError(null);
        let contentToProcess = '';

        try {
            if (activeTab === 'text') {
                if (!textInput.trim()) throw new Error('Please enter some text');
                contentToProcess = textInput;
            } else if (activeTab === 'url') {
                if (!urlInput.trim()) throw new Error('Please enter a URL');
                // Call URL parsing API
                const res = await fetch('/api/parse/url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: urlInput }),
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                contentToProcess = data.text;
            } else if (activeTab === 'file') {
                if (!file) throw new Error('Please upload a file');
                // Call File parsing API
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/parse/document', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                contentToProcess = data.text;
            }

            onContentParsed(contentToProcess);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Content Repurposing Engine</h1>
                <p className={styles.subtitle}>Transform your content into platform-optimized versions instantly.</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'text' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('text')}
                >
                    <FileText size={18} /> Direct Text
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'file' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('file')}
                >
                    <Upload size={18} /> Upload File
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'url' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('url')}
                >
                    <Link size={18} /> URL
                </button>
            </div>

            <div className={styles.inputArea}>
                {activeTab === 'text' && (
                    <textarea
                        className={styles.textarea}
                        placeholder="Paste your content here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                    />
                )}

                {activeTab === 'file' && (
                    <div
                        className={`${styles.fileUpload} ${dragActive ? styles.dragActive : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <Upload size={48} color="var(--color-primary)" />
                        <p style={{ marginTop: '1rem', fontWeight: 600 }}>
                            {file ? file.name : 'Click or Drag & Drop to Upload'}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                            Supports PDF and DOCX
                        </p>
                    </div>
                )}

                {activeTab === 'url' && (
                    <input
                        type="url"
                        className={styles.urlInput}
                        placeholder="Enter article URL..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                    />
                )}
            </div>

            {error && (
                <div className={styles.error} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <button
                className={styles.button}
                onClick={handleSubmit}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    'Processing...'
                ) : (
                    <>
                        <Sparkles size={20} /> Generate Content
                    </>
                )}
            </button>
        </div>
    );
}
