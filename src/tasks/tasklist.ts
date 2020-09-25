import { TaskFactory } from './taskFactory';
import { Task } from './task';

export class TaskList {
    private tasks : Task[]

    private constructor(private room : Room) {
        var factory = new TaskFactory();

        this.tasks = room.memory.taskList.map(t => factory.CreateTask(t));
    }

    private static _instances : Map<string, TaskList>;
    public static getInstance(room : Room) : TaskList
    {
        if (!this._instances) this._instances = new Map<string, TaskList>();

        if (!TaskList._instances.get(room.name)) {
            TaskList._instances.set(room.name, new TaskList(room));
        }

        return TaskList._instances.get(room.name)!;
    }

    public static saveAll() {
        for (var roomName in Game.rooms)
        {
            var room = Game.rooms[roomName];
            room.memory.taskList = this.getInstance(room).serialize();
        }
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

    public static getNewId() : string {
        if (!Memory.taskId) {
            Memory.taskid = 0;
        }

        var currentId = Memory.taskId;
        Memory.taskId = currentId + 1;

        return currentId;
    }
}