import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { UpgradeOption } from '../game/state/types';

interface Props {
  visible: boolean;
  choices: UpgradeOption[];
  onChoose: (choice: UpgradeOption) => void;
}

export function LevelUpModal({ visible, choices, onChoose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>SEVİYE ATLADI!</Text>
          <Text style={styles.subtitle}>Bir yetenek seç:</Text>
          {choices.map(choice => (
            <TouchableOpacity
              key={choice.id}
              style={styles.card}
              onPress={() => onChoose(choice)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>{choice.label}</Text>
              <Text style={styles.cardDesc}>{choice.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#3a3a5c',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffe066',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaaacc',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#252545',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4a4a7c',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#9999bb',
  },
});
