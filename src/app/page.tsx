import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';

interface Message {
  id: number;
  role: 'system' | 'user' | 'assistant';
  type: 'text' | 'svg';
  content: string;
  [key: string]: string | number; // インデックスシグネチャを追加
}

interface MessageInputProps {
  message: Message;
  onChange: (field: keyof Message, value: string) => void;
  onDelete: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ message, onChange, onDelete }) => (
  <div className="mb-4 p-4 border rounded-lg">
    <div className="mb-2">
      <Label htmlFor={`role-${message.id}`} className="block text-sm font-medium text-gray-700 mb-1">
        ロール
      </Label>
      <Select onValueChange={(value) => onChange('role', value)} value={message.role}>
        <SelectTrigger className="w-full" id={`role-${message.id}`}>
          <SelectValue placeholder="ロールを選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="system">system</SelectItem>
          <SelectItem value="user">user</SelectItem>
          <SelectItem value="assistant">assistant</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="mb-2">
      <Label htmlFor={`type-${message.id}`} className="block text-sm font-medium text-gray-700 mb-1">
        タイプ
      </Label>
      <Select onValueChange={(value) => onChange('type', value)} value={message.type}>
        <SelectTrigger className="w-full" id={`type-${message.id}`}>
          <SelectValue placeholder="タイプを選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text">text</SelectItem>
          <SelectItem value="svg">svg</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="mb-2">
      <Label htmlFor={`content-${message.id}`} className="block text-sm font-medium text-gray-700 mb-1">
        コンテンツ
      </Label>
      <Textarea
        id={`content-${message.id}`}
        value={message.content}
        onChange={(e) => onChange('content', e.target.value)}
        placeholder="ここにテキストを入力してください"
        className="w-full h-24"
      />
    </div>
    <Button variant="destructive" onClick={onDelete} className="w-full">
      <Trash2 className="mr-2 h-4 w-4" /> 削除
    </Button>
  </div>
);

interface MessageGroupProps {
  group: Message[];
  groupIndex: number;
  onChange: (groupIndex: number, messageIndex: number, field: keyof Message | 'delete', value: string) => void;
  onDelete: (groupIndex: number) => void;
  onAddMessage: (groupIndex: number) => void;
}

const MessageGroup: React.FC<MessageGroupProps> = ({ group, groupIndex, onChange, onDelete, onAddMessage }) => (
  <div className="mb-8 p-4 border-2 rounded-lg">
    <h2 className="text-xl font-bold mb-4">メッセージグループ {groupIndex + 1}</h2>
    {group.map((message, index) => (
      <MessageInput
        key={message.id}
        message={message}
        onChange={(field, value) => onChange(groupIndex, index, field, value)}
        onDelete={() => onChange(groupIndex, index, 'delete', '')}
      />
    ))}
    <Button onClick={() => onAddMessage(groupIndex)} className="w-full mb-2">
      <PlusCircle className="mr-2 h-4 w-4" /> メッセージを追加
    </Button>
    <Button variant="destructive" onClick={() => onDelete(groupIndex)} className="w-full">
      <Trash2 className="mr-2 h-4 w-4" /> グループを削除
    </Button>
  </div>
);

const TextConverter: React.FC = () => {
  const [messageGroups, setMessageGroups] = useState<Message[][]>([
    [
      { id: Date.now(), role: 'system', type: 'text', content: "You're a UI designer." },
      { id: Date.now() + 1, role: 'user', type: 'text', content: "Please output Button Danger component." },
      { id: Date.now() + 2, role: 'assistant', type: 'text', content: "" }
    ]
  ]);
  const [outputText, setOutputText] = useState<string>('');

  const handleAddGroup = () => {
    setMessageGroups([...messageGroups, [
      { id: Date.now(), role: 'system', type: 'text', content: "You're a UI designer." },
      { id: Date.now() + 1, role: 'user', type: 'text', content: "Please output Button Danger component." },
      { id: Date.now() + 2, role: 'assistant', type: 'text', content: "" }
    ]]);
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

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">テキスト/SVG変換アプリ</h1>
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
      <Button onClick={handleAddGroup} className="w-full mb-4">
        <PlusCircle className="mr-2 h-4 w-4" /> グループを追加
      </Button>
      <Button onClick={handleConvert} className="w-full mb-4">
        変換
      </Button>
      <div className="mb-2">
        <Label htmlFor="output" className="block text-sm font-medium text-gray-700 mb-1">
          出力
        </Label>
        <Textarea
          id="output"
          value={outputText}
          readOnly
          placeholder="変換されたJSONがここに表示されます"
          className="w-full h-64 font-mono text-sm"
        />
      </div>
    </div>
  );
};

export default TextConverter;