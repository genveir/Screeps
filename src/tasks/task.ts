export interface Task {
    id : string;
    type : string;
    claimedBy : Id<Creep> | null;

    clearOnNextTick : boolean;

    getPriority(creep : Creep) : number;
    getSuitability(creep : Creep) : number;

    claim(creep : Creep) : void;
    unclaim() : void;

    execute(creep: Creep) : void;

    serialize() : string;

    isEqualTo(task : Task) : boolean;
}