import { useState, useCallback } from 'react';
import { useSocketEvent } from './useSocketEvent';
import type { OnlineUser } from 'shared';

export function useUsers(): OnlineUser[] {
  const [users, setUsers] = useState<OnlineUser[]>([]);

  const handleUserListUpdate = useCallback((data: { users: OnlineUser[] }): void => {
    setUsers(data.users);
  }, []);

  useSocketEvent<{ users: OnlineUser[] }>('user_list_update', handleUserListUpdate);

  return users;
}
