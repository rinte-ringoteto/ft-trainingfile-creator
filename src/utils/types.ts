export interface ProcessedFile {
    name: string;
    content: string;
    type: string;
    system: string;
    user: string;
    tokenCount?: number;
}

export interface FormatErrors {
    [key: string]: number;
}