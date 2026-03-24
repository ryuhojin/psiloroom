import { ValidationPipe } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Test } from "@nestjs/testing";
import { io, type Socket } from "socket.io-client";
import request from "supertest";

import { AppModule } from "../src/app.module";

describe("User API", () => {
  let app: INestApplication;
  let baseUrl: string;
  let userToken: string;
  let userRefreshToken: string;
  let managerToken: string;
  let vendorToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/user");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useWebSocketAdapter(new IoAdapter(app));

    await app.listen(0);
    const server = app.getHttpServer();
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns health information", async () => {
    const response = await request(app.getHttpServer()).get("/api/user/health").expect(200);

    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("user-api");
  });

  it("accepts valid login payloads", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/user/auth/login")
      .send({
        tenantCode: "ALPHA",
        loginId: "dev.alpha",
        password: "complexPass1",
      })
      .expect(201);

    userToken = response.body.accessToken;
    userRefreshToken = response.body.refreshToken;
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.user.projectIds).toContain("project-psilo-core");
  });

  it("accepts valid login payloads for the outsourcing member", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/user/auth/login")
      .send({
        tenantCode: "BETA",
        loginId: "vendor.beta",
        password: "complexPass1",
      })
      .expect(201);

    vendorToken = response.body.accessToken;
  });

  it("accepts valid login payloads for the project manager", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/user/auth/login")
      .send({
        tenantCode: "ALPHA",
        loginId: "pm.alpha",
        password: "complexPass1",
      })
      .expect(201);

    managerToken = response.body.accessToken;
    expect(response.body.user.projectIds).toContain("project-psilo-core");
  });

  it("returns the current session for a valid access token", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/user/auth/session")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.user.loginId).toBe("dev.alpha");
    expect(response.body.session.tokenType).toBe("access");
    expect(response.body.session.projectIds).toContain("project-psilo-core");
  });

  it("issues a fresh token pair from the refresh endpoint", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/user/auth/refresh")
      .send({ refreshToken: userRefreshToken })
      .expect(201);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.user.loginId).toBe("dev.alpha");
  });

  it("rejects access tokens on the refresh endpoint", async () => {
    await request(app.getHttpServer())
      .post("/api/user/auth/refresh")
      .send({ refreshToken: userToken })
      .expect(401);
  });

  it("rejects inbox lookup without authentication", async () => {
    await request(app.getHttpServer()).get("/api/user/inbox/summary").expect(401);
  });

  it("returns inbox summary for an authenticated member", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/user/inbox/summary")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.unreadNotices).toBe(3);
    expect(response.body.todayEvents).toBe(5);
  });

  it("rejects refresh tokens on protected endpoints", async () => {
    await request(app.getHttpServer())
      .get("/api/user/inbox/summary")
      .set("Authorization", `Bearer ${userRefreshToken}`)
      .expect(401);
  });

  it("rejects notice lookup for a project outside the session scope", async () => {
    await request(app.getHttpServer())
      .get("/api/user/notices")
      .query({ projectId: "project-si-rollout" })
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);
  });

  it("returns notices for an allowed project scope", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/user/notices")
      .query({ projectId: "project-psilo-core" })
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toContain("Go-live");
  });

  it("rejects notice creation without notice manage permission", async () => {
    await request(app.getHttpServer())
      .post("/api/user/notices")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        projectId: "project-psilo-core",
        title: "Member-authored notice",
        body: "This should be blocked.",
        severity: "warning",
      })
      .expect(403);
  });

  it("creates a project notice for a user with notice manage permission", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/user/notices")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        projectId: "project-psilo-core",
        title: "Cutover rehearsal approved",
        body: "The cutover rehearsal has been approved for the Alpha tenant.",
        severity: "critical",
      })
      .expect(201);

    expect(response.body.projectId).toBe("project-psilo-core");
    expect(response.body.title).toBe("Cutover rehearsal approved");
    expect(response.body.severity).toBe("critical");
  });

  it("rejects calendar event creation without calendar manage permission", async () => {
    await request(app.getHttpServer())
      .post("/api/user/calendar/events")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        projectId: "project-psilo-core",
        title: "Blocked workshop",
        startsAt: "2026-03-25T01:00:00.000Z",
        endsAt: "2026-03-25T02:00:00.000Z",
      })
      .expect(403);
  });

  it("creates a calendar event for a user with calendar manage permission", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/user/calendar/events")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        projectId: "project-psilo-core",
        title: "Release readiness workshop",
        description: "Final readiness review before the next rollout gate.",
        startsAt: "2026-03-25T01:00:00.000Z",
        endsAt: "2026-03-25T02:30:00.000Z",
      })
      .expect(201);

    expect(response.body.projectId).toBe("project-psilo-core");
    expect(response.body.title).toBe("Release readiness workshop");
    expect(response.body.startsAt).toBe("2026-03-25T01:00:00.000Z");
  });

  it("creates a project chat message for a member with chat write permission", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/user/chat/messages")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        projectId: "project-psilo-core",
        body: "I will prepare the cutover checklist before noon.",
      })
      .expect(201);

    expect(response.body.projectId).toBe("project-psilo-core");
    expect(response.body.body).toContain("cutover checklist");
  });

  it("rejects chat message creation without chat write permission", async () => {
    await request(app.getHttpServer())
      .post("/api/user/chat/messages")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        projectId: "project-si-rollout",
        body: "I should not be able to post this message.",
      })
      .expect(403);
  });

  it("rejects socket connection without authentication", async () => {
    await new Promise<void>((resolve, reject) => {
      const client: Socket = io(`${baseUrl}/user-realtime`, {
        transports: ["websocket"],
        forceNew: true,
      });

      client.on("connect_error", (error) => {
        try {
          expect(error.message).toContain("Unauthorized");
          client.close();
          resolve();
        } catch (assertionError) {
          client.close();
          reject(assertionError);
        }
      });
    });
  });

  it("allows socket connection but denies subscription to a non-member project", async () => {
    await new Promise<void>((resolve, reject) => {
      const client: Socket = io(`${baseUrl}/user-realtime`, {
        transports: ["websocket"],
        forceNew: true,
        auth: {
          token: userToken,
        },
      });

      client.on("system.ready", (payload) => {
        try {
          expect(payload.channel).toBe("user-realtime");
          client.emit("project.subscribe", {
            projectId: "project-si-rollout",
          });
        } catch (error) {
          client.close();
          reject(error);
        }
      });

      client.on("subscription.denied", (payload) => {
        try {
          expect(payload.projectId).toBe("project-si-rollout");
          client.close();
          resolve();
        } catch (error) {
          client.close();
          reject(error);
        }
      });

      client.on("connect_error", (error) => {
        client.close();
        reject(error);
      });
    });
  });

  it("denies subscription when chat read permission is missing", async () => {
    await new Promise<void>((resolve, reject) => {
      const client: Socket = io(`${baseUrl}/user-realtime`, {
        transports: ["websocket"],
        forceNew: true,
        auth: {
          token: vendorToken,
        },
      });

      client.on("system.ready", () => {
        client.emit("project.subscribe", {
          projectId: "project-si-rollout",
        });
      });

      client.on("subscription.denied", (payload) => {
        try {
          expect(payload.projectId).toBe("project-si-rollout");
          expect(payload.reason).toBe("chat-read-permission-required");
          client.close();
          resolve();
        } catch (error) {
          client.close();
          reject(error);
        }
      });

      client.on("connect_error", (error) => {
        client.close();
        reject(error);
      });
    });
  });

  it("rejects socket connection when a refresh token is used", async () => {
    await new Promise<void>((resolve, reject) => {
      const client: Socket = io(`${baseUrl}/user-realtime`, {
        transports: ["websocket"],
        forceNew: true,
        auth: {
          token: userRefreshToken,
        },
      });

      client.on("connect_error", (error) => {
        try {
          expect(error.message).toContain("Unauthorized");
          client.close();
          resolve();
        } catch (assertionError) {
          client.close();
          reject(assertionError);
        }
      });
    });
  });
});
