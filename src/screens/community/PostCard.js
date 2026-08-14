import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { POST_TYPES } from '../../services/communityMock';
import { spacing, borderRadius } from '../../theme';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  if (diff < 3600e3) return `${Math.max(1, Math.round(diff / 60000))}m`;
  if (diff < 86400e3) return `${Math.round(diff / 3600e3)}h`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function PostCard({
  post, liked, saved, translated, expanded, comments = [],
  onToggleComments, onAddComment, onToggleLike, onToggleSave, onToggleTranslate,
  onMarkHelpful, onReport,
}) {
  const { colors, isDark } = useTheme();
  const [newComment, setNewComment] = useState('');
  const type = POST_TYPES[post.type] || POST_TYPES.discussion;
  const isQuestion = post.type === 'question' || post.type === 'translation' || post.type === 'pronunciation';

  const handleComment = () => {
    onAddComment(post.id, newComment);
    setNewComment('');
  };

  const confirmReport = () => {
    Alert.alert('Report post', 'Report this post as spam or inappropriate?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => onReport && onReport(post) },
    ]);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Avatar name={post.author_name} size={36} />
        <View style={styles.authorInfo}>
          <View style={styles.authorRow}>
            <Text style={[styles.authorName, { color: colors.text }]}>{post.author_name}</Text>
            {post.author_verified && <Badge icon="shield-checkmark" title="Native" variant="success" size="sm" />}
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.typePill, { backgroundColor: type.color + '18' }]}>
              <Ionicons name={type.icon} size={10} color={type.color} />
              <Text style={[styles.typeText, { color: type.color }]}>{type.label}</Text>
            </View>
            <Text style={[styles.timeText, { color: colors.textLight }]}>{formatDate(post.created_at)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={confirmReport} style={styles.reportBtn} accessibilityRole="button" accessibilityLabel="Report post">
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={[styles.nativeText, { color: colors.text }]}>{post.native}</Text>
        {translated ? (
          <>
            <Text style={[styles.englishText, { color: colors.textSecondary }]}>{post.english}</Text>
            {post.bisaya_translation && (
              <View style={[styles.aiBox, { backgroundColor: colors.primary + '0D' }]}>
                <Ionicons name="sparkles" size={13} color={colors.primary} />
                <Text style={[styles.aiText, { color: colors.primary }]}>
                  {post.bisaya_translation}
                </Text>
              </View>
            )}
          </>
        ) : (
          <Text style={[styles.englishText, { color: colors.textSecondary }]}>
            {post.english}
          </Text>
        )}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagRow}>
            {post.tags.map((t) => (
              <View key={t} style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>#{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        <TouchableOpacity onPress={() => onToggleComments && onToggleComments(post.id)} style={styles.action}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textLight} />
          <Text style={[styles.actionText, { color: colors.textLight }]}>{post.comments || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onToggleLike && onToggleLike(post.id)} style={styles.action}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? colors.error : colors.textLight} />
          <Text style={[styles.actionText, { color: liked ? colors.error : colors.textLight }]}>
            {(post.likes || 0) + (liked ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        {isQuestion && (
          <TouchableOpacity onPress={() => onMarkHelpful && onMarkHelpful(post)} style={styles.action}>
            <Ionicons name="thumbs-up-outline" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Helpful</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => onToggleTranslate && onToggleTranslate(post.id)} style={styles.action}>
          <Ionicons name="language" size={18} color={translated ? colors.primary : colors.textLight} />
          <Text style={[styles.actionText, { color: translated ? colors.primary : colors.textLight }]}>
            {translated ? 'Translate' : 'English'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onToggleSave && onToggleSave(post.id)} style={styles.action}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? colors.accent : colors.textLight} />
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={[styles.comments, { borderTopColor: colors.border }]}>
          {comments.map((c) => (
            <View key={c.id} style={styles.comment}>
              <Avatar name={c.author_name} size={24} />
              <View style={styles.commentBody}>
                <Text style={[styles.commentAuthor, { color: colors.text }]}>{c.author_name}</Text>
                <Text style={[styles.commentText, { color: colors.textSecondary }]}>{c.comment}</Text>
              </View>
              {c.is_helpful && (
                <Badge icon="checkmark-circle" title="Helpful" variant="success" size="sm" />
              )}
            </View>
          ))}
          <View style={styles.commentInputRow}>
            <TextInput
              id="comment"
              name="comment"
              testID="comment-input"
              style={[styles.commentInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.surface : colors.surfaceSecondary }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textLight}
              value={newComment}
              onChangeText={setNewComment}
              onSubmitEditing={handleComment}
              returnKeyType="send"
              autoComplete="off"
            />
            <TouchableOpacity onPress={handleComment} style={styles.sendBtn} accessibilityRole="button" accessibilityLabel="Send comment">
              <Ionicons name="send" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  authorInfo: { flex: 1, marginLeft: spacing.md },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  authorName: { fontSize: 14, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  typePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.full },
  typeText: { fontSize: 10, fontWeight: '800' },
  timeText: { fontSize: 11, fontWeight: '500' },
  reportBtn: { padding: 4 },
  body: { marginBottom: spacing.md },
  nativeText: { fontSize: 17, fontWeight: '700', lineHeight: 22, marginBottom: spacing.xs },
  englishText: { fontSize: 14, lineHeight: 20, marginBottom: spacing.sm },
  aiBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, borderRadius: borderRadius.md, padding: spacing.sm, marginBottom: spacing.sm },
  aiText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.full },
  tagText: { fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: spacing.sm },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionText: { fontSize: 12, fontWeight: '600' },
  comments: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  comment: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.sm, alignItems: 'flex-start' },
  commentBody: { flex: 1 },
  commentAuthor: { fontSize: 13, fontWeight: '600' },
  commentText: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  commentInput: { flex: 1, borderWidth: 1.5, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 13 },
  sendBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
