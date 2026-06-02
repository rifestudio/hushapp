'use client';

import Image from 'next/image';

interface UserAvatarProps {
  src: string;
  alt: string;
}

export function UserAvatar({ src, alt }: UserAvatarProps) {
  return (
    <Image
      className="user-avatar"
      src={src}
      alt={alt}
      width={32}
      height={32}
    />
  );
}
