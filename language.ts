const defaultLang = 'en';
const langs = ['en', 'sv', 'no', 'da', 'de', 'fi'] as const;

export function getLangs() {
  return [...langs] as string[];
}

export function getTranslation(lang: Lang) {
  if (lang === defaultLang) {
    return (key: Translation) => key;
  }
  return (key: Translation) => translations[key][lang];
}

export type Lang = (typeof langs)[number];
export type Translation = keyof typeof translations;

const translations = {
  // --- General ---
  'An online puzzle for you and your friends!': {
    sv: 'Ett online pussel för dig och dina vänner!',
    no: 'Et online puslespill for deg og vennene dine!',
    da: 'Et online puslespil for dig og dine venner!',
    de: 'Ein Online-Puzzle für dich und deine Freunde!',
    fi: 'Verkkopulmapeli sinulle ja ystävillesi!',
  },
  'You have no ongoing puzzles': {
    sv: 'Du har inga påbörjade pussel',
    no: 'Du har ingen påbegynte puslespill',
    da: 'Du har ingen igangværende puslespil',
    de: 'Du hast keine laufenden Puzzles',
    fi: 'Sinulla ei ole käynnissä olevia pulmia',
  },
  'When you have started a puzzle it will show up here so that you can finish it later.': {
    sv: 'När du har påbörjat ett pussel visas det här så att du kan slutföra det senare.',
    no: 'Når du har startet et puslespill, vises det her slik at du kan fullføre det senere.',
    da: 'Når du har startet et puslespil, vises det her, så du kan fuldføre det senere.',
    de: 'Wenn Sie ein Puzzle gestartet haben, wird es hier angezeigt, damit Sie es später fertigstellen können.',
    fi: 'Kun olet aloittanut pulman, se näkyy täällä, jotta voit viimeistellä sen myöhemmin.',
  },
  'Select pieces and drag and rotate them to solve the puzzle. Invite your friends to help you!': {
    sv: 'Välj bitar och dra och rotera dem för att lösa pusslet. Bjud in dina vänner för att hjälpa dig!',
    no: 'Velg biter og dra og roter dem for å løse puslespillet. Inviter vennene dine til å hjelpe deg!',
    da: 'Vælg brikker og træk og roter dem for at løse puslespillet. Inviter dine venner til at hjælpe dig!',
    de: 'Wählen Sie Teile aus und ziehen und drehen Sie sie, um das Puzzle zu lösen. Lade deine Freunde ein, dir zu helfen!',
    fi: 'Valitse palat ja vedä ja pyöritä niitä ratkaistaksesi pulman. Kutsu ystäväsi auttamaan sinua!',
  },

  // --- General ---

  // --- Room ---
  'Join a room': {
    sv: 'Gå med i ett rum',
    no: 'Bli med i et rom',
    da: 'Bliv med i et rum',
    de: 'Treten Sie einem Raum bei',
    fi: 'Liity huoneeseen',
  },
  'Change room': {
    sv: 'Byt rum',
    no: 'Bytt rom',
    da: 'Skift rum',
    de: 'Raum wechseln',
    fi: 'Vaihda huonetta',
  },
  'Enter room code': {
    sv: 'Ange rumskod',
    no: 'Skriv inn romkode',
    da: 'Indtast rumkode',
    de: 'Geben Sie den Raumcode ein',
    fi: 'Anna huonekoodi',
  },
  'In Room': {
    sv: 'I rum',
    no: 'I rom',
    da: 'I rum',
    de: 'Im Raum',
    fi: 'Huoneessa',
  },
  // --- Room ---

  // --- Other ---
  'Upload image': {
    sv: 'Välj en egen bild',
    no: 'Last opp et bilde',
    da: 'Upload et billede',
    de: 'Lade ein Bild hoch',
    fi: 'Lataa kuva',
  },
  'Coming soon': {
    sv: 'Kommer snart',
    no: 'Kommer snart',
    da: 'Kommer snart',
    de: 'Kommt bald',
    fi: 'Tulossa pian',
  },
  'Invite friends': {
    sv: 'Bjud in vänner',
    no: 'Inviter venner',
    da: 'Inviter venner',
    de: 'Freunde einladen',
    fi: 'Kutsu ystäviä',
  },
  Size: {
    sv: 'Storlek',
    no: 'Størrelse',
    da: 'Størrelse',
    de: 'Größe',
    fi: 'Koko',
  },
  'Select size': {
    sv: 'Välj storlek',
    no: 'Velg størrelse',
    da: 'Vælg størrelse',
    de: 'Größe auswählen',
    fi: 'Valitse koko',
  },
  // --- Other ---

  // --- Puzzle ---
  'New puzzle': {
    sv: 'Nytt pussel',
    no: 'Nytt puslespill',
    da: 'Nyt puslespil',
    de: 'Neues Puzzle',
    fi: 'Uusi pulma',
  },
  'Begin puzzle': {
    sv: 'Börja pussla',
    no: 'Begynn å pusle',
    da: 'Begynd at pusle',
    de: 'Puzzle beginnen',
    fi: 'Aloita pulma',
  },
  'Continue puzzle': {
    sv: 'Fortsätt pussla',
    no: 'Fortsett puslespill',
    da: 'Fortsæt med at pusle',
    de: 'Puzzle fortsetzen',
    fi: 'Jatka pulmaa',
  },
  'Preparing your puzzle': {
    sv: 'Förbereder ditt pussel',
    no: 'Forbereder puslespillet ditt',
    da: 'Forbereder dit puslespil',
    de: 'Bereite dein Puzzle vor',
    fi: 'Valmistellaan pulmaasi',
  },
  // --- Puzzle ---

  // --- Categories ---
  Cats: {
    sv: 'Katter',
    no: 'Katter',
    da: 'Katte',
    de: 'Katzen',
    fi: 'Kissat',
  },
  'Beautiful oceans': {
    sv: 'Vackra hav',
    no: 'Vakre hav',
    da: 'Smukke have',
    de: 'Schöne Ozeane',
    fi: 'Kauniit valtameret',
  },
  Nature: {
    sv: 'Naturen',
    no: 'Naturen',
    da: 'Naturen',
    de: 'Natur',
    fi: 'Luonto',
  },
  Animals: {
    sv: 'Djur',
    no: 'Dyr',
    da: 'Dyr',
    de: 'Tiere',
    fi: 'Eläimet',
  },
  Forests: {
    sv: 'I skogen',
    no: 'I skogen',
    da: 'I skoven',
    de: 'Im Wald',
    fi: 'Metsissä',
  },
  People: {
    sv: 'Människor',
    no: 'Mennesker',
    da: 'Mennesker',
    de: 'Menschen',
    fi: 'Ihmiset',
  },
  'In the mountains': {
    sv: 'Uppe på begen',
    no: 'På fjellet',
    da: 'I bjergene',
    de: 'In den Bergen',
    fi: 'Vuorilla',
  },
  Greece: {
    sv: 'Grekland',
    no: 'Hellas',
    da: 'Grækenland',
    de: 'Griechenland',
    fi: 'Kreikka',
  },
  Sport: {
    sv: 'Sport',
    no: 'Sport',
    da: 'Sport',
    de: 'Sport',
    fi: 'Urheilu',
  },
  Cities: {
    sv: 'Städer',
    no: 'Byer',
    da: 'Byer',
    de: 'Städte',
    fi: 'Kaupungit',
  },
  Babies: {
    sv: 'Bebisar',
    no: 'Babyer',
    da: 'Babyer',
    de: 'Babys',
    fi: 'Vauvat',
  },
  Flowers: {
    sv: 'Blommor',
    no: 'Blomster',
    da: 'Blomster',
    de: 'Blumen',
    fi: 'Kukat',
  },
  // --- Categories ---
} as const;
