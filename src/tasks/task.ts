export interface Task {
    id : string;
    type : string;

    numAllowed : number;
    claimedBy : Id<Creep>[];

    clearOnNextTick : boolean;

    getPriority(creep : Creep) : number;
    getSuitability(creep : Creep) : number;

    claim(creep : Creep) : void;
    unclaim(cid : Id<Creep>) : void;
    unclaimAll() : void;

    execute(creep: Creep) : void;

    serialize() : string;

    isEqualTo(task : Task) : boolean;
}