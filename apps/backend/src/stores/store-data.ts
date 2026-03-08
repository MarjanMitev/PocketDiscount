/**
 * Default store list for seeding the database. Used by scripts/seed-stores.ts.
 */
export interface StoreLocationSeed {
  id: string;
  retailer: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  color: string;
  openingHours?: string;
}

export const STORE_LOCATIONS: StoreLocationSeed[] = [
  { id: 'ah-1', retailer: 'Albert Heijn', name: 'AH Amsterdam Centraal', address: 'Nieuwezijds Voorburgwal 226', city: 'Amsterdam', lat: 52.3731, lng: 4.8939, color: '#00AEEF', openingHours: 'Ma-Za 07:00-22:00, Zo 10:00-20:00' },
  { id: 'ah-2', retailer: 'Albert Heijn', name: 'AH Amsterdam Westermarkt', address: 'Marnixstraat 401', city: 'Amsterdam', lat: 52.3752, lng: 4.8818, color: '#00AEEF', openingHours: 'Ma-Za 08:00-21:00, Zo 10:00-20:00' },
  { id: 'ah-3', retailer: 'Albert Heijn', name: 'AH Amsterdam Oost', address: 'Linnaeusstraat 91', city: 'Amsterdam', lat: 52.3625, lng: 4.9298, color: '#00AEEF', openingHours: 'Ma-Za 08:00-21:00' },
  { id: 'ah-4', retailer: 'Albert Heijn', name: 'AH Rotterdam Centrum', address: 'Binnenwegplein 22', city: 'Rotterdam', lat: 51.9204, lng: 4.4777, color: '#00AEEF', openingHours: 'Ma-Za 07:00-22:00' },
  { id: 'ah-5', retailer: 'Albert Heijn', name: 'AH Den Haag Centrum', address: 'Grote Marktstraat 53', city: 'Den Haag', lat: 52.0771, lng: 4.3125, color: '#00AEEF', openingHours: 'Ma-Za 08:00-21:00' },

  { id: 'jumbo-1', retailer: 'Jumbo', name: 'Jumbo Amsterdam Kalverstraat', address: 'Kalverstraat 183', city: 'Amsterdam', lat: 52.3702, lng: 4.8952, color: '#FFD700', openingHours: 'Ma-Za 08:00-21:00, Zo 10:00-20:00' },
  { id: 'jumbo-2', retailer: 'Jumbo', name: 'Jumbo Amsterdam Noord', address: 'Buikslotermeerplein 201', city: 'Amsterdam', lat: 52.4037, lng: 4.9279, color: '#FFD700', openingHours: 'Ma-Za 08:00-21:00' },
  { id: 'jumbo-3', retailer: 'Jumbo', name: 'Jumbo Rotterdam Blaak', address: 'Blaak 31', city: 'Rotterdam', lat: 51.9175, lng: 4.4892, color: '#FFD700', openingHours: 'Ma-Za 07:30-21:00' },
  { id: 'jumbo-4', retailer: 'Jumbo', name: 'Jumbo Den Haag', address: 'Spuistraat 167', city: 'Den Haag', lat: 52.0805, lng: 4.3142, color: '#FFD700', openingHours: 'Ma-Za 08:00-21:00' },

  { id: 'lidl-1', retailer: 'Lidl', name: 'Lidl Amsterdam Middenweg', address: 'Middenweg 139', city: 'Amsterdam', lat: 52.3623, lng: 4.9268, color: '#0050AA', openingHours: 'Ma-Za 08:00-21:00, Zo 10:00-19:00' },
  { id: 'lidl-2', retailer: 'Lidl', name: 'Lidl Amsterdam West', address: 'Jan Evertsenstraat 100', city: 'Amsterdam', lat: 52.3716, lng: 4.8492, color: '#0050AA', openingHours: 'Ma-Za 08:00-21:00' },
  { id: 'lidl-3', retailer: 'Lidl', name: 'Lidl Rotterdam Crooswijk', address: 'Crooswijkseweg 73', city: 'Rotterdam', lat: 51.9287, lng: 4.5003, color: '#0050AA', openingHours: 'Ma-Za 08:00-21:00' },

  { id: 'aldi-1', retailer: 'Aldi', name: 'Aldi Amsterdam Osdorp', address: 'Osdorpplein 106', city: 'Amsterdam', lat: 52.3619, lng: 4.8003, color: '#1F5CA9', openingHours: 'Ma-Za 08:00-20:00, Zo 10:00-19:00' },
  { id: 'aldi-2', retailer: 'Aldi', name: 'Aldi Rotterdam Hillegersberg', address: 'Kleiwegstraat 47', city: 'Rotterdam', lat: 51.9372, lng: 4.4953, color: '#1F5CA9', openingHours: 'Ma-Za 08:00-20:00' },

  { id: 'dirk-1', retailer: 'Dirk', name: 'Dirk Amsterdam De Pijp', address: 'Ferdinand Bolstraat 128', city: 'Amsterdam', lat: 52.3537, lng: 4.8979, color: '#E30613', openingHours: 'Ma-Za 08:00-21:00, Zo 10:00-19:00' },
  { id: 'dirk-2', retailer: 'Dirk', name: 'Dirk Amsterdam Oost', address: 'Wibautstraat 117', city: 'Amsterdam', lat: 52.3545, lng: 4.9205, color: '#E30613', openingHours: 'Ma-Za 08:00-21:00' },

  { id: 'plus-1', retailer: 'Plus', name: 'Plus Amsterdam De Pijp', address: 'Ruysdaelkade 71', city: 'Amsterdam', lat: 52.3527, lng: 4.9009, color: '#FF6600', openingHours: 'Ma-Za 08:00-20:00' },
  { id: 'plus-2', retailer: 'Plus', name: 'Plus Utrecht Centrum', address: 'Vredenburg 45', city: 'Utrecht', lat: 52.0931, lng: 5.1172, color: '#FF6600', openingHours: 'Ma-Za 08:00-21:00' },

  { id: 'vomar-1', retailer: 'Vomar', name: 'Vomar Alkmaar', address: 'Koelmalaan 350', city: 'Alkmaar', lat: 52.6292, lng: 4.7461, color: '#E2001A', openingHours: 'Ma-Za 08:00-21:00' },
  { id: 'vomar-2', retailer: 'Vomar', name: 'Vomar Haarlem', address: 'Marsmanplein 1', city: 'Haarlem', lat: 52.3925, lng: 4.6449, color: '#E2001A', openingHours: 'Ma-Za 08:00-21:00' },

  { id: 'spar-1', retailer: 'Spar', name: 'Spar Amsterdam Centrum', address: 'Leidsestraat 74', city: 'Amsterdam', lat: 52.3669, lng: 4.8825, color: '#007A3D', openingHours: 'Ma-Zo 08:00-22:00' },

  { id: 'etos-1', retailer: 'Etos', name: 'Etos Amsterdam Centrum', address: 'Kalverstraat 88', city: 'Amsterdam', lat: 52.3718, lng: 4.8945, color: '#005BAA', openingHours: 'Ma-Za 09:00-20:00, Zo 11:00-18:00' },
  { id: 'etos-2', retailer: 'Etos', name: 'Etos Rotterdam Lijnbaan', address: 'Lijnbaan 20', city: 'Rotterdam', lat: 51.9192, lng: 4.4780, color: '#005BAA', openingHours: 'Ma-Za 09:00-20:00' },
];
