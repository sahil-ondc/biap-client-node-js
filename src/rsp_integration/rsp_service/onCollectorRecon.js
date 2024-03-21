import OnConfirmData from "../../order/v1/db/onConfirmDump.js" 
export const onCollectorRecon = async (req)=> {
  try {
    await Promise.all(
      req.message.orderbook.orders.map(async (order) => {
        await OnConfirmData.update({
          where: {
            buyer_order_id: order.id,
          },
          data: {
            on_collector_recon_received: true,
            updated_at: new Date(),
          },
        })
      }),
    )
  } catch (e) {
    console.log(e.message)
  }
}
