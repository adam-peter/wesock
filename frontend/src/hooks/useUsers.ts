import { useState, useCallback } from 'react';
import { useSocketEvent } from './useSocketEvent';
import type { OnlineUser, UserListUpdate } from 'shared';

export function useUsers(): OnlineUser[] {
  const [users, setUsers] = useState<OnlineUser[]>([]);

  const handleUserListUpdate = useCallback((data: UserListUpdate): void => {
    setUsers(data.users);
  }, []);

  useSocketEvent('user_list_update', handleUserListUpdate);

  return users;
}
