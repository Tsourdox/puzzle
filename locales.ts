const defaultLocale = 'en';
const locales = ['en', 'sv', 'no'] as const;

export function getLocales() {
  return [...locales] as string[];
}

export function getTranslation(locale: Locale) {
  if (locale === defaultLocale) {
    return (key: Translation) => key;
  }
  return (key: Translation) => translations[key][locale];
}

export type Locale = (typeof locales)[number];
export type LocaleWithoutSv = Exclude<Locale, typeof defaultLocale>;

export type Translation = keyof typeof translations;
export type T = ReturnType<typeof getTranslation>;

const translations = {
  'An online puzzle for you and your friends!': {
    sv: 'Ett online pussel för dig och dina vänner!',
    no: 'Et online puslespill for deg og vennene dine!',
  },
  'Join a room': {
    sv: 'Gå med i ett rum',
    no: 'Bli med i et rom',
  },
  'Upload image': {
    sv: 'Välj en egen bild',
    no: 'Last opp et bilde',
  },
  'Coming soon': {
    sv: 'Kommer snart',
    no: 'Kommer snart',
  },
  'New puzzle': {
    sv: 'Nytt pussel',
    no: 'Nytt puslespill',
  },
  'Continue puzzle': {
    sv: 'Fortsätt pussla',
    no: 'Fortsett puslespill',
  },
  'You have no ongoing puzzles': {
    sv: 'Du har inga påbörjade pussel',
    no: 'Du har ingen påbegynte puslespill',
  },
  'When you have started a puzzle it will show up here so that you can finish it later.': {
    sv: 'När du har påbörjat ett pussel visas det här så att du kan slutföra det senare.',
    no: 'Når du har startet et puslespill, vises det her slik at du kan fullføre det senere.',
  },
} as const;
