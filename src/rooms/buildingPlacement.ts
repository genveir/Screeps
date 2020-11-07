import { RoomUtil } from "../utils/roomUtil";

export class BuildingPlacement {
    constructor(private room : Room) {}

    public runBuildingPlacement() {
        var controller = this.room.controller;

        if (controller) {
            this.placeExtensions();
        }
    }

    private placeExtensions() {
        var spawns = this.room.find(FIND_MY_SPAWNS);

        var cSiteCount = this.room.find(FIND_CONSTRUCTION_SITES).length;

        if (!spawns || spawns.length === 0) return;
        else {
            var extensionPositions = RoomUtil.getStarPositions(spawns[0].pos, 2, true, false);

            var allBuilt = false;
            var index = 0;

            while (index < extensionPositions.length && !allBuilt && cSiteCount < 2) {
                var rpos = new RoomPosition(extensionPositions[index].x, extensionPositions[index].y, this.room.name);
            
                var closestSpawn = rpos.findClosestByRange(FIND_MY_SPAWNS);
                var closestSource = rpos.findClosestByRange(FIND_SOURCES);
                
                if (!closestSpawn || rpos.getRangeTo(closestSpawn.pos) > 1) {
                    if (!closestSource || rpos.getRangeTo(closestSource.pos) > 3) {
                        var result = rpos.createConstructionSite(STRUCTURE_EXTENSION);

                        if (result === 0) {
                            cSiteCount++;

                            this.expandPositions(extensionPositions, rpos);
                        }
                        else if (result === ERR_INVALID_TARGET) {
                            var hasCsite = rpos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0;
                            var hasBuilding = rpos.lookFor(LOOK_STRUCTURES).length > 0;

                            if (hasCsite || hasBuilding) {
                                this.expandPositions(extensionPositions, rpos);
                            }
                        }
                        else allBuilt = true;
                    }
                }

                index++;
            }
        }
    }

    private expandPositions(extensionPositions : SavedPosition[], rpos : RoomPosition) {
        var newPositions = RoomUtil.getStarPositions(rpos, 1, true, true);

        newPositions.forEach(np => extensionPositions.push(np));
    }
}
    
