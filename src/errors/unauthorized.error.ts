import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import CustomApiError from './customApi.error';

class UnauthroizedError extends CustomApiError {
  constructor(message?: string) {
    super(message || ReasonPhrases.UNAUTHORIZED, StatusCodes.FORBIDDEN);
  }
}

export default UnauthroizedError;
