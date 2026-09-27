import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { colors, fonts } from '../theme';
import { initials } from '../utils/format';
import { resolveMediaUrl } from '../api/client';

/** Round avatar with an initials fallback when the image is missing or fails to load. */
export function Avatar({ uri, name, size = 40, ring }: { uri?: string | null; name: string; size?: number; ring?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = resolveMediaUrl(uri);
  const dim = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[styles.wrap, dim, ring && styles.ring]}>
      {src && !failed ? (
        <Image
          source={{ uri: src }}
          style={dim}
          contentFit="cover"
          transition={150}
          onError={() => setFailed(true)}
          accessibilityLabel={name}
        />
      ) : (
        <AppText style={{ fontFamily: fonts.semibold, fontSize: size * 0.36 }} color={colors.primaryText}>
          {initials(name)}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ring: { borderWidth: 2, borderColor: colors.primary },
});
