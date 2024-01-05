import { StatusCodes, ReasonPhrases } from "http-status-codes";
import CustomApiError from "./CustomApi.error";

class NotFoundError extends CustomApiError {

    constructor(message?: string) {
        super(message || ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);
    }
}

export default NotFoundError;