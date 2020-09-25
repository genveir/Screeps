import { Task } from './task';
import { BaseTask } from './baseTask';

export class Upgrade extends BaseTask implements Task {
    public static readonly type : string = "UPGRADE";

    constructor(claimedBy : Id<Creep> | null) {
        super(Upgrade.type, claimedBy);
    }

    public getPriority() {
        return 1; // minimal, this is the job to do if there's no other job.
    }

    public canPerform(creep : Creep)
    {
        return creep.store.energy > 0;
    }

    public execute(creep : Creep) {
        var controller = creep.room.controller;
        if (!controller) {
            console.log("somehow this creep is not in a room with a controller");
            this.unclaim();
        }
        else
        {
            var result = creep.upgradeController(controller);
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
            }
        }   
        if (!this.canPerform(creep)) this.unclaim();
    }

    public serialize() : string {
        return JSON.stringify(this);
    }

    public report() : string {
        return "This is a working Upgrade task";
    }
}