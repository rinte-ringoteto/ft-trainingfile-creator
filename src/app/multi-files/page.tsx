import React from 'react';
import { FileUploader } from "react-drag-drop-files";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Jersey } from '../styles/fonts';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { FaTimes } from 'react-icons/fa';
import { useFileProcessing } from '@/hooks/useFileProcessing';
import { TokenSummary } from '@/components/TokenSummary';
import { MAX_CHAR_COUNT } from '@/utils/constants';
import { FileList } from '@/components/FileList';

const FileUploadSPA: React.FC = () => {
    const {
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
    } = useFileProcessing();

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className={`${Jersey.className} text-6xl font-bold text-center text-black shadow-text`}>
                ChatGPT 4o FT Multi-file Uploader
            </h1>
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
                    <div className="flex justify-between mt-4">
                        <Button onClick={convertToJSONL} className="w-1/2 mr-2">
                            フォーマットチェックと変換
                        </Button>
                        <Button onClick={() => calculateTokens()} className="w-1/2 ml-2" disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'トークン数計算'}
                        </Button>
                    </div>
                    {formatErrors && Object.keys(formatErrors).length > 0 && (
                        <div className="mt-4 p-4 bg-red-100 rounded">
                            <h3 className="font-bold text-red-700">Format Errors Found:</h3>
                            <ul className="list-disc pl-5">
                                {Object.entries(formatErrors).map(([key, value]) => (
                                    <li key={key} className="text-red-600">{`${key}: ${value}`}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {processedFiles.length > 0 && (
                <Card>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 my-4">
                            <div>
                                <Label htmlFor="commonSystem">Common System</Label>
                                <Input
                                    id="commonSystem"
                                    value={commonSystem}
                                    onChange={(e) => handleCommonInputChange('system', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="commonUser">Common User</Label>
                                <Input
                                    id="commonUser"
                                    value={commonUser}
                                    onChange={(e) => handleCommonInputChange('user', e.target.value)}
                                    className="mt-1"
                                    placeholder="Enter user prompt"
                                />
                                <p className='text-sm text-gray-500 ml-2'>* Use ${"{filename}"} for dynamic file name</p>
                            </div>
                        </div>

                        <FileList
                            filesWithTokens={filesWithTokens}
                            handleInputChange={handleInputChange}
                            handleDeleteRow={handleDeleteRow}
                        />

                        <TokenSummary
                            totalTokens={totalTokens}
                            overThresholdFiles={overThresholdFiles}
                            maxCharCount={MAX_CHAR_COUNT}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default FileUploadSPA;