import { ErrorMapper } from "utils/ErrorMapper";
import Harvester from "./roles/harvester"
import Upgrader from "roles/upgrader";
import Factory from "buildings/factory";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);
  // console.log(harvester.getHarvesters()[0].name);
  let harvesters = Harvester.getHarvesters();
  let upgraders = Upgrader.getUpgraders();

  if (upgraders.length == 0 || harvesters.length == 0)
    console.log(`NbUpgraders:${upgraders.length} NbHarvesters:${harvesters.length}`);

  harvesters.forEach(x => x.work());
  upgraders.forEach(x => x.work());

  if (upgraders.length < 12) Upgrader.create(Game.time);
  if (harvesters.length < 2) Harvester.create(Game.time);
  Factory.getFactory().rechargeNearWorkers();

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      console.log(`Worker ${name} died`)
      delete Memory.creeps[name];
    }
  }
});
