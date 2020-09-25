import { Task } from './task';

export class ErrorTask implements Task {
    public static SERIALIZED : string = "ERROR";

    public serialize() : string {
        return ErrorTask.SERIALIZED;
    }
}