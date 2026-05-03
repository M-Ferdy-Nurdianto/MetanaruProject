process.env.NODE_ENV = 'test';

jest.mock('../supabaseClient');

const request = require('supertest');
const app = require('../index');
const supabase = require('../supabaseClient');

describe('Orders CRUD', () => {
    beforeEach(() => {
        supabase.__reset();
    });

    test('POST /api/orders creates single-item order', async () => {
        const ordersBuilder = supabase.__setResult('orders', { data: { id: 10 }, error: null });
        supabase.__setResult('events', {
            data: { type: 'regular', special_solo_price: null, special_group_price: null },
            error: null
        });
        supabase.__setResult('settings', {
            data: { prices: { regular_cheki_solo: 30000, regular_cheki_group: 35000 } },
            error: null
        });

        const payload = {
            event_id: 1,
            member_id: 'Moa',
            cheki_type: 'solo',
            qty: 2,
            mode: 'po',
            nickname: 'Jane',
            contact: '123',
            payment_proof_url: 'http://proof'
        };

        const response = await request(app).post('/api/orders').send(payload);

        expect(response.status).toBe(201);
        expect(response.body.id).toBe(10);

        const inserted = ordersBuilder.insert.mock.calls[0][0];
        expect(inserted).toMatchObject({
            nickname: 'Jane',
            contact: '123',
            event_id: 1,
            member_id: 'Moa',
            items: [],
            cheki_type: 'solo',
            qty: 2,
            total_price: 60000,
            mode: 'po',
            payment_method: 'cash',
            payment_proof_url: 'http://proof',
            status: 'pending'
        });
    });

    test('POST /api/orders creates multi-item order and aggregates totals', async () => {
        const ordersBuilder = supabase.__setResult('orders', { data: { id: 20 }, error: null });
        supabase.__setResult('events', {
            data: { type: 'regular', special_solo_price: null, special_group_price: null },
            error: null
        });
        supabase.__setResult('settings', {
            data: { prices: { regular_cheki_solo: 30000, regular_cheki_group: 35000 } },
            error: null
        });

        const payload = {
            event_id: 2,
            cheki_type: 'group',
            qty: 1,
            mode: 'ots',
            nickname: 'Ray',
            contact: '555',
            payment_method: 'transfer',
            items: [
                { member_id: 'A', qty: 1, cheki_type: 'group' },
                { member_id: 'B', qty: 2, cheki_type: 'solo' }
            ]
        };

        const response = await request(app).post('/api/orders').send(payload);

        expect(response.status).toBe(201);
        expect(response.body.id).toBe(20);

        const inserted = ordersBuilder.insert.mock.calls[0][0];
        expect(inserted.member_id).toBe('A x1, B x2');
        expect(inserted.qty).toBe(3);
        expect(inserted.total_price).toBe(95000);
        expect(inserted.status).toBe('paid');
        expect(inserted.payment_proof_url).toBeNull();
        expect(inserted.payment_method).toBe('transfer');
    });

    test('GET /api/orders returns all orders', async () => {
        const orders = [{ id: 1 }, { id: 2 }];
        supabase.__setResult('orders', { data: orders, error: null });

        const response = await request(app).get('/api/orders');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(orders);
    });

    test('GET /api/orders/:id returns a single order', async () => {
        const order = { id: 7, status: 'pending' };
        const ordersBuilder = supabase.__setResult('orders', { data: order, error: null });

        const response = await request(app).get('/api/orders/7');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(order);
        expect(ordersBuilder.eq).toHaveBeenCalledWith('id', '7');
    });

    test('PUT /api/orders/:id updates an order', async () => {
        const updated = { id: 7, status: 'paid' };
        const ordersBuilder = supabase.__setResult('orders', { data: updated, error: null });

        const payload = { status: 'paid', note: 'ok' };
        const response = await request(app).put('/api/orders/7').send(payload);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updated);
        expect(ordersBuilder.update).toHaveBeenCalledWith(payload);
    });

    test('PATCH /api/orders/:id updates order status', async () => {
        const updated = { id: 7, status: 'done' };
        const ordersBuilder = supabase.__setResult('orders', { data: updated, error: null });

        const response = await request(app).patch('/api/orders/7').send({ status: 'done' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updated);
        expect(ordersBuilder.update).toHaveBeenCalledWith({ status: 'done' });
    });

    test('DELETE /api/orders/:id deletes an order', async () => {
        supabase.__setResult('orders', { data: null, error: null });

        const response = await request(app).delete('/api/orders/7');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Order deleted' });
    });
});
