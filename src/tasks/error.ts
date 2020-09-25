import { Task } from './task';

export class ErrorTask implements Task {
    public static type : string = "ERROR";

    public type: string;
    public claimedBy : Id<Creep> | null;

    public constructor(private message : string) {
        this.type = ErrorTask.type;

        console.log("invalid task: " + message)
    }

    public canPerform(creep : Creep) {
        return false;
    }

    public claim(creep : Creep) {
        this.claimedBy = creep.id;
    }

    public unclaim() {
        this.claimedBy = null;
    }

    public serialize() : string {
        return JSON.stringify(this);
    }

    public report() : string {
        return "Error: " + this.message;
    }
}