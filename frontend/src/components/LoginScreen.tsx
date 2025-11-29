import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface LoginScreenProps {
  onJoin: (nickname: string) => void;
}

export function LoginScreen({ onJoin }: LoginScreenProps) {
  const [nickname, setNickname] = useState('');

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (nickname.trim()) {
      onJoin(nickname.trim());
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to WeSock</CardTitle>
          <CardDescription>Enter your nickname to join the chat</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Join Chat
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
