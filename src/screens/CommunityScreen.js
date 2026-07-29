import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { spacing, borderRadius, shadows } from '../theme';

export default function CommunityScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    try {
      const data = await api.getCommunityPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch {} finally {
      setLoading(false);}
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim()) return Alert.alert('Error', 'Please enter a title');
    try {
      await api.createCommunityPost(newTitle, newContent);
      setShowCreate(false);
      setNewTitle('');
      setNewContent('');
      loadPosts();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const toggleComments = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    setExpandedPost(postId);
    try {
      const data = await api.getPostComments(postId);
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch {}
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;
    try {
      await api.createPostComment(postId, newComment);
      setNewComment('');
      const data = await api.getPostComments(postId);
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch {}
  };

  if (loading) return <LoadingState fullScreen />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Community" subtitle="Learn together">
        <TouchableOpacity onPress={() => setShowCreate(!showCreate)} style={styles.headerBtn}>
          <Ionicons name={showCreate ? 'close' : 'add'} size={24} color="#fff" />
        </TouchableOpacity>
      </Header>

      {showCreate && (
        <Card style={styles.createCard}>
          <TextInput
            style={[styles.createInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Post title..."
            placeholderTextColor={colors.textLight}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={[styles.createInput, styles.createBody, { color: colors.text, borderColor: colors.border }]}
            placeholder="Share a phrase, tip, or question..."
            placeholderTextColor={colors.textLight}
            value={newContent}
            onChangeText={setNewContent}
            multiline
          />
          <Button title="Share with Community" onPress={handleCreatePost} size="sm" gradient />
        </Card>
      )}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.postCard}>
            <View style={styles.postHeader}>
              <Avatar name={item.author_name || item.author?.name} size={36} />
              <View style={styles.postAuthor}>
                <Text style={[styles.authorName, { color: colors.text }]}>{item.author_name || item.author?.name || 'Anonymous'}</Text>
                <Text style={[styles.postDate, { color: colors.textLight }]}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                </Text>
              </View>
              {item.author_verified && <Badge icon="shield-checkmark" title="Native" variant="success" size="sm" />}
            </View>
            <Text style={[styles.postTitle, { color: colors.text }]}>{item.title}</Text>
            {item.content && <Text style={[styles.postContent, { color: colors.textSecondary }]}>{item.content}</Text>}
            <View style={styles.postActions}>
              <TouchableOpacity onPress={() => toggleComments(item.id)} style={styles.actionRow}>
                <Ionicons name="chatbubble-outline" size={18} color={colors.textLight} />
                <Text style={[styles.actionText, { color: colors.textLight }]}>Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionRow}>
                <Ionicons name="heart-outline" size={18} color={colors.textLight} />
                <Text style={[styles.actionText, { color: colors.textLight }]}>{item.likes || 0}</Text>
              </TouchableOpacity>
            </View>
            {expandedPost === item.id && (
              <View style={[styles.commentsSection, { borderTopColor: colors.border }]}>
                {(comments[item.id] || []).map((c, i) => (
                  <View key={i} style={styles.commentRow}>
                    <Avatar name={c.author_name} size={24} />
                    <View style={styles.commentContent}>
                      <Text style={[styles.commentAuthor, { color: colors.text }]}>{c.author_name || 'Anonymous'}</Text>
                      <Text style={[styles.commentText, { color: colors.textSecondary }]}>{c.comment}</Text>
                    </View>
                  </View>
                ))}
                <View style={styles.commentInputRow}>
                  <TextInput
                    style={[styles.commentInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                    placeholder="Add a comment..."
                    placeholderTextColor={colors.textLight}
                    value={newComment}
                    onChangeText={setNewComment}
                  />
                  <TouchableOpacity onPress={() => handleAddComment(item.id)}>
                    <Ionicons name="send" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState icon="people" title="No posts yet" message="Be the first to share something with the community!" actionLabel="Create Post" onAction={() => setShowCreate(true)} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBtn: { padding: spacing.sm },
  createCard: { margin: spacing.xl, marginTop: 0, marginBottom: spacing.md },
  createInput: { borderWidth: 1.5, borderRadius: borderRadius.sm, padding: spacing.md, marginBottom: spacing.md, fontSize: 15 },
  createBody: { minHeight: 80, textAlignVertical: 'top' },
  list: { padding: spacing.xl, paddingTop: 0 },
  postCard: { marginBottom: spacing.md },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  postAuthor: { flex: 1, marginLeft: spacing.md },
  authorName: { fontSize: 14, fontWeight: '600' },
  postDate: { fontSize: 11, marginTop: 2 },
  postTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.sm },
  postContent: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  postActions: { flexDirection: 'row', gap: spacing.xl },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionText: { fontSize: 12, fontWeight: '500' },
  commentsSection: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1 },
  commentRow: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.sm },
  commentContent: { flex: 1 },
  commentAuthor: { fontSize: 13, fontWeight: '600' },
  commentText: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  commentInput: { flex: 1, borderWidth: 1.5, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 13 },
});
