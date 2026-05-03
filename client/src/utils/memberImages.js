export const DEFAULT_MEMBER_IMAGE = '/photo/hero/intro.jpg';

const LOCAL_MEMBER_IMAGE_BY_ID = Object.freeze({});
const LOCAL_MEMBER_IMAGE_BY_NICKNAME = Object.freeze({});
const LOCAL_MEMBER_CHEKI_IMAGE_BY_ID = Object.freeze({});
const LOCAL_MEMBER_CHEKI_IMAGE_BY_NICKNAME = Object.freeze({});

const normalizeNickname = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    const match = raw.match(/[a-z0-9]+/);
    return match ? match[0] : '';
};

export const getLocalMemberImage = (member) => {
    const id = Number(member?.id);
    if (LOCAL_MEMBER_IMAGE_BY_ID[id]) {
        return LOCAL_MEMBER_IMAGE_BY_ID[id];
    }

    const nickname = normalizeNickname(member?.nickname || member?.name || member?.fullname);
    if (nickname && LOCAL_MEMBER_IMAGE_BY_NICKNAME[nickname]) {
        return LOCAL_MEMBER_IMAGE_BY_NICKNAME[nickname];
    }

    return null;
};

export const getMemberImageSrc = (member) => {
    return getLocalMemberImage(member) || member?.image || member?.image_url || DEFAULT_MEMBER_IMAGE;
};

export const getMemberFallbackImage = (member) => {
    return getLocalMemberImage(member) || DEFAULT_MEMBER_IMAGE;
};

export const getMemberChekiImageSrc = (member) => {
    const id = Number(member?.id);
    const nickname = normalizeNickname(member?.nickname || member?.name || member?.fullname);
    
    if (nickname && LOCAL_MEMBER_CHEKI_IMAGE_BY_NICKNAME[nickname]) {
        return LOCAL_MEMBER_CHEKI_IMAGE_BY_NICKNAME[nickname];
    }

    if (id && LOCAL_MEMBER_CHEKI_IMAGE_BY_ID[id]) {
        return LOCAL_MEMBER_CHEKI_IMAGE_BY_ID[id];
    }

    return getLocalMemberImage(member) || DEFAULT_MEMBER_IMAGE;
};

export const LOCAL_MEMBER_IMAGES = Object.freeze(Object.values(LOCAL_MEMBER_IMAGE_BY_ID));
