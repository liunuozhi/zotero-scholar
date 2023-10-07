function setCitationCount(item: Zotero.Item, count: number) {
  item.setField("extra", `Citation count: ${count}`);
  ztoolkit.log(item.getField("extra"));
}

async function getSemanticScholarCount(item: Zotero.Item, idtype: string) {
  const arxiv = item.getField("url"); // check URL for arXiv id
  const pattern = /\d+\.\d+/;
  const arxivId = pattern.exec(arxiv);

  const url = `https://api.semanticscholar.org/graph/v1/paper/arXiv:${arxivId}?fields=citationCount`;
  const response = await fetch(url);
  const data = await response.json();
  return data["citationCount"];
}

export { setCitationCount, getSemanticScholarCount };
