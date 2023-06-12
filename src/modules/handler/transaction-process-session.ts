import { invariant } from "@/lib/invariant";
import { createLogger } from "@/lib/logger";
import {
  TransactionEventTypeEnum,
  TransactionProcessSessionPayloadFragment,
} from "generated/graphql";

import { TransactionProcessSessionResponse } from "@/models/TransactionProcessSessionResponse";
import { uuidv7 } from "uuidv7";
import { transactionProcessSessionEventTo2C2P } from "../2c2p/utils";
import { getPaymentInquiry } from "../2c2p/2c2p-api";
import { Payment2C2PError } from "@/errors";
import { JSONObject } from "@/models/types";

export const TransactionProcessSessionWebhookHandler = async (
  event: TransactionProcessSessionPayloadFragment,
  saleorApiUrl: string
): Promise<TransactionProcessSessionResponse> => {
  const logger = createLogger({}, { msgPrefix: `[TransactionProcessSessionWebhookHandler] ` });
  logger.debug({ event }, `Received event`);
  const app = event.recipient;
  invariant(app, `Missing event.recipient!`);

  const { metadata, privateMetadata } = app;

  const paymentRequest = await transactionProcessSessionEventTo2C2P(event);

  logger.debug({ paymentRequest }, `2c2pPaymentRequest payload`);
  const paymentResponse = await getPaymentInquiry(paymentRequest);
  logger.debug({ paymentResponse }, `2c2pPaymentRequest result`);

  if (paymentResponse.response.respCode !== "0000") {
    const data = {
      paymentResponse: paymentResponse as JSONObject,
    };

    const transactionProcessSessionResponse = {
      pspReference: event.data.invoiceNo,
      result: TransactionEventTypeEnum.ChargeActionRequired,
      amount: event.action.amount,
      data,
      message: "2c2p payment failed",
    };

    logger.debug({ transactionProcessSessionResponse });
    return transactionProcessSessionResponse;

    //throw new Payment2C2PError(`2C2P error failed: ${paymentResponse.response.respDesc || ""}`, {
    //  props: {
    //    errorCode: paymentResponse.response.respCode,
    //  },
    //});
  }

  const data = {
    paymentResponse: paymentResponse as JSONObject,
  };

  const transactionProcessSessionResponse = {
    pspReference: paymentResponse.response.invoiceNo,
    result: TransactionEventTypeEnum.ChargeSuccess,
    amount: event.action.amount,
    data,
    //externalUrl: "<[Optional] external url with action details.",
    message: "payment success",
  };

  logger.debug({ transactionProcessSessionResponse });
  return transactionProcessSessionResponse;
};
