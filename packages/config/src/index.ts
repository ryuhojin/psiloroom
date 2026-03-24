export const adminRoutes = [
  "/login",
  "/dashboard",
  "/organizations",
  "/projects",
  "/permissions",
] as const;

export const userRoutes = [
  "/login",
  "/inbox",
  "/calendar",
  "/chat",
  "/notices",
] as const;

export const realtimeEventNames = {
  calendarCreated: "calendar.event.created",
  chatCreated: "chat.message.created",
  noticePublished: "notice.published",
  noticeReadUpdated: "notice.read.updated",
  chatReadUpdated: "chat.read.updated",
} as const;
