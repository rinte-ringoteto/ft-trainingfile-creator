export const escapeQuotes = (str: string): string => {
    return str.replace(/"/g, '\\"');
};

export const getCharCount = (content: string): number => {
    return escapeQuotes(content).length;
};

export const isExceedingLimit = (count: number, limit: number): boolean => {
    return count > limit;
};

export const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (event.target && typeof event.target.result === 'string') {
                resolve(event.target.result);
            } else {
                reject(new Error('Failed to read file content'));
            }
        };
        reader.onerror = (error: ProgressEvent<FileReader>) => reject(error);
        reader.readAsText(file);
    });
};