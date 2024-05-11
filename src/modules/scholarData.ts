import { getSemanticScholarCount } from "./queryScholarData";
import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { count } from "console";

function scholarPlugin(
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
  @scholarPlugin
  static async registerRightClickMenu() {
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`;
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      id: "query-citation-counts",
      label: "Query citation counts",
      icon: menuIcon,
      commandListener: async (event) => {
        const items = Zotero.getActiveZoteroPane().getSelectedItems();
        const delay = (ms: number | undefined) =>
          new Promise((res) => setTimeout(res, ms));

        for (const item of items) {
          (async () => {
            // Immediately invoked async function
            try {
              const data = await getSemanticScholarCount(item);
              await delay(3000); // Sleep for 1 second

              ztoolkit.ExtraField.setExtraField(
                item,
                "citationCount",
                String(data.citationCount),
              );
              ztoolkit.ExtraField.setExtraField(
                item,
                "publicationVenue",
                String(data.publicationVenue.alternate_names[0]),
              );
            } catch (error) {
              console.error("Error fetching or processing data:", error);
              // Consider adding more robust error handling, e.g., display an error message to the user
            }
          })();
        }
      },
    });
  }

  @scholarPlugin
  static async registerExtraColumn() {
    await ztoolkit.ItemTree.register(
      "citation-counts",
      "@cite",
      (
        field: string,
        unformatted: boolean,
        includeBaseMapped: boolean,
        item: Zotero.Item,
      ) => {
        const counts = ztoolkit.ExtraField.getExtraField(item, "citationCount");
        return counts && counts != "undefined" ? `${counts}` : "";
      },
      {},
    );
    await ztoolkit.ItemTree.register(
      "publication-venue",
      "@publish",
      (
        field: string,
        unformatted: boolean,
        includeBaseMapped: boolean,
        item: Zotero.Item,
      ) => {
        const venue = ztoolkit.ExtraField.getExtraField(
          item,
          "publicationVenue",
        );
        return venue && venue != "undefined" ? `${venue}` : "";
      },
      {},
    );
    await ztoolkit.ItemTree.register(
      "last-author",
      "@last",
      (
        field: string,
        unformatted: boolean,
        includeBaseMapped: boolean,
        item: Zotero.Item,
      ) => {
        // get last author
        let lastAuthorName = "";
        const authors = item.getCreators();
        const lastAuthor = authors[authors.length - 1];
        if (lastAuthor) {
          lastAuthorName = lastAuthor.firstName + " " + lastAuthor.lastName;
        }
        return lastAuthorName;
      },
      {},
    );
    await ztoolkit.ItemTree.register(
      "first-author",
      "@first",
      (
        field: string,
        unformatted: boolean,
        includeBaseMapped: boolean,
        item: Zotero.Item,
      ) => {
        let firstAuthorName = "";
        const authors = item.getCreators();
        const firstAuthor = authors[0];
        if (firstAuthor) {
          firstAuthorName = firstAuthor.firstName + " " + firstAuthor.lastName;
        }
        return firstAuthorName;
      },
      {},
    );
  }
}
