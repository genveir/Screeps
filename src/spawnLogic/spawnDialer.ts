import { TaskList } from "../tasks/tasklist";

export class SpawnDialer {
    constructor(private spawn : StructureSpawn) {

    }

    public runSpawnDialer(creepcount : number, idlers: number) {
        if (!this.spawn.memory.decisionDials.data) this.spawn.memory.decisionDials.data = {ticksAtCeiliing: 0, ticksWithHighIdlers: 0, lastFitness: 0};
        
        if (creepcount === this.spawn.memory.decisionDials.creepCeiling) this.spawn.memory.decisionDials.data.ticksAtCeiliing++;
        if (idlers > creepcount * .2) this.spawn.memory.decisionDials.data.ticksWithHighIdlers++;

        if (Game.time % 2 === 1) // twiddle some dials after the end of last 5 minute logging cycle, not just before it ends
        {
            var fitness = this.calculateFitness();
            var lastFitness = this.spawn.memory.decisionDials.data.lastFitness;

            var change = fitness - lastFitness;

            this.spawn.memory.decisionDials.data = {ticksAtCeiliing: 0, ticksWithHighIdlers: 0, lastFitness: fitness};
        };
    }

    private calculateFitness() : number {
        var relevantEnergyLogs = Object.keys(this.spawn.room.memory.logging.sourcesPerCycle)
            .map(key => <number><any>key)
            .filter((key : number) => key > Game.time - 3600)
            .map(key => this.spawn.room.memory.logging.sourcesPerCycle[key]);

        if (Memory.debug || this.spawn.memory.debug) console.log(JSON.stringify(relevantEnergyLogs));
        
        return 1000;
    }
}