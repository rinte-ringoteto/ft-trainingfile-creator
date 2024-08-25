"use client"
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button"
import { FaTimes } from 'react-icons/fa';
import { ProcessedFile } from '@/utils/types';
import { MAX_CHAR_COUNT } from '@/utils/constants';

interface FileListProps {
    filesWithTokens: ProcessedFile[];
    handleInputChange: (index: number, field: 'system' | 'user', value: string) => void;
    handleDeleteRow: (index: number) => void;
}

export const FileList: React.FC<FileListProps> = ({ filesWithTokens, handleInputChange, handleDeleteRow }) => {
    return (
        <div>
            <div className="grid grid-cols-[40px_1fr_1fr_1fr_80px_80px_40px] gap-4 font-semibold mb-2">
                <div className="text-center">#</div>
                <div>System</div>
                <div>User</div>
                <div>Assistant</div>
                <div className="text-center">Token Count</div>
                <div></div>
            </div>
            {filesWithTokens.map((file, index) => (
                <div key={index} className="grid grid-cols-[40px_1fr_1fr_1fr_80px_80px_40px] gap-4 items-center mb-4">
                    <div className="text-right font-semibold">{index + 1}</div>
                    <Input
                        value={file.system}
                        onChange={(e) => handleInputChange(index, 'system', e.target.value)}
                        className="w-full"
                    />
                    <Input
                        value={file.user}
                        onChange={(e) => handleInputChange(index, 'user', e.target.value)}
                        className="w-full"
                    />
                    <div className="p-2 bg-gray-100 rounded h-[40px] overflow-y-auto">
                        {file.name}
                    </div>
                    <div className={`text-center ${file.tokenCount && file.tokenCount > MAX_CHAR_COUNT ? 'text-red-500 font-bold' : ''}`}>
                        {file.tokenCount}
                    </div>
                    <Button
                        onClick={() => handleDeleteRow(index)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes size={20} />
                    </Button>
                </div>
            ))}
        </div>
    );
};