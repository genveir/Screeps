import { Repair } from './repair';
import { Build } from './build';
import { FillSpawn } from './fillSpawn';
import { Upgrade } from './upgrade';
import { Harvest } from './harvest';
import { Task } from './task';import { ErrorTask } from './error';
import { Idle } from './idle';
import { Fill } from './fill';

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
            case Harvest.type: return new Harvest(deserialized.id, deserialized.claimedBy, deserialized.source, deserialized.pos);
            case Upgrade.type: return new Upgrade(deserialized.id, deserialized.claimedBy, deserialized.controller);
            case FillSpawn.type: return new FillSpawn(deserialized.id, deserialized.claimedBy, deserialized.spawn);
            case Build.type: return new Build(deserialized.id, deserialized.claimedBy, deserialized.constructionSite);
            case Repair.type: return new Repair(deserialized.id, deserialized.claimedBy, deserialized.structure);
            case Fill.type : return new Fill(deserialized.id, deserialized.claimedBy, deserialized.structure);
            case Idle.type: return new Idle(deserialized.id, deserialized.claimedBy);
            default: return new ErrorTask(deserialized.id, deserialized.claimedBy, deserialized);
        }
    }

    private unclaimTaskIfClaimedByDeadCreep(task : Task) : void {
        var claimedBy = task.claimedBy;
        if (claimedBy) {
            if (!Game.getObjectById(claimedBy)) task.unclaim();
        }
    }

    private checkClaimIntegrity(task : Task) : void {
        if (task.claimedBy)
        {
            var matchingCreep = Game.getObjectById(task.claimedBy);
            if (!matchingCreep) {console.log("creep does not exist");}
            else if (!matchingCreep.memory.savedTask)
            {
                console.log("creep matched to task " + task.type + " " + task.id + " did not have a claim");
                console.log("creep: " + JSON.stringify(matchingCreep));
                task.unclaim();
            }   
        }
    }
}