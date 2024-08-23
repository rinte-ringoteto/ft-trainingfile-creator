"use client"
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle, RefreshCw, Copy, Check, Upload, Settings, Download } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"
import { FaTimes } from 'react-icons/fa';
import { Jersey } from './styles/fonts';

interface Message {
  id: number;
  role: 'system' | 'user' | 'assistant';
  type: 'text' | 'svg';
  content: string;
  [key: string]: string | number
}

interface MessageInputProps {
  message: Message;
  onChange: (field: keyof Message, value: string) => void;
  onDelete: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ message, onChange, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            onChange('content', event.target.result);
            onChange('type', 'svg');
          }
        };
        reader.readAsText(file);
      }
    },
    [onChange]
  );

  return (
    <Card className="mb-4 relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
      >
        <FaTimes className="h-4 w-4" />
      </Button>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor={`role-${message.id}`} className="text-sm font-medium text-gray-700 mb-1">
              ロール
            </Label>
            <Select onValueChange={(value) => onChange('role', value as 'system' | 'user' | 'assistant')} value={message.role}>
              <SelectTrigger id={`role-${message.id}`}>
                <SelectValue placeholder="ロールを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">system</SelectItem>
                <SelectItem value="user">user</SelectItem>
                <SelectItem value="assistant">assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={`type-${message.id}`} className="text-sm font-medium text-gray-700 mb-1">
              タイプ
            </Label>
            <Select onValueChange={(value) => onChange('type', value as 'text' | 'svg')} value={message.type}>
              <SelectTrigger id={`type-${message.id}`}>
                <SelectValue placeholder="タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">text</SelectItem>
                <SelectItem value="svg">svg</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-4">
          <Label htmlFor={`content-${message.id}`} className="text-sm font-medium text-gray-700 mb-1">
            コンテンツ
          </Label>
          <div
            className={`relative ${isDragging ? 'bg-blue-100' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Textarea
              id={`content-${message.id}`}
              value={message.content}
              onChange={(e) => onChange('content', e.target.value)}
              placeholder="ここにテキストを入力してください"
              className="min-h-[100px] neumorphic-input"
            />
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-200 bg-opacity-50 rounded-md">
                <Upload className="h-12 w-12 text-blue-500" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MessageGroupProps {
  group: Message[];
  groupIndex: number;
  onChange: (groupIndex: number, messageIndex: number, field: keyof Message | 'delete', value: string) => void;
  onDelete: (groupIndex: number) => void;
  onAddMessage: (groupIndex: number) => void;
}

const MessageGroup: React.FC<MessageGroupProps> = ({ group, groupIndex, onChange, onDelete, onAddMessage }) => (
  <Card className="mb-4 relative">
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onDelete(groupIndex)}
      className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
    >
      <FaTimes className="h-4 w-4" />
    </Button>
    <CardHeader>
      <CardTitle className="text-xl font-bold">Index {groupIndex + 1}</CardTitle>
    </CardHeader>
    <CardContent>
      {group.map((message, index) => (
        <MessageInput
          key={message.id}
          message={message}
          onChange={(field, value) => onChange(groupIndex, index, field, value)}
          onDelete={() => onChange(groupIndex, index, 'delete', '')}
        />
      ))}
      <div className='flex justify-center items-center'>
        <Button onClick={() => onAddMessage(groupIndex)} className="w-1/2">
          <PlusCircle className="mr-2 h-4 w-4" /> メッセージを追加
        </Button>
      </div>
    </CardContent>
  </Card>
);

interface TemplateDialogProps {
  onSave: (template: Message[]) => void;
}

const TemplateDialog: React.FC<TemplateDialogProps> = ({ onSave }) => {
  const [template, setTemplate] = useState<Message[]>([
    { id: Date.now(), role: 'system', type: 'text', content: '' },
    { id: Date.now() + 1, role: 'user', type: 'text', content: '' },
    { id: Date.now() + 2, role: 'assistant', type: 'text', content: '' }
  ]);

  const handleChange = (index: number, field: keyof Message, value: string) => {
    const newTemplate = [...template];
    newTemplate[index] = { ...newTemplate[index], [field]: value };
    setTemplate(newTemplate);
  };

  const handleAddMessage = () => {
    setTemplate([...template, { id: Date.now(), role: 'user', type: 'text', content: '' }]);
  };

  const handleDeleteMessage = (index: number) => {
    setTemplate(template.filter((_, i) => i !== index));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="neumorphic-button">
          <Settings className="mr-2 h-4 w-4" /> テンプレート設定
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>メッセージグループテンプレート設定</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {template.map((message, index) => (
            <div key={message.id} className="grid gap-2 pb-0">
              <div className='flex justify-end'>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteMessage(index)}
                  className=" text-gray-500 hover:text-red-500"
                >
                  <FaTimes className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select onValueChange={(value) => handleChange(index, 'role', value)} value={message.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="ロール" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">system</SelectItem>
                    <SelectItem value="user">user</SelectItem>
                    <SelectItem value="assistant">assistant</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleChange(index, 'type', value)} value={message.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="タイプ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">text</SelectItem>
                    <SelectItem value="svg">svg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="コンテンツ"
                value={message.content}
                onChange={(e) => handleChange(index, 'content', e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <Button onClick={handleAddMessage}>
            <PlusCircle className="mr-2 h-4 w-4" /> メッセージを追加
          </Button>
          <Button onClick={() => onSave(template)}>テンプレートを保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TextConverter: React.FC = () => {
  const [messageGroups, setMessageGroups] = useState<Message[][]>([
    [
      { id: Date.now(), role: 'system', type: 'text', content: "" },
      { id: Date.now() + 1, role: 'user', type: 'text', content: "" },
      { id: Date.now() + 2, role: 'assistant', type: 'text', content: "" }
    ]
  ]);
  const [outputText, setOutputText] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [template, setTemplate] = useState<Message[]>([]);

  const handleSaveTemplate = (newTemplate: Message[]) => {
    setTemplate(newTemplate);
    toast({
      title: "テンプレートを保存しました",
      description: "新しいテンプレートが正常に保存されました。",
    });
  };

  const handleAddGroup = () => {
    const newGroup: Message[] = template.length > 0
      ? template.map(msg => ({ ...msg, id: Date.now() + Math.random() }))
      : [
        { id: Date.now(), role: 'system', type: 'text', content: "" },
        { id: Date.now() + 1, role: 'user', type: 'text', content: "" },
        { id: Date.now() + 2, role: 'assistant', type: 'text', content: "" }
      ];
    setMessageGroups([...messageGroups, newGroup]);
  };

  const handleChangeMessage = (groupIndex: number, messageIndex: number, field: keyof Message | 'delete', value: string) => {
    const newGroups = [...messageGroups];
    if (field === 'delete') {
      newGroups[groupIndex] = newGroups[groupIndex].filter((_, i) => i !== messageIndex);
    } else {
      newGroups[groupIndex][messageIndex][field] = value as any;
    }
    setMessageGroups(newGroups);
  };

  const handleDeleteGroup = (groupIndex: number) => {
    const newGroups = messageGroups.filter((_, i) => i !== groupIndex);
    setMessageGroups(newGroups);
  };

  const handleAddMessage = (groupIndex: number) => {
    const newGroups = [...messageGroups];
    newGroups[groupIndex].push({ id: Date.now(), role: 'user', type: 'text', content: '' });
    setMessageGroups(newGroups);
  };

  const handleConvert = () => {
    const convertedGroups = messageGroups.map(group => {
      const convertedMessages = group.map(msg => {
        let content = msg.content;
        if (msg.type === 'svg') {
          content = content.replace(/\n/g, '').replace(/"/g, '\\"');
        }
        return { role: msg.role, content: content };
      });
      return JSON.stringify({ messages: convertedMessages });
    });

    setOutputText(convertedGroups.join('\n'));
  };

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      toast({
        title: "コピーしました",
        description: "出力テキストがクリップボードにコピーされました。",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "コピーに失敗しました",
        description: "テキストのコピーに失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const jsonlContent = messageGroups.map(group => {
      const convertedMessages = group.map(msg => {
        let content = msg.content;
        if (msg.type === 'svg') {
          content = content.replace(/\n/g, '').replace(/"/g, '\\"');
        }
        return { role: msg.role, content: content };
      });
      return JSON.stringify({ messages: convertedMessages });
    }).join('\n');

    const blob = new Blob([jsonlContent], { type: 'application/x-jsonlines' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fine-tuning-data.jsonl';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "ダウンロードしました",
      description: "fine-tuning-data.jsonlファイルがダウンロードされました。",
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className={`${Jersey.className} text-6xl font-bold mb-8 text-center text-black shadow-text`}>OpenAI Fine-tuning file Creator</h1>
        <div className="flex justify-end mb-6">
          <TemplateDialog onSave={handleSaveTemplate} />
        </div>
        {messageGroups.map((group, index) => (
          <MessageGroup
            key={index}
            group={group}
            groupIndex={index}
            onChange={handleChangeMessage}
            onDelete={handleDeleteGroup}
            onAddMessage={handleAddMessage}
          />
        ))}
        <div className="space-y-4 w-full flex flex-col justify-center items-center">
          <Button onClick={handleAddGroup} className="w-1/2 neumorphic-button">
            <PlusCircle className="mr-2 h-4 w-4" /> グループを追加
          </Button>
        </div>
        <div className="my-8 space-y-4 w-full flex flex-col justify-center items-center">
          <Button onClick={handleConvert} className="w-1/2 my-4 neumorphic-button-primary bg-green-500 hover:bg-green-600">
            <RefreshCw className="mr-2 h-4 w-4" /> 変換
          </Button>
        </div>
        <Card className="mt-8 neumorphic-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex justify-between items-center">
              出力
              <div className="flex space-x-2">
                <Button
                  onClick={handleCopyOutput}
                  variant="outline"
                  size="sm"
                  className={`neumorphic-button-small ${isCopied ? "bg-green-100" : ""}`}
                >
                  {isCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> コピー済み
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" /> コピー
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="neumorphic-button-small"
                >
                  <Download className="mr-2 h-4 w-4" /> ダウンロード
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outputText}
              readOnly
              placeholder="変換されたJSONがここに表示されます"
              className="min-h-[200px] font-mono text-sm neumorphic-input"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TextConverter;