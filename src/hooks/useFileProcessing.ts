"use client"
import { useState } from 'react';
import { escapeQuotes, readFileContent } from '@/utils/utils';
import { checkFormat } from '@/utils/formatChecker';
import { ProcessedFile, FormatErrors } from '@/utils/types';
import { MAX_CHAR_COUNT } from '@/utils/constants';

export const useFileProcessing = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [commonSystem, setCommonSystem] = useState<string>('');
    const [commonUser, setCommonUser] = useState<string>('');
    const [formatErrors, setFormatErrors] = useState<FormatErrors | null>(null);
    const [totalTokens, setTotalTokens] = useState<number | null>(null);
    const [overThresholdFiles, setOverThresholdFiles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [filesWithTokens, setFilesWithTokens] = useState<ProcessedFile[]>([]);

    const handleChange = (uploadedFiles: any): void => {
        setError(null);

        let fileArray: File[];
        if (uploadedFiles && uploadedFiles.length > 0) {
            fileArray = Array.from(uploadedFiles).filter(file => file instanceof File);
        } else if (uploadedFiles instanceof File) {
            fileArray = [uploadedFiles];
        } else {
            setError('Invalid file(s) received. Received: ' + JSON.stringify(uploadedFiles));
            console.error('Invalid file(s) received:', uploadedFiles);
            return;
        }

        if (fileArray.length === 0) {
            setError('No valid files were selected');
            return;
        }

        setFiles(fileArray);
        processFiles(fileArray);
    };

    const processFiles = async (uploadedFiles: File[]): Promise<void> => {
        try {
            const processed: ProcessedFile[] = await Promise.all(
                uploadedFiles.map(async (file) => ({
                    name: file.name,
                    content: await readFileContent(file),
                    type: file.type,
                    system: commonSystem,
                    user: commonUser
                }))
            );
            setProcessedFiles(processed);
            await calculateTokens(processed);
        } catch (err) {
            setError(`Error processing files: ${err}`);
            console.error('Error processing files:', err);
        }
    };

    const calculateTokens = async (files: ProcessedFile[] = processedFiles) => {
        setIsLoading(true);
        try {
            const jsonlData = files.map(file => {
                return JSON.stringify({
                    messages: [
                        { role: "system", content: escapeQuotes(file.system) },
                        { role: "user", content: escapeQuotes(file.user) },
                        { role: "assistant", content: escapeQuotes(file.content.replace(/\n/g, ' ')) }
                    ]
                });
            }).join('\n');

            const apiUrl = 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/token-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jsonl_data: jsonlData }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (!data.token_distribution || !Array.isArray(data.token_distribution.individual_counts)) {
                throw new Error('Unexpected response format from server');
            }

            const updatedFiles = files.map((file, index) => ({
                ...file,
                tokenCount: data.token_distribution.individual_counts[index],
            }));

            setFilesWithTokens(updatedFiles);
            setTotalTokens(data.token_distribution.total);
            setOverThresholdFiles(updatedFiles
                .filter(file => file.tokenCount && file.tokenCount > MAX_CHAR_COUNT)
                .map(file => file.name));
        } catch (error) {
            console.error('Error calculating tokens:', error);
            setError('Failed to calculate tokens. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const convertToJSONL = () => {
        const jsonlData = processedFiles.map(file => {
            const jsonData = {
                messages: [
                    { role: "system", content: escapeQuotes(file.system) },
                    { role: "user", content: escapeQuotes(file.user) },
                    { role: "assistant", content: escapeQuotes(file.content.replace(/\n/g, ' ')) }
                ]
            };
            return JSON.stringify(jsonData);
        }).join('\n');

        const errors = checkFormat(jsonlData);
        setFormatErrors(errors);

        if (Object.keys(errors).length === 0) {
            const blob = new Blob([jsonlData], { type: 'application/x-jsonlines' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted_data.jsonl';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleInputChange = (index: number, field: 'system' | 'user', value: string) => {
        const updatedProcessedFiles = [...processedFiles];
        updatedProcessedFiles[index][field] = value;
        setProcessedFiles(updatedProcessedFiles);

        const updatedFilesWithTokens = filesWithTokens.map((file, i) => {
            if (i === index) {
                return {
                    ...file,
                    [field]: value,
                    tokenCount: file.tokenCount
                };
            }
            return file;
        });
        setFilesWithTokens(updatedFilesWithTokens);

        const newOverThresholdFiles = updatedFilesWithTokens
            .filter(file => file.tokenCount && file.tokenCount > MAX_CHAR_COUNT)
            .map(file => file.name);
        setOverThresholdFiles(newOverThresholdFiles);
    };

    const handleCommonInputChange = (field: 'system' | 'user', value: string) => {
        if (field === 'system') {
            setCommonSystem(value);
        } else {
            setCommonUser(value);
        }

        const updatedFiles = processedFiles.map(file => {
            let updatedValue = value;
            if (field === 'user') {
                const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
                updatedValue = value.replace(/\${fileName}/g, fileNameWithoutExtension);
            }
            return {
                ...file,
                [field]: updatedValue
            };
        });
        setProcessedFiles(updatedFiles);

        const updatedFilesWithTokens = filesWithTokens.map((file, index) => ({
            ...updatedFiles[index],
            tokenCount: file.tokenCount
        }));
        setFilesWithTokens(updatedFilesWithTokens);

        const newOverThresholdFiles = updatedFilesWithTokens
            .filter(file => file.tokenCount && file.tokenCount > MAX_CHAR_COUNT)
            .map(file => file.name);
        setOverThresholdFiles(newOverThresholdFiles);
    };

    const handleDeleteRow = (index: number) => {
        const updatedProcessedFiles = [...processedFiles];
        updatedProcessedFiles.splice(index, 1);
        setProcessedFiles(updatedProcessedFiles);

        const updatedFilesWithTokens = [...filesWithTokens];
        updatedFilesWithTokens.splice(index, 1);
        setFilesWithTokens(updatedFilesWithTokens);

        const newTotalTokens = updatedFilesWithTokens.reduce((sum, file) => sum + (file.tokenCount || 0), 0);
        setTotalTokens(newTotalTokens);

        const newOverThresholdFiles = updatedFilesWithTokens
            .filter(file => file.tokenCount && file.tokenCount > MAX_CHAR_COUNT)
            .map(file => file.name);
        setOverThresholdFiles(newOverThresholdFiles);
    };

    return {
        processedFiles,
        filesWithTokens,
        error,
        isLoading,
        formatErrors,
        totalTokens,
        overThresholdFiles,
        commonSystem,
        commonUser,
        handleChange,
        convertToJSONL,
        calculateTokens,
        handleCommonInputChange,
        handleInputChange,
        handleDeleteRow
    };
};