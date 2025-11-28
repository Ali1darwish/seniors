import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: "شغال يا معلم!" });
});

export default app;
