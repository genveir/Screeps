import { TaskList } from './tasks/tasklist';

export class RoomLogic {
    taskList : TaskList;

    constructor(private room: Room) {
        this.taskList = new TaskList(room.memory.taskList);
    }

    run() {
        

        console.log("running logic for room " + this.room.name);

        console.log("tasks: " + this.room.memory.taskList);
    }
}