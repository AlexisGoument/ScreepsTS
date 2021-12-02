import { ticksToLiveThreshold } from "constants/constants";

export default class Factory extends Spawn
{
    public static getFactory(): Factory {
        return new Factory(Game.spawns['Spawn1']);
    }

    constructor(s: StructureSpawn) {
        super(s.id);
    }

    public rechargeNearWorkers() {
        if (this.spawning == null) {
            _.filter(Game.creeps, c => (c.ticksToLive as number) < ticksToLiveThreshold)
            .filter(c => c.pos.isNearTo(this))
            .forEach(c => {
                if (this.renewCreep(c) == OK)
                    console.log(`Worker ${c.name} charged up to ${c.ticksToLive}`);
                    c.say("🔋chargin");
            })
        }
    }
}
