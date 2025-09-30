import { getAllStudents } from '@/lib/data';
import { LoginCard } from './login-card';

export default async function LoginPage() {
  // Fetch all available students to populate the login card
  const students = await getAllStudents();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <LoginCard students={students} />
    </main>
  );
}
