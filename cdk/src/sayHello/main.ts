type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        yourName: string
    }
}

exports.handler = async (event: AppSyncEvent) => {
    console.log('SayHelloLambda event', event);
    switch (event.info.fieldName) {
        case "sayHello":
            return `Hello ${event.arguments.yourName}!`;
        default:
            return null;
    }
}