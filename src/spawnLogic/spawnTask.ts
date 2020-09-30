export class SpawnTask implements SavedSpawnTask {
    constructor(public id : string, public priority: number, public type : CreepType, public memory : CreepMemory ) { }

    public fulfill(spawn : StructureSpawn) : void
    {
        spawn.room.memory.spawnTasks = spawn.room.memory.spawnTasks.filter(st => st.id !== this.id);
    }
}