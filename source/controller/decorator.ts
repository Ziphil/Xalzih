//

import {
  Client,
  ClientEvents
} from "discord.js";
import "reflect-metadata";
import {
  Controller
} from "./controller";


const KEY = Symbol("key");

type ClientEventKeys = keyof ClientEvents;
type Metadata = {[name: string]: ClientEventKeys};
type ControllerDecorator = (clazz: new() => Controller) => void;

export function controller(): ControllerDecorator {
  let decorator = function (clazz: new() => Controller): void {
    let originalSetup = clazz.prototype.setup;
    clazz.prototype.setup = function (this: Controller, client: Client): void {
      let anyThis = this as any;
      let object = Reflect.getMetadata(KEY, clazz.prototype) as Metadata;
      for (let [name, event] of Object.entries(object)) {
        client.on(event, (...args) => {
          Promise.resolve(anyThis[name](client, ...args)).catch((error) => console.error(error));
        });
      }
      originalSetup(client);
    };
  };
  return decorator;
}

export function listener(event: ClientEventKeys): MethodDecorator {
  let decorator = function (target: object, name: string | symbol, descriptor: PropertyDescriptor): void {
    let object = Reflect.getMetadata(KEY, target);
    if (!object) {
      object = {};
      Reflect.defineMetadata(KEY, object, target);
    }
    object[name] = event;
  };
  return decorator;
}