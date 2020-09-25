import { FillSpawn } from './fillSpawn';
import { Upgrade } from './upgrade';
import { Harvest } from './harvest';
import { Task } from './task';import { ErrorTask } from './error';

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
            case Harvest.type: return new Harvest(deserialized.claimedBy, deserialized.source, deserialized.pos);
            case Upgrade.type: return new Upgrade(deserialized.claimedBy);
            case FillSpawn.type: return new FillSpawn(deserialized.claimedBy, deserialized.spawn);
            default: return new ErrorTask(deserialized);
        }
    }

    private unclaimTaskIfClaimedByDeadCreep(task : Task)
    {
        var claimedBy = task.claimedBy;
        if (claimedBy) {
            if (!Game.creeps[claimedBy]) task.unclaim();
        }
    }
}