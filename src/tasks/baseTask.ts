import { Task } from "./task";
import { TaskList } from "./tasklist";

export abstract class BaseTask implements Task {
    public clearOnNextTick : boolean;

    constructor(public id: string, public type : string, public claimedBy : Id<Creep> | null) {
        this.clearOnNextTick = false;
    }

    public abstract getPriority(creep : Creep) : number;
    
    public claim(creep : Creep) {
        this.claimedBy = creep.id;

        if (this.type !== "IDLE") creep.say(this.type);
        creep.memory.savedTask = { active: true, roomName: creep.room.name, taskId: this.id };
    }

    public unclaim() {     
        if (this.claimedBy)
        {
            var creep = Game.getObjectById(this.claimedBy);

            if (creep) {
                if (!creep.memory.savedTask) creep.memory.savedTask = {active: false, roomName: "", taskId: ""};
                creep.memory.savedTask.active = false;
            } 
            this.claimedBy = null;
        }
    }

    public abstract canPerform(creep: Creep) : boolean;

    public abstract execute(creep: Creep) : void;

    public abstract serialize() : string;

    public isEqualTo(task : Task) : boolean {
        return this.serialize() === task.serialize();
    }
}