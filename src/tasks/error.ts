import { Task } from './task';
import { BaseTask } from './baseTask';

export class ErrorTask extends BaseTask implements Task {
    public static type : string = "ERROR";

    public constructor(id : string, claimedBy : Id<Creep> | null, private message : string) {
        super(id, ErrorTask.type, claimedBy);

        //console.log("invalid task: " + message)
    }

    public getPriority() {
        return 1000000;
    }

    public canPerform(creep : Creep) {
        return false;
    }

    public execute(creep : Creep) {
        //console.log("invalid task: " + this.message)

        console.log("executing error task, unclaiming");
        delete creep.memory.savedTask;
        this.unclaim();
    }

    public serialize() : string {
        return JSON.stringify(this);
    }

    public report() : string {
        return "invalid task: " + this.message;
    }
}