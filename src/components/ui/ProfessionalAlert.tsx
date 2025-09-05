/**
 * SmartLedger - Professional Alert Component
 * Replaces basic Alert.alert with professional styled modals
 * Matches the professional design system from dashboard modals
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Professional Color Palette (matching dashboard)
const COLORS = {
  // Primary Colors
  navy: '#1A237E',
  darkNavy: '#0D47A1',
  accent: '#1976D2',
  accentLight: '#42A5F5',
  accentDark: '#0D47A1',

  // Secondary Colors
  forest: '#2E7D32',
  darkForest: '#1B5E20',

  // Status Colors
  success: '#2E7D32',
  warning: '#F57C00',
  error: '#C62828',
  info: '#0288D1',

  // Light Mode Colors
  surface: '#FFFFFF',
  textPrimary: '#263238',
  textSecondary: '#546E7A',

  // Dark Mode Colors
  darkSurface: '#1E1E1E',
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: '#B0B0B0',

  // Glass Effects
  shadow: 'rgba(0, 0, 0, 0.08)',
};

// ============================================================================
// INTERFACES
// ============================================================================

export interface ProfessionalAlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface ProfessionalAlertOptions {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  buttons?: ProfessionalAlertButton[];
  cancelable?: boolean;
}

interface ProfessionalAlertState extends ProfessionalAlertOptions {
  visible: boolean;
  id: string;
}

// ============================================================================
// ALERT MANAGER
// ============================================================================

class ProfessionalAlertManager {
  private alerts: ProfessionalAlertState[] = [];
  private listeners: ((alerts: ProfessionalAlertState[]) => void)[] = [];

  show(options: ProfessionalAlertOptions): void {
    const alert: ProfessionalAlertState = {
      ...options,
      visible: true,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      buttons: options.buttons || [{ text: 'OK', style: 'default' }],
    };

    this.alerts.push(alert);
    this.notifyListeners();
  }

  hide(id: string): void {
    this.alerts = this.alerts.filter((alert) => alert.id !== id);
    this.notifyListeners();
  }

  hideAll(): void {
    this.alerts = [];
    this.notifyListeners();
  }

  subscribe(listener: (alerts: ProfessionalAlertState[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.alerts]));
  }
}

const alertManager = new ProfessionalAlertManager();

// ============================================================================
// PROFESSIONAL ALERT COMPONENT
// ============================================================================

interface ProfessionalAlertComponentProps {
  alert: ProfessionalAlertState;
  onDismiss: (id: string) => void;
}

const ProfessionalAlertComponent: React.FC<ProfessionalAlertComponentProps> = ({
  alert,
  onDismiss,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get alert type styling
  const getAlertTypeConfig = () => {
    switch (alert.type) {
      case 'success':
        return {
          colors: [COLORS.success, COLORS.darkForest],
          icon: 'checkmark-circle' as const,
          iconColor: 'white',
        };
      case 'warning':
        return {
          colors: [COLORS.warning, '#E65100'],
          icon: 'warning' as const,
          iconColor: 'white',
        };
      case 'error':
        return {
          colors: [COLORS.error, '#B71C1C'],
          icon: 'alert-circle' as const,
          iconColor: 'white',
        };
      case 'confirm':
        return {
          colors: [COLORS.accent, COLORS.accentDark],
          icon: 'help-circle' as const,
          iconColor: 'white',
        };
      default:
        return {
          colors: [COLORS.accent, COLORS.accentDark],
          icon: 'information-circle' as const,
          iconColor: 'white',
        };
    }
  };

  const typeConfig = getAlertTypeConfig();
  const alertIcon = alert.icon || typeConfig.icon;

  const handleButtonPress = (button: ProfessionalAlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onDismiss(alert.id);
  };

  const handleOverlayPress = () => {
    if (alert.cancelable !== false) {
      onDismiss(alert.id);
    }
  };

  return (
    <Modal
      visible={alert.visible}
      transparent
      animationType="fade"
      onRequestClose={() => handleOverlayPress()}
    >
      <TouchableOpacity
        style={[
          styles.modalOverlay,
          {
            backgroundColor: isDark
              ? 'rgba(0, 0, 0, 0.8)'
              : 'rgba(0, 0, 0, 0.5)',
          },
        ]}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}} // Prevent dismiss when tapping modal content
        >
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: isDark ? COLORS.darkSurface : 'white' },
            ]}
          >
            {/* Professional Header with LinearGradient */}
            <LinearGradient
              colors={typeConfig.colors as [string, string]}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons
                    name={alertIcon}
                    size={32}
                    color={typeConfig.iconColor}
                  />
                </View>
                <Text style={styles.modalTitle}>{alert.title}</Text>
              </View>
            </LinearGradient>

            {/* Modal Body */}
            <View
              style={[
                styles.modalBody,
                { backgroundColor: isDark ? COLORS.darkSurface : 'white' },
              ]}
            >
              {alert.message && (
                <Text
                  style={[
                    styles.modalMessage,
                    {
                      color: isDark
                        ? COLORS.darkTextSecondary
                        : COLORS.textSecondary,
                    },
                  ]}
                >
                  {alert.message}
                </Text>
              )}

              {/* Action Buttons */}
              <View
                style={[
                  styles.modalButtons,
                  alert.buttons && alert.buttons.length > 2
                    ? styles.modalButtonsColumn
                    : styles.modalButtonsRow,
                ]}
              >
                {alert.buttons?.map((button, index) => {
                  const isDestructive = button.style === 'destructive';
                  const isCancel = button.style === 'cancel';
                  const isPrimary = button.style === 'default' && !isCancel;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.modalButton,
                        alert.buttons && alert.buttons.length > 2
                          ? styles.modalButtonColumn
                          : styles.modalButtonRow,
                      ]}
                      onPress={() => handleButtonPress(button)}
                    >
                      <LinearGradient
                        colors={
                          isDestructive
                            ? ([COLORS.error, '#B71C1C'] as [string, string])
                            : isPrimary
                              ? (typeConfig.colors as [string, string])
                              : isCancel
                                ? ([COLORS.darkSurface, COLORS.darkSurface] as [
                                    string,
                                    string,
                                  ])
                                : ([COLORS.forest, COLORS.darkForest] as [
                                    string,
                                    string,
                                  ])
                        }
                        style={styles.buttonGradient}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            isCancel && {
                              color: isDark
                                ? COLORS.darkTextPrimary
                                : COLORS.textPrimary,
                            },
                          ]}
                        >
                          {button.text}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================================
