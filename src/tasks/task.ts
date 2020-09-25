export interface Task {
    type : string;

    serialize() : string;

    canPerform(creep : Creep) : boolean;
    claim(creep : Creep) : void;
    unclaim() : void;

    claimedBy : Id<Creep> | null;

    // give me debug info
    report() : string;
}