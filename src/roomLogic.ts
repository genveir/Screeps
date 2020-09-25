import { TaskFactory } from './tasks/taskFactory';
import { Harvest } from './tasks/harvest';
import { PositionUtil } from './util/position';
import { TaskList } from './tasks/tasklist';

export class RoomLogic {
    constructor(private room: Room) {
        if (!this.room.memory.taskList) this.room.memory.taskList = [];
        if (!this.room.memory.energySlots) this.initializeEnergySlots();
    }

    run() {
        // persistent task list
        var taskList = new TaskList(this.room);

        console.log("running logic for room " + this.room.name + " which has " + this.room.memory.energySlots.length + " energy slots");

        this.room.memory.taskList = taskList.serialize();
    }

    private initializeEnergySlots() : void {
        console.log("initializing energy slots for room " + this.room.name);

        var energySources = this.room.find(FIND_SOURCES);

        var energySlots : SavedHarvestPosition[] = [];
        energySources.forEach(es => {
            var id = es.id;
            var pos = es.pos;

            var emptySurrounding = PositionUtil.getEmptySurrounding(pos);
            emptySurrounding.forEach(es => 
            {
                energySlots.push({ id: id, pos: es })
            });
        });

        this.room.memory.energySlots = energySlots;
    }
}