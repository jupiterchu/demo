import { createClient } from "@supabase/supabase-js";

import crypto from "crypto";
import * as Serialize from "php-serialize";

// do not cache this page
export const revalidate = 0;

const PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAmnP8LgVI6eyrWxqCHUbq
yu/LiRIOTYRyoiCJeGqurQmHCGEbnxhTDrfZPFjqVzAFlBjFzhwomDnZg04Lyx0X
7A8v1cjZAai4ZZvNSN5d7SzskYMUfu5/e5o4ulJOxlIkdO82La05L2ZGdJZrtncL
i3q/3AJrZXJr9gg3cuEb1/iVIE6mkLj5Tnh4tLP9ZXTwrg7qJGSVuRR5KASL0fGT
E8veQ0wf5RDGU1ckTXAUOHipnSqP7CMYFf+26Cav2qZ4pneL/QzMYgJLha5AO1d1
grWJsG2fAY0kF7kUa+RI7f50X2xsAyJc34hYWaNYIo4E98asDRDvDW67UsESqvx9
iiVgFKKGsiB7LIMcZCxIX4XkvE4NCs/6ZYCMexuOlpVCWqhx93pU9fNKn3r1dS4W
BXbW5z/2OHUHRoeWVkG30UA26heeOnm5WfXotL10gtBckmevovDb/Ob/XXsp6jqD
Iqd3nfGQHfnAXVHZvKrdiOOtsnVNl5rEdllxndsf0jv0vWhumjOFsEBjvFdxzliZ
PDmVC96mtSYySrEim4xNRmbp/yw/CFadPpn6j2qR3DDDVpFb6Oy8sb0sHBscxdal
a4ipWVWXILMPNEtkq0aS+EVBr+pGCAcwBnDKOCt2GvVdg9ejv3iJ7vnoiouqV0/J
hMtAl1dBmbhYROJHmow76rECAwEAAQ==
-----END PUBLIC KEY-----
`;
 

function verifyWebhook(publicKey, webhookData) {
  // extract the signatue from the remainder of the payload
  // the signature actually signs the remainder
  const { p_signature: signature, ...otherProps } = webhookData || {};

  // sort by key (asciibetical)
  // also be sure to convert any numbers into strings
  const sorted = {};
  for (const k of Object.keys(otherProps).sort()) {
    const v = otherProps[k];
    sorted[k] = v == null ? null : v.toString();
  }

  // PHP-style serialization to utf8 format string
  const serialized = Serialize.serialize(sorted);

  // initialise a Verify instance
  const verifier = crypto.createVerify("sha1");
  verifier.update(serialized);
  verifier.end();

  // verify but don't propagate exceptions,. Any errors (such as a malformed
  // public key) are considered false for our purposes. We are not interested
  // in reporting 'why' the validation failed.
  try {
    return verifier.verify(publicKey, signature, "base64");
  } catch (err) {
    console.log("verfiy error: ", err, webhookData, publicKey);
    return false;
  }
}

export async function POST(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const body = await req.formData();
  // console.log(body)
  // console.log(body.get('p_signature'))
  const webhookData = {};

  for (const [key, value] of body.entries()) {
    webhookData[key] = value;
  }

  // console.log("webhookData: ", webhookData);
  // console.log('PUBLIC_KEY: ', PUBLIC_KEY)
  const public_key = PUBLIC_KEY.replace(/\\n/g, "\n");
  if (verifyWebhook(public_key, webhookData)) {
    console.log(webhookData.alert_name);
    const passthrough = JSON.parse(webhookData.passthrough);
    try {
      if (webhookData.alert_name === "subscription_created") {
        let { data: user_data, error } = await supabase
          .from("user_payment_data")
          .select("user_id")
          .match({ user_id: passthrough.user_id });

        if (Object.keys(user_data).length === 0) {
            let { data: user_data, error } = await supabase.from("user_payment_data").insert({
            subscription_id: webhookData.subscription_id,
            subscription_status: webhookData.status,
            subscription_plan_id: webhookData.subscription_plan_id,
            subscription_end_date: webhookData.next_bill_date,
            subscription_update_url: webhookData.update_url,
            subscription_cancel_url: webhookData.cancel_url,
            user_id: passthrough.user_id,
          });
          console.log('h')
        } else {
          await supabase
            .from("user_payment_data")
            .update({
              subscription_id: webhookData.subscription_id,
              subscription_status: webhookData.status,
              subscription_plan_id: webhookData.subscription_plan_id,
              subscription_end_date: webhookData.next_bill_date,
              subscription_update_url: webhookData.update_url,
              subscription_cancel_url: webhookData.cancel_url,
            })
            .match({ user_id: passthrough.user_id });
        }
      } else if (webhookData.alert_name === "subscription_updated") {
        await supabase
          .from("user_payment_data")
          .update({
            subscription_status: webhookData.status,
            subscription_plan_id: webhookData.subscription_plan_id,
            subscription_end_date: webhookData.next_bill_date,
            subscription_update_url: webhookData.update_url,
            subscription_cancel_url: webhookData.cancel_url,
          })
          .match({ user_id: passthrough.user_id });
      } else if (webhookData.alert_name === "subscription_cancelled") {
        await supabase
          .from("user_payment_data")
          .update({
            subscription_status: webhookData.status,
            subscription_end_date: webhookData.cancellation_effective_date,
          })
          .match({ user_id: passthrough.user_id });
      } else if (webhookData.alert_name === "subscription_payment_succeeded") {
       
        await supabase
          .from("user_payment_data")
          .update({
            subscription_id: webhookData.subscription_id,
            subscription_status: webhookData.status,
            subscription_plan_id: webhookData.subscription_plan_id,
            subscription_end_date: webhookData.next_bill_date,
          })
          .match({ user_id: passthrough.user_id });

        // store an entry into our payment history
        await supabase.from("payment_history").insert({
          status: "success",
          user_id: passthrough.user_id,
          subscription_id: webhookData.subscription_id,
          subscription_payment_id: webhookData.subscription_payment_id,
          subscription_plan_id: webhookData.subscription_plan_id,
          currency: webhookData.currency,
          amount: webhookData.sale_gross,
          amount_tax: webhookData.payment_tax,
          paddle_fee: webhookData.fee,
          payment_method: webhookData.payment_method,
          receipt_url: webhookData.receipt_url,
          customer_name: webhookData.customer_name,
          user_country: webhookData.country,
        });
      } else if (webhookData.alert_name === "subscription_payment_failed") {
        if (webhookData.next_retry_date) {
          // the user still has access until all payment retries have failed
          await supabase
            .from("user_payment_data")
            .update({
              subscription_end_date: webhookData.next_retry_date,
            })
            .match({ user_id: passthrough.user_id });
        }
        await supabase.from("payment_history").insert({
          status: "error",
          user_id: passthrough.user_id,
          subscription_id: webhookData.subscription_id,
          subscription_payment_id: webhookData.subscription_payment_id,
          subscription_plan_id: webhookData.subscription_plan_id,
          currency: webhookData.currency,
          amount: webhookData.amount,
          attempt_number: webhookData.attempt_number,
          next_retry_date: webhookData.next_retry_date,
        });
      } else if (webhookData.alert_name === "subscription_payment_refunded") {
        await supabase.from("payment_history").insert({
          status: "refund",
          user_id: passthrough.user_id,
          subscription_id: webhookData.subscription_id,
          subscription_payment_id: webhookData.subscription_payment_id,
          subscription_plan_id: webhookData.subscription_plan_id,
          currency: webhookData.currency,
          amount: webhookData.gross_refund,
          amount_tax: webhookData.tax_refund,
          paddle_fee: webhookData.fee_refund,
          refund_reason: webhookData.refund_reason,
          refund_type: webhookData.refund_type,
        });
      }

      return new Response(
        JSON.stringify({
          status: 200,
          success: true,
        })
      );
    } catch (error) {
      console.error("Error processing paddle request:", error, webhookData);
      return new Response(
        JSON.stringify({
          status: 500,
          msg: "Internal server error",
        })
      );
    }
  } else {
    console.error("webhook verify fail: ", webhookData);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: "webhook verify fail",
      })
    );
  }
}
