import { CreepLogic } from './creepLogic';
export class Upgrader {
    constructor(private creep : Creep)
    {

    }

    public run() {
        var controller = this.creep.room.controller;

        if (!controller) {
            console.log("somehow there is no controller for the room of creep " + this.creep.name);
        }
        else {
            var result = this.creep.upgradeController(controller);
            if (result === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(controller);
            }
            else if (result === ERR_NOT_ENOUGH_RESOURCES) {
                this.creep.memory.role = 'harvester';
                new CreepLogic(this.creep).run();
            }
        }
    }
}