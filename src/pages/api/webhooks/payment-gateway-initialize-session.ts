import { gql } from "urql";
import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  WebhookEventTypeSyncEnum,
  UntypedPaymentGatewayInitializeDocument,
  type PaymentGatewayInitializeSessionPayloadFragment,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { getSyncWebhookHandler } from "@/lib/backend-lib/api-route-utils";
import { PaymentGatewayInitializeSessionWebhookHandler } from "@/modules/handler/payment-gateway-initialize-session";
import { PaymentGatewayInitializeSessionResponseSchema } from "@/models/PaymentGatewayInitializeSessionResponse";
import { PageConfig } from "next";

export const paymentGatewayInitializeSessionSyncWebhook =
  new SaleorSyncWebhook<PaymentGatewayInitializeSessionPayloadFragment>({
    name: "PaymentGatewayInitializeSession",
    webhookPath: "/api/webhooks/payment-gateway-initialize-session",
    event: WebhookEventTypeSyncEnum.PaymentGatewayInitializeSession,
    apl: saleorApp.apl,
    query: UntypedPaymentGatewayInitializeDocument,
  });

export default paymentGatewayInitializeSessionSyncWebhook.createHandler(
  getSyncWebhookHandler(
    "paymentGatewayInitializeSessionSyncWebhook",
    PaymentGatewayInitializeSessionWebhookHandler,
    PaymentGatewayInitializeSessionResponseSchema,
    (payload, errorResponse) => {
      return {
        message: errorResponse.message,
        data: {
          errors: errorResponse.errors,
          paymentResponse: {},
        },
      } as const;
    }
  )
);

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
