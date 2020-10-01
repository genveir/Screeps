import { TaskFactory } from './taskFactory';
import { Task } from './task';

export class TaskList {
    private tasks : Task[]

    private constructor(private roomMem : RoomMemory) {
        var factory = new TaskFactory();

        this.tasks = roomMem.taskList.map(t => factory.CreateTask(t));
    }

    private static _instances : Map<string, TaskList>;
    public static getInstanceByName(roomName : string) : TaskList | null
    {
        var roomMem = Memory.rooms[roomName];
        if (roomMem) return this.getInstance(roomMem);
        else return null;
    }
    public static getInstance(roomMem : RoomMemory) : TaskList {
        if (!this._instances) this._instances = new Map<string, TaskList>();

        if (!TaskList._instances.get(roomMem.name)) {
            TaskList._instances.set(roomMem.name, new TaskList(roomMem));
        }

        return TaskList._instances.get(roomMem.name)!;
    }

    public static saveAll() {
        for (var roomName in Game.rooms)
        {
            var room = Game.rooms[roomName];
            room.memory.taskList = this.getInstance(room.memory).serialize();
        }
    }

    public getAll() : Task[] {
        return this.tasks;
    }

    public getById(id : string) : Task | null {
        var byId = this.tasks.filter(t => t.id === id);
        if (byId.length > 0) return byId[0];
        else return null;
    }

    public addTask(task : Task)
    {
        this.tasks.push(task);
    }

    public removeTask(task : Task)
    {
        var index = this.tasks.indexOf(task);
        this.tasks.splice(index, 1);
    }

    public clear()
    {
        this.tasks = [];
    }

    public serialize() : string[] {
        return this.tasks.filter(t => !t.clearOnNextTick).map(t => t.serialize());
    }

    public static getNewId() : string {
        if (!Memory.taskId) {
            Memory.taskId = 0;
        }

        var currentId = Memory.taskId;
        Memory.taskId = currentId + 1;

        return currentId + "";
    }
}