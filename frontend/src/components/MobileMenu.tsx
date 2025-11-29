import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import type { OnlineUser } from 'shared';

interface MobileMenuProps {
  users: OnlineUser[];
  onLogout: () => void;
}

export function MobileMenu({ users, onLogout }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-bold">WeSock</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Online Users</h3>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="bg-muted border rounded p-2 text-sm">
                    {user.nick}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={onLogout} className="w-full">
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
