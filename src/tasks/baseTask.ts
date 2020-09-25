import { Task } from "./task";

export abstract class BaseTask implements Task {
    constructor(public type : string, public claimedBy : Id<Creep> | null) {

    }

    public abstract getPriority() : number;
    
    public claim(creep : Creep) {
        this.claimedBy = creep.id;

        creep.say(this.type);
        creep.memory.savedTask = this.serialize();
    }

    public unclaim() {        
        if (this.claimedBy)
        {
            var creep = Game.getObjectById(this.claimedBy);

            if (creep) creep.memory.savedTask = null;
            this.claimedBy = null;
        }
    }

    public abstract canPerform(creep: Creep) : boolean;

    public abstract execute(creep: Creep) : void;

    public abstract serialize() : string;

    public abstract report() : string;
}