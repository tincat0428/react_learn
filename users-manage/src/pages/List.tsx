import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { getUsers, deleteUser } from '../store';

export default function List() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  /* setUsers(getUsers()) 抽出共用 */
  const load = useCallback(() => setUsers(getUsers()), []);
  useEffect(() => { load(); }, [load]);

  function handleDelete(id: string) {
    if (!window.confirm('確定要刪除此使用者？')) return;
    deleteUser(id);
    load();
  }
  /* 亦可寫成這樣（不想建立共用的load） */
  // useEffect(() => { setUsers(getUsers()); }, []);

  // function handleDelete(id: string) {
  //   if (!window.confirm('確定要刪除此使用者？')) return;
  //   deleteUser(id);
  //   setUsers(getUsers());
  // }


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">使用者管理</h1>
          <button
            onClick={() => navigate('/user/add')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            新增使用者
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">姓名</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">電話</th>
                <th className="px-5 py-3 text-left">角色</th>
                <th className="px-5 py-3 text-left">狀態</th>
                <th className="px-5 py-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{user.name}</td>
                  <td className="px-5 py-3 text-gray-500">{user.email}</td>
                  <td className="px-5 py-3 text-gray-500">{user.phone}</td>
                  <td className="px-5 py-3 text-gray-500">{user.role}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {user.status === 'active' ? '啟用' : '停用'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center space-x-2">
                    <button
                      onClick={() => navigate(`/user/view?id=${user.id}`)}
                      className="px-3 py-1 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                    >
                      檢視
                    </button>
                    <button
                      onClick={() => navigate(`/user/edit?id=${user.id}`)}
                      className="px-3 py-1 text-xs text-amber-600 border border-amber-200 rounded hover:bg-amber-50 transition-colors"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                    尚無使用者資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
