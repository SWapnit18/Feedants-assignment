import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { t } from '../utils/i18n';
import ProfileAvatar from './ProfileAvatar';
import {
  HomeNavIcon,
  ExploreNavIcon,
  CompetitionsNavIcon,
  CreatePlusNavIcon,
} from './MinimalIcons';

export default function BottomNavBar({
  activeTab = 'competitions',
  onTabPress,
  lang = 'ENG',
  userName = 'Swapnit Patel',
  userImage = null,
}) {
  const tabs = [
    { key: 'home', label: t(lang, 'home') },
    { key: 'explore', label: t(lang, 'explore') },
    { key: 'create', label: '', isCenter: true },
    { key: 'competitions', label: t(lang, 'competitions') },
    { key: 'profile', label: t(lang, 'profile'), isAvatar: true },
  ];

  const renderIcon = (tabKey, isActive) => {
    switch (tabKey) {
      case 'home':
        return <HomeNavIcon size={22} isActive={isActive} />;
      case 'explore':
        return <ExploreNavIcon size={22} isActive={isActive} />;
      case 'competitions':
        return <CompetitionsNavIcon size={22} isActive={isActive} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        if (tab.isCenter) {
          return (
            <TouchableOpacity
              key="center-btn"
              style={styles.centerBtnWrapper}
              onPress={() => onTabPress?.('create')}
              activeOpacity={0.85}
              accessibilityLabel="Create Submission"
            >
              <View style={styles.centerBtn}>
                <CreatePlusNavIcon size={22} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          );
        }

        const isActive = tab.key === activeTab;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onTabPress?.(tab.key)}
            activeOpacity={0.7}
            accessibilityLabel={tab.label}
          >
            <View style={styles.iconContainer}>
              {tab.isAvatar ? (
                <ProfileAvatar
                  name={userName}
                  imageUrl={userImage}
                  size={24}
                  fontSize={11}
                  isActive={isActive}
                />
              ) : (
                renderIcon(tab.key, isActive)
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    height: 62,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing(2),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#0F766E',
    fontWeight: '700',
  },
  centerBtnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
  },
  centerBtn: {
    width: 46,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#075A4E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#075A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
});
