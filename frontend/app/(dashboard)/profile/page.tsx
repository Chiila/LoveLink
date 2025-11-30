'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, User, MapPin, Calendar, Heart, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { usersApi } from '@/lib/api';
import { useToast } from '@/components/ui/toaster';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    age: user?.profile?.age?.toString() || '',
    bio: user?.profile?.bio || '',
    gender: user?.profile?.gender || '',
    interestedIn: user?.profile?.interestedIn || '',
    location: user?.profile?.location || '',
    minAgePreference: user?.profile?.minAgePreference || 18,
    maxAgePreference: user?.profile?.maxAgePreference || 50,
    maxDistance: user?.profile?.maxDistance || 50,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPEG, PNG, GIF, or WebP)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      await usersApi.uploadPhoto(file);
      await refreshUser();
      toast({
        title: 'Photo updated! 📸',
        description: 'Your profile photo has been updated successfully.',
        variant: 'love',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await usersApi.updateProfile({
        name: formData.name,
        age: parseInt(formData.age),
        bio: formData.bio,
        gender: formData.gender,
        interestedIn: formData.interestedIn,
        location: formData.location,
        minAgePreference: formData.minAgePreference,
        maxAgePreference: formData.maxAgePreference,
        maxDistance: formData.maxDistance,
      });
      await refreshUser();
      setIsEditing(false);
      toast({
        title: 'Profile updated! ✨',
        description: 'Your changes have been saved.',
        variant: 'love',
      });
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your dating profile</p>
          </div>
          <Button
            variant={isEditing ? 'outline' : 'default'}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        {/* Profile Photo */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-love-200 dark:border-love-800">
                  <AvatarImage
                    src={user?.profile?.profilePhoto ? `${API_URL}${user.profile.profilePhoto}` : undefined}
                    alt={user?.profile?.name}
                  />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-love-100 to-coral-100 dark:from-love-900 dark:to-coral-900">
                    {user?.profile?.name ? getInitials(user.profile.name) : <User className="w-12 h-12" />}
                  </AvatarFallback>
                </Avatar>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  disabled={isUploading}
                >
                  <Camera className="w-8 h-8 text-white" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              
              <p className="mt-4 text-sm text-muted-foreground">
                {isUploading ? 'Uploading...' : 'Click to change photo'}
              </p>
              
              <h2 className="mt-4 text-2xl font-bold">
                {user?.profile?.name}, {user?.profile?.age}
              </h2>
              
              {user?.profile?.location && (
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.profile.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Tell others about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                  disabled={!isEditing}
                  min={18}
                  max={120}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-love-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                maxLength={500}
                placeholder="Tell others about yourself..."
              />
              <p className="mt-1 text-xs text-muted-foreground text-right">
                {formData.bio.length}/500
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Man</SelectItem>
                    <SelectItem value="female">Woman</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Interested In</Label>
                <Select
                  value={formData.interestedIn}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, interestedIn: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Men</SelectItem>
                    <SelectItem value="female">Women</SelectItem>
                    <SelectItem value="other">Everyone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                disabled={!isEditing}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-love-500" />
              Discovery Preferences
            </CardTitle>
            <CardDescription>Adjust who you want to see</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-4 block">
                Age Range: {formData.minAgePreference} - {formData.maxAgePreference}
              </Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground mb-1 block">Min Age</span>
                  <Slider
                    value={[formData.minAgePreference]}
                    onValueChange={([value]) =>
                      setFormData((prev) => ({ ...prev, minAgePreference: value }))
                    }
                    min={18}
                    max={100}
                    step={1}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground mb-1 block">Max Age</span>
                  <Slider
                    value={[formData.maxAgePreference]}
                    onValueChange={([value]) =>
                      setFormData((prev) => ({ ...prev, maxAgePreference: value }))
                    }
                    min={18}
                    max={100}
                    step={1}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-4 block">
                Maximum Distance: {formData.maxDistance} km
              </Label>
              <Slider
                value={[formData.maxDistance]}
                onValueChange={([value]) =>
                  setFormData((prev) => ({ ...prev, maxDistance: value }))
                }
                min={1}
                max={500}
                step={5}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              className="w-full"
              size="lg"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

