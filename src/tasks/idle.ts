import { Task } from './task';
import { BaseTask } from './baseTask';

export class Idle extends BaseTask implements Task {
    public static type : string = "IDLE";

    public constructor(id : string, claimedBy : Id<Creep> | null) {
        super(id, Idle.type, claimedBy);
    }

    public getPriority() {
        return 1000000;
    }

    public canPerform(creep : Creep) {
        return true;
    }

    public execute(creep : Creep) {
        this.unclaim();
    }

    public serialize() : string {
        return JSON.stringify(this);
    }

    public report() : string {
        return "creep is just chilling";
    }
}