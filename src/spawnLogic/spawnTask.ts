export class SpawnTask implements SavedSpawnTask {
    constructor(public id : string, public priority: number, public type : CreepType ) { }

    public getName() : string {
        switch(this.type)
        {
            case 0: return "Worker";
            case 1: return "Scout";
        }
    }

    public fulfill(spawn : StructureSpawn) : void
    {
        spawn.room.memory.spawnTasks = spawn.room.memory.spawnTasks.filter(st => st.id !== this.id);
    }
}