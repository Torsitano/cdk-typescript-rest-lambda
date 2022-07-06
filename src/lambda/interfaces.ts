
export interface HttpResponse {
    statusCode: number,
    body: string
}

export interface PostPayload {
    value1: string,
    value2?: number
}

export interface GetPayload {
    uuid?: string
}