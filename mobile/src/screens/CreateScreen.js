import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import BottomNavBar from '../components/BottomNavBar';
import ProfileAvatar from '../components/ProfileAvatar';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useCreateCompetition } from '../hooks/useCompetitionDetails';

export default function CreateScreen({ navigation }) {
  const { user } = useCurrentUser();
  const createMutation = useCreateCompetition();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Classical Dance');
  const [prizePool, setPrizePool] = useState('150000');
  const [entryFee, setEntryFee] = useState('99');
  const [about, setAbout] = useState('');
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Please enter a competition title');
      return;
    }
    setError('');
    try {
      const res = await createMutation.mutateAsync({
        title: title.trim(),
        category: category.trim() || 'Classical Dance',
        prizePool: Number(prizePool) || 50000,
        entryFee: Number(entryFee) || 0,
        about: about.trim() || undefined,
      });

      setCreated(true);
      setTimeout(() => {
        const newSlug = res?.competition?.slug || res?.competition?.id || 'feedants-classical-dance';
        navigation?.navigate('CompetitionDetails', { competitionId: newSlug });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to create competition');
    }
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
          <ProfileAvatar
            name={user?.name || 'User'}
            imageUrl={user?.profileImage || user?.photoUrl}
            size={34}
            fontSize={15}
          />
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

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Competition Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Feedants Classical Dance Championship"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Classical Dance, Bollywood, Folk"
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>About the Competition (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Describe rules, eligible art forms, judging criteria..."
                value={about}
                onChangeText={setAbout}
                multiline
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]}
              onPress={handleCreate}
              disabled={createMutation.isPending}
              activeOpacity={0.85}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Publish Competition</Text>
              )}
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
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: radius.sm,
    padding: spacing(2.5),
    marginBottom: spacing(3),
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
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
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
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
