import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";

import { AppModule } from "../src/app.module";

describe("Admin API", () => {
  let app: INestApplication;
  let adminToken: string;
  let adminRefreshToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/admin");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns health information", async () => {
    const response = await request(app.getHttpServer()).get("/api/admin/health").expect(200);

    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("admin-api");
  });

  it("rejects invalid login payloads", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/admin/auth/login")
      .send({
        tenantCode: "ALPHA",
        loginId: "pm.alpha",
        password: "short",
      })
      .expect(400);

    expect(response.body.message).toContain("password must be longer than or equal to 8 characters");
  });

  it("accepts valid login payloads", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/admin/auth/login")
      .send({
        tenantCode: "ALPHA",
        loginId: "pm.alpha",
        password: "complexPass1",
      })
      .expect(201);

    adminToken = response.body.accessToken;
    adminRefreshToken = response.body.refreshToken;
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.user.tenantId).toBe("tenant-alpha");
    expect(response.body.user.roles).toContain("tenant_admin");
  });

  it("returns the current session for a valid access token", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/admin/auth/session")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.user.loginId).toBe("pm.alpha");
    expect(response.body.session.tokenType).toBe("access");
    expect(response.body.session.roles).toContain("tenant_admin");
  });

  it("issues a fresh token pair from the refresh endpoint", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/admin/auth/refresh")
      .send({ refreshToken: adminRefreshToken })
      .expect(201);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.user.loginId).toBe("pm.alpha");
  });

  it("rejects access tokens on the refresh endpoint", async () => {
    await request(app.getHttpServer())
      .post("/api/admin/auth/refresh")
      .send({ refreshToken: adminToken })
      .expect(401);
  });

  it("rejects tenant lookup without authentication", async () => {
    await request(app.getHttpServer()).get("/api/admin/tenants").expect(401);
  });

  it("returns only the authenticated tenant summary", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/admin/tenants")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].code).toBe("ALPHA");
  });

  it("rejects refresh tokens on protected endpoints", async () => {
    await request(app.getHttpServer())
      .get("/api/admin/tenants")
      .set("Authorization", `Bearer ${adminRefreshToken}`)
      .expect(401);
  });

  it("rejects cross-tenant project access", async () => {
    await request(app.getHttpServer())
      .get("/api/admin/projects")
      .query({ tenantId: "tenant-beta" })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(403);
  });

  it("returns project summaries scoped to the authenticated tenant", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/admin/projects")
      .query({ tenantId: "tenant-alpha" })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body[0].code).toBe("PSILO-CORE");
    expect(response.body).toHaveLength(1);
  });
});
