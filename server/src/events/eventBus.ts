import {
    randomUUID,
} from "node:crypto";

import type {
    AnyDomainEvent,
    DomainEvent,
    DomainEventHandler,
    DomainEventPayloadMap,
} from "../interfaces/domainEvent.interface";

type AnyEventHandler = (
    event: AnyDomainEvent
) => void | Promise<void>;

export class EventBus {
    private readonly handlers =
        new Map<
            keyof DomainEventPayloadMap,
            Set<AnyEventHandler>
        >();

    /*
    |--------------------------------------------------------------------------
    | Subscribe
    |--------------------------------------------------------------------------
    */

    subscribe<
        TName extends
            keyof DomainEventPayloadMap
    >(
        eventName: TName,
        handler:
            DomainEventHandler<TName>
    ): () => void {
        const currentHandlers =
            this.handlers.get(
                eventName
            ) ??
            new Set<AnyEventHandler>();

        currentHandlers.add(
            handler as unknown as
                AnyEventHandler
        );

        this.handlers.set(
            eventName,
            currentHandlers
        );

        /*
        Return an unsubscribe function.

        This will also be useful for tests and
        graceful module cleanup later.
        */
        return () => {
            const registeredHandlers =
                this.handlers.get(
                    eventName
                );

            if (!registeredHandlers) {
                return;
            }

            registeredHandlers.delete(
                handler as unknown as
                    AnyEventHandler
            );

            if (
                registeredHandlers.size ===
                0
            ) {
                this.handlers.delete(
                    eventName
                );
            }
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Publish
    |--------------------------------------------------------------------------
    */

    async publish<
        TName extends
            keyof DomainEventPayloadMap
    >(
        eventName: TName,
        payload:
            DomainEventPayloadMap[TName]
    ): Promise<void> {
        const registeredHandlers =
            this.handlers.get(
                eventName
            );

        if (
            !registeredHandlers ||
            registeredHandlers.size === 0
        ) {
            return;
        }

        const event:
            DomainEvent<TName> = {
                id:
                    randomUUID(),

                name:
                    eventName,

                occurredAt:
                    new Date(),

                payload,
            };

        /*
        Subscribers are independent.

        One subscriber failing must not prevent
        the other subscribers from running.
        */
        const results =
            await Promise.allSettled(
                Array.from(
                    registeredHandlers
                ).map(
                    async (handler) => {
                        await handler(
                            event as
                                AnyDomainEvent
                        );
                    }
                )
            );

        /*
        The original business operation has already
        been persisted before publishing.

        Therefore, subscriber failures are logged,
        but they do not create a misleading rollback
        error for the client.
        */
        for (
            const result of results
        ) {
            if (
                result.status ===
                "rejected"
            ) {
                console.error(
                    `Domain event handler failed for "${String(
                        eventName
                    )}".`,
                    result.reason
                );
            }
        }
    }
}

export default new EventBus();