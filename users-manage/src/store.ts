import { User } from './types';

// 注意！React Store 非狀態管理，只是把存寫function集合在此，類似Angular service
const KEY = 'users_manage';

const seed: User[] = [
  { id: '1', name: '王小明', email: 'wang@example.com', phone: '0912-345-678', role: 'Admin', status: 'active' },
  { id: '2', name: '李小花', email: 'lee@example.com', phone: '0923-456-789', role: 'Editor', status: 'active' },
  { id: '3', name: '張大偉', email: 'chang@example.com', phone: '0934-567-890', role: 'Viewer', status: 'inactive' },
];

function load(): User[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw) as User[];
}

function persist(users: User[]) {
  localStorage.setItem(KEY, JSON.stringify(users));
}

export function getUsers(): User[] {
  return load();
}

export function getUserById(id: string): User | undefined {
  return load().find(u => u.id === id);
}

export function addUser(data: Omit<User, 'id'>): User {
  const users = load();
  const user: User = { ...data, id: Date.now().toString() };
  persist([...users, user]);
  return user;
}

export function updateUser(id: string, data: Omit<User, 'id'>): void {
  persist(load().map(u => (u.id === id ? { id, ...data } : u)));
}

export function deleteUser(id: string): void {
  persist(load().filter(u => u.id !== id));
}
