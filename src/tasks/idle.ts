import { Task } from './task';
import { BaseTask } from './baseTask';

export class Idle extends BaseTask implements Task {
    public static type : string = "IDLE";

    public constructor(id : string, claimedBy : Id<Creep> | null) {
        super(id, Idle.type, claimedBy);

        this.clearOnNextTick = true;
    }

    public getPriority(creep : Creep) {
        return -1000000;
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
}