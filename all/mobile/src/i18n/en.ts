export const en = {
  // header
  goBack: 'Go back',
  langEn: 'ENG',
  langHi: 'हिंदी',
  goBackHint: 'This demo contains a single screen.',

  // title card
  registered: 'Registered',
  pendingPayment: 'Payment pending',
  winnersGetCertificate: 'Winners get certificate',
  prizePool: 'Prize Pool',
  entryFee: 'Entry Fee',
  free: 'Free',
  spotsLeft: 'Only {n} spots left',
  spotLeft: 'Only 1 spot left',
  noSpotsLeft: 'No spots left',
  booked: '{booked} / {capacity} Booked',
  cancelledBadge: 'Cancelled',

  // judge
  judge: 'Judge',
  yearsExperience: '{n}+ Years of Experience',
  introVideo: 'Intro Video',

  // countdown
  deadline_registration_closes: 'Registration closes in',
  deadline_registration_opens: 'Registration opens in',
  deadline_submission_starts: 'Submission starts in',
  deadline_submission_ends: 'Submission ends in',
  deadline_result: 'Results in',
  hurryUp: 'Hurry up!',
  updating: 'Updating…',

  // dates
  importantDates: 'Important Dates',
  registerBefore: 'Register Before',
  submissionStarts: 'Submission Starts',
  submissionEnds: 'Submission Ends',
  resultDate: 'Result Date',

  // winners
  previousWinners: 'Previous Winners',
  noPreviousWinners: 'This is the first edition — winners will appear here.',

  // tabs
  tabAbout: 'About Competition',
  tabJudging: 'Judging Parameters',
  tabRules: 'Rules & Eligibility',
  viewMore: 'View more',
  viewLess: 'View less',
  nothingHere: 'Details will be shared soon.',

  // rewards
  rewards: 'Rewards',
  allPositions: '(All Positions)',
  noRewards: 'Rewards will be announced soon.',

  // info
  disclaimer: 'Disclaimer:',
  prizeMoneyTitle: 'How will you receive prize money?',
  watchVideo: 'Watch video to know more',
  refundPolicy: 'Refund policy',
  securePayments: 'Secure payments powered by',

  // referral
  referTitle: 'Refer & Earn more discount',
  copyLink: 'Copy Link',
  copied: 'Copied',
  linkCopied: 'Referral link copied',
  referNow: 'Refer Now',
  youEarn: 'You earn',
  forEverySignup: 'for every signup',
  referralLoginHint: 'Log in to get your referral link',
  shareMessage: 'Join me on Feedants and take part in "{title}"! Sign up with my link: {link}',
  referralStats: '{signups} signups · {earned} earned',

  // testimonials
  hearFromUsers: 'Hear From Our Users',
  hearFromUsersSub: 'See what participants say about Feedants',
  noTestimonials: 'No reviews yet.',

  // ad
  adHere: 'Ad Here',
  sponsored: 'Sponsored',

  // bottom tabs
  tabHome: 'Home',
  tabExplore: 'Explore',
  tabCompetitions: 'Competitions',
  tabProfile: 'Profile',
  comingSoon: 'Coming soon in this demo',

  // states
  loadErrorTitle: 'Couldn’t load competition',
  retry: 'Try again',
  close: 'Close',
  cancel: 'Cancel',
  ok: 'OK',

  // CTA fallbacks (server label wins; these are used when missing / for local busy states)
  cta_login: 'Log in to Register',
  cta_register: 'Register Now · {fee}',
  cta_complete_payment: 'Complete Payment',
  cta_upload_submission: 'Upload Submission',
  cta_view_submission: 'View Submission',
  cta_submission_not_started: 'Submission not started',
  cta_registration_closed: 'Registration Closed',
  cta_full: 'Competition Full',
  cta_not_open_yet: 'Registration opens soon',
  cta_judging: 'Judging in progress',
  cta_view_results: 'View Results',
  cta_cancelled: 'Competition Cancelled',
  ctaWorking: 'Please wait…',

  // payment sheet
  paymentTitle: 'Complete your registration',
  paymentSubtitle: 'Entry fee for {title}',
  seatHeldFor: 'Seat held for',
  holdExpired: 'Your seat hold has expired',
  pay: 'Pay {amount}',
  paying: 'Processing payment…',
  verifying: 'Verifying payment…',
  releaseSeat: 'Release seat',
  mockNotice: 'Test mode · simulated Razorpay checkout',
  paymentSuccess: 'Payment successful — you’re registered!',
  registeredFree: 'You’re registered!',
  seatReleased: 'Seat released',

  // submission
  uploadTitle: 'Upload your performance',
  uploadHint: 'Pick a video (or image) up to 50 MB.',
  chooseFile: 'Choose from gallery',
  changeFile: 'Change file',
  captionPlaceholder: 'Add a caption (optional)',
  submit: 'Submit entry',
  uploading: 'Uploading… {pct}%',
  submitting: 'Submitting…',
  submissionSuccess: 'Submission received. Good luck!',
  yourSubmission: 'Your submission',
  submittedOn: 'Submitted on {date}',
  fileTooLarge: 'File is larger than 50 MB',
  permissionDenied: 'Allow photo library access to pick a file',
  resultsInfo: 'Results are out! Winners are listed under Previous Winners.',

  // demo controls
  demoTitle: 'Demo controls',
  switchUser: 'Switch demo user',
  switchCompetition: 'Switch competition',
  current: 'Current',
  signedInAs: 'Signed in as {name}',
  notSignedIn: 'Not signed in',
  switchedTo: 'Now signed in as {name}',

  // errors
  err_VALIDATION_ERROR: 'Something in the request was invalid. Please try again.',
  err_UNAUTHENTICATED: 'Please log in to continue.',
  err_FORBIDDEN: 'You’re not allowed to do that.',
  err_NOT_FOUND: 'We couldn’t find this competition.',
  err_ALREADY_REGISTERED: 'You’re already registered for this competition.',
  err_COMPETITION_FULL: 'Sorry, all spots were just taken.',
  err_REGISTRATION_CLOSED: 'Registration has closed for this competition.',
  err_REGISTRATION_NOT_OPEN: 'Registration hasn’t opened yet.',
  err_SUBMISSION_WINDOW_CLOSED: 'The submission window is closed.',
  err_NOT_REGISTERED: 'You need a confirmed registration to submit.',
  err_ALREADY_SUBMITTED: 'You’ve already submitted an entry.',
  err_HOLD_EXPIRED: 'Your seat hold expired before payment completed. Please register again.',
  holdExpiredRefund: 'Seat released — your payment will be refunded.',
  showMoreUsers: 'Show {n} more users',
  hideMoreUsers: 'Hide extra users',
  err_PAYMENT_VERIFICATION_FAILED: 'Payment could not be verified. You have not been charged.',
  err_IDEMPOTENCY_CONFLICT: 'This request is already being processed. Please wait a moment.',
  err_RATE_LIMITED: 'Too many attempts. Please wait a few seconds and retry.',
  err_INTERNAL: 'Something went wrong on our side. Please try again.',
  err_NETWORK_ERROR: 'No connection to the server. Check your network and retry.',
  err_TIMEOUT: 'The server took too long to respond. Please retry.',
  err_UNKNOWN: 'Something went wrong. Please try again.',
};

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;
