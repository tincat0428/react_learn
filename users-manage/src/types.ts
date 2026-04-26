export type UserStatus = 'active' | 'inactive';
export type DetailMode = 'view' | 'edit' | 'add';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatus;
}
