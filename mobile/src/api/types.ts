/**
 * Types mirroring docs/API_CONTRACT.md exactly. Money is integer paise, timestamps ISO-8601 UTC.
 */

export type Lang = 'en' | 'hi';
export type ISODateString = string;
export type Paise = number;

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'ALREADY_REGISTERED'
  | 'COMPETITION_FULL'
  | 'REGISTRATION_CLOSED'
  | 'REGISTRATION_NOT_OPEN'
  | 'SUBMISSION_WINDOW_CLOSED'
  | 'NOT_REGISTERED'
  | 'ALREADY_SUBMITTED'
  | 'HOLD_EXPIRED'
  | 'PAYMENT_VERIFICATION_FAILED'
  | 'IDEMPOTENCY_CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL';

/** Client-side codes for failures that never reached / were not understood from the server. */
export type ClientErrorCode = 'NETWORK_ERROR' | 'TIMEOUT' | 'UNKNOWN';

export interface ErrorEnvelope {
  error: { code: ApiErrorCode; message: string; details?: unknown };
}

// ---------- Auth ----------
export interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
  referralCode: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface DevLoginResponse {
  token: string;
  user: User;
}

export interface DemoUsersResponse {
  users: DemoUser[];
}

export interface MeResponse {
  user: User;
}

// ---------- Competition ----------
export interface Judge {
  name: string;
  title: string;
  experienceYears: number;
  avatarUrl: string;
  introVideoUrl: string;
}

export interface CompetitionDates {
  registrationOpensAt: ISODateString;
  registrationClosesAt: ISODateString;
  submissionStartsAt: ISODateString;
  submissionEndsAt: ISODateString;
  resultAt: ISODateString;
}

export interface PreviousWinner {
  id: string;
  name: string;
  positionLabel: string;
  position: number;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface CompetitionTabs {
  about: string;
  judgingParameters: string[];
  rulesAndEligibility: string[];
}

export interface Reward {
  position: number;
  label: string;
  amount: Paise;
}

export interface Ad {
  imageUrl: string;
  targetUrl: string;
  label: string;
}

export type CompetitionStatus = 'published' | 'cancelled';

export interface Competition {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  certificate: boolean;
  prizePool: Paise;
  entryFee: Paise;
  currency: 'INR';
  judge: Judge;
  dates: CompetitionDates;
  previousWinners: PreviousWinner[];
  tabs: CompetitionTabs;
  rewards: Reward[];
  disclaimer: string;
  prizeInfoVideoUrl: string;
  refundPolicy: string;
  paymentProvider: 'razorpay';
  ad: Ad | null;
  status: CompetitionStatus;
}

export interface Availability {
  capacity: number;
  booked: number;
  remaining: number;
  isFull: boolean;
}

export type LifecyclePhase =
  | 'upcoming'
  | 'registration_open'
  | 'registration_closed'
  | 'submission_open'
  | 'judging'
  | 'results_announced'
  | 'cancelled';

export type DeadlineType =
  | 'registration_closes'
  | 'registration_opens'
  | 'submission_starts'
  | 'submission_ends'
  | 'result';

export interface Lifecycle {
  phase: LifecyclePhase;
  registrationOpen: boolean;
  submissionOpen: boolean;
  resultsOut: boolean;
  nextDeadline: { type: DeadlineType; at: ISODateString } | null;
}

export type RegistrationStatus = 'pending_payment' | 'confirmed';

export interface ViewerRegistration {
  id: string;
  status: RegistrationStatus;
  holdExpiresAt: ISODateString | null;
}

export interface Submission {
  id: string;
  status: 'received';
  mediaUrl: string;
  submittedAt: ISODateString;
  caption?: string;
}

export type PrimaryActionType =
  | 'login'
  | 'register'
  | 'complete_payment'
  | 'upload_submission'
  | 'view_submission'
  | 'submission_not_started'
  | 'registration_closed'
  | 'full'
  | 'not_open_yet'
  | 'judging'
  | 'view_results'
  | 'cancelled';

export interface PrimaryAction {
  type: PrimaryActionType;
  enabled: boolean;
  label: string;
  subLabel: string | null;
}

export interface Viewer {
  registration: ViewerRegistration | null;
  submission: Submission | null;
  primaryAction: PrimaryAction;
}

export interface CompetitionDetailsResponse {
  serverTime: ISODateString;
  competition: Competition;
  availability: Availability;
  lifecycle: Lifecycle;
  viewer: Viewer | null;
  /** Present only when viewer is null. */
  anonymousAction?: PrimaryAction;
}

export interface AvailabilityResponse {
  serverTime: ISODateString;
  availability: Availability;
  lifecycle: Lifecycle;
}

export interface Testimonial {
  id: string;
  name: string;
  avatarUrl: string | null;
  text: string;
  rating: number;
}

export interface TestimonialsResponse {
  items: Testimonial[];
}

// ---------- Registration + payment ----------
export interface PaymentOrder {
  provider: 'razorpay';
  orderId: string;
  amount: Paise;
  currency: 'INR';
  keyId: string;
  mock: boolean;
}

export interface RegisterResponse {
  registration: { id: string; status: RegistrationStatus; holdExpiresAt: ISODateString | null };
  payment: PaymentOrder | null;
}

export interface MockCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type VerifyPaymentBody = MockCheckoutResponse;

export interface VerifyPaymentResponse {
  registration: { id: string; status: 'confirmed' };
}

export interface CancelHoldResponse {
  registration: { id: string; status: 'cancelled' };
}

// ---------- Submissions ----------
export interface UploadResponse {
  url: string;
  mimeType: string;
  size: number;
}

export interface CreateSubmissionBody {
  mediaUrl: string;
  caption?: string;
}

export interface CreateSubmissionResponse {
  submission: Submission;
}

export interface MySubmissionResponse {
  submission: Submission | null;
}

// ---------- Referral ----------
export interface ReferralResponse {
  code: string;
  link: string;
  rewardPerSignup: Paise;
  signups: number;
  earned: Paise;
}
