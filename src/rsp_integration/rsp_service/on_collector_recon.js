import { PrismaClient } from "@prisma/client"
import { logger } from "../shared/logger"

export const onCollectorRecon = async (req)=> {
  try {
    await Promise.all(
      req.message.orderbook.orders.map(async (order) => {
        await prisma.orderDetails.update({
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
    logger.error(e.message)
  }
}
