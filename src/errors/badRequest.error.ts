import { ReasonPhrases, StatusCodes } from "http-status-codes";
import CustomApiError from "./customApi.error";

class BadRequestError extends CustomApiError {
    constructor(message?: string) {
        super(message || ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST)
    }
}

export default BadRequestError;