import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";

@Schema({_id: false, versionKey: false })
export class MongoSecurity {
    @Prop()
    userId: string;

    @Prop()
    deviceId: string;

    @Prop()
    deviceTitle: string;

    @Prop()
    ipAddress: string;

    @Prop()
    iat: string;

    @Prop()
    exp: string;
}

export const SecuritySchema = SchemaFactory.createForClass(MongoSecurity);

export type SecurityDocument = HydratedDocument<MongoSecurity>;