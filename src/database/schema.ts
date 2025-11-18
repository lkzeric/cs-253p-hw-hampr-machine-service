/**
 * Defines the possible operational statuses of a machine.
 */
export enum MachineStatus {
    AVAILABLE = 'AVAILABLE', // The machine is idle and ready for a new job.
    AWAITING_DROPOFF = 'AWAITING_DROPOFF', // The machine has been reserved but is waiting for the user to start the cycle.
    RUNNING = 'RUNNING', // The machine is currently in an active cycle.
    AWAITING_PICKUP = 'AWAITING_PICKUP', // The machine's cycle is complete and is waiting for items to be picked up.
    ERROR = 'ERROR' // The machine has encountered an error and is out of service.
}

/**
 * Defines the structure of the machine state document as stored in the database.
 */
export interface MachineStateDocument {
    machineId: string;
    locationId: string;
    currentJobId: string | null;
    status: MachineStatus;
}
