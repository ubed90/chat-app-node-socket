import { ReasonPhrases, StatusCodes } from "http-status-codes";
import CustomApiError from "./customApi.error";

class UnauthenticatedError extends CustomApiError {
    constructor(message?: string) {
        super(message || ReasonPhrases.UNAUTHORIZED, StatusCodes.UNAUTHORIZED)
    }
}

export default UnauthenticatedError;