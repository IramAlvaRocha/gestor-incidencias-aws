import type { ActivityLogEntry, IActivityLogger } from "../../application/ports/IActivityLogger.js";

export class DynamoActivityLogger implements IActivityLogger {
    
    constructor(
        private readonly tableName: string,
        region: string
    ) {
        
    }

    log(ticketId: string, entry: Omit<ActivityLogEntry, "timestamp">): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getByTicketId(ticketId: string): Promise<ActivityLogEntry[]> {
        throw new Error("Method not implemented.");
    }

}