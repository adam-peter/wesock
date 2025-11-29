import { ScrollArea } from './ui/scroll-area';
import type { OnlineUser } from 'shared';

interface UserListProps {
  users: OnlineUser[];
}

export function UserList({ users }: UserListProps) {
  return (
    <ScrollArea className="h-full p-4">
      <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Online Users</h3>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="bg-background border rounded p-2 text-sm">
            {user.nick}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
