export type SeasonalRow = {
  titleKey: string;
  searchTerm: string;
};

/**
 * Returns the appropriate seasonal rows based on the current month
 */
export function getSeasonalRows(): SeasonalRow[] {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (0 = January, 11 = December)
  const rows: SeasonalRow[] = [];

  // January - New Year
  if (month === 0) {
    rows.push({ titleKey: 'New Year', searchTerm: 'new year celebration' });
    rows.push({ titleKey: 'Winter sports', searchTerm: 'winter sports skiing snowboarding' });
  }

  // February - Valentine
  if (month === 1) {
    rows.push({ titleKey: 'Valentine', searchTerm: 'valentine love hearts' });
    rows.push({ titleKey: 'Cozy moments', searchTerm: 'cozy fireplace winter' });
  }

  // March - Spring begins, Easter
  if (month === 2) {
    rows.push({ titleKey: 'Easter', searchTerm: 'easter eggs spring' });
    rows.push({ titleKey: 'Cherry blossoms', searchTerm: 'cherry blossom sakura' });
  }

  // April - Earth Day, Spring blooms
  if (month === 3) {
    rows.push({ titleKey: 'Earth Day', searchTerm: 'earth nature planet green' });
    rows.push({ titleKey: 'Tulips', searchTerm: 'tulips colorful flowers' });
  }

  // May - Mother's Day, Spring gardens
  if (month === 4) {
    rows.push({ titleKey: 'Gardens', searchTerm: 'garden flowers beautiful' });
    rows.push({ titleKey: 'Butterflies', searchTerm: 'butterfly colorful nature' });
  }

  // June - Summer begins, Father's Day, Pride
  if (month === 5) {
    rows.push({ titleKey: 'Pride', searchTerm: 'pride rainbow colorful celebration' });
    rows.push({ titleKey: 'Tropical paradise', searchTerm: 'tropical beach paradise' });
  }

  // July - Summer vacation
  if (month === 6) {
    rows.push({ titleKey: 'Summer vacation', searchTerm: 'summer vacation travel beach' });
    rows.push({ titleKey: 'Sunflowers', searchTerm: 'sunflowers field yellow' });
  }

  // August - Late summer
  if (month === 7) {
    rows.push({ titleKey: 'Camping', searchTerm: 'camping tent outdoor adventure' });
    rows.push({ titleKey: 'Sunsets', searchTerm: 'sunset beautiful sky colors' });
  }

  // September - Back to school, Autumn begins
  if (month === 8) {
    rows.push({ titleKey: 'Harvest time', searchTerm: 'harvest vegetables farm autumn' });
    rows.push({ titleKey: 'Cozy autumn', searchTerm: 'autumn cozy sweater pumpkin' });
  }

  // October - Halloween
  if (month === 9) {
    rows.push({ titleKey: 'Halloween', searchTerm: 'halloween pumpkin spooky' });
    rows.push({ titleKey: 'Fall foliage', searchTerm: 'fall foliage autumn leaves trees' });
  }

  // November - Thanksgiving
  if (month === 10) {
    rows.push({ titleKey: 'Thanksgiving', searchTerm: 'thanksgiving harvest gratitude' });
    rows.push({ titleKey: 'Cozy hygge', searchTerm: 'hygge cozy candles warm' });
  }

  // December - Christmas
  if (month === 11) {
    rows.push({ titleKey: 'Christmas', searchTerm: 'christmas' });
    rows.push({ titleKey: 'Winter magic', searchTerm: 'winter snow magical lights' });
  }

  // Winter: December, January, February
  if (month === 11 || month === 0 || month === 1) {
    rows.push({ titleKey: 'Winter wonderland', searchTerm: 'winter snow landscape' });
  }

  // Spring: March, April, May
  if (month >= 2 && month <= 4) {
    rows.push({ titleKey: 'Spring flowers', searchTerm: 'spring flowers bloom' });
  }

  // Summer: June, July, August
  if (month >= 5 && month <= 7) {
    rows.push({ titleKey: 'Summer vibes', searchTerm: 'summer beach sunshine' });
  }

  // Autumn: September, October, November
  if (month >= 8 && month <= 10) {
    rows.push({ titleKey: 'Autumn colors', searchTerm: 'autumn fall leaves' });
  }

  return rows;
}
