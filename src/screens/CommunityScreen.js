import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Alert, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import BottomSheet from '../components/BottomSheet';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { spacing, borderRadius, shadows } from '../theme';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TABS = [
  { key: 'feed', label: 'Feed', icon: 'newspaper-outline' },
  { key: 'challenges', label: 'Challenges', icon: 'trophy-outline' },
  { key: 'ask', label: 'Ask Native', icon: 'help-circle-outline' },
  { key: 'phrases', label: 'Phrases', icon: 'chatbubble-ellipses-outline' },
  { key: 'culture', label: 'Culture', icon: 'compass-outline' },
  { key: 'events', label: 'Events', icon: 'calendar-outline' },
  { key: 'discussions', label: 'Discussions', icon: 'git-merge-outline' },
  { key: 'leaderboard', label: 'Leaderboard', icon: 'podium-outline' },
];

const MOCK_CHALLENGES = [
  { id: 'c1', title: '10 Phrases in a Day', desc: 'Learn and post 10 new Bisaya phrases you practiced today.', xp: 100, icon: 'rocket', color: '#3B82F6' },
  { id: 'c2', title: 'Speak a Full Sentence', desc: 'Record yourself saying a complete Bisaya sentence out loud.', xp: 150, icon: 'mic', color: '#10B981' },
  { id: 'c3', title: 'Shadow a Native Speaker', desc: 'Pick any video, shadow the speaker, and share your take.', xp: 200, icon: 'headset', color: '#8B5CF6' },
  { id: 'c4', title: '3-Day Streak', desc: 'Maintain a 3-day learning streak this week.', xp: 300, icon: 'flame', color: '#F59E0B' },
];

const MOCK_QUESTIONS = [
  { id: 'q1', user: 'Leo M.', text: 'Unsa ang difference sa "kumusta" ug "kamusta"?', english: 'What is the difference between kumusta and kamusta?', helpful: 18, voice: true },
  { id: 'q2', user: 'Ana R.', text: 'Paano sabihin "I used to live here" sa Bisaya?', english: 'How do you say "I used to live here" in Bisaya?', helpful: 12, voice: false },
  { id: 'q3', user: 'Jose T.', text: 'Naa ko problema sa pag-pronounce sa "palihog".', english: 'I have trouble pronouncing "palihog".', helpful: 9, voice: true },
];

const MOCK_PHRASES = [
  { id: 'p1', native: 'Balik ra ta', english: "We'll be back / See you later", user: 'CebuGirl99', color: '#14B8A6' },
  { id: 'p2', native: 'Puhon', english: 'God willing / someday', user: 'BisayaBuddy', color: '#8B5CF6' },
  { id: 'p3', native: 'Way sapayan', english: 'No worries / it\'s fine', user: 'JunB', color: '#F59E0B' },
  { id: 'p4', native: 'Kabalo na ko', english: 'I already know', user: 'MariM', color: '#3B82F6' },
];

const MOCK_CULTURE = [
  { id: 'cu1', title: 'Sinulog Festival', text: 'Cebu\'s grandest festival every January honors the Santo Niño with street dancing and music.', icon: 'color-palette', color: '#EC4899' },
  { id: 'cu2', title: 'Bisaya Po & Opo', text: 'Showing respect to elders using "po" and "opo" is deeply ingrained in Filipino culture.', icon: 'hand-left', color: '#10B981' },
  { id: 'cu3', title: 'Barkada Culture', text: 'Filipinos value "barkada" (friend group) deeply — social life revolves around shared meals and trips.', icon: 'people', color: '#F59E0B' },
  { id: 'cu4', title: 'Bayanihan', text: 'A communal spirit where neighbors help each other move houses or complete big tasks together.', icon: 'home', color: '#3B82F6' },
];

const MOCK_EVENTS = [
  { id: 'e1', title: 'Weekly Language Exchange', date: 'Every Saturday · 4PM', location: 'Cebu City Hall Plaza', icon: 'chatbubbles', color: '#14B8A6' },
  { id: 'e2', title: 'Bisaya Karaoke Night', date: 'Friday · 8PM', location: 'KTV Lounge, IT Park', icon: 'musical-notes', color: '#EC4899' },
  { id: 'e3', title: 'Food Trip: Carbon Market', date: 'Next Sunday · 9AM', location: 'Carbon Market, Cebu', icon: 'restaurant', color: '#F59E0B' },
];

