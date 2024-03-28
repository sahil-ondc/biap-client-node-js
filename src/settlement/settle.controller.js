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
         const completedOrders = await OrderModel.find({})
             .limit(limitValue)
             .skip(skip);
 
        
        const confirmedOrders = await ConfirmModel.find({});

        let count = skip; // Initialize count with skip value
        let sumCompletedOrderAmount = 0;
        let sumPendingOrderAmount = 0;
        const settlementData = [];

        completedOrders.forEach(({ _id, transactionId, context, createdAt, updatedAt, state, quote, items }) => {
            count++;
            // sumCompletedOrderAmount += parseFloat(quote.price.value) || 0;
            console.log("quote>>>>>>>>>",state)
            const settlementItem = {
                id: count,
                order_id: _id,
                transaction_id: transactionId,
                buyer_order_id: _id,
                domain: context ? context.domain : "ONDC:RET18",
                bpp_uri: "https://shopify-adapter-dev.thewitslab.com/api/v2",
                bpp_id: "shopify-adapter-dev.thewitslab.com",
                bap_uri: "https://buyer-app-stage.thewitslab.com",
                bap_id: "buyer-app-stage.thewitslab.com",
                settlement_id: null,
                settlement_reference_no: null,
                order_recon_status: null,
                counterparty_recon_status: null,
                counterparty_diff_amount_value: null,
                counterparty_diff_amount_currency: null,
                receiver_settlement_message: null,
                receiver_settlement_message_code: null,
                created_at: createdAt,
                order_status: state || "Accepted",
                updated_at: updatedAt,
                collector_recon_sent: false,
                on_collector_recon_received: false,
                // order_amount: quote["price"]["value"],
                order_amount: 529,

                items: items.map(({ id, title, price, quantity }) => ({
                    sku: "862",
                    name: "nhkjd",
                    price: 56,
                    title: "Good day",
                    vendor: 'Vendor',
                    item_id: 'Item ID',
                    quantity: 7,
                    product_id: 'Product ID',
                    variant_id: 'Variant ID',
                    return_window: '@ondc/org/return_window',
                    variant_title: 'Variant Title'
                })),
                return_window: '@ondc/org/return_window',
                payment_type: 'PREPAID',
                shopify_order_status: 'unfulfilled',
                replaced_with_order_id: null,
                customer_id: 'Customer ID',
                replaced_order_details: null,
                settlement_type: 'Pending'
            };

            settlementData.push(settlementItem);
        });

        confirmedOrders.forEach(order => {
            // sumPendingOrderAmount += parseFloat(order.quote.price.value) || 0;
            const settlementItem = {
                id: ++count,
                order_id: order.id,
                transaction_id: order.transaction_id,
                buyer_order_id: order.id,
                settlement_id: null,
                settlement_reference_no: null,
                order_recon_status: null,
                recon_status: null,
                counterparty_recon_status: null,
                counterparty_diff_amount_value: null,
                counterparty_diff_amount_currency: null,
                receiver_settlement_message: null,
                receiver_settlement_message_code: null,
                created_at: order.createdAt,
                order_status: order.state,
                updated_at: order.updatedAt,
                collector_recon_sent: false,
                on_collector_recon_received: false,
                // order_amount: parseFloat(order.quote.price.value) || 0,
                order_amount: 529,

                items: [], // No items for confirmed orders
                return_window: '@ondc/org/return_window',
                payment_type: 'PREPAID',
                shopify_order_status: 'unfulfilled',
                replaced_with_order_id: null,
                customer_id: 'Customer ID',
                replaced_order_details: null,
                settlement_type: 'Pending'
            };
            settlementData.push(settlementItem);
        });

        res.send({
            success: true,
            data: settlementData,
            count: count,
            // sumCompletedOrderAmount: sumCompletedOrderAmount.toFixed(2),
            // sumPendingOrderAmount: sumPendingOrderAmount.toFixed(2),
            sumCompletedOrderAmount:5536,
            sumPendingOrderAmount: 526,
            // order:completedOrders
        });
    } catch (error) {
        console.error("Error fetching settlements:", error);
        res.status(500).send("Error fetching settlements");
    }
}
