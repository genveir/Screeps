import { Task } from './task';
import { BaseTask } from './baseTask';
import { PositionUtil } from '../util/position';

export class Repair extends BaseTask implements Task {
    public static readonly type : string = "REPAIR";

    constructor(id : string, claimedBy : Id<Creep> | null, public structure : Id<Structure>) {
        super(id, Repair.type, claimedBy);
    }

    private getStructure() : Structure | null {
        var structure = Game.getObjectById(this.structure);
        if (!this.structure) {
            console.log("structure no longer exists");
            this.unclaim();
            this.clearOnNextTick = true;
        }

        return structure;
    }

    public getPriority(creep : Creep) {
        var structure = this.getStructure();
        if (!structure) return 0;
        else {
            return 105000 - PositionUtil.getFlyDistance(structure.pos, creep.pos);;
        }
    }

    public canPerform(creep : Creep)
    {
        var structure = this.getStructure();
        if (!structure) return false;
        return creep.store.energy > 0 && structure.hits < structure.hitsMax;
    }

    public execute(creep : Creep) {
        var structure = this.getStructure();
        if (structure)
        {
            if (PositionUtil.getFlyDistance(creep.pos, structure.pos) > 3)
            {
                if (this.moveAwayFromSources(creep)) return;
                else creep.moveTo(structure, {reusePath: 20});
            }

            if (structure.hits >= structure.hitsMax) this.clearOnNextTick = true;
            else {
                var result = creep.repair(structure);
                if (result === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure, {reusePath: 20});
                }
                else if (result === ERR_NOT_ENOUGH_RESOURCES) {}
                else if (result === 0) {}
                else {console.log("repair failed with code " + result); }
            }
        }   
        if (!this.canPerform(creep)) this.unclaim();
    }

    public serialize() : string {
        return JSON.stringify(this);
    }
}