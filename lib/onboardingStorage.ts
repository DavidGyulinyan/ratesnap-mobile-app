import AsyncStorage from "@react-native-async-storage/async-storage";

/** @deprecated Per-user keys are used; kept for one-time migration from older builds. */
const LEGACY_ONBOARDING_KEY = "onboardingCompleted";

export function onboardingKeyForUser(userId: string): string {
  return `onboardingCompleted:user:${userId}`;
}

/**
 * Whether this account has finished the first-login guide on this device.
 * Migrates legacy global flag into a per-user key when appropriate.
 */
export async function getHasCompletedOnboarding(
  userId: string
): Promise<boolean> {
  const perUser = await AsyncStorage.getItem(onboardingKeyForUser(userId));
  if (perUser === "true") return true;

  const legacy = await AsyncStorage.getItem(LEGACY_ONBOARDING_KEY);
  if (legacy === "true") {
    await AsyncStorage.multiSet([
      [onboardingKeyForUser(userId), "true"],
    ]);
    await AsyncStorage.removeItem(LEGACY_ONBOARDING_KEY);
    return true;
  }

  return false;
}

export async function setOnboardingCompletedForUser(
  userId: string
): Promise<void> {
  await AsyncStorage.setItem(onboardingKeyForUser(userId), "true");
  await AsyncStorage.removeItem(LEGACY_ONBOARDING_KEY);
}
