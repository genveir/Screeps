import { Task } from '../task';
import { BaseTask } from '../baseTask';

export class Upgrade extends BaseTask implements Task {
    public static readonly type : string = "UPGRADE";

    constructor(id : string, claimedBy : Id<Creep> | null, private controller : Id<StructureController>) {
        super(id, Upgrade.type, claimedBy);
    }

    private getController() : StructureController | null {
        var controller = Game.getObjectById(this.controller);
        if (!controller) {
            console.log("somehow this creep is not in a room with a controller");
            this.unclaim();
        }

        return controller;
    }

    protected _getPriority(creep : Creep) {
        var controller = this.getController();
        if (!controller) return 0;
        
        if (controller.ticksToDowngrade < 1000) return 1000000; // don't let the controller downgrade.
        return 1; // otherwise minimal, this is the job to do if there's no other job.
    }

    protected _getSuitability(creep : Creep) {
        if (creep.store.energy > 0) return 100000;
        return 0;
    }

    public execute(creep : Creep) {
        var controller = this.getController();
        if (controller)
        {
            var result = creep.upgradeController(controller);
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, {reusePath: 20});
            }
        }   
        if (this.getSuitability(creep) <= 0) this.unclaim();
    }

    public serialize() : string {
        return JSON.stringify(this);
    }
}