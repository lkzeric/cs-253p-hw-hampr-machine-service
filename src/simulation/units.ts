/**
 * Defines constants representing the "cost" in arbitrary units for various
 * simulated operations. These are used to track resource consumption for
 * performance analysis in the simulation.
 */

/** Cost for a read operation from the cache. */
export const CACHE_READ = 4;
/** Cost for a write operation to the cache. */
export const CACHE_WRITE = 6;
/** Cost for a read operation from the database. */
export const DATABASE_READ = 2 * CACHE_READ;
/** Cost for a non-critical (lazy) write to the database. */
export const DATABASE_LAZY_WRITE = 2 * CACHE_WRITE;
/** Cost for a critical write to the database. */
export const DATABASE_WRITE = 2.5 * CACHE_WRITE;
/** Cost for an internal API call between services. */
export const INTERNAL_API_CALL = 64;
/** Cost for an external API call to a third-party service. */
export const EXTERNAL_API_CALL = 2 * INTERNAL_API_CALL;
/** Cost for establishing a new connection. */
export const CONNECTION = 256;
