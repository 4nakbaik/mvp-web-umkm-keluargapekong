interface PasswordInvalidProps {
  message?: string;
}

export default function PasswordInvalid({ message }: PasswordInvalidProps) {
  return (
    <div className={`text-red-600 mt-1`}>
      {message || 'Password harus minimal 8 karakter'}
    </div>
  );
}
