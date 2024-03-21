import {Router} from 'express';
import { authentication } from '../../middlewares/index.js';

import onCollectorRecon from "../rsp_service/on_collector_recon.js"
export const rootRouter = new Router();

// const recieivereconController= new RecieiverReconController()


    //#region confirm order

// confirm order v1
rootRouter.post(
    '/v2/recon_status',
);


//#endregion

export default rootRouter;
