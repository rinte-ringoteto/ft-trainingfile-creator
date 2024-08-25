"use client"
import React from 'react';

interface TokenSummaryProps {
    totalTokens: number | null;
    overThresholdFiles: string[];
    maxCharCount: number;
}

export const TokenSummary: React.FC<TokenSummaryProps> = ({ totalTokens, overThresholdFiles, maxCharCount }) => {
    if (totalTokens === null) return null;

    return (
        <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-bold text-lg">Total Estimated Tokens: {totalTokens}</h3>
            <p className="text-sm text-gray-600">Note: This is an approximation. Actual token count may vary.</p>
            {overThresholdFiles.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-bold text-red-500">Files exceeding {maxCharCount} tokens:</h4>
                    <ul className="list-disc pl-5">
                        {overThresholdFiles.map((fileName, index) => (
                            <li key={index} className="text-red-500">{fileName}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};