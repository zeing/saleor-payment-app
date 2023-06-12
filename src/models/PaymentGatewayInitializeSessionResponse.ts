import * as yup from "yup";
import { SyncWebhookAppErrorSchema } from ".";

export const PaymentGatewayInitializeSessionResponseSchema = yup.object().shape({
  data: yup.object().shape({
    paymentResponse: yup.object(),
    errors: yup.array().of(SyncWebhookAppErrorSchema),
  }),
});

export interface PaymentGatewayInitializeSessionResponse
  extends yup.InferType<typeof PaymentGatewayInitializeSessionResponseSchema> {}
