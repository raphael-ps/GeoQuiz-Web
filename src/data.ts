import { Country } from './types';

export const COUNTRIES: Country[] = [
  {
    id: 'br',
    name: 'Brazil',
    flag: 'https://flagcdn.com/w320/br.png',
    capital: 'Brasília',
    continent: 'South America',
    landmark: { name: 'Christ the Redeemer', image: 'https://picsum.photos/seed/rio/400/300' },
    fact: 'Brazil is the only country in the Americas to speak Portuguese.',
    coordinates: [-47.9292, -15.7801]
  },
  {
    id: 'jp',
    name: 'Japan',
    flag: 'https://flagcdn.com/w320/jp.png',
    capital: 'Tokyo',
    continent: 'Asia',
    landmark: { name: 'Mount Fuji', image: 'https://picsum.photos/seed/fuji/400/300' },
    fact: 'Japan has the highest number of vending machines per capita in the world.',
    coordinates: [139.6917, 35.6895]
  },
  {
    id: 'ca',
    name: 'Canada',
    flag: 'https://flagcdn.com/w320/ca.png',
    capital: 'Ottawa',
    continent: 'North America',
    landmark: { name: 'Niagara Falls', image: 'https://picsum.photos/seed/niagara/400/300' },
    fact: 'Canada has more lakes than the rest of the world combined.',
    coordinates: [-75.6972, 45.4215]
  },
  {
    id: 'fr',
    name: 'France',
    flag: 'https://flagcdn.com/w320/fr.png',
    capital: 'Paris',
    continent: 'Europe',
    landmark: { name: 'Eiffel Tower', image: 'https://picsum.photos/seed/eiffel/400/300' },
    fact: 'France is the most visited country in the world.',
    coordinates: [2.3522, 48.8566]
  },
  {
    id: 'it',
    name: 'Italy',
    flag: 'https://flagcdn.com/w320/it.png',
    capital: 'Rome',
    continent: 'Europe',
    landmark: { name: 'Colosseum', image: 'https://picsum.photos/seed/colosseum/400/300' },
    fact: 'Italy has more UNESCO World Heritage sites than any other country.',
    coordinates: [12.4964, 41.9028]
  },
  {
    id: 'eg',
    name: 'Egypt',
    flag: 'https://flagcdn.com/w320/eg.png',
    capital: 'Cairo',
    continent: 'Africa',
    landmark: { name: 'Great Pyramid of Giza', image: 'https://picsum.photos/seed/pyramid/400/300' },
    fact: 'The Great Pyramid of Giza is the oldest of the Seven Wonders of the Ancient World.',
    coordinates: [31.2357, 30.0444]
  },
  {
    id: 'ar',
    name: 'Argentina',
    flag: 'https://flagcdn.com/w320/ar.png',
    capital: 'Buenos Aires',
    continent: 'South America',
    landmark: { name: 'Iguazu Falls', image: 'https://picsum.photos/seed/iguazu/400/300' },
    fact: 'Argentina is the birthplace of the Tango.',
    coordinates: [-58.3816, -34.6037]
  },
  {
    id: 'au',
    name: 'Australia',
    flag: 'https://flagcdn.com/w320/au.png',
    capital: 'Canberra',
    continent: 'Oceania',
    landmark: { name: 'Sydney Opera House', image: 'https://picsum.photos/seed/opera/400/300' },
    fact: 'Australia is the only continent that is also a country.',
    coordinates: [149.1287, -35.2809]
  },
  {
    id: 'de',
    name: 'Germany',
    flag: 'https://flagcdn.com/w320/de.png',
    capital: 'Berlin',
    continent: 'Europe',
    landmark: { name: 'Brandenburg Gate', image: 'https://picsum.photos/seed/brandenburg/400/300' },
    fact: 'Germany was the first country in the world to adopt Daylight Saving Time.',
    coordinates: [13.4050, 52.5200]
  },
  {
    id: 'za',
    name: 'South Africa',
    flag: 'https://flagcdn.com/w320/za.png',
    capital: 'Pretoria',
    continent: 'Africa',
    landmark: { name: 'Table Mountain', image: 'https://picsum.photos/seed/table/400/300' },
    fact: 'South Africa has three different capital cities.',
    coordinates: [28.1881, -25.7479]
  },
  {
    id: 'pt',
    name: 'Portugal',
    flag: 'https://flagcdn.com/w320/pt.png',
    capital: 'Lisbon',
    continent: 'Europe',
    landmark: { name: 'Belém Tower', image: 'https://picsum.photos/seed/belem/400/300' },
    fact: 'Portugal is the oldest nation-state in Europe.',
    coordinates: [-9.1393, 38.7223]
  },
  {
    id: 'in',
    name: 'India',
    flag: 'https://flagcdn.com/w320/in.png',
    capital: 'New Delhi',
    continent: 'Asia',
    landmark: { name: 'Taj Mahal', image: 'https://picsum.photos/seed/taj/400/300' },
    fact: 'India is the world\'s largest democracy.',
    coordinates: [77.2090, 28.6139]
  },
  {
    id: 'mx',
    name: 'Mexico',
    flag: 'https://flagcdn.com/w320/mx.png',
    capital: 'Mexico City',
    continent: 'North America',
    landmark: { name: 'Chichen Itza', image: 'https://picsum.photos/seed/chichen/400/300' },
    fact: 'The Great Pyramid of Cholula in Mexico is the largest pyramid in the world by volume.',
    coordinates: [-99.1332, 19.4326]
  },
  {
    id: 'cn',
    name: 'China',
    flag: 'https://flagcdn.com/w320/cn.png',
    capital: 'Beijing',
    continent: 'Asia',
    landmark: { name: 'Great Wall of China', image: 'https://picsum.photos/seed/greatwall/400/300' },
    fact: 'China has the largest population in the world.',
    coordinates: [116.4074, 39.9042]
  },
  {
    id: 'ru',
    name: 'Russia',
    flag: 'https://flagcdn.com/w320/ru.png',
    capital: 'Moscow',
    continent: 'Europe/Asia',
    landmark: { name: 'Saint Basil\'s Cathedral', image: 'https://picsum.photos/seed/basil/400/300' },
    fact: 'Russia is the largest country in the world by land area.',
    coordinates: [37.6173, 55.7558]
  },
  {
    id: 'us',
    name: 'United States',
    flag: 'https://flagcdn.com/w320/us.png',
    capital: 'Washington, D.C.',
    continent: 'North America',
    landmark: { name: 'Statue of Liberty', image: 'https://picsum.photos/seed/liberty/400/300' },
    fact: 'The United States has the world\'s largest economy.',
    coordinates: [-77.0369, 38.9072]
  },
  {
    id: 'gb',
    name: 'United Kingdom',
    flag: 'https://flagcdn.com/w320/gb.png',
    capital: 'London',
    continent: 'Europe',
    landmark: { name: 'Big Ben', image: 'https://picsum.photos/seed/bigben/400/300' },
    fact: 'The UK is the only country in the world with no written constitution.',
    coordinates: [-0.1276, 51.5074]
  },
  {
    id: 'gr',
    name: 'Greece',
    flag: 'https://flagcdn.com/w320/gr.png',
    capital: 'Athens',
    continent: 'Europe',
    landmark: { name: 'Parthenon', image: 'https://picsum.photos/seed/parthenon/400/300' },
    fact: 'Greece is considered the cradle of Western civilization.',
    coordinates: [23.7275, 37.9838]
  },
  {
    id: 'tr',
    name: 'Turkey',
    flag: 'https://flagcdn.com/w320/tr.png',
    capital: 'Ankara',
    continent: 'Europe/Asia',
    landmark: { name: 'Hagia Sophia', image: 'https://picsum.photos/seed/hagia/400/300' },
    fact: 'Istanbul is the only city in the world that spans two continents.',
    coordinates: [32.8597, 39.9334]
  },
  {
    id: 'kr',
    name: 'South Korea',
    flag: 'https://flagcdn.com/w320/kr.png',
    capital: 'Seoul',
    continent: 'Asia',
    landmark: { name: 'Gyeongbokgung Palace', image: 'https://picsum.photos/seed/seoul/400/300' },
    fact: 'South Korea has the world\'s fastest average internet speed.',
    coordinates: [126.9780, 37.5665]
  },
  {
    id: 'th',
    name: 'Thailand',
    flag: 'https://flagcdn.com/w320/th.png',
    capital: 'Bangkok',
    continent: 'Asia',
    landmark: { name: 'Wat Arun', image: 'https://picsum.photos/seed/bangkok/400/300' },
    fact: 'Thailand is the only Southeast Asian nation that was never colonized by a European power.',
    coordinates: [100.5018, 13.7563]
  },
  {
    id: 'vn',
    name: 'Vietnam',
    flag: 'https://flagcdn.com/w320/vn.png',
    capital: 'Hanoi',
    continent: 'Asia',
    landmark: { name: 'Ha Long Bay', image: 'https://picsum.photos/seed/halong/400/300' },
    fact: 'Vietnam is the world\'s second-largest coffee exporter.',
    coordinates: [105.8342, 21.0285]
  },
  {
    id: 'id',
    name: 'Indonesia',
    flag: 'https://flagcdn.com/w320/id.png',
    capital: 'Jakarta',
    continent: 'Asia',
    landmark: { name: 'Borobudur', image: 'https://picsum.photos/seed/borobudur/400/300' },
    fact: 'Indonesia is the world\'s largest island country, with over 17,000 islands.',
    coordinates: [106.8456, -6.2088]
  },
  {
    id: 'ng',
    name: 'Nigeria',
    flag: 'https://flagcdn.com/w320/ng.png',
    capital: 'Abuja',
    continent: 'Africa',
    landmark: { name: 'Zuma Rock', image: 'https://picsum.photos/seed/zuma/400/300' },
    fact: 'Nigeria is the most populous country in Africa.',
    coordinates: [7.4951, 9.0579]
  },
  {
    id: 'ke',
    name: 'Kenya',
    flag: 'https://flagcdn.com/w320/ke.png',
    capital: 'Nairobi',
    continent: 'Africa',
    landmark: { name: 'Maasai Mara', image: 'https://picsum.photos/seed/mara/400/300' },
    fact: 'Kenya is world-famous for its long-distance runners.',
    coordinates: [36.8219, -1.2921]
  },
  {
    id: 'ma',
    name: 'Morocco',
    flag: 'https://flagcdn.com/w320/ma.png',
    capital: 'Rabat',
    continent: 'Africa',
    landmark: { name: 'Hassan II Mosque', image: 'https://picsum.photos/seed/casablanca/400/300' },
    fact: 'Morocco is the world\'s largest exporter of sardines.',
    coordinates: [-6.8498, 34.0209]
  },
  {
    id: 'es',
    name: 'Spain',
    flag: 'https://flagcdn.com/w320/es.png',
    capital: 'Madrid',
    continent: 'Europe',
    landmark: { name: 'Sagrada Família', image: 'https://picsum.photos/seed/sagrada/400/300' },
    fact: 'Spain produces about 44% of the world\'s olive oil.',
    coordinates: [-3.7038, 40.4168]
  },
  {
    id: 'nl',
    name: 'Netherlands',
    flag: 'https://flagcdn.com/w320/nl.png',
    capital: 'Amsterdam',
    continent: 'Europe',
    landmark: { name: 'Kinderdijk Windmills', image: 'https://picsum.photos/seed/windmills/400/300' },
    fact: 'The Netherlands is the world\'s second-largest exporter of food and agricultural products.',
    coordinates: [4.8952, 52.3702]
  },
  {
    id: 'ch',
    name: 'Switzerland',
    flag: 'https://flagcdn.com/w320/ch.png',
    capital: 'Bern',
    continent: 'Europe',
    landmark: { name: 'The Matterhorn', image: 'https://picsum.photos/seed/matterhorn/400/300' },
    fact: 'Switzerland has four national languages: German, French, Italian, and Romansh.',
    coordinates: [7.4474, 46.9480]
  },
  {
    id: 'se',
    name: 'Sweden',
    flag: 'https://flagcdn.com/w320/se.png',
    capital: 'Stockholm',
    continent: 'Europe',
    landmark: { name: 'Vasa Museum', image: 'https://picsum.photos/seed/vasa/400/300' },
    fact: 'Sweden has the most islands of any country in the world (over 220,000).',
    coordinates: [18.0686, 59.3293]
  },
  {
    id: 'no',
    name: 'Norway',
    flag: 'https://flagcdn.com/w320/no.png',
    capital: 'Oslo',
    continent: 'Europe',
    landmark: { name: 'Geirangerfjord', image: 'https://picsum.photos/seed/fjord/400/300' },
    fact: 'Norway introduced salmon sushi to Japan in the 1980s.',
    coordinates: [10.7522, 59.9139]
  },
  {
    id: 'pe',
    name: 'Peru',
    flag: 'https://flagcdn.com/w320/pe.png',
    capital: 'Lima',
    continent: 'South America',
    landmark: { name: 'Machu Picchu', image: 'https://picsum.photos/seed/machupicchu/400/300' },
    fact: 'Peru is home to the highest sand dune in the world, Cerro Blanco.',
    coordinates: [-77.0428, -12.0464]
  },
  {
    id: 'cl',
    name: 'Chile',
    flag: 'https://flagcdn.com/w320/cl.png',
    capital: 'Santiago',
    continent: 'South America',
    landmark: { name: 'Easter Island', image: 'https://picsum.photos/seed/easter/400/300' },
    fact: 'Chile is the world\'s longest country from north to south.',
    coordinates: [-70.6693, -33.4489]
  },
  {
    id: 'co',
    name: 'Colombia',
    flag: 'https://flagcdn.com/w320/co.png',
    capital: 'Bogotá',
    continent: 'South America',
    landmark: { name: 'Salt Cathedral of Zipaquirá', image: 'https://picsum.photos/seed/salt/400/300' },
    fact: 'Colombia is the only country in South America with coastlines on both the Pacific and Atlantic oceans.',
    coordinates: [-74.0721, 4.7110]
  },
  {
    id: 'nz',
    name: 'New Zealand',
    flag: 'https://flagcdn.com/w320/nz.png',
    capital: 'Wellington',
    continent: 'Oceania',
    landmark: { name: 'Milford Sound', image: 'https://picsum.photos/seed/milford/400/300' },
    fact: 'New Zealand was the first country to give women the right to vote.',
    coordinates: [174.7762, -41.2865]
  },
  {
    id: 'ph',
    name: 'Philippines',
    flag: 'https://flagcdn.com/w320/ph.png',
    capital: 'Manila',
    continent: 'Asia',
    landmark: { name: 'Chocolate Hills', image: 'https://picsum.photos/seed/chocolate/400/300' },
    fact: 'The Philippines is the world\'s leading exporter of coconuts.',
    coordinates: [120.9842, 14.5995]
  },
  {
    id: 'be',
    name: 'Belgium',
    flag: 'https://flagcdn.com/w320/be.png',
    capital: 'Brussels',
    continent: 'Europe',
    landmark: { name: 'Atomium', image: 'https://picsum.photos/seed/atomium/400/300' },
    fact: 'Belgium produces over 220,000 tons of chocolate every year.',
    coordinates: [4.3517, 50.8503]
  },
  {
    id: 'at',
    name: 'Austria',
    flag: 'https://flagcdn.com/w320/at.png',
    capital: 'Vienna',
    continent: 'Europe',
    landmark: { name: 'Schönbrunn Palace', image: 'https://picsum.photos/seed/vienna/400/300' },
    fact: 'Austria is one of the world\'s most mountainous countries, with the Alps covering 62% of its land.',
    coordinates: [16.3738, 48.2082]
  },
  {
    id: 'ie',
    name: 'Ireland',
    flag: 'https://flagcdn.com/w320/ie.png',
    capital: 'Dublin',
    continent: 'Europe',
    landmark: { name: 'Cliffs of Moher', image: 'https://picsum.photos/seed/cliffs/400/300' },
    fact: 'Ireland is known as the "Emerald Isle" because of its lush green landscape.',
    coordinates: [-6.2603, 53.3498]
  },
  {
    id: 'pl',
    name: 'Poland',
    flag: 'https://flagcdn.com/w320/pl.png',
    capital: 'Warsaw',
    continent: 'Europe',
    landmark: { name: 'Wawel Royal Castle', image: 'https://picsum.photos/seed/poland/400/300' },
    fact: 'Poland has 17 Nobel Prize winners, including Marie Curie.',
    coordinates: [21.0122, 52.2297]
  },
  {
    id: 'cz',
    name: 'Czech Republic',
    flag: 'https://flagcdn.com/w320/cz.png',
    capital: 'Prague',
    continent: 'Europe',
    landmark: { name: 'Charles Bridge', image: 'https://picsum.photos/seed/prague/400/300' },
    fact: 'The Czech Republic has the highest beer consumption per capita in the world.',
    coordinates: [14.4378, 50.0755]
  },
  {
    id: 'hu',
    name: 'Hungary',
    flag: 'https://flagcdn.com/w320/hu.png',
    capital: 'Budapest',
    continent: 'Europe',
    landmark: { name: 'Hungarian Parliament Building', image: 'https://picsum.photos/seed/budapest/400/300' },
    fact: 'The Rubik\'s Cube was invented by a Hungarian architect, Ernő Rubik.',
    coordinates: [19.0402, 47.4979]
  },
  {
    id: 'fi',
    name: 'Finland',
    flag: 'https://flagcdn.com/w320/fi.png',
    capital: 'Helsinki',
    continent: 'Europe',
    landmark: { name: 'Santa Claus Village', image: 'https://picsum.photos/seed/finland/400/300' },
    fact: 'Finland has been ranked the world\'s happiest country for several years in a row.',
    coordinates: [24.9384, 60.1699]
  },
  {
    id: 'dk',
    name: 'Denmark',
    flag: 'https://flagcdn.com/w320/dk.png',
    capital: 'Copenhagen',
    continent: 'Europe',
    landmark: { name: 'The Little Mermaid', image: 'https://picsum.photos/seed/denmark/400/300' },
    fact: 'Denmark is the birthplace of LEGO.',
    coordinates: [12.5683, 55.6761]
  },
  {
    id: 'is',
    name: 'Iceland',
    flag: 'https://flagcdn.com/w320/is.png',
    capital: 'Reykjavik',
    continent: 'Europe',
    landmark: { name: 'Blue Lagoon', image: 'https://picsum.photos/seed/iceland/400/300' },
    fact: 'Iceland has no mosquitoes.',
    coordinates: [-21.9424, 64.1466]
  },
  {
    id: 'sg',
    name: 'Singapore',
    flag: 'https://flagcdn.com/w320/sg.png',
    capital: 'Singapore',
    continent: 'Asia',
    landmark: { name: 'Gardens by the Bay', image: 'https://picsum.photos/seed/singapore/400/300' },
    fact: 'Singapore is one of only three city-states in the world.',
    coordinates: [103.8198, 1.3521]
  },
  {
    id: 'my',
    name: 'Malaysia',
    flag: 'https://flagcdn.com/w320/my.png',
    capital: 'Kuala Lumpur',
    continent: 'Asia',
    landmark: { name: 'Petronas Towers', image: 'https://picsum.photos/seed/malaysia/400/300' },
    fact: 'Malaysia has the world\'s largest cave chamber, the Sarawak Chamber.',
    coordinates: [101.6869, 3.1390]
  },
  {
    id: 'ua',
    name: 'Ukraine',
    flag: 'https://flagcdn.com/w320/ua.png',
    capital: 'Kyiv',
    continent: 'Europe',
    landmark: { name: 'Saint Sophia Cathedral', image: 'https://picsum.photos/seed/ukraine/400/300' },
    fact: 'Ukraine is home to the world\'s deepest metro station, Arsenalna.',
    coordinates: [30.5234, 50.4501]
  },
  {
    id: 'pk',
    name: 'Pakistan',
    flag: 'https://flagcdn.com/w320/pk.png',
    capital: 'Islamabad',
    continent: 'Asia',
    landmark: { name: 'Faisal Mosque', image: 'https://picsum.photos/seed/pakistan/400/300' },
    fact: 'Pakistan has the world\'s second-highest mountain, K2.',
    coordinates: [73.0479, 33.6844]
  },
  {
    id: 'sa',
    name: 'Saudi Arabia',
    flag: 'https://flagcdn.com/w320/sa.png',
    capital: 'Riyadh',
    continent: 'Asia',
    landmark: { name: 'Kingdom Centre', image: 'https://picsum.photos/seed/saudi/400/300' },
    fact: 'Saudi Arabia is the largest country in the world without a river.',
    coordinates: [46.6753, 24.7136]
  },
  {
    id: 'ae',
    name: 'United Arab Emirates',
    flag: 'https://flagcdn.com/w320/ae.png',
    capital: 'Abu Dhabi',
    continent: 'Asia',
    landmark: { name: 'Burj Khalifa', image: 'https://picsum.photos/seed/dubai/400/300' },
    fact: 'The Burj Khalifa in Dubai is the tallest building in the world.',
    coordinates: [54.3773, 24.4539]
  },
  {
    id: 'il',
    name: 'Israel',
    flag: 'https://flagcdn.com/w320/il.png',
    capital: 'Jerusalem',
    continent: 'Asia',
    landmark: { name: 'Western Wall', image: 'https://picsum.photos/seed/israel/400/300' },
    fact: 'Israel has the highest number of museums per capita in the world.',
    coordinates: [35.2137, 31.7683]
  }
];

