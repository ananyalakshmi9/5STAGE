const request = require("supertest");
const app = require("../server");

describe("Cache API", () => {
  test("PUT/GET lifecycle", async () => {
    const key = "testkey";
    const val = "hello";

    let r = await request(app).put(`/v1/cache/${key}`).send(val);
    expect([200, 201]).toContain(r.status);

    r = await request(app).get(`/v1/cache/${key}`);
    expect(r.status).toBe(200);

    const returned = r.body.toString();
    expect(returned).toBe(val);
  });

  test("TTL expiry", async () => {
    const key = "exp";
    await request(app).put(`/v1/cache/${key}?ttl=1`).send("bye");

    await new Promise((r) => setTimeout(r, 1200));

    const r = await request(app).get(`/v1/cache/${key}`);
    expect(r.status).toBe(404);
  });
});
