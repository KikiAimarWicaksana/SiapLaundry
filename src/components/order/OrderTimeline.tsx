import React from "react";
import type { OrderStatus } from "@/types/order";

export interface TimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: string | null;
  actor?: string;
  vehiclePlate?: string;
}

export interface OrderTimelineProps {
  events: TimelineEvent[];
  currentStatus: OrderStatus;
}

/**
 * Ordered list of statuses for determining completed/active/upcoming state.
 */
const STATUS_ORDER: OrderStatus[] = [
  "pending_pickup",
  "driver_on_way_pickup",
  "picked_up",
  "at_laundry",
  "washing",
  "ready_for_delivery",
  "driver_on_way_delivery",
  "delivered",
  "completed",
];

function getEventState(
  eventStatus: OrderStatus,
  currentStatus: OrderStatus
): "completed" | "active" | "upcoming" {
  if (currentStatus === "cancelled") {
    // For cancelled orders, mark all events with timestamps as completed,
    // the cancelled status itself as active
    if (eventStatus === "cancelled") return "active";
    return "completed";
  }

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const eventIndex = STATUS_ORDER.indexOf(eventStatus);

  if (eventIndex < currentIndex) return "completed";
  if (eventIndex === currentIndex) return "active";
  return "upcoming";
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 text-green-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DotIcon({ state }: { state: "active" | "upcoming" }) {
  const colorClass =
    state === "active" ? "bg-ink" : "bg-shade-30";

  return (
    <span
      className={[
        "block h-3 w-3 rounded-full",
        colorClass,
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

/**
 * OrderTimeline — vertical progress bar showing all order status events.
 *
 * - Completed statuses: green check icon
 * - Active status: ink-colored dot
 * - Upcoming statuses: shade-30 dot
 *
 * Validates: Requirements 8.2, 8.6
 */
export function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  return (
    <ol className="relative flex flex-col gap-0" aria-label="Timeline status order">
      {events.map((event, index) => {
        const state = getEventState(event.status, currentStatus);
        const isLast = index === events.length - 1;

        return (
          <li key={event.status} className="relative flex gap-3">
            {/* Vertical line connector */}
            {!isLast && (
              <span
                className={[
                  "absolute left-[11px] top-6 w-0.5",
                  "h-[calc(100%-8px)]",
                  state === "completed" ? "bg-green-300" : "bg-shade-30",
                ].join(" ")}
                aria-hidden="true"
              />
            )}

            {/* Icon */}
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas-light">
              {state === "completed" ? (
                <CheckIcon />
              ) : (
                <DotIcon state={state} />
              )}
            </span>

            {/* Content */}
            <div className="flex flex-col pb-6">
              <span
                className={[
                  "text-sm font-medium leading-tight",
                  state === "upcoming" ? "text-shade-40" : "text-ink",
                ].join(" ")}
              >
                {event.label}
              </span>

              {event.timestamp && (
                <span className="mt-0.5 text-xs text-shade-50">
                  {event.timestamp}
                </span>
              )}

              {event.actor && (
                <span className="mt-0.5 text-xs text-shade-50">
                  {event.actor}
                  {event.vehiclePlate && ` • ${event.vehiclePlate}`}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default OrderTimeline;
