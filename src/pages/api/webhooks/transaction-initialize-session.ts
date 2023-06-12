import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  WebhookEventTypeSyncEnum,
  UntypedTransactionInitializeSessionDocument,
  TransactionInitializeSessionPayloadFragment,
  TransactionEventTypeEnum,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { type PageConfig } from "next";
import { getSyncWebhookHandler } from "@/lib/backend-lib/api-route-utils";
import { uuidv7 } from "uuidv7";
import { TransactionInitializeSessionWebhookHandler } from "@/modules/handler/transaction-initialize-session";
import {
  TransactionInitializeSessionResponse,
  TransactionInitializeSessionResponseSchema,
} from "@/models/TransactionInitializeSessionResponse";

export const transactionInitializeSessionSyncWebhook =
  new SaleorSyncWebhook<TransactionInitializeSessionPayloadFragment>({
    name: "TransactionInitializeSession",
    webhookPath: "/api/webhooks/transaction-initialize-session",
    event: WebhookEventTypeSyncEnum.TransactionInitializeSession,
    apl: saleorApp.apl,
    query: UntypedTransactionInitializeSessionDocument,
  });

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default transactionInitializeSessionSyncWebhook.createHandler(
  getSyncWebhookHandler(
    "transactionInitializeSessionSyncWebhook",
    TransactionInitializeSessionWebhookHandler,
    TransactionInitializeSessionResponseSchema,
    (payload, errorResponse) => {
      return {
        amount: 0,
        result: TransactionEventTypeEnum.ChargeFailure,
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
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
