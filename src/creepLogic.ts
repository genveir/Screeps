import { Idle } from './tasks/implementations/idle';
import { TaskList } from './tasks/tasklist';
import { Task } from "./tasks/task";
import { BaseTask } from './tasks/baseTask';
import { TaskUtil } from './util/task';

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

        TaskUtil.sort(tasks, this.creep);
        if (Memory.debug) console.log("creep " + this.creep.name + " is looking for a task");

        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];

            if (Memory.debug) console.log("considering " + task.type + " prio = " + task.getPriority(this.creep) + " suit = " + task.getSuitability(this.creep) + " claimed = " + (task.claimedBy !== null));

            if(task.getSuitability(this.creep) > 0) 
            {
                if (!task.claimedBy) 
                {
                    return task;
                }
            }
        }
        return new Idle(TaskList.getNewId(), this.creep.id);
    }
}