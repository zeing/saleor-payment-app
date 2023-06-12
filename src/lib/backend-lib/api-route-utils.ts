import { type NextApiRequest, type NextApiResponse } from "next";
import * as yup from "yup";
import { type NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";

import { JsonSchemaError, UnknownError, BaseError } from "@/errors";
import { createLogger } from "../logger";

export const validateData = async <S extends yup.Schema<any>>(data: unknown, validate: S) => {
  type Result = yup.InferType<S>;

  try {
    const isValid = await validate.isValid(data);
    if (!isValid) {
      throw new JsonSchemaError(`Schema validation failed`, {});
    }
    return data as Result;
  } catch (err) {
    if (err instanceof JsonSchemaError) {
      throw err;
    }
    throw UnknownError.normalize(err);
  }
};

export function getSyncWebhookHandler<TPayload, TResult, TSchema extends yup.Schema<TResult>>(
  name: string,
  webhookHandler: (payload: TPayload, saleorApiUrl: string) => Promise<TResult>,
  ResponseSchema: TSchema,
  errorMapper: (payload: TPayload, errorResponse: ErrorResponse) => TResult & {}
): NextWebhookApiHandler<TPayload> {
  return async (_req, res: NextApiResponse<Error | TResult>, ctx) => {

    const logger = createLogger(
      {
        event: ctx.event,
      },
      { msgPrefix: `[${name}] ` }
    );
    const { authData, payload } = ctx;
    logger.info(`handler called: ${webhookHandler.name}`);
    logger.debug({ payload }, "ctx payload");

    try {
      const result = await webhookHandler(payload, authData.saleorApiUrl);
      logger.info(`${webhookHandler.name} was successful`);
      //logger.info({ result }, `Sending successful response`);
      logger.debug({ result }, `Sending successful response`);
      return res.json(await validateData(result, ResponseSchema));
    } catch (err) {
      console.error("err eing", err);
      logger.error({ err }, `${webhookHandler.name} error`);
      const response = errorToResponse(err);

      if (!response) {
        const result = BaseError.serialize(err);
        logger.debug({ result }, `Sending error response`);
        return res.status(500).json(result);
      }

      const finalErrorResponse = errorMapper(payload, response);
      logger.debug({ finalErrorResponse }, `Sending error response`);
      return res.status(200).json(await validateData(finalErrorResponse, ResponseSchema));
    }
  };
}

type ErrorResponse = Exclude<ReturnType<typeof errorToResponse>, null>;
const errorToResponse = (err: unknown) => {
  const normalizedError = err instanceof BaseError ? err : null;

  if (!normalizedError) {
    return null;
  }
  const message = normalizedError.message;

  const errors = [
    {
      code: normalizedError.name,
      message: normalizedError.message,
      details: {
        errorCode: normalizedError.errorCode ?? null,
        statusCode: normalizedError.statusCode ?? null,
      },
    },
    ...(normalizedError.errors?.map((inner) => {
      return {
        code: inner.name,
        message: inner.message,
      };
    }) ?? []),
  ];

  return {
    errors,
    message,
  };
};
