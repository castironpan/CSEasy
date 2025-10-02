'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/app/actions';

export function LoginCard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [zId, setZId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!zId || !password) {
      setError('Please enter both zID and password');
      return;
    }

    startTransition(async () => {
      const result = await login(zId, password);

      if (result?.error) {
        setError(result.error); // show error from authenticateStudent
      } else if (result?.success) {
        router.push('/');
      } else {
        setError('Unexpected error, please try again.');
      }
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your zID and password to access your dashboard.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="zid">zID</Label>
            <Input
              id="zid"
              type="text"
              placeholder="z1234567"
              value={zId}
              onChange={(e) => setZId(e.target.value)}
              disabled={isPending}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              required
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}