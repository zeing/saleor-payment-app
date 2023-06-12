import axios from "axios";
import * as jose from "jose";

const REDIRECT_ENDPOINT = process.env.PAYMENT_2C2P_URL;
const SECRET_KEY = process.env.PAYMENT_2C2P_SECRET_KEY;
export const MERCHANT_ID = process.env.PAYMENT_2C2P_MERCHANT_ID;

interface PaymentTokenRequestParameters extends jose.JWTPayload, PaymentTokenRequest {}
interface PaymentTokenResponseParameters extends jose.JWTPayload, PaymentTokenResponse {}

export async function initPaymentToken(data: PaymentTokenRequest) {
  let endpoint = REDIRECT_ENDPOINT + "/payment/4.1/paymentToken";

  const token = await new jose.SignJWT(data as PaymentTokenRequestParameters)
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode(SECRET_KEY));
  let payload = { payload: token };

  let resp = await axios.post(endpoint, payload);
  let decodedResponse = jose.decodeJwt(resp.data.payload) as PaymentTokenResponseParameters;

  return { success: true, response: decodedResponse };
}

interface PaymentInquiryRequestParameters extends jose.JWTPayload, PaymentInquiryRequest {}
interface PaymentInquiryResponseParameters extends jose.JWTPayload, PaymentInquiryResponse {}

export async function getPaymentInquiry(data: PaymentInquiryRequest) {
  let endpoint = REDIRECT_ENDPOINT + "/payment/4.1/paymentInquiry";

  const token = await new jose.SignJWT(data as PaymentInquiryRequestParameters)
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode(SECRET_KEY));
  let payload = { payload: token };

  let resp = await axios.post(endpoint, payload);
  let decodedResponse = jose.decodeJwt(resp.data.payload) as PaymentInquiryResponseParameters;

  return { success: true, response: decodedResponse };
}
