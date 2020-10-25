import { RoomUtil } from './../utils/RoomUtil';
export class RoomLogic {
    public constructor(private room : Room) {

    }

    public run() {
        var energySlots = this.room.memory.energySlots;

        if (!energySlots) {
            var sourcePositions = this.room.find(FIND_SOURCES).map(r => r.pos);

            var adjacentPositions : RoomPosition[] = [];

            sourcePositions
                .map(p => RoomUtil.getAdjacentPositions(p))
                .forEach(pArray => pArray.forEach(p => adjacentPositions.push(new RoomPosition(p.x, p.y, p.roomName))));

            var harvestPositions = adjacentPositions
                .filter(p => p.lookFor(LOOK_TERRAIN).some(t => t == "plain"));

            this.room.memory.energySlots = harvestPositions;
        }
    }
}