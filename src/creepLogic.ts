import { Idle } from './tasks/implementations/idle';
import { TaskList } from './tasks/tasklist';
import { Task } from "./tasks/task";

export class CreepLogic {
    constructor(private creep : Creep)
    {

    }

    public run()
    {
        if(this.creep.spawning) return;

        if (!this.creep.memory.savedTask) {this.creep.memory.savedTask = {active: false, roomName: "", taskId: ""}};

        var task : Task;
        
        var savedTask : Task | null;
        if (this.creep.memory.savedTask.active)
        {
            savedTask = TaskList
                .getInstanceByName(this.creep.memory.savedTask.roomName)!
                .getById(this.creep.memory.savedTask.taskId);
        }
        else { savedTask = null; }

        if (!savedTask)
        {
            task = this.getTask();
            task.claim(this.creep);
        }
        else task = savedTask;
        
        task.execute(this.creep);

        if (Memory.debug)
        {
            new RoomVisual(this.creep.room.name).text(task.type + ", ⚡" + this.creep.store.energy + "/" + this.creep.store.getCapacity(), this.creep.pos, {font: 0.3});
        }
    }

    private getTask() : Task
    {
        var tasks = TaskList.getInstance(this.creep.room).getAll();

        tasks.sort((a, b) => a.getPriority(this.creep) - b.getPriority(this.creep));

        var toReturn : Task;
        toReturn = new Idle(TaskList.getNewId(), this.creep.id);

        tasks.forEach(task => 
        {
            if(task.canPerform(this.creep)) 
            {
                if (!task.claimedBy) 
                {
                    toReturn = task;
                    return;
                }
            }
        });

        return toReturn;
    }
}