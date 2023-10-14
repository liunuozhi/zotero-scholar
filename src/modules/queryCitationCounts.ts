async function getSemanticScholarCount(item: Zotero.Item) {
  let sourceID: string = "";
  let idtype = "arxiv";
  const archiveID = item.getField("archiveID");
  if (archiveID) {
    sourceID = archiveID.toString();
  } else {
    sourceID = item.getField("DOI").toString();
    idtype = "doi";
  }

  const searchAPI = idtype === "arxiv" ? sourceID : `doi:${sourceID}`;
  const url = `https://api.semanticscholar.org/graph/v1/paper/${searchAPI}?fields=citationCount,publicationVenue`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export { getSemanticScholarCount };
