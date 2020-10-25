import { RoomUtil } from '../utils/roomUtil';
export class RoomLogic {
    public constructor(private room : Room) {

    }

    public run() {
        if (this.room.memory.debug) { RoomUtil.drawEnergySlots(this.room) }

        this.initializeEnergySlots();
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