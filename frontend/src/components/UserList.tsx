import { ScrollArea } from './ui/scroll-area';

interface User {
  id: string;
  nick: string;
}

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  return (
    <ScrollArea className="h-full p-4">
      <h3 className="font-semibold mb-3 text-sm text-gray-600">Online Users</h3>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded p-2 shadow-sm text-sm">
            {user.nick}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
