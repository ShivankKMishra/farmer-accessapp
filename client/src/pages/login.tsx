import AuthForm from '@/components/auth/auth-form';

export default function Login() {
  return (
    <section className="container mx-auto px-4 py-8 md:py-16">
      <AuthForm isLoginMode={true} />
    </section>
  );
}
