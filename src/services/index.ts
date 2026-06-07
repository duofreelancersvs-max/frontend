export { authService } from "./auth.service";
export { userService } from "./user.service";
export { settingsService } from "./settings.service";
export { projectService } from "./project.service";
export { freelancerService } from "./freelancer.service";
export { clientService } from "./client.service";
export { applicationService } from "./application.service";
export { conversationService } from "./conversation.service";
export { subscriptionService } from "./subscription.service";
export { paymentService } from "./payment.service";
export { notificationService } from "./notification.service";
export { reviewService } from "./review.service";
export { adminService } from "./admin.service";
export { publicService } from "./public.service";
export { featureGateService } from "./feature-gate.service";

export type {
  LoginRequest,
  RegisterRequest,
  AuthUser,
  AuthResponse,
} from "./auth.service";

export type { User, UserStats } from "./user.service";

export type {
  Project,
  ProjectStats,
  CreateProjectRequest,
  ProjectFilters,
} from "./project.service";

export type {
  PortfolioItem,
  WorkExperience,
  Education,
  FreelancerProfile,
  FreelancerFilters,
  SkillRef,
} from "./freelancer.service";

export type {
  ClientProfile,
  CreateClientProfileRequest,
} from "./client.service";

export type {
  Application,
  ApplicationStats,
  CreateApplicationRequest,
} from "./application.service";

export type {
  Message,
  Conversation,
  CreateConversationRequest,
} from "./conversation.service";

export type { Subscription, SubscriptionPlan } from "./subscription.service";
export type {
  CreateOrderResponse,
  VerifyPaymentResponse,
} from "./payment.service";

export type { Notification, NotificationCount } from "./notification.service";

export type {
  Review,
  CreateReviewRequest,
  ReviewFilters,
} from "./review.service";

export type {
  AdminStats,
  AdminUser,
  AdminProject,
  VerificationItem,
  PaginationMeta,
  NotificationHistoryItem,
  AdminReview,
  AdminApplication,
  AdminConversation,
  AdminMessage,
  AdminCategory,
  AdminPayment,
  AuditLogEntry,
} from "./admin.service";

export type { CategoryWithSkills, Skill } from "./public.service";

export type {
  PlanContext,
  UsageSnapshot,
  FeatureFlag,
  UsageResponse,
  PlanErrorMeta,
  PlanErrorCode,
} from "@/types/feature-gate.types";
