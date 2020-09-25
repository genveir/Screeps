import { FillSpawn } from './fillSpawn';
import { Upgrade } from './upgrade';
import { Harvest } from './harvest';
import { Task } from './task';import { ErrorTask } from './error';

export class TaskFactory {
    public CreateTask(serialized : string) : Task {
        var task  = this.deserialize(serialized);

        this.unclaimTaskIfClaimedByDeadCreep(task);

        this.checkClaimIntegrity(task);

        return task;
    }

    private deserialize(serialized: string) : Task {
        var deserialized : any = JSON.parse(serialized);

        switch(deserialized.type)
        {
            case Harvest.type: return new Harvest(deserialized.claimedBy, deserialized.source, deserialized.pos);
            case Upgrade.type: return new Upgrade(deserialized.claimedBy);
            case FillSpawn.type: return new FillSpawn(deserialized.claimedBy, deserialized.spawn);
            default: return new ErrorTask(deserialized.claimedBy, deserialized);
        }
    }

    private unclaimTaskIfClaimedByDeadCreep(task : Task) : void {
        var claimedBy = task.claimedBy;
        if (claimedBy) {
            if (!Game.getObjectById(claimedBy)) task.unclaim();
        }
    }

    private checkClaimIntegrity(task : Task) : void {
        var claimedBy = task.claimedBy;

        if (task.claimedBy)
        {
            var matchingCreep = Game.getObjectById(task.claimedBy);
            if (!matchingCreep) console.log("creep matched to task was dead but task was not unclaimed");
            else {
                if (!matchingCreep.memory.savedTask)
                {
                    console.log("creep matched to task did not have a claim");
                    task.unclaim();
                }
                else
                {
                    var savedTask = this.deserialize(matchingCreep.memory.savedTask);
                    if (!task.isEqualTo(savedTask))
                    {
                        console.log("task: " + task.serialize());
                        console.log("claim: " + savedTask.serialize());
                        task.unclaim();
                    }
                }
            }
        }
    }
}