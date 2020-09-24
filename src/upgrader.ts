import { Role } from "./types";

export class Upgrader implements Role {
    constructor(private creep : Creep)
    {

    }

    public run() {
        var controller = this.creep.room.controller;

        var result = this.creep.upgradeController(controller);
        if (result === ERR_NOT_IN_RANGE)
        {
            this.creep.moveTo(controller);
        }
        else if (result === ERR_NOT_ENOUGH_RESOURCES)
        {
            (<any>this.creep.memory).role = 'harvester';
        }
    }
}