// ALERT PROVIDER COMPONENT
// ============================================================================

export const ProfessionalAlertProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [alerts, setAlerts] = useState<ProfessionalAlertState[]>([]);

  React.useEffect(() => {
    const unsubscribe = alertManager.subscribe(setAlerts);
    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    alertManager.hide(id);
  };

  return (
    <>
      {children}
      {alerts.map((alert) => (
        <ProfessionalAlertComponent
          key={alert.id}
          alert={alert}
          onDismiss={handleDismiss}
        />
      ))}
    </>
  );
};

// ============================================================================
// PUBLIC API
// ============================================================================

export const ProfessionalAlert = {
  /**
   * Show a professional alert modal
   */
  alert: (
    title: string,
    message?: string,
    buttons?: ProfessionalAlertButton[],
    options?: {
      cancelable?: boolean;
      type?: 'info' | 'success' | 'warning' | 'error';
      icon?: keyof typeof Ionicons.glyphMap;
    }
  ) => {
    alertManager.show({
      title,
      message,
      buttons,
      ...options,
    });
  },

  /**
   * Show a confirmation dialog
   */
  confirm: (
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    alertManager.show({
      title,
      message,
      type: 'confirm',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Confirm',
          style: 'default',
          onPress: onConfirm,
        },
      ],
    });
  },

  /**
   * Show a success message
   */
  success: (title: string, message?: string, onPress?: () => void) => {
    alertManager.show({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'Great!', style: 'default', onPress }],
    });
  },

  /**
   * Show an error message
   */
  error: (title: string, message?: string, onPress?: () => void) => {
    alertManager.show({
      title,
      message,
      type: 'error',
      buttons: [{ text: 'OK', style: 'default', onPress }],
    });
  },

  /**
   * Show a warning message
   */
  warning: (title: string, message?: string, onPress?: () => void) => {
    alertManager.show({
      title,
      message,
      type: 'warning',
      buttons: [{ text: 'OK', style: 'default', onPress }],
    });
  },

  /**
   * Hide all alerts
   */
  hideAll: () => {
    alertManager.hideAll();
  },
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  modalGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  modalHeader: {
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  modalBody: {
    padding: 25,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButtons: {
    gap: 12,
  },
  modalButtonsRow: {
    flexDirection: 'row',
  },
  modalButtonsColumn: {
    flexDirection: 'column',
  },
  modalButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalButtonRow: {
    flex: 1,
  },
  modalButtonColumn: {
    width: '100%',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ProfessionalAlert;
