import OrderModel from "../order/v1/db/order.js";
import ConfirmModel from "../order/v1/db/onConfirmDump.js";

export async function getSettlementsHandler(req, res) {
    try {
        const apiKey = req.headers['wil-api-key'];

        if (apiKey!==process.env.WIL_API_KEY) {
            res.status(401).send('Missing or wrong wil-api-key header');
            return;
        }
        const { limit, page, bppId } = req.query;
         // Parse limit and page to integers
         const limitValue = parseInt(limit);
         const pageValue = parseInt(page);
 
         // Calculate skip value based on page number and limit
         const skip = (pageValue - 1) * limitValue;
 
         // Fetch completed orders with pagination
         const completedOrders = await OrderModel.find({}).sort({createdAt:-1})
             .limit(limitValue)
             .skip(skip);
 
        // console.log("completedOrders>>>>>>>>>>",JSON.stringify(completedOrders))
        const confirmedOrders = await ConfirmModel.find({}).sort({createdAt:-1});

        let count = skip; // Initialize count with skip value
        let sumCompletedOrderAmount = 0;
        let sumPendingOrderAmount = 0;
        const settlementData = [];

        completedOrders.forEach(async (order) => {
              // count++;
  
              sumCompletedOrderAmount += parseFloat(quote?.price?.value) || 0;
              // console.log("quote>>>>>>>>>",quote)
              const settlementItem = {
                  id: order?._id,
                  order_id: order?.id,
                  transaction_id: order?.transactionId,
                  buyer_order_id: order?.userId,
                  domain: order?.domain || "ONDC:RET18",
                  bpp_uri: order?.bpp_uri || "https://shopify-adapter-dev.thewitslab.com/api/v2",
                  bpp_id: order?.bppId || "shopify-adapter-dev.thewitslab.com",
                  bap_uri: order?.bap_uri || "https://buyer-app-stage.thewitslab.com",
                  bap_id: order?.bap_uri || "buyer-app-stage.thewitslab.com",
                  settlement_id: order?.settlementDetails?.["@ondc/org/settlement_details"]?.id || '',
                  settlement_reference_no: order?.settlementDetails?.["@ondc/org/settlement_details"]?.settlement_reference_no || '',
                  order_recon_status: order?.settlementDetails?.["@ondc/org/settlement_details"]?.order_recon_status || '',
                  counterparty_recon_status: order?.settlementDetails?.["@ondc/org/settlement_details"]?.counterparty_recon_status || '',
                  counterparty_diff_amount_value: order?.settlementDetails?.["@ondc/org/settlement_details"]?.counterparty_diff_amount_value || '',
                  counterparty_diff_amount_currency: order?.settlementDetails?.["@ondc/org/settlement_details"]?.counterparty_diff_amount_currency || '',
                  receiver_settlement_message: order?.settlementDetails?.["@ondc/org/settlement_details"]?.receiver_settlement_message || '',
                  receiver_settlement_message_code: order?.settlementDetails?.["@ondc/org/settlement_details"]?.receiver_settlement_message_code || '',
                  created_at: order?.createdAt, // Use order.createdAt from the order payload
                  order_status: order?.state || "Accepted", // Use order.state from the order payload
                  updated_at: order?.updatedAt, // Use order.updatedAt from the order payload
                  collector_recon_sent: order?.collector_recon_sent || false,
                  on_collector_recon_received: order?.on_collector_recon_received || false,
                  order_amount: order?.quote?.price?.value, // Use order.quote.price.value from the order payload with optional chaining
              
                  items: order.items.map((item) => ({
                      sku: item?.product?.id,
                      name: item?.product?.descriptor?.name,
                      price: item?.product?.price?.value,
                      title: item?.product?.descriptor?.name,
                      vendor: item?.product?.provider_details?.descriptor?.name,
                      item_id: item?.id,
                      quantity: item?.quantity?.count,
                      product_id: item?.product?.id,
                      variant_id: item?.variant_id || 'Variant ID',
                      return_window: item?.return_window || '@ondc/org/return_window',
                      variant_title: item?.variant_title || 'Variant Title'
                  })),
                  return_window: order?.["@ondc/org/return_window"],
                  payment_type: order?.payment?.params?.type || 'PREPAID',
                  shopify_order_status: order?.product?.fulfillment_status || 'unfulfilled',
                  replaced_with_order_id: order?.replaced_with_order_id || '',
                  customer_id: order?.replaced_with_order_id || 'Customer ID',
                  replaced_order_details: order?.replaced_order_details || '',
                  settlement_type: order?.settlement_type || 'Pending'
              };
  
              settlementData.push(settlementItem);
          });

        confirmedOrders.forEach(order => {
            sumPendingOrderAmount += parseFloat(order?.quote?.price?.value) || 0;
            const settlementItem = {
                id: order?._id,
                order_id: order.message.order.id,
    transaction_id: order.context.transaction_id,
    buyer_order_id: order.message.order.id,
    settlement_id: order?.message?.order?.payment?.["@ondc/org/settlement_details"]?.id || '',
    settlement_reference_no: order?.message?.order?.payment?.["@ondc/org/settlement_details"]?.settlement_reference_no || '',
    order_recon_status: order?.message?.order?.payment?.["@ondc/org/settlement_details"]?.order_recon_status || '',
    counterparty_recon_status: order?.message?.order?.payment?.["@ondc/org/settlement_details"]?.counterparty_recon_status || '',
    counterparty_diff_amount_value: order?.message?.order?.payment?.["@ondc/org/settlement_details"]?.counterparty_diff_amount_currency || '',
    counterparty_diff_amount_currency: order?.message?.order?.payment?.["@ondc/org/settlement_details"]?.counterparty_diff_amount_currency || '',
    receiver_settlement_message: order?.message?.order?.payment?.["@ondc/org/settlement_details"]?.receiver_settlement_message || '',
    receiver_settlement_message_code: order?.message?.order?.payment?.["@ondc/org/settlement_details"]?.receiver_settlement_message_code || '',
    created_at: order?.created_at,
    order_status: order?.message?.order?.state,
    updated_at: order?.message?.order?.updated_at,
    collector_recon_sent: order?.message?.order?.payment?.["@ondc/org/settlement_details"]?.collector_recon_sent || false,
    on_collector_recon_received: order?.message?.order?.payment?.["@ondc/org/settlement_details"]?.on_collector_recon_received || false,
    order_amount: parseFloat(order?.message?.order?.quote?.price?.value) || 0,
    // order_amount: quote?.price?.value,

    //items: [], // No items for confirmed orders

    return_window: order?.["@ondc/org/return_window"] || '',
    payment_type: order?.message?.order.payment?.type || 'PREPAID',
    shopify_order_status: order?.message?.order.payment?.status || 'unfulfilled',
    replaced_with_order_id: order?.replaced_with_order_id || '',
    customer_id: order?.replaced_with_order_id || 'Customer ID',
    replaced_order_details: order?.replaced_order_details || '',
    settlement_type: order?.message?.order?.payment?.["@ondc/org/settlement_details"]?.settlement_type || 'Pending'
            };
            settlementData.push(settlementItem);
        });

        res.send({
            success: true,
            data: settlementData,
            count: count,
            sumCompletedOrderAmount: sumCompletedOrderAmount.toFixed(2),
            sumPendingOrderAmount: sumPendingOrderAmount.toFixed(2),
            // sumCompletedOrderAmount:5536,
            // sumPendingOrderAmount: 526,
            //order:completedOrders
        });
    } catch (error) {
        console.error("Error fetching settlements:", error);
        res.status(500).send("Error fetching settlements");
    }
}
