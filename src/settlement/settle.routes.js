// settlementRoute.js
import express from "express"
const rootRouter = express.Router();
import {getSettlementsHandler} from "../settlement/settle.controller.js"

rootRouter.get('/settlements', getSettlementsHandler);

export default rootRouter;
