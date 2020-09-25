import { TaskFactory } from './taskFactory';
import { Task } from './task';

export class TaskList {
    tasks : Task[]

    constructor(private room : Room) {
        var factory = new TaskFactory();

        this.tasks = room.memory.taskList.map(t => factory.CreateTask(t));
    }

    public serialize() : string[] {
        return this.tasks.map(t => t.serialize());
    }
}