const MOCK_DISCUSSIONS = [
  { id: 'd1', title: 'Best way to learn Bisaya fast?', replies: 24, author: 'LearnerX' },
  { id: 'd2', title: 'How to remember verb focus?', replies: 16, author: 'MariM' },
  { id: 'd3', title: 'Suggestions for Cebuano movies?', replies: 31, author: 'AnnaL' },
  { id: 'd4', title: 'Difference: Bisaya vs Cebuano?', replies: 12, author: 'JoeD' },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'MariM', xp: 12450, streak: 21 },
  { rank: 2, name: 'JunB', xp: 11320, streak: 18 },
  { rank: 3, name: 'CebuGirl99', xp: 9870, streak: 15 },
  { rank: 4, name: 'LearnerX', xp: 8450, streak: 12 },
  { rank: 5, name: 'AnnaL', xp: 7910, streak: 10 },
];

const MOCK_POSTS = [
  {
    id: 'p1', title: 'Kumusta vs Kamusta — which is correct?', author_name: 'MariM', author_verified: true,
    content: 'Both are widely used! "Kumusta" is closer to the Spanish "¿cómo está?" while "Kamusta" is the everyday informal spelling you will hear on the streets of Cebu.',
    likes: 34, created_at: new Date(Date.now() - 3600e3).toISOString(),
  },
  {
    id: 'p2', title: 'Practiced "Palihug" for 20 minutes today!', author_name: 'LearnerX',
    content: 'The "h" in the middle trips me up. Saying it slowly helps — pa-LIH-oog. Native speakers understood me at the market!',
    likes: 18, created_at: new Date(Date.now() - 7200e3).toISOString(),
  },
  {
    id: 'p3', title: 'Daily phrase: "Way sapayan"', author_name: 'CebuGirl99', author_verified: true,
    content: 'Literal: "no problem/for nothing". Use it when someone says salamat — reply "Way sapayan!" (No worries!).',
    likes: 52, created_at: new Date(Date.now() - 10800e3).toISOString(),
  },
  {
    id: 'p4', title: 'Anyone want to do a weekly language exchange in Cebu?', author_name: 'JunB',
    content: 'I am a native Bisaya speaker learning English. Happy to trade conversations every Saturday morning at IT Park!',
    likes: 27, created_at: new Date(Date.now() - 21600e3).toISOString(),
  },
  {
    id: 'p5', title: 'Sinulog is coming — here is how to say "Happy Fiesta!"', author_name: 'Ana R.',
    content: '"Malipayong pista!" Say it with a big smile. Locals will love you for it.',
    likes: 61, created_at: new Date(Date.now() - 43200e3).toISOString(),
  },
];

