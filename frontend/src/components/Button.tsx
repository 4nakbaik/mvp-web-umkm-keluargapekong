type ButtonProps = {
  text: string;
  variant?:
    | 'login'
    | 'register'
    | 'submitLogin'
    | 'submitRegister'
    | 'formSubmit'
    | 'adminSubmit'
    | 'staffSubmit';
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
    ' rounded transition-colors font-small cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    login: 'px-4 py-2 font-semibold bg-[#F4C480] text-white hover:bg-[#F4C480]/60',
    register: 'px-3 py-2 text-white bg-[#F4C480]/70 hover:bg-[#F4C480]/40',
    submitLogin:
      'px-4 py-3 w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    submitRegister:
      'px-4 py-3 w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    formSubmit:
      'px-4 py-3 w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    adminSubmit:
      'px-4 py-3 w-full bg-[#555559] text-white hover:bg-[#66666a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#555559]',
    staffSubmit:
      'px-4 py-3 w-full bg-[#5c4033] text-[#efeceb] hover:bg-[#7a5e51] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5c4033]',
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
