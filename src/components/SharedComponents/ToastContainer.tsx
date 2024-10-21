import { useToast } from "@/hooks/use-toast"; // Adjust the path as needed

const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50">
      {toasts.map((toast) => (
        <div key={toast.id} className={`bg-gray-800 text-white p-4 rounded mb-2 ${!toast.open ? 'hidden' : ''}`}>
          <strong>{toast.title}</strong>
          <p>{toast.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
