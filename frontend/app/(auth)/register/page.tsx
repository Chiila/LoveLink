'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/toaster';

type Step = 'account' | 'profile' | 'preferences';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  age: string;
  bio: string;
  gender: string;
  interestedIn: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('account');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    bio: '',
    gender: '',
    interestedIn: '',
  });

  const steps: Step[] = ['account', 'profile', 'preferences'];
  const currentStepIndex = steps.indexOf(step);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'account') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 'profile') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      } else if (formData.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
      if (!formData.age) {
        newErrors.age = 'Age is required';
      } else if (parseInt(formData.age) < 18) {
        newErrors.age = 'You must be at least 18 years old';
      } else if (parseInt(formData.age) > 120) {
        newErrors.age = 'Please enter a valid age';
      }
    }

    if (step === 'preferences') {
      if (!formData.gender) {
        newErrors.gender = 'Please select your gender';
      }
      if (!formData.interestedIn) {
        newErrors.interestedIn = 'Please select who you\'re interested in';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setStep(steps[nextIndex]);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        age: parseInt(formData.age),
        bio: formData.bio,
        gender: formData.gender,
        interestedIn: formData.interestedIn,
      });

      toast({
        title: 'Welcome to LoveLink! 💕',
        description: 'Your account has been created successfully.',
        variant: 'love',
      });

      router.push('/discover');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-muted-foreground">
          {step === 'account' && 'Start with your login details'}
          {step === 'profile' && 'Tell us about yourself'}
          {step === 'preferences' && 'Who are you looking for?'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i <= currentStepIndex
                  ? 'bg-gradient-to-r from-love-500 to-coral-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < currentStepIndex ? (
                <Check className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-1 rounded-full transition-colors ${
                  i < currentStepIndex ? 'bg-love-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Account */}
        {step === 'account' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                error={errors.email}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                className="mt-1"
              />
            </div>
          </motion.div>
        )}

        {/* Step 2: Profile */}
        {step === 'profile' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                error={errors.name}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                min="18"
                max="120"
                value={formData.age}
                onChange={(e) => updateFormData('age', e.target.value)}
                error={errors.age}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio (Optional)</Label>
              <textarea
                id="bio"
                placeholder="Tell us a bit about yourself..."
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                className="mt-1 flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-love-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                maxLength={500}
              />
              <p className="mt-1 text-xs text-muted-foreground text-right">
                {formData.bio.length}/500
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preferences */}
        {step === 'preferences' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <Label>I am a</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => updateFormData('gender', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Man</SelectItem>
                  <SelectItem value="female">Woman</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="mt-1.5 text-sm text-destructive">{errors.gender}</p>
              )}
            </div>

            <div>
              <Label>Looking for</Label>
              <Select
                value={formData.interestedIn}
                onValueChange={(value) => updateFormData('interestedIn', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Who are you interested in?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Men</SelectItem>
                  <SelectItem value="female">Women</SelectItem>
                  <SelectItem value="other">Everyone</SelectItem>
                </SelectContent>
              </Select>
              {errors.interestedIn && (
                <p className="mt-1.5 text-sm text-destructive">{errors.interestedIn}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentStepIndex > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {currentStepIndex < steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          )}
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-love-500 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

