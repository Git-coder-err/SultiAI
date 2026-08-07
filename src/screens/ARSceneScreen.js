import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { XP_VALUES } from '../constants';
import { featureFlags } from '../services/features';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import { spacing, borderRadius, shadows } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SCENARIO_ICONS = { market: 'cart', restaurant: 'restaurant', street: 'compass' };
const CATEGORY_COLORS = { food: '#10B981', drink: '#3B82F6', place: '#8B5CF6', transport: '#F59E0B', general: '#6B7280' };
const CATEGORY_LABELS = { food: 'Pagkaon (Food)', drink: 'Ilimnon (Drinks)', place: 'Lugar (Place)', transport: 'Transportasyon', general: 'Kinatibuk-an (General)' };

function FloatingLabel({ obj, index }) {
  const { colors } = useTheme();
  const posX = 20 + (index % 3) * 110;
  const posY = 60 + Math.floor(index / 3) * 70;
  const catColor = CATEGORY_COLORS[obj.category] || colors.primary;

  return (
    <View style={[styles.floatingLabel, { left: posX, top: posY, backgroundColor: catColor + 'E6', borderColor: catColor }]}>
      <Text style={styles.floatingBisaya}>{obj.bisaya}</Text>
      <Text style={styles.floatingEnglish}>{obj.label}</Text>
    </View>
  );
}

