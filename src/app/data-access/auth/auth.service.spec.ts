import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Session, User, AuthError } from '@supabase/supabase-js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Captures the callback registered via onAuthStateChange */
let authStateChangeCallback: ((event: string, session: Session | null) => void) | null = null;

const fakeUser: Partial<User> = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2025-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
};

const fakeSession: Partial<Session> = {
  access_token: 'fake-access-token',
  refresh_token: 'fake-refresh-token',
  user: fakeUser as User,
};

function createAuthError(message: string, code = 'unknown'): AuthError {
  const err = new Error(message) as AuthError;
  (err as any).status = 400;
  (err as any).code = code;
  (err as any).__isAuthError = true;
  return err;
}

// ── Mock Supabase client ─────────────────────────────────────────────────────

const mockSupabaseAuth = {
  getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
  signInWithPassword: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn().mockResolvedValue({ error: null }),
  refreshSession: jest.fn(),
  onAuthStateChange: jest.fn((cb: any) => {
    authStateChangeCallback = cb;
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  }),
};

const mockSupabaseService = {
  getClient: jest.fn(() => ({ auth: mockSupabaseAuth })),
};

// ── Constants matching AuthService private values ────────────────────────────

const SESSION_START_KEY = 'sessionStartedAt';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  /** Helper: create the service after mocks are configured */
  function createService(): AuthService {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    });
    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    authStateChangeCallback = null;

    // Default: no existing session
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabaseAuth.signOut.mockResolvedValue({ error: null });
  });

  // ── Creation ─────────────────────────────────────────────────────────────

  it('should be created', () => {
    service = createService();
    expect(service).toBeTruthy();
  });

  // ── signIn ───────────────────────────────────────────────────────────────

  describe('signIn', () => {
    beforeEach(() => {
      service = createService();
    });

    it('should return success and store session start timestamp on valid credentials', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: fakeUser, session: fakeSession },
        error: null,
      });

      const result = await service.signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(fakeUser);
      expect(localStorage.getItem(SESSION_START_KEY)).toBeTruthy();
    });

    it('should NOT store session start timestamp on failed login', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: createAuthError('Invalid login credentials'),
      });

      const result = await service.signIn({ email: 'test@example.com', password: 'wrong' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('auth.errors.invalid_credentials');
      expect(localStorage.getItem(SESSION_START_KEY)).toBeNull();
    });

    it('should return error with errorCode "exception" on unexpected throw', async () => {
      mockSupabaseAuth.signInWithPassword.mockRejectedValue(new Error('Network error'));

      const result = await service.signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('exception');
    });
  });

  // ── signOut ──────────────────────────────────────────────────────────────

  describe('signOut', () => {
    beforeEach(() => {
      service = createService();
    });

    it('should clear session start timestamp from localStorage', async () => {
      localStorage.setItem(SESSION_START_KEY, Date.now().toString());

      await service.signOut();

      expect(localStorage.getItem(SESSION_START_KEY)).toBeNull();
    });

    it('should return success when Supabase signOut succeeds', async () => {
      const result = await service.signOut();
      expect(result.success).toBe(true);
    });

    it('should return error when Supabase signOut fails', async () => {
      mockSupabaseAuth.signOut.mockResolvedValue({
        error: createAuthError('Sign out failed'),
      });

      const result = await service.signOut();

      expect(result.success).toBe(false);
    });
  });

  // ── 24h Session Cap ──────────────────────────────────────────────────────

  describe('24h session cap enforcement', () => {
    it('should force signOut on startup when session exists and cap is exceeded', async () => {
      // Set a timestamp > 24h ago
      const expiredTimestamp = (Date.now() - TWENTY_FOUR_HOURS_MS - 1000).toString();
      localStorage.setItem(SESSION_START_KEY, expiredTimestamp);

      // Return an existing session on getSession
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: fakeSession },
      });

      service = createService();

      // Wait for initializeAuth to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
      // Session start key should be cleared by signOut
      expect(localStorage.getItem(SESSION_START_KEY)).toBeNull();
    });

    it('should NOT force signOut on startup when session exists and cap is NOT exceeded', async () => {
      // Set a timestamp < 24h ago
      const recentTimestamp = (Date.now() - 1000).toString();
      localStorage.setItem(SESSION_START_KEY, recentTimestamp);

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: fakeSession },
      });

      service = createService();

      await new Promise((resolve) => setTimeout(resolve, 50));

      // signOut should NOT have been called (only the onAuthStateChange registration)
      expect(mockSupabaseAuth.signOut).not.toHaveBeenCalled();
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should NOT force signOut when no session start timestamp exists', async () => {
      // No timestamp in localStorage (pre-existing session)
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: fakeSession },
      });

      service = createService();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockSupabaseAuth.signOut).not.toHaveBeenCalled();
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should force signOut on TOKEN_REFRESHED when cap is exceeded', async () => {
      // Start with a valid session
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: fakeSession },
      });

      service = createService();

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Now simulate the 24h cap being exceeded
      const expiredTimestamp = (Date.now() - TWENTY_FOUR_HOURS_MS - 1000).toString();
      localStorage.setItem(SESSION_START_KEY, expiredTimestamp);

      // Simulate TOKEN_REFRESHED event
      expect(authStateChangeCallback).toBeTruthy();
      authStateChangeCallback!('TOKEN_REFRESHED', fakeSession as Session);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
    });

    it('should NOT force signOut on TOKEN_REFRESHED when cap is NOT exceeded', async () => {
      const recentTimestamp = Date.now().toString();
      localStorage.setItem(SESSION_START_KEY, recentTimestamp);

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: fakeSession },
      });

      service = createService();

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Simulate TOKEN_REFRESHED event
      authStateChangeCallback!('TOKEN_REFRESHED', fakeSession as Session);

      await new Promise((resolve) => setTimeout(resolve, 50));

      // signOut should NOT have been called
      expect(mockSupabaseAuth.signOut).not.toHaveBeenCalled();
    });

    it('should update auth state normally on non-TOKEN_REFRESHED events', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
      });

      service = createService();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(service.isAuthenticated()).toBe(false);

      // Simulate SIGNED_IN event
      authStateChangeCallback!('SIGNED_IN', fakeSession as Session);

      expect(service.isAuthenticated()).toBe(true);
    });
  });

  // ── signUp ───────────────────────────────────────────────────────────────

  describe('signUp', () => {
    beforeEach(() => {
      service = createService();
    });

    it('should return success with user and session on valid registration', async () => {
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: fakeUser, session: fakeSession },
        error: null,
      });

      const result = await service.signUp({ email: 'new@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(fakeUser);
    });

    it('should return success with email confirmation message when no session returned', async () => {
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: fakeUser, session: null },
        error: null,
      });

      const result = await service.signUp({ email: 'new@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.error).toBe('auth.messages.check_email_confirmation');
    });

    it('should return error on Supabase signUp failure', async () => {
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: createAuthError('User already registered'),
      });

      const result = await service.signUp({ email: 'existing@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('auth.errors.email_already_registered');
    });
  });

  // ── checkSession ─────────────────────────────────────────────────────────

  describe('checkSession', () => {
    beforeEach(() => {
      service = createService();
    });

    it('should return true when a session exists', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: fakeSession },
      });

      const result = await service.checkSession();
      expect(result).toBe(true);
    });

    it('should return false when no session exists', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
      });

      const result = await service.checkSession();
      expect(result).toBe(false);
    });
  });

  // ── refreshSession ───────────────────────────────────────────────────────

  describe('refreshSession', () => {
    beforeEach(() => {
      service = createService();
    });

    it('should return success with user and session on successful refresh', async () => {
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: { user: fakeUser, session: fakeSession },
        error: null,
      });

      const result = await service.refreshSession();

      expect(result.success).toBe(true);
      expect(result.user).toEqual(fakeUser);
    });

    it('should return error on failed refresh', async () => {
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: { user: null, session: null },
        error: createAuthError('Refresh failed'),
      });

      const result = await service.refreshSession();

      expect(result.success).toBe(false);
    });
  });

  // ── Computed signals ─────────────────────────────────────────────────────

  describe('computed signals', () => {
    it('should start with isLoading true and isAuthenticated false', () => {
      service = createService();

      // Before initializeAuth resolves, isLoading should be true
      expect(service.isLoading()).toBe(true);
      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();
      expect(service.currentSession()).toBeNull();
    });

    it('should update signals after initializeAuth resolves with a session', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: fakeSession },
      });

      service = createService();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(service.isLoading()).toBe(false);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()).toEqual(fakeUser);
      expect(service.currentSession()).toEqual(fakeSession);
    });

    it('should derive userProfile from current user', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: fakeSession },
      });

      service = createService();

      await new Promise((resolve) => setTimeout(resolve, 50));

      const profile = service.userProfile();
      expect(profile).toBeTruthy();
      expect(profile!.id).toBe('user-123');
      expect(profile!.email).toBe('test@example.com');
    });

    it('should return null userProfile when no user', async () => {
      service = createService();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(service.userProfile()).toBeNull();
    });
  });
});
