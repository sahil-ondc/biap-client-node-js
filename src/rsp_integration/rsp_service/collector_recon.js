 import { addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import order from '../../order/v1/db/order.js';
import OnConfirmData from "../../order/v1/db/onConfirmDump.js"
import {rsp_constants} from "../../utils/rspConstant.js"
// import collectorSchema from "../../rsp_integration/rsp_schema/collector_recon.js"
import schemaValidator from "../../shared/schemaValidator.js"

// import { logger } from "../../shared/logger";
// const uuid = uuidv4();


export const initiateRsp = async ()=> {
  console.log("orderDetails123")

    try {
      const date = new Date().toISOString()
      let orderDetails = await order.find({
        $and: [
          {state: "Completed"},
          { "payment.status": "PAID" },

          // collector_recon_sent: false,
        // { updatedAt: { not: null }},
        ],
      })
      console.log('orderDetails>>>>', orderDetails)
      orderDetails = orderDetails.filter((el) => {
        const returnTime = el.items[0].product["@ondc/org/return_window"];    
        const currentTime = moment();
        
        const endDate = moment(el.updatedAt).add(moment.duration(returnTime));
    
        const timeLeft = moment.duration(endDate.diff(currentTime));
        
        // Check if the return window has closed
        if (timeLeft.asMilliseconds() <= 0) {
          console.log("return window closed")
          return el
        } else {
          console.log("Time left until return window closes for order:", el, timeLeft.humanize());
        }
      });
      const groupedData = groupedByBapId(orderDetails)
      console.log("groupedByBapId", groupedData)
      const arrayOfArrays = Object.values(groupedData)
      console.info(`initiateRsp arrayOfArrays: ${arrayOfArrays?.length}`)
    await Promise.all(
         arrayOfArrays.map(async (el) => {
         const request_body = {}
           const baseUrl = "collector_recon"
          request_body.context = {
            domain: rsp_constants.DOMAIN,
            country: rsp_constants.COUNTRY,
            city: rsp_constants.CITY,
            action: baseUrl,
            core_version: rsp_constants.CORE_VERSION,
            bap_id: process.env.RSP_ID,
            bap_uri: process.env.RSP_URI,
            bpp_id: el[0]?.bppId,
            bpp_uri: el[0]?.bpp_uri,
            transaction_id: uuidv4(),
            message_id: uuidv4(),
            timestamp: date,
            ttl: "P3D",
          }
           console.log(`initiateRsp el : ${el?.length}, el[0]?.bpp_id: ${el[0]?.bppId}`)
          request_body.message = {}
          request_body.message.orderbook = {}
          request_body.message.orderbook.orders = await Promise.all(
            el.map(async (detail) => {
              console.log(`initiateRsp detail: ${JSON.stringify(detail)}`)
              const transactionId = detail.transactionId
              const on_confirm = await OnConfirmData.findOne({
                where: {
                  transactionId,
                  action: "on_confirm",
                },
              })

              console.log("order>>>>", on_confirm)
              // console.log("order>>>>", JSON.stringify(orderData._id))
              const seller = await OnConfirmData.findOne({
                where: {
                  bpp_uri: on_confirm.context.bpp_uri,
                  bpp_id: on_confirm.context.bpp_id,
                },
              })
              console.log("seller>>>>", seller)

              const paymentObj = JSON.parse(on_confirm.message.order.payment)
              console.log("paymentObj>>>>", paymentObj)
          // let bap_id = seller.logistics_bap_id
          // let bap_uri = seller.logistics_bap_uri

            let bap_id = seller.context.bap_id
          let bap_uri = seller.context.bap_uri
          // if (paymentObj.status === "PAID") {
          //   bap_id = on_confirm.payload.context.bap_id
          //   bap_uri = on_confirm.payload.context.bap_uri
          // }
          //    console.log("el88>",on_confirm.payload.context?.bap_id)
               const response = {
                  id: orderDetails[0]._id,
                 invoice_no: uuidv4(),
                 collector_app_id: bap_id,
                 receiver_app_id: on_confirm.context?.bap_id,
                 receiver_app_uri: on_confirm.context?.bap_uri, // seller.bpp_uri, // confirm BAP
                 state: on_confirm.message.order.state,
                provider: {
                  name: {
                    name: seller.message.order.fulfillments[0]["@ondc/org/provider_name"], // NIL
                    code: seller.message.order.fulfillments[0].state.descriptor.code, // NIL
                  },
                  address: seller.message.order.fulfillments[0].start.location,
                },
                payment: {
                  uri: orderDetails[0].payment.uri, // NIL], 
                  // tl_method: paymentObj.tl_method, // NIL
                  params: {
                    transaction_id: paymentObj.params.transaction_id, // NIL
                    transaction_status: paymentObj.status, // NIL
                    amount: paymentObj.params.amount,
                    currency: paymentObj.params.currency,
                  },
                  type: paymentObj.type,
                  status: paymentObj.status,
                  collected_by: paymentObj.collected_by,
                  "@ondc/org/collected_by_status": "Assert",
                  "@ondc/org/buyer_app_finder_fee_type": paymentObj["@ondc/org/buyer_app_finder_fee_type"],
                  "@ondc/org/buyer_app_finder_fee_amount": paymentObj["@ondc/org/buyer_app_finder_fee_amount"],
                  "@ondc/org/withholding_amount": paymentObj["@ondc/org/withholding_amount"], // NIL
                  "@ondc/org/withholding_amount_status": "Assert",
                  "@ondc/org/return_window": "P6D",
                  "@ondc/org/return_window_status": "Assert",
                  "@ondc/org/settlement_basis": paymentObj["@ondc/org/settlement_basis"], // NIL
                  "@ondc/org/settlement_basis_status": "Assert",
                  "@ondc/org/settlement_window": paymentObj["@ondc/org/settlement_window"], // NIL
                  "@ondc/org/settlement_window_status": "Assert",
                  "@ondc/org/settlement_details": [
                    {
                      settlement_counterparty: paymentObj["@ondc/org/settlement_details"][0].settlement_counterparty,
                      settlement_phase: paymentObj["@ondc/org/settlement_details"][0].settlement_phase,
                      settlement_amount: Number(paymentObj.params.amount),
                      settlement_type: paymentObj["@ondc/org/settlement_details"][0].settlement_type,
                      settlement_bank_account_no:
                        paymentObj["@ondc/org/settlement_details"][0].settlement_bank_account_no,
                      settlement_ifsc_code: paymentObj["@ondc/org/settlement_details"][0].settlement_ifsc_code,
                      upi_address: paymentObj["@ondc/org/settlement_details"][0].upi_address, // NIL
                      bank_name: paymentObj["@ondc/org/settlement_details"][0].bank_name,
                      branch_name: paymentObj["@ondc/org/settlement_details"][0].branch_name,
                      beneficiary_name: paymentObj["@ondc/org/settlement_details"][0].beneficiary_name,
                      beneficiary_address: seller?.bppproviders_locations_address_city,
                      settlement_status: "NOT-PAID",
                      settlement_reference: uuidv4(),
                      settlement_timestamp: date,
                    },
                  ],
                 },
                withholding_tax_gst: {
                  currency: "INR",
                  value:
                    on_confirm.message.order.quote.breakup.find((obj) => {
                      return obj["title"] == "Tax"
                    })?.price?.value || "0",
                },
                withholding_tax_tds: {
                  currency: "INR",
                  value: "0",
                },
                deduction_by_collector: {
                  currency: "INR",
                  value: paymentObj["@ondc/org/buyer_app_finder_fee_amount"],
                },
                payerdetails: {
                  payer_name: paymentObj["@ondc/org/settlement_details"][0].beneficiary_name,
                  payer_address: seller.message.order.fulfillments[0].start.location,
                  payer_account_no: paymentObj["@ondc/org/settlement_details"][0].settlement_bank_account_no,
                  payer_bank_code: paymentObj["@ondc/org/settlement_details"][0].settlement_ifsc_code,
                  payer_virtual_payment_address:  "N/A", // NIL
                },
              //   settlement_reason_code: "01",
                created_at: date,
                updated_at: date,
               }
              console.log("response182>>>>",response)
              return response
            }),
          )
          const rsp_uri = process.env.RSP_URI
          const validateResult = validateRSPActionSchema(request_body, request_body.context.domain, baseUrl)
   
          if (!_.isEmpty(validateResult)) {
            console.log.error(`initiateRsp on_receiver_recon validation error: ${JSON.stringify(validateResult)}`)
            return { success: false }
          }
   
          console.log.error(`initiateRsp request_body - collector_recon : ${JSON.stringify(request_body)}`)
          const httpRequest = new HttpRequest(rsp_uri, baseUrl, "POST", request_body)
          await httpRequest.send()
   
          const orderIds = on_confirm.message.order.ID
          console.log("orderIds>>>>>>>",orderIds)
          await changeStatus(orderIds)
          return { success: true }
      }),
      )
    } catch (error) {
      console.error(`initiateRsp error.rsp: Cron : ${error.message}`)
      return error
    }
  }

  function groupedByBapId(orderDetails) {
    // Assuming orderDetails is an array of order objects with a property named 'bapId'
    const groupedData = {};
    for (const order of orderDetails) {
      const bppId = order.bppId; // Assuming the property name is 'bapId'

      if (!groupedData[bppId]) {
        groupedData[bppId] = [];
      }
      groupedData[bppId].push(order);
   }
    return groupedData;
  }


export const validateRSPActionSchema = (data, domain, action) => {
  const errorObj = {}

  switch (domain) {
    case "ONDC:NTS10": {
      const schemaError = validateSchema("NTS10", action, data)
      if (schemaError !== "error") Object.assign(errorObj, schemaError)
      return isObjectEmpty(errorObj) ? false : errorObj
    }

    default:
      return "Invalid Domain!! Please Enter a valid rsp domain"
  }
}
export const isObjectEmpty = (obj) => {
  return Object.keys(obj).length === 0
}
export const validateSchema = (domain, api, data) => {
  // logger.info(`Inside Schema Validation for domain: ${domain}, api: ${api}`)
  console.log(`Inside Schema Validation for domain: ${domain}, api: ${api}`)
  const errObj = {}
  const schmaVldtr = validate_schema_for_retail_json(domain, api, data)

  const datavld = schmaVldtr
  if (datavld.status === "fail") {
    const res = datavld.errors
    let i = 0
    const len = res.length
    while (i < len) {
      const key = `schemaErr${i}`
      errObj[key] = `${res[i].details} ${res[i].message}`
      i++
    }
  console.log(`Schema Validation`, errObj)
    // logger.error(`Schema Validation`, errObj)
    return errObj
  } else return "error"
}



const validate_schema_for_retail_json = (vertical, api, data) => {
  console.log("validate_schema_for_retail_json>>>>", vertical, api, data)
  console.log("validate_schema_for_retail_json>>>>22", (schemaValidator)[`validate_schema_${api}_${vertical}_for_json`])
  console.log("validate_schema_collector_recon_NTS10_for_json>>>>", data)

  const res = (schemaValidator)[`validate_schema_${api}_${vertical}_for_json`](data)
  console.log("schemaValidator>>>>>>>>>>>>>", res)
  return res
}




