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

        if (session.surface !== "user") {
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
  handleProjectSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ProjectSubscribeDto,
  ) {
    if (!client.data.session?.projectIds.includes(payload.projectId)) {
      client.emit("subscription.denied", {
        projectId: payload.projectId,
        reason: "project-member-required",
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
