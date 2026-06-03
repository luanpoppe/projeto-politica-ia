import { LoginForm } from "@/components/auth/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ returnUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { returnUrl } = await searchParams;

  return (
    <div className="px-4 py-10 sm:px-6">
      <LoginForm returnUrl={returnUrl ?? "/conta"} />
    </div>
  );
}
