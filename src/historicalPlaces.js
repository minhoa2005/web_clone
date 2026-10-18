import { EVENTS, LOCATIONS, PERIODS } from './history.js';

const COUNTRIES = {
  saigon: ['Việt Nam', 'Vietnam'], hanoi: ['Việt Nam', 'Vietnam'],
  paris: ['Pháp', 'France'], tours: ['Pháp', 'France'],
  moscow: ['Liên Xô', 'Russia'], guangzhou: ['Trung Quốc', 'China'],
  hongkong: ['Hương Cảng', 'China'], macau: ['Ma Cao', 'China'],
  caobang: ['Việt Nam', 'Vietnam'], tuyenquang: ['Việt Nam', 'Vietnam'],
  dienbien: ['Việt Nam', 'Vietnam'], geneva: ['Thụy Sĩ', 'Switzerland'],
  beijing: ['Trung Quốc', 'China'], brunei: ['Brunei', 'Brunei'],
};

// Adapt the sourced event records to the original clone's place/card contract.
export const HISTORICAL_PLACES = EVENTS.map((event) => {
  const location = LOCATIONS[event.places[0]];
  const period = PERIODS.find((item) => item.id === event.period);
  const [country, mapCountry] = COUNTRIES[location?.id] || ['Việt Nam · phạm vi cả nước', null];
  return {
    ...event,
    city: event.short,
    country,
    mapCountry,
    lat: location?.lat ?? null,
    lng: location?.lng ?? null,
    locationName: location?.name || null,
    locationToday: location?.today || null,
    region: `${period.range} · ${period.title}`,
    note: event.summary,
    annotation: event.note,
    photos: event.pages.map((page) => ({
      src: `assets/sources/page-${page}.webp`,
      title: `Giáo trình 2021 · trang ${page}`,
    })),
  };
});

export const PLACES = HISTORICAL_PLACES.filter((event) => ['preparation', 'formation'].includes(event.period));
export const WISHLIST = HISTORICAL_PLACES.filter((event) => !PLACES.includes(event));
export const REGION_ORDER = PERIODS.map((period) => `${period.range} · ${period.title}`);

export function eventLocation(event, locationId) {
  const id = event?.places.includes(locationId) ? locationId : event?.places[0];
  if (!id) return null;
  const [country, mapCountry] = COUNTRIES[id];
  return { ...LOCATIONS[id], country, mapCountry };
}

export function highlightedCountries(list, selected, locationId) {
  const location = eventLocation(selected, locationId);
  return location ? [location.mapCountry] : [];
}

export function historicalPins(list, selected) {
  const pins = new Map();
  for (const event of list) {
    for (const id of event.places) {
      if (!pins.has(id) || event.id === selected?.id) {
        const location = LOCATIONS[id];
        const [country, mapCountry] = COUNTRIES[id];
        pins.set(id, { ...event, locationId: id, lat: location.lat, lng: location.lng, city: location.name, country, mapCountry });
      }
    }
  }
  return [...pins.values()];
}

export function historicalArcs(selected) {
  return (selected?.links || []).map(([from, to]) => ({
    startLat: LOCATIONS[from].lat, startLng: LOCATIONS[from].lng,
    endLat: LOCATIONS[to].lat, endLng: LOCATIONS[to].lng,
  }));
}
