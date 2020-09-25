import { Task } from './task';
import { BaseTask } from './baseTask';

export class ErrorTask extends BaseTask implements Task {
    public static type : string = "ERROR";

    public constructor(private message : string) {
        super(ErrorTask.type, null);

        console.log("invalid task: " + message)
    }

    public getPriority() {
        return 1000000;
    }

    public canPerform(creep : Creep) {
        return false;
    }

    public execute(creep : Creep) {
        console.log("invalid task: " + this.message)

        this.unclaim();
    }

    public serialize() : string {
        return JSON.stringify(this);
    }

    public report() : string {
        return "invalid task: " + this.message;
    }
}