export const BRAZIL_STATES: Country[] = [
  { id: 'ac', name: 'Acre', flag: 'https://flagcdn.com/w320/br-ac.png', capital: 'Rio Branco', continent: 'North', coordinates: [-67.81, -9.97] },
  { id: 'al', name: 'Alagoas', flag: 'https://flagcdn.com/w320/br-al.png', capital: 'Maceió', continent: 'Northeast', coordinates: [-35.73, -9.66] },
  { id: 'ap', name: 'Amapá', flag: 'https://flagcdn.com/w320/br-ap.png', capital: 'Macapá', continent: 'North', coordinates: [-51.06, 0.03] },
  { id: 'am', name: 'Amazonas', flag: 'https://flagcdn.com/w320/br-am.png', capital: 'Manaus', continent: 'North', coordinates: [-60.02, -3.11] },
  { id: 'ba', name: 'Bahia', flag: 'https://flagcdn.com/w320/br-ba.png', capital: 'Salvador', continent: 'Northeast', coordinates: [-38.50, -12.97] },
  { id: 'ce', name: 'Ceará', flag: 'https://flagcdn.com/w320/br-ce.png', capital: 'Fortaleza', continent: 'Northeast', coordinates: [-38.52, -3.73] },
  { id: 'df', name: 'Distrito Federal', flag: 'https://flagcdn.com/w320/br-df.png', capital: 'Brasília', continent: 'Central-West', coordinates: [-47.92, -15.78] },
  { id: 'es', name: 'Espírito Santo', flag: 'https://flagcdn.com/w320/br-es.png', capital: 'Vitória', continent: 'Southeast', coordinates: [-40.33, -20.31] },
  { id: 'go', name: 'Goiás', flag: 'https://flagcdn.com/w320/br-go.png', capital: 'Goiânia', continent: 'Central-West', coordinates: [-49.25, -16.68] },
  { id: 'ma', name: 'Maranhão', flag: 'https://flagcdn.com/w320/br-ma.png', capital: 'São Luís', continent: 'Northeast', coordinates: [-44.30, -2.53] },
  { id: 'mt', name: 'Mato Grosso', flag: 'https://flagcdn.com/w320/br-mt.png', capital: 'Cuiabá', continent: 'Central-West', coordinates: [-56.09, -15.59] },
  { id: 'ms', name: 'Mato Grosso do Sul', flag: 'https://flagcdn.com/w320/br-ms.png', capital: 'Campo Grande', continent: 'Central-West', coordinates: [-54.62, -20.44] },
  { id: 'mg', name: 'Minas Gerais', flag: 'https://flagcdn.com/w320/br-mg.png', capital: 'Belo Horizonte', continent: 'Southeast', coordinates: [-43.93, -19.92] },
  { id: 'pa', name: 'Pará', flag: 'https://flagcdn.com/w320/br-pa.png', capital: 'Belém', continent: 'North', coordinates: [-48.49, -1.45] },
  { id: 'pb', name: 'Paraíba', flag: 'https://flagcdn.com/w320/br-pb.png', capital: 'João Pessoa', continent: 'Northeast', coordinates: [-34.86, -7.11] },
  { id: 'pr', name: 'Paraná', flag: 'https://flagcdn.com/w320/br-pr.png', capital: 'Curitiba', continent: 'South', coordinates: [-49.27, -25.42] },
  { id: 'pe', name: 'Pernambuco', flag: 'https://flagcdn.com/w320/br-pe.png', capital: 'Recife', continent: 'Northeast', coordinates: [-34.88, -8.05] },
  { id: 'pi', name: 'Piauí', flag: 'https://flagcdn.com/w320/br-pi.png', capital: 'Teresina', continent: 'Northeast', coordinates: [-42.80, -5.09] },
  { id: 'rj', name: 'Rio de Janeiro', flag: 'https://flagcdn.com/w320/br-rj.png', capital: 'Rio de Janeiro', continent: 'Southeast', coordinates: [-43.17, -22.90] },
  { id: 'rn', name: 'Rio Grande do Norte', flag: 'https://flagcdn.com/w320/br-rn.png', capital: 'Natal', continent: 'Northeast', coordinates: [-35.20, -5.79] },
  { id: 'rs', name: 'Rio Grande do Sul', flag: 'https://flagcdn.com/w320/br-rs.png', capital: 'Porto Alegre', continent: 'South', coordinates: [-51.22, -30.03] },
  { id: 'ro', name: 'Rondônia', flag: 'https://flagcdn.com/w320/br-ro.png', capital: 'Porto Velho', continent: 'North', coordinates: [-63.90, -8.76] },
  { id: 'rr', name: 'Roraima', flag: 'https://flagcdn.com/w320/br-rr.png', capital: 'Boa Vista', continent: 'North', coordinates: [-60.67, 2.82] },
  { id: 'sc', name: 'Santa Catarina', flag: 'https://flagcdn.com/w320/br-sc.png', capital: 'Florianópolis', continent: 'South', coordinates: [-48.54, -27.59] },
  { id: 'sp', name: 'São Paulo', flag: 'https://flagcdn.com/w320/br-sp.png', capital: 'São Paulo', continent: 'Southeast', coordinates: [-46.63, -23.55] },
  { id: 'se', name: 'Sergipe', flag: 'https://flagcdn.com/w320/br-se.png', capital: 'Aracaju', continent: 'Northeast', coordinates: [-37.07, -10.91] },
  { id: 'to', name: 'Tocantins', flag: 'https://flagcdn.com/w320/br-to.png', capital: 'Palmas', continent: 'North', coordinates: [-48.32, -10.18] }
];
