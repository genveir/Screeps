export interface Task {
    id : string;
    type : string;
    claimedBy : Id<Creep> | null;

    getPriority() : number;

    claim(creep : Creep) : void;
    unclaim() : void;

    canPerform(creep : Creep) : boolean;
    execute(creep: Creep) : void;

    serialize() : string;

    // give me debug info
    report() : string;

    isEqualTo(task : Task) : boolean;
}