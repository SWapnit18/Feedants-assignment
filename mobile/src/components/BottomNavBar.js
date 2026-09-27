import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function BottomNavBar({ activeTab = 'competitions', onTabPress }) {
  const tabs = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'explore', label: 'Explore', icon: '🔍' },
    { key: 'create', label: '', isCenter: true },
    { key: 'competitions', label: 'Competitions', icon: '🏆' },
    { key: 'profile', label: 'Profile', isAvatar: true },
  ];

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
            >
              <View style={styles.centerBtn}>
                <Text style={styles.centerBtnIcon}>+</Text>
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
          >
            {tab.isAvatar ? (
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                }}
                style={[styles.avatarIcon, isActive && styles.avatarActive]}
              />
            ) : (
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                {tab.icon}
              </Text>
            )}
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
  tabIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  avatarIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
  },
  avatarActive: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerBtnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  centerBtn: {
    width: 44,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  centerBtnIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
});
