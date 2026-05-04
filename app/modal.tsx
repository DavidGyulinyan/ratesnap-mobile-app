import React from 'react';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Logo from '@/components/Logo';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Logo size={48} showText={true} textSize={26} />
      </View>
      <ThemedText type="title">Settings & Info</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
