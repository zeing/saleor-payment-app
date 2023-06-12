import { gql } from "urql";
import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  WebhookEventTypeSyncEnum,
  UntypedTransactionProcessSessionDocument,
  TransactionProcessSessionPayloadFragment,
  TransactionEventTypeEnum,
  TransactionFlowStrategyEnum,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { TransactionProcessSessionResponseSchema } from "@/models/TransactionProcessSessionResponse";
import { getSyncWebhookHandler } from "@/lib/backend-lib/api-route-utils";
import { TransactionProcessSessionWebhookHandler } from "@/modules/handler/transaction-process-session";
import { uuidv7 } from "uuidv7";

export const transactionProcessSessionSyncWebhook =
  new SaleorSyncWebhook<TransactionProcessSessionPayloadFragment>({
    name: "TransactionProcessSession",
    webhookPath: "/api/webhooks/transaction-process-session",
    event: WebhookEventTypeSyncEnum.TransactionProcessSession,
    apl: saleorApp.apl,
    query: UntypedTransactionProcessSessionDocument,
  });

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default transactionProcessSessionSyncWebhook.createHandler(
  getSyncWebhookHandler(
    "transactionProcessSessionSyncWebhook",
    TransactionProcessSessionWebhookHandler,
    TransactionProcessSessionResponseSchema,
    (payload, errorResponse) => {
      return {
        amount: 0,
        result:
          payload.action.actionType === TransactionFlowStrategyEnum.Authorization
            ? TransactionEventTypeEnum.AuthorizationFailure
            : TransactionEventTypeEnum.ChargeFailure,
        message: errorResponse.message,
        data: { errors: errorResponse.errors, paymentResponse: {} },
        //pspReference: uuidv7(),
      } as const;
    }
  )
);

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
