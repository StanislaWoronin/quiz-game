export class TokenPayload {
    readonly userId: string
    readonly deviceId: string
    readonly iat: number
    readonly exp: number

    constructor(payload) {
        this.userId = payload.userId
        this.deviceId = payload.deviceId
        this.iat = payload.iat * 1000
        this.exp = payload.exp * 1000
    }
}