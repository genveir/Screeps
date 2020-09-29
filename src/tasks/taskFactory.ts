import { Repair } from './implementations/repair';
import { Build } from './implementations/build';
import { Upgrade } from './implementations/upgrade';
import { Harvest } from './implementations/harvest';
import { Task } from './task';
import { ErrorTask } from './implementations/error';
import { Idle } from './implementations/idle';
import { Fill } from './implementations/fill';
import { Grab } from './implementations/grab';

export class TaskFactory {
    public CreateTask(serialized : string) : Task {
        var task  = this.deserialize(serialized);

        this.unclaimTaskIfClaimedByDeadCreep(task);

        return task;
    }

    private deserialize(serialized: string) : Task {
        var deserialized : any = JSON.parse(serialized);

        switch(deserialized.type)
        {
            case Harvest.type: return Harvest.deserialize(deserialized);
            case Upgrade.type: return new Upgrade(deserialized.id, deserialized.claimedBy, deserialized.numAllowed, deserialized.controller);
            case Build.type: return new Build(deserialized.id, deserialized.claimedBy, deserialized.numAllowed, deserialized.constructionSite);
            case Repair.type: return new Repair(deserialized.id, deserialized.claimedBy, deserialized.numAllowed, deserialized.structure);
            case Fill.type : return new Fill(deserialized.id, deserialized.claimedBy, deserialized.numAllowed, deserialized.structure);
            case Idle.type: return new Idle(deserialized.id);
            case Grab.type: return new Grab(deserialized.id, deserialized.claimedBy, deserialized.numAllowed, deserialized.item);
            default: return new ErrorTask(deserialized.id, deserialized);
        }
    }

    private unclaimTaskIfClaimedByDeadCreep(task : Task) : void {
        var claimedBy = task.claimedBy;
        for (var i = 0; i < task.claimedBy.length; i++)
        {
            if (!Game.getObjectById(claimedBy[i])) task.unclaim(claimedBy[i]);
        }
    }
}