import { TaskList } from './tasks/tasklist';

export class RoomLogic {
    constructor(private room: Room) {
        
    }

    run() {
        if (!this.room.memory.taskList) this.room.memory.taskList = [];

        var taskList = new TaskList(this.room);

        console.log("running logic for room " + this.room.name);

        this.room.memory.taskList = taskList.serialize();

        console.log("tasks: " + this.room.memory.taskList);
    }
}