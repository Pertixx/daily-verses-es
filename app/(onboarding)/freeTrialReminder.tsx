import { View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import { Spacing, ThemeColors, Typography } from '@/constants/theme';
import { ONBOARDING_PROGRESS_STEPS, ONBOARDING_STEP_MAP } from '@/constants/onboarding';
import { AnimatedButton, OnboardingContainer, OnboardingHeader } from '@/components/onboarding';
import { useColors } from '@/hooks';
import { PACKAGE_TYPE } from 'react-native-purchases';
import { analytics, revenueCatService } from '@/services';

export default function FreeTrialReminderScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [priceString, setPriceString] = useState('');

  useEffect(() => {
    const loadPrice = async () => {
      try {
        if (!revenueCatService.canMakePurchases()) {
          setPriceString('$0.99/mes');
          return;
        }
        const offering = await revenueCatService.getOfferings();
        if (offering?.availablePackages?.length) {
          const monthlyPkg = offering.availablePackages.find(p => p.packageType === PACKAGE_TYPE.MONTHLY);
          const pkg = monthlyPkg ?? offering.availablePackages[0];
          setPriceString(pkg.product.priceString + '/mes');
        } else {
          setPriceString('$0.99/mes');
        }
      } catch {
        setPriceString('$0.99/mes');
      }
    };
    loadPrice();
  }, []);

  const handleContinue = async () => {
    analytics.track('onboarding_step_completed', { step: 'free_trial_reminder', step_number: ONBOARDING_STEP_MAP.free_trial_reminder });
    router.push('/(onboarding)/trialPaywall');
  };

  return (
    <OnboardingContainer
      currentStep={ONBOARDING_STEP_MAP.free_trial_reminder}
      totalSteps={ONBOARDING_PROGRESS_STEPS}
      scrollable
      showProgress={false}
      footer={
        <View style={styles.footerContent}>
          <AnimatedButton
            title="Continuar con prueba gratis"
            onPress={handleContinue}
          />
          <Text style={styles.priceDisclosure}>
            Después de los 3 días gratis, se cobra {priceString}. Cancelá en cualquier momento.
          </Text>
        </View>
      }
    >
      <View
        style={styles.offerContainer}
      >
        <OnboardingHeader
          icon={require('@/assets/icons/Tito.png')}
          title="Te vamos a mandar un recordatorio 1 día antes de que termine tu prueba gratuita"
          subtitle="Sin sorpresas, sin presión"
        />
      </View>
    </OnboardingContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    optionsContainer: {
      gap: Spacing.m,
      marginBottom: Spacing.l,
    },
    offerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    footerContent: {
      gap: Spacing.s,
    },
    priceDisclosure: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.body,
      lineHeight: 18,
    },
  });
