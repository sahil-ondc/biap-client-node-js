import { onCollectorRecon } from"../rsp_service/onCollectorRecon.js"

export const onCollectorReconController = {
  onCollectorRecon: async (req) => {
    console.log(`Called - onCollectorResponse: ${JSON.stringify(req.body)}`)
    await onCollectorRecon(req.body)
    console.log("7>>>>>>>>>>")
    return "ACK"
  },
}

