process.env.NODE_ENV = 'test';

jest.mock('../supabaseClient');

const request = require('supertest');
const app = require('../index');
const supabase = require('../supabaseClient');

describe('Post Events CRUD', () => {
    beforeEach(() => {
        supabase.__reset();
    });

    test('GET /api/post-events returns all post events', async () => {
        const posts = [{ id: 1 }, { id: 2 }];
        supabase.__setResult('post_events', { data: posts, error: null });

        const response = await request(app).get('/api/post-events');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(posts);
    });

    test('POST /api/post-events validates required fields', async () => {
        const response = await request(app).post('/api/post-events').send({ title: 'Test' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('instagram_url and image_url are required');
        expect(supabase.from).not.toHaveBeenCalled();
    });

    test('POST /api/post-events creates a post event', async () => {
        const created = { id: 5, title: 'After' };
        const postsBuilder = supabase.__setResult('post_events', { data: created, error: null });

        const payload = {
            title: 'After',
            caption: 'Caption',
            instagram_url: 'https://instagram.com/example',
            image_url: 'https://cdn.example.com/img.jpg',
            is_featured: 'yes'
        };

        const response = await request(app).post('/api/post-events').send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(created);

        const inserted = postsBuilder.insert.mock.calls[0][0];
        expect(inserted).toMatchObject({
            title: 'After',
            caption: 'Caption',
            instagram_url: 'https://instagram.com/example',
            image_url: 'https://cdn.example.com/img.jpg',
            is_featured: true
        });
    });

    test('PUT /api/post-events/:id updates a post event', async () => {
        const updated = { id: 9, title: 'Updated' };
        const postsBuilder = supabase.__setResult('post_events', { data: updated, error: null });

        const payload = { title: 'Updated', instagram_url: 'https://ig.com/x', image_url: 'https://cdn/x.jpg' };
        const response = await request(app).put('/api/post-events/9').send(payload);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updated);
        expect(postsBuilder.update).toHaveBeenCalled();
    });

    test('DELETE /api/post-events/:id deletes a post event', async () => {
        supabase.__setResult('post_events', { data: null, error: null });

        const response = await request(app).delete('/api/post-events/9');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Post event deleted' });
    });
});
