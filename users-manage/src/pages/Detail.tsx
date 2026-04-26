import { useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, DetailMode } from '../types';
import { getUserById, addUser, updateUser } from '../store';

type FormData = Omit<User, 'id'>;

const EMPTY_FORM: FormData = { name: '', email: '', phone: '', role: 'Viewer', status: 'active' };

const TITLES: Record<DetailMode, string> = {
  add: '新增使用者',
  edit: '編輯使用者',
  view: '使用者詳情',
};

export default function Detail() {
  const [searchParams] = useSearchParams();
  const { mode = 'view' } = useParams<{ mode: DetailMode }>();
  const navigate = useNavigate();

  const id = searchParams.get('id') ?? '';
  const readOnly = mode === 'view';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    if (mode !== 'add' && id) {
      const user = getUserById(id);
      if (user) {
        const { id: _id, ...data } = user;
        reset(data);
      }
    }
  }, [id, mode, reset]);

  function onSubmit(data: FormData) {
    mode === 'add' ? addUser(data) : updateUser(id, data);
    navigate('/list');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/list')}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="返回列表"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-800">{TITLES[mode]}</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="姓名" error={errors.name?.message}>
            <input
              {...register('name', { required: '請輸入姓名' })}
              disabled={readOnly}
              className={inputCls(readOnly, !!errors.name)}
              placeholder="請輸入姓名"
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <input
              {...register('email', {
                required: '請輸入 Email',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email 格式不正確' },
              })}
              type="email"
              disabled={readOnly}
              className={inputCls(readOnly, !!errors.email)}
              placeholder="請輸入 Email"
            />
          </Field>

          <Field label="電話" error={errors.phone?.message}>
            <input
              {...register('phone', { required: '請輸入電話' })}
              disabled={readOnly}
              className={inputCls(readOnly, !!errors.phone)}
              placeholder="請輸入電話"
            />
          </Field>

          <Field label="角色">
            <select
              {...register('role')}
              disabled={readOnly}
              className={inputCls(readOnly, false)}
            >
              <option>Admin</option>
              <option>Editor</option>
              <option>Viewer</option>
            </select>
          </Field>

          <Field label="狀態">
            <select
              {...register('status')}
              disabled={readOnly}
              className={inputCls(readOnly, false)}
            >
              <option value="active">啟用</option>
              <option value="inactive">停用</option>
            </select>
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/list')}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              返回
            </button>
            {!readOnly && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                儲存
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(disabled: boolean, hasError: boolean): string {
  return [
    'w-full px-3 py-2 border rounded-lg text-sm',
    hasError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200',
    disabled
      ? 'bg-gray-50 text-gray-600 cursor-default'
      : 'bg-white focus:outline-none focus:ring-2',
  ].join(' ');
}
