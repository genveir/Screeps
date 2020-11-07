import { CreepLogic } from './creepLogic';
import { MovementUtil } from "../utils/movementUtil";

export class Filler {
    constructor(private creep : Creep) {

    }

    public runFiller() {
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            var fillable = this.creep.room.find(FIND_STRUCTURES)
                .filter(s => 
                    {
                        var anyS = <any>s;
                        if (!anyS.store) return false;
                        return anyS.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    })
                .map(s => new RangeAndStructure(this.creep.pos.getRangeTo(s.pos), s))
                .sort((a, b) => a.range - b.range);
            
            if (fillable.length > 0) {
                var toFill = fillable[0].structure;
                var transferResult = this.creep.transfer(toFill, RESOURCE_ENERGY);
                if (transferResult == ERR_NOT_IN_RANGE) {
                    MovementUtil.moveTo(this.creep, toFill.pos);
                }
                else if (transferResult == ERR_FULL) {
                    new CreepLogic(this.creep).retask();
                }
            }
            else {
                new CreepLogic(this.creep).retask();
            }
        }
        else {
            new CreepLogic(this.creep).retask();
        }
    }
}

class RangeAndStructure {
    constructor(public range : number, public structure : AnyStructure) {

    }
}