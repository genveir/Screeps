import { CreepLogic } from './creepLogic';
import { MovementUtil } from './../utils/movementUtil';
export class Harvester {
    
    constructor(private creep : Creep)
    {
        
    }

    public run() {
        if (this.creep.store.getFreeCapacity() != 0) {
            this.runNotFullLogic();
        }
        else {
            this.creep.memory.slot = null;

            this.updateRole();
            new CreepLogic(this.creep).run();
        }
    }

    private updateRole() {
        var spawn = this.creep.room.find(FIND_MY_SPAWNS)[0];
        if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            this.creep.memory.role = "filler";
        }
        else {
            this.creep.memory.role = "upgrader";
        }
    }

    private runNotFullLogic() {
        var slot = this.creep.memory.slot;

        if (!slot) {
            slot =this.findSlot();
        }   

        if (slot) {
            var source = Game.getObjectById(slot.source);
            if (source) {
                if (this.creep.pos.isEqualTo(slot.pos.x, slot.pos.y)) {
                    this.creep.harvest(source);
                }
                else {
                    MovementUtil.moveTo(this.creep, slot.pos);
                }
            } 
            else {
                console.log("source with Id " + slot.source + " does not exist");
            }
        }
    }

    private findSlot() : HarvestPosition | null {
        var openSlots : HarvestPosition[] = JSON.parse(JSON.stringify(this.creep.room.memory.energySlots));

        for (var creepName in Memory.creeps) {
            var c = Memory.creeps[creepName];
            var usedSlot = c.slot;
            
            if (usedSlot) {
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
            var slot = openSlots[0];
            this.creep.memory.slot = slot;

            return slot;
        }
        else return null;
    }
}