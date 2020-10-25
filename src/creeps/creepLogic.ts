import { Harvester } from "./harvester";
import { Upgrader } from "./upgrader";

export class CreepLogic {
    constructor(private creep : Creep)
    {
        
    }

    public run()
    {
        var role : string = (<any>this.creep.memory).role;

        if (role === 'harvester')
        {
            new Harvester(this.creep).run();
        }
        else if (role === 'upgrader')
        {
            new Upgrader(this.creep).run();
        }
    }
}