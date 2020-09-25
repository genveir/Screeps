import { TaskFactory } from './taskFactory';
import { Task } from './task';

export class TaskList {
    private tasks : Task[]

    constructor(private room : Room) {
        var factory = new TaskFactory();

        this.tasks = room.memory.taskList.map(t => factory.CreateTask(t));
    }

    public get() : Task[] {
        return this.tasks;
    }

    public addTask(task : Task)
    {
        this.tasks.push(task);
    }

    public clear()
    {
        this.tasks = [];
    }

    public serialize() : string[] {
        return this.tasks.map(t => t.serialize());
    }
}