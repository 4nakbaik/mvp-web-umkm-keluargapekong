type ButtonProps = {
  text: string;
  variant?: 'login' | 'register' | 'submitLogin' | 'submitRegister' | 'formSubmit';
  type?: 'submit' | 'button';
  disabled?: boolean;
};

export default function Button({
  text,
  variant = 'formSubmit',
  type = 'button',
  disabled,
}: ButtonProps) {
  const base =
    ' rounded-lg transition-colors font-small cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    login: 'px-4 py-2 font-semibold bg-blue-500 text-white hover:bg-blue-700',
    register: 'px-3 py-2',
    submitLogin:
      'px-4 py-3 w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    submitRegister:
      'px-4 py-3 w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    formSubmit:
      'px-4 py-3 w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.formSubmit}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
