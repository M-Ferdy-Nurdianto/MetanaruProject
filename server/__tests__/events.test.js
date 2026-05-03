process.env.NODE_ENV = 'test';

jest.mock('../supabaseClient');

const request = require('supertest');
const app = require('../index');
const supabase = require('../supabaseClient');

describe('Events CRUD', () => {
    beforeEach(() => {
        supabase.__reset();
    });

    test('GET /api/orders/events marks past events as done', async () => {
        const now = Date.now();
        const events = [
            { id: 1, po_deadline: new Date(now - 86400000).toISOString(), status: 'ongoing' },
            { id: 2, po_deadline: new Date(now + 86400000).toISOString(), status: 'ongoing' }
        ];

        supabase.__setResult('events', { data: events, error: null });

        const response = await request(app).get('/api/orders/events');

        expect(response.status).toBe(200);
        expect(response.body[0].status).toBe('done');
        expect(response.body[1].status).toBe('ongoing');
    });

    test('POST /api/orders/events creates an event with default status', async () => {
        const created = { id: 3, name: 'Live', status: 'ongoing' };
        const eventsBuilder = supabase.__setResult('events', { data: created, error: null });

        const payload = { name: 'Live', date: '2026-05-01' };
        const response = await request(app).post('/api/orders/events').send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(created);

        const inserted = eventsBuilder.insert.mock.calls[0][0];
        expect(inserted.status).toBe('ongoing');
    });

    test('PUT /api/orders/events/:id updates an event', async () => {
        const updated = { id: 4, name: 'Updated' };
        const eventsBuilder = supabase.__setResult('events', { data: updated, error: null });

        const payload = { name: 'Updated' };
        const response = await request(app).put('/api/orders/events/4').send(payload);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updated);
        expect(eventsBuilder.update).toHaveBeenCalledWith(payload);
    });

    test('DELETE /api/orders/events/:id deletes an event', async () => {
        supabase.__setResult('events', { data: null, error: null });

        const response = await request(app).delete('/api/orders/events/4');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Event deleted successfully' });
    });
});
