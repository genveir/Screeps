import { Filler } from "./filler";
import { Harvester } from "./harvester";
import { Upgrader } from "./upgrader";

export class CreepLogic {
    constructor(private creep : Creep)
    {
        
    }

    public run()
    {
        if (!this.creep.memory.role) this.creep.memory.role = "harvester";

        var role : string = this.creep.memory.role;

        if (role === 'harvester') {
            new Harvester(this.creep).run();
        }
        else if (role === 'upgrader') {
            new Upgrader(this.creep).run();
        }
        else if (role === "filler") {
            new Filler(this.creep).run();
        }
    }
}