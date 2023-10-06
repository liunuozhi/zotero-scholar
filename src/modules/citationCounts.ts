import { config } from "../../package.json";
import { getString } from "../utils/locale";

function citationCountsPlugin(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any) {
    try {
      ztoolkit.log(
        `Calling citation counts ${target.name}.${String(propertyKey)}`,
      );
      return original.apply(this, args);
    } catch (e) {
      ztoolkit.log(
        `Error in citation counts ${target.name}.${String(propertyKey)}`,
        e,
      );
      throw e;
    }
  };
  return descriptor;
}

export class UICitationCountsFactory {
  @citationCountsPlugin
  static async registerExtraColumn() {
    await ztoolkit.ItemTree.register(
      "citation-counts",
      "#cite",
      (
        field: string,
        unformatted: boolean,
        includeBaseMapped: boolean,
        item: Zotero.Item,
      ) => {
        return `${item.id}`;
      },
      {},
    );
  }
}
