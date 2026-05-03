export const members = [
    {
        id: 1,
        name: 'Fay',
        nickname: 'Fay',
        themeColor: '#FF0033',
        image: null,
        symbol: 'F',
        vibe: 'METANARU UNIT',
        catchphrase: 'Voice of the void, Fay.',
        mbti: 'NOT SIGNAL',
        zodiac: 'NOT SIGNAL',
        instagram: 'https://www.instagram.com/laffayza_/',
        highlight: true
    },
    {
        id: 2,
        name: 'Joy',
        nickname: 'Joy',
        themeColor: '#FFD700',
        image: null,
        symbol: 'J',
        vibe: 'METANARU UNIT',
        catchphrase: 'Chaos and light, Joy.',
        mbti: 'NOT SIGNAL',
        zodiac: 'NOT SIGNAL',
        instagram: 'https://www.instagram.com/jerceyjoy/',
        highlight: false
    },
    {
        id: 3,
        name: 'NOT SIGNAL',
        nickname: 'NOT SIGNAL',
        themeColor: '#800080',
        image: null,
        symbol: '?',
        vibe: 'NOT SIGNAL',
        catchphrase: 'Error 404: Signal Not Found',
        mbti: 'NOT SIGNAL',
        zodiac: 'NOT SIGNAL',
        instagram: 'https://instagram.com/metanaru.project',
        highlight: true
    },
    {
        id: 4,
        name: 'Caca',
        nickname: 'Caca',
        themeColor: '#00FF00',
        image: null,
        symbol: 'C',
        vibe: 'METANARU UNIT',
        catchphrase: 'Sweet toxicity, Caca.',
        mbti: 'NOT SIGNAL',
        zodiac: 'NOT SIGNAL',
        instagram: 'https://www.instagram.com/tsyramisyuu/',
        highlight: false
    },
    {
        id: 5,
        name: 'Nera',
        nickname: 'Nera',
        themeColor: '#FFFFFF',
        image: null,
        symbol: 'N',
        vibe: 'METANARU UNIT',
        catchphrase: 'Silver wings, Nera.',
        mbti: 'NOT SIGNAL',
        zodiac: 'NOT SIGNAL',
        instagram: 'https://www.instagram.com/nerasineko/',
        highlight: true
    },
    {
        id: 6,
        name: 'NOT SIGNAL',
        nickname: 'TRAINER',
        themeColor: '#333333',
        image: null,
        symbol: '?',
        vibe: 'TRAINER',
        catchphrase: 'Error 404: Signal Not Found',
        mbti: 'NOT SIGNAL',
        zodiac: 'NOT SIGNAL',
        instagram: 'https://instagram.com/metanaru.project',
        highlight: false
    }
];

export const SOCIAL_LINKS = {
    whatsapp_channel: 'https://whatsapp.com/channel/0029Vaq7Hci3bbV7UteZjp3Y',
    instagram: 'https://instagram.com/metanaru.project',
    youtube: 'https://youtube.com/@metanaruproject',
    tiktok: 'https://www.tiktok.com/@metanaru',
    whatsapp_fanbase: 'https://chat.whatsapp.com/FH8Z6Y5oSu3LOAUY0HM2ea'
};

export const SLOGAN = 'GROWTH GROWL DROWN';

export const PRICING = {
    REGULAR_GROUP: 30000,
    REGULAR_SOLO: 25000,
};

export const calculatePrice = (chekiType) => {
    return chekiType === 'group' ? PRICING.REGULAR_GROUP : PRICING.REGULAR_SOLO;
};

export const events = [
    { id: 1, name: 'BABYMETAL TRIBUTE', type: 'Special', date: '20 DES', time: '19:00 WIB', location: 'Surabaya' },
    { id: 2, name: 'MOSHPIT PARADISE', type: 'Reguler', date: 'SETIAP SABTU', time: '20:30 WIB', location: 'Surabaya' },
];

export const LATEST_POSTS = [
    {
        id: 1,
        title: 'OTSU-NARU @ OTUMUSE',
        date: '18 APRIL 2026',
        category: 'REKAP EVENT',
        image: null,
        description: 'Malam yang luar biasa di Otumuse. Terima kasih semua.'
    },
    {
        id: 2,
        title: 'NEXT STAGE: METANARU',
        date: '12 APRIL 2026',
        category: 'PENGUMUMAN',
        image: null,
        description: 'Persiapan untuk panggung berikutnya. Sampai jumpa.'
    }
];

export const ACTIVE_SESSIONS = [
    { id: 1, memberId: 1, eventName: 'Sesi Anniversary ke-1', status: 'LIVE', stock: 12 },
    { id: 2, memberId: 3, eventName: 'Sesi Anniversary ke-1', status: 'LIVE', stock: 5 },
    { id: 3, memberId: 5, eventName: 'Sesi Anniversary ke-1', status: 'PRE-ORDER', stock: 20 },
    { id: 4, memberId: 2, eventName: 'Sesi Anniversary ke-1', status: 'SOLD OUT', stock: 0 },
];

export const LEADERBOARD = [
    { id: 1, name: 'FanSejati88', total: 45 },
    { id: 2, name: 'MetanaruLover', total: 32 },
    { id: 3, name: 'Rikka_Kun', total: 28 },
];

export const RECENT_ACTIVITY = [
    { id: 1, user: 'UserX', member: 'Fay', time: '2 menit lalu' },
    { id: 2, user: 'UserY', member: 'Nera', time: '5 menit lalu' },
    { id: 3, user: 'UserZ', member: 'Moi', time: '10 menit lalu' },
];
