import { MovementUtil } from './../utils/movementUtil';
export class Harvester {
    
    constructor(private creep : Creep)
    {
        
    }

    public run() {
        if (this.creep.store.getFreeCapacity() != 0) {
            this.runNotFullLogic();
        }
        else
        {
            this.creep.memory.slot = null;

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

    private runNotFullLogic() {
        var slot = this.creep.memory.slot;

            if (!slot) {
                var openSlots : HarvestPosition[] = JSON.parse(JSON.stringify(this.creep.room.memory.energySlots));

                for (var creepName in Memory.creeps) {
                    var c = Memory.creeps[creepName];
                    var usedSlot = c.slot;
                    
                    if (usedSlot)
                    {
                        for (var n = 0; n < openSlots.length; n++) {
                            if (usedSlot.pos.x === openSlots[n].pos.x &&
                                usedSlot.pos.y === openSlots[n].pos.y &&
                                usedSlot.pos.roomName === openSlots[n].pos.roomName) {
                                    openSlots.splice(n, 1);
                                    break;
                                }
                        }
                        
                    }
                }

                if (openSlots.length > 0) {
                    slot = openSlots[0];
                    this.creep.memory.slot = slot;
                }
            }

            if (slot) {
                var source = Game.getObjectById(slot.source);
                if (source) {
                    var result = this.creep.harvest(source);
                    if (result == ERR_NOT_IN_RANGE)
                    {
                        MovementUtil.moveTo(this.creep, slot.pos);
                    }
                } 
                else {
                    console.log("source with Id " + slot.source + " does not exist");
                }
            }
    }
}