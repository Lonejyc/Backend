import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';

const datas = [
    { uuid: '3E F4 5R 3D', team: 'blue', stand: '0', hit: '0' },
    { uuid: '5F 4R 7J 6J', team: 'red', stand: '0', hit: '0' }
];

const app = new Hono();
app.use('/api/*', cors())

app.get('/', (c) => {
    return c.text('Hello World');
});

app.get('/api/data', (c) => {
    console.log('GET /api/data');
    return c.json(datas);
});

app.post('/api/data', async (c) => {
    console.log('POST /api/data');
    const data = await c.req.json();

    if (!data.uuid || !data.team) {
        return c.status(400).json({ error: 'Invalid data' });
    }

    const existingData = datas.find(d => d.uuid === data.uuid);

    if (existingData) {
        if (existingData.team === data.team && existingData.hit === data.hit && existingData.stand === data.stand) {
            // Remove the data if it already exists with the same team, hit, and stand
            datas.splice(datas.findIndex(d => d.uuid === data.uuid), 1);
        } else {
            // Update the data if any of the fields (team, hit, or stand) change
            existingData.team = data.team;
            existingData.hit = data.hit;
            existingData.stand = data.stand;
        }
    } else {
        // Add new data if the uuid does not exist
        datas.push(data);
    }

    return c.json(datas);
});

serve({
    fetch: app.fetch,
    port: 8080
})