export default function CommunityScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [usingSample, setUsingSample] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [translated, setTranslated] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [liked, setLiked] = useState({});
  const [helpful, setHelpful] = useState({});
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [showAskSheet, setShowAskSheet] = useState(false);
  const [askText, setAskText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  async function loadPosts() {
    setLoadError(false);
    try {
      const data = await api.getCommunityPosts();
      setPosts(Array.isArray(data) ? data : []);
      setUsingSample(false);
    } catch {
      if (!posts.length) {
        setPosts(MOCK_POSTS);
        setUsingSample(true);
      }
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPosts(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim()) return Alert.alert('Missing Title', 'Please enter a title for your post.');
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

  const openCreateSheet = () => {
    setNewTitle('');
    setNewContent('');
    setShowCreate(true);
  };

  const toggleComments = async (postId) => {
    if (expandedPost === postId) { setExpandedPost(null); return; }
    setExpandedPost(postId);
    try {
      const data = await api.getPostComments(postId);
      setComments((prev) => ({ ...prev, [postId]: data }));
    } catch {}
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;
    try {
      await api.createPostComment(postId, newComment);
      setNewComment('');
      const data = await api.getPostComments(postId);
      setComments((prev) => ({ ...prev, [postId]: data }));
    } catch {}
  };

  const handleShare = async (title, content) => {
    try {
      await Share.share({ title, message: `${title}\n${content || ''}\n— shared from SultiAI` });
    } catch {}
  };

  const submitQuestion = () => {
    if (!askText.trim()) return;
    setQuestions((prev) => [
      { id: `q_${Date.now()}`, user: user?.fullname?.split(' ')[0] || 'You', text: askText, english: 'New question', helpful: 0, voice: false },
      ...prev,
    ]);
    setAskText('');
    setShowAskSheet(false);
    Alert.alert('Question posted', 'Native speakers have been notified to help.');
  };

  const renderSegments = () => (
    <View style={[styles.segmentBar, { borderBottomColor: colors.border }]}>
      <View style={styles.segmentRow}>
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.segmentChip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setActiveTab(t.key)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Ionicons name={t.icon} size={14} color={active ? '#fff' : colors.textSecondary} />
              <Text style={[styles.segmentText, { color: active ? '#fff' : colors.textSecondary }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderFeed = () => (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id?.toString()}
      contentContainerStyle={styles.list}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={
        usingSample ? (
          <View style={[styles.sampleBanner, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.primary} />
            <Text style={[styles.sampleBannerText, { color: colors.primary }]}>Showing sample posts — connect to the server to see the live community feed.</Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => {
        const isTranslated = !!translated[item.id];
        const isBookmarked = !!bookmarked[item.id];
        const isLiked = !!liked[item.id];
        return (
          <Card style={styles.postCard}>
            <View style={styles.postHeader}>
              <Avatar name={item.author_name || item.author?.name} size={36} />
              <View style={styles.postAuthor}>
                <Text style={[styles.authorName, { color: colors.text }]}>
                  {item.author_name || item.author?.name || 'Anonymous'}
                </Text>
                <Text style={[styles.postDate, { color: colors.textLight }]}>
                  {formatDate(item.created_at)}
                </Text>
              </View>
              {item.author_verified && <Badge icon="shield-checkmark" title="Native" variant="success" size="sm" />}
            </View>
            <Text style={[styles.postTitle, { color: colors.text }]}>{item.title}</Text>
            {item.content && (
              <Text style={[styles.postContent, { color: colors.textSecondary }]}>
                {isTranslated ? item.bisaya_translation || item.content : item.content}
              </Text>
            )}
            {isTranslated && (
              <View style={[styles.translateTag, { backgroundColor: colors.primary + '12' }]}>
                <Ionicons name="language" size={12} color={colors.primary} />
                <Text style={[styles.translateTagText, { color: colors.primary }]}>Bisaya</Text>
              </View>
            )}
            <View style={styles.postActions}>
              <TouchableOpacity onPress={() => toggleComments(item.id)} style={styles.actionRow}>
                <Ionicons name="chatbubble-outline" size={18} color={colors.textLight} />
                <Text style={[styles.actionText, { color: colors.textLight }]}>Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLiked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                style={styles.actionRow}
              >
                <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={18} color={isLiked ? colors.error : colors.textLight} />
                <Text style={[styles.actionText, { color: isLiked ? colors.error : colors.textLight }]}>
                  {(item.likes || 0) + (isLiked ? 1 : 0)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTranslated((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                style={styles.actionRow}
              >
                <Ionicons name="language" size={18} color={isTranslated ? colors.primary : colors.textLight} />
                <Text style={[styles.actionText, { color: isTranslated ? colors.primary : colors.textLight }]}>Translate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBookmarked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                style={styles.actionRow}
              >
                <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={isBookmarked ? colors.accent : colors.textLight} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleShare(item.title, item.content)} style={styles.actionRow}>
                <Ionicons name="share-social-outline" size={18} color={colors.textLight} />
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
                    id="comment"
                    name="comment"
                    testID="comment-input"
                    style={[styles.commentInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.surface : colors.surfaceSecondary }]}
                    placeholder="Add a comment..."
                    placeholderTextColor={colors.textLight}
                    value={newComment}
                    onChangeText={setNewComment}
                    autoComplete="off"
                  />
                  <TouchableOpacity
                    onPress={() => handleAddComment(item.id)}
                    style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                    accessibilityRole="button"
                    accessibilityLabel="Send comment"
                  >
                    <Ionicons name="send" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>
        );
      }}
      ListEmptyComponent={
        loadError ? (
          <ErrorState
            icon="cloud-offline-outline"
            title="Could not load the feed"
            message="Check your connection and try again."
            actionLabel="Retry"
            onAction={loadPosts}
          />
        ) : (
          <EmptyState
            icon="people"
            title="No posts yet"
            message="Be the first to share something with the community!"
            actionLabel="Create Post"
            onAction={openCreateSheet}
          />
        )
      }
    />
  );

  const renderChallenges = () => (
    <FlatList
      data={MOCK_CHALLENGES}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card style={styles.hubCard}>
          <View style={[styles.hubIcon, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <View style={styles.hubInfo}>
            <Text style={[styles.hubTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.hubDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
          </View>
          <View style={[styles.xpPill, { backgroundColor: item.color + '15' }]}>
            <Ionicons name="star" size={12} color={item.color} />
            <Text style={[styles.xpPillText, { color: item.color }]}>+{item.xp} XP</Text>
          </View>
        </Card>
      )}
    />
  );

  const renderAsk = () => (
    <FlatList
      data={questions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <TouchableOpacity
          style={[styles.askComposer, { backgroundColor: colors.primary }]}
          onPress={() => setShowAskSheet(true)}
          activeOpacity={0.9}
        >
          <Ionicons name="mic" size={20} color="#fff" />
          <Text style={styles.askComposerText}>Ask a native speaker in Bisaya</Text>
        </TouchableOpacity>
      }
      renderItem={({ item }) => {
        const isHelpful = !!helpful[item.id];
        return (
          <Card style={styles.hubCard}>
            <View style={styles.postHeader}>
              {item.voice ? (
                <View style={[styles.voiceAvatar, { backgroundColor: colors.softPurple }]}>
                  <Ionicons name="mic" size={16} color={colors.primary} />
                </View>
              ) : (
                <Avatar name={item.user} size={32} />
              )}
              <View style={styles.postAuthor}>
                <Text style={[styles.authorName, { color: colors.text }]}>{item.user}</Text>
                {item.voice && (
                  <View style={styles.voiceTag}>
                    <Ionicons name="mic" size={10} color={colors.primary} />
                    <Text style={[styles.voiceTagText, { color: colors.primary }]}>Voice question</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={[styles.askText, { color: colors.text }]}>{item.text}</Text>
            <Text style={[styles.postContent, { color: colors.textSecondary }]}>{item.english}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity
                onPress={() => setHelpful((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                style={styles.actionRow}
              >
                <Ionicons name={isHelpful ? 'thumbs-up' : 'thumbs-up-outline'} size={18} color={isHelpful ? colors.primary : colors.textLight} />
                <Text style={[styles.actionText, { color: isHelpful ? colors.primary : colors.textLight }]}>
                  Helpful · {(item.helpful || 0) + (isHelpful ? 1 : 0)}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        );
      }}
    />
  );

  const renderPhrases = () => (
    <FlatList
      data={MOCK_PHRASES}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card style={styles.hubCard}>
          <View style={[styles.phraseIcon, { backgroundColor: item.color + '20' }]}>
            <Ionicons name="chatbubble" size={20} color={item.color} />
          </View>
          <View style={styles.hubInfo}>
            <Text style={[styles.phraseNative, { color: colors.text }]}>{item.native}</Text>
            <Text style={[styles.hubDesc, { color: colors.textSecondary }]}>{item.english}</Text>
            <Text style={[styles.phraseUser, { color: colors.textLight }]}>Shared by {item.user}</Text>
          </View>
          <View style={styles.actionCol}>
            <TouchableOpacity onPress={() => handleShare(item.native, item.english)} style={styles.actionRow}>
              <Ionicons name="share-social-outline" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </Card>
      )}
    />
  );

  const renderCulture = () => (
    <FlatList
      data={MOCK_CULTURE}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card style={styles.hubCard}>
          <View style={[styles.hubIcon, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <View style={styles.hubInfo}>
            <Text style={[styles.hubTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.hubDesc, { color: colors.textSecondary }]}>{item.text}</Text>
          </View>
        </Card>
      )}
    />
  );

  const renderEvents = () => (
    <FlatList
      data={MOCK_EVENTS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card style={styles.hubCard}>
          <View style={[styles.hubIcon, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <View style={styles.hubInfo}>
            <Text style={[styles.hubTitle, { color: colors.text }]}>{item.title}</Text>
            <View style={styles.eventRow}>
              <Ionicons name="calendar-outline" size={12} color={colors.textLight} />
              <Text style={[styles.eventText, { color: colors.textSecondary }]}>{item.date}</Text>
            </View>
            <View style={styles.eventRow}>
              <Ionicons name="location-outline" size={12} color={colors.textLight} />
              <Text style={[styles.eventText, { color: colors.textSecondary }]}>{item.location}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.joinBtn, { backgroundColor: colors.primary }]} onPress={() => Alert.alert('RSVP', `You RSVP'd to ${item.title}!`)}>
            <Text style={styles.joinBtnText}>RSVP</Text>
          </TouchableOpacity>
        </Card>
      )}
    />
  );

  const renderDiscussions = () => (
    <FlatList
      data={MOCK_DISCUSSIONS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card style={styles.hubCard}>
          <View style={styles.hubInfo}>
            <Text style={[styles.hubTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.hubDesc, { color: colors.textSecondary }]}>by {item.author}</Text>
          </View>
          <View style={styles.repliesPill}>
            <Ionicons name="chatbubble-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.repliesText, { color: colors.textSecondary }]}>{item.replies}</Text>
          </View>
        </Card>
      )}
    />
  );

  const renderLeaderboard = () => (
    <FlatList
      data={MOCK_LEADERBOARD}
      keyExtractor={(item) => item.name}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card style={styles.hubCard}>
          <View style={[styles.rankBadge, item.rank === 1 && { backgroundColor: colors.accent }]}>
            <Text style={[styles.rankText, item.rank === 1 && { color: '#fff' }]}>{item.rank}</Text>
          </View>
          <Avatar name={item.name} size={36} />
          <View style={styles.hubInfo}>
            <Text style={[styles.hubTitle, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.eventRow}>
              <Ionicons name="flame" size={12} color={colors.warning} />
              <Text style={[styles.eventText, { color: colors.textSecondary }]}>{item.streak} day streak</Text>
            </View>
          </View>
          <Text style={[styles.xpValue, { color: colors.primary }]}>{item.xp.toLocaleString()} XP</Text>
        </Card>
      )}
    />
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'challenges': return renderChallenges();
      case 'ask': return renderAsk();
      case 'phrases': return renderPhrases();
      case 'culture': return renderCulture();
      case 'events': return renderEvents();
      case 'discussions': return renderDiscussions();
      case 'leaderboard': return renderLeaderboard();
      default: return renderFeed();
    }
  };

  if (loading && activeTab === 'feed') return <LoadingState fullScreen />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Community" subtitle="Learn together">
        <TouchableOpacity onPress={activeTab === 'ask' ? () => setShowAskSheet(true) : openCreateSheet} style={styles.headerBtn}>
          <View style={[styles.headerBtnInner, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </Header>

      {renderSegments()}
      {renderTab()}

      <BottomSheet visible={showCreate} onClose={() => setShowCreate(false)} title="Create Post" height={360}>
        <TextInput
          id="postTitle"
          name="postTitle"
          testID="postTitle-input"
          style={[styles.sheetInput, { color: colors.text, borderColor: isDark ? '#334155' : colors.border, backgroundColor: isDark ? colors.surface : colors.surfaceSecondary }]}
          placeholder='Title (e.g. "How to use Lagi?")'
          placeholderTextColor={colors.textLight}
          value={newTitle}
          onChangeText={setNewTitle}
          autoComplete="off"
        />
        <TextInput
          id="postContent"
          name="postContent"
          testID="postContent-input"
          style={[styles.sheetInput, styles.sheetBody, { color: colors.text, borderColor: isDark ? '#334155' : colors.border, backgroundColor: isDark ? colors.surface : colors.surfaceSecondary }]}
          placeholder="Write your post or ask a question..."
          placeholderTextColor={colors.textLight}
          value={newContent}
          onChangeText={setNewContent}
          multiline
        />
        <TouchableOpacity style={[styles.sheetSubmit, { backgroundColor: colors.primary }]} onPress={handleCreatePost} activeOpacity={0.8}>
          <Ionicons name="paper-plane" size={18} color="#fff" />
          <Text style={styles.sheetSubmitText}>Share with Community</Text>
        </TouchableOpacity>
      </BottomSheet>

      <BottomSheet visible={showAskSheet} onClose={() => setShowAskSheet(false)} title="Ask a Native Speaker" height={360}>
        <Text style={[styles.askHint, { color: colors.textSecondary }]}>Type your question, or record it in Bisaya for native speakers to answer.</Text>
        <TextInput
          id="askText"
          name="askText"
          testID="ask-input"
          style={[styles.sheetInput, styles.sheetBody, { color: colors.text, borderColor: isDark ? '#334155' : colors.border, backgroundColor: isDark ? colors.surface : colors.surfaceSecondary }]}
          placeholder="Type your question..."
          placeholderTextColor={colors.textLight}
          value={askText}
          onChangeText={setAskText}
          multiline
        />
        <TouchableOpacity
          style={[styles.recordRow, { borderColor: colors.border }]}
          onPress={() => setIsRecording((r) => !r)}
          activeOpacity={0.85}
        >
          <Ionicons name={isRecording ? 'stop-circle' : 'mic'} size={22} color={isRecording ? colors.error : colors.primary} />
          <Text style={[styles.recordText, { color: isRecording ? colors.error : colors.textSecondary }]}>
            {isRecording ? 'Recording... tap to stop' : 'Record a voice question'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sheetSubmit, { backgroundColor: colors.primary }]} onPress={submitQuestion} activeOpacity={0.8}>
          <Ionicons name="help-circle" size={18} color="#fff" />
          <Text style={styles.sheetSubmitText}>Post Question</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBtn: { padding: spacing.sm },
  headerBtnInner: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  segmentBar: { borderBottomWidth: 1, paddingVertical: spacing.sm },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, gap: spacing.sm },
  segmentChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1.5, borderColor: 'transparent' },
  segmentText: { fontSize: 12, fontWeight: '700' },
  list: { padding: spacing.xl, paddingTop: spacing.lg },
  postCard: { marginBottom: spacing.md },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  postAuthor: { flex: 1, marginLeft: spacing.md },
  authorName: { fontSize: 14, fontWeight: '600' },
  postDate: { fontSize: 11, marginTop: 2 },
  postTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.sm },
  postContent: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  translateTag: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.full, marginBottom: spacing.sm },
  translateTagText: { fontSize: 11, fontWeight: '700' },
  postActions: { flexDirection: 'row', gap: spacing.lg, flexWrap: 'wrap' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionText: { fontSize: 12, fontWeight: '500' },
  commentsSection: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1 },
  commentRow: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.sm },
  commentContent: { flex: 1 },
  commentAuthor: { fontSize: 13, fontWeight: '600' },
  commentText: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  commentInput: { flex: 1, borderWidth: 1.5, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 13 },
  hubCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  hubIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  hubInfo: { flex: 1 },
  hubTitle: { fontSize: 15, fontWeight: '700' },
  hubDesc: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  xpPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.full },
  xpPillText: { fontSize: 11, fontWeight: '700' },
  askComposer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.lg },
  askComposerText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  voiceAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  voiceTag: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  voiceTagText: { fontSize: 10, fontWeight: '600' },
  askText: { fontSize: 15, fontWeight: '700', marginBottom: spacing.xs },
  phraseIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  phraseNative: { fontSize: 16, fontWeight: '800' },
  phraseUser: { fontSize: 11, marginTop: 3 },
  actionCol: { alignItems: 'flex-end' },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 3 },
  eventText: { fontSize: 12 },
  joinBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  joinBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  repliesPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.full },
  repliesText: { fontSize: 12, fontWeight: '600' },
  rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 13, fontWeight: '800' },
  xpValue: { fontSize: 13, fontWeight: '800' },
  sampleBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md },
  sampleBannerText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  sheetInput: { borderWidth: 1.5, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md, fontSize: 15 },
  sheetBody: { minHeight: 100, textAlignVertical: 'top' },
  sheetSubmit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.lg, paddingVertical: 14, gap: spacing.sm, marginTop: spacing.sm, ...shadows.md },
  sheetSubmitText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  askHint: { fontSize: 12, marginBottom: spacing.md, lineHeight: 17 },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1.5, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md },
  recordText: { fontSize: 14, fontWeight: '600' },
});
