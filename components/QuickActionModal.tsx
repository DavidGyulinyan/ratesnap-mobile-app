import React from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface QuickActionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Full-screen slide modal — same presentation as MathCalculator.
 */
export default function QuickActionModal({
  visible,
  onClose,
  title,
  children,
}: QuickActionModalProps) {
  const backgroundColor = useThemeColor({}, "background");
  const surfaceSecondaryColor = useThemeColor({}, "surfaceSecondary");
  const textColor = useThemeColor({}, "text");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const borderColor = useThemeColor({}, "border");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor }]}
        edges={["top", "left", "right", "bottom"]}
      >
        <View
          style={[
            styles.header,
            { borderBottomColor: borderColor, backgroundColor },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeButton,
              {
                backgroundColor: surfaceSecondaryColor,
                borderColor,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={textSecondaryColor}
            />
          </TouchableOpacity>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.title, { color: textColor }]}
            numberOfLines={1}
          >
            {title}
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.body}>{children}</View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    flex: 1,
    fontSize: 17,
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 36,
  },
  body: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
});
