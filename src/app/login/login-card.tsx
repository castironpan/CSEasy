'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { login } from '@/app/actions'; // We will create this action next

interface Student {
  id: string;
  name: string;
}

interface LoginCardProps {
  students: Student[];
}

export function LoginCard({ students }: LoginCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  let selectedStudentId: string = students[0]?.id ?? '';

  const handleLogin = async () => {
    if (!selectedStudentId) {
      // In a real app, show an error message
      console.error("No student selected");
      return;
    }
    
    startTransition(async () => {
      const error = await login(selectedStudentId);
      if (error) {
        // In a real app, show an error toast
        console.error(error);
      } else {
        router.push('/');
      }
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Select a student profile to view the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="student">Student</Label>
          <Select defaultValue={selectedStudentId ?? undefined} onValueChange={(value) => { selectedStudentId = value; }}>
            <SelectTrigger id="student">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleLogin} disabled={isPending}>
          {isPending ? 'Logging in...' : 'Login'}
        </Button>
      </CardFooter>
    </Card>
  );
}
