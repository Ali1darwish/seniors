import { renderHtml } from "./renderHtml";

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// --- تعريف الجدول ---
const itemsTable = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject"),
  url: text("url")
});

export default {
  async fetch(request, env) {
    const app = new Hono();
    const db = drizzle(env.DB); // D1 database instance

    // ========== 1) GET ALL ==========
    app.get('/items', async () => {
      const items = await db.select().from(itemsTable);
      return Response.json(items);
    });

    // ========== 2) ADD ITEM ==========
    app.post('/items', async (c) => {
      const body = await c.req.json();

      if (!body.name || !body.path) {
        return c.json({ error: "name and path required" }, 400);
      }

      await db.insert(itemsTable).values({
        name: body.name,
        description: body.description || "",
        path: body.path
      });

      return c.json({ success: true });
    });

    // ========== 3) UPDATE ITEM ==========
    app.put('/items/:id', async (c) => {
      const id = Number(c.req.param("id"));
      const body = await c.req.json();

      await db
        .update(itemsTable)
        .set({
          name: body.name,
          description: body.description,
          path: body.path
        })
        .where(itemsTable.id.eq(id));

      return c.json({ success: true });
    });

    // ========== 4) DELETE ITEM ==========
    app.delete('/items/:id', async (c) => {
      const id = Number(c.req.param("id"));

      await db
        .delete(itemsTable)
        .where(itemsTable.id.eq(id));

      return c.json({ success: true });
    });

    return app.fetch(request);
  }
};


export default {
  async fetch(request, env) {
    const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
    const { results } = await stmt.all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  },
} satisfies ExportedHandler<Env>;
