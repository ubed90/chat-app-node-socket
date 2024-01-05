import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import CustomApiError from './CustomApi.error';

class UnauthroizedError extends CustomApiError {
  constructor(message?: string) {
    super(message || ReasonPhrases.UNAUTHORIZED, StatusCodes.FORBIDDEN);
  }
}

export default UnauthroizedError;
