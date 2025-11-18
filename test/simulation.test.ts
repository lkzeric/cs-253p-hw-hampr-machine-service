import { DataCache } from '../src/database/cache';
import { MachineStateDocument, MachineStatus } from '../src/database/schema';
import { MachineStateTable } from '../src/database/table';
import { IdentityProviderClient } from '../src/external/idp';
import { SmartMachineClient } from '../src/external/smart-machine';
import { ApiHandler } from '../src/handler/api';
import { HttpMethod, RequestMachineRequestModel } from '../src/handler/model';
import { ResourceConsumer, getUsage, getTotalUnits } from '../src/simulation/consumer';
import { EXTERNAL_API_CALL, INTERNAL_API_CALL } from '../src/simulation/units';

interface SimulationRunResult {
  usage: Map<string, number>;
  totalUnits: number;
}

describe('API Load Simulation', () => {
  const SIMULATION_ITERATIONS = 4;
  let apiHandler: ApiHandler;

  // --- Simulation Parameters ---
  const SIMULATION_RUNS = 10000; // Number of simulated API calls
  const NUM_MACHINES = 100;
  const NUM_LOCATIONS = 5;
  const HARDWARE_FAILURE_RATE = 0.05; // 5% chance of a hardware fault on start
  // -----------------------------

  const machineIds: string[] = [];
  const locationIds: string[] = [];

  beforeAll(() => {
    // Generate test data IDs
    for (let i = 0; i < NUM_MACHINES; i++) machineIds.push(`sim-machine-${i}`);
    for (let i = 0; i < NUM_LOCATIONS; i++) locationIds.push(`sim-location-${i}`);
  });

  it('should handle multiple simulation runs and output a consolidated report', () => {
    const allRunsResults: SimulationRunResult[] = [];
    const allRunsCacheStats: any[] = [];

    for (let iteration = 1; iteration <= SIMULATION_ITERATIONS; iteration++) {
      // --- Setup for each iteration ---
      jest.clearAllMocks();
      ResourceConsumer.usageMap.clear();
      ResourceConsumer.totalUnits = 0;
      DataCache.instance = null;
      DataCache.cacheHits = 0;
      DataCache.cacheMisses = 0;
      MachineStateTable.instance = null;
      MachineStateTable.dbAccesses = 0;

      const idp = IdentityProviderClient.getInstance();
      jest.spyOn(idp, 'validateToken').mockImplementation(() => {
        // @ts-ignore - accessing protected member for test
        idp.consume(EXTERNAL_API_CALL);
        return true;
      });

      const smc = SmartMachineClient.getInstance();
      jest.spyOn(smc, 'startCycle').mockImplementation(() => {
        // @ts-ignore - accessing protected member for test
        smc.consume(INTERNAL_API_CALL);
        if (Math.random() < HARDWARE_FAILURE_RATE) {
          throw new Error('Simulated hardware fault');
        }
      });

      const db = MachineStateTable.getInstance();
      const machineData = new Map<string, MachineStateDocument>();
      (db as any).machines = machineData;

      for (let i = 0; i < NUM_MACHINES; i++) {
        machineData.set(machineIds[i], {
          machineId: machineIds[i],
          locationId: locationIds[i % NUM_LOCATIONS],
          status: MachineStatus.AVAILABLE,
          currentJobId: null,
        });
      }

      apiHandler = new ApiHandler();
      // --- End of Setup ---

      const reservedMachines: MachineStateDocument[] = [];
      for (let i = 0; i < SIMULATION_RUNS; i++) {
        const action = Math.random();
        if (action < 0.4) { // Request a machine
          const locationId = locationIds[Math.floor(Math.random() * locationIds.length)];
          const request: RequestMachineRequestModel = {
            method: HttpMethod.POST,
            path: '/machine/request',
            token: 'sim-token',
            locationId,
            jobId: `sim-job-${i}`,
          };
          const response = apiHandler.handle(request);
          if (response.machine) {
            reservedMachines.push(response.machine);
          }
        } else if (action < 0.7 && reservedMachines.length > 0) { // Start a machine
          const machineToStart = reservedMachines.shift()!;
          apiHandler.handle({
            method: HttpMethod.POST,
            path: `/machine/${machineToStart.machineId}/start`,
            token: 'sim-token',
          });
        } else { // Get machine status
          const machineId = machineIds[Math.floor(Math.random() * machineIds.length)];
          apiHandler.handle({
            method: HttpMethod.GET,
            path: `/machine/${machineId}`,
            token: 'sim-token',
          });
        }
      }

      // --- Collect results for the current iteration ---
      allRunsResults.push({ usage: getUsage(), totalUnits: getTotalUnits() });
      allRunsCacheStats.push({
        hits: DataCache.cacheHits,
        misses: DataCache.cacheMisses,
        hitRate: DataCache.cacheHits / (DataCache.cacheHits + DataCache.cacheMisses) || 0
      });
    }

    // --- Final Consolidated Report Generation ---
    const allConsumers = new Set<string>();
    allRunsResults.forEach(run => run.usage.forEach((_units, consumer) => allConsumers.add(consumer)));

    const finalUnitReport = Array.from(allConsumers).map(consumer => {
      const row: { [key: string]: any } = { 'Resource': consumer };
      allRunsResults.forEach((run, i) => {
        const units = run.usage.get(consumer) || 0;
        row[`Run ${i + 1} Units`] = units;
        row[`Run ${i + 1} %`] = `${((units / run.totalUnits) * 100).toFixed(2)}%`;
      });
      return row;
    });

    const finalCacheReport = allRunsCacheStats.map((stats, i) => ({
      'Run': i + 1,
      'Cache Hits': stats.hits,
      'Cache Misses': stats.misses,
      'Hit Rate': `${(stats.hitRate * 100).toFixed(2)}%`
    }));

    const finalRatioReport = allRunsResults.map((run, i) => {
      const cacheStats = allRunsCacheStats[i];
      const dbAccesses = (run.usage.get('MachineStateTable') || 0) > 0 ? MachineStateTable.dbAccesses : 0;
      const ratio = dbAccesses > 0 ? cacheStats.hits / dbAccesses : 0;

      return {
        'Run': i + 1,
        'Cache Hits': cacheStats.hits,
        'DB Accesses': dbAccesses,
        'Hit/Access Ratio': ratio.toFixed(4),
      };
    });


    console.table(finalUnitReport);
    console.table(finalCacheReport);
    console.table(finalRatioReport);

    // Add a simple expectation to make Jest consider this a valid test
    expect(allRunsResults.length).toBe(SIMULATION_ITERATIONS);
  });
});
