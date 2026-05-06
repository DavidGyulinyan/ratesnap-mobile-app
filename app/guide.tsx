import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingGuide from '@/components/OnboardingGuide';
import { useRouter } from 'expo-router';

export default function GuideScreen() {
  const router = useRouter();

  const handleComplete = () => {
    router.back(); // Go back to previous screen
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
      <OnboardingGuide onComplete={handleComplete} />
    </SafeAreaView>
  );
}