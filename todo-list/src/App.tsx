import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './App.css';

interface Todo {
  id: number;
  text: string;
  endTime: string;
  completed: boolean;
}

interface FormValues {
  text: string;
  endTime: string;
}

function App(): React.JSX.Element {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorToast, setErrorToast] = useState('');

  const {
    register, // 把 input 「登記」進表單
    handleSubmit,
    reset,
    formState: { errors, isValid }, // 從 formState 再解構出 errors
  } = useForm<FormValues>({ mode: 'onChange' });

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(''), 3000);
  };

  const onSubmit = (data: FormValues) => {
    if (new Date(data.endTime) <= new Date()) {
      showError('截止時間不能小於當下時間');
      return;
    }
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text: data.text, endTime: data.endTime, completed: false },
    ]);
    reset();
  };

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const formatEndTime = (endTime: string) =>
    new Date(endTime).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {errorToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50">
          {errorToast}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Todo List</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="新增待辦事項..."
            className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.text ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'
            }`}
            {...register('text', { required: '請輸入待辦事項', maxLength: { value: 5, message: '待辦事項不能超過5字' } })}
          />
          {errors.text && (
            <p className="text-red-500 text-xs -mt-2">{errors.text.message}</p>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">截止時間</label>
            <input
              type="datetime-local"
              className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.endTime ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'
              }`}
              {...register('endTime', { required: '請選擇截止時間', validate: value => new Date(value) > new Date() || '截止時間不能小於當下時間' })}
            />
            {errors.endTime && (
              <p className="text-red-500 text-xs">{errors.endTime.message}</p>
            )}
          </div>
          {/* React 無法直接print出 boolean 值 */}
           isValid: {String(isValid)}
          <button
            type="submit"
            disabled={!isValid}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            新增
          </button>
        </form>

        {todos.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">還沒有待辦事項</p>
        ) : (
          <ul className="space-y-2">
            {todos.map(todo => (
              <li
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {todo.text}
                  </p>
                  <p className="text-xs text-gray-400">{formatEndTime(todo.endTime)}</p>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
                  aria-label="刪除"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {todos.length > 0 && (
          <p className="text-xs text-gray-400 mt-4 text-right">
            {todos.filter(t => t.completed).length} / {todos.length} 已完成
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
