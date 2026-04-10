
/**
 * Shared Event Bus — Typed cross-app communication system.
 * Enables loose coupling between micro-apps via pub/sub custom events.
 * @module @shared/event-bus
 */
import { useEffect, useRef } from 'react';

/* ─── Event Type Definitions ────────────────────────────────────── */

export enum AppEvent {
  RiskUpdated = 'RISK_UPDATED',
  ComplianceStatusChanged = 'COMPLIANCE_STATUS_CHANGED',
  AuditFindingCreated = 'AUDIT_FINDING_CREATED',
  PolicyApproved = 'POLICY_APPROVED',
  IncidentCreated = 'INCIDENT_CREATED',
  IncidentResolved = 'INCIDENT_RESOLVED',
  VendorRiskChanged = 'VENDOR_RISK_CHANGED',
  PartnerOnboarded = 'PARTNER_ONBOARDED',
  UserRoleChanged = 'USER_ROLE_CHANGED',
  NavigationRequested = 'NAVIGATION_REQUESTED',
  NotificationReceived = 'NOTIFICATION_RECEIVED',
}

export interface AppEventMetadata {
  sourceApp?: string;
  correlationId?: string;
  emittedAt?: string;
}

type EventPayload<T> = T & { meta?: AppEventMetadata };

export interface AppEventPayload {
  [AppEvent.RiskUpdated]: EventPayload<{ riskId: string; riskLevel: string }>;
  [AppEvent.ComplianceStatusChanged]: EventPayload<{ controlId: string; newStatus: string }>;
  [AppEvent.AuditFindingCreated]: EventPayload<{ findingId: string; severity: string }>;
  [AppEvent.PolicyApproved]: EventPayload<{ policyId: string; version: string }>;
  [AppEvent.IncidentCreated]: EventPayload<{ incidentId: string; severity: string }>;
  [AppEvent.IncidentResolved]: EventPayload<{ incidentId: string }>;
  [AppEvent.VendorRiskChanged]: EventPayload<{ vendorId: string; newRating: string }>;
  [AppEvent.PartnerOnboarded]: EventPayload<{ partnerId: string; companyName: string }>;
  [AppEvent.UserRoleChanged]: EventPayload<{ userId: string; newRole: string }>;
  [AppEvent.NavigationRequested]: EventPayload<{ path: string }>;
  [AppEvent.NotificationReceived]: EventPayload<{ message: string; type: 'info' | 'warning' | 'error' | 'success' }>;
}

/* ─── Event Bus Implementation ──────────────────────────────────── */

type EventListener<T = unknown> = (data: T) => void;

const DUPLICATE_SUPPRESSION_WINDOW_MS = 300;
const EMIT_HISTORY_LIMIT = 250;

class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private emitHistory: Map<string, number> = new Map();

  /**
   * Builds a deduplication signature for an event payload.
   */
  private buildEmitSignature<E extends AppEvent>(event: E, data: AppEventPayload[E]): string {
    try {
      return `${event}:${JSON.stringify(data)}`;
    } catch {
      return `${event}:${String(data)}`;
    }
  }

  /**
   * Returns true when an equivalent event payload was emitted moments ago.
   */
  private shouldSuppressDuplicate<E extends AppEvent>(event: E, data: AppEventPayload[E]): boolean {
    const now = Date.now();
    const signature = this.buildEmitSignature(event, data);
    const previousTimestamp = this.emitHistory.get(signature);

    if (
      typeof previousTimestamp === 'number'
      && now - previousTimestamp < DUPLICATE_SUPPRESSION_WINDOW_MS
    ) {
      return true;
    }

    this.emitHistory.set(signature, now);

    if (this.emitHistory.size > EMIT_HISTORY_LIMIT) {
      for (const [knownSignature, timestamp] of this.emitHistory.entries()) {
        if (now - timestamp > DUPLICATE_SUPPRESSION_WINDOW_MS) {
          this.emitHistory.delete(knownSignature);
        }
      }
    }

    return false;
  }

  /**
   * Subscribe to a typed event.
   * @param event - The event name to listen for
   * @param listener - Callback function invoked when event fires
   * @returns Unsubscribe function for cleanup
   */
  on<E extends AppEvent>(event: E, listener: EventListener<AppEventPayload[E]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as EventListener);
    return () => this.off(event, listener);
  }

  /**
   * Unsubscribe a specific listener from an event.
   */
  off<E extends AppEvent>(event: E, listener: EventListener<AppEventPayload[E]>): void {
    this.listeners.get(event)?.delete(listener as EventListener);
  }

  /**
   * Emit a typed event with payload.
   */
  emit<E extends AppEvent>(event: E, data: AppEventPayload[E]): void {
    if (this.shouldSuppressDuplicate(event, data)) {
      return;
    }

    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error(`[EventBus] Error in listener for ${event}:`, err);
      }
    });
  }

  /**
   * Remove all listeners for a specific event or all events.
   */
  clear(event?: AppEvent): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }

    this.emitHistory.clear();
  }
}


/**
 * Window-based singleton ensures all Module Federation bundles share
 * the same EventBus instance for cross-app communication.
 */
const EVENT_BUS_KEY = '__PARTNER_PORTAL_EVENT_BUS__';
export const eventBus: EventBus =
  (window as any)[EVENT_BUS_KEY] ||
  ((window as any)[EVENT_BUS_KEY] = new EventBus());

/* ─── React Hook ────────────────────────────────────────────────── */

/**
 * React hook for subscribing to event bus events with automatic cleanup.
 * @param event - Event name to subscribe to
 * @param handler - Callback invoked when event fires
 */
export function useEventBus<E extends AppEvent>(
  event: E,
  handler: EventListener<AppEventPayload[E]>
): void {
  // Store the latest handler in a ref so the effect never needs to re-subscribe
  // when the handler identity changes between renders (e.g. inline lambdas).
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = eventBus.on(event, (data) => handlerRef.current(data));
    return unsubscribe;
    // Re-subscribe only when the event name changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
}
