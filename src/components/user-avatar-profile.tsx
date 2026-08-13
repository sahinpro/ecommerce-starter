import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: {
    avatarUrl?: string | null;
    fullName?: string | null;
    email: string;
  } | null;
}

export function UserAvatarProfile({ className, showInfo = false, user }: UserAvatarProfileProps) {
  const initials = (user?.fullName || user?.email || 'AD').slice(0, 2).toUpperCase();

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={user?.avatarUrl || ''} alt={user?.fullName || user?.email || ''} />
        <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
      </Avatar>

      {showInfo ? (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{user?.fullName || 'Admin'}</span>
          <span className='truncate text-xs'>{user?.email || ''}</span>
        </div>
      ) : null}
    </div>
  );
}
