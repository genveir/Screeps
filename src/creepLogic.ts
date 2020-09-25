import { RoomLogic } from './roomLogic';
import { Idle } from './tasks/idle';
import { TaskList } from './tasks/tasklist';
import { TaskFactory } from "./tasks/taskFactory";
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