// Avatar utility - resolve avatar URL and provide default avatar list

const CLASS_AVATAR_PATH = '/class-avatars';

export interface DefaultAvatar {
  name: string;
  url: string;
}

export const DEFAULT_AVATARS: DefaultAvatar[] = [
  { name: 'Barbarian', url: `${CLASS_AVATAR_PATH}/barbarian.webp` },
  { name: 'Bard', url: `${CLASS_AVATAR_PATH}/bard.webp` },
  { name: 'Cleric', url: `${CLASS_AVATAR_PATH}/cleric.webp` },
  { name: 'Druid', url: `${CLASS_AVATAR_PATH}/druid.webp` },
  { name: 'Fighter', url: `${CLASS_AVATAR_PATH}/fighter.webp` },
  { name: 'Monk', url: `${CLASS_AVATAR_PATH}/monk.webp` },
  { name: 'Paladin', url: `${CLASS_AVATAR_PATH}/paladin.webp` },
  { name: 'Ranger', url: `${CLASS_AVATAR_PATH}/ranger.webp` },
  { name: 'Rogue', url: `${CLASS_AVATAR_PATH}/rogue.webp` },
  { name: 'Sorcerer', url: `${CLASS_AVATAR_PATH}/sorcerer.webp` },
  { name: 'Warlock', url: `${CLASS_AVATAR_PATH}/warlock.webp` },
  { name: 'Wizard', url: `${CLASS_AVATAR_PATH}/wizard.webp` },
  { name: 'Default', url: `${CLASS_AVATAR_PATH}/default.webp` },
];

/**
 * Get avatar URL for a character.
 * Priority: custom avatar > class-based default > generic default
 */
export function getAvatarUrl(avatar?: string, className?: string): string {
  if (avatar) return avatar;

  if (className) {
    const normalized = className.toLowerCase();
    const match = DEFAULT_AVATARS.find((a) => a.name.toLowerCase() === normalized);
    if (match) return match.url;
  }

  return `${CLASS_AVATAR_PATH}/default.webp`;
}
