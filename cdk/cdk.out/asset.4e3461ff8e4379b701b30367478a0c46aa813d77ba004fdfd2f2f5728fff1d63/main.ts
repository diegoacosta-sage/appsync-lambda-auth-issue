type AppSyncEvent = {
    info: {
        fieldName: string
    }
}

exports.handler = async (event: AppSyncEvent) => {
    console.log('SayHelloLambda event', event);
    switch (event.info.fieldName) {
        case "sayHello":
            return "Hello World!";
        default:
            return null;
    }
}