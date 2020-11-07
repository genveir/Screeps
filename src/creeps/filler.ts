import { CreepLogic } from './creepLogic';
import { MovementUtil } from "../utils/movementUtil";

export class Filler {
    constructor(private creep : Creep) {

    }

    public runFiller() {
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            var spawn = this.creep.room.find(FIND_MY_SPAWNS)[0];
            var transferResult = this.creep.transfer(spawn, RESOURCE_ENERGY);
            if (transferResult == ERR_NOT_IN_RANGE) {
                MovementUtil.moveTo(this.creep, spawn.pos);
            }
            else if (transferResult == ERR_FULL) {
                new CreepLogic(this.creep).retask();
            }
        }
        else {
            new CreepLogic(this.creep).retask();
        }
    }
}