import { members } from './constants';
import { buildWebpFileName, convertFileToWebp } from './utils/imageUpload';

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
export const API_URL = rawApiUrl.replace(/\/$/, '');

// Persistent Cache helper
const getCache = (key) => {
    try {
        const item = localStorage.getItem(`cache_${key}`);
        if (!item) return null;
        const { data, timestamp } = JSON.parse(item);
        if (Date.now() - timestamp < 15000) return data; // 15 seconds cache
        return null;
    } catch (e) { return null; }
};

const setCache = (key, data) => {
    try {
        localStorage.setItem(`cache_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {}
};

export const fetchMembers = async () => {
    const cachedData = getCache('members');
    if (cachedData) return cachedData;
    
    try {
        const response = await fetch(`${API_URL}/public/members`);
        if (response.status === 429) return getCache('members') || []; // Return stale if rate limited
        if (!response.ok) throw new Error('Failed to fetch members');
        const data = await response.json();
        setCache('members', data);
        return data;
    } catch (error) {
        console.error("Error fetching members:", error);
        return getCache('members') || []; // Fallback to stale or empty
    }
};

export const fetchEvents = async () => {
    const cachedData = getCache('events');
    if (cachedData) return cachedData;

    try {
        const response = await fetch(`${API_URL}/orders/events`);
        if (response.status === 429) return getCache('events') || [];
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setCache('events', data);
        return data;
    } catch (error) {
        console.error("Error fetching events:", error);
        return getCache('events') || [];
    }
};

export const fetchDiscography = async () => {
    const cachedData = getCache('discography');
    if (cachedData) return cachedData;
    try {
        const response = await fetch(`${API_URL}/public/discography`);
        if (response.status === 429) return getCache('discography') || [];
        if (!response.ok) throw new Error('Failed to fetch discography');
        const data = await response.json();
        setCache('discography', data);
        return data;
    } catch (error) {
        console.error("Error fetching discography:", error);
        return getCache('discography') || [];
    }
};

export const fetchSettings = async () => {
    const cachedData = getCache('settings');
    if (cachedData) return cachedData;
    try {
        const response = await fetch(`${API_URL}/orders/settings`);
        if (response.status === 429) return getCache('settings') || null;
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setCache('settings', data);
        return data;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return getCache('settings') || null;
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create order');
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

export const fetchOrders = async () => {
    const cachedData = getCache('orders');
    if (cachedData) return cachedData;
    try {
        const response = await fetch(`${API_URL}/orders`);
        if (response.status === 429) return getCache('orders') || [];
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setCache('orders', data);
        return data;
    } catch (error) {
        console.error("Error fetching orders:", error);
        return getCache('orders') || [];
    }
};

export const updateOrderStatus = async (id, status) => {
    try {
        const response = await fetch(`${API_URL}/orders/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update order status');
        return await response.json();
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};

export const createMember = async (memberData) => {
    try {
        const response = await fetch(`${API_URL}/public/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memberData),
        });
        if (!response.ok) throw new Error('Failed to create member');
        return await response.json();
    } catch (error) {
        console.error('Error creating member:', error);
        throw error;
    }
};

export const updateMember = async (id, memberData) => {
    try {
        const response = await fetch(`${API_URL}/public/members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memberData),
        });
        if (!response.ok) throw new Error('Failed to update member');
        return await response.json();
    } catch (error) {
        console.error('Error updating member:', error);
        throw error;
    }
};

export const deleteMember = async (id) => {
    try {
        const response = await fetch(`${API_URL}/public/members/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete member');
        return await response.json();
    } catch (error) {
        console.error('Error deleting member:', error);
        throw error;
    }
};

export const uploadMemberPhoto = async (file) => {
    try {
        const webpBlob = await convertFileToWebp(file, {
            maxWidth: 1600,
            maxHeight: 1600,
            quality: 0.82
        });

        const formData = new FormData();
        formData.append('photo', webpBlob, buildWebpFileName(file?.name || 'member-photo', 'member-photo'));
        const response = await fetch(`${API_URL}/public/members/upload-photo`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload photo');
        return await response.json();
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
};

export const fetchPostEvents = async () => {
    const cachedData = getCache('postEvents');
    if (cachedData) return cachedData;

    try {
        const response = await fetch(`${API_URL}/public/post-events`);
        if (response.status === 429) return getCache('postEvents') || [];
        if (!response.ok) throw new Error('Failed to fetch post events');
        const data = await response.json();
        setCache('postEvents', data);
        return data;
    } catch (error) {
        console.error('Error fetching post events:', error);
        return getCache('postEvents') || [];
    }
};

export const fetchAdminPostEvents = async () => {
    try {
        const response = await fetch(`${API_URL}/post-events`);
        if (!response.ok) throw new Error('Failed to fetch post events');
        return await response.json();
    } catch (error) {
        console.error('Error fetching admin post events:', error);
        throw error;
    }
};

export const createPostEvent = async (payload) => {
    try {
        const response = await fetch(`${API_URL}/post-events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to create post event');
        return await response.json();
    } catch (error) {
        console.error('Error creating post event:', error);
        throw error;
    }
};

export const updatePostEvent = async (id, payload) => {
    try {
        const response = await fetch(`${API_URL}/post-events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update post event');
        return await response.json();
    } catch (error) {
        console.error('Error updating post event:', error);
        throw error;
    }
};

export const deletePostEvent = async (id) => {
    try {
        const response = await fetch(`${API_URL}/post-events/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete post event');
        return await response.json();
    } catch (error) {
        console.error('Error deleting post event:', error);
        throw error;
    }
};

export const uploadPostEventImage = async (file) => {
    try {
        const webpBlob = await convertFileToWebp(file, {
            maxWidth: 2000,
            maxHeight: 2000,
            quality: 0.82
        });

        const formData = new FormData();
        formData.append('image', webpBlob, buildWebpFileName(file?.name || 'post-event', 'post-event'));

        const response = await fetch(`${API_URL}/post-events/upload`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload post event image');
        return await response.json();
    } catch (error) {
        console.error('Error uploading post event image:', error);
        throw error;
    }
};
