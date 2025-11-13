const request = require("supertest");
const app = require("../server");

// ----------------------------------------------------
// CORE TESTS
// ----------------------------------------------------
describe("Cache API — Core Tests", () => {

  test("Basic PUT/GET", async () => {
    const key = "basic_key";
    await request(app).put(`/v1/cache/${key}`).send("hello");
    const r = await request(app).get(`/v1/cache/${key}`);
    expect(r.status).toBe(200);
    expect(r.body.toString()).toBe("hello");
  });

  test("TTL Expiry Check", async () => {
    const key = "ttl_test";
    await request(app).put(`/v1/cache/${key}?ttl=1`).send("temp");
    await new Promise(r => setTimeout(r, 1200));
    const r = await request(app).get(`/v1/cache/${key}`);
    expect(r.status).toBe(404);
  });

  test("Delete Key", async () => {
    const key = "del_test";
    await request(app).put(`/v1/cache/${key}`).send("x");
    await request(app).delete(`/v1/cache/${key}`);
    const r = await request(app).get(`/v1/cache/${key}`);
    expect(r.status).toBe(404);
  });

  test("Overwrite Key", async () => {
    const key = "over_key";
    await request(app).put(`/v1/cache/${key}`).send("old");
    await request(app).put(`/v1/cache/${key}`).send("new");
    const r = await request(app).get(`/v1/cache/${key}`);
    expect(r.body.toString()).toBe("new");
  });

});


// ----------------------------------------------------
// AUTO-GENERATED LOAD TESTS (40 TEST CASES)
// ----------------------------------------------------
describe("Auto-Generated Load Tests", () => {

  for (let i = 1; i <= 40; i++) {
    test(`Auto PUT/GET Test #${i}`, async () => {
      const key = "auto_key_" + i;
      const value = "auto_value_" + i;

      await request(app).put(`/v1/cache/${key}`).send(value);
      const res = await request(app).get(`/v1/cache/${key}`);

      expect(res.status).toBe(200);
      expect(res.body.toString()).toBe(value);
    });
  }

});


// ----------------------------------------------------
// TTL Variation Tests (10 CASES)
// ----------------------------------------------------
describe("TTL Variation Tests", () => {

  for (let i = 1; i <= 10; i++) {
    test(`TTL Test Variation #${i}`, async () => {
      const key = "ttl_var_" + i;
      await request(app).put(`/v1/cache/${key}?ttl=1`).send("temp");
      await new Promise(r => setTimeout(r, 1100));
      const res = await request(app).get(`/v1/cache/${key}`);
      expect(res.status).toBe(404);
    });
  }

});


// ----------------------------------------------------
// INVALID INPUT TESTS (5 CASES)
// ----------------------------------------------------
describe("Invalid Input Tests", () => {

  test("Invalid JSON for admin config", async () => {
    const res = await request(app)
      .post("/v1/admin/config/eviction")
      .set("authorization", "Bearer dev-admin-token")
      .send("notjson");

    expect(res.status).toBe(400);
  });

  test("Invalid eviction policy", async () => {
    const res = await request(app)
      .post("/v1/admin/config/eviction")
      .set("authorization", "Bearer dev-admin-token")
      .send(JSON.stringify({ policy: "INVALID" }));

    expect(res.status).toBe(400);
  });

  test("Unauthorized admin access", async () => {
    const res = await request(app)
      .post("/v1/admin/config/eviction")
      .send(JSON.stringify({ policy: "LRU" }));

    expect(res.status).toBe(401);
  });

  test("Invalid GET key", async () => {
    const res = await request(app).get("/v1/cache/___notfound___");
    expect(res.status).toBe(404);
  });

  test("Invalid delete", async () => {
    const res = await request(app).delete("/v1/cache/no_key");
    expect(res.status).toBe(404);
  });

});


// ----------------------------------------------------
// METRICS + HEALTH (2 CASES)
// ----------------------------------------------------
describe("Metrics + Health", () => {

  test("Health OK", async () => {
    const r = await request(app).get("/health");
    expect(r.status).toBe(200);
    expect(r.body.status).toBe("ok");
  });

  test("Metrics have required fields", async () => {
    const r = await request(app).get("/metrics");
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("hits");
    expect(r.body).toHaveProperty("misses");
    expect(r.body).toHaveProperty("items");
    expect(r.body).toHaveProperty("expired");
  });

});
