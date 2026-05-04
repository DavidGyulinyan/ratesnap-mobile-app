import AuthPromptModal from "@/components/AuthPromptModal";
import BurgerMenu from "@/components/BurgerMenu";
import CurrencyConverter from "@/components/CurrencyConverter";
import QuickActionModal from "@/components/QuickActionModal";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import MultiCurrencyConverter from "@/components/MultiCurrencyConverter";
import SavedRates from "@/components/SavedRates";
import RateAlertManager from "@/components/RateAlertManager";
import MathCalculator from "@/components/MathCalculator";
import OnboardingGuide from "@/components/OnboardingGuide";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserData } from "@/hooks/useUserData";
import { getAsyncStorage } from "@/lib/storage";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Popular currencies for multi-currency conversion - moved outside component to avoid re-renders
const POPULAR_CURRENCIES = [
  "AMD",
  "RUB",
  "GEL",
  "EUR",
  "CAD",
  "GBP",
  "JPY",
  "AUD",
  "CHF",
  "CNY",
  "SEK",
  "NZD",
  "MXN",
  "SGD",
  "HKD",
  "NOK",
  "KRW",
  "TRY",
  "INR",
  "BRL",
  "ZAR",
  "AED",
];

const DASHBOARD_FEATURES = [
  {
    icon: "stats-chart-outline" as const,
    titleKey: "feature.multiCurrency.title",
    descKey: "feature.multiCurrency.desc",
    action: "multi" as const,
  },
  {
    icon: "calculator-outline" as const,
    titleKey: "feature.calculator.title",
    descKey: "feature.calculator.desc",
    action: "calculator" as const,
  },
  {
    icon: "phone-portrait-outline" as const,
    titleKey: "feature.offline.title",
    descKey: "feature.offline.desc",
    action: null,
  },
  {
    icon: "globe-outline" as const,
    titleKey: "feature.location.title",
    descKey: "feature.location.desc",
    action: "converter" as const,
  },
  {
    icon: "cloud-download-outline" as const,
    titleKey: "feature.caching.title",
    descKey: "feature.caching.desc",
    action: null,
  },
] as const;

