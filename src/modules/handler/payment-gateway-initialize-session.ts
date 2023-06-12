import { invariant } from "@/lib/invariant";
import { createLogger } from "@/lib/logger";
import { PaymentGatewayInitializeSessionResponse } from "@/models/PaymentGatewayInitializeSessionResponse";
import { PaymentGatewayInitializeSessionPayloadFragment } from "generated/graphql";

export const PaymentGatewayInitializeSessionWebhookHandler = async (
  event: PaymentGatewayInitializeSessionPayloadFragment,
  saleorApiUrl: string
): Promise<PaymentGatewayInitializeSessionResponse> => {
  const logger = createLogger(
    {},
    { msgPrefix: `[PaymentGatewayInitializeSessionWebhookHandler] ` }
  );

  logger.info({}, `Processing Payment Gateway Initialize request`);
  return {
    data: {
      paymentResponse: { provider: "2c2p", amount: event.amount },
    },
  };
};
