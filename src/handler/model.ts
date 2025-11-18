import { MachineStateDocument } from "../database/schema"

/**
 * Defines the supported HTTP methods for API requests.
 */
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
};

/**
 * Defines standard HTTP response codes used in the API.
 */
export enum HttpResponseCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    HARDWARE_ERROR = 420,
    INTERNAL_SERVER_ERROR = 500,
}

/**
 * Base model for all API requests.
 */
export interface RequestModel {
    method: HttpMethod,
    path: string,
    token: string
}

/**
 * Request model for requesting a machine for a job.
 */
export interface RequestMachineRequestModel extends RequestModel {
    locationId: string, 
    jobId: string
}

/**
 * Request model for getting the state of a specific machine.
 */
export interface GetMachineRequestModel extends RequestModel {
    machineId: string
}

/**
 * Request model for starting a machine's cycle.
 */
export interface StartMachineRequestModel extends RequestModel {
    machineId: string
}

/**
 * Response model for API endpoints that return machine state.
 */
export interface MachineResponseModel {
    statusCode: HttpResponseCode,
    machine?: MachineStateDocument
}