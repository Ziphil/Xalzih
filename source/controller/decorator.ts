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
type Metadata = Array<[name: string | symbol, event: ClientEventKeys]>;
type ControllerDecorator = (clazz: new() => Controller) => void;

export function controller(): ControllerDecorator {
  let decorator = function (clazz: new() => Controller): void {
    let originalSetup = clazz.prototype.setup;
    clazz.prototype.setup = function (this: Controller, client: Client): void {
      let anyThis = this as any;
      let metadata = Reflect.getMetadata(KEY, clazz.prototype) as Metadata;
      for (let [name, event] of metadata) {
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
    let metadata = Reflect.getMetadata(KEY, target);
    if (!metadata) {
      metadata = [];
      Reflect.defineMetadata(KEY, metadata, target);
    }
    metadata.push([name, event]);
  };
  return decorator;
}