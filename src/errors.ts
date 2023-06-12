import { type IncomingHttpHeaders } from "node:http2";
import ModernError from "modern-errors";
import ModernErrorsSerialize from "modern-errors-serialize";

// Http errors
type CommonProps = {
  errorCode?: string;
  statusCode?: number;
  name?: number;
};

export const BaseError = ModernError.subclass("BaseError", {
  plugins: [ModernErrorsSerialize],
  props: {} as CommonProps,
});
export const UnknownError = BaseError.subclass("UnknownError");
export const JsonSchemaError = BaseError.subclass("JsonSchemaError");
export const MissingSaleorApiUrlError = BaseError.subclass(`MissingSaleorApiUrlError`);
export const MissingAuthDataError = BaseError.subclass(`MissingAuthDataError`);
export const Payment2C2PError = BaseError.subclass(`Payment2C2PError`);

export const HttpRequestError = BaseError.subclass(`HttpRequestError`, {
  props: {} as { statusCode: number; body: string; headers: IncomingHttpHeaders },
});
