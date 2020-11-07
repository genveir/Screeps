import { CreepLogic } from '../creeps/creepLogic';
import { SpawnLogic } from '../spawns/spawnLogic';
import { RoomUtil } from '../utils/roomUtil';

export class RoomLogic {
    public constructor(private room : Room) {

    }

    public runRoomLogic() {
        if (this.room.memory.debug) { RoomUtil.drawEnergySlots(this.room) }

        this.initializeEnergySlots();

        var spawns = this.room.find(FIND_MY_SPAWNS);
        spawns.forEach(spawn => {
            var spawnLogic = new SpawnLogic(spawn);
            spawnLogic.run();
        });

        var creeps = this.room.find(FIND_MY_CREEPS);
        creeps.forEach(creep => { 
            var creepLogic = new CreepLogic(creep);
            creepLogic.run();
        });
    }

    private initializeEnergySlots() {
        var energySlots = this.room.memory.energySlots;

        if (!energySlots) {
            var sources = this.room.find(FIND_SOURCES);

            var harvestPositions : HarvestPosition[] = [];
            sources.forEach(source => {
                var adjacentPositions = RoomUtil.getAdjacentPositions(source.pos).map(p => new RoomPosition(p.x, p.y, p.roomName));

                adjacentPositions = adjacentPositions.filter(p => p.lookFor(LOOK_TERRAIN)[0] == "plain");

                adjacentPositions.forEach(ap => {
                    harvestPositions.push({pos: ap, source: source.id});
                })
            });

            this.room.memory.energySlots = harvestPositions;
        }
    }
}