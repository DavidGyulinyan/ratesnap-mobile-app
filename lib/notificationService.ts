import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// Dynamic imports to prevent Expo Go errors during module load
let Notifications: any = null;
let Device: any = null;

const loadNotificationModules = async () => {
  if (!Notifications || !Device) {
    try {
      Notifications = await import('expo-notifications');
      Device = await import('expo-device');
      
      // Configure notification behavior after dynamic load
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (error) {
      console.log('⚠️ Failed to load notification modules:', error);
    }
  }
  return { Notifications, Device };
};

export interface RateAlert {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  targetRate: number;
  direction: 'above' | 'below' | 'equals';
  isActive: boolean;
  lastChecked?: number;
  triggered?: boolean;
  message?: string;
}

export interface NotificationSchedule {
  id: string;
  rateId: string;
  triggerTime: number;
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken?: string;
  private scheduledNotifications: Map<string, string> = new Map();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // Skip notifications on web platform
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform detected - using browser notifications if available');
        return true;
      }

      // Load notification modules dynamically
      const { Notifications: notificationModule, Device: deviceModule } = await loadNotificationModules();
      if (!notificationModule || !deviceModule) {
        console.log('⚠️ Notifications module not available - using safe mode');
        return false;
      }

      // Additional safety check
      if (!deviceModule.isDevice) {
        console.log('📱 Notifications are not available on a device. Please use a physical device.');
        return false;
      }

      try {
        // Use local notification permissions (works in Expo Go)
        const { status: existingStatus } = await notificationModule.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await notificationModule.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('❌ Notification permissions not granted - continuing with safe mode');
          return false; // Allow app to continue without notifications
        }

        console.log('✅ Local notification permissions granted');
        return true;
      } catch (notifError) {
        console.error('❌ Notification permission API error - using safe mode:', notifError);
        return false; // Allow app to continue without notifications
      }
    } catch (error) {
      console.error('❌ Error requesting notification permissions - using safe mode:', error);
      return false; // Allow app to continue without notifications
    }
  }

  async getPushToken(): Promise<string | undefined> {
    try {
      // Skip push token generation on web platform
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform detected - push tokens not needed');
        return undefined;
      }

      // Load notification modules dynamically
      const { Notifications: notificationModule } = await loadNotificationModules();
      if (!notificationModule) {
        console.log('⚠️ Notifications module not available');
        return undefined;
      }

      // Check if we're in Expo Go (SDK 53+ where push tokens are removed)
      try {
        // This will throw in Expo Go SDK 53+ when trying to get push tokens
        const token = (await notificationModule.getExpoPushTokenAsync()).data;
        this.expoPushToken = token;
        console.log('📱 Expo push token obtained (development build):', token);
        return token;
      } catch (pushTokenError) {
        console.log('📱 Expo Go detected or push tokens unavailable - using local notifications only');
        return undefined; // Return undefined instead of throwing
      }
    } catch (error) {
      console.log('⚠️ Push token generation failed - continuing without push notifications:', error);
      return undefined; // Return undefined instead of throwing
    }
  }

  async scheduleRateAlert(alert: RateAlert): Promise<string | null> {
    try {
      if (!await this.requestPermissions()) {
        return null;
      }

      // Skip scheduling on web platform
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform detected - skipping scheduled alerts for mobile app');
        return null;
      }

      // Check if the alert should trigger immediately
      const shouldTrigger = await this.checkAlertTrigger(alert);
      
      if (shouldTrigger) {
        await this.sendImmediateAlert(alert);
        return null; // No need to schedule since it's triggered
      }

      // Schedule periodic check (every hour)
      const triggerTime = Date.now() + (60 * 60 * 1000); // 1 hour from now
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 ExRatio Alert',
          body: `Monitoring ${alert.fromCurrency} to ${alert.toCurrency}`,
          data: {
            type: 'rate_check',
            alertId: alert.id,
            rateId: alert.id,
          },
          sound: 'default',
        },
        trigger: {
          seconds: 60 * 60, // Check every hour
          repeats: true
        } as any,
      });

      this.scheduledNotifications.set(alert.id, notificationId);
      console.log(`🔔 Scheduled rate alert: ${alert.fromCurrency} → ${alert.toCurrency} (ID: ${notificationId})`);
      
      // Save the scheduled notification to local storage for persistence
      const scheduledData = await this.getScheduledNotifications();
      scheduledData[alert.id] = {
        id: notificationId,
        rateId: alert.id,
        triggerTime: triggerTime,
      };
      await AsyncStorage.setItem('scheduledRateAlerts', JSON.stringify(scheduledData));

      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling rate alert:', error);
      return null;
    }
  }

  async cancelRateAlert(alertId: string): Promise<void> {
    try {
      const notificationId = this.scheduledNotifications.get(alertId);
      
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        this.scheduledNotifications.delete(alertId);
        console.log(`🚫 Cancelled rate alert: ${alertId}`);
      }

      // Remove from storage
      const scheduledData = await this.getScheduledNotifications();
      delete scheduledData[alertId];
      await AsyncStorage.setItem('scheduledRateAlerts', JSON.stringify(scheduledData));
    } catch (error) {
      console.error('❌ Error cancelling rate alert:', error);
    }
  }

  async sendImmediateAlert(alert: RateAlert): Promise<void> {
    try {
      if (!await this.requestPermissions()) {
        return;
      }

      // Skip immediate alerts on web platform
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform detected - skipping immediate alerts for mobile app');
        return;
      }

      const currentRate = await this.getCurrentRate(alert.fromCurrency, alert.toCurrency);
      const isTriggered = this.evaluateAlertTrigger(alert, currentRate);

      if (isTriggered) {
        const message = `🎯 ${alert.fromCurrency} → ${alert.toCurrency} is now ${currentRate.toFixed(4)}!`;
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚀 Rate Alert Triggered!',
            body: message,
            data: {
              type: 'rate_triggered',
              alertId: alert.id,
              fromCurrency: alert.fromCurrency,
              toCurrency: alert.toCurrency,
              currentRate: currentRate,
              targetRate: alert.targetRate,
              direction: alert.direction,
            },
            sound: 'default',
          },
          trigger: null, // Immediate
        });

        console.log(`🚨 Alert sent: ${message}`);
        
        // Mark alert as triggered
        const updatedAlert = { ...alert, triggered: true, message };
        await this.saveAlert(updatedAlert);
      }
    } catch (error) {
      console.error('❌ Error sending immediate alert:', error);
    }
  }

  private async checkAlertTrigger(alert: RateAlert): Promise<boolean> {
    try {
      const currentRate = await this.getCurrentRate(alert.fromCurrency, alert.toCurrency);
      return this.evaluateAlertTrigger(alert, currentRate);
    } catch (error) {
      console.error('❌ Error checking alert trigger:', error);
      return false;
    }
  }

  private evaluateAlertTrigger(alert: RateAlert, currentRate: number): boolean {
    const threshold = alert.targetRate;
    const tolerance = 0.0001; // Small tolerance for floating point comparison

    switch (alert.direction) {
      case 'above':
        return currentRate > threshold + tolerance;
      case 'below':
        return currentRate < threshold - tolerance;
      case 'equals':
        return Math.abs(currentRate - threshold) <= tolerance;
      default:
        return false;
    }
  }

  // Public method for testing
  public testEvaluateAlertTrigger(alert: RateAlert, currentRate: number): boolean {
    return this.evaluateAlertTrigger(alert, currentRate);
  }

  private async getCurrentRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const cachedData = await AsyncStorage.getItem('cachedExchangeRates');
      if (cachedData) {
        const data = JSON.parse(cachedData);
        const fromRate = data.conversion_rates[fromCurrency];
        const toRate = data.conversion_rates[toCurrency];
        
        if (fromRate && toRate) {
          return toRate / fromRate;
        }
      }

      // Fallback to API if no cache
      // This would require the exchange rate service to be called here
      throw new Error('No cached rates available');
    } catch (error) {
      console.error('❌ Error getting current rate:', error);
      throw error;
    }
  }

  private async getScheduledNotifications(): Promise<{[key: string]: NotificationSchedule}> {
    try {
      const stored = await AsyncStorage.getItem('scheduledRateAlerts');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return {};
    }
  }

  // Public method for testing
  public async testSaveAlert(alert: RateAlert): Promise<void> {
    return this.saveAlert(alert);
  }

  private async saveAlert(alert: RateAlert): Promise<void> {
    try {
      const alerts = await this.getSavedAlerts();
      alerts[alert.id] = alert;
      await AsyncStorage.setItem('rateAlerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('❌ Error saving alert:', error);
    }
  }

  // Public method for testing
  public async testGetSavedAlerts(): Promise<{[key: string]: RateAlert}> {
    return this.getSavedAlerts();
  }

  private async getSavedAlerts(): Promise<{[key: string]: RateAlert}> {
    try {
      const stored = await AsyncStorage.getItem('rateAlerts');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ Error getting saved alerts:', error);
      return {};
    }
  }

  async setupNotificationListeners(): Promise<void> {
    try {
      // Skip setup on web platform
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform detected - skipping notification listeners');
        return;
      }

      // Load notification modules dynamically
      const { Notifications: notificationModule } = await loadNotificationModules();
      if (!notificationModule) {
        console.log('⚠️ Notifications module not available for listeners');
        return;
      }

      // Handle notification received while app is in foreground
      const receivedSubscription = notificationModule.addNotificationReceivedListener((notification: any) => {
        try {
          console.log('📱 Notification received:', notification);
          const data = notification.request.content.data as any;
          
          if (data?.type === 'rate_check') {
            this.handleBackgroundRateCheck(data.alertId);
          }
        } catch (listenerError) {
          console.error('❌ Error in notification received listener:', listenerError);
        }
      });

      // Handle notification tapped
      const responseSubscription = notificationModule.addNotificationResponseReceivedListener((response: any) => {
        try {
          console.log('👆 Notification response:', response);
          const data = response.notification.request.content.data as any;
          
          if (data?.type === 'rate_triggered') {
            this.handleRateAlertTapped(data);
          }
        } catch (listenerError) {
          console.error('❌ Error in notification response listener:', listenerError);
        }
      });

      console.log('✅ Notification listeners setup completed');
    } catch (error) {
      console.error('❌ Error setting up notification listeners:', error);
    }
  }

  private async handleBackgroundRateCheck(alertId: string): Promise<void> {
    try {
      const alerts = await this.getSavedAlerts();
      const alert = alerts[alertId];
      
      if (alert && alert.isActive) {
        await this.sendImmediateAlert(alert);
      }
    } catch (error) {
      console.error('❌ Error handling background rate check:', error);
    }
  }

  private async handleRateAlertTapped(data: any): Promise<void> {
    try {
      // You could navigate to specific screens here
      console.log('🔗 Rate alert tapped:', data);
      
      // Update alert to mark it as triggered
      const alerts = await this.getSavedAlerts();
      if (alerts[data.alertId]) {
        alerts[data.alertId].triggered = false; // Reset for future alerts
        await AsyncStorage.setItem('rateAlerts', JSON.stringify(alerts));
      }
    } catch (error) {
      console.error('❌ Error handling rate alert tap:', error);
    }
  }

  private openNotificationSettings(): void {
    // This would open device notification settings
    console.log('📱 Opening notification settings...');
  }

  // Load all scheduled notifications on app startup
  async loadScheduledNotifications(): Promise<void> {
    try {
      // Skip loading on web platform
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform detected - skipping scheduled notifications for mobile app');
        return;
      }

      const scheduledData = await this.getScheduledNotifications();
      console.log(`📋 Loaded ${Object.keys(scheduledData).length} scheduled notifications`);
      
      // Note: Unfortunately, we can't reschedule notifications after app restart
      // This is a limitation of Expo's notification system
      // Users will need to reschedule alerts after app restart
    } catch (error) {
      console.error('❌ Error loading scheduled notifications:', error);
    }
  }

  // Clean up all notifications
  async cleanup(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications.clear();
      console.log('🧹 Cleaned up all notifications');
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
    }
  }

  // Get notification statistics
  async getNotificationStats(): Promise<{
    scheduledCount: number;
    activeAlerts: number;
    triggeredAlerts: number;
  }> {
    try {
      const scheduledData = await this.getScheduledNotifications();
      const alerts = await this.getSavedAlerts();
      
      const activeAlerts = Object.values(alerts).filter(alert => alert.isActive).length;
      const triggeredAlerts = Object.values(alerts).filter(alert => alert.triggered).length;
      
      return {
        scheduledCount: Object.keys(scheduledData).length,
        activeAlerts,
        triggeredAlerts,
      };
    } catch (error) {
      console.error('❌ Error getting notification stats:', error);
      return { scheduledCount: 0, activeAlerts: 0, triggeredAlerts: 0 };
    }
  }
}

export default NotificationService.getInstance();