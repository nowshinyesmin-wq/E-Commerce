'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('Member sign-in is coming soon. This preview does not send or save your details.');
  }

  return (
    <main className="min-h-screen bg-[#f5f0e9] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100svh-2.5rem)] max-w-[1440px] flex-col overflow-hidden rounded-[30px] border border-[#e7ded3] bg-[#fffcf8] shadow-[0_30px_100px_rgba(54,37,27,0.13)] sm:min-h-[calc(100svh-4rem)] sm:rounded-[38px] lg:grid lg:grid-cols-[1.04fr_0.96fr]">
        <section className="relative min-h-[250px] overflow-hidden bg-[#40362e] sm:min-h-[340px] lg:min-h-full">
          <Image
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=90"
            alt="A model in a tailored neutral-toned ensemble"
            fill
            priority
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#201812]/85 via-[#201812]/20 to-[#201812]/5" />

          <Link
            href="/"
            aria-label="Atelier North home"
            className="absolute left-6 top-6 z-10 inline-flex items-center gap-3 rounded-full border border-white/20 bg-[#211a15]/25 px-4 py-2.5 text-white backdrop-blur-md transition hover:bg-[#211a15]/45 sm:left-9 sm:top-9"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5eee5] font-serif text-sm font-semibold text-[#33251e]">
              AN
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[0.58rem] uppercase tracking-[0.24em] text-white/70">
                Atelier
              </span>
              <span className="font-display text-lg">North</span>
            </span>
          </Link>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-10 lg:p-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[0.62rem] uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e9c79e]" />
              Made for the moments in between
            </span>
            <p className="mt-5 max-w-xl font-display text-[2rem] leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-[3.65rem]">
              A little more you,
              <br />
              in every detail.
            </p>
            <div className="mt-5 flex items-center gap-3 text-sm text-white/75">
              <span className="h-px w-8 bg-white/60" />
              Thoughtfully chosen. Made to be kept.
            </div>
          </div>

          <div className="absolute right-7 top-8 hidden h-24 w-24 rounded-full border border-white/25 sm:right-10 sm:top-10 sm:flex sm:items-center sm:justify-center">
            <span className="max-w-16 text-center text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-white/80">
              Everyday, elevated
            </span>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-9 sm:px-12 sm:py-12 lg:px-14 xl:px-20">
          <div className="w-full max-w-[410px]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#78685d] transition hover:text-[#9a573d]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to the collection
            </Link>

            <div className="mt-9 sm:mt-12">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-[#a46a4c]">
                Your own little corner
              </p>
              <h1 className="mt-3 font-display text-[2.7rem] leading-none tracking-[-0.04em] text-[#241d18] sm:text-5xl">
                Welcome back.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#75685e]">
                Sign in to keep your favorites close and pick up where you left off.
              </p>
            </div>

            <div
              role="status"
              className="mt-7 flex items-start gap-3 rounded-2xl border border-[#eee1d4] bg-[#f9f4ed] px-4 py-3.5"
            >
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#a46a4c]" />
              <p className="text-xs leading-5 text-[#74675c]">
                Member sign-in is coming soon. This preview won’t send or save your details.
              </p>
            </div>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-medium text-[#3b3029]">
                  Email address
                </label>
                <div className="group flex h-[54px] items-center gap-3 rounded-2xl border border-[#e8ddd1] bg-white px-4 transition focus-within:border-[#b77d5c] focus-within:ring-4 focus-within:ring-[#a76446]/10">
                  <Mail className="h-[17px] w-[17px] shrink-0 text-[#a48d7c] transition group-focus-within:text-[#a76446]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#2e251f] outline-none placeholder:text-[#b2a79d]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="password" className="block text-xs font-medium text-[#3b3029]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setNotice('Password recovery will be available when member accounts launch.')
                    }
                    className="text-xs text-[#9b6145] transition hover:text-[#6f382a] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="group flex h-[54px] items-center gap-3 rounded-2xl border border-[#e8ddd1] bg-white px-4 transition focus-within:border-[#b77d5c] focus-within:ring-4 focus-within:ring-[#a76446]/10">
                  <LockKeyhole className="h-[17px] w-[17px] shrink-0 text-[#a48d7c] transition group-focus-within:text-[#a76446]" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#2e251f] outline-none placeholder:text-[#b2a79d]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8f7f72] transition hover:bg-[#f5eee7] hover:text-[#573d30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a76446]/40"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-2.5 text-xs text-[#74685e]">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded border-[#cfbbaa] accent-[#a76446] focus-visible:ring-2 focus-visible:ring-[#a76446]/40"
                />
                Keep me signed in
              </label>

              {notice && (
                <p
                  role="status"
                  className="rounded-xl border border-[#ead5c3] bg-[#f9f1e9] px-4 py-3 text-xs leading-5 text-[#75513d]"
                >
                  {notice}
                </p>
              )}

              <button
                type="submit"
                className="group flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#28211c] px-6 text-sm font-medium text-[#fffaf3] shadow-[0_9px_22px_rgba(40,33,28,0.15)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#9c5e43] hover:shadow-[0_12px_25px_rgba(156,94,67,0.22)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a76446]/30"
              >
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <p className="mt-7 text-center text-xs text-[#82756a]">
              New to the neighborhood?{' '}
              <Link href="/" className="font-medium text-[#9b6145] transition hover:text-[#6f382a]">
                Explore the collection
              </Link>
            </p>

            <div className="mt-10 flex items-center justify-center gap-2 border-t border-[#eee5db] pt-5 text-[0.65rem] uppercase tracking-[0.16em] text-[#a19487]">
              <span className="h-1 w-1 rounded-full bg-[#bd9a79]" />
              Considered style, wherever you are
              <span className="h-1 w-1 rounded-full bg-[#bd9a79]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
