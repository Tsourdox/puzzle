const locales = ['sv', 'en'] as const;

export function getLocales() {
  return [...locales] as string[];
}

export function getTranslation(locale: Locale) {
  return (key: Translation) => translations[key][locale];
}

export type Locale = (typeof locales)[number];
export type Translation = keyof typeof translations;
export type T = ReturnType<typeof getTranslation>;

const translations = {
  siteDescription: {
    en: 'An online puzzle for you and your friends!',
    sv: 'Ett online pussel för dig och dina vänner!',
  },
  joinRoom: {
    en: 'Join a room',
    sv: 'Gå med i ett rum',
  },
  chooseImage: {
    en: 'Upload image',
    sv: 'Välj en egen bild',
  },
  comingSoon: {
    en: 'Coming soon',
    sv: 'Kommer snart',
  },
  newPuzzle: {
    en: 'New puzzle',
    sv: 'Nytt pussel',
  },
} as const;
