/**
 * A base class for tracking simulated resource consumption.
 * Subclasses can call the `consume` method to record the usage of "units"
 * for different operations. This is used for performance analysis and simulation.
 */
export class ResourceConsumer {
    /** A map to store the total units consumed by each subclass. */
    static usageMap = new Map<string, number>();
    /** The total number of units consumed across all consumers. */
    static totalUnits: number = 0;

    /**
     * Initializes a new instance of the ResourceConsumer.
     */
    public constructor() {}

    /**
     * Records the consumption of resource units for the calling class.
     * @param units The number of units consumed in this operation.
     */
    protected consume(units: number) {
        ResourceConsumer.totalUnits += units;
        if (ResourceConsumer.usageMap.has(this.constructor.name)) {
            ResourceConsumer.usageMap.set(this.constructor.name, ResourceConsumer.usageMap.get(this.constructor.name)! + units);
        } else {
            ResourceConsumer.usageMap.set(this.constructor.name, units);
        }
    }
}

/**
 * Retrieves the map of resource usage per class.
 * @returns A map where keys are class names and values are the total units consumed.
 */
export function getUsage(): Map<string, number> {
    return ResourceConsumer.usageMap;
}

/**
 * Retrieves the total number of resource units consumed across all consumers.
 * @returns The total number of units.
 */
export function getTotalUnits(): number {
    return ResourceConsumer.totalUnits;
}