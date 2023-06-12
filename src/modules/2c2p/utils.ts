import { invariant } from "@/lib/invariant";
import {
  TransactionInitializeSessionPayloadFragment,
  TransactionProcessSessionPayloadFragment,
} from "generated/graphql";
import { MERCHANT_ID } from "./2c2p-api";

export function convertToAmount2c2p(decimalNumber: number): string {
  const decimalString = decimalNumber.toFixed(2);
  const decimalParts = decimalString.split(".");

  let integerPart = decimalParts[0];
  let decimalPart = decimalParts[1];

  while (integerPart.length < 12) {
    integerPart = "0" + integerPart;
  }

  while (decimalPart.length < 5) {
    decimalPart = decimalPart + "0";
  }

  // Decimal (12.5)
  // Example: 000000002500.90000
  return integerPart + "." + decimalPart;
}

export async function transactionInitializeSessionEventTo2C2P(
  event: TransactionInitializeSessionPayloadFragment
): Promise<PaymentTokenRequest> {
  invariant(MERCHANT_ID, "Merchant ID is invalid");

  const totalGross = event.action.amount;
  const currency = event.action.currency;
  const shopperLocale =
    event.sourceObject.__typename === "Checkout"
      ? event.sourceObject.languageCode.toString().toLowerCase()
      : event.sourceObject.languageCodeEnum.toString().toLowerCase();

  //const isFullCharge = event.action.amount === event.sourceObject.total.gross.amount;
  const checkoutId = event.sourceObject.id;
  const transactionId = event.transaction.id;
  const invoiceNo = transactionId.slice(0, 50);
  const checkoutParams = new URLSearchParams({
    checkout_id: checkoutId,
    transaction_id: transactionId,
    invoice_no: invoiceNo,
  });


  return {
    merchantID: MERCHANT_ID,
    invoiceNo: invoiceNo,
    description: "item 1",
    amount: convertToAmount2c2p(totalGross),
    currencyCode: currency,
    locale: shopperLocale,
    uiParams: {
      userInfo: {
        email: event.sourceObject.userEmail,
      },
    },
    frontendReturnUrl: `http://localhost:3001/checkout/process?${checkoutParams.toString()}`,
    backendReturnUrl: `http://localhost:3001/api/payment/process?${checkoutParams.toString()}`, //replace this with your ngrok url
    customerAddress: {
      billing: event.sourceObject.billingAddress
        ? {
            address1: event.sourceObject.billingAddress.streetAddress1,
            address2: event.sourceObject.billingAddress.streetAddress2,
            postalCode: event.sourceObject.billingAddress.postalCode,
            countryCode: event.sourceObject.billingAddress.country.code,
            city: event.sourceObject.billingAddress.city,
            state: event.sourceObject.billingAddress.countryArea,
          }
        : undefined,
      shipping: event.sourceObject.shippingAddress
        ? {
            address1: event.sourceObject.shippingAddress.streetAddress1,
            address2: event.sourceObject.shippingAddress.streetAddress2,
            postalCode: event.sourceObject.shippingAddress.postalCode,
            countryCode: event.sourceObject.shippingAddress.country.code,
            city: event.sourceObject.shippingAddress.city,
            state: event.sourceObject.shippingAddress.countryArea,
          }
        : undefined,
    },
  };
}

export async function transactionProcessSessionEventTo2C2P(
  event: TransactionProcessSessionPayloadFragment
): Promise<PaymentInquiryRequest> {
  invariant(MERCHANT_ID, "Merchant ID is invalid");

  return {
    merchantID: MERCHANT_ID,
    invoiceNo: event.data.invoiceNo,
  };
}
