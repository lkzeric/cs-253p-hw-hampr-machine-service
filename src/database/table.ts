import { ResourceConsumer } from "../simulation/consumer";
import { CONNECTION, DATABASE_LAZY_WRITE, DATABASE_READ, DATABASE_WRITE } from "../simulation/units";
import { MachineStateDocument, MachineStatus } from "./schema";

/**
 * Represents the machine state database table as an in-memory data store.
 * This class simulates database interactions and follows the Singleton pattern.
 * It is pre-populated with mock data.
 */
export class MachineStateTable extends ResourceConsumer{
    static instance: MachineStateTable | null;
    private machines: Map<string, MachineStateDocument>;
    static dbAccesses = 0;
    
    /**
     * Private constructor to enforce the singleton pattern and initialize the mock data.
     */
    private constructor() {
        super();
        this.machines = new Map<string, MachineStateDocument>();
    }

    /**
     * Gets the singleton instance of the MachineStateTable.
     * @returns The singleton MachineStateTable instance.
     */
    public static getInstance(): MachineStateTable {
        if (!MachineStateTable.instance) {
            MachineStateTable.instance = new MachineStateTable();
        }
        MachineStateTable.instance.consume(CONNECTION);
        return MachineStateTable.instance;
    }

    /**
     * Lists all machines at a given location.
     * @param locationId The ID of the location to search for.
     * @returns An array of machine state documents for the specified location.
     */
    public listMachinesAtLocation(locationId: string): MachineStateDocument[] {
        MachineStateTable.dbAccesses++;
        this.consume(DATABASE_READ);
        const allMachines = Array.from(this.machines.values());
        return allMachines.filter(machine => machine.locationId === locationId);
    }

    /**
     * Retrieves a single machine's state by its ID.
     * @param machineId The ID of the machine to retrieve.
     * @returns A copy of the machine state document, or undefined if not found.
     */
    public getMachine(machineId: string): MachineStateDocument | undefined {
        MachineStateTable.dbAccesses++;
        this.consume(DATABASE_READ);
        const machine = this.machines.get(machineId);
        if (!machine) {
            return undefined;
        }
        return { ...machine };
    }

    /**
     * Updates the job ID for a specific machine.
     * @param machineId The ID of the machine to update.
     * @param jobId The new job ID to assign.
     */
    public updateMachineJobId(machineId: string, jobId: string) {
        MachineStateTable.dbAccesses++;
        this.consume(DATABASE_LAZY_WRITE);
        const machine = this.machines.get(machineId);
        if (machine) {
            machine.currentJobId = jobId;
        }
    }

    /**
     * Updates the status for a specific machine.
     * @param machineId The ID of the machine to update.
     * @param status The new status to set.
     */
    public updateMachineStatus(machineId: string, status: MachineStatus) {
        MachineStateTable.dbAccesses++;
        this.consume(DATABASE_WRITE);
        const machine = this.machines.get(machineId);
        if (machine) {
            machine.status = status;
        }
    }

}