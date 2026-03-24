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
    expect(response.body.user.projectIds).toContain("project-psilo-core");
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
});
