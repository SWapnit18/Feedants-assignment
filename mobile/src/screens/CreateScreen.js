import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import BottomNavBar from '../components/BottomNavBar';
import ProfileAvatar from '../components/ProfileAvatar';

export default function CreateScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Classical Dance');
  const [prizePool, setPrizePool] = useState('1500');
  const [entryFee, setEntryFee] = useState('99');
  const [created, setCreated] = useState(false);

  const handleCreate = () => {
    setCreated(true);
    setTimeout(() => {
      navigation?.navigate('CompetitionDetails');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Host Competition (+)</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation?.navigate('Profile')}
          activeOpacity={0.8}
          accessibilityLabel="View Profile"
        >
          <ProfileAvatar name="Swapnit Patel" size={34} fontSize={15} />
        </TouchableOpacity>
      </View>

      {/* Content Form */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {created ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successTitle}>Competition Created!</Text>
            <Text style={styles.successDesc}>Redirecting to competition details...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.formSectionTitle}>Create & Sponsor Talent Contest</Text>
            <Text style={styles.formSectionSub}>
              Set up your verified competition with escrow prize pool and automated judging parameters.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Competition Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Feedants Classical Dance"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Classical Dance"
                value={category}
                onChangeText={setCategory}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Prize Pool (₹)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={prizePool}
                  onChangeText={setPrizePool}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Entry Fee (₹)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={entryFee}
                  onChangeText={setEntryFee}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>Publish Competition</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="create"
        onTabPress={(tab) => {
          if (tab === 'home') navigation?.navigate('Home');
          if (tab === 'explore') navigation?.navigate('Explore');
          if (tab === 'create') return;
          if (tab === 'competitions') navigation?.navigate('CompetitionDetails');
          if (tab === 'profile') navigation?.navigate('Profile');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    paddingRight: spacing(3),
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  content: {
    padding: spacing(4),
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  formSectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing(4),
  },
  inputGroup: {
    marginBottom: spacing(3.5),
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radius.md,
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(2.5),
    fontSize: 13,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: spacing(3),
  },
  submitBtn: {
    backgroundColor: '#075A4E',
    borderRadius: radius.md,
    paddingVertical: spacing(3.5),
    alignItems: 'center',
    marginTop: spacing(3),
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(6),
    alignItems: 'center',
    marginTop: spacing(6),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successIcon: {
    fontSize: 40,
    marginBottom: spacing(2),
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  successDesc: {
    fontSize: 13,
    color: '#047857',
  },
});
