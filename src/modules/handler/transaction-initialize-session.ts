import { invariant } from "@/lib/invariant";
import { createLogger } from "@/lib/logger";
import { type TransactionInitializeSessionResponse } from "@/models/TransactionInitializeSessionResponse";
import {
  TransactionEventTypeEnum,
  TransactionInitializeSessionPayloadFragment,
} from "generated/graphql";
import { transactionInitializeSessionEventTo2C2P } from "../2c2p/utils";
import { initPaymentToken } from "../2c2p/2c2p-api";
import { JSONObject } from "@/models/types";
import { uuidv7 } from "uuidv7";
import { Payment2C2PError } from "@/errors";

export const TransactionInitializeSessionWebhookHandler = async (
  event: TransactionInitializeSessionPayloadFragment,
  saleorApiUrl: string
): Promise<TransactionInitializeSessionResponse> => {
  const logger = createLogger({}, { msgPrefix: `[TransactionInitializeSessionWebhookHandler] ` });
  logger.debug({ event }, `Received event`);
  const app = event.recipient;
  invariant(app, `Missing event.recipient!`);

  const { metadata, privateMetadata } = app;

  const paymentRequest = await transactionInitializeSessionEventTo2C2P(event);
  logger.debug({ paymentRequest }, `2c2pPaymentRequest payload`);
  const paymentResponse = await initPaymentToken(paymentRequest);
  logger.debug({ paymentResponse }, `2c2pPaymentRequest result`);

  if (paymentResponse.response.respCode !== "0000") {
    throw new Payment2C2PError(`2C2P error failed: ${paymentResponse.response.respDesc || ""}`, {
      props: {
        errorCode: paymentResponse.response.respCode,
      },
    });
  }

  const data = {
    paymentResponse: paymentResponse as JSONObject,
  };

  const transactionInitializeSessionResponse: TransactionInitializeSessionResponse = {
    data,
    pspReference: paymentRequest.invoiceNo.toString(),
    result: TransactionEventTypeEnum.ChargeActionRequired,
    amount: event.action.amount,
    message: "get payment link from 2c2p",
    //externalUrl: `https://example.com`,
  };

  logger.debug({ transactionInitializeSessionResponse });
  return transactionInitializeSessionResponse;
};
