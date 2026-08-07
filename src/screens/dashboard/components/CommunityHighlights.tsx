import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { spacing, borderRadius } from '../../../theme';

interface CommunityHighlightsProps {
  onOpenCommunity?: () => void;
}

export function CommunityHighlights({ onOpenCommunity }: CommunityHighlightsProps) {
  const { colors, getAnimationDuration } = useTheme();
  const { communityPosts } = useDashboardData();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
  }, [getAnimationDuration]);

  const posts = (Array.isArray(communityPosts) && communityPosts.length > 0
    ? communityPosts.slice(0, 3)
    : [
        { id: 'post_1', user_name: 'Maria C.', content: 'Unsa ang tabang nako? Need help saying "I need help" in Bisaya!', likes: 12 },
        { id: 'post_2', user_name: 'Jun B.', content: 'Palihog ug tudlo sa akong Bisaya — want a native to check my sentences.', likes: 8 },
        { id: 'post_3', user_name: 'Ana L.', content: 'Just finished my first market conversation. Salamat kaayo!', likes: 21 },
      ]);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.softGreen }]}>
            <Ionicons name="people" size={18} color={colors.success} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Community Highlights</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Learners around you</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onOpenCommunity} activeOpacity={0.7}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.postsRow}>
        {posts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onOpenCommunity}
            activeOpacity={0.85}
          >
            <View style={styles.postUser}>
              <View style={[styles.postAvatar, { backgroundColor: colors.softPurple }]}>
                <Ionicons name="person" size={14} color={colors.primary} />
              </View>
              <Text style={[styles.postUserText, { color: colors.textSecondary }]}>{post.user_name}</Text>
            </View>
            <Text style={[styles.postContent, { color: colors.text }]} numberOfLines={3}>
              {post.content}
            </Text>
            <View style={styles.postFooter}>
              <Ionicons name="heart" size={13} color={colors.error} />
              <Text style={[styles.postLikes, { color: colors.textLight }]}>{post.likes}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  seeAll: { fontSize: 13, fontWeight: '600' },
  postsRow: { gap: spacing.md },
  postCard: { width: 240, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, gap: spacing.sm },
  postUser: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  postAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  postUserText: { fontSize: 12, fontWeight: '600' },
  postContent: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postLikes: { fontSize: 12, fontWeight: '600' },
});
