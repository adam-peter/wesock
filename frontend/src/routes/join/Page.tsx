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

export function JoinPage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  function handleJoin(e: React.FormEvent): void {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join a Room</CardTitle>
          <CardDescription>
            Enter the Room ID you want to join
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Room ID (e.g. uuid)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => navigate('/')}>
                    Back
                </Button>
                <Button type="submit" className="flex-1">
                    Join Room
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
