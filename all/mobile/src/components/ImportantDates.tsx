import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { AppText } from './AppText';
import { SectionHeader } from './SectionHeader';
import { colors, fonts, radius, spacing } from '../theme';
import { useI18n } from '../i18n';
import { formatShortDate, formatTime } from '../utils/format';
import type { CompetitionDates } from '../api/types';

interface DateCellProps {
  icon: React.ReactNode;
  label: string;
  iso: string;
}

function DateCell({ icon, label, iso }: DateCellProps) {
  const { lang } = useI18n();
  return (
    <View style={styles.cell} accessible accessibilityLabel={`${label}: ${formatShortDate(iso, lang)} ${formatTime(iso)}`}>
      <View style={styles.icon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <AppText variant="caption" numberOfLines={1}>
          {label}
        </AppText>
        <AppText style={styles.date}>{formatShortDate(iso, lang)}</AppText>
        <AppText style={styles.time}>{formatTime(iso)}</AppText>
      </View>
    </View>
  );
}

export function ImportantDates({ dates }: { dates: CompetitionDates }) {
  const { t } = useI18n();
  const c = colors.primaryText;
  return (
    <Card>
      <SectionHeader title={t('importantDates')} />
      <View style={styles.grid}>
        <View style={styles.row}>
          <DateCell icon={<Ionicons name="calendar-outline" size={24} color={c} />} label={t('registerBefore')} iso={dates.registrationClosesAt} />
          <View style={styles.vDivider} />
          <DateCell icon={<Feather name="send" size={22} color={c} />} label={t('submissionStarts')} iso={dates.submissionStartsAt} />
        </View>
        <View style={styles.hDivider} />
        <View style={styles.row}>
          <DateCell icon={<Feather name="upload" size={22} color={c} />} label={t('submissionEnds')} iso={dates.submissionEndsAt} />
          <View style={styles.vDivider} />
          <DateCell icon={<MaterialCommunityIcons name="trophy-outline" size={24} color={c} />} label={t('resultDate')} iso={dates.resultAt} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  row: { flexDirection: 'row' },
  cell: { flex: 1, flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  icon: { width: 30, alignItems: 'center', paddingTop: 4 },
  date: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 19, color: colors.primaryText },
  time: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: colors.text },
  vDivider: { width: 1, backgroundColor: colors.border },
  hDivider: { height: 1, backgroundColor: colors.border },
});
