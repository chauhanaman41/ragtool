export type ContentType = 'text' | 'file' | 'url';

export interface RepurposedContent {
    linkedin: string;
    twitter: string[];
    blog: string;
    youtube: string;
    email: string;
    instagram: string;
}

export interface ProcessingState {
    isLoading: boolean;
    error: string | null;
    step: 'idle' | 'parsing' | 'transforming' | 'complete';
}
