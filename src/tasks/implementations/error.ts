import { Task } from '../task';
import { BaseTask } from '../baseTask';

export class ErrorTask extends BaseTask implements Task {
    public static type : string = "ERROR";

    public constructor(id : string, claimedBy : Id<Creep> | null, private message : string) {
        super(id, ErrorTask.type, claimedBy);

        this.clearOnNextTick = true;
        //console.log("invalid task: " + message)
    }

    public getPriority(creep : Creep) {
        return -1000000;
    }

    public getSuitability(creep: Creep) {
        return -1000000;
    }

    public execute(creep : Creep) {
        console.log("executing invalid task: " + JSON.stringify(this.message))
        console.log("creep: " + JSON.stringify(creep));

        creep.memory.savedTask.active = false;
        this.unclaim();
    }

    public serialize() : string {
        return JSON.stringify(this);
    }
}