function ObjectCard({ obj, onLearn, onSave, isSelected }) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: isSelected ? 1.03 : 1, friction: 6, tension: 100, useNativeDriver: true }).start();
  }, [isSelected]);
  const catColor = CATEGORY_COLORS[obj.category] || colors.primary;
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onLearn(obj)}
        activeOpacity={0.85}
        style={[styles.objectCard, { backgroundColor: colors.surface, borderColor: isSelected ? catColor : colors.border, borderWidth: isSelected ? 2 : 1 }]}
      >
        <View style={[styles.objectBadge, { backgroundColor: catColor + '20' }]}>
          <Text style={[styles.objectEmoji, { color: catColor }]}>{obj.label[0]}</Text>
        </View>
        <View style={styles.objectInfo}>
          <Text style={[styles.objectLabel, { color: colors.text }]}>{obj.label}</Text>
          <Text style={[styles.objectBisaya, { color: catColor }]}>{obj.bisaya}</Text>
          <Text style={[styles.objectPron, { color: colors.textLight }]}>{obj.pronunciation}</Text>
        </View>
        <TouchableOpacity onPress={() => onSave(obj)} style={[styles.saveIcon, { backgroundColor: catColor + '15' }]}>
          <Ionicons name="bookmark-outline" size={16} color={catColor} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DetailOverlay({ obj, onClose, onSave }) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 65, useNativeDriver: true }).start();
  }, []);
  const dismiss = () => {
    Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start(() => onClose());
  };
  const catColor = CATEGORY_COLORS[obj.category] || colors.primary;
  return (
    <View style={styles.overlayBackdrop}>
      <TouchableOpacity style={styles.overlayDismiss} onPress={dismiss} />
      <Animated.View style={[styles.overlayCard, { backgroundColor: colors.surface, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.overlayHandle}><View style={[styles.handleBar, { backgroundColor: colors.border }]} /></View>
        <View style={styles.overlayContent}>
          <View style={styles.overlayHeader}>
            <View style={[styles.overlayIcon, { backgroundColor: catColor + '20' }]}>
              <Text style={[styles.overlayEmoji, { color: catColor }]}>{obj.label[0]}</Text>
            </View>
            <View style={styles.overlayHeaderInfo}>
              <Text style={[styles.overlayLabel, { color: colors.text }]}>{obj.label}</Text>
              <Badge title={obj.category} variant="info" size="sm" />
            </View>
          </View>
          <View style={[styles.wordCard, { backgroundColor: catColor + '10', borderColor: catColor + '30' }]}>
            <Text style={[styles.wordBisaya, { color: catColor }]}>{obj.bisaya}</Text>
            <Text style={[styles.wordPron, { color: colors.textSecondary }]}>{obj.pronunciation}</Text>
            <View style={styles.wordDivider} />
            <Text style={[styles.wordUsage, { color: colors.text }]}>{obj.usage}</Text>
          </View>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={() => { onSave(obj); dismiss(); }}>
            <Ionicons name="bookmark" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Save to Phrases</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

export default function ARSceneScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const { addXp } = useGame();
  const insets = useSafeAreaInsets();
  const arEnabled = featureFlags.isEnabled('enableARMode');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scenarioId, setScenarioId] = useState(route?.params?.scenarioId || 'market');
  const [scenario, setScenario] = useState(null);
  const [objects, setObjects] = useState([]);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedObj, setSelectedObj] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
    loadScenario(scenarioId);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const loadScenario = async (id) => {
    setLoading(true);
    try {
      const res = await api.getARScenarioObjects(id);
      if (res.objects) setObjects(res.objects);
      if (res.scenario) setScenario(res.scenario);
    } catch {
      setScenario({ id, title: id === 'market' ? 'Public Market' : id === 'restaurant' ? 'Restaurant' : 'Street & Directions', subtitle: 'Tap objects to learn', icon: 'cart', gradient: ['#10B981', '#059669'] });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!cameraRef.current || analyzing) return;
    setAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.6 });
      if (!photo?.base64) {
        fallbackBrowse();
        return;
      }
      const res = await api.analyzeARImage(photo.base64, scenarioId, 'image/jpeg');
      if (res.objects?.length > 0) {
        setDetectedObjects(res.objects);
        addXp(XP_VALUES.AR_SCAN, 'ar_scan');
      } else {
        fallbackBrowse();
      }
    } catch {
      fallbackBrowse();
    } finally {
      setAnalyzing(false);
    }
  };

  const fallbackBrowse = () => {
    const shuffled = [...objects].sort(() => Math.random() - 0.5).slice(0, 6);
    setDetectedObjects(shuffled);
  };

  const switchScenario = async (id) => {
    setScenarioId(id);
    setDetectedObjects([]);
    setSelectedCategory(null);
    setSelectedObj(null);
    await loadScenario(id);
  };

  const handleLearn = (obj) => setSelectedObj(obj);
  const handleSave = async (obj) => {
    try {
      await api.savePhrase(obj.bisaya, 'Bisaya', obj.category);
      addXp(XP_VALUES.SAVE_PHRASE, 'save_phrase');
    } catch {}
  };

  const categories = [...new Set(objects.map((o) => o.category))];
  const filteredObjects = selectedCategory ? objects.filter((o) => o.category === selectedCategory) : objects;

  if (loading) return <LoadingState fullScreen message="Loading AR Scene..." />;
  if (!permission?.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl }]}>
        <Ionicons name="camera-outline" size={64} color={colors.textLight} />
        <Text style={[styles.permissionText, { color: colors.text }]}>Camera access needed for AR</Text>
        <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scenarioGradient = scenario?.gradient || ['#10B981', '#059669'];

  if (!arEnabled) {
    return (
      <View style={styles.container}>
        <View style={styles.disabledContainer}>
          <Ionicons name="camera-off" size={48} color={colors.textSecondary} />
          <Text style={styles.disabledText}>AR Mode is currently disabled</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" enableTorch={false}>
          <LinearGradient colors={scenarioGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.cameraHeader, { paddingTop: insets.top + 8 }]}>
            <View style={styles.cameraHeaderRow}>
              <TouchableOpacity style={styles.camBackBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={styles.cameraHeaderCenter}>
                <Text style={styles.cameraHeaderTitle}>{scenario?.title || 'AR Explore'}</Text>
              </View>
              <View style={styles.scenarioSwitcher}>
                {['market', 'restaurant', 'street'].map((id) => (
                  <TouchableOpacity key={id} style={[styles.scenarioDot, scenarioId === id && { backgroundColor: 'rgba(255,255,255,0.3)' }]} onPress={() => switchScenario(id)}>
                    <Ionicons name={SCENARIO_ICONS[id] || 'ellipse'} size={14} color="#fff" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {scenario?.subtitle && <Text style={styles.cameraHeaderSub}>{scenario.subtitle}</Text>}
          </LinearGradient>

          {analyzing && (
            <View style={styles.analyzingOverlay}>
              <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']} style={styles.analyzingBg}>
                <Ionicons name="scan-outline" size={48} color="#fff" />
                <Text style={styles.analyzingText}>Analyzing image...</Text>
              </LinearGradient>
            </View>
          )}

          {detectedObjects.length > 0 && !analyzing && (
            <View style={styles.detectedOverlay} pointerEvents="none">
              {detectedObjects.slice(0, 6).map((obj, i) => (
                <FloatingLabel key={`${obj.id || obj.bisaya}-${i}`} obj={obj} index={i} />
              ))}
            </View>
          )}

          <View style={styles.scannerFrame}>
            <View style={[styles.scannerCorner, styles.scannerCornerTL, { borderColor: colors.primary }]} />
            <View style={[styles.scannerCorner, styles.scannerCornerTR, { borderColor: colors.primary }]} />
            <View style={[styles.scannerCorner, styles.scannerCornerBL, { borderColor: colors.primary }]} />
            <View style={[styles.scannerCorner, styles.scannerCornerBR, { borderColor: colors.primary }]} />
          </View>

          <View style={styles.cameraFooter}>
            <TouchableOpacity style={[styles.shutterBtn, analyzing && { opacity: 0.5 }]} onPress={handleAnalyze} disabled={analyzing}>
              <LinearGradient colors={['#fff', '#f0f0f0']} style={styles.shutterOuter}>
                <View style={styles.shutterInner} />
              </LinearGradient>
            </TouchableOpacity>
            {detectedObjects.length > 0 && (
              <TouchableOpacity style={styles.clearDetected} onPress={() => setDetectedObjects([])}>
                <Ionicons name="close-circle" size={22} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            )}
          </View>
        </CameraView>
      </View>

      <Animated.View style={[styles.bottomPanel, { backgroundColor: colors.background, opacity: fadeAnim }]}>
        <View style={styles.categoryStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            <TouchableOpacity style={[styles.categoryChip, { borderColor: colors.border }, !selectedCategory && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setSelectedCategory(null)}>
              <Text style={[styles.categoryText, { color: !selectedCategory ? '#fff' : colors.textSecondary }]}>All</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity key={cat} style={[styles.categoryChip, { borderColor: CATEGORY_COLORS[cat] || colors.border }, selectedCategory === cat && { backgroundColor: CATEGORY_COLORS[cat] || colors.primary }]} onPress={() => setSelectedCategory(cat)}>
                <Text style={[styles.categoryText, { color: selectedCategory === cat ? '#fff' : (CATEGORY_COLORS[cat] || colors.textSecondary) }]}>{CATEGORY_LABELS[cat] || cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.objectList} contentContainerStyle={styles.objectGrid} showsVerticalScrollIndicator={false}>
          {detectedObjects.length > 0 && (
            <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
              <Ionicons name="scan" size={14} color={colors.primary} />
              <Text style={[styles.sectionHeaderText, { color: colors.primary }]}>Detected</Text>
              <Text style={[styles.sectionCount, { color: colors.textLight }]}>{detectedObjects.length} objects</Text>
            </View>
          )}
          {(detectedObjects.length > 0 ? detectedObjects : filteredObjects).map((obj, i) => (
            <ObjectCard key={obj.id || `${obj.bisaya}-${i}`} obj={obj} onLearn={handleLearn} onSave={handleSave} isSelected={selectedObj?.id === obj.id || selectedObj?.bisaya === obj.bisaya} />
          ))}
          {detectedObjects.length === 0 && filteredObjects.map((obj) => (
            <ObjectCard key={obj.id} obj={obj} onLearn={handleLearn} onSave={handleSave} isSelected={selectedObj?.id === obj.id} />
          ))}
        </ScrollView>
      </Animated.View>

      {selectedObj && <DetailOverlay obj={selectedObj} onClose={() => setSelectedObj(null)} onSave={handleSave} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraContainer: { height: SCREEN_HEIGHT * 0.48, overflow: 'hidden' },
  camera: { flex: 1, position: 'relative' },
  cameraHeader: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  cameraHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  camBackBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  cameraHeaderCenter: { flex: 1 },
  cameraHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: 0.35 },
  cameraHeaderSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  scenarioSwitcher: { flexDirection: 'row', gap: spacing.xs },
  scenarioDot: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { position: 'absolute', top: '25%', left: '15%', right: '15%', bottom: '25%' },
  scannerCorner: { position: 'absolute', width: 24, height: 24, borderWidth: 3, borderRadius: 4 },
  scannerCornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  scannerCornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  scannerCornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  scannerCornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  analyzingOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 20 },
  analyzingBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  analyzingText: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: spacing.md },
  detectedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 80, zIndex: 10 },
  floatingLabel: {
    position: 'absolute', paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: borderRadius.md, borderWidth: 1, flexDirection: 'row', gap: 4, alignItems: 'center',
  },
  floatingBisaya: { color: '#fff', fontSize: 13, fontWeight: '700' },
  floatingEnglish: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  cameraFooter: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  shutterBtn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  shutterOuter: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff', borderWidth: 2, borderColor: '#ddd' },
  clearDetected: { position: 'absolute', right: 24 },
  bottomPanel: { flex: 1, borderTopLeftRadius: borderRadius.xxl, borderTopRightRadius: borderRadius.xxl, marginTop: -borderRadius.xxl },
  categoryStrip: { paddingVertical: spacing.md, paddingLeft: spacing.xl },
  categoryScroll: { gap: spacing.sm, paddingRight: spacing.xl },
  categoryChip: { borderRadius: borderRadius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1 },
  categoryText: { fontSize: 13, fontWeight: '600', letterSpacing: -0.08 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.sm, marginBottom: spacing.sm, borderBottomWidth: 1, paddingHorizontal: spacing.xl },
  sectionHeaderText: { fontSize: 13, fontWeight: '700' },
  sectionCount: { fontSize: 11, marginLeft: 'auto' },
  objectList: { flex: 1, paddingHorizontal: spacing.xl },
  objectGrid: { gap: spacing.sm, paddingBottom: 40 },
  objectCard: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.md, ...shadows.sm },
  objectBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  objectEmoji: { fontSize: 18, fontWeight: '700' },
  objectInfo: { flex: 1 },
  objectLabel: { fontSize: 15, fontWeight: '600', letterSpacing: -0.24 },
  objectBisaya: { fontSize: 16, fontWeight: '700', marginTop: 1 },
  objectPron: { fontSize: 12, marginTop: 1, fontStyle: 'italic', letterSpacing: -0.08 },
  saveIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  overlayBackdrop: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 100 },
  overlayDismiss: { flex: 1 },
  overlayCard: { borderTopLeftRadius: borderRadius.xxl, borderTopRightRadius: borderRadius.xxl, ...shadows.xl, maxHeight: SCREEN_HEIGHT * 0.55 },
  overlayHandle: { alignItems: 'center', paddingVertical: spacing.sm },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  overlayContent: { padding: spacing.xl },
  overlayHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  overlayIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  overlayEmoji: { fontSize: 22, fontWeight: '700' },
  overlayHeaderInfo: { flex: 1 },
  overlayLabel: { fontSize: 20, fontWeight: '700', letterSpacing: 0.36 },
  wordCard: { borderRadius: borderRadius.lg, padding: spacing.xl, borderWidth: 1, marginBottom: spacing.lg },
  wordBisaya: { fontSize: 28, fontWeight: '800', textAlign: 'center', letterSpacing: 0.36 },
  wordPron: { fontSize: 14, textAlign: 'center', marginTop: spacing.xs, fontStyle: 'italic', letterSpacing: -0.08 },
  wordDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginVertical: spacing.md },
  wordUsage: { fontSize: 14, lineHeight: 20, textAlign: 'center', letterSpacing: -0.24 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.full, paddingVertical: spacing.md, gap: spacing.sm },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: -0.24 },
  permissionText: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  permissionBtn: { borderRadius: borderRadius.full, paddingHorizontal: spacing.xxl, paddingVertical: spacing.md },
  permissionBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
