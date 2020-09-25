import { ErrorTask } from './tasks/error';
import { TaskList } from './tasks/tasklist';
import { TaskFactory } from "./tasks/taskFactory";
import { Task } from "./tasks/task";

export class CreepLogic {
    constructor(private creep : Creep)
    {

    }

    public run()
    {
        var task : Task;
        if (this.creep.memory.savedTask === null)
        {
            task = this.getTask();
            task.claim(this.creep);
        }
        task = new TaskFactory().CreateTask(this.creep.memory.savedTask!); // claim sets the savedTask
        
        task.execute(this.creep);
    }

    private getTask() : Task
    {
        var tasks = new TaskList(this.creep.room).get();

        tasks.sort((a, b) => a.getPriority() - b.getPriority());

        tasks.forEach(task => 
        {
            if(task.canPerform(this.creep)) 
            {
                return task;
            }
        });

        return new ErrorTask("no task available for creep " + this.creep.id);
    }
}