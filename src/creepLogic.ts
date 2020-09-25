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

        var task : Task;
        if (!this.creep.memory.savedTask)
        {
            task = this.getTask();
            task.claim(this.creep);
        }
        task = new TaskFactory().CreateTask(this.creep.memory.savedTask!); // claim sets the savedTask
        
        task.execute(this.creep);
    }

    private getTask() : Task
    {
        var tasks = TaskList.getInstance(this.creep.room).get();

        tasks.sort((a, b) => a.getPriority() - b.getPriority());

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