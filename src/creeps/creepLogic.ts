import { Builder } from "./builder";
import { Filler } from "./filler";
import { Harvester } from "./harvester";
import { Upgrader } from "./upgrader";

export class CreepLogic {
    constructor(private creep : Creep) {
        
    }

    public runCreepLogic() {
        if (!this.creep.memory.role) this.creep.memory.role = "harvester";

        var role : string = this.creep.memory.role;

        if (role === 'harvester') {
            new Harvester(this.creep).runHarvester();
        }
        else if (role === 'upgrader') {
            new Upgrader(this.creep).runUpgrader();
        }
        else if (role === "filler") {
            new Filler(this.creep).runFiller();
        }
        else if (role === "builder") {
            new Builder(this.creep).runBuilder();
        }
    }

    public retask() {
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            var spawn = this.creep.room.find(FIND_MY_SPAWNS)[0];
            if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                this.creep.memory.role = "filler";
            }
            else if (this.creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
                this.creep.memory.role = "builder";
            }
            else {
                this.creep.memory.role = "upgrader";
            }
        }
        else {
            this.creep.memory.role = "harvester";
        }

        this.runCreepLogic();
    }
}