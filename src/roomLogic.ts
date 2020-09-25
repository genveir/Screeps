import { PositionUtil } from './util/position';
import { TaskList } from './tasks/tasklist';

export class RoomLogic {
    constructor(private room: Room) {
        
    }

    run() {
        if (!this.room.memory.taskList) this.room.memory.taskList = [];
        if (!this.room.memory.energySlots) this.initializeEnergySlots();

        var taskList = new TaskList(this.room);

        console.log("running logic for room " + this.room.name + " which has " + this.room.memory.energySlots.length + " energy slots");

        this.room.memory.taskList = taskList.serialize();
    }

    private initializeEnergySlots() : void {
        console.log("initializing energy slots for room " + this.room.name);
        
        var energySourcePositions = this.room.find(FIND_SOURCES).map(s => s.pos);

        var energySlots : RoomPosition[] = [];
        energySourcePositions.forEach(esp => {
            var emptySurrounding = PositionUtil.getEmptySurrounding(esp);
            emptySurrounding.forEach(es => energySlots.push(es));
        });

        this.room.memory.energySlots = energySlots;
    }
}