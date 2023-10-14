import {
  setCitationCount,
  getSemanticScholarCount,
} from "./queryCitationCounts";
import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { count } from "console";

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
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`;
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      id: "query-citation-counts",
      label: "Query citation counts",
      icon: menuIcon,
      commandListener: (event) => {
        const items = Zotero.getActiveZoteroPane().getSelectedItems();
        items.map(async (item) => {
          const data = await getSemanticScholarCount(item);
          setCitationCount(item, data.citationCount);
          // ztoolkit.log(
          //   `${data.citationCount}, ${data.publicationVenue.alternate_names[0]}`,
          // );
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
        ztoolkit.log(typeof counts);
        return counts && counts != "undefined" ? `${counts}` : "";
      },
      {},
    );
  }
}
