import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { Video } from 'expo-av';
import { colors, radius, spacing } from '../theme';

const ORDINALS = { 1: '1st Winner', 2: '2nd Winner', 3: '3rd Winner', 4: '4th Winner', 5: '5th Winner', 6: '6th Winner' };

export default function PreviousWinners({ winners = [] }) {
  const [activeVideo, setActiveVideo] = useState(null);

  if (!winners.length) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Previous Winners</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {winners.map((w, i) => (
          <TouchableOpacity
            key={`${w.name}-${i}`}
            style={styles.item}
            onPress={() => {
              if (w.videoUrl) setActiveVideo(w.videoUrl);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.photoContainer}>
              <Image
                source={{
                  uri:
                    w.photoUrl ||
                    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
                }}
                style={styles.photo}
              />
              <View style={styles.playBadge}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.name} numberOfLines={1}>
                {w.name}
              </Text>
              <Text style={styles.position}>
                {ORDINALS[w.position] || `${w.position}th Winner`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Video preview modal */}
      <Modal visible={!!activeVideo} animationType="fade" transparent={false} onRequestClose={() => setActiveVideo(null)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setActiveVideo(null)}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>
          {activeVideo && (
            <Video
              source={{ uri: activeVideo }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              shouldPlay
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing(3.5),
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: spacing(4),
    letterSpacing: -0.2,
  },
  row: {
    paddingHorizontal: spacing(4),
    paddingTop: spacing(2),
    paddingBottom: spacing(1),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing(1.5),
    marginRight: spacing(3),
    width: 150,
  },
  photoContainer: {
    width: 54,
    height: 54,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(15, 124, 108, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  playIcon: {
    color: '#fff',
    fontSize: 8,
    marginLeft: 1,
  },
  infoCol: {
    flex: 1,
    marginLeft: spacing(2),
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  position: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  video: {
    width: '100%',
    height: 300,
  },
});
