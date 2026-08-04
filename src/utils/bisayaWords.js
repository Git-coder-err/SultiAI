const DICTIONARY = [
  { bisaya: 'maayong buntag', english: 'Good morning', pronunciation: 'mah-AH-yong boon-TAG', example: 'Maayong buntag! Kumusta ka?', category: 'Greetings' },
  { bisaya: 'maayong udto', english: 'Good noon', pronunciation: 'mah-AH-yong OOD-toh', example: 'Maayong udto kaninyo.', category: 'Greetings' },
  { bisaya: 'maayong hapon', english: 'Good afternoon', pronunciation: 'mah-AH-yong HAH-pon', example: 'Maayong hapon, Sir.', category: 'Greetings' },
  { bisaya: 'maayong gabii', english: 'Good evening / good night', pronunciation: 'mah-AH-yong gah-BEE-ee', example: 'Maayong gabii ug matulog na.', category: 'Greetings' },
  { bisaya: 'kumusta', english: 'How are you / hello', pronunciation: 'koo-MOOS-tah', example: 'Kumusta ka na?', category: 'Greetings' },
  { bisaya: 'salamat', english: 'Thank you', pronunciation: 'sah-LAH-mat', example: 'Salamat kaayo sa tabang.', category: 'Greetings' },
  { bisaya: 'palihug', english: 'Please', pronunciation: 'pah-LEE-hoog', example: 'Palihug ko ug tabang.', category: 'Greetings' },
  { bisaya: 'pasensya', english: 'Sorry / excuse me', pronunciation: 'pah-SEN-sha', example: 'Pasensya na, ulahi ko.', category: 'Greetings' },
  { bisaya: 'oo', english: 'Yes', pronunciation: 'oh-OH', example: 'Oo, sakto ka.', category: 'Basics' },
  { bisaya: 'dili', english: 'No / not', pronunciation: 'DEE-lee', example: 'Dili ko makasabot.', category: 'Basics' },
  { bisaya: 'ako', english: 'I / me', pronunciation: 'ah-KOH', example: 'Ako si Maria.', category: 'Basics' },
  { bisaya: 'ikaw', english: 'You', pronunciation: 'ee-KAW', example: 'Ikaw ba ang estudyante?', category: 'Basics' },
  { bisaya: 'unsa', english: 'What', pronunciation: 'oon-SAH', example: 'Unsa ang imong pangalan?', category: 'Questions' },
  { bisaya: 'asa', english: 'Where', pronunciation: 'ah-SAH', example: 'Asa ka padulong?', category: 'Questions' },
  { bisaya: 'kanus-a', english: 'When', pronunciation: 'kah-NOOS-ah', example: 'Kanus-a ka moari?', category: 'Questions' },
  { bisaya: 'ngano', english: 'Why', pronunciation: 'ngah-NOH', example: 'Ngano man natingala ka?', category: 'Questions' },
  { bisaya: 'gihigugma', english: 'Love (verb)', pronunciation: 'gee-hee-GOOG-mah', example: 'Gihigugma tika.', category: 'Feelings' },
  { bisaya: 'kalipay', english: 'Happiness', pronunciation: 'kah-LEE-pigh', example: 'Puno sa kalipay ang balay.', category: 'Feelings' },
  { bisaya: 'usa', english: 'One', pronunciation: 'OO-sah', example: 'Usa ka kilo nga bugas.', category: 'Numbers' },
  { bisaya: 'duha', english: 'Two', pronunciation: 'DOO-hah', example: 'Duha ka libro ang akong napalit.', category: 'Numbers' },
  { bisaya: 'tulo', english: 'Three', pronunciation: 'TOO-loh', example: 'Tulo ka itlog.', category: 'Numbers' },
  { bisaya: 'upat', english: 'Four', pronunciation: 'OO-pat', example: 'Upat ka silya.', category: 'Numbers' },
  { bisaya: 'lima', english: 'Five', pronunciation: 'LEE-mah', example: 'Lima ka adlaw.', category: 'Numbers' },
  { bisaya: 'tubig', english: 'Water', pronunciation: 'TOO-big', example: 'Hatagi ko ug tubig.', category: 'Daily Life' },
  { bisaya: 'pagkaon', english: 'Food', pronunciation: 'pag-KAH-on', example: 'Lami kaayo ang pagkaon.', category: 'Daily Life' },
  { bisaya: 'balay', english: 'House', pronunciation: 'BAH-ligh', example: 'Dako ang among balay.', category: 'Daily Life' },
  { bisaya: 'eskwela', english: 'School', pronunciation: 'es-KWEH-lah', example: 'Adto ko sa eskwela.', category: 'Daily Life' },
  { bisaya: 'kauban', english: 'Friend / companion', pronunciation: 'kah-OO-ban', example: 'Kauban ko ni Juan.', category: 'Daily Life' },
  { bisaya: 'salapi', english: 'Money', pronunciation: 'sah-LAH-pee', example: 'Kinahanglan ko ug salapi.', category: 'Daily Life' },
  { bisaya: 'gawas', english: 'Outside', pronunciation: 'GAH-was', example: 'Mulaag kita sa gawas.', category: 'Places' },
  { bisaya: 'merkado', english: 'Market', pronunciation: 'mehr-KAH-doh', example: 'Nipalit ko sa merkado.', category: 'Places' },
  { bisaya: 'sakto', english: 'Correct / right', pronunciation: 'SAK-toh', example: 'Sakto gyud ka.', category: 'Praise' },
  { bisaya: 'maayo', english: 'Good', pronunciation: 'mah-AH-yoh', example: 'Maayo kaayo ang imong Bisaya.', category: 'Praise' },
  { bisaya: 'nindot', english: 'Nice / beautiful', pronunciation: 'NEEN-dot', example: 'Nindot kaayo!', category: 'Praise' },
  { bisaya: 'palangga', english: 'Beloved', pronunciation: 'pah-LANG-gah', example: 'Palangga ko ikaw.', category: 'Feelings' },
];

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[.,!?;:'"“”…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findVocabInText(text) {
  const normalized = ` ${normalize(text)} `;
  const found = [];
  for (const entry of DICTIONARY) {
    const word = entry.bisaya.toLowerCase();
    if (normalized.includes(` ${word} `) || normalized.startsWith(` ${word}`)) {
      found.push(entry);
    }
  }
  return found.slice(0, 3);
}

export const POPULAR_STARTERS = [
  'Teach Greetings',
  'Practice Pronunciation',
  'Learn Numbers',
  'Translate English',
  'Daily Conversation',
];