export default function HomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    savedRates: { savedRates, deleteRate, deleteAllRates, refreshRates },
    rateAlerts: { rateAlerts, refreshAlerts },
  } = useUserData();

  // Theme colors - must be called at top level
  const primaryColor = useThemeColor({}, "primary");
  const textInverseColor = useThemeColor({}, "textInverse");
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const surfaceSecondaryColor = useThemeColor({}, "surfaceSecondary");
  const textColor = useThemeColor({}, "text");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const borderColor = useThemeColor({}, "border");
  const [currentView, setCurrentView] = useState<"dashboard" | "converter">(
    "dashboard"
  );
  const [showMultiCurrency, setShowMultiCurrency] = useState(false);
  const [multiCurrencyShowAllTargets, setMultiCurrencyShowAllTargets] =
    useState(false);
  const [showSavedRates, setShowSavedRates] = useState(false);
  const [showRateAlerts, setShowRateAlerts] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currenciesData, setCurrenciesData] = useState<any>(null);
  const [currencyList, setCurrencyList] = useState<string[]>([]);
  const [multiCurrencyLoading, setMultiCurrencyLoading] = useState(false);
  const [savedRatesMaxVisible, setSavedRatesMaxVisible] = useState(4);
  const [refreshing, setRefreshing] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const featureCardWidth = Math.min(300, Math.max(260, windowWidth * 0.78));
  const featureCardGap = 12;
  const featuresCarouselRef = useRef<ScrollView>(null);
  const featuresCarouselScrollX = useRef(0);
  const featuresCarouselViewportW = useRef(0);
  const featuresCarouselContentW = useRef(0);

  const handleFeaturesCarouselScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      featuresCarouselScrollX.current = e.nativeEvent.contentOffset.x;
    },
    []
  );

  const showMoreFeatures = useCallback(() => {
    const viewport = featuresCarouselViewportW.current;
    const content = featuresCarouselContentW.current;
    const step = featureCardWidth + featureCardGap;
    if (!viewport || content <= viewport + 8) {
      return;
    }
    const maxX = Math.max(0, content - viewport);
    const x = featuresCarouselScrollX.current;
    let nextX = x + step;
    if (nextX > maxX) {
      nextX = x >= maxX - 8 ? 0 : maxX;
    }
    featuresCarouselRef.current?.scrollTo({ x: nextX, animated: true });
  }, [featureCardWidth, featureCardGap]);

  const handleFeaturePress = (
    action: (typeof DASHBOARD_FEATURES)[number]["action"]
  ) => {
    if (action === "multi") setShowMultiCurrency(true);
    else if (action === "calculator") setShowCalculator(true);
    else if (action === "converter") setShowConverter(true);
  };

  useEffect(() => {
    loadExchangeRates();
    checkOnboardingStatus();
  }, [user]);

  // Refresh saved rates when the modal opens
  useEffect(() => {
    if (showSavedRates) {
      refreshRates();
    }
  }, [showSavedRates, refreshRates]);

  // Refresh rate alerts when the modal opens
  useEffect(() => {
    if (showRateAlerts) {
      refreshAlerts();
    }
  }, [showRateAlerts, refreshAlerts]);

  // Refresh data when modals close
  useEffect(() => {
    if (!showSavedRates) {
      refreshRates();
    }
  }, [showSavedRates, refreshRates]);

  useEffect(() => {
    if (!showRateAlerts) {
      refreshAlerts();
    }
  }, [showRateAlerts, refreshAlerts]);

  // Refresh data when switching back to dashboard view
  useEffect(() => {
    if (currentView === "dashboard") {
      refreshRates();
      refreshAlerts();
    }
  }, [currentView, refreshRates, refreshAlerts]);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem(
        "onboardingCompleted"
      );

      // Show onboarding if:
      // 1. User hasn't completed onboarding, OR
      // 2. User account was created very recently (within last 24 hours)
      const shouldShowOnboarding =
        !onboardingCompleted ||
        (user &&
          user.created_at &&
          Date.now() - new Date(user.created_at).getTime() <
            24 * 60 * 60 * 1000);

      if (shouldShowOnboarding && user) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
    }
  };

  const loadExchangeRates = async () => {
    try {
      setMultiCurrencyLoading(true);
      const storage = getAsyncStorage();
      const cachedData = await storage.getItem("cachedExchangeRates");
      if (cachedData) {
        const data = JSON.parse(cachedData);
        setCurrenciesData(data);
        setCurrencyList(Object.keys(data.conversion_rates || {}));
        console.log("📦 Loaded cached exchange rates for multi-currency");
      } else {
        // Set default currencies if no cached data
        setCurrencyList(POPULAR_CURRENCIES);
        console.log("💡 No cached data available for multi-currency");
      }
    } catch (error) {
      console.error("Error loading cached rates:", error);
      setCurrencyList(POPULAR_CURRENCIES);
    } finally {
      setMultiCurrencyLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadExchangeRates(), refreshRates()]);
    setRefreshing(false);
  };

  const deleteSavedRate = async (id: string | number) => {
    const success = await deleteRate(id.toString());
    if (!success) {
      Alert.alert("Error", "Failed to delete rate. Please try again.");
    }
  };

  const deleteAllSavedRates = async () => {
    if (savedRates.length === 0) return;

    Alert.alert(t("saved.deleteAll"), t("saved.deleteAllConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("saved.deleteAll"),
        style: "destructive",
        onPress: async () => {
          const success = await deleteAllRates();
          if (!success) {
            Alert.alert(
              "Error",
              "Failed to delete all rates. Please try again."
            );
          }
        },
      },
    ]);
  };

  const handleCalculatorResult = (result: number): void => {
    console.log("Calculator result:", result);
    // You can use this result for currency conversion or other calculations
    Alert.alert("Calculation Result", `Result: ${result}`);
  };

  const renderMainContent = (): React.ReactElement => {
    if (currentView === "converter") {
      return (
        <CurrencyConverter
          onNavigateToDashboard={() => setCurrentView("dashboard")}
        />
      );
    }

    // Dashboard view with widget system
    return (
      <ThemedView style={styles.dashboardContainer}>
        <View
          style={[
            styles.dashboardHeader,
            {
              borderBottomColor: borderColor,
              backgroundColor: surfaceColor,
            },
          ]}
        >
          <View style={styles.headerTopRow}>
            <View style={styles.heroBlock}>
              <Logo size={44} showText={false} />
              <View style={styles.heroTextBlock}>
                <ThemedText
                  type="subtitle"
                  style={[styles.heroTitle, { color: textColor }]}
                >
                  ExRatio
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{ color: textSecondaryColor }}
                  numberOfLines={1}
                >
                  {t("dashboard.features.description")}
                </ThemedText>
              </View>
            </View>
            <BurgerMenu />
          </View>
        </View>

        <ScrollView
          style={styles.dashboardScrollView}
          contentContainerStyle={styles.scrollContentContainer}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View
            style={[
              styles.featuresSection,
              {
                backgroundColor: surfaceColor,
                borderColor: borderColor,
                borderLeftWidth: 4,
                borderLeftColor: primaryColor,
              },
            ]}
          >
            <View
              style={[
                styles.featuresBanner,
                { backgroundColor: surfaceSecondaryColor },
              ]}
            >
              <View
                style={[
                  styles.featuresBannerIcon,
                  { backgroundColor: surfaceColor },
                ]}
              >
                <Ionicons name="sparkles" size={20} color={primaryColor} />
              </View>
              <View style={styles.featuresBannerText}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.featuresBannerTitle, { color: textColor }]}
                >
                  {t("dashboard.features")}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{ color: textSecondaryColor }}
                  numberOfLines={2}
                >
                  {t("dashboard.features.description")}
                </ThemedText>
              </View>
            </View>

            <View
              style={styles.featuresScrollCue}
              accessibilityRole="text"
              accessibilityLabel={t("dashboard.features.scrollHint")}
            >
              <View
                style={[
                  styles.featuresScrollCueIconWrap,
                  { backgroundColor: surfaceColor, borderColor: borderColor },
                ]}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={18}
                  color={primaryColor}
                />
              </View>
              <ThemedText
                type="caption"
                style={[styles.featuresScrollCueText, { color: textSecondaryColor }]}
              >
                {t("dashboard.features.scrollHint")}
              </ThemedText>
            </View>

            <ScrollView
              ref={featuresCarouselRef}
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator
              decelerationRate="fast"
              contentContainerStyle={styles.featuresCarouselContent}
              accessibilityLabel={t("dashboard.features")}
              onScroll={handleFeaturesCarouselScroll}
              scrollEventThrottle={16}
              onLayout={(e) => {
                featuresCarouselViewportW.current = e.nativeEvent.layout.width;
              }}
              onContentSizeChange={(w) => {
                featuresCarouselContentW.current = w;
              }}
            >
              {DASHBOARD_FEATURES.map((row) => (
                <TouchableOpacity
                  key={row.titleKey}
                  activeOpacity={row.action ? 0.88 : 1}
                  onPress={() => row.action && handleFeaturePress(row.action)}
                  style={[
                    styles.featureCarouselCard,
                    {
                      width: featureCardWidth,
                      borderColor: borderColor,
                      backgroundColor: surfaceSecondaryColor,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.featureIconWrap,
                      { backgroundColor: surfaceColor },
                    ]}
                  >
                    <Ionicons name={row.icon} size={24} color={primaryColor} />
                  </View>
                  <ThemedText
                    type="defaultSemiBold"
                    numberOfLines={2}
                    style={[styles.featureCardTitle, { color: textColor }]}
                  >
                    {t(row.titleKey)}
                  </ThemedText>
                  <ThemedText
                    type="caption"
                    numberOfLines={3}
                    style={[styles.featureCardDesc, { color: textSecondaryColor }]}
                  >
                    {t(row.descKey)}
                  </ThemedText>
                  {row.action ? (
                    <View style={styles.featureCardCta}>
                      <ThemedText
                        type="caption"
                        style={{ color: primaryColor, fontWeight: "700" }}
                      >
                        {t("common.more")}
                      </ThemedText>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={primaryColor}
                      />
                    </View>
                  ) : (
                    <View style={styles.featureCardSpacer} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.featuresSwipeHint}
              onPress={showMoreFeatures}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t("dashboard.features.tapNext")}
              accessibilityHint={t("dashboard.features.scrollHint")}
            >
              <Ionicons
                name="chevron-back"
                size={14}
                color={textSecondaryColor}
              />
              <ThemedText
                type="caption"
                style={[styles.featuresSwipeHintText, { color: textSecondaryColor }]}
              >
                {t("dashboard.features.tapNext")}
              </ThemedText>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={textSecondaryColor}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsContainer}>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.quickActionsTitle, { color: textColor }]}
            >
              {t("dashboard.quickActions")}
            </ThemedText>
            <View style={styles.quickActionsGrid}>
              {(
                [
                  {
                    id: "converter" as const,
                    labelKey: "quick.action.converter",
                    icon: "swap-horizontal" as const,
                    active: showConverter,
                    onPress: () => setShowConverter(!showConverter),
                  },
                  {
                    id: "calculator" as const,
                    labelKey: "quick.action.calculator",
                    icon: "calculator-outline" as const,
                    active: showCalculator,
                    onPress: () => setShowCalculator(!showCalculator),
                  },
                  {
                    id: "multi" as const,
                    labelKey: "quick.action.multiCurrency",
                    icon: "stats-chart-outline" as const,
                    active: showMultiCurrency,
                    onPress: () => setShowMultiCurrency(!showMultiCurrency),
                  },
                  {
                    id: "saved" as const,
                    labelKey: "quick.action.savedRates",
                    icon: "bookmark-outline" as const,
                    active: showSavedRates,
                    onPress: () => setShowSavedRates(!showSavedRates),
                  },
                  {
                    id: "alerts" as const,
                    labelKey: "quick.action.rateAlerts",
                    icon: "notifications-outline" as const,
                    active: showRateAlerts,
                    onPress: () => setShowRateAlerts(!showRateAlerts),
                  },
                ] as const
              ).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  style={[
                    styles.quickTile,
                    {
                      backgroundColor: surfaceColor,
                      borderColor: item.active ? primaryColor : borderColor,
                      borderWidth: item.active ? 2 : 1,
                    },
                  ]}
                  onPress={item.onPress}
                >
                  <View
                    style={[
                      styles.quickTileIconWrap,
                      { backgroundColor: surfaceSecondaryColor },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={item.active ? primaryColor : textSecondaryColor}
                    />
                  </View>
                  <ThemedText
                    type="caption"
                    numberOfLines={2}
                    style={[styles.quickTileLabel, { color: textColor }]}
                  >
                    {t(item.labelKey)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Additional Content to Enable Scrolling */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        <QuickActionModal
          visible={showConverter}
          onClose={() => setShowConverter(false)}
          title={t("converter.title")}
        >
          <CurrencyConverter
            onNavigateToDashboard={() => setShowConverter(false)}
            inModal={true}
          />
        </QuickActionModal>

        <QuickActionModal
          visible={showMultiCurrency}
          onClose={() => {
            setShowMultiCurrency(false);
            setMultiCurrencyShowAllTargets(false);
          }}
          title={t("converter.multiCurrency.section")}
        >
          {!currenciesData ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                {t("converter.loadingRates")}
              </ThemedText>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadExchangeRates}
              >
                <ThemedText style={styles.refreshButtonText}>
                  🔄 {t("converter.refreshData")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <MultiCurrencyConverter
              key="multiCurrencyConverter-main"
              currenciesData={currenciesData}
              fromCurrency="USD"
              onFromCurrencyChange={(currency) =>
                console.log("From currency changed to:", currency)
              }
              onClose={() => setShowMultiCurrency(false)}
              inModal={true}
              showAllTargets={multiCurrencyShowAllTargets}
              onShowMore={() => setMultiCurrencyShowAllTargets(true)}
            />
          )}
        </QuickActionModal>

        <QuickActionModal
          visible={showSavedRates}
          onClose={() => {
            setShowSavedRates(false);
            setSavedRatesMaxVisible(4);
          }}
          title={t("saved.title")}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <SavedRates
              savedRates={savedRates}
              showSavedRates={true}
              onToggleVisibility={() => {
                setShowSavedRates(false);
                setSavedRatesMaxVisible(4);
              }}
              onSelectRate={() => {
                setShowSavedRates(false);
                setShowConverter(true);
              }}
              onDeleteRate={deleteSavedRate}
              onDeleteAll={deleteAllSavedRates}
              showMoreEnabled={true}
              onShowMore={() => setSavedRatesMaxVisible(savedRates.length)}
              maxVisibleItems={savedRatesMaxVisible}
              title=""
              containerStyle={{ marginBottom: 0 }}
              inModal={true}
            />
          </ScrollView>
        </QuickActionModal>

        <QuickActionModal
          visible={showRateAlerts}
          onClose={() => setShowRateAlerts(false)}
          title={t("rateAlerts.title")}
        >
          <RateAlertManager
            savedRates={savedRates.map((rate) => ({
              id: rate.id,
              fromCurrency: rate.from_currency,
              toCurrency: rate.to_currency,
              rate: rate.rate,
              timestamp: new Date(rate.created_at).getTime(),
              hasAlert: false,
              alertSettings: undefined,
            }))}
            onRatesUpdate={() => {
              refreshAlerts();
            }}
            currenciesData={currenciesData}
            inModal={true}
          />
        </QuickActionModal>

        <MathCalculator
          visible={showCalculator}
          onClose={() => setShowCalculator(false)}
          onResult={handleCalculatorResult}
          autoCloseAfterCalculation={false}
        />
      </ThemedView>
    );
  };

  // Show onboarding for new users
  if (showOnboarding) {
    return <OnboardingGuide onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }}>
      {renderMainContent()}

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        visible={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        title="Create account to sync and enable alerts"
        message="Sign up to save your data"
        feature="general"
      />
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },

  dashboardHeader: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heroBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
    minWidth: 0,
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  heroTitle: {
    fontSize: 22,
    letterSpacing: -0.4,
  },

  dashboardScrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 88,
  },

  quickActionsContainer: {
    marginTop: 4,
    marginBottom: 28,
  },
  quickActionsTitle: {
    fontSize: 17,
    marginBottom: 14,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  quickTile: {
    width: "48%",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: "flex-start",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickTileIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTileLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  featuresSection: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featuresBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  featuresBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featuresBannerText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  featuresBannerTitle: {
    fontSize: 18,
    letterSpacing: -0.2,
  },
  featuresScrollCue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  featuresScrollCueIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  featuresScrollCueText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  featuresCarouselContent: {
    paddingBottom: 6,
    paddingRight: 6,
    gap: 0,
  },
  featureCarouselCard: {
    marginRight: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 200,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  featureCardTitle: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 6,
    minHeight: 40,
  },
  featureCardDesc: {
    flex: 1,
    lineHeight: 18,
  },
  featureCardCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  featureCardSpacer: {
    height: 28,
    marginTop: 12,
  },
  featuresSwipeHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 4,
  },
  featuresSwipeHintText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 60,
  },

  // State styles
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: "#6366f1",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  // Rate alerts styles
  rateAlertsSection: {
    marginBottom: 24,
  },
  rateAlertsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  rateAlertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rateAlertsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  existingAlerts: {
    marginBottom: 24,
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  alertArrow: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#64748b",
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
  },
  createAlertSection: {
    marginTop: 20,
  },
  alertForm: {
    gap: 16,
  },
  alertFormRow: {
    flexDirection: "row",
    gap: 10,
  },
  alertInput: {
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    color: "#1e293b",
  },
  conditionButton: {
    backgroundColor: "#6366f1",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  conditionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  createAlertButton: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  createAlertButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  showMoreAlertsText: {
    color: "#6366f1",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  alertContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  alertDeleteButton: {
    padding: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 6,
    marginLeft: 12,
  },
  alertDeleteText: {
    fontSize: 14,
  },
  deleteAllInlineButton: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteAllInlineText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  currencyPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
    gap: 8,
  },
  currencyPickerButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },

  // Settings button
  settingsButton: {
    backgroundColor: "rgba(107, 114, 128, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#6b7280",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 10,
    textAlign: "center",
  },
});
