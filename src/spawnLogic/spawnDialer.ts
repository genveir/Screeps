const iterationLength : number = 1800;

export class SpawnDialer {
    constructor(private spawn : StructureSpawn) {

    }

    public runSpawnDialer(creepcount : number, idlers: number) {
        if (Game.time % iterationLength === 1) // twiddle some dials after the end of last 5 minute logging cycle, not just before it ends
        {
            if (Memory.debug || this.spawn.memory.debug) console.log("running spawn dialer for spawn " + this.spawn.name);

            var fitness = this.calculateFitness();
            this.spawn.memory.settings.fitness = fitness;
            
            var lastFitness = this.spawn.memory.previousSettings.fitness;

            if (Memory.debug || this.spawn.memory.debug) console.log("fitness is " + fitness);
            if (Memory.debug || this.spawn.memory.debug) console.log("previous fitness is " + lastFitness);

            if (lastFitness && fitness < lastFitness * 0.95)
            {
                if (Memory.debug || this.spawn.memory.debug) console.log("reverting to previous settings");
                this.spawn.memory.settings = this.spawn.memory.previousSettings;
            }
            else {
                if (Memory.debug || this.spawn.memory.debug) console.log("iterating on current settings");
            }
            
            this.spawn.memory.previousSettings = this.spawn.memory.settings;
            this.spawn.memory.settings.fitness = undefined;

            this.tweakDials();

            if (!this.spawn.memory.settingLog) this.spawn.memory.settingLog = [];
            this.spawn.memory.settingLog.push(this.spawn.memory.settings);
        };
    }

    private tweakDials() {
        var changeCeilingChance = 0.3;
        var changeIdlerWait = 0.6;

        if (Memory.debug || this.spawn.memory.debug) console.log("settings before tweaks: " + JSON.stringify(this.spawn.memory.settings));

        if (Math.random() < changeCeilingChance) {
            var difference = Math.ceil(Math.random() * 3);

            if (Math.random() < 0.5) this.spawn.memory.settings.creepCeiling += difference;
            else this.spawn.memory.settings.creepCeiling -= difference;
        }

        if (Math.random() < changeIdlerWait) {
            var difference = Math.ceil(Math.random() * 5);

            if (Math.random() < 0.5) this.spawn.memory.settings.maxIdleTicks += difference;
            else this.spawn.memory.settings.maxIdleTicks -= difference;
        }

        if (Memory.debug || this.spawn.memory.debug) console.log("settings after tweaks: " + JSON.stringify(this.spawn.memory.settings));
    }

    private calculateFitness() : number {
        var relevantEnergyLogs = Object.keys(this.spawn.room.memory.logging.sourcesPerCycle)
            .map(key => <number><any>key)
            .filter((key : number) => key > Game.time - iterationLength)
            .map(key => this.spawn.room.memory.logging.sourcesPerCycle[key]);

        var totalIncome : number = 0;
        relevantEnergyLogs.forEach(rel => {
            rel.forEach(source => {
                totalIncome += source.energyHarvested
            });
        });

        var relevantCreepLogs = Object.keys(this.spawn.room.memory.logging.creepsPerCycle)
            .map(key => <number><any>key)
            .filter((key : number) => key > Game.time - iterationLength)
            .map(key => this.spawn.room.memory.logging.creepsPerCycle[key]);

        var totalCreepCost = relevantCreepLogs.reduce((a, b) => a + b);

        var fitness = totalIncome - totalCreepCost;

        if (Memory.debug || this.spawn.memory.debug) console.log("fitness " + fitness + " = totalIncome: " + totalIncome + " - totalCreepCost " + totalCreepCost);
        
        return fitness;
    }
}