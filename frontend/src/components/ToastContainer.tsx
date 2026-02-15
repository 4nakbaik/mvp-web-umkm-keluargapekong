import { useToastStore } from '../hooks/useToastStore';
import Toast from './Toast';

export default function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col items-end space-y-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
