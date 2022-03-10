type AuthAppSyncEvent = {
    "authorizationToken": string,
    "requestContext": {
        "apiId": string,
        "accountId": string,
        "requestId": string,
        "queryString": string,
        "operationName": string,
        "variables": {}
    }
}

exports.handler = async (event: AuthAppSyncEvent) => {
    console.log(`event >`, JSON.stringify(event, null, 2))

    const { authorizationToken } = event
    if (authorizationToken == 'validtoken')
        return {
            isAuthorized: true,
            resolverContext: {
                userid: 'test-user-id',
                info: 'contextual information A',
                more_info: 'contextual information B',
            },
            // deniedFields: [
            //     `arn:aws:appsync:${process.env.AWS_REGION}:${accountId}:apis/${apiId}/types/Event/fields/comments`,
            //     `Mutation.createEvent`,
            // ],
            // ttlOverride: 10,
        }

    return { isAuthorized: false }
}