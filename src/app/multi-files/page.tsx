"use client"
import React, { useState } from 'react';
import { FileUploader } from "react-drag-drop-files";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Jersey } from '../styles/fonts';
import Link from 'next/link';

interface ProcessedFile {
    name: string;
    content: string;
    type: string;
    system: string;
    user: string;
}

const FileUploadSPA: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [commonSystem, setCommonSystem] = useState<string>('');
    const [commonUser, setCommonUser] = useState<string>('');

    const handleChange = (uploadedFiles: any): void => {
        console.log('Received files:', uploadedFiles);
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

        console.log('Processed file array:', fileArray);
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
        } catch (err) {
            setError(`Error processing files: ${err}`);
            console.error('Error processing files:', err);
        }
    };

    const readFileContent = (file: File): Promise<string> => {
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

    const handleInputChange = (index: number, field: 'system' | 'user', value: string) => {
        const updatedFiles = [...processedFiles];
        updatedFiles[index][field] = value;
        setProcessedFiles(updatedFiles);
    };

    const handleCommonInputChange = (field: 'system' | 'user', value: string) => {
        if (field === 'system') {
            setCommonSystem(value);
        } else {
            setCommonUser(value);
        }
        const updatedFiles = processedFiles.map(file => ({
            ...file,
            [field]: value
        }));
        setProcessedFiles(updatedFiles);
    };

    const escapeQuotes = (str: string): string => {
        return str.replace(/"/g, '\\"');
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

        const blob = new Blob([jsonlData], { type: 'application/x-jsonlines' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted_data.jsonl';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className={`${Jersey.className} text-6xl font-bold text-center text-black shadow-text`}>ChatGPT 4o FT Multi-file Uploader</h1>
            <div className='flex justify-center mb-8'>
                <Link href="/" className='text-blue-500 underline'>個別作成</Link>
            </div>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>ファイルのアップロード</CardTitle>
                </CardHeader>
                <CardContent>
                    <FileUploader
                        multiple={true}
                        handleChange={handleChange}
                        name="file"
                        classes="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition duration-300"
                    />
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                    <Button onClick={convertToJSONL} className="mt-4 w-full">
                        変換してダウンロード
                    </Button>
                </CardContent>
            </Card>

            {processedFiles.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>処理結果</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <Label htmlFor="commonSystem">Common System</Label>
                                <Textarea
                                    id="commonSystem"
                                    value={commonSystem}
                                    onChange={(e) => handleCommonInputChange('system', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="commonUser">Common User</Label>
                                <Textarea
                                    id="commonUser"
                                    value={commonUser}
                                    onChange={(e) => handleCommonInputChange('user', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-4 font-semibold mb-2">
                            <div className="text-center">#</div>
                            <div>System</div>
                            <div>User</div>
                            <div>Assistant</div>
                        </div>

                        {processedFiles.map((file, index) => (
                            <div key={index} className="grid grid-cols-[40px_1fr_1fr_1fr] gap-4 items-center mb-4">
                                <div className="text-right font-semibold">{index + 1}</div>
                                <Textarea
                                    value={file.system}
                                    onChange={(e) => handleInputChange(index, 'system', e.target.value)}
                                    className="w-full"
                                />
                                <Textarea
                                    value={file.user}
                                    onChange={(e) => handleInputChange(index, 'user', e.target.value)}
                                    className="w-full"
                                />
                                <div className="p-2 bg-gray-100 rounded h-[80px] overflow-y-auto">
                                    {file.name}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default FileUploadSPA;