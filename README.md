1. Clone Repo
2. `npm i`
3. `cdk deploy`
4. Get the API key and URL from the API GW
5. Postman:

`POST`
`x-api-key: <your-key>` // header

body:

```
{
    "value1": "test",
    "value2": 10
}
```

^ Make a couple entries

`GET`
`x-api-key: <your-key>` // header

With no UUID provided, you should get all results back

`GET`
`x-api-key: <your-key>` // header
`uuid: <a uuid from above>` // param

You should get 1 result back

6. ???
7. Profit

## NOTE

Note there is an `asyncGet.ts` and `get.ts`, right now the `get.ts` is in use. Both are provided as examples in case you want to use one style over the other.
