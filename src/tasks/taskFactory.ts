import { Upgrade } from './upgrade';
import { Harvest } from './harvest';
import { Task } from './task';import { ErrorTask } from './error';

export class TaskFactory {
    public CreateTask(serialized : string) : Task {
        switch(serialized)
        {
            case Harvest.SERIALIZED: return new Harvest();
            case Upgrade.SERIALIZED: return new Upgrade();
            default: return new ErrorTask();
        }
    }
}