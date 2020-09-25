import { Task } from './task';

export class Harvest implements Task {
    public static SERIALIZED : string = "HARVEST";

    public serialize() : string {
        return Harvest.SERIALIZED;
    }
}