'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Users, Sparkles, ArrowRight, Shield, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const features = [
  {
    icon: Users,
    title: 'Discover Profiles',
    description: 'Browse through authentic profiles and find people who share your interests and values.',
  },
  {
    icon: Heart,
    title: 'Smart Matching',
    description: 'Our intelligent algorithm helps you find compatible matches based on your preferences.',
  },
  {
    icon: MessageCircle,
    title: 'Connect & Chat',
    description: 'Start meaningful conversations with your matches in a safe, secure environment.',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Your privacy matters. We use advanced security to keep your data protected.',
  },
];

const testimonials = [
  {
    name: 'Sarah M.',
    age: 28,
    text: "I found my soulmate here! The matching algorithm really understood what I was looking for.",
    avatar: '👩‍🦰',
  },
  {
    name: 'James T.',
    age: 32,
    text: "Best dating app experience ever. The interface is beautiful and so easy to use.",
    avatar: '👨',
  },
  {
    name: 'Emily R.',
    age: 26,
    text: "Finally, a dating app that feels authentic. Met amazing people in just a few weeks!",
    avatar: '👩',
  },
];

const stats = [
  { value: '2M+', label: 'Active Users' },
  { value: '500K+', label: 'Matches Made' },
  { value: '4.9', label: 'App Rating' },
  { value: '150+', label: 'Countries' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative">
                <Heart className="w-8 h-8 text-love-500 fill-love-500" />
                <Sparkles className="w-4 h-4 text-coral-500 absolute -top-1 -right-1" />
              </div>
              <span className="font-display text-2xl font-bold gradient-text">LoveLink</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-pattern opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-love-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-coral-300/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-love-100 dark:bg-love-950 text-love-700 dark:text-love-300 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Find Your Perfect Match Today
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Where Love Stories{' '}
              <span className="gradient-text">Begin</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Join millions finding meaningful connections. Swipe, match, and chat 
              with people who truly understand you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button size="xl" className="group">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="xl">
                  I Have an Account
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Floating Hearts Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  x: Math.random() * 100 + '%',
                  y: '100%',
                  opacity: 0.6,
                  scale: 0.5 + Math.random() * 0.5
                }}
                animate={{ 
                  y: '-20%',
                  opacity: 0
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: 'linear'
                }}
              >
                <Heart className="w-6 h-6 text-love-400 fill-love-400" />
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">LoveLink</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built the perfect platform to help you find meaningful connections
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-card rounded-2xl p-6 h-full border hover:border-love-500/50 hover:shadow-xl hover:shadow-love-500/10 transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-love-500 to-coral-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to finding your perfect match
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Create Profile', desc: 'Sign up and tell us about yourself', icon: Users },
              { step: '02', title: 'Discover Matches', desc: 'Swipe through compatible profiles', icon: Heart },
              { step: '03', title: 'Start Chatting', desc: 'Connect with your matches', icon: MessageCircle },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-love-100 to-coral-100 dark:from-love-950 dark:to-coral-950 flex items-center justify-center mx-auto">
                      <item.icon className="w-10 h-10 text-love-500" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-love-500 to-coral-500 text-white text-sm font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-love-200 dark:border-love-800" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">
              Love Stories from <span className="gradient-text">Our Users</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real people, real connections, real love
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-card rounded-2xl p-6 h-full border relative">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-love-100 to-coral-100 dark:from-love-900 dark:to-coral-900 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.age} years old</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-love-500 to-coral-500" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Ready to Find Your Person?
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Join LoveLink today and start your journey to finding meaningful connections.
                Your perfect match might be just a swipe away.
              </p>
              <Link href="/register">
                <Button size="xl" variant="secondary" className="bg-white text-love-500 hover:bg-white/90">
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-love-500 fill-love-500" />
                <span className="font-display text-xl font-bold gradient-text">LoveLink</span>
              </Link>
              <p className="text-muted-foreground text-sm">
                Connecting hearts worldwide. Find your perfect match today.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-love-500 transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-love-500 transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-love-500 transition-colors">Success Stories</Link></li>
                <li><Link href="#" className="hover:text-love-500 transition-colors">Safety</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-love-500 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-love-500 transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-love-500 transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-love-500 transition-colors">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-love-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-love-500 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-love-500 transition-colors">Cookie Policy</Link></li>
                <li><Link href="#" className="hover:text-love-500 transition-colors">Community Guidelines</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LoveLink. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Zap className="w-5 h-5 text-love-500" />
              <span className="text-sm text-muted-foreground">Made with love</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

