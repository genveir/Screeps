import { MovementUtil } from './../utils/movementUtil';
export class Harvester {
    
    constructor(private creep : Creep)
    {
        
    }

    public run() {
        if (this.creep.store.getFreeCapacity() != 0) {
            var someSource = this.creep.room.find(FIND_SOURCES)[0];

            var result = this.creep.harvest(someSource);
            if (result < 0) {
                MovementUtil.moveTo(this.creep, someSource.pos);
            }
        }
        else
        {
            var spawn = this.creep.room.find(FIND_MY_SPAWNS)[0];
            var transferResult = this.creep.transfer(spawn, RESOURCE_ENERGY);
            if (transferResult == ERR_NOT_IN_RANGE) {
                MovementUtil.moveTo(this.creep, spawn.pos);
            }
            else if (transferResult == ERR_FULL) {
                this.creep.memory.role = "upgrader";
            }
        }
    }
}