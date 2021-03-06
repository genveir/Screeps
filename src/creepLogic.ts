import { Idle } from './tasks/implementations/idle';
import { TaskList } from './tasks/tasklist';
import { Task } from "./tasks/task";

export class CreepLogic {
    constructor(private creep : Creep)
    {
        
    }

    public runCreepLogic()
    {
        if(this.creep.spawning) return;

        var task = this.resolveTask();
        
        task.execute(this.creep);

        if (Memory.debug || this.creep.memory.debug)
        {
            new RoomVisual(this.creep.room.name).text(task.type + ", ⚡" + this.creep.store.energy + "/" + this.creep.store.getCapacity(), this.creep.pos, {font: 0.3});
        }
    }

    private resolveTask() : Task {
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

        return task;
    }

    private getTask() : Task
    {
        var tasks = TaskList.getInstance(this.creep.room.memory).getAll();

        tasks.sort((a, b) => {
            var aPrio = a.getPriority(this.creep);
            var bPrio = b.getPriority(this.creep);

            var aSuit = a.getSuitability(this.creep);
            var bSuit = b.getSuitability(this.creep);
            
            if (aPrio === bPrio) {
                return bSuit - aSuit;
            }
            else return bPrio - aPrio;
        });
        tasks = tasks.filter(t => t.getPriority(this.creep) > 0 && t.getSuitability(this.creep) > 0);

        if (Memory.debug|| this.creep.memory.debug) console.log("creep " + this.creep.name + " is looking for a task");

        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];

            if (Memory.debug|| this.creep.memory.debug) console.log("considering " + task.type + " prio = " + task.getPriority(this.creep) + " suit = " + task.getSuitability(this.creep) + " claimed = " + task.claimedBy.length + " out of " + task.numAllowed);

            if (task.claimedBy.length < task.numAllowed)
            {
                return task;
            }
            else {
                var otherCreep = Game.getObjectById(task.claimedBy[0]);
                if (!otherCreep || task.getSuitability(this.creep) > task.getSuitability(otherCreep)) {
                    task.unclaim(task.claimedBy[0]);
                    return task;
                }
            }            
        }
        return new Idle(TaskList.getNewId());
    }
}