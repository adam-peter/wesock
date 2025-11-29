import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

export function RootPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(
    localStorage.getItem('nickname') || ''
  );
  const [error, setError] = useState('');

  function saveNickname(): boolean {
    if (!nickname.trim()) {
      setError('Nickname is required');
      return false;
    }
    localStorage.setItem('nickname', nickname.trim());
    return true;
  }

  function handleJoinGlobal(e?: React.FormEvent): void {
    e?.preventDefault();
    if (saveNickname()) {
      navigate('/room/global');
    }
  }

  function handleCreatePersonal(): void {
    if (saveNickname()) {
      const newRoomId = crypto.randomUUID();
      navigate(`/room/${newRoomId}`);
    }
  }

  function handleJoinPersonal(): void {
    if (saveNickname()) {
      navigate('/join');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-2xl pt-1.5">
              WS
            </div>
          </div>
          <CardTitle className="text-2xl">WeSock</CardTitle>
          <CardDescription>Real-time chatrooms for Everyone!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinGlobal} className="space-y-3">
            <div>
              <Input
                type="text"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (e.target.value.trim()) {
                    setError('');
                  }
                }}
                maxLength={50}
                className={error ? 'border-red-500' : ''}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" className="w-full" size="lg">
                Join Global Room
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCreatePersonal}
                >
                  Create Personal Room
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleJoinPersonal}
                >
                  Join Personal Room
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
