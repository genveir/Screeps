import { Upgrade } from './tasks/upgrade';
import { FillSpawn } from './tasks/fillSpawn';
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
        var taskList = TaskList.getInstance(this.room);
        if (taskList.get().length === 0) this.initializeTasks(taskList);

        console.log("running logic for room " + this.room.name + " which has " + this.room.memory.energySlots.length + " energy slots");

        var tasks = taskList.get();
        var totalTasks = tasks.length;
        var claimedTasks = tasks.filter(t => t.claimedBy).length;
        var unclaimedTasks = tasks.filter(t => !t.claimedBy).length;

        console.log("there are " + totalTasks + " tasks in this room, " + claimedTasks + " are claimed, " + unclaimedTasks + " are not");

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

    private initializeTasks(taskList : TaskList) : void {
        console.log("initializing tasks");

        var harvestSlots = this.room.memory.energySlots;

        var harvestTasks = harvestSlots.map(hs => {
            var roomPos = new RoomPosition(hs.pos.x, hs.pos.y, hs.pos.roomName);
            taskList.addTask(new Harvest(TaskList.getNewId(), null, hs.id, roomPos));
        });

        for (var i = 0; i < 10; i++) {
            taskList.addTask(new Upgrade(TaskList.getNewId(), null));
        }

        this.room.find(FIND_MY_SPAWNS).forEach(spawn => 
        {
            for (var i = 0; i < 10; i++) {
                taskList.addTask(new FillSpawn(TaskList.getNewId(), null, spawn.id))
            }
        });
    }
}