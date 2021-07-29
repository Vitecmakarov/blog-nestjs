export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  passwordHash: string;
  registeredAt: number;
  lastLogin: number;
  profileDesc: string;
  avatar: ArrayBuffer;
  isBanned: boolean;
}
