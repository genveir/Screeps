import { Task } from './task';

export class Upgrade implements Task {
    public static readonly SERIALIZED : string = "UPGRADE";

    public serialize() : string {
        return Upgrade.SERIALIZED;
    }
}