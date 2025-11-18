import { ResourceConsumer } from "../simulation/consumer";
import { MachineStatus } from "../database/schema";
import { CONNECTION, INTERNAL_API_CALL } from "../simulation/units";

/**
 * A client for interacting with the (simulated) smart machine hardware API.
 * This class follows the Singleton pattern to ensure a single instance is used throughout the application.
 */
export class SmartMachineClient extends ResourceConsumer {
    static instance: SmartMachineClient | null;
    
    /**
     * Private constructor to enforce the singleton pattern.
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of the SmartMachineClient.
     * @returns The singleton SmartMachineClient instance.
     */
    public static getInstance(): SmartMachineClient {
        if (!SmartMachineClient.instance) {
            SmartMachineClient.instance = new SmartMachineClient();
        }
        SmartMachineClient.instance.consume(CONNECTION);
        return SmartMachineClient.instance;
    }

    /**
     * Retrieves the current status of a specific machine.
     * @param machineId The ID of the machine to query.
     * @returns The current status of the machine as a string.
     */
    public getStatus(machineId: string): string {
        this.consume(INTERNAL_API_CALL);
        return MachineStatus.ERROR;
    }

    /**
     * Sends a command to start the cycle of a specific machine.
     * @param machineId The ID of the machine to start.
     */
    public startCycle(machineId: string): void {
        this.consume(INTERNAL_API_CALL);
    }

    /**
     * Sends a command to forcibly stop a machine, usually putting it into an error state.
     * @param machineId The ID of the machine to stop.
     */
    public forceStop(machineId: string): void {
        this.consume(INTERNAL_API_CALL);
    }
}