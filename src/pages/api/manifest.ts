import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { orderCreatedWebhook } from "./webhooks/order-created";
import { paymentGatewayInitializeSessionSyncWebhook } from "./webhooks/payment-gateway-initialize-session";
import { transactionInitializeSessionSyncWebhook } from "./webhooks/transaction-initialize-session";
import { transactionProcessSessionSyncWebhook } from "./webhooks/transaction-process-session";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: packageJson.name,
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      /**
       * Set permissions for app if needed
       * https://docs.saleor.io/docs/3.x/developer/permissions
       */
      permissions: [
        /**
         * Add permission to allow "ORDER_CREATED" webhook registration.
         *
         * This can be removed
         */
        "MANAGE_ORDERS",
        "HANDLE_PAYMENTS",
        "MANAGE_CHECKOUTS",
        "MANAGE_USERS",
      ],
      id: "p9.payment.app",
      version: packageJson.version,
      /**
       * Configure webhooks here. They will be created in Saleor during installation
       * Read more
       * https://docs.saleor.io/docs/3.x/developer/api-reference/objects/webhook
       *
       * Easiest way to create webhook is to use app-sdk
       * https://github.com/saleor/saleor-app-sdk/blob/main/docs/saleor-webhook.md
       */
      webhooks: [
        orderCreatedWebhook.getWebhookManifest(context.appBaseUrl),
        paymentGatewayInitializeSessionSyncWebhook.getWebhookManifest(context.appBaseUrl),
        transactionInitializeSessionSyncWebhook.getWebhookManifest(context.appBaseUrl),
        transactionProcessSessionSyncWebhook.getWebhookManifest(context.appBaseUrl),
      ],
      /**
       * Optionally, extend Dashboard with custom UIs
       * https://docs.saleor.io/docs/3.x/developer/extending/apps/extending-dashboard-with-apps
       */
      extensions: [
        {
          label: "Show Abandoned Checkouts",
          mount: "NAVIGATION_ORDERS",
          target: "APP_PAGE",
          permissions: ["MANAGE_CHECKOUTS", "MANAGE_USERS"],
          url: "/checkout",
        },
      ],
    };

    return manifest;
  },
});
