import { Harvester } from "./harvester";
import { Upgrader } from "./upgrader";
import { Role } from "./types";

export class CreepLogic {
    constructor(private creep : Creep)
    {

    }

    public run()
    {
        var role : string = (<any>this.creep.memory).role;

        var roles : Role[] = [];

        switch(role) {
            case 'harvester': 
        }

        if (role === 'harvester')
        {
            roles.push(new Harvester(this.creep));
        }
        else if (role === 'upgrader')
        {
            roles.push(new Upgrader(this.creep));
        }

        for (var r in roles)
        {
            roles[r].run();
        }
    }
}