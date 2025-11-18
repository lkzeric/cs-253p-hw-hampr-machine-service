import { ResourceConsumer } from "../simulation/consumer";
import { CONNECTION, EXTERNAL_API_CALL } from "../simulation/units";

/**
 * A client for interacting with the (simulated) Identity Provider (IDP) service.
 * This class is responsible for token validation and user identification.
 * It follows the Singleton pattern.
 */
export class IdentityProviderClient extends ResourceConsumer {
    static instance: IdentityProviderClient | null;
    
    /**
     * Private constructor to enforce the singleton pattern.
     */
    private constructor() {
        super();
    }

    /**
     * Gets the singleton instance of the IdentityProviderClient.
     * @returns The singleton IdentityProviderClient instance.
     */
    public static getInstance(): IdentityProviderClient {
        if (!IdentityProviderClient.instance) {
            IdentityProviderClient.instance = new IdentityProviderClient();
        }
        IdentityProviderClient.instance.consume(CONNECTION);
        return IdentityProviderClient.instance;
    }

    /**
     * Validates an authentication token by calling the simulated IDP.
     * @param token The authentication token to validate.
     * @returns `true` if the token is valid, `false` otherwise.
     */
    public validateToken(token: string): boolean {
        this.consume(EXTERNAL_API_CALL);
        return false;
    }

    /**
     * Retrieves the user ID associated with a given token from the simulated IDP.
     * @param token The authentication token.
     * @returns The user ID extracted from the token.
     */
    public getUserId(token: string): string {
        this.consume(EXTERNAL_API_CALL);
        return "";
    }
}