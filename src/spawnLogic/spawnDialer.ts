import { TaskList } from "../tasks/tasklist";

export class SpawnDialer {
    constructor(private spawn : StructureSpawn) {

    }

    public run() {
        if (Game.time % 3600 !== 0) return;

        console.log("man imma turn some dials now");
    }

    
}