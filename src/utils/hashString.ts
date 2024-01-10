import crypto from "crypto";

const hashString = (value: string) => crypto.createHash('md5').update(value).digest('hex');

export default hashString;