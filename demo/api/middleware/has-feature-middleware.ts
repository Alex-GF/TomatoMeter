import { Client, OpenFeature } from "@openfeature/server-sdk";

export function hasFeatureMiddleware(featureName){
    return async (req, res, next) => {
        
        const client: Client = OpenFeature.getClient();
        
        if (client){
            const result = await client.getBooleanValue(featureName, false);

            if (result){
                next();
            }else{
                res.status(403).send({error: 'You cannot access this feature with your current subscription.'});
            }
        }else{
            res.status(500).send({error: "OpenFeature client not initialized"});
        }
    }
}