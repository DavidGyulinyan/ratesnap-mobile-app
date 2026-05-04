import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface OnboardingGuideProps {
  onComplete: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: t('onboarding.welcome'),
      description: t('onboarding.welcomeDesc'),
      icon: '💱',
    },
    {
      title: t('onboarding.convert'),
      description: t('onboarding.convertDesc'),
      icon: '🔄',
    },
    {
      title: t('onboarding.multi'),
      description: t('onboarding.multiDesc'),
      icon: '📊',
    },
    {
      title: t('onboarding.save'),
      description: t('onboarding.saveDesc'),
      icon: '⭐',
    },
    {
      title: t('onboarding.calculator'),
      description: t('onboarding.calculatorDesc'),
      icon: '🧮',
    },
    {
      title: t('onboarding.offline'),
      description: t('onboarding.offlineDesc'),
      icon: '📱',
    },
    {
      title: t('onboarding.alerts'),
      description: t('onboarding.alertsDesc'),
      icon: '🔔',
    },
    {
      title: t('onboarding.ready'),
      description: t('onboarding.readyDesc'),
      icon: '🚀',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      onComplete();
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backNavButton}
          onPress={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous step"
        >
          {currentStep > 0 ? (
            <Ionicons name="arrow-back" size={22} color="#64748b" />
          ) : (
            <View style={styles.backNavPlaceholder} />
          )}
        </TouchableOpacity>
        <Text style={[styles.stepIndicator, styles.stepIndicatorCenter]}>
          {currentStep + 1} / {steps.length}
        </Text>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
           <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
         </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{currentStepData.icon}</Text>
        </View>

        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
           <Text style={styles.nextButtonText}>
             {currentStep === steps.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
           </Text>
           {currentStep < steps.length - 1 && (
             <Ionicons name="arrow-forward" size={20} color="#fff" />
           )}
         </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    gap: 8,
  },
  backNavButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backNavPlaceholder: {
    width: 22,
    height: 22,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  stepIndicatorCenter: {
    flex: 1,
    textAlign: 'center',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default OnboardingGuide;