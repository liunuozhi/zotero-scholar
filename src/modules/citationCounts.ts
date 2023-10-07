import {
  setCitationCount,
  getSemanticScholarCount,
} from "./queryCitationCounts";
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
  static async registerRightClickMenu() {
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      id: "query-citation-counts",
      label: "Query citation counts",
      commandListener: (event) => {
        ztoolkit.log("Query citation counts");
        const items = Zotero.getActiveZoteroPane().getSelectedItems();
        items.map(async (item) => {
          const count = await getSemanticScholarCount(item, "doi");
          setCitationCount(item, count);
          ztoolkit.log(`${count}`);
        });
      },
    });
  }

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
        const counts = ztoolkit.ExtraField.getExtraField(item, "citationCount");
        return counts ? `${counts[1]}` : "";
      },
      {},
    );
  }
}
