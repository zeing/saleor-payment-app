import { SyncWebhookAppErrorSchema } from ".";
import * as yup from "yup";

export const TransactionInitializeSessionResponseSchema = yup.object().shape({
  pspReference: yup.string(),
  data: yup.object().shape({
    paymentResponse: yup.object(),
    errors: yup.array(SyncWebhookAppErrorSchema),
  }),
  result: yup
    .string()
    .oneOf([
      "CHARGE_SUCCESS",
      "CHARGE_FAILURE",
      "CHARGE_REQUESTED",
      "CHARGE_ACTION_REQUIRED",
      "AUTHORIZATION_SUCCESS",
      "AUTHORIZATION_FAILURE",
      "AUTHORIZATION_REQUESTED",
      "AUTHORIZATION_ACTION_REQUIRED",
    ]),
  amount: yup.number().required(),
  time: yup.string(),
  externalUrl: yup.string(),
  message: yup.string(),
});

export interface TransactionInitializeSessionResponse
  extends yup.InferType<typeof TransactionInitializeSessionResponseSchema> {}
