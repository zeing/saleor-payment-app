import * as yup from "yup";

export const SyncWebhookAppErrorSchema = yup.object().shape({
  code: yup.string().optional(),
  message: yup.string().optional(),
  details: yup.object().optional(),
});
