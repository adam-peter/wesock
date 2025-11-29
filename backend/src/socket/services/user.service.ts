import { type OnlineUser } from 'shared';

const onlineUsers: OnlineUser[] = [];

export function addUser(user: OnlineUser): void {
  onlineUsers.push(user);
}

export function removeUser(socketId: string): OnlineUser | undefined {
  const userIndex = onlineUsers.findIndex((u) => u.id === socketId);
  if (userIndex === -1) {
    return undefined;
  }
  const [user] = onlineUsers.splice(userIndex, 1);
  return user;
}

export function getUsersByRoom(roomId: string): OnlineUser[] {
  return onlineUsers.filter((u) => u.roomId === roomId);
}

export function getAllUsers(): OnlineUser[] {
  return [...onlineUsers];
}
