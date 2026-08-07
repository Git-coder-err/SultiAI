import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useGame } from '../../context/GameContext';
import Header from '../../components/Header';
import GlassCard from '../../components/GlassCard';
import { spacing, borderRadius, shadows } from '../../theme';
import { XP_VALUES } from '../../constants';

function PhraseRow({ native, english, note, colors }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.phraseRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => setRevealed((r) => !r)}
      activeOpacity={0.85}
    >
      <View style={styles.phraseMain}>
        <Text style={[styles.phraseNative, { color: colors.text }]}>{native}</Text>
        {revealed ? (
          <Text style={[styles.phraseEnglish, { color: colors.primary }]}>{english}</Text>
        ) : (
          <Text style={[styles.phraseHint, { color: colors.textLight }]}>Tap to reveal meaning</Text>
        )}
      </View>
      {note ? <Text style={[styles.phraseNote, { color: colors.textSecondary }]}>{note}</Text> : null}
      <Ionicons name={revealed ? 'eye' : 'eye-off'} size={16} color={colors.textLight} />
    </TouchableOpacity>
  );
}

function SectionTitle({ title, colors }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

function makeModuleScreen(config) {
  const { route, title, subtitle, icon, gradient, description, heroAction } = config;

  return function ModuleScreen({ navigation }) {
    const { colors } = useTheme();
    const { addXp } = useGame();

    const handlePractice = () => {
      if (heroAction) {
        addXp(XP_VALUES.ROLEPLAY_START, route);
        if (heroAction.route) {
          navigation.navigate(heroAction.route, heroAction.params);
        }
      }
    };

    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Header
          title={title}
          subtitle={subtitle}
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={icon} size={26} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroDesc}>{description}</Text>
            {heroAction && (
              <TouchableOpacity style={styles.heroBtn} onPress={handlePractice} activeOpacity={0.85}>
                <Ionicons name="sparkles" size={16} color={gradient[0]} />
                <Text style={styles.heroBtnText}>{heroAction.label}</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>

          {config.sections.map((section, idx) => (
            <View key={idx} style={styles.section}>
              <SectionTitle title={section.title} colors={colors} />
              {section.items.map((item, i) => (
                <PhraseRow key={i} native={item.native} english={item.english} note={item.note} colors={colors} />
              ))}
            </View>
          ))}

          {config.renderExtra ? config.renderExtra({ colors, addXp, navigation }) : null}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    );
  };
}

const WRITING_EXTRA = ({ colors, addXp }) => {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (submitted || text.trim().length < 2) return;
    setSubmitted(true);
    addXp(10, 'writing');
  };

  return (
    <View style={styles.section}>
      <SectionTitle title="Today's Writing Prompt" colors={colors} />
      <GlassCard variant="elevated" style={styles.promptCard} padding="lg">
        <Text style={[styles.promptText, { color: colors.text }]}>Describe your morning in Bisaya.</Text>
        <Text style={[styles.promptHint, { color: colors.textSecondary }]}>
          Use the words: matulog (sleep), mumata (wake up), pamahaw (breakfast).
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="Pagsulat diri... (Write here)"
          placeholderTextColor={colors.textLight}
          multiline
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: submitted ? colors.success : colors.primary }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Ionicons name={submitted ? 'checkmark-circle' : 'send'} size={16} color="#fff" />
          <Text style={styles.submitText}>{submitted ? 'Submitted!' : 'Submit for XP'}</Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
};

