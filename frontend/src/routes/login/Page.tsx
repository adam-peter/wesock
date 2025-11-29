import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

export function LoginPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (nickname.trim()) {
      localStorage.setItem('nickname', nickname.trim());
      navigate('/', { replace: true });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to WeSock</CardTitle>
          <CardDescription>
            Enter your nickname to join the chat
          </CardDescription>
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
