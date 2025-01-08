import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';

const datas = [
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

app.get('/api/data/:uuid', (c) => {
    console.log('GET /api/data/:uuid');
    const uuid = c.params.uuid;
    const formattedUuid = uuid.match(/.{1,2}/g).join(' '); // Convert "a243zc5f" to "a2 43 zc 5f"
    const data = datas.find(d => d.uuid === formattedUuid);

    if (!data) {
        return c.status(404).json({ error: 'Data not found' });
    }

    return c.json(data);
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
            // Do nothing if it already exists with the same team, hit, and stand
            return c.json(datas);
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

app.delete('/api/data/:uuid', (c) => {
    console.log('DELETE /api/data/:uuid');
    const uuid = c.params.uuid;
    const formattedUuid = uuid.match(/.{1,2}/g).join(' '); // Convert "a243zc5f" to "a2 43 zc 5f"
    const index = datas.findIndex(d => d.uuid === formattedUuid);

    if (index === -1) {
        return c.status(404).json({ error: 'Data not found' });
    }

    datas.splice(index, 1);

    return c.json(datas);
});

serve({
    fetch: app.fetch,
    port: 8080
})