const SWITCH_EXTRA = ({ colors }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <View style={styles.section}>
      <SectionTitle title="Bisaya ⇄ English Switch" colors={colors} />
      <View style={[styles.switchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.switchLabel, { color: colors.textSecondary }]}>Show as</Text>
        <TouchableOpacity
          style={[styles.switchChip, flipped ? styles.switchChipOff : styles.switchChipOn]}
          onPress={() => setFlipped(false)}
        >
          <Text style={[styles.switchChipText, { color: flipped ? colors.textSecondary : '#fff' }]}>Bisaya</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchChip, flipped ? styles.switchChipOn : styles.switchChipOff]}
          onPress={() => setFlipped(true)}
        >
          <Text style={[styles.switchChipText, { color: flipped ? '#fff' : colors.textSecondary }]}>English</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const QUIZ_EXTRA = ({ colors, addXp }) => {
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const questions = [
    { q: 'How do you say "Thank you"?', a: 'Salamat' },
    { q: 'How do you say "Please"?', a: 'Palihog' },
    { q: 'How do you say "How are you?"', a: 'Kumusta ka?' },
    { q: 'How do you say "I love you"?', a: 'Gihigugma ko ikaw' },
  ];

  const current = questions[active];

  const handleNext = () => {
    if (active + 1 >= questions.length) {
      setDone(true);
      addXp(XP_VALUES.FLASHCARD_KNOWN * questions.length, 'review_center');
      return;
    }
    setActive((a) => a + 1);
    setRevealed(false);
  };

  if (done) {
    return (
      <View style={styles.section}>
        <GlassCard variant="elevated" style={styles.doneCard} padding="lg">
          <Ionicons name="trophy" size={40} color={colors.accent} />
          <Text style={[styles.doneTitle, { color: colors.text }]}>Review Complete!</Text>
          <Text style={[styles.doneSub, { color: colors.textSecondary }]}>
            You earned {XP_VALUES.FLASHCARD_KNOWN * questions.length} XP
          </Text>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <SectionTitle title="Quick Review Quiz" colors={colors} />
      <GlassCard variant="elevated" style={styles.quizCard} padding="lg">
        <Text style={[styles.quizProgress, { color: colors.textLight }]}>
          {active + 1} / {questions.length}
        </Text>
        <Text style={[styles.quizQ, { color: colors.text }]}>{current.q}</Text>
        {revealed ? (
          <View style={[styles.quizAnswer, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.quizAnswerText, { color: colors.success }]}>{current.a}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.revealBtn, { borderColor: colors.primary }]}
            onPress={() => setRevealed(true)}
            activeOpacity={0.85}
          >
            <Text style={[styles.revealBtnText, { color: colors.primary }]}>Reveal Answer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.submitText}>{active + 1 >= questions.length ? 'Finish' : 'Next'}</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
};

export const ScenarioPracticeScreen = makeModuleScreen({
  route: 'scenario',
  title: 'Scenario Practice',
  subtitle: 'Roleplay real-life conversations',
  icon: 'chatbubbles',
  gradient: ['#3B82F6', '#2563EB'],
  description: 'Step into realistic Bisaya conversations. Practice bargaining, riding, ordering, and more with SULTI.',
  heroAction: { label: 'Start Roleplay', route: 'Tutor', params: { situation: 'Roleplay conversation', label: 'Scenario Practice' } },
  sections: [
    {
      title: 'Scenarios',
      items: [
        { native: 'Palengke', english: 'At the Market', note: 'Bargaining & buying food' },
        { native: 'Jeepney', english: 'Riding a Jeepney', note: 'Routes & paying the driver' },
        { native: 'Karenderia', english: 'Eating Out', note: 'Ordering at a carenderia' },
        { native: 'Ospital', english: 'At the Hospital', note: 'Emergency & checkup phrases' },
      ],
    },
  ],
});

export const GrammarScreen = makeModuleScreen({
  route: 'grammar',
  title: 'Grammar',
  subtitle: 'Cebuano sentence structure',
  icon: 'school',
  gradient: ['#8B5CF6', '#7C3AED'],
  description: 'Learn the core building blocks of Cebuano grammar: particles, verb focus, and word order.',
  heroAction: { label: 'Practice Grammar', route: 'Tutor', params: { situation: 'Grammar practice', label: 'Grammar' } },
  sections: [
    {
      title: 'Core Rules',
      items: [
        { native: 'Ang + noun', english: 'The subject marker', note: 'Ang akong amigo = my friend' },
        { native: 'Si + name', english: 'Proper noun marker', note: 'Si Maria muadto = Maria will go' },
        { native: 'nag-/ni-', english: 'Verb focus prefixes', note: 'nagluto = cooking' },
        { native: 'Palihog', english: 'Please (softener)', note: 'Palihog ug hatag = please give' },
      ],
    },
  ],
});

export const ListeningScreen = makeModuleScreen({
  route: 'listening',
  title: 'Listening',
  subtitle: 'Train your ear for Bisaya',
  icon: 'ear',
  gradient: ['#F59E0B', '#F97316'],
  description: 'Hear everyday Bisaya phrases at natural speed. Play them back and repeat out loud.',
  heroAction: { label: 'Start Listening', route: 'VoiceMode', params: { situation: 'Listening practice', label: 'Listening' } },
  sections: [
    {
      title: 'Daily Expressions',
      items: [
        { native: 'Kumusta ka?', english: 'How are you?', note: 'Casual greeting' },
        { native: 'Asa ka paingon?', english: 'Where are you going?', note: 'Small talk' },
        { native: 'Moadto ko sa merkado', english: 'I am going to the market', note: 'Future tense' },
        { native: 'Nindot ang panahon karon', english: 'The weather is nice today', note: 'Weather small talk' },
      ],
    },
  ],
});

export const WritingScreen = makeModuleScreen({
  route: 'writing',
  title: 'Writing',
  subtitle: 'Compose in Cebuano',
  icon: 'create',
  gradient: ['#EC4899', '#DB2777'],
  description: 'Build writing confidence with guided prompts. SULTI checks your sentences and offers corrections.',
  heroAction: { label: 'Writing Coach', route: 'Tutor', params: { situation: 'Writing help', label: 'Writing Coach' } },
  sections: [
    {
      title: 'Vocabulary Bank',
      items: [
        { native: 'matulog', english: 'to sleep', note: 'verb' },
        { native: 'mumata', english: 'to wake up', note: 'verb' },
        { native: 'pamahaw', english: 'breakfast', note: 'noun' },
        { native: 'trabaho', english: 'work', note: 'noun' },
      ],
    },
  ],
  renderExtra: WRITING_EXTRA,
});

export const ReadingScreen = makeModuleScreen({
  route: 'reading',
  title: 'Reading',
  subtitle: 'Read & understand Bisaya',
  icon: 'book',
  gradient: ['#14B8A6', '#0D9488'],
  description: 'Read short Bisaya passages with full English translations and key vocabulary.',
  heroAction: { label: 'Reading Session', route: 'Tutor', params: { situation: 'Reading comprehension', label: 'Reading' } },
  sections: [
    {
      title: 'Today\u2019s Passage',
      items: [
        { native: 'Ako si Juan.', english: 'I am Juan.', note: 'Introduction' },
        { native: 'Taga-Cebu ko.', english: 'I am from Cebu.', note: 'Origin' },
        { native: 'Nagtuon ko og Bisaya.', english: 'I am studying Bisaya.', note: 'Study' },
        { native: 'Gusto ko makakat-on og dugang.', english: 'I want to learn more.', note: 'Desire' },
      ],
    },
  ],
});

export const SultiSwitchScreen = makeModuleScreen({
  route: 'switch',
  title: 'Sulti Switch',
  subtitle: 'Bilingual thinking mode',
  icon: 'swap-horizontal',
  gradient: ['#06B6D4', '#0891B2'],
  description: 'Toggle between Bisaya and English to train instant translation recall.',
  heroAction: { label: 'Switch Mode', route: 'Tutor', params: { situation: 'Translation practice', label: 'Sulti Switch' } },
  sections: [
    {
      title: 'Practice Pairs',
      items: [
        { native: 'Unsa ni?', english: 'What is this?', note: 'Question' },
        { native: 'Gusto ko ani.', english: 'I want this.', note: 'Preference' },
        { native: 'Pila ni?', english: 'How much is this?', note: 'Shopping' },
        { native: 'Asa ang banyo?', english: 'Where is the bathroom?', note: 'Directions' },
      ],
    },
  ],
  renderExtra: SWITCH_EXTRA,
});

export const CultureNotesScreen = makeModuleScreen({
  route: 'culture',
  title: 'Culture Notes',
  subtitle: 'Understand Cebuano life',
  icon: 'compass',
  gradient: ['#10B981', '#059669'],
  description: 'Cultural context behind the language — from festivals to everyday etiquette.',
  heroAction: { label: 'Ask About Culture', route: 'Tutor', params: { situation: 'Culture discussion', label: 'Culture Notes' } },
  sections: [
    {
      title: 'Did You Know?',
      items: [
        { native: 'Sinulog Festival', english: 'Cebu\u2019s grandest celebration', note: 'Every January in Cebu City' },
        { native: 'Bahala Na', english: 'Come what may', note: 'A famous Filipino mindset' },
        { native: 'Po & Opo', english: 'Respect markers', note: 'Shown to elders and authority' },
        { native: 'Kamayan', english: 'Eating with hands', note: 'Common in casual meals' },
      ],
    },
  ],
});

export const ReviewCenterScreen = makeModuleScreen({
  route: 'review',
  title: 'Review Center',
  subtitle: 'Reinforce what you learned',
  icon: 'refresh',
  gradient: ['#F43F5E', '#E11D48'],
  description: 'Quick quizzes that turn learned phrases into lasting memory. Earn XP for every correct recall.',
  heroAction: { label: 'Review Session', route: 'Tutor', params: { situation: 'Review session', label: 'Review Center' } },
  sections: [
    {
      title: 'Key Phrases',
      items: [
        { native: 'Salamat', english: 'Thank you', note: 'Essential' },
        { native: 'Palihog', english: 'Please', note: 'Essential' },
        { native: 'Kumusta ka?', english: 'How are you?', note: 'Essential' },
        { native: 'Gihigugma ko ikaw', english: 'I love you', note: 'Essential' },
      ],
    },
  ],
  renderExtra: QUIZ_EXTRA,
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingTop: spacing.lg, paddingBottom: 120 },
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    ...shadows.md,
  },
  heroIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  heroDesc: { fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: '#fff', paddingVertical: spacing.md, borderRadius: borderRadius.full, marginTop: spacing.md,
  },
  heroBtnText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  section: { marginBottom: spacing.xl },
  sectionHeader: { marginBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  phraseRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, marginBottom: spacing.sm,
  },
  phraseMain: { flex: 1 },
  phraseNative: { fontSize: 15, fontWeight: '700' },
  phraseEnglish: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  phraseHint: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  phraseNote: { fontSize: 11, fontWeight: '500', maxWidth: 90, textAlign: 'right' },
  promptCard: { gap: spacing.md },
  promptText: { fontSize: 16, fontWeight: '700' },
  promptHint: { fontSize: 12, lineHeight: 17 },
  input: {
    minHeight: 90, borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md,
    fontSize: 14, textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: borderRadius.xl,
  },
  submitText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  switchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1,
  },
  switchLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  switchChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  switchChipOn: { backgroundColor: '#14B8A6' },
  switchChipOff: { backgroundColor: 'rgba(128,128,128,0.15)' },
  switchChipText: { fontSize: 13, fontWeight: '700' },
  quizCard: { gap: spacing.md, alignItems: 'center' },
  quizProgress: { fontSize: 12, fontWeight: '600', alignSelf: 'flex-end' },
  quizQ: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  quizAnswer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.lg },
  quizAnswerText: { fontSize: 16, fontWeight: '700' },
  revealBtn: { borderWidth: 2, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.full },
  revealBtnText: { fontSize: 14, fontWeight: '700' },
  doneCard: { alignItems: 'center', gap: spacing.sm },
  doneTitle: { fontSize: 18, fontWeight: '800' },
  doneSub: { fontSize: 13, fontWeight: '500' },
  bottomSpacer: { height: 40 },
});
