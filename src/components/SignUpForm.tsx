'use client';

import { startTransition, useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';

import { SignUpFormState, signUp } from '@/actions/authActions';
import { TranslatedFormMessage } from '@/components/ui/TranslateFormMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Link, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { homePath, signInPath } from '@/paths';
import { type SignUpFormValues, signUpSchema } from '@/utils/schemas/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const initialState = { errors: {} };
  const [state, formAction] = useActionState<SignUpFormState, FormData>(signUp, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(t('signUpSuccessTitle'), {
        description: t('signUpSuccessDescription'),
      });
      router.push(homePath());
    }
  }, [state.success, router, t]);

  useEffect(() => {
    if (state.errors?._form) {
      toast.error(state.errors._form[0]);
      setIsSubmitting(false);
    }
  }, [state.errors]);

  const onSubmit = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className={cn('w-full max-w-md', className)} {...props}>
      <CardHeader>
        <CardTitle>{t('signUpTitle')}</CardTitle>
        <CardDescription>{t('signUpDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('nameLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  {fieldState.error?.message && (
                    <TranslatedFormMessage>{fieldState.error.message}</TranslatedFormMessage>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input placeholder='example@email.com' {...field} disabled={isSubmitting} />
                  </FormControl>
                  {fieldState.error?.message && (
                    <TranslatedFormMessage>{fieldState.error.message}</TranslatedFormMessage>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} disabled={isSubmitting} />
                  </FormControl>
                  {fieldState.error?.message && (
                    <TranslatedFormMessage>{fieldState.error.message}</TranslatedFormMessage>
                  )}
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('signingUp')}
                </>
              ) : (
                t('signUp')
              )}
            </Button>

            <div className='text-center text-sm'>
              {t('haveAccount')}{' '}
              <Link href={signInPath()} className='text-primary hover:underline'>
                {t('signIn')}
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
