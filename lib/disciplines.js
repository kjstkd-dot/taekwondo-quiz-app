import { GYEORUGI_BANK } from './banks/gyeorugi';
import { PUMSAE_BANK } from './banks/pumsae';
import { GYEOKPA_BANK } from './banks/gyeokpa';

export const DISCIPLINE_KEYS = ['gyeorugi', 'pumsae', 'gyeokpa'];

export const DISCIPLINES = {
  gyeorugi: {
    key: 'gyeorugi',
    ko: '겨루기',
    en: 'GYEORUGI',
    primary: '#1E2761',
    primaryInk: '#141c4d',
    accent: '#C0392B',
    accentInk: '#9c2e21',
    font: "'Black Han Sans', sans-serif",
    bank: GYEORUGI_BANK,
  },
  pumsae: {
    key: 'pumsae',
    ko: '품새',
    en: 'POOMSAE',
    primary: '#8B2E22',
    primaryInk: '#6E2419',
    accent: '#C99A3A',
    accentInk: '#A97F2A',
    font: "'Song Myung', serif",
    bank: PUMSAE_BANK,
  },
  gyeokpa: {
    key: 'gyeokpa',
    ko: '격파',
    en: 'GYEOKPA',
    primary: '#1F6F4A',
    primaryInk: '#17573A',
    accent: '#E07B29',
    accentInk: '#BE651E',
    font: "'Do Hyeon', sans-serif",
    bank: GYEOKPA_BANK,
  },
};
