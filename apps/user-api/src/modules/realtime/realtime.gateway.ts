import { Inject } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { verifySessionToken } from "@psilo/auth";
import type { Server, Socket } from "socket.io";

import { USER_REPOSITORY, type UserRepository } from "../../data/user-repository";
import { ProjectSubscribeDto } from "./dto/project-subscribe.dto";

type AuthenticatedSocket = Socket & {
  data: {
    session?: ReturnType<typeof verifySessionToken>;
  };
};

@WebSocketGateway({
  namespace: "/user-realtime",
  cors: {
    origin: "*",
  },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  @WebSocketServer()
  server!: Server;

  afterInit(server: Server) {
    server.use((client: AuthenticatedSocket, next) => {
      try {
        const token =
          client.handshake.auth.token ??
          client.handshake.headers.authorization?.replace(/^Bearer\s+/u, "");

        if (!token) {
          throw new Error("Missing token");
        }

        const session = verifySessionToken(token);

        if (session.surface !== "user" || session.tokenType !== "access") {
          throw new Error("Invalid surface");
        }

        client.data.session = session;
        next();
      } catch {
        next(new Error("Unauthorized"));
      }
    });
  }

  handleConnection(client: AuthenticatedSocket) {
    client.emit("system.ready", {
      channel: "user-realtime",
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage("project.subscribe")
  async handleProjectSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ProjectSubscribeDto,
  ) {
    const session = client.data.session;

    if (!session) {
      client.emit("subscription.denied", {
        projectId: payload.projectId,
        reason: "unauthorized",
      });
      return;
    }

    const isMember = await this.userRepository.isProjectMember(
      session.sub,
      session.tenantId,
      payload.projectId,
    );

    if (!isMember) {
      client.emit("subscription.denied", {
        projectId: payload.projectId,
        reason: "project-member-required",
      });
      return;
    }

    const hasChatReadPermission = await this.userRepository.hasProjectPermission(
      session.sub,
      session.tenantId,
      payload.projectId,
      "chat.message.read",
    );

    if (!hasChatReadPermission) {
      client.emit("subscription.denied", {
        projectId: payload.projectId,
        reason: "chat-read-permission-required",
      });
      return;
    }

    void client.join(`project:${payload.projectId}`);
    client.emit("subscription.confirmed", {
      projectId: payload.projectId,
      channel: `project:${payload.projectId}`,
    });
  }
}
