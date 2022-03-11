# Repo to reproduce the issue when using Lambda Authorizers in AppSync with CDK.

Steps to reproduce:
1. npm run build
2. cdk deploy --profile [YOUR_PROFILE]
3. Make a POST to the GraphQL endpoint using Bearer Token type of auth. 
   1. Using "validtoken" as the token, the API should authorize the request
   2. 2. As the payload of the request, use the following json
    ```javascript
    {
        "query": "query MyQuery ($yourName: String) { sayHello (yourName: $yourName) { value } }",
        "operationName": "MyQuery",
        "variables": { "yourName": "CDK Team" }
    }
    ```
4. The issue is that AppSync returns 
```javascript
{
    "errors": [
        {
            "errorType": "BadRequestException"
        }
    ]
}
```
