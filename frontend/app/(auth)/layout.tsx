import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-love-500 via-love-600 to-coral-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="max-w-md text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl mb-8">
              <Heart className="w-10 h-10 fill-white" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-4">
              Find Your Perfect Match
            </h1>
            <p className="text-white/80 text-lg">
              Join millions of people finding meaningful connections every day. 
              Your journey to love starts here.
            </p>
            
            {/* Feature highlights */}
            <div className="mt-12 space-y-4">
              {[
                'Smart matching algorithm',
                'Safe & secure platform',
                'Real-time messaging',
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 justify-center text-white/90"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 lg:p-6">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-7 h-7 text-love-500 fill-love-500" />
            <span className="font-display text-xl font-bold gradient-text">LoveLink</span>
          </Link>
          <ThemeToggle />
        </header>
        
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
        
        <footer className="p-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LoveLink. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

